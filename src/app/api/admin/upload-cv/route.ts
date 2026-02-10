import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('cv') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                { error: 'Only PDF files are accepted' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        // Read file buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public folder as cv.pdf
        const publicDir = path.join(process.cwd(), 'public');
        await mkdir(publicDir, { recursive: true });
        const filePath = path.join(publicDir, 'cv.pdf');
        await writeFile(filePath, buffer);

        return NextResponse.json({
            success: true,
            message: 'CV uploaded successfully',
            path: '/cv.pdf',
            size: (file.size / 1024).toFixed(1) + ' KB',
        });
    } catch (error: any) {
        console.error('CV upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload CV: ' + error.message },
            { status: 500 }
        );
    }
}

// GET - check if CV exists
export async function GET() {
    try {
        const fs = await import('fs');
        const filePath = path.join(process.cwd(), 'public', 'cv.pdf');
        const exists = fs.existsSync(filePath);

        if (exists) {
            const stats = fs.statSync(filePath);
            return NextResponse.json({
                exists: true,
                size: (stats.size / 1024).toFixed(1) + ' KB',
                lastModified: stats.mtime.toISOString(),
            });
        }

        return NextResponse.json({ exists: false });
    } catch {
        return NextResponse.json({ exists: false });
    }
}
