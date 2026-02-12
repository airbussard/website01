import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/services/email/EmailService';
import { getProjectRecipients } from '@/lib/services/notifications/getProjectRecipients';
import {
  contractReadyTemplate,
  contractReadyTextTemplate,
} from '@/lib/email/templates/project-notifications';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://oscarknabe.de';

/**
 * GET /api/contracts
 * Liste aller Vertraege (gefiltert nach Berechtigung)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // URL Parameter
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');

    const contracts = await prisma.contracts.findMany({
      where: {
        ...(projectId ? { project_id: projectId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        pm_projects: {
          select: { id: true, name: true, client_id: true },
        },
        profiles_contracts_signed_byToprofiles: {
          select: { id: true, email: true, first_name: true, last_name: true },
        },
        profiles_contracts_created_byToprofiles: {
          select: { id: true, email: true, first_name: true, last_name: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Transform to match expected format
    const transformedContracts = contracts.map(c => ({
      ...c,
      project: c.pm_projects,
      signer: c.profiles_contracts_signed_byToprofiles,
      creator: c.profiles_contracts_created_byToprofiles,
      pm_projects: undefined,
      profiles_contracts_signed_byToprofiles: undefined,
      profiles_contracts_created_byToprofiles: undefined,
    }));

    return NextResponse.json({ contracts: transformedContracts });
  } catch (error) {
    console.error('[Contracts API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contracts
 * Erstellt einen neuen Vertrag (nur Manager/Admin)
 *
 * NOTE: Storage Migration Phase 6 pending - PDF upload deaktiviert
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const projectId = formData.get('project_id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const validUntil = formData.get('valid_until') as string | null;
    const pdfFile = formData.get('pdf') as File;

    // Validierung
    if (!projectId || !title || !pdfFile) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder (project_id, title, pdf)' },
        { status: 400 }
      );
    }

    if (pdfFile.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Nur PDF-Dateien erlaubt' },
        { status: 400 }
      );
    }

    // User verifizieren
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID nicht gefunden' },
        { status: 401 }
      );
    }

    // Rolle pruefen
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      return NextResponse.json(
        { error: 'Keine Berechtigung - nur Manager/Admin' },
        { status: 403 }
      );
    }

    // TODO: Phase 6 Storage Migration - PDF Upload zu lokalem Storage
    // Aktuell: Placeholder fuer Storage-Path
    const fileName = `${Date.now()}_${pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `${projectId}/contracts/${fileName}`;
    console.log('[Contracts API] PDF Upload deaktiviert - Storage Migration pending');

    // Contract in DB erstellen
    const contract = await prisma.contracts.create({
      data: {
        project_id: projectId,
        title,
        description: description || null,
        original_pdf_path: storagePath,
        original_pdf_url: null, // TODO: Storage Migration
        valid_until: validUntil ? new Date(validUntil) : null,
        created_by: userId,
      },
    });

    // Activity Log
    await prisma.activity_log.create({
      data: {
        project_id: projectId,
        user_id: userId,
        action: 'contract_uploaded',
        entity_type: 'contract',
        entity_id: contract.id,
        details: { contract_title: title } as object,
      },
    });

    // Email-Benachrichtigungen senden
    try {
      // Projekt laden fuer Projektname
      const project = await prisma.pm_projects.findUnique({
        where: { id: projectId },
        select: { name: true },
      });

      const projectName = project?.name || 'Projekt';
      const recipients = await getProjectRecipients(projectId);
      const dashboardUrl = `${BASE_URL}/dashboard/contracts/${contract.id}`;

      // Formatierung des Gueltigkeitsdatums
      const formattedValidUntil = validUntil
        ? new Date(validUntil).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : undefined;

      for (const recipient of recipients) {
        await EmailService.queueEmail({
          recipient_email: recipient.email,
          recipient_name: recipient.name,
          subject: `Vertrag zur Unterschrift: ${title}`,
          content_html: contractReadyTemplate({
            recipientName: recipient.name,
            projectName,
            contractTitle: title,
            contractDescription: description || undefined,
            validUntil: formattedValidUntil,
            dashboardUrl,
          }),
          content_text: contractReadyTextTemplate({
            recipientName: recipient.name,
            projectName,
            contractTitle: title,
            contractDescription: description || undefined,
            validUntil: formattedValidUntil,
            dashboardUrl,
          }),
          type: 'contract',
          metadata: {
            project_id: projectId,
            contract_id: contract.id,
          },
        });
      }

      console.log(`[Contracts API] ${recipients.length} Email(s) gequeued`);
    } catch (emailError) {
      // Email-Fehler loggen aber nicht die Response blockieren
      console.error('[Contracts API] Email error:', emailError);
    }

    return NextResponse.json({ contract }, { status: 201 });
  } catch (error) {
    console.error('[Contracts API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
