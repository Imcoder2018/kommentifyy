import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET - List all blog posts (admin)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, excerpt, featuredImage, metaTitle, metaDescription, published, authorName } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    let slug = generateSlug(title);
    
    // Check if slug exists and make it unique
    const existingPost = await prisma.blogPost.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        featuredImage,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || content.substring(0, 160),
        published: published || false,
        publishedAt: published ? new Date() : null,
        authorName: authorName || 'Kommentify Team'
      }
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ success: false, error: 'Failed to create blog post' }, { status: 500 });
  }
}

// PUT - Update blog post
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, content, excerpt, featuredImage, metaTitle, metaDescription, published, authorName } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Post ID is required' }, { status: 400 });
    }

    const existingPost = await prisma.blogPost.findUnique({ where: { id } });
    if (!existingPost) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    // Update publishedAt if being published for first time
    let publishedAt = existingPost.publishedAt;
    if (published && !existingPost.published) {
      publishedAt = new Date();
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: title || existingPost.title,
        content: content || existingPost.content,
        excerpt: excerpt || existingPost.excerpt,
        featuredImage: featuredImage !== undefined ? featuredImage : existingPost.featuredImage,
        metaTitle: metaTitle || existingPost.metaTitle,
        metaDescription: metaDescription || existingPost.metaDescription,
        published: published !== undefined ? published : existingPost.published,
        publishedAt,
        authorName: authorName || existingPost.authorName
      }
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ success: false, error: 'Failed to update blog post' }, { status: 500 });
  }
}

// DELETE - Delete blog post
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Post ID is required' }, { status: 400 });
    }

    await prisma.blogPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete blog post' }, { status: 500 });
  }
}
