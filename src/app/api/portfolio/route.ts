import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL || '');

// Public API: Returns portfolio data from the database
// Used by the public pages (homepage, about) to display dynamic admin-managed content
export async function GET() {
    try {
        // Fetch all settings
        const settings = await sql`SELECT key, value FROM site_settings`;
        const parsed: Record<string, any> = {};
        settings.forEach(row => {
            try {
                parsed[row.key] = JSON.parse(row.value);
            } catch {
                parsed[row.key] = row.value;
            }
        });

        // Fetch featured projects
        const projects = await sql`
            SELECT id, title, slug, short_description, tags, images, visibility, is_featured
            FROM projects 
            WHERE is_featured = true 
            ORDER BY created_at DESC 
            LIMIT 6
        `;

        // If no featured projects, get the latest ones
        const allProjects = projects.length > 0 ? projects : await sql`
            SELECT id, title, slug, short_description, tags, images, visibility, is_featured
            FROM projects 
            ORDER BY created_at DESC 
            LIMIT 6
        `;

        // Fetch certifications
        const certifications = await sql`
            SELECT id, title, issuer, 
                   COALESCE(issue_date, date_issued) as date_issued,
                   COALESCE(certificate_url, credential_url) as credential_url,
                   image_url
            FROM certifications 
            ORDER BY COALESCE(issue_date, date_issued) DESC
        `;

        return NextResponse.json({
            profile: parsed.profile || null,
            about: parsed.about || null,
            social: parsed.social || null,
            projects: allProjects,
            certifications,
        });
    } catch (error: any) {
        console.error('Portfolio API error:', error);
        return NextResponse.json({
            profile: null,
            about: null,
            social: null,
            projects: [],
            certifications: [],
        });
    }
}
