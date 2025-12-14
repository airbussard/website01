import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * POST /api/organizations/[id]/members
 * Fügt ein Mitglied zur Organisation hinzu (per E-Mail)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();

    // Prüfen ob User Admin/Owner der Organisation ist
    const { data: membership } = await adminSupabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isOrgAdmin = membership?.role === 'owner' || membership?.role === 'admin';
    const isSystemAdmin = profile?.role === 'admin' || profile?.role === 'manager';

    if (!isOrgAdmin && !isSystemAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung zum Hinzufügen von Mitgliedern' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role = 'member' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail ist erforderlich' },
        { status: 400 }
      );
    }

    // Valide Rollen prüfen (owner kann nur vom aktuellen owner vergeben werden)
    const validRoles = ['member', 'admin'];
    if (membership?.role === 'owner') {
      validRoles.push('owner');
    }
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Ungültige Rolle' },
        { status: 400 }
      );
    }

    // User anhand E-Mail finden
    const { data: targetUser } = await adminSupabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email.toLowerCase())
      .single();

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Benutzer mit dieser E-Mail nicht gefunden. Der Benutzer muss sich zuerst registrieren.' },
        { status: 404 }
      );
    }

    // Prüfen ob bereits Mitglied
    const { data: existingMember } = await adminSupabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', targetUser.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'Benutzer ist bereits Mitglied dieser Organisation' },
        { status: 400 }
      );
    }

    // Mitglied hinzufügen
    const { data: newMember, error: insertError } = await adminSupabase
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        user_id: targetUser.id,
        role,
      })
      .select(`
        id,
        role,
        created_at,
        user:profiles(id, email, full_name, first_name, last_name, avatar_url)
      `)
      .single();

    if (insertError) {
      console.error('[Org Members API] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Fehler beim Hinzufügen des Mitglieds' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      member: newMember,
    });

  } catch (error) {
    console.error('[Org Members API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/[id]/members
 * Entfernt ein Mitglied aus der Organisation
 * Body: { user_id: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();
    const body = await request.json();
    const { user_id: targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'user_id ist erforderlich' },
        { status: 400 }
      );
    }

    // Eigene Mitgliedschaft prüfen
    const { data: membership } = await adminSupabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isOrgAdmin = membership?.role === 'owner' || membership?.role === 'admin';
    const isSystemAdmin = profile?.role === 'admin' || profile?.role === 'manager';
    const isSelf = targetUserId === user.id;

    // User kann sich selbst entfernen, oder Admin kann andere entfernen
    if (!isSelf && !isOrgAdmin && !isSystemAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Prüfen ob Target der Owner ist - Owner kann nicht entfernt werden
    const { data: targetMembership } = await adminSupabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', targetUserId)
      .single();

    if (targetMembership?.role === 'owner' && !isSystemAdmin) {
      return NextResponse.json(
        { error: 'Der Owner kann nicht entfernt werden. Übertragen Sie zuerst die Ownership.' },
        { status: 400 }
      );
    }

    // Mitglied entfernen
    const { error: deleteError } = await adminSupabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', targetUserId);

    if (deleteError) {
      console.error('[Org Members API] Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Fehler beim Entfernen des Mitglieds' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Org Members API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organizations/[id]/members
 * Ändert die Rolle eines Mitglieds
 * Body: { user_id: string, role: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();
    const body = await request.json();
    const { user_id: targetUserId, role: newRole } = body;

    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { error: 'user_id und role sind erforderlich' },
        { status: 400 }
      );
    }

    // Eigene Mitgliedschaft prüfen
    const { data: membership } = await adminSupabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isOwner = membership?.role === 'owner';
    const isSystemAdmin = profile?.role === 'admin';

    // Nur Owner oder System-Admin können Rollen ändern
    if (!isOwner && !isSystemAdmin) {
      return NextResponse.json(
        { error: 'Nur der Owner kann Rollen ändern' },
        { status: 403 }
      );
    }

    // Valide Rollen
    if (!['owner', 'admin', 'member'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Ungültige Rolle' },
        { status: 400 }
      );
    }

    // Wenn Owner-Rolle übertragen wird, aktuellen Owner zu Admin machen
    if (newRole === 'owner' && targetUserId !== user.id) {
      await adminSupabase
        .from('organization_members')
        .update({ role: 'admin' })
        .eq('organization_id', organizationId)
        .eq('user_id', user.id);
    }

    // Rolle aktualisieren
    const { error: updateError } = await adminSupabase
      .from('organization_members')
      .update({ role: newRole })
      .eq('organization_id', organizationId)
      .eq('user_id', targetUserId);

    if (updateError) {
      console.error('[Org Members API] Update error:', updateError);
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren der Rolle' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Org Members API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
