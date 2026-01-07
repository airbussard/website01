import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * PATCH /api/progress-updates/[id]
 * Update bearbeiten - nur Manager/Admin oder Autor
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const adminSupabase = createAdminSupabaseClient();

    // Rolle und Update laden
    const [profileResult, updateResult] = await Promise.all([
      adminSupabase.from('profiles').select('role').eq('id', user.id).single(),
      adminSupabase.from('progress_updates').select('*').eq('id', id).single(),
    ]);

    if (updateResult.error || !updateResult.data) {
      return NextResponse.json(
        { error: 'Update nicht gefunden' },
        { status: 404 }
      );
    }

    const profile = profileResult.data;
    const existingUpdate = updateResult.data;
    const isManagerOrAdmin = profile && ['manager', 'admin'].includes(profile.role);
    const isAuthor = existingUpdate.author_id === user.id;

    // Berechtigung pruefen: Manager/Admin oder Autor
    if (!isManagerOrAdmin && !isAuthor) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Request Body parsen
    const body = await request.json();
    const {
      title,
      content,
      progress_percentage,
      is_public,
      images,
    } = body;

    // Update-Daten vorbereiten (nur geaenderte Felder)
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content?.trim() || null;
    if (progress_percentage !== undefined) {
      updateData.progress_percentage = progress_percentage ? parseInt(progress_percentage) : null;
    }
    if (is_public !== undefined) updateData.is_public = is_public;
    if (images !== undefined) updateData.images = images;

    // Update durchfuehren
    const { data: updatedUpdate, error: updateError } = await adminSupabase
      .from('progress_updates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Progress Updates API] Update error:', updateError);
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren' },
        { status: 500 }
      );
    }

    // Activity Log
    await adminSupabase.from('activity_log').insert({
      project_id: existingUpdate.project_id,
      user_id: user.id,
      action: 'progress_update_edited',
      entity_type: 'progress_update',
      entity_id: id,
      details: { title: updateData.title || existingUpdate.title },
    });

    return NextResponse.json({ update: updatedUpdate });

  } catch (error) {
    console.error('[Progress Updates API] PATCH Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/progress-updates/[id]
 * Update loeschen - nur Manager/Admin
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const adminSupabase = createAdminSupabaseClient();

    // Rolle pruefen
    const { data: profile } = await adminSupabase
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

    // Update laden fuer Activity Log und Storage Cleanup
    const { data: existingUpdate, error: fetchError } = await adminSupabase
      .from('progress_updates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingUpdate) {
      return NextResponse.json(
        { error: 'Update nicht gefunden' },
        { status: 404 }
      );
    }

    // Bilder aus Storage loeschen falls vorhanden
    if (existingUpdate.images && existingUpdate.images.length > 0) {
      try {
        const filePaths = existingUpdate.images
          .map((url: string) => {
            // URL parsen um Pfad zu extrahieren
            const match = url.match(/progress-updates\/(.+)$/);
            return match ? match[1] : null;
          })
          .filter(Boolean);

        if (filePaths.length > 0) {
          await adminSupabase.storage
            .from('progress-updates')
            .remove(filePaths);
        }
      } catch (storageError) {
        // Storage-Fehler loggen aber nicht abbrechen
        console.error('[Progress Updates API] Storage cleanup error:', storageError);
      }
    }

    // Update loeschen
    const { error: deleteError } = await adminSupabase
      .from('progress_updates')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Progress Updates API] Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Fehler beim Loeschen' },
        { status: 500 }
      );
    }

    // Activity Log
    await adminSupabase.from('activity_log').insert({
      project_id: existingUpdate.project_id,
      user_id: user.id,
      action: 'progress_update_deleted',
      entity_type: 'progress_update',
      entity_id: id,
      details: { title: existingUpdate.title },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Progress Updates API] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
