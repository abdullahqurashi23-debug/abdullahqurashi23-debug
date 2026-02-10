import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL || '');

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { currentPassword, newEmail, newPassword } = body;

        if (!currentPassword) {
            return NextResponse.json(
                { error: 'Current password is required to make changes' },
                { status: 400 }
            );
        }

        if (!newEmail && !newPassword) {
            return NextResponse.json(
                { error: 'Please provide a new email or new password' },
                { status: 400 }
            );
        }

        // Get the current admin user
        const admins = await sql`SELECT * FROM admin_users LIMIT 1`;
        const admin = admins?.[0];

        if (!admin) {
            return NextResponse.json(
                { error: 'Admin user not found' },
                { status: 404 }
            );
        }

        // Verify current password
        let isValid = false;
        try {
            isValid = await bcrypt.compare(currentPassword, admin.password_hash);
        } catch {
            // If hash is invalid, check plain-text match (for initial setup)
            isValid = currentPassword === 'admin' && admin.password_hash.includes('admin');
        }

        if (!isValid) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 401 }
            );
        }

        // Update fields
        let emailChanged = false;
        let passwordChanged = false;

        if (newEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                return NextResponse.json(
                    { error: 'Invalid email format' },
                    { status: 400 }
                );
            }
            await sql`UPDATE admin_users SET email = ${newEmail} WHERE id = ${admin.id}::uuid`;
            emailChanged = true;
        }

        if (newPassword) {
            if (newPassword.length < 6) {
                return NextResponse.json(
                    { error: 'Password must be at least 6 characters' },
                    { status: 400 }
                );
            }
            const hash = await bcrypt.hash(newPassword, 10);
            await sql`UPDATE admin_users SET password_hash = ${hash} WHERE id = ${admin.id}::uuid`;
            passwordChanged = true;
        }

        return NextResponse.json({
            success: true,
            message: 'Credentials updated successfully',
            emailChanged,
            passwordChanged,
        });

    } catch (error: any) {
        console.error('Error updating credentials:', error?.message || error);
        return NextResponse.json(
            { error: 'Internal server error: ' + (error?.message || 'unknown') },
            { status: 500 }
        );
    }
}
