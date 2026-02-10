import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL || '');

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type (allow images and PDFs)
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename

        // Insert into media_files
        const result = await sql`
            INSERT INTO media_files (filename, data, content_type, size_bytes)
            VALUES (${filename}, decode(${base64}, 'base64'), ${file.type}, ${file.size})
            RETURNING id
        `;

        if (!result || result.length === 0) {
            throw new Error('Failed to insert file');
        }

        const fileId = result[0].id;
        const publicUrl = `/api/upload?id=${fileId}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            id: fileId,
            filename: filename
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload: ' + error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'File ID required' }, { status: 400 });
        }

        const result = await sql`SELECT * FROM media_files WHERE id = ${id}::uuid`;

        if (!result || result.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const file = result[0];
        const data = file.data;

        // Convert to buffer
        let fileBuffer: Buffer;
        if (typeof data === 'string') {
            fileBuffer = Buffer.from(data.replace(/^\\x/, ''), 'hex');
        } else {
            fileBuffer = Buffer.from(data);
        }

        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                'Content-Type': file.content_type,
                'Content-Disposition': `inline; filename="${file.filename}"`,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error: any) {
        console.error('File serve error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
