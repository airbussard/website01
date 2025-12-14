import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/organizations
 * Laedt alle Organisationen (nur fuer Admins)
 */
export async function GET() {
  try {
    // Auth pruefen
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();

    // Admin-Rolle pruefen
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Keine Admin-Berechtigung' },
        { status: 403 }
      );
    }

    // Alle Organisationen laden
    const { data: organizations, error } = await adminSupabase
      .from('organizations')
      .select('id, name, slug, logo_url, city, created_at')
      .order('name', { ascending: true });

    if (error) {
      console.error('[Admin Organizations API] Error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Organisationen' },
        { status: 500 }
      );
    }

    return NextResponse.json({ organizations: organizations || [] });

  } catch (error) {
    console.error('[Admin Organizations API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
