// Fix database schema to match app expectations
// Run: node scripts/fix-db.mjs

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ZnyN9UgA5bat@ep-withered-grass-a1nvd4mg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function fix() {
    console.log('🔧 Fixing database schema...\n');

    // 1. Fix certifications table — add missing columns
    console.log('1. Fixing certifications table...');
    try {
        await sql`ALTER TABLE certifications ADD COLUMN IF NOT EXISTS description TEXT`;
        await sql`ALTER TABLE certifications ADD COLUMN IF NOT EXISTS issue_date TEXT`;
        await sql`ALTER TABLE certifications ADD COLUMN IF NOT EXISTS certificate_url TEXT`;
        // Copy data from old columns if they exist
        try {
            await sql`UPDATE certifications SET issue_date = date_issued WHERE issue_date IS NULL AND date_issued IS NOT NULL`;
            await sql`UPDATE certifications SET certificate_url = credential_url WHERE certificate_url IS NULL AND credential_url IS NOT NULL`;
        } catch (e) { /* old columns may not exist */ }
        console.log('  ✅ certifications: added description, issue_date, certificate_url');
    } catch (err) {
        console.log('  ⚠️  certifications:', err.message);
    }

    // 2. Fix access_requests table — add missing columns
    console.log('2. Fixing access_requests table...');
    try {
        await sql`ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS access_token TEXT`;
        await sql`ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ`;
        console.log('  ✅ access_requests: added access_token, approved_at');
    } catch (err) {
        console.log('  ⚠️  access_requests:', err.message);
    }

    // 3. Create site_settings table for storing settings
    console.log('3. Creating site_settings table...');
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS site_settings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                key TEXT UNIQUE NOT NULL,
                value TEXT,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        console.log('  ✅ site_settings table created');
    } catch (err) {
        console.log('  ⚠️  site_settings:', err.message);
    }

    // 4. Create cv_files table for storing CV data (since Vercel filesystem is read-only)
    console.log('4. Creating cv_files table...');
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS cv_files (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                filename TEXT NOT NULL,
                data BYTEA NOT NULL,
                content_type TEXT DEFAULT 'application/pdf',
                size_bytes INTEGER,
                uploaded_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        console.log('  ✅ cv_files table created');
    } catch (err) {
        console.log('  ⚠️  cv_files:', err.message);
    }

    console.log('\n🎉 Database fixes complete!\n');
}

fix().catch(console.error);
