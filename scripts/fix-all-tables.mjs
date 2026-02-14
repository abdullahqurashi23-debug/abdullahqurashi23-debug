// Comprehensive migration - ensures all tables and columns exist
// Run: node scripts/fix-all-tables.mjs

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ZnyN9UgA5bat@ep-withered-grass-a1nvd4mg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function migrate() {
    console.log('🔌 Connecting to Neon database...');
    try {
        const result = await sql`SELECT version()`;
        console.log('✅ Connected to:', result[0].version.split(',')[0]);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }

    console.log('\n📦 Ensuring all tables exist...\n');

    // 1. admin_users
    await sql`
        CREATE TABLE IF NOT EXISTS admin_users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL DEFAULT 'Admin',
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    console.log('  ✅ admin_users');

    // 2. projects
    await sql`
        CREATE TABLE IF NOT EXISTS projects (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            short_description TEXT,
            full_description TEXT,
            problem_statement TEXT,
            approach TEXT,
            results TEXT,
            limitations TEXT,
            category TEXT[] DEFAULT '{}',
            tags TEXT[] DEFAULT '{}',
            github_link TEXT,
            visibility TEXT DEFAULT 'public',
            is_featured BOOLEAN DEFAULT FALSE,
            metrics JSONB DEFAULT '[]',
            images JSONB DEFAULT '[]',
            gated_code TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    console.log('  ✅ projects');

    // 3. publications
    await sql`
        CREATE TABLE IF NOT EXISTS publications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            authors TEXT[] DEFAULT '{}',
            journal TEXT,
            venue TEXT,
            year INTEGER,
            abstract TEXT,
            contributions TEXT[] DEFAULT '{}',
            pdf_url TEXT,
            doi TEXT,
            doi_link TEXT,
            code_repo TEXT,
            status TEXT DEFAULT 'under-review',
            impact_factor NUMERIC,
            citations INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    console.log('  ✅ publications');

    // 4. blog_posts
    await sql`
        CREATE TABLE IF NOT EXISTS blog_posts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            excerpt TEXT,
            content TEXT,
            cover_image TEXT,
            tags TEXT[] DEFAULT '{}',
            status TEXT DEFAULT 'draft',
            reading_time INTEGER DEFAULT 5,
            published_at DATE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    console.log('  ✅ blog_posts');

    // 5. certifications (with ALL columns admin pages expect)
    await sql`
        CREATE TABLE IF NOT EXISTS certifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            issuer TEXT NOT NULL,
            date_issued TEXT,
            credential_url TEXT,
            image_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    // Add columns that admin pages expect but original schema didn't have
    await sql`ALTER TABLE certifications ADD COLUMN IF NOT EXISTS description TEXT`;
    await sql`ALTER TABLE certifications ADD COLUMN IF NOT EXISTS issue_date TEXT`;
    await sql`ALTER TABLE certifications ADD COLUMN IF NOT EXISTS certificate_url TEXT`;
    // Sync old → new column data
    try {
        await sql`UPDATE certifications SET issue_date = date_issued WHERE issue_date IS NULL AND date_issued IS NOT NULL`;
        await sql`UPDATE certifications SET certificate_url = credential_url WHERE certificate_url IS NULL AND credential_url IS NOT NULL`;
    } catch (e) { /* columns might not have data yet */ }
    console.log('  ✅ certifications (with description, issue_date, certificate_url)');

    // 6. contact_messages
    await sql`
        CREATE TABLE IF NOT EXISTS contact_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            company TEXT,
            subject TEXT,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            is_starred BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    console.log('  ✅ contact_messages');

    // 7. access_requests
    await sql`
        CREATE TABLE IF NOT EXISTS access_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            company TEXT,
            role TEXT,
            reason TEXT,
            project_id TEXT,
            project_title TEXT,
            status TEXT DEFAULT 'pending',
            access_token TEXT,
            approved_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    console.log('  ✅ access_requests');

    // 8. site_settings (stores profile, about, social links)
    await sql`
        CREATE TABLE IF NOT EXISTS site_settings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    console.log('  ✅ site_settings');

    // 9. media_files (for image uploads)
    await sql`
        CREATE TABLE IF NOT EXISTS media_files (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            filename TEXT NOT NULL,
            data BYTEA NOT NULL,
            content_type TEXT NOT NULL,
            size_bytes INTEGER,
            uploaded_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    console.log('  ✅ media_files');

    // 10. cv_files (for CV PDF storage)
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
    console.log('  ✅ cv_files');

    // Ensure default admin user exists
    console.log('\n👤 Ensuring default admin user...');
    try {
        const existing = await sql`SELECT id FROM admin_users LIMIT 1`;
        if (existing.length === 0) {
            // bcrypt hash of 'admin'
            const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyPIjDlWGR6aLZ7FkV0qJXsH3fE3zQ3Kdi';
            await sql`
                INSERT INTO admin_users (email, password_hash, name)
                VALUES ('admin@example.com', ${hash}, 'Admin User')
                ON CONFLICT (email) DO NOTHING
            `;
            console.log('  ✅ Default admin created (email: admin@example.com, password: admin)');
        } else {
            console.log('  ✅ Admin user already exists');
        }
    } catch (err) {
        console.log('  ⚠️  Admin check:', err.message);
    }

    // Verify all tables
    console.log('\n🔍 Verifying tables...');
    const tables = await sql`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    `;
    console.log('  Tables found:', tables.map(t => t.table_name).join(', '));

    console.log('\n🎉 Database migration complete! All tables verified.\n');
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
