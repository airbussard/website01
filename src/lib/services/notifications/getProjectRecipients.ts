// =====================================================
// PROJECT RECIPIENTS HELPER
// Holt alle Empfaenger fuer Projekt-Benachrichtigungen
// =====================================================

import { prisma } from '@/lib/prisma';

export interface ProjectRecipient {
  email: string;
  name: string;
  userId: string;
}

/**
 * Holt alle Empfaenger fuer ein Projekt:
 * - Wenn client_id gesetzt: Der Client
 * - Wenn organization_id gesetzt: Alle Organisations-Mitglieder
 * - Duplikate werden entfernt
 */
export async function getProjectRecipients(projectId: string): Promise<ProjectRecipient[]> {
  const recipients: ProjectRecipient[] = [];
  const seenUserIds = new Set<string>();

  try {
    // 1. Projekt laden mit client_id und organization_id
    const project = await prisma.pm_projects.findUnique({
      where: { id: projectId },
      select: { client_id: true, organization_id: true },
    });

    if (!project) {
      console.error('[getProjectRecipients] Projekt nicht gefunden');
      return [];
    }

    // 2. Wenn client_id gesetzt: Client-Profil laden
    if (project.client_id) {
      const clientProfile = await prisma.profiles.findUnique({
        where: { id: project.client_id },
        select: { id: true, email: true, full_name: true, first_name: true, last_name: true },
      });

      if (clientProfile && clientProfile.email) {
        const name = clientProfile.full_name ||
          [clientProfile.first_name, clientProfile.last_name].filter(Boolean).join(' ') ||
          'Kunde';

        recipients.push({
          email: clientProfile.email,
          name,
          userId: clientProfile.id,
        });
        seenUserIds.add(clientProfile.id);
      }
    }

    // 3. Wenn organization_id gesetzt: Alle Mitglieder laden
    if (project.organization_id) {
      const members = await prisma.organization_members.findMany({
        where: { organization_id: project.organization_id },
        include: {
          profiles: {
            select: { id: true, email: true, full_name: true, first_name: true, last_name: true },
          },
        },
      });

      for (const member of members) {
        const user = member.profiles;

        if (user && user.email && !seenUserIds.has(user.id)) {
          const name = user.full_name ||
            [user.first_name, user.last_name].filter(Boolean).join(' ') ||
            'Kunde';

          recipients.push({
            email: user.email,
            name,
            userId: user.id,
          });
          seenUserIds.add(user.id);
        }
      }
    }

    console.log(`[getProjectRecipients] ${recipients.length} Empfaenger fuer Projekt ${projectId} gefunden`);
    return recipients;

  } catch (err) {
    console.error('[getProjectRecipients] Fehler:', err);
    return [];
  }
}
