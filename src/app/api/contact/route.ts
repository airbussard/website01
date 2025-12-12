import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EmailService } from '@/lib/services/email/EmailService';
import {
  contactNotificationTemplate,
  contactNotificationTextTemplate,
} from '@/lib/email/templates/notification';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, subject, message, projectType } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // If Supabase is configured, store in database
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
          .from('contact_requests')
          .insert({
            name,
            email,
            company,
            subject,
            message,
            project_type: projectType,
            created_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Supabase error:', error);
        }
      } catch (supabaseError) {
        console.error('Failed to connect to Supabase:', supabaseError);
      }
    }

    // E-Mail zur Queue hinzufügen (statt direktem Versand)
    try {
      const templateData = {
        name,
        email,
        company,
        subject,
        message,
        projectType,
      };

      const queueResult = await EmailService.queueEmail({
        recipient_email: 'hello@getemergence.com',
        subject: `Neue Kontaktanfrage: ${subject}`,
        content_html: contactNotificationTemplate(templateData),
        content_text: contactNotificationTextTemplate(templateData),
        type: 'contact',
        metadata: {
          sender_name: name,
          sender_email: email,
          sender_company: company || null,
          project_type: projectType || null,
        },
      });

      if (!queueResult) {
        console.error('[Contact] Fehler beim Queuen der E-Mail');
      } else {
        console.log('[Contact] E-Mail gequeued:', queueResult.id);
      }
    } catch (emailError) {
      console.error('[Contact] E-Mail Queue Fehler:', emailError);
      // Kein Fehler an Client - Anfrage wurde trotzdem gespeichert
    }

    return NextResponse.json(
      { message: 'Contact request received successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
