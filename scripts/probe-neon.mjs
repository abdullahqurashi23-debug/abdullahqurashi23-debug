
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL || '');

console.log('Type of sql:', typeof sql);
console.log('Type of sql.query:', typeof sql.query);

try {
    // Try tagged template
    const r1 = await sql`SELECT 1 as num`;
    console.log('Tagged template success:', r1);
} catch (e) {
    console.log('Tagged template failed:', e.message);
}

try {
    // Try function call with string
    const r2 = await sql('SELECT 1 as num');
    console.log('Function call (string) success:', r2);
} catch (e) {
    console.log('Function call (string) failed:', e.message);
}

try {
    // Try .query()
    if (sql.query) {
        const r3 = await sql.query('SELECT 1 as num');
        console.log('.query() success:', r3);
    } else {
        console.log('.query() does not exist');
    }
} catch (e) {
    console.log('.query() failed:', e.message);
}
