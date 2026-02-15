'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  publishedAt: string;
  authorName: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPosts(data.posts);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0a0a', color: 'white', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 768px) {
          .blog-grid { grid-template-columns: 1fr !important; }
          .section-padding { padding: 60px 20px !important; }
        }
      `}</style>
      
      <Header />

      {/* Hero Section */}
      <section className="section-padding" style={{ padding: '80px 60px', textAlign: 'center', background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>
            Kommentify <span style={{ color: '#693fe9' }}>Blog</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)' }}>
            Tips, strategies, and insights for LinkedIn growth and automation
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="section-padding" style={{ padding: '60px', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.5)' }}>
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Coming Soon!</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>We&apos;re working on some great content for you. Check back soon!</p>
            </div>
          ) : (
            <div className="blog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
              {posts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/blog/${post.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <article style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s, border-color 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#693fe9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                  >
                    {post.featuredImage && (
                      <div style={{ 
                        width: '100%', 
                        height: '200px', 
                        background: `url(${post.featuredImage}) center/cover no-repeat`,
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                      }} />
                    )}
                    <div style={{ padding: '24px' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', lineHeight: '1.4' }}>
                        {post.title}
                      </h2>
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px', lineHeight: '1.6' }}>
                        {post.excerpt}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                        <span>{post.authorName}</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
