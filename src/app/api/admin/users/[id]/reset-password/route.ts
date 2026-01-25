import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/services/email/EmailService';
import crypto from 'crypto';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://getemergence.com';

/**
 * POST /api/admin/users/[id]/reset-password
 * Sendet eine Passwort-Reset-E-Mail an den Benutzer
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // User-Profil laden
    const profile = await prisma.profiles.findUnique({
      where: { id },
      select: { email: true, full_name: true, first_name: true },
    });

    if (!profile || !profile.email) {
      console.error('[Reset Password] Profile not found for id:', id);
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Reset-Token generieren (32 bytes = 64 hex chars)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Stunden

    // Token in Profil speichern
    await prisma.profiles.update({
      where: { id },
      data: {
        reset_token: resetToken,
        reset_token_expires: tokenExpiry,
      },
    });

    // Reset-Link erstellen
    const resetUrl = `${BASE_URL}/auth/reset-password?token=${resetToken}`;
    const userName = profile.full_name || profile.first_name || 'Nutzer';

    // E-Mail in Queue einreihen
    await EmailService.queueEmail({
      recipient_email: profile.email,
      recipient_name: userName,
      subject: 'Passwort zurücksetzen - getemergence.com',
      content_html: `
        <h2>Passwort zurücksetzen</h2>
        <p>Hallo ${userName},</p>
        <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten.</p>
        <p>Klicken Sie auf den folgenden Link, um ein neues Passwort festzulegen:</p>
        <p><a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Passwort zurücksetzen</a></p>
        <p>Oder kopieren Sie diesen Link: ${resetUrl}</p>
        <p>Dieser Link ist 24 Stunden gültig.</p>
        <p>Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.</p>
        <p>Mit freundlichen Grüßen,<br>Das getemergence.com Team</p>
      `,
      content_text: `
Passwort zurücksetzen

Hallo ${userName},

Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten.

Klicken Sie auf den folgenden Link, um ein neues Passwort festzulegen:
${resetUrl}

Dieser Link ist 24 Stunden gültig.

Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.

Mit freundlichen Grüßen,
Das getemergence.com Team
      `,
      type: 'system',
    });

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
