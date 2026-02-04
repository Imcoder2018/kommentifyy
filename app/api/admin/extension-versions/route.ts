import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/admin/extension-versions
 * Get all extension versions
 */
export async function GET(request: NextRequest) {
    try {
        const versions = await prisma.extensionVersion.findMany({
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ versions });

    } catch (error) {
        console.error('Get versions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/admin/extension-versions
 * Add a new extension version
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { version, features, bugFixes, downloadUrl, releaseNotes } = body;

        if (!version) {
            return NextResponse.json({ error: 'Version number is required' }, { status: 400 });
        }

        // Check if version already exists
        const existing = await prisma.extensionVersion.findUnique({
            where: { version }
        });

        if (existing) {
            return NextResponse.json({ error: 'Version already exists' }, { status: 400 });
        }

        // Create new version
        const newVersion = await prisma.extensionVersion.create({
            data: {
                version,
                features: features || [],
                bug_fixes: bugFixes || [],
                download_url: downloadUrl || '',
                release_notes: releaseNotes || '',
                is_active: true
            }
        });

        return NextResponse.json({ 
            success: true, 
            version: newVersion,
            message: 'Version created successfully'
        });

    } catch (error) {
        console.error('Create version error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/extension-versions
 * Delete an extension version
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const versionId = searchParams.get('id');

        if (!versionId) {
            return NextResponse.json({ error: 'Version ID is required' }, { status: 400 });
        }

        await prisma.extensionVersion.delete({
            where: { id: versionId }
        });

        return NextResponse.json({ success: true, message: 'Version deleted successfully' });

    } catch (error) {
        console.error('Delete version error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
