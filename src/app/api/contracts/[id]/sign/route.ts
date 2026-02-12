import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// import { PDFDocument, rgb } from 'pdf-lib';  // TODO: Phase 6 Storage Migration

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/contracts/[id]/sign
 * Signiert einen Vertrag mit der bereitgestellten Unterschrift
 *
 * NOTE: PDF signing deaktiviert bis Phase 6 Storage Migration
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { signature } = await request.json();

    // Validierung
    if (!signature || !signature.startsWith('data:image/png;base64,')) {
      return NextResponse.json(
        { error: 'Ungueltige Unterschrift - PNG Base64 erwartet' },
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
    const userEmail = (session.user as { email?: string }).email;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID nicht gefunden' },
        { status: 401 }
      );
    }

    // Vertrag laden mit Projekt-Info
    const contract = await prisma.contracts.findUnique({
      where: { id },
      include: {
        pm_projects: {
          select: { client_id: true },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Vertrag nicht gefunden' },
        { status: 404 }
      );
    }

    // Pruefen ob User berechtigt ist (Client des Projekts)
    const isClient = contract.pm_projects?.client_id === userId;

    // User-Profil laden fuer Rolle
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isManagerOrAdmin = profile?.role === 'manager' || profile?.role === 'admin';

    if (!isClient && !isManagerOrAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung - nur der Projektkunde kann unterschreiben' },
        { status: 403 }
      );
    }

    // Pruefen ob Vertrag noch pending ist
    if (contract.status !== 'pending_signature') {
      return NextResponse.json(
        { error: 'Vertrag wurde bereits signiert oder ist abgelaufen' },
        { status: 400 }
      );
    }

    // TODO: Phase 6 Storage Migration - PDF mit Unterschrift versehen
    // Aktuell nur Metadaten speichern, kein PDF-Processing
    console.log('[Contracts API] PDF signing deaktiviert - Storage Migration pending');

    // IP und User-Agent erfassen
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Contract aktualisieren (ohne PDF-Verarbeitung)
    const updatedContract = await prisma.contracts.update({
      where: { id },
      data: {
        status: 'signed',
        // signed_pdf_path: signedPath,  // TODO: Phase 6
        // signed_pdf_url: signedUrl,    // TODO: Phase 6
        signature_data: signature,
        signed_at: new Date(),
        signed_by: userId,
        signer_ip: ip.split(',')[0].trim(),
        signer_user_agent: userAgent.substring(0, 500),
      },
    });

    // Activity Log
    if (contract.project_id) {
      await prisma.activity_log.create({
        data: {
          project_id: contract.project_id,
          user_id: userId,
          action: 'contract_signed',
          entity_type: 'contract',
          entity_id: id,
          details: {
            contract_title: contract.title,
            signed_at: new Date().toISOString(),
          } as object,
          ip_address: ip.split(',')[0].trim(),
          user_agent: userAgent.substring(0, 500),
        },
      });
    }

    return NextResponse.json({
      contract: updatedContract,
      message: 'Vertrag erfolgreich signiert (PDF-Generierung pending)',
    });
  } catch (error) {
    console.error('[Contracts API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
