'use client';

import { useEffect, useState } from 'react';

export default function AdminScrapedPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('scrapedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchPosts = async (p = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: p.toString(),
        limit: '30',
        sortBy,
        sortOrder,
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/scraped-posts?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
        setTotal(data.pagination?.total || 0);
        setPage(p);
      }
    } catch (e) {
      console.error('Failed to fetch scraped posts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sortBy, sortOrder]);

  const handleSearch = () => {
    setSearch(searchInput);
    fetchPosts(1);
  };

  const totalPages = Math.ceil(total / 30);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0' }}>📋 Scraped Posts</h1>
          <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>View all posts saved by users from their LinkedIn feeds</p>
        </div>
        <div style={{ background: '#693fe9', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}>
          {total} total posts
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search post content or author..."
          style={{ flex: 1, minWidth: '250px', padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '13px' }}>
          <option value="scrapedAt">Date Saved</option>
          <option value="likes">Likes</option>
          <option value="comments">Comments</option>
          <option value="shares">Shares</option>
        </select>
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
          style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '13px' }}>
          <option value="desc">Highest First</option>
          <option value="asc">Lowest First</option>
        </select>
        <button onClick={handleSearch}
          style={{ padding: '10px 20px', background: '#693fe9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
          🔍 Search
        </button>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>Loading posts...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <p style={{ color: '#999', fontSize: '16px' }}>No scraped posts found</p>
        </div>
      ) : (
        <>
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#444' }}>User</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#444' }}>Author</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#444', maxWidth: '400px' }}>Post Content</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#444' }}>❤️</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#444' }}>💬</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#444' }}>🔄</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#444' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post: any) => (
                  <tr key={post.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '600', color: '#333', fontSize: '13px' }}>{post.user?.name || 'N/A'}</div>
                      <div style={{ color: '#999', fontSize: '11px' }}>{post.user?.email || ''}</div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '500', color: '#555' }}>{post.authorName || 'Unknown'}</div>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: '400px', verticalAlign: 'top' }}>
                      <div style={{ color: '#444', lineHeight: '1.5', maxHeight: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {post.postContent?.substring(0, 200)}{post.postContent?.length > 200 ? '...' : ''}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#ec4899' }}>{post.likes}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#8b5cf6' }}>{post.comments}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#06b6d4' }}>{post.shares}</td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'top', whiteSpace: 'nowrap', color: '#666', fontSize: '12px' }}>
                      {new Date(post.scrapedAt).toLocaleDateString()}<br/>
                      <span style={{ color: '#999' }}>{new Date(post.scrapedAt).toLocaleTimeString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px', alignItems: 'center' }}>
              <button onClick={() => fetchPosts(page - 1)} disabled={page <= 1}
                style={{ padding: '8px 16px', background: page <= 1 ? '#f0f0f0' : 'white', border: '2px solid #e0e0e0', borderRadius: '8px', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: page <= 1 ? '#ccc' : '#333', fontSize: '13px' }}>
                ← Previous
              </button>
              <span style={{ color: '#666', fontSize: '14px' }}>Page {page} of {totalPages}</span>
              <button onClick={() => fetchPosts(page + 1)} disabled={page >= totalPages}
                style={{ padding: '8px 16px', background: page >= totalPages ? '#f0f0f0' : 'white', border: '2px solid #e0e0e0', borderRadius: '8px', cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: page >= totalPages ? '#ccc' : '#333', fontSize: '13px' }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
