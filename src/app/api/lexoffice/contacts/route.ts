import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
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
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Rolle pruefen
    const adminSupabase = createAdminSupabaseClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    // Lexoffice Contacts laden
    const { data: contacts, error } = await adminSupabase
      .from('lexoffice_contacts')
      .select(`
        *,
        profile:profiles(id, full_name, email, company),
        organization:organizations(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Lexoffice Contacts] Load error:', error);
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }

    return NextResponse.json({ contacts });
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
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Rolle pruefen
    const adminSupabase = createAdminSupabaseClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    // Lexoffice Settings pruefen
    const { data: settings } = await adminSupabase
      .from('system_settings')
      .select('value')
      .eq('key', 'lexoffice')
      .single();

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
      const { data: existingMapping } = await adminSupabase
        .from('lexoffice_contacts')
        .select('*')
        .or(
          profile_id
            ? `profile_id.eq.${profile_id}`
            : `organization_id.eq.${organization_id}`
        )
        .single();

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
      const { data: profileData, error: profileError } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', profile_id)
        .single();

      if (profileError || !profileData) {
        return NextResponse.json({ error: 'Profile nicht gefunden' }, { status: 404 });
      }
      contactData.profile = profileData as Profile;
    }

    if (organization_id) {
      const { data: orgData, error: orgError } = await adminSupabase
        .from('organizations')
        .select('*')
        .eq('id', organization_id)
        .single();

      if (orgError || !orgData) {
        return NextResponse.json(
          { error: 'Organisation nicht gefunden' },
          { status: 404 }
        );
      }
      contactData.organization = orgData as Organization;
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
        await adminSupabase.from('lexoffice_sync_log').insert({
          entity_type: 'contact',
          entity_id: profile_id || organization_id,
          action: 'create',
          status: 'failed',
          error_message: error.message,
          request_data: lexofficeContactData,
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
    const { data: mapping, error: mappingError } = await adminSupabase
      .from('lexoffice_contacts')
      .insert({
        profile_id: profile_id || null,
        organization_id: organization_id || null,
        lexoffice_contact_id: lexofficeResponse.id,
      })
      .select()
      .single();

    if (mappingError) {
      console.error('[Lexoffice Contacts] Mapping error:', mappingError);
      // Kontakt wurde erstellt, aber Mapping fehlgeschlagen
      return NextResponse.json(
        {
          error: 'Kontakt erstellt, aber Mapping fehlgeschlagen',
          lexoffice_id: lexofficeResponse.id,
        },
        { status: 500 }
      );
    }

    // Log success
    await adminSupabase.from('lexoffice_sync_log').insert({
      entity_type: 'contact',
      entity_id: profile_id || organization_id,
      lexoffice_id: lexofficeResponse.id,
      action: 'create',
      status: 'success',
      request_data: lexofficeContactData,
      response_data: lexofficeResponse,
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
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Rolle pruefen - nur Admin
    const adminSupabase = createAdminSupabaseClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Nur Admins koennen Mappings loeschen' }, { status: 403 });
    }

    const body = await request.json();
    const { mapping_id } = body;

    if (!mapping_id) {
      return NextResponse.json({ error: 'mapping_id erforderlich' }, { status: 400 });
    }

    const { error } = await adminSupabase
      .from('lexoffice_contacts')
      .delete()
      .eq('id', mapping_id);

    if (error) {
      console.error('[Lexoffice Contacts] Delete error:', error);
      return NextResponse.json({ error: 'Fehler beim Loeschen' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Lexoffice Contacts] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
