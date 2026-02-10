import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';
import {
    checkRateLimit,
    rateLimitResponse,
    isSpam,
    isValidEmail,
    sanitizeInput,
    getClientIp,
    isHoneypotTriggered
} from '@/lib/security';

// Email transporter config
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER,
    port: Number(process.env.EMAIL_PORT),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientIp = getClientIp(request);
        const { allowed, remaining } = checkRateLimit(clientIp, 5); // 5 requests per minute for contact form

        if (!allowed) {
            return rateLimitResponse();
        }

        const body = await request.json();
        const { name, email, collaborationType, subject, message } = body;

        // Honeypot check (anti-bot)
        if (isHoneypotTriggered(body)) {
            // Silently reject, appear successful to bots
            return NextResponse.json(
                { message: 'Message sent successfully' },
                { status: 201 }
            );
        }

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Spam detection
        const fullContent = `${name} ${subject} ${message}`;
        if (isSpam(fullContent)) {
            return NextResponse.json(
                { error: 'Your message was flagged as spam. Please try again.' },
                { status: 400 }
            );
        }

        // Sanitize inputs
        const sanitizedName = sanitizeInput(name);
        const sanitizedSubject = sanitizeInput(subject);
        const sanitizedMessage = sanitizeInput(message);

        // 1. Save to Supabase
        const { data, error } = await supabase
            .from('contact_messages')
            .insert([
                {
                    name: sanitizedName,
                    email,
                    collaboration_type: collaborationType,
                    subject: sanitizedSubject,
                    message: sanitizedMessage,
                    ip_address: clientIp,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            throw new Error('Failed to save message');
        }

        // 2. Send Email Notification (if configured)
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                subject: `New Portfolio Contact: ${sanitizedSubject}`,
                html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${sanitizedName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Type:</strong> ${collaborationType || 'Not specified'}</p>
            <p><strong>Subject:</strong> ${sanitizedSubject}</p>
            <p><strong>IP:</strong> ${clientIp}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${sanitizedMessage}</p>
        `,
            });
        }

        return NextResponse.json(
            { message: 'Message sent successfully', id: data?.id },
            {
                status: 201,
                headers: {
                    'X-RateLimit-Remaining': String(remaining),
                }
            }
        );
    } catch (error: any) {
        console.error('Contact API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request. Please try again.' },
            { status: 500 }
        );
    }
}
