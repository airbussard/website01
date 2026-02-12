import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createLexofficeClient,
  mapToLexofficeQuotation,
  LexofficeApiError,
} from '@/lib/lexoffice';
import type { InvoiceLineItem } from '@/types/dashboard';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quotations/[id]/send
 * Finalisiert und sendet ein Angebot zu Lexoffice
 *
 * Body:
 * - finalize: boolean (optional) - Angebot in Lexoffice finalisieren
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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

    // Angebot mit Projekt laden
    const quotation = await prisma.quotations.findUnique({
      where: { id },
      include: {
        pm_projects: {
          select: { id: true, name: true, client_id: true, organization_id: true },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 });
    }

    // Nur Drafts koennen gesendet werden
    if (quotation.status !== 'draft') {
      return NextResponse.json(
        { error: 'Nur Entwuerfe koennen gesendet werden' },
        { status: 400 }
      );
    }

    // Lexoffice Settings pruefen
    const settings = await prisma.system_settings.findUnique({
      where: { key: 'lexoffice' },
      select: { value: true },
    });

    const lexofficeSettings = settings?.value as {
      is_enabled: boolean;
      api_key: string | null;
    } | null;

    if (!lexofficeSettings?.is_enabled || !lexofficeSettings?.api_key) {
      return NextResponse.json(
        { error: 'Lexoffice ist nicht aktiviert' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const finalize = body.finalize ?? true;

    // Kontakt-Mapping finden
    let contactId: string | null = null;
    const project = quotation.pm_projects;

    if (project?.client_id) {
      const contactMapping = await prisma.lexoffice_contacts.findFirst({
        where: { profile_id: project.client_id },
        select: { lexoffice_contact_id: true },
      });
      contactId = contactMapping?.lexoffice_contact_id || null;
    } else if (project?.organization_id) {
      const contactMapping = await prisma.lexoffice_contacts.findFirst({
        where: { organization_id: project.organization_id },
        select: { lexoffice_contact_id: true },
      });
      contactId = contactMapping?.lexoffice_contact_id || null;
    }

    if (!contactId) {
      return NextResponse.json(
        { error: 'Kein Lexoffice-Kontakt fuer dieses Projekt gefunden. Bitte erst Kontakt synchronisieren.' },
        { status: 400 }
      );
    }

    const lexoffice = createLexofficeClient(lexofficeSettings.api_key);

    let lexofficeId = quotation.lexoffice_id;
    let pdfUrl: string | null = null;

    try {
      // Wenn noch nicht zu Lexoffice synchronisiert, erstellen
      if (!lexofficeId) {
        const lexofficeData = mapToLexofficeQuotation({
          quotation: {
            title: quotation.title,
            description: quotation.description ?? undefined,
            valid_until: quotation.valid_until?.toISOString().split('T')[0],
          },
          lexofficeContactId: contactId,
          lineItems: quotation.line_items as unknown as InvoiceLineItem[],
        });

        const response = await lexoffice.createQuotation(lexofficeData, finalize);
        lexofficeId = response.id;

        // Sync Log
        await prisma.lexoffice_sync_log.create({
          data: {
            entity_type: 'quotation',
            entity_id: quotation.id,
            lexoffice_id: lexofficeId,
            action: finalize ? 'finalize' : 'create',
            status: 'success',
            request_data: lexofficeData as object,
            response_data: response as object,
          },
        });
      }

      // PDF abrufen wenn finalisiert - Phase 6 Storage Migration
      // TODO: PDF Upload zu lokalem Storage statt Supabase Storage
      if (finalize && lexofficeId) {
        try {
          // PDF fetch deaktiviert bis Storage Migration abgeschlossen
          // const pdfBuffer = await lexoffice.getQuotationPdf(lexofficeId);
          // PDF zu lokalem Storage hochladen
          console.log('[Quotation] PDF fetch deaktiviert - Storage Migration pending');
        } catch (pdfError) {
          console.error('[Quotation] PDF fetch error:', pdfError);
          // Nicht kritisch, fortfahren
        }
      }

      // Lokales Angebot aktualisieren
      const updatedQuotation = await prisma.quotations.update({
        where: { id },
        data: {
          status: 'sent',
          sent_at: new Date(),
          lexoffice_id: lexofficeId,
          lexoffice_status: finalize ? 'open' : 'draft',
          pdf_url: pdfUrl,
          synced_at: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        quotation: updatedQuotation,
        lexoffice_id: lexofficeId,
        pdf_url: pdfUrl,
      });
    } catch (error) {
      if (error instanceof LexofficeApiError) {
        // Sync Log
        await prisma.lexoffice_sync_log.create({
          data: {
            entity_type: 'quotation',
            entity_id: quotation.id,
            action: 'send',
            status: 'failed',
            error_message: error.message,
          },
        });

        return NextResponse.json(
          {
            error: `Lexoffice Fehler: ${error.message}`,
            details: error.details,
          },
          { status: error.status }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('[Quotation Send] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
