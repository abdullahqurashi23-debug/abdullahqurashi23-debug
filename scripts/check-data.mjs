
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL || '');

async function checkData() {
    try {
        console.log('Checking database content...');

        const tables = ['projects', 'publications', 'blog_posts', 'certifications'];

        for (const table of tables) {
            try {
                // Use the correct Neon .query() method
                const countResult = await sql.query(`SELECT COUNT(*) as count FROM ${table}`);
                const count = countResult[0].count;
                console.log(`Table '${table}': ${count} rows`);

                if (parseInt(count) > 0) {
                    const sample = await sql.query(`SELECT * FROM ${table} LIMIT 1`);
                    console.log(`  Sample item:`, JSON.stringify(sample[0], null, 2));
                }
            } catch (err) {
                console.error(`Error checking ${table}:`, err.message);
            }
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

checkData();
