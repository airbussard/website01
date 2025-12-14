import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/users/[id]/organizations
 * Laedt alle Organisationen eines Users
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;

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

    // User-Organisationen laden
    const { data: memberships, error } = await adminSupabase
      .from('organization_members')
      .select(`
        id,
        role,
        created_at,
        organization:organizations(id, name, slug, logo_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[User Orgs API] Error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Organisationen' },
        { status: 500 }
      );
    }

    // Normalisieren (organization kann Array sein)
    const organizations = memberships?.map(m => ({
      membership_id: m.id,
      role: m.role,
      joined_at: m.created_at,
      organization: Array.isArray(m.organization) ? m.organization[0] : m.organization,
    })) || [];

    return NextResponse.json({ organizations });

  } catch (error) {
    console.error('[User Orgs API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users/[id]/organizations
 * Fuegt User zu einer Organisation hinzu
 * Body: { organization_id: string, role?: 'member' | 'admin' }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { organization_id, role = 'member' } = body;

    if (!organization_id) {
      return NextResponse.json(
        { error: 'organization_id ist erforderlich' },
        { status: 400 }
      );
    }

    // Valide Rollen
    if (!['member', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Ungueltige Rolle (member oder admin)' },
        { status: 400 }
      );
    }

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

    // Pruefen ob bereits Mitglied
    const { data: existing } = await adminSupabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'User ist bereits Mitglied dieser Organisation' },
        { status: 400 }
      );
    }

    // Mitgliedschaft erstellen
    const { data: membership, error: insertError } = await adminSupabase
      .from('organization_members')
      .insert({
        organization_id,
        user_id: userId,
        role,
      })
      .select(`
        id,
        role,
        created_at,
        organization:organizations(id, name, slug, logo_url)
      `)
      .single();

    if (insertError) {
      console.error('[User Orgs API] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Fehler beim Hinzufuegen zur Organisation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      membership: {
        membership_id: membership.id,
        role: membership.role,
        joined_at: membership.created_at,
        organization: Array.isArray(membership.organization)
          ? membership.organization[0]
          : membership.organization,
      },
    });

  } catch (error) {
    console.error('[User Orgs API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]/organizations
 * Entfernt User aus einer Organisation
 * Body: { organization_id: string }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { organization_id } = body;

    if (!organization_id) {
      return NextResponse.json(
        { error: 'organization_id ist erforderlich' },
        { status: 400 }
      );
    }

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

    // Pruefen ob User Owner ist - Owner kann nicht entfernt werden
    const { data: membership } = await adminSupabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organization_id)
      .eq('user_id', userId)
      .single();

    if (membership?.role === 'owner') {
      return NextResponse.json(
        { error: 'Der Owner kann nicht entfernt werden. Uebertragen Sie zuerst die Ownership.' },
        { status: 400 }
      );
    }

    // Mitgliedschaft loeschen
    const { error: deleteError } = await adminSupabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organization_id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('[User Orgs API] Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Fehler beim Entfernen aus der Organisation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[User Orgs API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]/organizations
 * Aendert die Rolle eines Users in einer Organisation
 * Body: { organization_id: string, role: 'member' | 'admin' }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { organization_id, role } = body;

    if (!organization_id || !role) {
      return NextResponse.json(
        { error: 'organization_id und role sind erforderlich' },
        { status: 400 }
      );
    }

    // Valide Rollen (owner kann nicht per Admin gesetzt werden)
    if (!['member', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Ungueltige Rolle (member oder admin)' },
        { status: 400 }
      );
    }

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

    // Pruefen ob User Owner ist - Owner-Rolle kann nicht geaendert werden
    const { data: currentMembership } = await adminSupabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organization_id)
      .eq('user_id', userId)
      .single();

    if (currentMembership?.role === 'owner') {
      return NextResponse.json(
        { error: 'Die Owner-Rolle kann nicht geaendert werden' },
        { status: 400 }
      );
    }

    // Rolle aktualisieren
    const { error: updateError } = await adminSupabase
      .from('organization_members')
      .update({ role })
      .eq('organization_id', organization_id)
      .eq('user_id', userId);

    if (updateError) {
      console.error('[User Orgs API] Update error:', updateError);
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren der Rolle' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[User Orgs API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
