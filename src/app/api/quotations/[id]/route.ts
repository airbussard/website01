import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  createLexofficeClient,
  LexofficeApiError,
} from '@/lib/lexoffice';
import type { QuotationStatus } from '@/types/dashboard';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/quotations/[id]
 * Ruft ein einzelnes Angebot ab
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabaseClient();

    const { data: quotation, error } = await adminSupabase
      .from('quotations')
      .select(`
        *,
        project:pm_projects(id, name, client_id, organization_id),
        creator:profiles!quotations_created_by_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error || !quotation) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 });
    }

    // Berechtigungspruefung
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      // Pruefen ob User Mitglied des Projekts ist
      const { data: membership } = await adminSupabase
        .from('pm_project_members')
        .select('id')
        .eq('project_id', quotation.project_id)
        .eq('user_id', user.id)
        .single();

      if (!membership) {
        return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
      }
    }

    return NextResponse.json({ quotation });
  } catch (error) {
    console.error('[Quotation] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * PATCH /api/quotations/[id]
 * Aktualisiert ein Angebot
 *
 * Body:
 * - status: QuotationStatus (optional)
 * - title: string (optional)
 * - description: string (optional)
 * - valid_until: string (optional)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Angebot laden
    const { data: existingQuotation, error: loadError } = await adminSupabase
      .from('quotations')
      .select('*')
      .eq('id', id)
      .single();

    if (loadError || !existingQuotation) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 });
    }

    const body = await request.json();
    const { status, title, description, valid_until } = body;

    // Status-Aenderungen mit Timestamps
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updates.status = status;

      // Status-spezifische Timestamps
      if (status === 'sent' && existingQuotation.status === 'draft') {
        updates.sent_at = new Date().toISOString();
      } else if (status === 'accepted') {
        updates.accepted_at = new Date().toISOString();
      } else if (status === 'rejected') {
        updates.rejected_at = new Date().toISOString();
      }
    }

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (valid_until !== undefined) updates.valid_until = valid_until;

    const { data: quotation, error: updateError } = await adminSupabase
      .from('quotations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Quotation] Update error:', updateError);
      return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
    }

    return NextResponse.json({ quotation });
  } catch (error) {
    console.error('[Quotation] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

/**
 * DELETE /api/quotations/[id]
 * Loescht ein Angebot (nur im Draft-Status)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
      return NextResponse.json({ error: 'Nur Admins koennen Angebote loeschen' }, { status: 403 });
    }

    // Angebot laden
    const { data: quotation, error: loadError } = await adminSupabase
      .from('quotations')
      .select('status')
      .eq('id', id)
      .single();

    if (loadError || !quotation) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 });
    }

    // Nur Drafts loeschen
    if (quotation.status !== 'draft') {
      return NextResponse.json(
        { error: 'Nur Entwuerfe koennen geloescht werden' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await adminSupabase
      .from('quotations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Quotation] Delete error:', deleteError);
      return NextResponse.json({ error: 'Fehler beim Loeschen' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Quotation] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
