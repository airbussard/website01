import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * GET /api/organizations
 * Lädt alle Organisationen des aktuellen Users
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Organisationen des Users laden (über organization_members)
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        role,
        organization:organizations(
          id,
          name,
          slug,
          logo_url,
          street,
          postal_code,
          city,
          country,
          email,
          phone,
          website,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Organizations API] Error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Organisationen' },
        { status: 500 }
      );
    }

    // Daten umstrukturieren: Organization mit User-Rolle
    const organizations = data?.map(item => ({
      ...item.organization,
      user_role: item.role,
    })) || [];

    return NextResponse.json({ organizations });

  } catch (error) {
    console.error('[Organizations API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations
 * Erstellt eine neue Organisation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, street, postal_code, city, country, email, phone, website } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      );
    }

    // Admin-Client für Insert (um RLS zu umgehen bei neuer Org)
    const adminSupabase = createAdminSupabaseClient();

    // Organisation erstellen
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .insert({
        name: name.trim(),
        street,
        postal_code,
        city,
        country: country || 'Deutschland',
        email,
        phone,
        website,
        created_by: user.id,
      })
      .select()
      .single();

    if (orgError) {
      console.error('[Organizations API] Create error:', orgError);
      return NextResponse.json(
        { error: 'Fehler beim Erstellen der Organisation' },
        { status: 500 }
      );
    }

    // User als Owner hinzufügen
    const { error: memberError } = await adminSupabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
      });

    if (memberError) {
      console.error('[Organizations API] Member error:', memberError);
      // Org wieder löschen bei Fehler
      await adminSupabase.from('organizations').delete().eq('id', org.id);
      return NextResponse.json(
        { error: 'Fehler beim Erstellen der Mitgliedschaft' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      organization: org,
    });

  } catch (error) {
    console.error('[Organizations API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
