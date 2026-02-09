'use client';

import { useEffect, useState, useCallback } from 'react';

export default function AdminScrapedPostsPage() {
  const [activeTab, setActiveTab] = useState('feed-posts');

  // Tab 1: Feed Posts state
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotal, setPostsTotal] = useState(0);
  const [postsSortBy, setPostsSortBy] = useState('scrapedAt');
  const [postsSortOrder, setPostsSortOrder] = useState('desc');
  const [postsSearch, setPostsSearch] = useState('');
  const [postsSearchInput, setPostsSearchInput] = useState('');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

  // Tab 2: Inspiration Profiles state
  const [inspProfiles, setInspProfiles] = useState<any[]>([]);
  const [inspLoading, setInspLoading] = useState(true);
  const [selectedInspProfiles, setSelectedInspProfiles] = useState<Set<string>>(new Set());

  // Tab 3: Comment Profiles state
  const [commentProfiles, setCommentProfiles] = useState<any[]>([]);
  const [commentLoading, setCommentLoading] = useState(true);
  const [selectedCommentProfiles, setSelectedCommentProfiles] = useState<Set<string>>(new Set());

  const [status, setStatus] = useState('');

  const getToken = () => localStorage.getItem('adminToken');

  // ---- Tab 1: Feed Posts ----
  const fetchPosts = useCallback(async (p = 1) => {
    setPostsLoading(true);
    try {
      const params = new URLSearchParams({ page: p.toString(), limit: '30', sortBy: postsSortBy, sortOrder: postsSortOrder, ...(postsSearch && { search: postsSearch }) });
      const res = await fetch(`/api/admin/scraped-posts?${params}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) { setPosts(data.posts || []); setPostsTotal(data.pagination?.total || 0); setPostsPage(p); }
    } catch (e) { console.error(e); }
    finally { setPostsLoading(false); }
  }, [postsSortBy, postsSortOrder, postsSearch]);

  const togglePostSelect = (id: string) => {
    setSelectedPosts(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const selectAllPosts = () => {
    if (selectedPosts.size === posts.length) setSelectedPosts(new Set());
    else setSelectedPosts(new Set(posts.map(p => p.id)));
  };
  const shareSelectedPosts = async (shared: boolean) => {
    if (selectedPosts.size === 0) return;
    try {
      setStatus(shared ? 'Sharing posts...' : 'Unsharing posts...');
      const res = await fetch('/api/admin/scraped-posts', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ postIds: Array.from(selectedPosts), shared }),
      });
      const data = await res.json();
      if (data.success) { setStatus(`${shared ? 'Shared' : 'Unshared'} ${data.updated} posts`); setSelectedPosts(new Set()); fetchPosts(postsPage); }
      else setStatus(data.error || 'Failed');
    } catch (e: any) { setStatus('Error: ' + e.message); }
  };

  // ---- Tab 2: Inspiration Profiles ----
  const fetchInspProfiles = useCallback(async () => {
    setInspLoading(true);
    try {
      const res = await fetch('/api/admin/inspiration-profiles', { headers: { 'Authorization': `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setInspProfiles(data.profiles || []);
    } catch (e) { console.error(e); }
    finally { setInspLoading(false); }
  }, []);

  const toggleInspSelect = (key: string) => {
    setSelectedInspProfiles(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });
  };
  const shareSelectedInspProfiles = async (shared: boolean) => {
    if (selectedInspProfiles.size === 0) return;
    try {
      setStatus(shared ? 'Sharing profiles...' : 'Unsharing profiles...');
      const profilesToShare = inspProfiles.filter(p => selectedInspProfiles.has(`${p.userId}_${p.profileUrl}`));
      const res = await fetch('/api/admin/inspiration-profiles', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ profiles: profilesToShare, shared }),
      });
      const data = await res.json();
      if (data.success) { setStatus(`${shared ? 'Shared' : 'Unshared'} ${data.updated} profiles`); setSelectedInspProfiles(new Set()); fetchInspProfiles(); }
      else setStatus(data.error || 'Failed');
    } catch (e: any) { setStatus('Error: ' + e.message); }
  };

  // ---- Tab 3: Comment Profiles ----
  const fetchCommentProfiles = useCallback(async () => {
    setCommentLoading(true);
    try {
      const res = await fetch('/api/admin/comment-profiles', { headers: { 'Authorization': `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setCommentProfiles(data.profiles || []);
    } catch (e) { console.error(e); }
    finally { setCommentLoading(false); }
  }, []);

  const toggleCommentSelect = (id: string) => {
    setSelectedCommentProfiles(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const shareSelectedCommentProfiles = async (shared: boolean) => {
    if (selectedCommentProfiles.size === 0) return;
    try {
      setStatus(shared ? 'Sharing profiles...' : 'Unsharing profiles...');
      const res = await fetch('/api/admin/comment-profiles', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ profileIds: Array.from(selectedCommentProfiles), shared }),
      });
      const data = await res.json();
      if (data.success) { setStatus(`${shared ? 'Shared' : 'Unshared'} ${data.updated} profiles`); setSelectedCommentProfiles(new Set()); fetchCommentProfiles(); }
      else setStatus(data.error || 'Failed');
    } catch (e: any) { setStatus('Error: ' + e.message); }
  };

  useEffect(() => {
    if (activeTab === 'feed-posts') fetchPosts();
    else if (activeTab === 'inspiration') fetchInspProfiles();
    else if (activeTab === 'comments') fetchCommentProfiles();
  }, [activeTab, fetchPosts, fetchInspProfiles, fetchCommentProfiles]);

  const postsTotalPages = Math.ceil(postsTotal / 30);
  const tabStyle = (t: string) => ({
    padding: '12px 24px', fontWeight: activeTab === t ? '700' : '500', fontSize: '14px', cursor: 'pointer',
    background: activeTab === t ? '#693fe9' : 'white', color: activeTab === t ? 'white' : '#555',
    border: activeTab === t ? 'none' : '2px solid #e0e0e0', borderRadius: '10px', transition: 'all 0.2s',
  });
  const btnStyle = (bg: string) => ({ padding: '8px 18px', background: bg, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600' as const, cursor: 'pointer', fontSize: '13px' });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0' }}>📋 Scraped Content Management</h1>
          <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Manage & share scraped content with all users</p>
        </div>
      </div>

      {status && <div style={{ padding: '10px 16px', background: status.includes('Error') ? '#fee2e2' : '#d1fae5', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: status.includes('Error') ? '#dc2626' : '#059669' }}>{status}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('feed-posts')} style={tabStyle('feed-posts')}>📰 Feed Posts</button>
        <button onClick={() => setActiveTab('inspiration')} style={tabStyle('inspiration')}>✨ Inspiration Profiles</button>
        <button onClick={() => setActiveTab('comments')} style={tabStyle('comments')}>💬 Comment Profiles</button>
      </div>

      {/* ===== TAB 1: FEED POSTS ===== */}
      {activeTab === 'feed-posts' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="text" value={postsSearchInput} onChange={e => setPostsSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setPostsSearch(postsSearchInput); fetchPosts(1); } }}
              placeholder="Search post content or author..." style={{ flex: 1, minWidth: '200px', padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }} />
            <select value={postsSortBy} onChange={e => setPostsSortBy(e.target.value)} style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '13px' }}>
              <option value="scrapedAt">Date</option><option value="likes">Likes</option><option value="comments">Comments</option><option value="shares">Shares</option>
            </select>
            <select value={postsSortOrder} onChange={e => setPostsSortOrder(e.target.value)} style={{ padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '13px' }}>
              <option value="desc">Highest</option><option value="asc">Lowest</option>
            </select>
            <button onClick={() => { setPostsSearch(postsSearchInput); fetchPosts(1); }} style={btnStyle('#693fe9')}>🔍 Search</button>
          </div>

          {selectedPosts.size > 0 && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', padding: '12px 16px', background: '#f0f0ff', borderRadius: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#693fe9' }}>{selectedPosts.size} selected</span>
              <button onClick={() => shareSelectedPosts(true)} style={btnStyle('#10b981')}>✅ Share with All Users</button>
              <button onClick={() => shareSelectedPosts(false)} style={btnStyle('#ef4444')}>❌ Unshare</button>
            </div>
          )}

          <div style={{ marginBottom: '12px', fontSize: '13px', color: '#888' }}>{postsTotal} total posts</div>

          {postsLoading ? <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>Loading posts...</div> : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div><p style={{ color: '#999' }}>No scraped posts found</p></div>
          ) : (
            <>
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px 14px', textAlign: 'center', width: '40px' }}>
                        <input type="checkbox" checked={selectedPosts.size === posts.length && posts.length > 0} onChange={selectAllPosts} style={{ width: '16px', height: '16px', accentColor: '#693fe9' }} />
                      </th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', width: '60px', fontWeight: '600', color: '#444' }}>Shared</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '600', color: '#444' }}>User</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '600', color: '#444' }}>Author</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '600', color: '#444', maxWidth: '350px' }}>Post Content</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600', color: '#444' }}>❤️</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600', color: '#444' }}>💬</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '600', color: '#444' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post: any) => (
                      <tr key={post.id} style={{ borderBottom: '1px solid #f0f0f0', background: selectedPosts.has(post.id) ? '#f5f3ff' : 'transparent' }}>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <input type="checkbox" checked={selectedPosts.has(post.id)} onChange={() => togglePostSelect(post.id)} style={{ width: '16px', height: '16px', accentColor: '#693fe9' }} />
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          {post.isSharedByAdmin ? <span style={{ background: '#d1fae5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>SHARED</span> : <span style={{ color: '#ccc', fontSize: '11px' }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: '600', color: '#333', fontSize: '12px' }}>{post.user?.name || 'N/A'}</div>
                          <div style={{ color: '#999', fontSize: '11px' }}>{post.user?.email || ''}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}><div style={{ fontWeight: '500', color: '#555', fontSize: '13px' }}>{post.authorName || 'Unknown'}</div></td>
                        <td style={{ padding: '10px 14px', maxWidth: '350px' }}>
                          <div style={{ color: '#444', lineHeight: '1.4', maxHeight: '60px', overflow: 'hidden', fontSize: '12px' }}>{post.postContent?.substring(0, 180)}{post.postContent?.length > 180 ? '...' : ''}</div>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '600', color: '#ec4899' }}>{post.likes}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '600', color: '#8b5cf6' }}>{post.comments}</td>
                        <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: '#666', fontSize: '12px' }}>{new Date(post.scrapedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {postsTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px', alignItems: 'center' }}>
                  <button onClick={() => fetchPosts(postsPage - 1)} disabled={postsPage <= 1} style={{ padding: '8px 16px', background: postsPage <= 1 ? '#f0f0f0' : 'white', border: '2px solid #e0e0e0', borderRadius: '8px', cursor: postsPage <= 1 ? 'not-allowed' : 'pointer', color: postsPage <= 1 ? '#ccc' : '#333', fontSize: '13px' }}>← Prev</button>
                  <span style={{ color: '#666', fontSize: '14px' }}>Page {postsPage} of {postsTotalPages}</span>
                  <button onClick={() => fetchPosts(postsPage + 1)} disabled={postsPage >= postsTotalPages} style={{ padding: '8px 16px', background: postsPage >= postsTotalPages ? '#f0f0f0' : 'white', border: '2px solid #e0e0e0', borderRadius: '8px', cursor: postsPage >= postsTotalPages ? 'not-allowed' : 'pointer', color: postsPage >= postsTotalPages ? '#ccc' : '#333', fontSize: '13px' }}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ===== TAB 2: INSPIRATION PROFILES ===== */}
      {activeTab === 'inspiration' && (
        <div>
          {selectedInspProfiles.size > 0 && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', padding: '12px 16px', background: '#f0f0ff', borderRadius: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#693fe9' }}>{selectedInspProfiles.size} selected</span>
              <button onClick={() => shareSelectedInspProfiles(true)} style={btnStyle('#10b981')}>✅ Share with All Users</button>
              <button onClick={() => shareSelectedInspProfiles(false)} style={btnStyle('#ef4444')}>❌ Unshare</button>
            </div>
          )}

          {inspLoading ? <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>Loading inspiration profiles...</div> : inspProfiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div><p style={{ color: '#999' }}>No inspiration profiles found. Users need to scrape LinkedIn profiles first.</p></div>
          ) : (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'center', width: '40px' }}>
                      <input type="checkbox" checked={selectedInspProfiles.size === inspProfiles.length && inspProfiles.length > 0}
                        onChange={() => { if (selectedInspProfiles.size === inspProfiles.length) setSelectedInspProfiles(new Set()); else setSelectedInspProfiles(new Set(inspProfiles.map(p => `${p.userId}_${p.profileUrl}`))); }}
                        style={{ width: '16px', height: '16px', accentColor: '#693fe9' }} />
                    </th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', width: '60px', fontWeight: '600', color: '#444' }}>Shared</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '600', color: '#444' }}>Profile Name</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '600', color: '#444' }}>Profile URL</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600', color: '#444' }}>Posts</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '600', color: '#444' }}>Scraped By</th>
                  </tr>
                </thead>
                <tbody>
                  {inspProfiles.map((p: any, i: number) => {
                    const key = `${p.userId}_${p.profileUrl}`;
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: selectedInspProfiles.has(key) ? '#f5f3ff' : 'transparent' }}>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <input type="checkbox" checked={selectedInspProfiles.has(key)} onChange={() => toggleInspSelect(key)} style={{ width: '16px', height: '16px', accentColor: '#693fe9' }} />
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          {p.isShared ? <span style={{ background: '#d1fae5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>SHARED</span> : <span style={{ color: '#ccc', fontSize: '11px' }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 14px' }}><div style={{ fontWeight: '600', color: '#333' }}>{p.profileName}</div></td>
                        <td style={{ padding: '10px 14px' }}>
                          <a href={p.profileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#693fe9', textDecoration: 'none', fontSize: '12px' }}>{p.profileUrl}</a>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '700', color: '#8b5cf6' }}>{p.postCount}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontSize: '12px', color: '#555' }}>{p.user?.name || 'Unknown'}</div>
                          <div style={{ fontSize: '11px', color: '#999' }}>{p.user?.email || ''}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== TAB 3: COMMENT PROFILES ===== */}
      {activeTab === 'comments' && (
        <div>
          {selectedCommentProfiles.size > 0 && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', padding: '12px 16px', background: '#f0f0ff', borderRadius: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#693fe9' }}>{selectedCommentProfiles.size} selected</span>
              <button onClick={() => shareSelectedCommentProfiles(true)} style={btnStyle('#10b981')}>✅ Share with All Users</button>
              <button onClick={() => shareSelectedCommentProfiles(false)} style={btnStyle('#ef4444')}>❌ Unshare</button>
            </div>
          )}

          {commentLoading ? <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>Loading comment profiles...</div> : commentProfiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div><p style={{ color: '#999' }}>No comment profiles found. Users need to scrape LinkedIn comment profiles first.</p></div>
          ) : (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'center', width: '40px' }}>
                      <input type="checkbox" checked={selectedCommentProfiles.size === commentProfiles.length && commentProfiles.length > 0}
                        onChange={() => { if (selectedCommentProfiles.size === commentProfiles.length) setSelectedCommentProfiles(new Set()); else setSelectedCommentProfiles(new Set(commentProfiles.map((p: any) => p.id))); }}
                        style={{ width: '16px', height: '16px', accentColor: '#693fe9' }} />
                    </th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', width: '60px', fontWeight: '600', color: '#444' }}>Shared</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '600', color: '#444' }}>Profile Name</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '600', color: '#444' }}>Profile URL</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600', color: '#444' }}>Comments</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '600', color: '#444' }}>Scraped By</th>
                  </tr>
                </thead>
                <tbody>
                  {commentProfiles.map((p: any) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0', background: selectedCommentProfiles.has(p.id) ? '#f5f3ff' : 'transparent' }}>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <input type="checkbox" checked={selectedCommentProfiles.has(p.id)} onChange={() => toggleCommentSelect(p.id)} style={{ width: '16px', height: '16px', accentColor: '#693fe9' }} />
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {p.isSharedByAdmin ? <span style={{ background: '#d1fae5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>SHARED</span> : <span style={{ color: '#ccc', fontSize: '11px' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 14px' }}><div style={{ fontWeight: '600', color: '#333' }}>{p.profileName || p.profileId}</div></td>
                      <td style={{ padding: '10px 14px' }}>
                        <a href={p.profileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#693fe9', textDecoration: 'none', fontSize: '12px' }}>{p.profileUrl}</a>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '700', color: '#8b5cf6' }}>{p.commentCount || p._count?.comments || 0}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontSize: '12px', color: '#555' }}>{p.user?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '11px', color: '#999' }}>{p.user?.email || ''}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
