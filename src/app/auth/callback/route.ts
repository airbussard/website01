import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Auth Callback Route
 * Verarbeitet Tokens aus Supabase-Links (Einladungen, Passwort-Reset, etc.)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/auth/reset-password';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Erfolg: Zur nächsten Seite weiterleiten
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('[Auth Callback] Error:', error.message);
  }

  // Bei Fehler oder fehlendem Code zur Login-Seite
  return NextResponse.redirect(`${origin}/auth/login?error=invalid_token`);
}
