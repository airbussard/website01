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
    const { email, full_name, role = 'user' } = body;

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

    // Benutzer einladen
    const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: full_name || '',
        role: role,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://getemergence.com'}/auth/reset-password`,
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

    // Profil mit zusätzlichen Daten erstellen/aktualisieren
    if (data.user) {
      await adminSupabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          full_name: full_name || '',
          role: role,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Einladung erfolgreich gesendet',
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });

  } catch (error) {
    console.error('Invite API error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
