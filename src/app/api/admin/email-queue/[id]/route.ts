import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email/EmailService';

// =====================================================
// EMAIL QUEUE ITEM API
// PATCH: Status ändern / Retry
// DELETE: Item löschen
// =====================================================

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/email-queue/[id]
 * Queue-Item aktualisieren (retry, status ändern)
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID erforderlich' },
        { status: 400 }
      );
    }

    // Retry-Aktion
    if (body.action === 'retry') {
      const success = await EmailService.retryQueueItem(id);

      if (!success) {
        return NextResponse.json(
          { error: 'Fehler beim Zurücksetzen' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'E-Mail wird erneut versucht',
      });
    }

    // Status-Update
    if (body.status) {
      const success = await EmailService.updateQueueStatus(id, body.status, {
        error_message: body.error_message,
      });

      if (!success) {
        return NextResponse.json(
          { error: 'Fehler beim Status-Update' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Status aktualisiert',
      });
    }

    return NextResponse.json(
      { error: 'Keine Aktion angegeben' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API] email-queue PATCH Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/email-queue/[id]
 * Queue-Item löschen
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID erforderlich' },
        { status: 400 }
      );
    }

    const success = await EmailService.deleteQueueItem(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Löschen' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'E-Mail aus Queue gelöscht',
    });
  } catch (error) {
    console.error('[API] email-queue DELETE Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen' },
      { status: 500 }
    );
  }
}
