import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { PDFDocument, rgb } from 'pdf-lib';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/contracts/[id]/sign
 * Signiert einen Vertrag mit der bereitgestellten Unterschrift
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
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();

    // Vertrag laden mit Projekt-Info
    const { data: contract, error: contractError } = await adminSupabase
      .from('contracts')
      .select('*, project:pm_projects(client_id)')
      .eq('id', id)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Vertrag nicht gefunden' },
        { status: 404 }
      );
    }

    // Pruefen ob User berechtigt ist (Client des Projekts)
    const isClient = contract.project?.client_id === user.id;

    // User-Profil laden fuer Rolle
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

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

    // Original PDF laden
    const { data: pdfData, error: downloadError } = await adminSupabase
      .storage
      .from('project_files')
      .download(contract.original_pdf_path);

    if (downloadError || !pdfData) {
      console.error('[Contracts API] PDF Download Error:', downloadError);
      return NextResponse.json(
        { error: 'Vertragsdokument nicht gefunden' },
        { status: 500 }
      );
    }

    // PDF mit Unterschrift versehen
    const pdfBytes = await pdfData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Unterschrift als PNG decodieren
    const signatureBase64 = signature.replace('data:image/png;base64,', '');
    const signatureBytes = Buffer.from(signatureBase64, 'base64');
    const signatureImage = await pdfDoc.embedPng(signatureBytes);

    // Auf letzte Seite einfuegen
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const { width } = lastPage.getSize();

    // Unterschrift unten rechts platzieren
    const sigWidth = 200;
    const sigHeight = (signatureImage.height / signatureImage.width) * sigWidth;

    lastPage.drawImage(signatureImage, {
      x: width - sigWidth - 50,
      y: 80,
      width: sigWidth,
      height: sigHeight,
    });

    // Signatur-Timestamp hinzufuegen
    const signDate = new Date().toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    lastPage.drawText(
      `Elektronisch signiert am ${signDate}`,
      {
        x: width - sigWidth - 50,
        y: 65,
        size: 8,
        color: rgb(0.4, 0.4, 0.4),
      }
    );

    lastPage.drawText(
      `von ${user.email}`,
      {
        x: width - sigWidth - 50,
        y: 55,
        size: 8,
        color: rgb(0.4, 0.4, 0.4),
      }
    );

    const signedPdfBytes = await pdfDoc.save();

    // Signiertes PDF hochladen
    const signedPath = contract.original_pdf_path.replace('.pdf', '_signed.pdf');

    const { error: uploadError } = await adminSupabase
      .storage
      .from('project_files')
      .upload(signedPath, signedPdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('[Contracts API] Upload Error:', uploadError);
      return NextResponse.json(
        { error: 'Fehler beim Speichern des signierten PDFs' },
        { status: 500 }
      );
    }

    // Signed URL generieren
    const { data: urlData } = await adminSupabase
      .storage
      .from('project_files')
      .createSignedUrl(signedPath, 60 * 60 * 24 * 365); // 1 Jahr

    // IP und User-Agent erfassen
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Contract aktualisieren
    const { data: updatedContract, error: updateError } = await adminSupabase
      .from('contracts')
      .update({
        status: 'signed',
        signed_pdf_path: signedPath,
        signed_pdf_url: urlData?.signedUrl,
        signature_data: signature,
        signed_at: new Date().toISOString(),
        signed_by: user.id,
        signer_ip: ip.split(',')[0].trim(), // Nur erste IP bei mehreren
        signer_user_agent: userAgent.substring(0, 500), // Limitieren
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Contracts API] Update Error:', updateError);
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Vertrags' },
        { status: 500 }
      );
    }

    // Activity Log
    await adminSupabase.from('activity_log').insert({
      project_id: contract.project_id,
      user_id: user.id,
      action: 'contract_signed',
      entity_type: 'contract',
      entity_id: id,
      details: {
        contract_title: contract.title,
        signed_at: new Date().toISOString(),
      },
      ip_address: ip.split(',')[0].trim(),
      user_agent: userAgent.substring(0, 500),
    });

    return NextResponse.json({
      contract: updatedContract,
      message: 'Vertrag erfolgreich signiert',
    });
  } catch (error) {
    console.error('[Contracts API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
