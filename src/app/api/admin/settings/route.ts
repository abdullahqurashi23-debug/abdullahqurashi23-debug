import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL || '');

export async function GET(request: NextRequest) {
    try {
        const settings = await sql`SELECT key, value FROM site_settings`;

        const formattedSettings: Record<string, any> = {};
        settings.forEach(row => {
            try {
                formattedSettings[row.key] = JSON.parse(row.value);
            } catch {
                formattedSettings[row.key] = row.value;
            }
        });

        return NextResponse.json(formattedSettings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { profile, about, social } = body;

        // Upsert profile settings
        if (profile) {
            await sql`
                INSERT INTO site_settings (key, value, updated_at)
                VALUES ('profile', ${JSON.stringify(profile)}, NOW())
                ON CONFLICT (key) 
                DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
            `;
        }

        // Upsert about settings
        if (about) {
            await sql`
                INSERT INTO site_settings (key, value, updated_at)
                VALUES ('about', ${JSON.stringify(about)}, NOW())
                ON CONFLICT (key) 
                DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
            `;
        }

        // Upsert social settings
        if (social) {
            await sql`
                INSERT INTO site_settings (key, value, updated_at)
                VALUES ('social', ${JSON.stringify(social)}, NOW())
                ON CONFLICT (key) 
                DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
            `;
        }

        return NextResponse.json({ success: true, message: 'Settings saved successfully' });
    } catch (error: any) {
        console.error('Error saving settings:', error);
        return NextResponse.json({ error: 'Failed to save settings: ' + error.message }, { status: 500 });
    }
}
