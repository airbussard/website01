import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rateLimit';

/**
 * POST /api/auth/register
 * Registriert einen neuen Benutzer und erstellt das Profil direkt
 * (DB-Trigger ist deaktiviert)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate Limiting: 3 Registrierungen pro Minute pro IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitResult = rateLimit(ip, 3, 60000);

    if (!rateLimitResult.success) {
      console.log(`[Register] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: 'Zu viele Registrierungsversuche. Bitte versuchen Sie es spaeter erneut.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimitResult.resetIn / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { email, password, fullName, company, website } = body;

    // Honeypot-Check: Wenn 'website' gefuellt ist, ist es ein Bot
    if (website) {
      console.log(`[Register] Bot detected via honeypot (IP: ${ip})`);
      // Fake-Success zurueckgeben (Bot merkt nichts)
      return NextResponse.json({
        success: true,
        message: 'Registrierung erfolgreich. Bitte bestaetigen Sie Ihre E-Mail-Adresse.',
      });
    }

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
        { error: 'Ungueltige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // Admin Client fuer User-Erstellung
    const adminSupabase = createAdminSupabaseClient();

    // User in Auth erstellen
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User muss E-Mail bestaetigen
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

      // Bestaetigungs-E-Mail senden
      // Supabase sendet automatisch eine Bestaetigungs-E-Mail wenn email_confirm: false
    }

    return NextResponse.json({
      success: true,
      message: 'Registrierung erfolgreich. Bitte bestaetigen Sie Ihre E-Mail-Adresse.',
    });

  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
