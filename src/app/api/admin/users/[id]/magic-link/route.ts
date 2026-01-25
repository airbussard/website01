import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/services/email/EmailService';
import crypto from 'crypto';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://getemergence.com';

/**
 * POST /api/admin/users/[id]/magic-link
 * Generiert und sendet einen Login-Link für einen Benutzer
 * HINWEIS: Mit NextAuth keine echten Magic Links - stattdessen Reset-Token
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;

    // Auth prüfen via NextAuth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    // Ziel-Benutzer abrufen
    const targetProfile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { email: true, full_name: true, first_name: true },
    });

    if (!targetProfile || !targetProfile.email) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    // Login-Token generieren (für Passwort-Reset als Login-Ersatz)
    const loginToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Stunden

    // Token in Profil speichern
    await prisma.profiles.update({
      where: { id: userId },
      data: {
        reset_token: loginToken,
        reset_token_expires: tokenExpiry,
      },
    });

    // Login-Link erstellen (führt zu Passwort-Reset Seite)
    const loginUrl = `${BASE_URL}/auth/reset-password?token=${loginToken}&login=true`;
    const userName = targetProfile.full_name || targetProfile.first_name || 'Nutzer';

    // E-Mail senden
    await EmailService.queueEmail({
      recipient_email: targetProfile.email,
      recipient_name: userName,
      subject: 'Login-Link für getemergence.com',
      content_html: `
        <h2>Login-Link</h2>
        <p>Hallo ${userName},</p>
        <p>Ein Administrator hat einen Login-Link für Sie generiert.</p>
        <p>Klicken Sie auf den folgenden Link, um sich einzuloggen (ggf. müssen Sie ein neues Passwort setzen):</p>
        <p><a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Jetzt einloggen</a></p>
        <p>Oder kopieren Sie diesen Link: ${loginUrl}</p>
        <p>Dieser Link ist 24 Stunden gültig.</p>
        <p>Mit freundlichen Grüßen,<br>Das getemergence.com Team</p>
      `,
      content_text: `
Login-Link

Hallo ${userName},

Ein Administrator hat einen Login-Link für Sie generiert.

Klicken Sie auf den folgenden Link, um sich einzuloggen (ggf. müssen Sie ein neues Passwort setzen):
${loginUrl}

Dieser Link ist 24 Stunden gültig.

Mit freundlichen Grüßen,
Das getemergence.com Team
      `,
      type: 'system',
    });

    return NextResponse.json({
      success: true,
      message: `Login-Link wurde an ${targetProfile.email} gesendet`,
    });

  } catch (error) {
    console.error('Magic Link API error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
