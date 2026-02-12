import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createLexofficeClient,
  mapToLexofficeContact,
  LexofficeApiError,
} from '@/lib/lexoffice';
import type { Profile, Organization } from '@/types/dashboard';

/**
 * GET /api/lexoffice/contacts
 * Ruft alle gemappten Lexoffice-Kontakte ab
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

    // Rolle pruefen
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    // Lexoffice Contacts laden
    const contacts = await prisma.lexoffice_contacts.findMany({
      include: {
        profiles: {
          select: { id: true, full_name: true, email: true, company: true },
        },
        organizations: {
          select: { id: true, name: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Transform to match expected format
    const transformedContacts = contacts.map(c => ({
      ...c,
      profile: c.profiles,
      organization: c.organizations,
      profiles: undefined,
      organizations: undefined,
    }));

    return NextResponse.json({ contacts: transformedContacts });
  } catch (error) {
    console.error('[Lexoffice Contacts] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/lexoffice/contacts
 * Erstellt oder verknuepft einen Lexoffice-Kontakt
 *
 * Body:
 * - profile_id: UUID (optional) - Profile zu synchronisieren
 * - organization_id: UUID (optional) - Organization zu synchronisieren
 * - force_create: boolean (optional) - Neuen Kontakt erzwingen
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

    // Rolle pruefen
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    // Lexoffice Settings pruefen
    const settings = await prisma.system_settings.findUnique({
      where: { key: 'lexoffice' },
      select: { value: true },
    });

    const lexofficeSettings = settings?.value as {
      is_enabled: boolean;
      api_key: string | null;
    } | null;

    if (!lexofficeSettings?.is_enabled || !lexofficeSettings?.api_key) {
      return NextResponse.json(
        { error: 'Lexoffice ist nicht aktiviert oder API Key fehlt' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { profile_id, organization_id, force_create } = body;

    if (!profile_id && !organization_id) {
      return NextResponse.json(
        { error: 'profile_id oder organization_id erforderlich' },
        { status: 400 }
      );
    }

    // Pruefen ob bereits ein Mapping existiert
    if (!force_create) {
      const existingMapping = await prisma.lexoffice_contacts.findFirst({
        where: profile_id ? { profile_id } : { organization_id },
      });

      if (existingMapping) {
        return NextResponse.json({
          message: 'Kontakt bereits verknuepft',
          mapping: existingMapping,
          already_exists: true,
        });
      }
    }

    // Daten laden
    const contactData: {
      profile?: Profile;
      organization?: Organization;
    } = {};

    if (profile_id) {
      const profileData = await prisma.profiles.findUnique({
        where: { id: profile_id },
      });

      if (!profileData) {
        return NextResponse.json({ error: 'Profile nicht gefunden' }, { status: 404 });
      }
      contactData.profile = profileData as unknown as Profile;
    }

    if (organization_id) {
      const orgData = await prisma.organizations.findUnique({
        where: { id: organization_id },
      });

      if (!orgData) {
        return NextResponse.json(
          { error: 'Organisation nicht gefunden' },
          { status: 404 }
        );
      }
      contactData.organization = orgData as unknown as Organization;
    }

    // Lexoffice Client erstellen
    const lexoffice = createLexofficeClient(lexofficeSettings.api_key);

    // Kontakt in Lexoffice erstellen
    const lexofficeContactData = mapToLexofficeContact(contactData);

    let lexofficeResponse;
    try {
      lexofficeResponse = await lexoffice.createContact(lexofficeContactData);
    } catch (error) {
      if (error instanceof LexofficeApiError) {
        // Log sync error
        await prisma.lexoffice_sync_log.create({
          data: {
            entity_type: 'contact',
            entity_id: profile_id || organization_id,
            action: 'create',
            status: 'failed',
            error_message: error.message,
            request_data: lexofficeContactData as object,
          },
        });

        return NextResponse.json(
          {
            error: `Lexoffice Fehler: ${error.message}`,
            details: error.details,
          },
          { status: error.status }
        );
      }
      throw error;
    }

    // Mapping speichern
    const mapping = await prisma.lexoffice_contacts.create({
      data: {
        profile_id: profile_id || null,
        organization_id: organization_id || null,
        lexoffice_contact_id: lexofficeResponse.id,
      },
    });

    // Log success
    await prisma.lexoffice_sync_log.create({
      data: {
        entity_type: 'contact',
        entity_id: profile_id || organization_id,
        lexoffice_id: lexofficeResponse.id,
        action: 'create',
        status: 'success',
        request_data: lexofficeContactData as object,
        response_data: lexofficeResponse as object,
      },
    });

    return NextResponse.json(
      {
        message: 'Kontakt erfolgreich erstellt',
        mapping,
        lexoffice_id: lexofficeResponse.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Lexoffice Contacts] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * DELETE /api/lexoffice/contacts
 * Entfernt ein Lexoffice-Kontakt-Mapping (loescht NICHT in Lexoffice)
 *
 * Body:
 * - mapping_id: UUID - Mapping zu loeschen
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID nicht gefunden' }, { status: 401 });
    }

    // Rolle pruefen - nur Admin
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Nur Admins koennen Mappings loeschen' }, { status: 403 });
    }

    const body = await request.json();
    const { mapping_id } = body;

    if (!mapping_id) {
      return NextResponse.json({ error: 'mapping_id erforderlich' }, { status: 400 });
    }

    await prisma.lexoffice_contacts.delete({
      where: { id: mapping_id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Lexoffice Contacts] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
