import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { EmailService } from '@/lib/services/email/EmailService';
import { getProjectRecipients } from '@/lib/services/notifications/getProjectRecipients';
import {
  projectUpdateTemplate,
  projectUpdateTextTemplate,
} from '@/lib/email/templates/project-notifications';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://oscarknabe.de';

/**
 * POST /api/progress-updates
 * Erstellt ein neues Progress Update und sendet Email-Benachrichtigungen
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Rolle pruefen
    const adminSupabase = createAdminSupabaseClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Keine Berechtigung - nur Manager/Admin' },
        { status: 403 }
      );
    }

    // Request Body parsen
    const body = await request.json();
    const {
      project_id,
      title,
      content,
      progress_percentage,
      is_public,
      images,
      attachments,
    } = body;

    // Validierung
    if (!project_id || !title?.trim()) {
      return NextResponse.json(
        { error: 'project_id und title sind erforderlich' },
        { status: 400 }
      );
    }

    // Projekt laden fuer Projektname
    const { data: project, error: projectError } = await adminSupabase
      .from('pm_projects')
      .select('id, name')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    // Update erstellen
    const updateData = {
      project_id,
      title: title.trim(),
      content: content?.trim() || null,
      author_id: user.id,
      progress_percentage: progress_percentage ? parseInt(progress_percentage) : null,
      is_public: is_public ?? true,
      images: images || [],
      attachments: attachments || [],
      created_at: new Date().toISOString(),
    };

    const { data: update, error: insertError } = await adminSupabase
      .from('progress_updates')
      .insert(updateData)
      .select()
      .single();

    if (insertError) {
      console.error('[Progress Updates API] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Fehler beim Erstellen des Updates' },
        { status: 500 }
      );
    }

    // Activity Log
    await adminSupabase.from('activity_log').insert({
      project_id,
      user_id: user.id,
      action: 'progress_update_created',
      entity_type: 'progress_update',
      entity_id: update.id,
      details: { title: title.trim(), is_public: is_public ?? true },
    });

    // Email-Benachrichtigungen nur bei oeffentlichen Updates
    if (is_public) {
      try {
        const recipients = await getProjectRecipients(project_id);
        const dashboardUrl = `${BASE_URL}/dashboard/projects/${project_id}`;

        for (const recipient of recipients) {
          await EmailService.queueEmail({
            recipient_email: recipient.email,
            recipient_name: recipient.name,
            subject: `Neues Update: ${project.name}`,
            content_html: projectUpdateTemplate({
              recipientName: recipient.name,
              projectName: project.name,
              updateTitle: title.trim(),
              updateContent: content?.trim(),
              progressPercentage: progress_percentage ? parseInt(progress_percentage) : undefined,
              dashboardUrl,
            }),
            content_text: projectUpdateTextTemplate({
              recipientName: recipient.name,
              projectName: project.name,
              updateTitle: title.trim(),
              updateContent: content?.trim(),
              progressPercentage: progress_percentage ? parseInt(progress_percentage) : undefined,
              dashboardUrl,
            }),
            type: 'project-update',
            metadata: {
              project_id,
              update_id: update.id,
            },
          });
        }

        console.log(`[Progress Updates API] ${recipients.length} Email(s) gequeued`);
      } catch (emailError) {
        // Email-Fehler loggen aber nicht die Response blockieren
        console.error('[Progress Updates API] Email error:', emailError);
      }
    }

    return NextResponse.json({ update }, { status: 201 });

  } catch (error) {
    console.error('[Progress Updates API] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
