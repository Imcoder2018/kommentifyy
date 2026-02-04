import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/extension/version
 * Check for latest extension version
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const currentVersion = searchParams.get('current');

        // Get latest version from database
        const latestVersion = await prisma.extensionVersion.findFirst({
            orderBy: { created_at: 'desc' }
        });

        // If no version found, return current as latest
        if (!latestVersion) {
            return NextResponse.json({
                hasUpdate: false,
                currentVersion: currentVersion || '1.0.0',
                latestVersion: currentVersion || '1.0.0',
                message: 'No updates available'
            });
        }

        // Compare versions
        const hasUpdate = currentVersion ? compareVersions(latestVersion.version, currentVersion) > 0 : false;

        return NextResponse.json({
            hasUpdate,
            currentVersion: currentVersion || '1.0.0',
            latestVersion: latestVersion.version,
            downloadUrl: latestVersion.download_url,
            releaseNotes: latestVersion.release_notes,
            features: latestVersion.features || [],
            bugFixes: latestVersion.bug_fixes || [],
            releaseDate: latestVersion.created_at,
            message: hasUpdate ? 'New version available!' : 'You have the latest version'
        });

    } catch (error) {
        console.error('Version check error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * Compare two version strings
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
    }
    
    return 0;
}
