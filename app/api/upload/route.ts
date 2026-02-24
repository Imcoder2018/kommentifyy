import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Max file sizes
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/webm', 'video/mp4'];

/**
 * POST /api/upload
 * Upload image or video to Vercel Blob storage.
 * Returns the public URL for use in LinkedIn posts.
 */
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json({ 
        success: false, 
        error: `Unsupported file type: ${file.type}. Allowed: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(', ')}` 
      }, { status: 400 });
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: `File too large. Max ${isImage ? '10MB' : '200MB'} for ${isImage ? 'images' : 'videos'}.` 
      }, { status: 400 });
    }

    // Generate a unique filename
    const ext = file.name.split('.').pop() || (isImage ? 'jpg' : 'webm');
    const filename = `posts/${payload.userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      mediaType: isImage ? 'image' : 'video',
      filename: file.name,
      size: file.size,
      contentType: file.type,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
