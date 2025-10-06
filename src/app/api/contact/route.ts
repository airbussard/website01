import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

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
          // Don't fail the request if Supabase fails
          // You could implement email fallback here
        }
      } catch (supabaseError) {
        console.error('Failed to connect to Supabase:', supabaseError);
        // Continue without database storage
      }
    }

    // Send email notification via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: 'onboarding@resend.dev', // This is the verified sender from Resend
          to: 'hello@getemergence.com',
          subject: `Neue Kontaktanfrage: ${subject}`,
          html: `
            <h2>Neue Kontaktanfrage</h2>
            <p><strong>Von:</strong> ${name}</p>
            <p><strong>E-Mail:</strong> ${email}</p>
            ${company ? `<p><strong>Firma:</strong> ${company}</p>` : ''}
            ${projectType ? `<p><strong>Projekttyp:</strong> ${projectType}</p>` : ''}
            <p><strong>Betreff:</strong> ${subject}</p>
            <p><strong>Nachricht:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the request if email fails
      }
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