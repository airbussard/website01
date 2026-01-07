import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  createLexofficeClient,
  mapToLexofficeQuotation,
  LexofficeApiError,
  calculateTotalsFromLineItems,
} from '@/lib/lexoffice';
import type { InvoiceLineItem } from '@/types/dashboard';

/**
 * GET /api/quotations
 * Ruft alle Angebote ab (gefiltert nach Berechtigung)
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

    const adminSupabase = createAdminSupabaseClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let query = adminSupabase
      .from('quotations')
      .select(`
        *,
        project:pm_projects(id, name, client_id),
        creator:profiles!quotations_created_by_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    // Filter nach Projekt wenn angegeben
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    // Normale User sehen nur Angebote ihrer Projekte
    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      // Projekte finden, bei denen der User Mitglied ist
      const { data: memberProjects } = await adminSupabase
        .from('pm_project_members')
        .select('project_id')
        .eq('user_id', user.id);

      const projectIds = memberProjects?.map((p) => p.project_id) || [];

      if (projectIds.length > 0) {
        query = query.in('project_id', projectIds);
      } else {
        // Keine Projekte = keine Angebote
        return NextResponse.json({ quotations: [] });
      }
    }

    const { data: quotations, error } = await query;

    if (error) {
      console.error('[Quotations] Load error:', error);
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }

    return NextResponse.json({ quotations });
  } catch (error) {
    console.error('[Quotations] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/quotations
 * Erstellt ein neues Angebot (lokal + optional Lexoffice)
 *
 * Body:
 * - project_id: UUID (required)
 * - title: string (required)
 * - description: string (optional)
 * - line_items: InvoiceLineItem[] (required)
 * - valid_until: string (optional) - ISO date
 * - sync_to_lexoffice: boolean (optional) - Default true wenn Lexoffice aktiv
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

    const body = await request.json();
    const {
      project_id,
      title,
      description,
      line_items,
      valid_until,
      sync_to_lexoffice = true,
    } = body;

    // Validierung
    if (!project_id || !title || !line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return NextResponse.json(
        { error: 'project_id, title und line_items sind erforderlich' },
        { status: 400 }
      );
    }

    // Projekt pruefen
    const { data: project, error: projectError } = await adminSupabase
      .from('pm_projects')
      .select('id, name, client_id, organization_id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 });
    }

    // Totals berechnen
    const typedLineItems = line_items as InvoiceLineItem[];
    const totals = calculateTotalsFromLineItems(typedLineItems);

    // Angebotsnummer generieren
    const year = new Date().getFullYear();
    const { count } = await adminSupabase
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01`)
      .lt('created_at', `${year + 1}-01-01`);

    const quotationNumber = `ANG-${year}-${String((count || 0) + 1).padStart(4, '0')}`;

    // Angebot lokal erstellen
    const { data: quotation, error: insertError } = await adminSupabase
      .from('quotations')
      .insert({
        project_id,
        quotation_number: quotationNumber,
        title,
        description,
        line_items: typedLineItems,
        net_amount: totals.net_amount,
        tax_amount: totals.tax_amount,
        total_amount: totals.total_amount,
        currency: 'EUR',
        status: 'draft',
        valid_until: valid_until || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Quotations] Insert error:', insertError);
      return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 });
    }

    // Lexoffice Sync wenn aktiviert
    let lexofficeId: string | null = null;
    let lexofficeError: string | null = null;

    if (sync_to_lexoffice) {
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

      if (lexofficeSettings?.is_enabled && lexofficeSettings?.api_key) {
        try {
          // Kontakt-Mapping finden
          let contactId: string | null = null;

          if (project.client_id) {
            const { data: contactMapping } = await adminSupabase
              .from('lexoffice_contacts')
              .select('lexoffice_contact_id')
              .eq('profile_id', project.client_id)
              .single();

            contactId = contactMapping?.lexoffice_contact_id || null;
          } else if (project.organization_id) {
            const { data: contactMapping } = await adminSupabase
              .from('lexoffice_contacts')
              .select('lexoffice_contact_id')
              .eq('organization_id', project.organization_id)
              .single();

            contactId = contactMapping?.lexoffice_contact_id || null;
          }

          if (contactId) {
            const lexoffice = createLexofficeClient(lexofficeSettings.api_key);
            const lexofficeData = mapToLexofficeQuotation({
              quotation: { title, description, valid_until },
              lexofficeContactId: contactId,
              lineItems: typedLineItems,
            });

            const response = await lexoffice.createQuotation(lexofficeData);
            lexofficeId = response.id;

            // Quotation mit Lexoffice ID updaten
            await adminSupabase
              .from('quotations')
              .update({
                lexoffice_id: lexofficeId,
                synced_at: new Date().toISOString(),
              })
              .eq('id', quotation.id);

            // Sync Log
            await adminSupabase.from('lexoffice_sync_log').insert({
              entity_type: 'quotation',
              entity_id: quotation.id,
              lexoffice_id: lexofficeId,
              action: 'create',
              status: 'success',
              request_data: lexofficeData,
              response_data: response,
            });
          } else {
            lexofficeError = 'Kein Lexoffice-Kontakt fuer dieses Projekt gefunden';
          }
        } catch (error) {
          if (error instanceof LexofficeApiError) {
            lexofficeError = error.message;
            await adminSupabase.from('lexoffice_sync_log').insert({
              entity_type: 'quotation',
              entity_id: quotation.id,
              action: 'create',
              status: 'failed',
              error_message: error.message,
            });
          } else {
            lexofficeError = 'Unbekannter Lexoffice-Fehler';
          }
        }
      }
    }

    return NextResponse.json(
      {
        quotation: {
          ...quotation,
          lexoffice_id: lexofficeId,
        },
        lexoffice_synced: !!lexofficeId,
        lexoffice_error: lexofficeError,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Quotations] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
