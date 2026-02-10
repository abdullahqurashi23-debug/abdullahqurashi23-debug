// Setup script to create tables in Neon database
// Run: node scripts/setup-db.mjs

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ZnyN9UgA5bat@ep-withered-grass-a1nvd4mg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function setup() {
    console.log('🔌 Connecting to Neon database...');

    try {
        // Test connection
        const result = await sql`SELECT version()`;
        console.log('✅ Connected to:', result[0].version.split(',')[0]);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }

    console.log('\n📦 Creating tables...\n');

    // Admin Users
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

    // Projects
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

    // Publications
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

    // Blog Posts
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

    // Certifications
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
    console.log('  ✅ certifications');

    // Contact Messages
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

    // Access Requests
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
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    console.log('  ✅ access_requests');

    // Insert default admin user (password: admin)
    console.log('\n👤 Creating default admin user...');
    try {
        // bcrypt hash of 'admin'
        const adminPasswordHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyPIjDlWGR6aLZ7FkV0qJXsH3fE3zQ3Kdi';
        await sql`
            INSERT INTO admin_users (email, password_hash, name)
            VALUES ('admin@example.com', ${adminPasswordHash}, 'Admin User')
            ON CONFLICT (email) DO NOTHING
        `;
        console.log('  ✅ Admin user created (email: admin@example.com, password: admin)');
    } catch (err) {
        console.log('  ⚠️  Admin user already exists');
    }

    console.log('\n🎉 Database setup complete! All tables created in Neon.\n');
}

setup().catch(console.error);
