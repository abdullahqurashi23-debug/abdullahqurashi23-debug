import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, company, role, reason, project_id, project_title } = body;

        // Validate required fields
        if (!name || !email || !reason) {
            return NextResponse.json(
                { error: 'Name, email, and reason are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Check for existing pending request from same email for same project
        let existingRequest = null;
        try {
            const { data } = await supabase
                .from('access_requests')
                .select('id')
                .eq('email', email.toLowerCase())
                .eq('project_id', project_id || '')
                .eq('status', 'pending');

            existingRequest = data && data.length > 0 ? data[0] : null;
        } catch (e) {
            // No existing request found, continue
        }

        if (existingRequest) {
            return NextResponse.json(
                { error: 'You already have a pending request for this project' },
                { status: 409 }
            );
        }

        // Insert new access request
        const { data, error } = await supabase
            .from('access_requests')
            .insert([{
                name: name.trim(),
                email: email.toLowerCase().trim(),
                company: company?.trim() || null,
                role: role?.trim() || null,
                reason: reason.trim(),
                project_id: project_id || null,
                project_title: project_title || null,
                status: 'pending',
            }]);

        if (error) {
            console.error('Error creating access request:', error);
            return NextResponse.json(
                { error: 'Failed to submit request. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Access request submitted successfully',
            request_id: data?.[0]?.id || data?.id || 'submitted'
        });

    } catch (error: any) {
        console.error('Error processing access request:', error?.message || error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET - Check if user has approved access for a project
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const project_id = searchParams.get('project_id');

        if (!email || !project_id) {
            return NextResponse.json(
                { error: 'Email and project_id are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('access_requests')
            .select('id, status, approved_at, access_token')
            .eq('email', email.toLowerCase())
            .eq('project_id', project_id)
            .eq('status', 'approved')
            .single();

        if (error || !data) {
            return NextResponse.json({
                hasAccess: false
            });
        }

        return NextResponse.json({
            hasAccess: true,
            approved_at: data.approved_at,
            access_token: data.access_token
        });

    } catch (error) {
        console.error('Error checking access:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
