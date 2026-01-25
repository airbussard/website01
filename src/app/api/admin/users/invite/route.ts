import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/services/email/EmailService';
import crypto from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://getemergence.com';

/**
 * POST /api/admin/users/invite
 * Lädt einen neuen Benutzer per E-Mail ein
 */
export async function POST(request: NextRequest) {
  try {
    // Auth prüfen via NextAuth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    // Request Body parsen
    const body = await request.json();
    const { email, first_name, last_name, role = 'user', project_ids } = body;
    const full_name = [first_name, last_name].filter(Boolean).join(' ');

    if (!email) {
      return NextResponse.json({ error: 'E-Mail ist erforderlich' }, { status: 400 });
    }

    // E-Mail-Format validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Ungültige E-Mail-Adresse' }, { status: 400 });
    }

    // Rolle validieren
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Ungültige Rolle' }, { status: 400 });
    }

    // Prüfen ob E-Mail bereits registriert
    const existingUser = await prisma.profiles.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse ist bereits registriert' },
        { status: 400 }
      );
    }

    // Invite-Token generieren (für Passwort-Festlegung)
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Tage

    // Neues Profil erstellen (ohne Passwort - wird bei Einladungsannahme gesetzt)
    const newProfile = await prisma.profiles.create({
      data: {
        id: crypto.randomUUID(),
        email,
        full_name: full_name || '',
        first_name: first_name || '',
        last_name: last_name || '',
        role,
        reset_token: inviteToken,
        reset_token_expires: tokenExpiry,
      },
    });

    // Projekt-Zuweisungen erstellen wenn project_ids vorhanden
    if (project_ids && Array.isArray(project_ids) && project_ids.length > 0) {
      const memberships = project_ids.map((projectId: string) => ({
        project_id: projectId,
        user_id: newProfile.id,
        role: 'viewer',
      }));

      try {
        await prisma.project_members.createMany({
          data: memberships,
        });
        console.log(`[Invite API] ${project_ids.length} Projektzuweisung(en) erstellt fuer User ${newProfile.id}`);
      } catch (memberError) {
        console.error('Project member creation error:', memberError);
        // Nicht abbrechen - User wurde erstellt, nur Projektzuweisung fehlt
      }
    }

    // Einladungs-E-Mail senden
    const inviteUrl = `${BASE_URL}/auth/reset-password?token=${inviteToken}&invite=true`;
    const userName = full_name || email;

    await EmailService.queueEmail({
      recipient_email: email,
      recipient_name: userName,
      subject: 'Einladung zu getemergence.com',
      content_html: `
        <h2>Willkommen bei getemergence.com!</h2>
        <p>Hallo ${userName},</p>
        <p>Sie wurden eingeladen, einen Account bei getemergence.com zu erstellen.</p>
        <p>Klicken Sie auf den folgenden Link, um Ihr Passwort festzulegen und Ihren Account zu aktivieren:</p>
        <p><a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Account aktivieren</a></p>
        <p>Oder kopieren Sie diesen Link: ${inviteUrl}</p>
        <p>Dieser Link ist 7 Tage gültig.</p>
        <p>Mit freundlichen Grüßen,<br>Das getemergence.com Team</p>
      `,
      content_text: `
Willkommen bei getemergence.com!

Hallo ${userName},

Sie wurden eingeladen, einen Account bei getemergence.com zu erstellen.

Klicken Sie auf den folgenden Link, um Ihr Passwort festzulegen und Ihren Account zu aktivieren:
${inviteUrl}

Dieser Link ist 7 Tage gültig.

Mit freundlichen Grüßen,
Das getemergence.com Team
      `,
      type: 'system',
    });

    return NextResponse.json({
      success: true,
      message: 'Einladung erfolgreich gesendet',
      user: {
        id: newProfile.id,
        email: newProfile.email,
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
