import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/servers/[id]/server-databases
 * Liste aller Datenbank-Konfigurationen fuer einen Server
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Datenbanken laden (ohne Passwort)
    const { data: databases, error } = await adminSupabase
      .from('server_databases')
      .select('id, server_id, name, host, port, database_name, username, ssl_enabled, is_active, created_at, updated_at')
      .eq('server_id', id)
      .order('name');

    if (error) {
      console.error('[Server Databases API] Error:', error);
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }

    return NextResponse.json({ databases: databases || [] });

  } catch (error) {
    console.error('[Server Databases API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/admin/servers/[id]/server-databases
 * Neue Datenbank-Konfiguration erstellen
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Server existiert?
    const { data: server } = await adminSupabase
      .from('monitored_servers')
      .select('id')
      .eq('id', id)
      .single();

    if (!server) {
      return NextResponse.json({ error: 'Server nicht gefunden' }, { status: 404 });
    }

    const body = await request.json();
    const { name, host, port, database_name, username, password, ssl_enabled } = body;

    if (!name || !username || !password) {
      return NextResponse.json({ error: 'Name, Username und Passwort erforderlich' }, { status: 400 });
    }

    const { data: newDb, error } = await adminSupabase
      .from('server_databases')
      .insert({
        server_id: id,
        name,
        host: host || 'localhost',
        port: port || 5432,
        database_name: database_name || 'postgres',
        username,
        password,
        ssl_enabled: ssl_enabled || false,
        is_active: true
      })
      .select('id, server_id, name, host, port, database_name, username, ssl_enabled, is_active, created_at, updated_at')
      .single();

    if (error) {
      console.error('[Server Databases API] Insert error:', error);
      return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 });
    }

    return NextResponse.json({ database: newDb }, { status: 201 });

  } catch (error) {
    console.error('[Server Databases API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
