import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);

    let profileData = await (prisma as any).linkedInProfileData.findUnique({ where: { userId: payload.userId } });
    
    if (!profileData) {
      return NextResponse.json({ success: true, data: null, hasScanned: false });
    }

    // Parse JSON fields for response
    const parsedData = {
      ...profileData,
      posts: JSON.parse(profileData.posts || '[]'),
      experience: JSON.parse(profileData.experience || '[]'),
      education: JSON.parse(profileData.education || '[]'),
      certifications: JSON.parse(profileData.certifications || '[]'),
      projects: JSON.parse(profileData.projects || '[]'),
      skills: JSON.parse(profileData.skills || '[]'),
      interests: JSON.parse(profileData.interests || '[]'),
    };

    return NextResponse.json({ success: true, data: parsedData, hasScanned: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);

    const body = await request.json();
    const { 
      profileUrl, name, headline, location, connections, profileViews,
      about, language, posts, experience, education, certifications, 
      projects, skills, interests, postsTokenLimit, totalPostsCount 
    } = body;

    // Store arrays as JSON strings
    const profileData = await (prisma as any).linkedInProfileData.upsert({
      where: { userId: payload.userId },
      update: {
        profileUrl,
        name,
        headline,
        location,
        connections,
        profileViews,
        about,
        language,
        posts: JSON.stringify(posts || []),
        experience: JSON.stringify(experience || []),
        education: JSON.stringify(education || []),
        certifications: JSON.stringify(certifications || []),
        projects: JSON.stringify(projects || []),
        skills: JSON.stringify(skills || []),
        interests: JSON.stringify(interests || []),
        postsTokenLimit: postsTokenLimit || 3000,
        totalPostsCount: totalPostsCount || (posts?.length || 0),
        lastScannedAt: new Date(),
      },
      create: {
        userId: payload.userId,
        profileUrl,
        name,
        headline,
        location,
        connections,
        profileViews,
        about,
        language,
        posts: JSON.stringify(posts || []),
        experience: JSON.stringify(experience || []),
        education: JSON.stringify(education || []),
        certifications: JSON.stringify(certifications || []),
        projects: JSON.stringify(projects || []),
        skills: JSON.stringify(skills || []),
        interests: JSON.stringify(interests || []),
        postsTokenLimit: postsTokenLimit || 3000,
        totalPostsCount: totalPostsCount || (posts?.length || 0),
        lastScannedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: profileData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    // Delete user's LinkedIn profile data
    const deleted = await (prisma as any).linkedInProfileData.delete({
      where: { userId: payload.userId },
    });

    return NextResponse.json({
      success: true,
      message: 'LinkedIn profile data deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete LinkedIn profile error:', error);
    
    if (error.code === 'P2025') {
      // Record not found
      return NextResponse.json(
        { success: false, error: 'No LinkedIn profile data found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete LinkedIn profile data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);

    const body = await request.json();
    const { isSelected, postsTokenLimit } = body;

    const profileData = await (prisma as any).linkedInProfileData.update({
      where: { userId: payload.userId },
      data: {
        isSelected: isSelected,
        postsTokenLimit: postsTokenLimit,
      },
    });

    return NextResponse.json({ success: true, data: profileData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
