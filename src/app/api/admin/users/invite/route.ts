import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * POST /api/admin/users/invite
 * Lädt einen neuen Benutzer per E-Mail ein
 */
export async function POST(request: NextRequest) {
  try {
    // Auth prüfen
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Admin-Rolle prüfen
    const { data: profile } = await supabase
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

    // Request Body parsen
    const body = await request.json();
    const { email, first_name, last_name, role = 'user', project_ids } = body;
    const full_name = [first_name, last_name].filter(Boolean).join(' ');

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail ist erforderlich' },
        { status: 400 }
      );
    }

    // E-Mail-Format validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // Rolle validieren
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Ungültige Rolle' },
        { status: 400 }
      );
    }

    // Admin Client für Einladung verwenden
    const adminSupabase = createAdminSupabaseClient();

    // Benutzer einladen - first_name/last_name fuer DB-Trigger bereitstellen
    const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: full_name || '',
        first_name: first_name || '',
        last_name: last_name || '',
        role: role,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://getemergence.com'}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      console.error('Invite error:', error);

      // Spezifische Fehlermeldungen
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Diese E-Mail-Adresse ist bereits registriert' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message || 'Fehler beim Einladen des Benutzers' },
        { status: 500 }
      );
    }

    // Profil direkt erstellen (DB-Trigger ist deaktiviert in Supabase)
    if (data.user) {
      const { error: profileError } = await adminSupabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: full_name || '',
        first_name: first_name || '',
        last_name: last_name || '',
        role: role,
      }, { onConflict: 'id' });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Nicht abbrechen - User wurde erstellt, nur Profil fehlt
      }

      // Projekt-Zuweisungen erstellen wenn project_ids vorhanden
      if (project_ids && Array.isArray(project_ids) && project_ids.length > 0) {
        const memberships = project_ids.map((projectId: string) => ({
          project_id: projectId,
          user_id: data.user!.id,
          role: 'viewer' as const, // Standard-Rolle fuer eingeladene User
        }));

        const { error: memberError } = await adminSupabase
          .from('project_members')
          .insert(memberships);

        if (memberError) {
          console.error('Project member creation error:', memberError);
          // Nicht abbrechen - User wurde erstellt, nur Projektzuweisung fehlt
        } else {
          console.log(`[Invite API] ${project_ids.length} Projektzuweisung(en) erstellt fuer User ${data.user!.id}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Einladung erfolgreich gesendet',
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      assigned_projects: project_ids?.length || 0,
    });

  } catch (error) {
    console.error('Invite API error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
