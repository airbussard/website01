import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/organizations
 * Laedt alle Organisationen (nur fuer Admins)
 */
export async function GET() {
  try {
    // Auth pruefen via NextAuth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    // Alle Organisationen laden
    const organizations = await prisma.organizations.findMany({
      select: { id: true, name: true, slug: true, logo_url: true, city: true, created_at: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('[Admin Organizations API] Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
