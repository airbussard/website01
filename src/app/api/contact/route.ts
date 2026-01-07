import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EmailService } from '@/lib/services/email/EmailService';
import {
  contactNotificationTemplate,
  contactNotificationTextTemplate,
} from '@/lib/email/templates/notification';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting: 5 Anfragen pro Minute pro IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitResult = rateLimit(ip, 5, 60000);

    if (!rateLimitResult.success) {
      console.log(`[Contact] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: 'Zu viele Anfragen. Bitte versuchen Sie es spaeter erneut.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimitResult.resetIn / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { name, email, company, subject, message, projectType, website } = body;

    // Honeypot-Check: Wenn 'website' gefuellt ist, ist es ein Bot
    const isSpam = !!website;

    if (isSpam) {
      console.log(`[Contact] Bot detected via honeypot (IP: ${ip})`);
    }

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

    // In Supabase speichern (inkl. Spam-Flag)
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
            is_spam: isSpam,
            created_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Supabase error:', error);
        }
      } catch (supabaseError) {
        console.error('Failed to connect to Supabase:', supabaseError);
      }
    }

    // Bei Spam: Keine E-Mail senden, aber Success zurueckgeben (Bot merkt nichts)
    if (isSpam) {
      return NextResponse.json(
        { message: 'Contact request received successfully' },
        { status: 200 }
      );
    }

    // Nur bei echten Anfragen: E-Mail zur Queue hinzufuegen
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
