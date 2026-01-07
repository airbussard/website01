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
 * PATCH /api/admin/anfragen/[id]
 * Anfrage aktualisieren (z.B. als Nicht-Spam markieren)
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Als Nicht-Spam markieren
    if (body.action === 'mark_not_spam') {
      const success = await ContactService.markAsNotSpam(id);

      if (!success) {
        return NextResponse.json(
          { error: 'Fehler beim Markieren als Nicht-Spam' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: 'Als Nicht-Spam markiert' });
    }

    return NextResponse.json(
      { error: 'Unbekannte Aktion' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API] anfragen/[id] PATCH Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/anfragen/[id]
 * Anfrage loeschen
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const success = await ContactService.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Loeschen' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Anfrage geloescht' });
  } catch (error) {
    console.error('[API] anfragen/[id] DELETE Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Loeschen' },
      { status: 500 }
    );
  }
}
