import { NextResponse } from 'next/server';
import { ContactService } from '@/lib/services/contact/ContactService';

// =====================================================
// NOTES UPDATE API
// PATCH: Notizen speichern
// =====================================================

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/anfragen/[id]/notes
 * Interne Notizen aktualisieren
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { notes } = body;

    if (notes === undefined) {
      return NextResponse.json(
        { error: 'Notizen erforderlich' },
        { status: 400 }
      );
    }

    const success = await ContactService.updateNotes(id, notes || '');

    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Notizen' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Notizen gespeichert' });
  } catch (error) {
    console.error('[API] anfragen/[id]/notes PATCH Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Notizen' },
      { status: 500 }
    );
  }
}
