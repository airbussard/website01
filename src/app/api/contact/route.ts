import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import nodemailer from 'nodemailer';

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

    // Send email notification via SMTP (Strato)
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST || 'NOT SET',
      port: process.env.SMTP_PORT || 'NOT SET',
      user: process.env.SMTP_USER || 'NOT SET',
      passSet: process.env.SMTP_PASS ? 'YES' : 'NO',
    });

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        console.log('Creating SMTP transporter...');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: true, // SSL/TLS
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        console.log('Sending email...');
        const info = await transporter.sendMail({
          from: `"Kontaktformular" <${process.env.SMTP_USER}>`,
          to: 'hello@getemergence.com',
          replyTo: email,
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
        console.log('Email sent successfully:', info.messageId);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    } else {
      console.log('SMTP not configured - skipping email');
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