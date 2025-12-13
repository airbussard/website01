import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/users/[id]
 * Aktualisiert das Profil eines Benutzers
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
      role,
    } = body;

    const supabase = createAdminSupabaseClient();

    // Nur definierte Felder updaten
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (company !== undefined) updateData.company = company;
    if (phone !== undefined) updateData.phone = phone;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (street !== undefined) updateData.street = street;
    if (postal_code !== undefined) updateData.postal_code = postal_code;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (company_street !== undefined) updateData.company_street = company_street;
    if (company_postal_code !== undefined) updateData.company_postal_code = company_postal_code;
    if (company_city !== undefined) updateData.company_city = company_city;
    if (company_country !== undefined) updateData.company_country = company_country;
    if (role !== undefined) updateData.role = role;

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Users API] Update error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Profils' },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error('[Users API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Löscht einen Benutzer (Auth + Profile)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const supabase = createAdminSupabaseClient();

    // Zuerst Profil löschen (cascade sollte dies automatisch machen, aber sicherheitshalber)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (profileError) {
      console.error('[Users API] Profile delete error:', profileError);
      // Fortfahren, da der Auth-User wichtiger ist
    }

    // Auth-User löschen via Admin API
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      console.error('[Users API] Auth delete error:', authError);
      return NextResponse.json(
        { error: 'Fehler beim Löschen des Benutzers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Users API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
