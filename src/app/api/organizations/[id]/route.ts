import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * GET /api/organizations/[id]
 * Lädt eine einzelne Organisation mit Mitgliedern
 */
export async function GET(
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

    // Organisation laden
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organisation nicht gefunden' },
        { status: 404 }
      );
    }

    // Admin-Client verwenden um RLS fuer profiles zu umgehen
    // (normale User koennen sonst nur eigenes Profil sehen)
    const adminSupabase = createAdminSupabaseClient();

    // Mitglieder laden
    const { data: membersRaw } = await adminSupabase
      .from('organization_members')
      .select(`
        id,
        role,
        created_at,
        user:profiles(id, email, full_name, first_name, last_name, avatar_url)
      `)
      .eq('organization_id', id)
      .order('created_at', { ascending: true });

    // Normalize: user kann Array oder Objekt sein
    const members = membersRaw?.map(m => ({
      ...m,
      user: Array.isArray(m.user) ? m.user[0] : m.user,
    }));

    // User-Rolle in dieser Organisation
    const userMembership = members?.find(m => m.user?.id === user.id);

    return NextResponse.json({
      organization: {
        ...org,
        members: members || [],
        member_count: members?.length || 0,
      },
      user_role: userMembership?.role || null,
    });

  } catch (error) {
    console.error('[Organization API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organizations/[id]
 * Aktualisiert eine Organisation (nur für owner/admin)
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

    // Prüfen ob User Admin/Owner ist
    const adminSupabase = createAdminSupabaseClient();
    const { data: membership } = await adminSupabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', id)
      .eq('user_id', user.id)
      .single();

    // Auch System-Admins dürfen ändern
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isOrgAdmin = membership?.role === 'owner' || membership?.role === 'admin';
    const isSystemAdmin = profile?.role === 'admin' || profile?.role === 'manager';

    if (!isOrgAdmin && !isSystemAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, street, postal_code, city, country, email, phone, website, logo_url } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (street !== undefined) updateData.street = street;
    if (postal_code !== undefined) updateData.postal_code = postal_code;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (logo_url !== undefined) updateData.logo_url = logo_url;

    const { data: updated, error: updateError } = await adminSupabase
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Organization API] Update error:', updateError);
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      organization: updated,
    });

  } catch (error) {
    console.error('[Organization API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/[id]
 * Löscht eine Organisation (nur für owner)
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

    // Prüfen ob User Owner ist
    const { data: membership } = await adminSupabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', id)
      .eq('user_id', user.id)
      .single();

    // Auch System-Admins dürfen löschen
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isOwner = membership?.role === 'owner';
    const isSystemAdmin = profile?.role === 'admin';

    if (!isOwner && !isSystemAdmin) {
      return NextResponse.json(
        { error: 'Nur der Owner kann die Organisation löschen' },
        { status: 403 }
      );
    }

    // Organisation löschen (CASCADE löscht auch members)
    const { error: deleteError } = await adminSupabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Organization API] Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Fehler beim Löschen' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Organization API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
