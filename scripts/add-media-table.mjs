// Migration to add media table for image storage
// Run: node scripts/add-media-table.mjs

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ZnyN9UgA5bat@ep-withered-grass-a1nvd4mg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function migrate() {
    console.log('🔧 Creating media table...\n');

    try {
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
        console.log('  ✅ media_files table created');
    } catch (err) {
        console.log('  ⚠️  media_files:', err.message);
    }

    console.log('\n🎉 Media table setup complete!');
}

migrate().catch(console.error);
