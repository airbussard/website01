import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quotations/[id]/convert
 * Konvertiert ein Angebot in eine Rechnung
 *
 * Body (optional):
 * - set_accepted: boolean - Angebot-Status auf "accepted" setzen (default: true)
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

    // Rolle pruefen - nur Manager/Admin
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    // Angebot laden
    const quotation = await prisma.quotations.findUnique({
      where: { id },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 });
    }

    // Nur sent oder accepted Angebote konvertieren
    if (!['sent', 'accepted'].includes(quotation.status || '')) {
      return NextResponse.json(
        { error: 'Nur gesendete oder akzeptierte Angebote koennen konvertiert werden' },
        { status: 400 }
      );
    }

    // project_id ist erforderlich fuer Rechnungen
    if (!quotation.project_id) {
      return NextResponse.json(
        { error: 'Angebot hat kein Projekt - kann nicht konvertiert werden' },
        { status: 400 }
      );
    }

    // Body parsen
    let setAccepted = true;
    try {
      const body = await request.json();
      if (body.set_accepted !== undefined) {
        setAccepted = body.set_accepted;
      }
    } catch {
      // Kein Body, defaults verwenden
    }

    // Rechnungsnummer generieren
    const year = new Date().getFullYear();
    const count = await prisma.invoices.count({
      where: {
        created_at: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });

    const invoiceNumber = `RE-${year}-${String(count + 1).padStart(4, '0')}`;

    // Faelligkeitsdatum (14 Tage ab heute)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Rechnung erstellen (project_id ist durch Guard oben garantiert nicht null)
    const invoice = await prisma.invoices.create({
      data: {
        invoice_number: invoiceNumber,
        title: quotation.title,
        description: quotation.description,
        project_id: quotation.project_id,
        line_items: quotation.line_items ?? undefined,
        amount: quotation.net_amount,
        tax_amount: quotation.tax_amount,
        total_amount: quotation.total_amount,
        currency: quotation.currency || 'EUR',
        status: 'draft',
        issue_date: new Date(),
        due_date: dueDate,
        created_by: userId,
      },
    });

    // Optional: Angebot-Status auf "accepted" setzen
    let updatedQuotation = quotation;
    if (setAccepted && quotation.status !== 'accepted') {
      updatedQuotation = await prisma.quotations.update({
        where: { id },
        data: {
          status: 'accepted',
          accepted_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    // Activity Log
    if (quotation.project_id) {
      await prisma.activity_log.create({
        data: {
          project_id: quotation.project_id,
          user_id: userId,
          action: 'quotation_converted',
          entity_type: 'quotation',
          entity_id: quotation.id,
          details: {
            quotation_number: quotation.quotation_number,
            invoice_id: invoice.id,
            invoice_number: invoiceNumber,
          } as object,
        },
      });
    }

    return NextResponse.json({
      success: true,
      invoice,
      quotation: updatedQuotation,
      message: `Angebot wurde in Rechnung ${invoiceNumber} konvertiert`,
    });
  } catch (error) {
    console.error('[Quotation Convert] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
