import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/linkedin-profile/voyager-sync
 * Receives Voyager API data from the extension and upserts into LinkedInProfileData.
 */
export async function POST(request: NextRequest) {
    try {
        const token = extractToken(request.headers.get('authorization'));
        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const payload = verifyToken(token);
        console.log('[POST /voyager-sync] Storing data for userId:', payload.userId, 'email:', payload.email);

        const body = await request.json();
        const {
            linkedInUrn,
            linkedInUsername,
            name,
            headline,
            location,
            about,
            profileUrl,
            followerCount,
            connectionCount,
            profileViewsData,
            recentPosts,
            profilePicture,
            backgroundImage,
            experience,
            education,
            topConnections,
            invitationsData,
            profileMetadata,
            premiumSubscriber,
            memberId,
        } = body;

        // Build update object — only include non-null fields
        const updateData: any = {
            voyagerLastSyncAt: new Date(),
        };

        if (linkedInUrn) updateData.linkedInUrn = linkedInUrn;
        if (linkedInUsername) updateData.linkedInUsername = linkedInUsername;
        if (followerCount !== undefined && followerCount !== null) updateData.followerCount = followerCount;
        if (connectionCount !== undefined && connectionCount !== null) updateData.connectionCount = connectionCount;
        if (recentPosts) updateData.recentPosts = typeof recentPosts === 'string' ? recentPosts : JSON.stringify(recentPosts);

        // Update basic profile fields 
        if (name) updateData.name = name;
        if (headline) updateData.headline = headline;
        if (location) updateData.location = location;
        if (about) updateData.about = about;
        if (profileUrl) updateData.profileUrl = profileUrl;

        // Store profileViewsData (extension now sends it with profilePicture/backgroundImage merged)
        if (profileViewsData) {
            updateData.profileViewsData = typeof profileViewsData === 'string' ? profileViewsData : JSON.stringify(profileViewsData);
        }

        // Update experience and education from Voyager
        if (experience) updateData.experience = typeof experience === 'string' ? experience : JSON.stringify(experience);
        if (education) updateData.education = typeof education === 'string' ? education : JSON.stringify(education);

        // Store top connections in voyagerEmail field
        if (topConnections) {
            updateData.voyagerEmail = typeof topConnections === 'string' ? topConnections : JSON.stringify(topConnections);
        }

        // Store invitations data in interests field (reusing unused field)
        if (invitationsData) {
            updateData.interests = typeof invitationsData === 'string' ? invitationsData : JSON.stringify(invitationsData);
        }

        // Store profile metadata in certifications field (reusing unused field)
        if (profileMetadata) {
            updateData.certifications = typeof profileMetadata === 'string' ? profileMetadata : JSON.stringify(profileMetadata);
        }

        // Upsert — create if record doesn't exist, update if it does
        const profileData = await (prisma as any).linkedInProfileData.upsert({
            where: { userId: payload.userId },
            update: updateData,
            create: {
                userId: payload.userId,
                ...updateData,
                // Defaults for required fields not provided
                posts: '[]',
                experience: updateData.experience || '[]',
                education: updateData.education || '[]',
                certifications: '[]',
                projects: '[]',
                skills: '[]',
                interests: '[]',
                recentPosts: updateData.recentPosts || '[]',
            },
        });

        console.log(`[Voyager Sync] Upserted data for user ${payload.userId}: followers=${profileData.followerCount}, connections=${profileData.connectionCount}`);

        return NextResponse.json({
            success: true,
            data: {
                linkedInUrn: profileData.linkedInUrn,
                linkedInUsername: profileData.linkedInUsername,
                followerCount: profileData.followerCount,
                connectionCount: profileData.connectionCount,
                voyagerLastSyncAt: profileData.voyagerLastSyncAt,
                name: profileData.name,
                headline: profileData.headline,
            },
        });
    } catch (error: any) {
        console.error('Voyager sync error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
