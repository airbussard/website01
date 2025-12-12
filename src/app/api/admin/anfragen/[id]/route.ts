import { NextResponse } from 'next/server';
import { ContactService } from '@/lib/services/contact/ContactService';

// =====================================================
// EINZELNE ANFRAGE API
// GET: Anfrage laden
// DELETE: Anfrage löschen
// =====================================================

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/anfragen/[id]
 * Einzelne Anfrage mit Nachrichten laden
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const [contactRequest, messages] = await Promise.all([
      ContactService.getById(id),
      ContactService.getMessages(id),
    ]);

    if (!contactRequest) {
      return NextResponse.json(
        { error: 'Anfrage nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ request: contactRequest, messages });
  } catch (error) {
    console.error('[API] anfragen/[id] GET Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Anfrage' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/anfragen/[id]
 * Anfrage löschen
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const success = await ContactService.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Löschen' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Anfrage gelöscht' });
  } catch (error) {
    console.error('[API] anfragen/[id] DELETE Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen' },
      { status: 500 }
    );
  }
}
