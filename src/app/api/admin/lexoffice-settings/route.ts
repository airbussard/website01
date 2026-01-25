import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLexofficeClient } from '@/lib/lexoffice';

/**
 * GET /api/admin/lexoffice-settings
 * Ruft die Lexoffice-Einstellungen ab
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Nur Admins' }, { status: 403 });
    }

    // Settings laden
    const settings = await prisma.system_settings.findUnique({
      where: { key: 'lexoffice' },
      select: { value: true, updated_at: true },
    });

    const lexofficeSettings = settings?.value as {
      is_enabled: boolean;
      api_key: string | null;
    } | null;

    // API Key maskieren
    const maskedApiKey = lexofficeSettings?.api_key
      ? `${lexofficeSettings.api_key.substring(0, 8)}...${lexofficeSettings.api_key.substring(lexofficeSettings.api_key.length - 4)}`
      : null;

    return NextResponse.json({
      settings: {
        is_enabled: lexofficeSettings?.is_enabled ?? false,
        api_key_set: !!lexofficeSettings?.api_key,
        api_key_masked: maskedApiKey,
      },
      updated_at: settings?.updated_at || null,
    });
  } catch (error) {
    console.error('[Lexoffice Settings] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/lexoffice-settings
 * Aktualisiert die Lexoffice-Einstellungen
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Nur Admins' }, { status: 403 });
    }

    const body = await request.json();
    const { is_enabled, api_key } = body;

    // Aktuelle Settings laden
    const currentSettings = await prisma.system_settings.findUnique({
      where: { key: 'lexoffice' },
      select: { value: true },
    });

    const currentValue = (currentSettings?.value as {
      is_enabled: boolean;
      api_key: string | null;
    }) || { is_enabled: false, api_key: null };

    // Updates zusammenfuehren
    const newValue = {
      is_enabled: is_enabled !== undefined ? is_enabled : currentValue.is_enabled,
      api_key: api_key !== undefined ? api_key : currentValue.api_key,
    };

    // Upsert
    await prisma.system_settings.upsert({
      where: { key: 'lexoffice' },
      create: {
        key: 'lexoffice',
        value: newValue,
        updated_at: new Date(),
      },
      update: {
        value: newValue,
        updated_at: new Date(),
      },
    });

    // API Key maskieren fuer Response
    const maskedApiKey = newValue.api_key
      ? `${newValue.api_key.substring(0, 8)}...${newValue.api_key.substring(newValue.api_key.length - 4)}`
      : null;

    return NextResponse.json({
      success: true,
      settings: {
        is_enabled: newValue.is_enabled,
        api_key_set: !!newValue.api_key,
        api_key_masked: maskedApiKey,
      },
    });
  } catch (error) {
    console.error('[Lexoffice Settings] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/admin/lexoffice-settings
 * Testet die Lexoffice-Verbindung
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Nur Admins' }, { status: 403 });
    }

    // Settings laden
    const settings = await prisma.system_settings.findUnique({
      where: { key: 'lexoffice' },
      select: { value: true },
    });

    const lexofficeSettings = settings?.value as {
      is_enabled: boolean;
      api_key: string | null;
    } | null;

    if (!lexofficeSettings?.api_key) {
      return NextResponse.json(
        { success: false, error: 'Kein API Key konfiguriert' },
        { status: 400 }
      );
    }

    // Verbindung testen
    const lexoffice = createLexofficeClient(lexofficeSettings.api_key);
    const connected = await lexoffice.testConnection();

    if (connected) {
      return NextResponse.json({ success: true, message: 'Verbindung erfolgreich' });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Verbindung fehlgeschlagen - API Key ungueltig oder API nicht erreichbar',
      });
    }
  } catch (error) {
    console.error('[Lexoffice Settings] Test error:', error);
    return NextResponse.json({ success: false, error: 'Verbindungstest fehlgeschlagen' });
  }
}
