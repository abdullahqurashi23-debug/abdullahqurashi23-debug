import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';


export async function GET() {
    try {
        const email = 'admin@example.com';
        const password = 'admin'; // Temporary password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Delete existing admin user if present, then insert fresh
        await supabase
            .from('admin_users')
            .delete()
            .eq('email', email);

        const { error } = await supabase
            .from('admin_users')
            .insert([{
                email,
                password_hash: hashedPassword,
                name: 'Admin User'
            }]);

        if (error) throw error;

        return NextResponse.json({
            message: 'Admin user created/updated successfully',
            credentials: { email, password }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
