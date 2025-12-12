import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/users/[id]/reset-password
 * Sendet eine Passwort-Reset-E-Mail an den Benutzer
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const supabase = createAdminSupabaseClient();

    // Zuerst E-Mail des Users holen
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single();

    if (profileError || !profile) {
      console.error('[Reset Password] Profile not found:', profileError);
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Password-Reset-Mail senden
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      profile.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://oscarknabe.de'}/auth/reset-password`,
      }
    );

    if (resetError) {
      console.error('[Reset Password] Error:', resetError);
      return NextResponse.json(
        { error: 'Fehler beim Senden der Reset-E-Mail' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Passwort-Reset-E-Mail wurde an ${profile.email} gesendet`
    });
  } catch (error) {
    console.error('[Reset Password] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
