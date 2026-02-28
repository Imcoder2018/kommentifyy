import { useState, useEffect } from 'react';

export default function CommenterTab(props: any) {
    const {
        t, user, usage, router, miniIcon, showToast, setActiveTab, isFreePlan, showUpgradeModal, setShowUpgradeModal, dashLang, isDeveloper,
        commenterCfg, commenterCfgLoading, commenterCfgSaving, loadCommenterCfg, saveCommenterCfg, setCommenterCfg,
        csGoal, setCsGoal, csTone, setCsTone, csLength, setCsLength, csStyle, setCsStyle,
        csModel, setCsModel, csExpertise, setCsExpertise, csBackground, setCsBackground,
        csAutoPost, setCsAutoPost, csSettingsLoading, csSettingsSaving, saveCommentSettings,
    } = props;

    const [capturedPosts, setCapturedPosts] = useState<any[]>([]);
    const [capturedLoading, setCapturedLoading] = useState(false);
    const [capturedPage, setCapturedPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('scrapedAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [actionStates, setActionStates] = useState<Record<string, any>>({});
    const [aiGeneratedComments, setAiGeneratedComments] = useState<Record<string, string>>({});
    const [generatingComment, setGeneratingComment] = useState<string | null>(null);

    useEffect(() => {
        loadCapturedPosts();
    }, [capturedPage, sortBy, sortOrder]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (capturedPage === 1) {
                loadCapturedPosts();
            } else {
                setCapturedPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadCapturedPosts = async () => {
        setCapturedLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const params = new URLSearchParams({
                page: capturedPage.toString(),
                limit: '20',
                sortBy,
                sortOrder,
            });
            if (searchQuery.trim()) {
                params.append('search', searchQuery.trim());
            }
            const res = await fetch(`/api/scraped-posts?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setCapturedPosts(data.posts || []);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (e) {
            console.error('Failed to load captured posts:', e);
        } finally {
            setCapturedLoading(false);
        }
    };

    // Helper to extract LinkedIn URN from post URL
    // LinkedIn URLs: https://www.linkedin.com/feed/update/urn:li:activity:1234567890123456789/
    // Or: https://www.linkedin.com/posts/activity_1234567890123456789/
    const extractUrnFromUrl = (postUrl: string | null | undefined): string => {
        if (!postUrl) return '';
        // Try to extract from /feed/update/urn:li:activity: format
        const urnMatch = postUrl.match(/urn:li:activity:\d+/);
        if (urnMatch) return urnMatch[0];
        // Try to extract from /posts/activity_ format
        const activityMatch = postUrl.match(/activity_(\d+)/);
        if (activityMatch) return `urn:li:activity:${activityMatch[1]}`;
        // Return the original URL if no URN found - the extension may handle it
        return postUrl;
    };

    const generateAiComment = async (postId: string, post: any) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        setGeneratingComment(postId);
        try {
            const res = await fetch('/api/ai/generate-comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    postText: post.postContent || '',
                    authorName: post.authorName || '',
                    goal: csGoal || 'AddValue',
                    tone: csTone || 'Friendly',
                    commentLength: csLength || 'Short',
                    commentStyle: csStyle || 'direct',
                    userExpertise: csExpertise || '',
                    userBackground: csBackground || '',
                    model: csModel || '',
                })
            });
            const data = await res.json();
            if (data.success && data.content) {
                setAiGeneratedComments(prev => ({ ...prev, [postId]: data.content }));
                showToast('AI comment generated!', 'success');
            } else {
                showToast(data.error || 'Failed to generate comment', 'error');
            }
        } catch (e: any) {
            showToast('Error: ' + e.message, 'error');
        } finally {
            setGeneratingComment(null);
        }
    };

    const deletePost = async (postId: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        if (!confirm('Delete this post?')) return;

        try {
            const res = await fetch('/api/scraped-posts', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: postId })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Post deleted', 'success');
                loadCapturedPosts();
            } else {
                showToast(data.error || 'Failed to delete', 'error');
            }
        } catch (e: any) {
            showToast('Error: ' + e.message, 'error');
        }
    };

    const handleAction = async (postId: string, action: string, post: any, commentText?: string) => {
        const token = localStorage.getItem('authToken');
        setActionStates(prev => ({ ...prev, [`${postId}-${action}`]: 'loading' }));
        
        try {
            const commandMap: Record<string, any> = {
                like: { command: 'linkedin_like_post', data: { activityUrn: extractUrnFromUrl(post.postUrl) } },
                comment: { command: 'linkedin_comment_on_post', data: { activityUrn: extractUrnFromUrl(post.postUrl), commentText } },
                follow: { command: 'linkedin_follow_profile', data: { profileUrl: post.authorProfileUrl } }
            };
            
            const payload = commandMap[action];
            if (!payload) return;
            
            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (data.success) {
                setActionStates(prev => ({ ...prev, [`${postId}-${action}`]: 'success' }));
                showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} task sent!`, 'success');
                setTimeout(() => loadCapturedPosts(), 2000);
            } else {
                setActionStates(prev => ({ ...prev, [`${postId}-${action}`]: 'error' }));
                showToast(data.error || 'Failed', 'error');
            }
        } catch (e: any) {
            setActionStates(prev => ({ ...prev, [`${postId}-${action}`]: 'error' }));
            showToast('Error: ' + e.message, 'error');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(commenterCfgLoading || csSettingsLoading) ? (
                <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading settings...</div>
            ) : commenterCfg && (<>
                {/* Simplified Controls Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0' }}>Filters</h4>
                        {[
                            { key: 'minLikes', label: 'Min Likes', min: 0, max: 9999 },
                            { key: 'minComments', label: 'Min Comments', min: 0, max: 9999 },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{f.label}</span>
                                <input type="number" min={f.min} max={f.max} value={commenterCfg[f.key]} onChange={e => setCommenterCfg((p: any) => ({ ...p, [f.key]: parseInt(e.target.value) || 0 }))}
                                    style={{ width: '60px', padding: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px', textAlign: 'center' }} />
                            </div>
                        ))}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0' }}>Search Keywords</h4>
                        <textarea value={commenterCfg.searchKeywords} onChange={e => setCommenterCfg((p: any) => ({ ...p, searchKeywords: e.target.value }))}
                            placeholder="AI marketing&#10;SaaS growth" rows={2}
                            style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '11px', resize: 'vertical' }} />
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0' }}>Count</h4>
                        <input type="number" min={1} max={50} value={commenterCfg.totalPosts || 20} onChange={e => setCommenterCfg((p: any) => ({ ...p, totalPosts: parseInt(e.target.value) || 20 }))}
                            style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px', textAlign: 'center' }} />
                    </div>
                </div>

                {/* Quick Capture Buttons */}
                <div style={{ background: 'linear-gradient(135deg, rgba(0,119,181,0.1), rgba(0,160,220,0.05))', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(0,119,181,0.2)' }}>
                    <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', '#60a5fa', 14)} Quick Capture
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        <button onClick={async () => {
                            const token = localStorage.getItem('authToken');
                            if (!token) return;
                            showToast('Capturing feed posts...', 'info');
                            try {
                                const res = await fetch('/api/extension/command', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ command: 'linkedin_get_feed_api', data: { count: commenterCfg?.totalPosts || 20, minLikes: commenterCfg?.minLikes || 0, minComments: commenterCfg?.minComments || 0 } })
                                });
                                const data = await res.json();
                                if (data.success) showToast('Feed capture sent!', 'success');
                                else showToast(data.error || 'Failed', 'error');
                            } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
                        }}
                            style={{ padding: '10px 12px', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                            {miniIcon('M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4', 'white', 12)} Capture Feed
                        </button>
                        <button onClick={async () => {
                            const token = localStorage.getItem('authToken');
                            if (!token) return;
                            const kw = commenterCfg?.searchKeywords?.split('\n')?.[0]?.trim() || '';
                            if (!kw) { showToast('Enter search keywords first', 'error'); return; }
                            showToast(`Searching "${kw}"...`, 'info');
                            try {
                                const res = await fetch('/api/extension/command', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ command: 'linkedin_search_posts_api', data: { keyword: kw, count: commenterCfg?.totalPosts || 20, minLikes: commenterCfg?.minLikes || 0, minComments: commenterCfg?.minComments || 0 } })
                                });
                                const data = await res.json();
                                if (data.success) showToast('Search sent!', 'success');
                                else showToast(data.error || 'Failed', 'error');
                            } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
                        }}
                            style={{ padding: '10px 12px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                            {miniIcon('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', 'white', 12)} Search Posts
                        </button>
                        <button onClick={async () => {
                            const token = localStorage.getItem('authToken');
                            if (!token) return;
                            const kw = commenterCfg?.searchKeywords?.split('\n')?.[0]?.trim() || 'trending';
                            showToast(`Fetching trending...`, 'info');
                            try {
                                const res = await fetch('/api/extension/command', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ command: 'linkedin_get_trending_api', data: { keyword: kw, count: 20 } })
                                });
                                const data = await res.json();
                                if (data.success) showToast('Trending sent!', 'success');
                                else showToast(data.error || 'Failed', 'error');
                            } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
                        }}
                            style={{ padding: '10px 12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                            {miniIcon('M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', 'white', 12)} Trending
                        </button>
                    </div>
                </div>

                {/* Save Settings Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={async () => { await saveCommenterCfg(commenterCfg); await saveCommentSettings(); }} disabled={commenterCfgSaving || csSettingsSaving}
                        style={{ padding: '12px 24px', background: (commenterCfgSaving || csSettingsSaving) ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: (commenterCfgSaving || csSettingsSaving) ? 'wait' : 'pointer' }}>
                        {(commenterCfgSaving || csSettingsSaving) ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>

                {/* Captured Posts Feed */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {/* Search and Sort Controls */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>🔍</span>
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setCapturedPage(1); }}
                            style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', cursor: 'pointer' }}
                        >
                            <option value="scrapedAt" style={{ background: '#1a1a2e' }}>Most Recent</option>
                            <option value="likes" style={{ background: '#1a1a2e' }}>Most Likes</option>
                            <option value="comments" style={{ background: '#1a1a2e' }}>Most Comments</option>
                            <option value="shares" style={{ background: '#1a1a2e' }}>Most Shares</option>
                        </select>
                        <button onClick={() => { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }} disabled={capturedLoading}
                            style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', cursor: capturedLoading ? 'not-allowed' : 'pointer' }}>
                            {sortOrder === 'desc' ? '↓' : '↑'}
                        </button>
                        <button onClick={loadCapturedPosts} disabled={capturedLoading}
                            style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '12px', cursor: capturedLoading ? 'wait' : 'pointer' }}>
                            {capturedLoading ? '...' : '↻'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: 0 }}>Captured Posts ({capturedPosts.length})</h3>
                    </div>

                    {capturedLoading ? (
                        <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading posts...</div>
                    ) : capturedPosts.length === 0 ? (
                        <div style={{ color: 'rgba(255,255,255,0.4)', padding: '40px', textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>No posts captured yet</div>
                            <div style={{ fontSize: '12px' }}>Click "Capture Feed", "Search Posts", or "Trending" above to start</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {capturedPosts.map((post: any, idx: number) => {
                                const postId = post.id || idx;
                                const likeState = actionStates[`${postId}-like`];
                                const commentState = actionStates[`${postId}-comment`];
                                const followState = actionStates[`${postId}-follow`];
                                
                                return (
                                    <div key={postId} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                                        {/* Post Header */}
                                        <div style={{ padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px', flexShrink: 0 }}>
                                                {post.authorName?.charAt(0) || '?'}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{post.authorName || 'Unknown Author'}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                                                    {new Date(post.createdAt).toLocaleDateString()} · {post.source || 'feed'}
                                                </div>
                                            </div>
                                            {post.postUrl && (
                                                <a href={post.postUrl} target="_blank" rel="noopener noreferrer"
                                                    style={{ padding: '6px 12px', background: 'rgba(0,119,181,0.2)', color: '#60a5fa', border: '1px solid rgba(0,119,181,0.3)', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textDecoration: 'none' }}>
                                                    View on LinkedIn
                                                </a>
                                            )}
                                        </div>

                                        {/* Post Content with Scrollbar */}
                                        <div style={{ padding: '0 16px 12px 16px' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '200px', overflowY: 'auto' }}>
                                                {post.postContent || '(No content)'}
                                            </div>
                                        </div>

                                        {/* Engagement Stats */}
                                        <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '16px', fontSize: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.6)' }}>
                                                <span style={{ color: '#60a5fa' }}>👍</span> {post.likes || 0} likes
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.6)' }}>
                                                <span style={{ color: '#a78bfa' }}>💬</span> {post.comments || 0} comments
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.6)' }}>
                                                <span style={{ color: '#10b981' }}>🔄</span> {post.shares || 0} shares
                                            </div>
                                        </div>

                                        {/* AI Generated Comment Display */}
                                        {aiGeneratedComments[postId] && (
                                            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <span style={{ color: '#a78bfa', fontSize: '11px', fontWeight: '600' }}>🤖 AI Generated Comment</span>
                                                    <button onClick={() => setAiGeneratedComments(prev => { const n = { ...prev }; delete n[postId]; return n; })}
                                                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                                                </div>
                                                <textarea
                                                    value={aiGeneratedComments[postId]}
                                                    onChange={(e) => setAiGeneratedComments(prev => ({ ...prev, [postId]: e.target.value }))}
                                                    rows={3}
                                                    style={{ width: '100%', padding: '10px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '8px', color: 'white', fontSize: '12px', resize: 'vertical' }}
                                                />
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                    <button onClick={() => generateAiComment(postId, post)} disabled={generatingComment === postId}
                                                        style={{ flex: 1, padding: '8px', background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                                                        {generatingComment === postId ? '⏳ Generating...' : '🔄 Regenerate'}
                                                    </button>
                                                    <button onClick={() => { handleAction(postId, 'comment', post, aiGeneratedComments[postId]); setAiGeneratedComments(prev => { const n = { ...prev }; delete n[postId]; return n; }); }}
                                                        disabled={commentState === 'loading'}
                                                        style={{ flex: 1, padding: '8px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                                                        {commentState === 'loading' ? '⏳ Posting...' : '🚀 Post Comment'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div style={{ padding: '8px 16px 12px 16px', display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleAction(postId, 'like', post)}
                                                disabled={likeState === 'loading' || likeState === 'success'}
                                                style={{ flex: 1, padding: '8px', background: likeState === 'success' ? 'rgba(96,165,250,0.4)' : 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: likeState === 'loading' || likeState === 'success' ? 'not-allowed' : 'pointer', opacity: likeState === 'success' ? 0.7 : 1 }}>
                                                {likeState === 'loading' ? '⏳ Liking...' : likeState === 'success' ? '✓ Liked' : '👍 Like'}
                                            </button>
                                            <button
                                                onClick={() => generateAiComment(postId, post)}
                                                disabled={generatingComment === postId}
                                                style={{ flex: 1, padding: '8px', background: generatingComment === postId ? 'rgba(167,139,250,0.4)' : 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: generatingComment === postId ? 'not-allowed' : 'pointer', opacity: generatingComment === postId ? 0.7 : 1 }}>
                                                {generatingComment === postId ? '⏳ Generating...' : '🤖 AI Comment'}
                                            </button>
                                            {post.authorProfileUrl && (
                                                <button
                                                    onClick={() => handleAction(postId, 'follow', post)}
                                                    disabled={followState === 'loading' || followState === 'success'}
                                                    style={{ flex: 1, padding: '8px', background: followState === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: followState === 'loading' || followState === 'success' ? 'not-allowed' : 'pointer', opacity: followState === 'success' ? 0.7 : 1 }}>
                                                    {followState === 'loading' ? '⏳ Following...' : followState === 'success' ? '✓ Followed' : '➕ Follow'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <button
                                onClick={() => setCapturedPage(p => Math.max(1, p - 1))}
                                disabled={capturedPage === 1 || capturedLoading}
                                style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px', cursor: capturedPage === 1 ? 'not-allowed' : 'pointer', opacity: capturedPage === 1 ? 0.5 : 1 }}>
                                ← Prev
                            </button>
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', padding: '0 8px' }}>
                                Page {capturedPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCapturedPage(p => Math.min(totalPages, p + 1))}
                                disabled={capturedPage >= totalPages || capturedLoading}
                                style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px', cursor: capturedPage >= totalPages ? 'not-allowed' : 'pointer', opacity: capturedPage >= totalPages ? 0.5 : 1 }}>
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </>)}
        </div>
    );
}
