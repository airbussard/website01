import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/users/[id]/magic-link
 * Generiert und sendet einen Magic Link für einen Benutzer
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;

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

    // Admin Client verwenden
    const adminSupabase = createAdminSupabaseClient();

    // Ziel-Benutzer abrufen
    const { data: targetUser, error: userError } = await adminSupabase.auth.admin.getUserById(userId);

    if (userError || !targetUser.user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    const email = targetUser.user.email;

    if (!email) {
      return NextResponse.json(
        { error: 'Benutzer hat keine E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // Magic Link generieren und senden
    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://getemergence.com'}/dashboard`,
      },
    });

    if (error) {
      console.error('Magic Link error:', error);
      return NextResponse.json(
        { error: error.message || 'Fehler beim Generieren des Magic Links' },
        { status: 500 }
      );
    }

    // E-Mail mit Magic Link senden (über Supabase's eingebaute Funktion)
    // Der generateLink gibt den Link zurück, aber Supabase sendet auch automatisch die E-Mail
    // wenn man signInWithOtp verwendet. Da wir admin.generateLink nutzen, müssen wir
    // die E-Mail manuell senden oder den Link direkt zurückgeben.

    // Alternative: Verwende signInWithOtp für automatischen E-Mail-Versand
    const { error: otpError } = await adminSupabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://getemergence.com'}/dashboard`,
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      console.error('OTP error:', otpError);
      // Falls signInWithOtp fehlschlägt, geben wir trotzdem den generierten Link zurück
      return NextResponse.json({
        success: true,
        message: 'Magic Link wurde generiert',
        link: data.properties?.action_link,
        note: 'E-Mail konnte nicht automatisch gesendet werden. Der Link kann manuell geteilt werden.',
      });
    }

    return NextResponse.json({
      success: true,
      message: `Magic Link wurde an ${email} gesendet`,
    });

  } catch (error) {
    console.error('Magic Link API error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
