import { NextRequest, NextResponse } from 'next/server';
import { ContactService } from '@/lib/services/contact/ContactService';

// =====================================================
// ANFRAGEN API
// GET: Alle Anfragen laden
// =====================================================

/**
 * GET /api/admin/anfragen
 * Alle Kontaktanfragen laden mit Statistiken
 * Query-Parameter: spam=true fuer Spam-Anfragen
 */
export async function GET(request: NextRequest) {
  try {
    const showSpam = request.nextUrl.searchParams.get('spam') === 'true';

    const [requests, stats] = await Promise.all([
      showSpam ? ContactService.getSpam() : ContactService.getAll(),
      ContactService.getStats(),
    ]);

    return NextResponse.json({ requests, stats });
  } catch (error) {
    console.error('[API] anfragen GET Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Anfragen' },
      { status: 500 }
    );
  }
}
