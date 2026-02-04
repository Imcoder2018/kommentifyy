import { NextRequest, NextResponse } from 'next/server';
import { put, del, list } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/extension-versions/upload
 * Upload a new extension version to Vercel Blob storage
 * Automatically deletes all previous versions to save space
 */
export async function POST(request: NextRequest) {
    try {
        // Verify admin token
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const version = formData.get('version') as string | null;
        const features = formData.get('features') as string | null;
        const bugFixes = formData.get('bugFixes') as string | null;
        const releaseNotes = formData.get('releaseNotes') as string | null;

        if (!file || !version) {
            return NextResponse.json({ 
                error: 'File and version are required' 
            }, { status: 400 });
        }

        console.log(`📦 Uploading extension version ${version}...`);

        // Check if version already exists in DB
        const existing = await prisma.extensionVersion.findUnique({
            where: { version }
        });

        if (existing) {
            return NextResponse.json({ 
                error: 'Version already exists' 
            }, { status: 400 });
        }

        // Delete all previous versions from Blob storage to save space
        console.log('🗑️ Deleting previous versions from Blob storage...');
        try {
            const { blobs } = await list({ prefix: 'extensions/' });
            for (const blob of blobs) {
                console.log(`  Deleting: ${blob.pathname}`);
                await del(blob.url);
            }
            console.log(`✅ Deleted ${blobs.length} previous version(s)`);
        } catch (listError) {
            console.log('⚠️ No previous versions to delete or error listing:', listError);
        }

        // Upload new file to Vercel Blob
        const filename = `extensions/kommentify-v${version}.zip`;
        const blob = await put(filename, file, {
            access: 'public',
            addRandomSuffix: false,
        });

        console.log(`✅ Uploaded to: ${blob.url}`);

        // Parse features and bugFixes from JSON strings
        let featuresArray: string[] = [];
        let bugFixesArray: string[] = [];

        try {
            if (features) featuresArray = JSON.parse(features);
            if (bugFixes) bugFixesArray = JSON.parse(bugFixes);
        } catch {
            // If not JSON, split by newlines
            if (features) featuresArray = features.split('\n').filter(f => f.trim());
            if (bugFixes) bugFixesArray = bugFixes.split('\n').filter(b => b.trim());
        }

        // Create new version record in DB
        const newVersion = await prisma.extensionVersion.create({
            data: {
                version,
                features: featuresArray,
                bug_fixes: bugFixesArray,
                download_url: blob.url,
                release_notes: releaseNotes || '',
                is_active: true
            }
        });

        // Deactivate all previous versions
        await prisma.extensionVersion.updateMany({
            where: {
                id: { not: newVersion.id }
            },
            data: {
                is_active: false
            }
        });

        return NextResponse.json({ 
            success: true, 
            version: newVersion,
            downloadUrl: blob.url,
            message: `Version ${version} uploaded successfully`
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Upload failed' 
        }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/extension-versions/upload
 * Delete a specific blob by URL
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const blobUrl = searchParams.get('url');

        if (!blobUrl) {
            return NextResponse.json({ error: 'Blob URL is required' }, { status: 400 });
        }

        await del(blobUrl);

        return NextResponse.json({ 
            success: true, 
            message: 'Blob deleted successfully' 
        });

    } catch (error) {
        console.error('Delete blob error:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Delete failed' 
        }, { status: 500 });
    }
}
