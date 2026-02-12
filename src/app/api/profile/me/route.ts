import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * GET /api/profile/me
 * Ruft das Profil des aktuellen Users ab
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID nicht gefunden' }, { status: 401 });
    }

    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profil nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[Profile API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * PATCH /api/profile/me
 * Aktualisiert das Profil des aktuellen Users
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID nicht gefunden' }, { status: 401 });
    }

    const body = await request.json();
    const {
      first_name,
      last_name,
      company,
      phone,
      mobile,
      street,
      postal_code,
      city,
      country,
      company_street,
      company_postal_code,
      company_city,
      company_country,
      settings,
    } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };

    // Nur übergebene Felder aktualisieren
    if (first_name !== undefined) updateData.first_name = first_name || null;
    if (last_name !== undefined) updateData.last_name = last_name || null;
    if (company !== undefined) updateData.company = company || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (mobile !== undefined) updateData.mobile = mobile || null;
    if (street !== undefined) updateData.street = street || null;
    if (postal_code !== undefined) updateData.postal_code = postal_code || null;
    if (city !== undefined) updateData.city = city || null;
    if (country !== undefined) updateData.country = country || null;
    if (company_street !== undefined) updateData.company_street = company_street || null;
    if (company_postal_code !== undefined) updateData.company_postal_code = company_postal_code || null;
    if (company_city !== undefined) updateData.company_city = company_city || null;
    if (company_country !== undefined) updateData.company_country = company_country || null;
    if (settings !== undefined) updateData.settings = settings;

    const updatedProfile = await prisma.profiles.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('[Profile API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/profile/me
 * Spezielle Aktionen: password-change
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID nicht gefunden' }, { status: 401 });
    }

    const body = await request.json();
    const { action, current_password, new_password } = body;

    if (action === 'change-password') {
      // Validierung
      if (!new_password || new_password.length < 8) {
        return NextResponse.json(
          { error: 'Das neue Passwort muss mindestens 8 Zeichen lang sein' },
          { status: 400 }
        );
      }

      // Aktuelles Profil laden
      const profile = await prisma.profiles.findUnique({
        where: { id: userId },
        select: { password_hash: true },
      });

      if (!profile) {
        return NextResponse.json({ error: 'Profil nicht gefunden' }, { status: 404 });
      }

      // Aktuelles Passwort prüfen (wenn vorhanden)
      if (profile.password_hash && current_password) {
        const isValid = await bcrypt.compare(current_password, profile.password_hash);
        if (!isValid) {
          return NextResponse.json({ error: 'Aktuelles Passwort ist falsch' }, { status: 400 });
        }
      }

      // Neues Passwort hashen
      const hashedPassword = await bcrypt.hash(new_password, 12);

      // Passwort aktualisieren
      await prisma.profiles.update({
        where: { id: userId },
        data: {
          password_hash: hashedPassword,
          updated_at: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: 'Passwort erfolgreich geändert' });
    }

    return NextResponse.json({ error: 'Ungültige Aktion' }, { status: 400 });
  } catch (error) {
    console.error('[Profile API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
