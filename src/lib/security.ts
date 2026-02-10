import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter for API routes
// For production, use Redis or a dedicated rate limiting service

interface RateLimitEntry {
    count: number;
    timestamp: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute
const BLOCKED_IPS: string[] = []; // Add IPs to block permanently

// Spam keywords for contact form
const SPAM_KEYWORDS = [
    'viagra', 'cialis', 'crypto', 'lottery', 'winner', 'casino',
    'free money', 'click here', 'buy now', 'urgent', 'act now',
    'limited time', 'SEO services', 'backlinks', 'website traffic',
];

// Rate limit check
export function checkRateLimit(ip: string, customLimit?: number): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const limit = customLimit || MAX_REQUESTS_PER_WINDOW;

    // Clean old entries
    rateLimitMap.forEach((entry, key) => {
        if (now - entry.timestamp > RATE_LIMIT_WINDOW) {
            rateLimitMap.delete(key);
        }
    });

    const entry = rateLimitMap.get(ip);

    if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
        return { allowed: true, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
        return { allowed: false, remaining: 0 };
    }

    entry.count++;
    return { allowed: true, remaining: limit - entry.count };
}

// Rate limit response
export function rateLimitResponse() {
    return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
            status: 429,
            headers: {
                'Retry-After': '60',
                'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
                'X-RateLimit-Remaining': '0',
            }
        }
    );
}

// Check if IP is blocked
export function isBlocked(ip: string): boolean {
    return BLOCKED_IPS.includes(ip);
}

// Spam detection for form submissions
export function isSpam(content: string): boolean {
    const lowerContent = content.toLowerCase();

    // Check for spam keywords
    for (const keyword of SPAM_KEYWORDS) {
        if (lowerContent.includes(keyword.toLowerCase())) {
            return true;
        }
    }

    // Check for excessive URLs
    const urlCount = (content.match(/https?:\/\//g) || []).length;
    if (urlCount > 3) {
        return true;
    }

    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.5 && content.length > 50) {
        return true;
    }

    return false;
}

// Validate email format
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Sanitize input (basic XSS prevention)
export function sanitizeInput(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Get client IP from request
export function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    return '127.0.0.1';
}

// Honeypot field validation (anti-bot)
export function isHoneypotTriggered(body: any): boolean {
    // If these fields are filled, it's likely a bot
    const honeypotFields = ['website', 'url', 'phone2', 'fax'];
    return honeypotFields.some(field => body[field] && body[field].length > 0);
}

// CSRF token generation (for forms)
export function generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
