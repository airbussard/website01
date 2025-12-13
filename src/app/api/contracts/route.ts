import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * GET /api/contracts
 * Liste aller Vertraege (gefiltert nach Berechtigung)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // URL Parameter
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');

    // Query aufbauen
    let query = supabase
      .from('contracts')
      .select(`
        *,
        project:pm_projects(id, name, client_id),
        signer:profiles!contracts_signed_by_fkey(id, email, first_name, last_name),
        creator:profiles!contracts_created_by_fkey(id, email, first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: contracts, error } = await query;

    if (error) {
      console.error('[Contracts API] Query error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Vertraege' },
        { status: 500 }
      );
    }

    return NextResponse.json({ contracts });
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
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Rolle pruefen
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Keine Berechtigung - nur Manager/Admin' },
        { status: 403 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();

    // PDF hochladen
    const fileName = `${Date.now()}_${pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `${projectId}/contracts/${fileName}`;

    const arrayBuffer = await pdfFile.arrayBuffer();
    const { error: uploadError } = await adminSupabase
      .storage
      .from('project_files')
      .upload(storagePath, arrayBuffer, {
        contentType: 'application/pdf',
      });

    if (uploadError) {
      console.error('[Contracts API] Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Fehler beim Hochladen der PDF' },
        { status: 500 }
      );
    }

    // Signed URL generieren (1 Jahr gueltig)
    const { data: urlData } = await adminSupabase
      .storage
      .from('project_files')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    // Contract in DB erstellen
    const { data: contract, error: insertError } = await adminSupabase
      .from('contracts')
      .insert({
        project_id: projectId,
        title,
        description: description || null,
        original_pdf_path: storagePath,
        original_pdf_url: urlData?.signedUrl || null,
        valid_until: validUntil || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Contracts API] Insert error:', insertError);
      // Cleanup: PDF loeschen wenn DB Insert fehlschlaegt
      await adminSupabase.storage.from('project_files').remove([storagePath]);
      return NextResponse.json(
        { error: 'Fehler beim Erstellen des Vertrags' },
        { status: 500 }
      );
    }

    // Activity Log
    await adminSupabase.from('activity_log').insert({
      project_id: projectId,
      user_id: user.id,
      action: 'contract_uploaded',
      entity_type: 'contract',
      entity_id: contract.id,
      details: { contract_title: title },
    });

    return NextResponse.json({ contract }, { status: 201 });
  } catch (error) {
    console.error('[Contracts API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
