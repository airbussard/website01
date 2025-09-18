import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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

    // Here you could also add email sending logic
    // For example, using SendGrid, Resend, or other email services

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