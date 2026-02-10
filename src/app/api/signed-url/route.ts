import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Validate access token for signed URLs
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        const asset = searchParams.get('asset');

        if (!token || !asset) {
            return NextResponse.json(
                { error: 'Token and asset are required' },
                { status: 400 }
            );
        }

        // Verify the access token is valid
        const { data: accessRequest, error } = await supabase
            .from('access_requests')
            .select('id, email, project_id, status, access_token')
            .eq('access_token', token)
            .eq('status', 'approved')
            .single();

        if (error || !accessRequest) {
            return NextResponse.json(
                { error: 'Invalid or expired access token' },
                { status: 403 }
            );
        }

        // Generate a signed URL for the asset
        // In production, this would use Supabase Storage signed URLs
        // or a CDN with signed cookies/URLs

        const signedUrl = generateSignedUrl(asset, token);

        return NextResponse.json({
            success: true,
            signedUrl,
            expiresIn: '1h'
        });

    } catch (error) {
        console.error('Error generating signed URL:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Generate a time-limited signed URL
function generateSignedUrl(asset: string, token: string): string {
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
    const signature = crypto
        .createHmac('sha256', process.env.SIGNED_URL_SECRET || 'default-secret')
        .update(`${asset}-${token}-${expiresAt}`)
        .digest('hex');

    // In production, this would be the actual CDN or storage URL
    // For now, return a placeholder URL format
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return `${baseUrl}/api/assets/${asset}?token=${token}&expires=${expiresAt}&sig=${signature}`;
}

// POST - Create a download session for tracking
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, asset } = body;

        if (!token || !asset) {
            return NextResponse.json(
                { error: 'Token and asset are required' },
                { status: 400 }
            );
        }

        // Verify the access token
        const { data: accessRequest, error } = await supabase
            .from('access_requests')
            .select('id, email, project_id')
            .eq('access_token', token)
            .eq('status', 'approved')
            .single();

        if (error || !accessRequest) {
            return NextResponse.json(
                { error: 'Invalid or expired access token' },
                { status: 403 }
            );
        }

        // Log the download (optional - for analytics)
        // await supabase.from('download_logs').insert({
        //     access_request_id: accessRequest.id,
        //     asset,
        //     downloaded_at: new Date().toISOString(),
        //     ip_address: request.headers.get('x-forwarded-for')
        // });

        const signedUrl = generateSignedUrl(asset, token);

        return NextResponse.json({
            success: true,
            signedUrl,
            expiresIn: '1h'
        });

    } catch (error) {
        console.error('Error creating download session:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
