import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string; dbId: string }>;
}

/**
 * GET /api/admin/servers/[id]/server-databases/[dbId]
 * Einzelne Datenbank-Konfiguration laden
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, dbId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabaseClient();

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    const { data: database, error } = await adminSupabase
      .from('server_databases')
      .select('id, server_id, name, host, port, database_name, username, ssl_enabled, is_active, created_at, updated_at')
      .eq('id', dbId)
      .eq('server_id', id)
      .single();

    if (error || !database) {
      return NextResponse.json({ error: 'Datenbank nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ database });

  } catch (error) {
    console.error('[Server Databases API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/servers/[id]/server-databases/[dbId]
 * Datenbank-Konfiguration aktualisieren
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, dbId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabaseClient();

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    const body = await request.json();
    const { name, host, port, database_name, username, password, ssl_enabled, is_active } = body;

    // Update-Objekt erstellen (Passwort nur wenn angegeben)
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (host !== undefined) updateData.host = host;
    if (port !== undefined) updateData.port = port;
    if (database_name !== undefined) updateData.database_name = database_name;
    if (username !== undefined) updateData.username = username;
    if (password !== undefined && password !== '') updateData.password = password;
    if (ssl_enabled !== undefined) updateData.ssl_enabled = ssl_enabled;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Keine Aenderungen' }, { status: 400 });
    }

    const { data: database, error } = await adminSupabase
      .from('server_databases')
      .update(updateData)
      .eq('id', dbId)
      .eq('server_id', id)
      .select('id, server_id, name, host, port, database_name, username, ssl_enabled, is_active, created_at, updated_at')
      .single();

    if (error) {
      console.error('[Server Databases API] Update error:', error);
      return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
    }

    if (!database) {
      return NextResponse.json({ error: 'Datenbank nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ database });

  } catch (error) {
    console.error('[Server Databases API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/servers/[id]/server-databases/[dbId]
 * Datenbank-Konfiguration loeschen
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, dbId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabaseClient();

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    const { error } = await adminSupabase
      .from('server_databases')
      .delete()
      .eq('id', dbId)
      .eq('server_id', id);

    if (error) {
      console.error('[Server Databases API] Delete error:', error);
      return NextResponse.json({ error: 'Fehler beim Loeschen' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Server Databases API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
