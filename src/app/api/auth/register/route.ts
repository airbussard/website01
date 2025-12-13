import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * POST /api/auth/register
 * Registriert einen neuen Benutzer und erstellt das Profil direkt
 * (DB-Trigger ist deaktiviert)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, company } = body;

    // Validierung
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort sind erforderlich' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Das Passwort muss mindestens 8 Zeichen lang sein' },
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

    // Admin Client für User-Erstellung
    const adminSupabase = createAdminSupabaseClient();

    // User in Auth erstellen
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User muss E-Mail bestätigen
      user_metadata: {
        full_name: fullName || '',
        role: 'user',
      },
    });

    if (authError) {
      console.error('Register error:', authError);

      // Spezifische Fehlermeldungen
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Diese E-Mail-Adresse ist bereits registriert' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: authError.message || 'Fehler bei der Registrierung' },
        { status: 500 }
      );
    }

    // Profil direkt erstellen (Trigger ist deaktiviert)
    if (authData.user) {
      const { error: profileError } = await adminSupabase.from('profiles').upsert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: fullName || '',
        company: company || '',
        role: 'user',
      }, { onConflict: 'id' });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Nicht abbrechen - User wurde erstellt
      }

      // Bestätigungs-E-Mail senden
      // Supabase sendet automatisch eine Bestätigungs-E-Mail wenn email_confirm: false
    }

    return NextResponse.json({
      success: true,
      message: 'Registrierung erfolgreich. Bitte bestätigen Sie Ihre E-Mail-Adresse.',
    });

  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
