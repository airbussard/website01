import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/contracts/[id]
 * Einzelnen Vertrag laden
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const { data: contract, error } = await supabase
      .from('contracts')
      .select(`
        *,
        project:pm_projects(id, name, client_id, manager_id),
        signer:profiles!contracts_signed_by_fkey(id, email, first_name, last_name),
        creator:profiles!contracts_created_by_fkey(id, email, first_name, last_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Contracts API] Query error:', error);
      return NextResponse.json(
        { error: 'Vertrag nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contract });
  } catch (error) {
    console.error('[Contracts API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/contracts/[id]
 * Vertrag aktualisieren (nur Manager/Admin)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, valid_until, status } = body;

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
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (valid_until !== undefined) updateData.valid_until = valid_until;
    if (status !== undefined) updateData.status = status;

    const { data: contract, error } = await adminSupabase
      .from('contracts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Contracts API] Update error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren' },
        { status: 500 }
      );
    }

    return NextResponse.json({ contract });
  } catch (error) {
    console.error('[Contracts API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contracts/[id]
 * Vertrag loeschen (nur Admin)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Nur Admin kann loeschen
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Keine Berechtigung - nur Admin' },
        { status: 403 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();

    // Vertrag laden um PDFs zu loeschen
    const { data: contract } = await adminSupabase
      .from('contracts')
      .select('original_pdf_path, signed_pdf_path, project_id')
      .eq('id', id)
      .single();

    if (!contract) {
      return NextResponse.json(
        { error: 'Vertrag nicht gefunden' },
        { status: 404 }
      );
    }

    // PDFs aus Storage loeschen
    const pathsToDelete = [contract.original_pdf_path];
    if (contract.signed_pdf_path) {
      pathsToDelete.push(contract.signed_pdf_path);
    }

    await adminSupabase.storage.from('project_files').remove(pathsToDelete);

    // Vertrag loeschen
    const { error: deleteError } = await adminSupabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Contracts API] Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Fehler beim Loeschen' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contracts API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
