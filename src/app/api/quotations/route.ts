import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createLexofficeClient,
  mapToLexofficeQuotation,
  LexofficeApiError,
  calculateTotalsFromLineItems,
} from '@/lib/lexoffice';
import type { InvoiceLineItem } from '@/types/dashboard';

/**
 * GET /api/quotations
 * Ruft alle Angebote ab (gefiltert nach Berechtigung)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID nicht gefunden' }, { status: 401 });
    }

    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    // Normale User sehen nur Angebote ihrer Projekte
    let projectIds: string[] | undefined;
    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      const memberProjects = await prisma.project_members.findMany({
        where: { user_id: userId },
        select: { project_id: true },
      });
      projectIds = memberProjects.map(p => p.project_id);

      if (projectIds.length === 0) {
        return NextResponse.json({ quotations: [] });
      }
    }

    const quotations = await prisma.quotations.findMany({
      where: {
        ...(projectId ? { project_id: projectId } : {}),
        ...(projectIds ? { project_id: { in: projectIds } } : {}),
      },
      include: {
        pm_projects: {
          select: { id: true, name: true, client_id: true },
        },
        profiles: {
          select: { id: true, full_name: true, email: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Transform to match expected format
    const transformedQuotations = quotations.map(q => ({
      ...q,
      project: q.pm_projects,
      creator: q.profiles,
      pm_projects: undefined,
      profiles: undefined,
    }));

    return NextResponse.json({ quotations: transformedQuotations });
  } catch (error) {
    console.error('[Quotations] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/quotations
 * Erstellt ein neues Angebot (lokal + optional Lexoffice)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID nicht gefunden' }, { status: 401 });
    }

    // Rolle pruefen
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    const body = await request.json();
    const {
      project_id,
      title,
      description,
      line_items,
      valid_until,
      sync_to_lexoffice = true,
    } = body;

    // Validierung
    if (!project_id || !title || !line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return NextResponse.json(
        { error: 'project_id, title und line_items sind erforderlich' },
        { status: 400 }
      );
    }

    // Projekt pruefen
    const project = await prisma.pm_projects.findUnique({
      where: { id: project_id },
      select: { id: true, name: true, client_id: true, organization_id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 });
    }

    // Totals berechnen
    const typedLineItems = line_items as InvoiceLineItem[];
    const totals = calculateTotalsFromLineItems(typedLineItems);

    // Angebotsnummer generieren
    const year = new Date().getFullYear();
    const count = await prisma.quotations.count({
      where: {
        created_at: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });

    const quotationNumber = `ANG-${year}-${String(count + 1).padStart(4, '0')}`;

    // Angebot lokal erstellen
    const quotation = await prisma.quotations.create({
      data: {
        project_id,
        quotation_number: quotationNumber,
        title,
        description,
        line_items: typedLineItems as unknown as object,
        net_amount: totals.net_amount,
        tax_amount: totals.tax_amount,
        total_amount: totals.total_amount,
        currency: 'EUR',
        status: 'draft',
        valid_until: valid_until ? new Date(valid_until) : null,
        created_by: userId,
      },
    });

    // Lexoffice Sync wenn aktiviert
    let lexofficeId: string | null = null;
    let lexofficeError: string | null = null;

    if (sync_to_lexoffice) {
      // Lexoffice Settings pruefen
      const settings = await prisma.system_settings.findUnique({
        where: { key: 'lexoffice' },
        select: { value: true },
      });

      const lexofficeSettings = settings?.value as {
        is_enabled: boolean;
        api_key: string | null;
      } | null;

      if (lexofficeSettings?.is_enabled && lexofficeSettings?.api_key) {
        try {
          // Kontakt-Mapping finden
          let contactId: string | null = null;

          if (project.client_id) {
            const contactMapping = await prisma.lexoffice_contacts.findFirst({
              where: { profile_id: project.client_id },
              select: { lexoffice_contact_id: true },
            });
            contactId = contactMapping?.lexoffice_contact_id || null;
          } else if (project.organization_id) {
            const contactMapping = await prisma.lexoffice_contacts.findFirst({
              where: { organization_id: project.organization_id },
              select: { lexoffice_contact_id: true },
            });
            contactId = contactMapping?.lexoffice_contact_id || null;
          }

          if (contactId) {
            const lexoffice = createLexofficeClient(lexofficeSettings.api_key);
            const lexofficeData = mapToLexofficeQuotation({
              quotation: { title, description, valid_until },
              lexofficeContactId: contactId,
              lineItems: typedLineItems,
            });

            const response = await lexoffice.createQuotation(lexofficeData);
            lexofficeId = response.id;

            // Quotation mit Lexoffice ID updaten
            await prisma.quotations.update({
              where: { id: quotation.id },
              data: {
                lexoffice_id: lexofficeId,
                synced_at: new Date(),
              },
            });

            // Sync Log
            await prisma.lexoffice_sync_log.create({
              data: {
                entity_type: 'quotation',
                entity_id: quotation.id,
                lexoffice_id: lexofficeId,
                action: 'create',
                status: 'success',
                request_data: lexofficeData as object,
                response_data: response as object,
              },
            });
          } else {
            lexofficeError = 'Kein Lexoffice-Kontakt fuer dieses Projekt gefunden';
          }
        } catch (error) {
          if (error instanceof LexofficeApiError) {
            lexofficeError = error.message;
            await prisma.lexoffice_sync_log.create({
              data: {
                entity_type: 'quotation',
                entity_id: quotation.id,
                action: 'create',
                status: 'failed',
                error_message: error.message,
              },
            });
          } else {
            lexofficeError = 'Unbekannter Lexoffice-Fehler';
          }
        }
      }
    }

    return NextResponse.json(
      {
        quotation: {
          ...quotation,
          lexoffice_id: lexofficeId,
        },
        lexoffice_synced: !!lexofficeId,
        lexoffice_error: lexofficeError,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Quotations] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
