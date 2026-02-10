import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL || '');

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('cv') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 });
        }

        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');

        // Delete old CV and insert new one
        await sql`DELETE FROM cv_files WHERE id IS NOT NULL`;
        await sql`INSERT INTO cv_files (filename, data, content_type, size_bytes)
                  VALUES (${file.name}, decode(${base64}, 'base64'), ${file.type}, ${file.size})`;

        return NextResponse.json({
            success: true,
            message: 'CV uploaded successfully',
            path: '/api/admin/upload-cv',
            size: (file.size / 1024).toFixed(1) + ' KB',
        });
    } catch (error: any) {
        console.error('CV upload error:', error);
        return NextResponse.json({ error: 'Failed to upload CV: ' + error.message }, { status: 500 });
    }
}

// GET - serve the CV file or check if it exists
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const download = searchParams.get('download');

        const result = await sql`SELECT * FROM cv_files ORDER BY uploaded_at DESC LIMIT 1`;

        if (!result || result.length === 0) {
            if (download) {
                return new NextResponse('No CV uploaded', { status: 404 });
            }
            return NextResponse.json({ exists: false });
        }

        const cv = result[0];

        if (download) {
            // Serve the actual PDF file
            const data = cv.data;
            // data comes as a Buffer/hex from Neon
            let pdfBuffer: Buffer;
            if (typeof data === 'string') {
                // hex-encoded from Neon
                pdfBuffer = Buffer.from(data.replace(/^\\x/, ''), 'hex');
            } else {
                pdfBuffer = Buffer.from(data);
            }

            return new NextResponse(new Uint8Array(pdfBuffer), {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${cv.filename || 'cv.pdf'}"`,
                    'Content-Length': pdfBuffer.length.toString(),
                },
            });
        }

        return NextResponse.json({
            exists: true,
            size: (cv.size_bytes / 1024).toFixed(1) + ' KB',
            lastModified: cv.uploaded_at,
        });
    } catch (error: any) {
        console.error('CV check error:', error);
        return NextResponse.json({ exists: false });
    }
}
