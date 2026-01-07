import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createLexofficeClient } from '@/lib/lexoffice';

/**
 * GET /api/admin/lexoffice-settings
 * Ruft die Lexoffice-Einstellungen ab
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Rolle pruefen - nur Admin
    const adminSupabase = createAdminSupabaseClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Nur Admins' }, { status: 403 });
    }

    // Settings laden
    const { data: settings } = await adminSupabase
      .from('system_settings')
      .select('value, updated_at')
      .eq('key', 'lexoffice')
      .single();

    const lexofficeSettings = settings?.value as {
      is_enabled: boolean;
      api_key: string | null;
    } | null;

    // API Key maskieren
    const maskedApiKey = lexofficeSettings?.api_key
      ? `${lexofficeSettings.api_key.substring(0, 8)}...${lexofficeSettings.api_key.substring(lexofficeSettings.api_key.length - 4)}`
      : null;

    return NextResponse.json({
      settings: {
        is_enabled: lexofficeSettings?.is_enabled ?? false,
        api_key_set: !!lexofficeSettings?.api_key,
        api_key_masked: maskedApiKey,
      },
      updated_at: settings?.updated_at || null,
    });
  } catch (error) {
    console.error('[Lexoffice Settings] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/lexoffice-settings
 * Aktualisiert die Lexoffice-Einstellungen
 *
 * Body:
 * - is_enabled: boolean (optional)
 * - api_key: string (optional) - Neuer API Key
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Rolle pruefen - nur Admin
    const adminSupabase = createAdminSupabaseClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Nur Admins' }, { status: 403 });
    }

    const body = await request.json();
    const { is_enabled, api_key } = body;

    // Aktuelle Settings laden
    const { data: currentSettings } = await adminSupabase
      .from('system_settings')
      .select('value')
      .eq('key', 'lexoffice')
      .single();

    const currentValue = (currentSettings?.value as {
      is_enabled: boolean;
      api_key: string | null;
    }) || { is_enabled: false, api_key: null };

    // Updates zusammenfuehren
    const newValue = {
      is_enabled: is_enabled !== undefined ? is_enabled : currentValue.is_enabled,
      api_key: api_key !== undefined ? api_key : currentValue.api_key,
    };

    // Upsert (INSERT ... ON CONFLICT UPDATE)
    const { error: upsertError } = await adminSupabase
      .from('system_settings')
      .upsert(
        {
          key: 'lexoffice',
          value: newValue,
          description: 'Lexoffice API Integration Settings',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (upsertError) {
      console.error('[Lexoffice Settings] Upsert error:', upsertError);
      return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 });
    }

    // API Key maskieren fuer Response
    const maskedApiKey = newValue.api_key
      ? `${newValue.api_key.substring(0, 8)}...${newValue.api_key.substring(newValue.api_key.length - 4)}`
      : null;

    return NextResponse.json({
      success: true,
      settings: {
        is_enabled: newValue.is_enabled,
        api_key_set: !!newValue.api_key,
        api_key_masked: maskedApiKey,
      },
    });
  } catch (error) {
    console.error('[Lexoffice Settings] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/admin/lexoffice-settings/test
 * Testet die Lexoffice-Verbindung
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Rolle pruefen - nur Admin
    const adminSupabase = createAdminSupabaseClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Nur Admins' }, { status: 403 });
    }

    // Settings laden
    const { data: settings } = await adminSupabase
      .from('system_settings')
      .select('value')
      .eq('key', 'lexoffice')
      .single();

    const lexofficeSettings = settings?.value as {
      is_enabled: boolean;
      api_key: string | null;
    } | null;

    if (!lexofficeSettings?.api_key) {
      return NextResponse.json(
        { success: false, error: 'Kein API Key konfiguriert' },
        { status: 400 }
      );
    }

    // Verbindung testen
    const lexoffice = createLexofficeClient(lexofficeSettings.api_key);
    const connected = await lexoffice.testConnection();

    if (connected) {
      return NextResponse.json({
        success: true,
        message: 'Verbindung erfolgreich',
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Verbindung fehlgeschlagen - API Key ungueltig oder API nicht erreichbar',
      });
    }
  } catch (error) {
    console.error('[Lexoffice Settings] Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Verbindungstest fehlgeschlagen',
    });
  }
}
