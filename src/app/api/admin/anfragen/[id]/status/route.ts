import { NextResponse } from 'next/server';
import { ContactService } from '@/lib/services/contact/ContactService';
import type { ContactRequestStatus } from '@/types/contact';

// =====================================================
// STATUS UPDATE API
// PATCH: Status ändern
// =====================================================

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: ContactRequestStatus[] = ['neu', 'in_bearbeitung', 'erledigt'];

/**
 * PATCH /api/admin/anfragen/[id]/status
 * Status einer Anfrage aktualisieren
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validierung
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Ungültiger Status' },
        { status: 400 }
      );
    }

    const success = await ContactService.updateStatus(id, status);

    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Status-Update' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Status aktualisiert' });
  } catch (error) {
    console.error('[API] anfragen/[id]/status PATCH Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Status-Update' },
      { status: 500 }
    );
  }
}
