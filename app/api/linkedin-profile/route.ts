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
      fullPageText: profileData.fullPageText || null,
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
      projects, skills, interests, postsTokenLimit, totalPostsCount, fullPageText
    } = body;

    // Helper to safely parse arrays
    const safeParseArray = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    // Store arrays as JSON strings safely
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
        posts: JSON.stringify(safeParseArray(posts)),
        experience: JSON.stringify(safeParseArray(experience)),
        education: JSON.stringify(safeParseArray(education)),
        certifications: JSON.stringify(safeParseArray(certifications)),
        projects: JSON.stringify(safeParseArray(projects)),
        skills: JSON.stringify(safeParseArray(skills)),
        interests: JSON.stringify(safeParseArray(interests)),
        postsTokenLimit: postsTokenLimit || 3000,
        totalPostsCount: totalPostsCount || (Array.isArray(posts) ? posts.length : 0),
        fullPageText,
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
        posts: JSON.stringify(safeParseArray(posts)),
        experience: JSON.stringify(safeParseArray(experience)),
        education: JSON.stringify(safeParseArray(education)),
        certifications: JSON.stringify(safeParseArray(certifications)),
        projects: JSON.stringify(safeParseArray(projects)),
        skills: JSON.stringify(safeParseArray(skills)),
        interests: JSON.stringify(safeParseArray(interests)),
        postsTokenLimit: postsTokenLimit || 3000,
        totalPostsCount: totalPostsCount || (Array.isArray(posts) ? posts.length : 0),
        fullPageText,
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
    const { isSelected, postsTokenLimit, name, headline, location, about, skills, experience, education, certifications, projects, posts: profilePosts } = body;

    const updateData: any = {};
    if (isSelected !== undefined) updateData.isSelected = isSelected;
    if (postsTokenLimit !== undefined) updateData.postsTokenLimit = postsTokenLimit;
    if (name !== undefined) updateData.name = name;
    if (headline !== undefined) updateData.headline = headline;
    if (location !== undefined) updateData.location = location;
    if (about !== undefined) updateData.about = about;
    if (skills !== undefined) updateData.skills = JSON.stringify(skills);
    if (experience !== undefined) updateData.experience = JSON.stringify(experience);
    if (education !== undefined) updateData.education = JSON.stringify(education);
    if (certifications !== undefined) updateData.certifications = JSON.stringify(certifications);
    if (projects !== undefined) updateData.projects = JSON.stringify(projects);
    if (profilePosts !== undefined) {
      updateData.posts = JSON.stringify(profilePosts);
      updateData.totalPostsCount = profilePosts.length;
    }

    const profileData = await (prisma as any).linkedInProfileData.update({
      where: { userId: payload.userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: profileData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
