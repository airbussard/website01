import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
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
    const { name, email, company, subject, message, projectType, website, _t, _token } = body;

    // Spam-Erkennung: Mehrere Checks
    let isSpam = false;
    const spamReasons: string[] = [];

    // 1. Honeypot-Check: Wenn 'website' gefuellt ist, ist es ein Bot
    if (website) {
      isSpam = true;
      spamReasons.push('honeypot');
    }

    // 2. Zeit-Check: Formular in < 3 Sekunden ausgefuellt = Bot
    const formTime = typeof _t === 'number' ? _t : 0;
    if (!formTime || formTime < 3000) {
      isSpam = true;
      spamReasons.push(`too_fast(${formTime}ms)`);
    }

    // 3. JS-Token-Check: Kein gueltiger Token = kein JavaScript = Bot
    if (!_token || typeof _token !== 'string' || _token.length !== 16) {
      isSpam = true;
      spamReasons.push('no_token');
    }

    if (isSpam) {
      console.log(`[Contact] Bot detected (IP: ${ip}): ${spamReasons.join(', ')}`);
      // Bei Spam: Success zurueckgeben (Bot merkt nichts), aber keine E-Mail senden
      return NextResponse.json(
        { message: 'Contact request received successfully' },
        { status: 200 }
      );
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

    // E-Mail direkt per SMTP senden
    const templateData = { name, email, company, subject, message, projectType };

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"getemergence.com" <${process.env.SMTP_USER}>`,
      to: 'hello@getemergence.com',
      replyTo: email,
      subject: `Neue Kontaktanfrage: ${subject}`,
      html: contactNotificationTemplate(templateData),
      text: contactNotificationTextTemplate(templateData),
    });

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
