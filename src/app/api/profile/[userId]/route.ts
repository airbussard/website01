import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID fehlt' },
        { status: 400 }
      );
    }

    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        full_name: true,
        avatar_url: true,
        role: true,
        company: true,
        phone: true,
        mobile: true,
        street: true,
        postal_code: true,
        city: true,
        country: true,
        company_street: true,
        company_postal_code: true,
        company_city: true,
        company_country: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('[API] Fehler beim Laden des Profils:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
