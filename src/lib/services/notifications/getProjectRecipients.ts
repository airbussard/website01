// =====================================================
// PROJECT RECIPIENTS HELPER
// Holt alle Empfaenger fuer Projekt-Benachrichtigungen
// =====================================================

import { createAdminSupabaseClient } from '@/lib/supabase/admin';

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
  const supabase = createAdminSupabaseClient();
  const recipients: ProjectRecipient[] = [];
  const seenUserIds = new Set<string>();

  try {
    // 1. Projekt laden mit client_id und organization_id
    const { data: project, error: projectError } = await supabase
      .from('pm_projects')
      .select('client_id, organization_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('[getProjectRecipients] Projekt nicht gefunden:', projectError);
      return [];
    }

    // 2. Wenn client_id gesetzt: Client-Profil laden
    if (project.client_id) {
      const { data: clientProfile, error: clientError } = await supabase
        .from('profiles')
        .select('id, email, full_name, first_name, last_name')
        .eq('id', project.client_id)
        .single();

      if (!clientError && clientProfile && clientProfile.email) {
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
      const { data: members, error: membersError } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          user:profiles(id, email, full_name, first_name, last_name)
        `)
        .eq('organization_id', project.organization_id);

      if (!membersError && members) {
        for (const member of members) {
          // Supabase gibt bei 1:1 Beziehungen ein Objekt zurueck, bei 1:n ein Array
          const userRecord = member.user;
          const user = Array.isArray(userRecord) ? userRecord[0] : userRecord;

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
    }

    console.log(`[getProjectRecipients] ${recipients.length} Empfaenger fuer Projekt ${projectId} gefunden`);
    return recipients;

  } catch (err) {
    console.error('[getProjectRecipients] Fehler:', err);
    return [];
  }
}
