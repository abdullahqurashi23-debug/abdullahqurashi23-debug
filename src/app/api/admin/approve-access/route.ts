import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Approve or reject an access request
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { request_id, action } = body;

        if (!request_id || !action) {
            return NextResponse.json(
                { error: 'request_id and action are required' },
                { status: 400 }
            );
        }

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'action must be "approve" or "reject"' },
                { status: 400 }
            );
        }

        // Get the access request
        const { data: accessRequest, error: fetchError } = await supabase
            .from('access_requests')
            .select('*')
            .eq('id', request_id)
            .single();

        if (fetchError || !accessRequest) {
            return NextResponse.json(
                { error: 'Access request not found' },
                { status: 404 }
            );
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';

        // Generate access token for approved requests
        const accessToken = action === 'approve'
            ? crypto.randomBytes(32).toString('hex')
            : null;

        // Update the access request
        const { error: updateError } = await supabase
            .from('access_requests')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString(),
                approved_at: action === 'approve' ? new Date().toISOString() : null,
                access_token: accessToken
            })
            .eq('id', request_id);

        if (updateError) {
            console.error('Error updating access request:', updateError);
            return NextResponse.json(
                { error: 'Failed to update access request' },
                { status: 500 }
            );
        }

        // Send email notification (placeholder - integrate with email service)
        // In production, use SendGrid, Resend, or similar
        await sendNotificationEmail({
            to: accessRequest.email,
            name: accessRequest.name,
            projectTitle: accessRequest.project_title,
            status: newStatus,
            accessToken: accessToken
        });

        return NextResponse.json({
            success: true,
            message: `Access request ${newStatus}`,
            access_token: accessToken
        });

    } catch (error) {
        console.error('Error processing approval:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Placeholder email function - replace with actual email service
async function sendNotificationEmail(params: {
    to: string;
    name: string;
    projectTitle: string | null;
    status: string;
    accessToken: string | null;
}) {
    const { to, name, projectTitle, status, accessToken } = params;

    // Log for now - integrate with email service
    console.log('📧 Email notification:', {
        to,
        subject: status === 'approved'
            ? `Access Granted: ${projectTitle || 'Gated Content'}`
            : `Access Request Update: ${projectTitle || 'Gated Content'}`,
        body: status === 'approved'
            ? `Hi ${name},\n\nYour access request for "${projectTitle}" has been approved!\n\nYou can now access the full content including datasets and model weights.\n\nYour access token: ${accessToken}\n\nBest regards,\nEmal Kamawal`
            : `Hi ${name},\n\nThank you for your interest. Unfortunately, your access request for "${projectTitle}" was not approved at this time.\n\nFeel free to reach out if you have questions.\n\nBest regards,\nEmal Kamawal`
    });

    // TODO: Integrate with Resend, SendGrid, or other email service
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //     from: 'noreply@emalkamawal.com',
    //     to,
    //     subject: `Access ${status === 'approved' ? 'Granted' : 'Update'}: ${projectTitle}`,
    //     text: emailBody
    // });

    return true;
}

// GET - List access tokens for a project (admin use)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const project_id = searchParams.get('project_id');

        if (!project_id) {
            return NextResponse.json(
                { error: 'project_id is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('access_requests')
            .select('id, name, email, status, approved_at, access_token')
            .eq('project_id', project_id)
            .eq('status', 'approved')
            .order('approved_at', { ascending: false });

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch approved requests' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            approved_users: data || [],
            count: data?.length || 0
        });

    } catch (error) {
        console.error('Error fetching approvals:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
