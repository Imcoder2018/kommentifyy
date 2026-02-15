'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string;
  authorName: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetch(`/api/blog?slug=${params.slug}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPost(data.post);
          } else {
            setNotFound(true);
          }
        })
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false));
    }
  }, [params.slug]);

  // Simple markdown-like rendering (basic)
  const renderContent = (content: string) => {
    // Convert markdown-style formatting
    let html = content
      // Headers
      .replace(/^### (.*$)/gm, '<h3 style="font-size: 20px; font-weight: 600; margin: 24px 0 12px 0;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="font-size: 24px; font-weight: 600; margin: 32px 0 16px 0;">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="font-size: 32px; font-weight: 700; margin: 40px 0 20px 0;">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^\- (.*$)/gm, '<li style="margin-left: 20px; margin-bottom: 8px;">$1</li>')
      // Paragraphs (double newlines)
      .replace(/\n\n/g, '</p><p style="margin-bottom: 16px; line-height: 1.8;">')
      // Single newlines
      .replace(/\n/g, '<br/>');
    
    return `<p style="margin-bottom: 16px; line-height: 1.8;">${html}</p>`;
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0a0a', color: 'white', minHeight: '100vh' }}>
        <Header />
        <div style={{ padding: '100px 60px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading...</div>
        <Footer />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0a0a', color: 'white', minHeight: '100vh' }}>
        <Header />
        <div style={{ padding: '100px 60px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Post Not Found</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '30px' }}>The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/blog" style={{ color: '#693fe9', textDecoration: 'underline' }}>← Back to Blog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0a0a', color: 'white', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 768px) {
          .blog-content { padding: 40px 20px !important; }
          .blog-title { font-size: 32px !important; }
        }
      `}</style>
      
      <Header />

      {/* Hero Section with Featured Image */}
      {post.featuredImage && (
        <div style={{
          width: '100%',
          height: '400px',
          background: `linear-gradient(to bottom, rgba(10,10,10,0.3), rgba(10,10,10,0.8)), url(${post.featuredImage}) center/cover no-repeat`
        }} />
      )}

      {/* Article Content */}
      <article className="blog-content" style={{ maxWidth: '800px', margin: '0 auto', padding: '60px' }}>
        <Link href="/blog" style={{ color: '#693fe9', textDecoration: 'none', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '30px' }}>
          ← Back to Blog
        </Link>

        <h1 className="blog-title" style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px', lineHeight: '1.2' }}>
          {post.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          <span>By {post.authorName}</span>
          <span>•</span>
          <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>

        <div 
          style={{ fontSize: '17px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
        />

        {/* CTA Section */}
        <div style={{ 
          marginTop: '60px', 
          padding: '40px', 
          background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.15), rgba(105, 63, 233, 0.05))', 
          borderRadius: '16px',
          border: '1px solid rgba(105, 63, 233, 0.3)',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Ready to grow your LinkedIn?</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
            Start automating your LinkedIn engagement with AI-powered comments and posts.
          </p>
          <Link href="/signup" style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: 'linear-gradient(135deg, #693fe9, #8b5cf6)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: '600'
          }}>
            Start Free Forever →
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}
