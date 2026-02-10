import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL || '');

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
        const requests = await sql`SELECT * FROM access_requests WHERE id = ${request_id}::uuid`;
        const accessRequest = requests?.[0];

        if (!accessRequest) {
            return NextResponse.json(
                { error: 'Access request not found' },
                { status: 404 }
            );
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        const accessToken = action === 'approve'
            ? crypto.randomBytes(32).toString('hex')
            : null;
        const now = new Date().toISOString();

        // Update the access request
        await sql`
            UPDATE access_requests 
            SET status = ${newStatus},
                updated_at = ${now},
                approved_at = ${action === 'approve' ? now : null},
                access_token = ${accessToken}
            WHERE id = ${request_id}::uuid
        `;

        // Log notification (email integration placeholder)
        console.log('📧 Notification:', {
            to: accessRequest.email,
            name: accessRequest.name,
            project: accessRequest.project_title,
            status: newStatus,
        });

        return NextResponse.json({
            success: true,
            message: `Access request ${newStatus}`,
            access_token: accessToken
        });

    } catch (error: any) {
        console.error('Error processing approval:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + (error?.message || 'unknown') },
            { status: 500 }
        );
    }
}

// GET - List approved access for a project
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

        const data = await sql`
            SELECT id, name, email, status, approved_at, access_token
            FROM access_requests
            WHERE project_id = ${project_id} AND status = 'approved'
            ORDER BY approved_at DESC
        `;

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
