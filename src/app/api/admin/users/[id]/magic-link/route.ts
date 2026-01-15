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

    // Magic Link per E-Mail senden (signInWithOtp sendet automatisch)
    const { error: otpError } = await adminSupabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://getemergence.com'}/dashboard`,
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      console.error('OTP error:', otpError);
      return NextResponse.json(
        { error: otpError.message || 'Fehler beim Senden des Magic Links' },
        { status: 500 }
      );
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
