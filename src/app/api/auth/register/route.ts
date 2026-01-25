import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rateLimit';
import { randomUUID } from 'crypto';

/**
 * POST /api/auth/register
 * Registriert einen neuen Benutzer mit Prisma
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
        message: 'Registrierung erfolgreich.',
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

    // Pruefen ob E-Mail bereits existiert
    const existingUser = await prisma.profiles.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse ist bereits registriert' },
        { status: 400 }
      );
    }

    // Passwort hashen
    const passwordHash = await bcrypt.hash(password, 12);

    // Benutzer erstellen
    await prisma.profiles.create({
      data: {
        id: randomUUID(),
        email: email.toLowerCase(),
        full_name: fullName || null,
        company: company || null,
        password_hash: passwordHash,
        role: 'user',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Registrierung erfolgreich. Sie koennen sich jetzt anmelden.',
    });

  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
