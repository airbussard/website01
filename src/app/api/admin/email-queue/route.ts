import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email/EmailService';
import type { EmailQueueStatus } from '@/types/email';

// =====================================================
// EMAIL QUEUE API
// GET: Queue-Items und Statistiken laden
// =====================================================

/**
 * GET /api/admin/email-queue
 * Queue-Items mit optionalem Status-Filter und Statistiken
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as EmailQueueStatus | null;
    const limit = searchParams.get('limit');
    const statsOnly = searchParams.get('stats') === 'true';

    // Nur Statistiken zurückgeben
    if (statsOnly) {
      const stats = await EmailService.getQueueStats();
      return NextResponse.json({ stats });
    }

    // Queue-Items und Statistiken laden
    const [items, stats] = await Promise.all([
      EmailService.getQueueItems({
        status: status || undefined,
        limit: limit ? Number(limit) : 50,
      }),
      EmailService.getQueueStats(),
    ]);

    return NextResponse.json({ items, stats });
  } catch (error) {
    console.error('[API] email-queue GET Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Queue' },
      { status: 500 }
    );
  }
}
