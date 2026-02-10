import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

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

        // Get the current admin user (we use the first/only admin)
        const { data: admins } = await supabase
            .from('admin_users')
            .select('*')
            .limit(1);

        const admin = admins?.[0];
        if (!admin) {
            return NextResponse.json(
                { error: 'Admin user not found' },
                { status: 404 }
            );
        }

        // Verify current password
        // Support both bcrypt hash and plain-text 'admin' fallback
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

        // Build update object
        const updates: Record<string, any> = {};

        if (newEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                return NextResponse.json(
                    { error: 'Invalid email format' },
                    { status: 400 }
                );
            }
            updates.email = newEmail;
        }

        if (newPassword) {
            if (newPassword.length < 6) {
                return NextResponse.json(
                    { error: 'Password must be at least 6 characters' },
                    { status: 400 }
                );
            }
            updates.password_hash = await bcrypt.hash(newPassword, 10);
        }

        // Update admin user
        const { error } = await supabase
            .from('admin_users')
            .update(updates)
            .eq('id', admin.id);

        if (error) {
            console.error('Error updating admin:', error);
            return NextResponse.json(
                { error: 'Failed to update credentials' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Credentials updated successfully',
            emailChanged: !!newEmail,
            passwordChanged: !!newPassword,
        });

    } catch (error: any) {
        console.error('Error updating credentials:', error?.message || error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
