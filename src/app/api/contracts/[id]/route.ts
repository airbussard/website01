import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/contracts/[id]
 * Einzelnen Vertrag laden
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const contract = await prisma.contracts.findUnique({
      where: { id },
      include: {
        pm_projects: {
          select: { id: true, name: true, client_id: true, manager_id: true },
        },
        profiles_contracts_signed_byToprofiles: {
          select: { id: true, email: true, first_name: true, last_name: true },
        },
        profiles_contracts_created_byToprofiles: {
          select: { id: true, email: true, first_name: true, last_name: true },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Vertrag nicht gefunden' },
        { status: 404 }
      );
    }

    // Transform to match expected format
    const transformedContract = {
      ...contract,
      project: contract.pm_projects,
      signer: contract.profiles_contracts_signed_byToprofiles,
      creator: contract.profiles_contracts_created_byToprofiles,
      pm_projects: undefined,
      profiles_contracts_signed_byToprofiles: undefined,
      profiles_contracts_created_byToprofiles: undefined,
    };

    return NextResponse.json({ contract: transformedContract });
  } catch (error) {
    console.error('[Contracts API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/contracts/[id]
 * Vertrag aktualisieren (nur Manager/Admin)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, valid_until, status } = body;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID nicht gefunden' },
        { status: 401 }
      );
    }

    // Rolle pruefen
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || !['manager', 'admin'].includes(profile.role || '')) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (valid_until !== undefined) updateData.valid_until = valid_until ? new Date(valid_until) : null;
    if (status !== undefined) updateData.status = status;

    const contract = await prisma.contracts.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ contract });
  } catch (error) {
    console.error('[Contracts API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contracts/[id]
 * Vertrag loeschen (nur Admin)
 *
 * NOTE: Storage cleanup deaktiviert bis Phase 6 Storage Migration
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID nicht gefunden' },
        { status: 401 }
      );
    }

    // Nur Admin kann loeschen
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Keine Berechtigung - nur Admin' },
        { status: 403 }
      );
    }

    // Vertrag laden
    const contract = await prisma.contracts.findUnique({
      where: { id },
      select: { original_pdf_path: true, signed_pdf_path: true, project_id: true },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Vertrag nicht gefunden' },
        { status: 404 }
      );
    }

    // TODO: Phase 6 Storage Migration - PDFs aus lokalem Storage loeschen
    console.log('[Contracts API] PDF Cleanup deaktiviert - Storage Migration pending');

    // Vertrag loeschen
    await prisma.contracts.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contracts API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
