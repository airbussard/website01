import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email/EmailService';
import { testConnection } from '@/lib/email/mailer';
import type { UpdateEmailSettings } from '@/types/email';

// =====================================================
// EMAIL SETTINGS API
// GET: Einstellungen laden
// PUT: Einstellungen aktualisieren
// POST: SMTP-Verbindung testen
// =====================================================

/**
 * GET /api/admin/email-settings
 * Aktuelle E-Mail-Einstellungen laden
 */
export async function GET() {
  try {
    const settings = await EmailService.getSettings();

    if (!settings) {
      return NextResponse.json(
        { error: 'Keine E-Mail-Einstellungen gefunden' },
        { status: 404 }
      );
    }

    // Passwörter nicht im Response zurückgeben (nur Sternchen)
    const safeSettings = {
      ...settings,
      smtp_password: settings.smtp_password ? '********' : '',
      imap_password: settings.imap_password ? '********' : '',
    };

    return NextResponse.json(safeSettings);
  } catch (error) {
    console.error('[API] email-settings GET Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Einstellungen' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/email-settings
 * E-Mail-Einstellungen aktualisieren
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Validierung
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Ungültige Anfrage' },
        { status: 400 }
      );
    }

    // Nur erlaubte Felder extrahieren
    const updateData: UpdateEmailSettings = {};

    if (body.smtp_host !== undefined) updateData.smtp_host = body.smtp_host;
    if (body.smtp_port !== undefined) updateData.smtp_port = Number(body.smtp_port);
    if (body.smtp_user !== undefined) updateData.smtp_user = body.smtp_user;
    // Passwort nur aktualisieren wenn es nicht die Sternchen sind
    if (body.smtp_password !== undefined && body.smtp_password !== '********') {
      updateData.smtp_password = body.smtp_password;
    }
    if (body.imap_host !== undefined) updateData.imap_host = body.imap_host || null;
    if (body.imap_port !== undefined) updateData.imap_port = body.imap_port ? Number(body.imap_port) : null;
    if (body.imap_user !== undefined) updateData.imap_user = body.imap_user || null;
    // IMAP Passwort nur aktualisieren wenn es nicht die Sternchen sind
    if (body.imap_password !== undefined && body.imap_password !== '********') {
      updateData.imap_password = body.imap_password;
    }
    if (body.from_email !== undefined) updateData.from_email = body.from_email;
    if (body.from_name !== undefined) updateData.from_name = body.from_name;
    if (body.is_active !== undefined) updateData.is_active = Boolean(body.is_active);

    const success = await EmailService.updateSettings(updateData);

    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Einstellungen' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Einstellungen gespeichert' });
  } catch (error) {
    console.error('[API] email-settings PUT Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Einstellungen' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/email-settings
 * SMTP-Verbindung testen
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Wenn Test-Daten übergeben werden, diese verwenden
    // Ansonsten aktuelle Einstellungen aus DB laden
    let settings = await EmailService.getSettings();

    if (!settings) {
      return NextResponse.json(
        { error: 'Keine E-Mail-Einstellungen gefunden' },
        { status: 404 }
      );
    }

    // Temporäre Überschreibung mit Test-Daten (falls vorhanden)
    if (body.smtp_host) settings = { ...settings, smtp_host: body.smtp_host };
    if (body.smtp_port) settings = { ...settings, smtp_port: Number(body.smtp_port) };
    if (body.smtp_user) settings = { ...settings, smtp_user: body.smtp_user };
    if (body.smtp_password && body.smtp_password !== '********') {
      settings = { ...settings, smtp_password: body.smtp_password };
    }

    const result = await testConnection(settings);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'SMTP-Verbindung erfolgreich',
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Verbindung fehlgeschlagen',
      });
    }
  } catch (error) {
    console.error('[API] email-settings POST Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Testen der Verbindung' },
      { status: 500 }
    );
  }
}
