import { useState, useEffect } from 'react';

export default function CommenterTab(props: any) {
    const {
        t, user, usage, router, miniIcon, showToast, setActiveTab, isFreePlan, showUpgradeModal, setShowUpgradeModal, dashLang, isDeveloper,
        commenterCfg, commenterCfgLoading, commenterCfgSaving, loadCommenterCfg, saveCommenterCfg, setCommenterCfg,
        csGoal, setCsGoal, csTone, setCsTone, csLength, setCsLength, csStyle, setCsStyle,
        csModel, setCsModel, csExpertise, setCsExpertise, csBackground, setCsBackground,
        csAutoPost, setCsAutoPost, csSettingsLoading, csSettingsSaving, saveCommentSettings,
        autoDecideEnabled,
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
    const [showSettingsOverlay, setShowSettingsOverlay] = useState(false);
    const [pendingCommentData, setPendingCommentData] = useState<{ postId: string; post: any } | null>(null);
    const [overlaySettings, setOverlaySettings] = useState<{ mode: string; goal?: string; tone?: string; length?: string; style?: string; reasoning?: string } | null>(null);
    const [autoLikeEnabled, setAutoLikeEnabled] = useState(false);
    const [autoCommentEnabled, setAutoCommentEnabled] = useState(false);
    const [autoEngaging, setAutoEngaging] = useState(false);
    const [engagementProgress, setEngagementProgress] = useState<{
        phase: 'idle' | 'generating' | 'engaging';
        total: number;
        processed: number;
        currentComment: string;
    }>({ phase: 'idle', total: 0, processed: 0, currentComment: '' });
    const [engagementDelay, setEngagementDelay] = useState(10000); // Default 10 seconds

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

    // Track if we've already refreshed for a given capture
    const [lastRefreshKey, setLastRefreshKey] = useState<number>(0);

    // Listen for task completion events and auto-refresh captured posts
    useEffect(() => {
        let pollingInterval: NodeJS.Timeout | null = null;

        const handleTaskCompletion = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            // Skip if we're already engaging
            if (autoEngaging) return;

            try {
                const now = Date.now();

                const res = await fetch('/api/extension/command', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (data.success && data.commands) {
                    // Find recently completed capture commands (within last 60 seconds)
                    const recentCapture = data.commands.find((cmd: any) =>
                        ['linkedin_get_feed_api', 'linkedin_search_posts_api', 'linkedin_get_trending_api'].includes(cmd.command) &&
                        cmd.status === 'completed' &&
                        (now - new Date(cmd.createdAt).getTime()) < 60000
                    );

                    if (recentCapture) {
                        console.log('📝 COMMENTER: Capture task completed, refreshing posts...');
                        showToast('Capture complete! Refreshing posts...', 'info');

                        // Small delay to let posts be saved to DB
                        await new Promise(r => setTimeout(r, 3000));

                        // Refresh posts
                        await loadCapturedPosts();

                        // If auto-engage is enabled, trigger it
                        if (autoLikeEnabled || autoCommentEnabled) {
                            const minLikes = commenterCfg?.minLikes || 0;
                            const minComments = commenterCfg?.minComments || 0;

                            const freshRes = await fetch(`/api/scraped-posts?page=1&limit=20&sortBy=scrapedAt&sortOrder=desc`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const freshData = await freshRes.json();

                            if (freshData.success && freshData.posts?.length > 0) {
                                const qualifyingPosts = freshData.posts.filter((p: any) =>
                                    (p.likes || 0) >= minLikes && (p.comments || 0) >= minComments
                                );

                                if (qualifyingPosts.length > 0) {
                                    showToast(`Found ${qualifyingPosts.length} qualifying posts. Starting auto-engage...`, 'info');
                                    await autoEngageWithPosts(qualifyingPosts);
                                } else {
                                    showToast('No posts matching filters found', 'warning');
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Error checking task completion:', e);
            }
        };

        // Listen for task created event - trigger refresh after capture
        const handleTaskCreated = () => {
            console.log('📝 COMMENTER: Task created, scheduling refresh check...');
            // First check after 5 seconds, then poll for up to 60 seconds
            setTimeout(handleTaskCompletion, 5000);
            // Set up polling to catch delayed completions
            pollingInterval = setInterval(handleTaskCompletion, 5000);
            // Stop polling after 60 seconds
            setTimeout(() => {
                if (pollingInterval) clearInterval(pollingInterval);
            }, 60000);
        };

        window.addEventListener('kommentify-task-created', handleTaskCreated);

        return () => {
            window.removeEventListener('kommentify-task-created', handleTaskCreated);
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [autoLikeEnabled, autoCommentEnabled, autoEngaging, commenterCfg]);

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
                // Load AI comments from database into state
                const aiComments: Record<string, string> = {};
                (data.posts || []).forEach((post: any) => {
                    if (post.aiComment) {
                        aiComments[post.id] = post.aiComment;
                    }
                });
                if (Object.keys(aiComments).length > 0) {
                    setAiGeneratedComments(prev => ({ ...prev, ...aiComments }));
                }
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

    // Auto-engage with captured posts using BULK command (single task, single LinkedIn tab)
    const autoEngageWithPosts = async (posts: any[]) => {
        console.log('📝 COMMENTER: autoEngageWithPosts called with', posts.length, 'posts, autoLikeEnabled:', autoLikeEnabled, 'autoCommentEnabled:', autoCommentEnabled);
        if (!autoLikeEnabled && !autoCommentEnabled) return;
        if (posts.length === 0) return;

        const token = localStorage.getItem('authToken');
        if (!token) return;

        // Filter out already engaged posts (check actionStates)
        const unengagedPosts = posts.filter(post => {
            const postId = post.id || Math.random().toString(36).substr(2, 9);
            const likeDone = actionStates[`${postId}-like`] === 'success';
            const commentDone = actionStates[`${postId}-comment`] === 'success';

            // Skip if already liked (when autoLike enabled) AND already commented (when autoComment enabled)
            if (autoLikeEnabled && autoCommentEnabled) {
                return !(likeDone && commentDone);
            }
            if (autoLikeEnabled) {
                return !likeDone;
            }
            if (autoCommentEnabled) {
                return !commentDone;
            }
            return true;
        });

        if (unengagedPosts.length === 0) {
            showToast('All posts already engaged!', 'info');
            return;
        }

        if (unengagedPosts.length < posts.length) {
            showToast(`Skipping ${posts.length - unengagedPosts.length} already engaged posts`, 'info');
        }

        setAutoEngaging(true);
        setEngagementProgress({ phase: 'generating', total: unengagedPosts.length, processed: 0, currentComment: '' });
        showToast(`Preparing bulk engagement for ${unengagedPosts.length} posts...`, 'info');

        try {
            // Step 1: Generate AI comments for all posts first (if enabled)
            const postsWithComments = [];
            for (let i = 0; i < unengagedPosts.length; i++) {
                const post = unengagedPosts[i];
                const activityUrn = extractUrnFromUrl(post.postUrl);
                let commentText = '';

                // Generate AI comment if enabled
                if (autoCommentEnabled) {
                    try {
                        setEngagementProgress(prev => ({ ...prev, phase: 'generating', processed: i, currentComment: 'Analyzing post...' }));
                        const commentRes = await fetch('/api/ai/generate-comment', {
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
                        const commentData = await commentRes.json();
                        if (commentData.success && commentData.content) {
                            commentText = commentData.content;
                            // Store AI comment for display and save to database for persistence
                            setAiGeneratedComments(prev => ({ ...prev, [post.id || i]: commentText }));
                            if (post.id) {
                                saveAiCommentToDb(post.id, commentText);
                            }
                            setEngagementProgress(prev => ({ ...prev, currentComment: commentText }));
                        }
                    } catch (e) {
                        console.error('Failed to generate comment for post:', post.id, e);
                    }
                }

                postsWithComments.push({
                    postUrn: activityUrn,
                    postId: post.id,
                    enableLike: autoLikeEnabled,
                    enableComment: autoCommentEnabled,
                    commentText: commentText,
                });
            }

            // Step 2: Send single BULK command to extension (processes all posts in ONE LinkedIn tab)
            setEngagementProgress(prev => ({ ...prev, phase: 'engaging', processed: 0, currentComment: '' }));
            const bulkRes = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    command: 'warm_lead_bulk_engage',
                    data: {
                        posts: postsWithComments,
                        delayBetweenLeadsMs: engagementDelay, // User-configurable delay between posts
                    }
                })
            });

            const bulkData = await bulkRes.json();

            if (bulkData.success) {
                const { successCount, results } = bulkData.data || {};
                showToast(`Bulk engagement task sent! Processing ${unengagedPosts.length} posts in single LinkedIn tab.`, 'success');

                // Update UI with results
                results?.forEach((result: any) => {
                    if (result.postId) {
                        if (result.liked) {
                            setActionStates(prev => ({ ...prev, [`${result.postId}-like`]: 'success' }));
                        }
                        if (result.commented) {
                            setActionStates(prev => ({ ...prev, [`${result.postId}-comment`]: 'success' }));
                        }
                    }
                });

                window.dispatchEvent(new CustomEvent('kommentify-task-created'));
            } else {
                showToast(bulkData.error || 'Failed to send bulk engagement', 'error');
            }

        } catch (e: any) {
            console.error('Auto-engage error:', e);
            showToast('Error: ' + e.message, 'error');
        } finally {
            setAutoEngaging(false);
            setEngagementProgress({ phase: 'idle', total: 0, processed: 0, currentComment: '' });
            // Refresh posts to show updated state
            setTimeout(() => loadCapturedPosts(), 3000);
        }
    };

    // Trigger auto-engage after capture - loads posts and starts bulk engagement
    const triggerAutoEngageAfterCapture = async (token: string) => {
        console.log('📝 COMMENTER: triggerAutoEngageAfterCapture called, autoLikeEnabled:', autoLikeEnabled, 'autoCommentEnabled:', autoCommentEnabled);

        const minLikes = commenterCfg?.minLikes || 0;
        const minComments = commenterCfg?.minComments || 0;
        const count = commenterCfg?.totalPosts || 20;

        console.log('📝 COMMENTER: Filters - minLikes:', minLikes, 'minComments:', minComments, 'count:', count);

        try {
            // Load captured posts with filters
            const loadRes = await fetch(`/api/scraped-posts?page=1&limit=${count}&sortBy=scrapedAt&sortOrder=desc`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const loadData = await loadRes.json();
            console.log('📝 COMMENTER: Loaded posts:', loadData.posts?.length || 0);

            if (loadData.success && loadData.posts?.length > 0) {
                // Filter by minLikes and minComments
                const qualifyingPosts = loadData.posts.filter((p: any) =>
                    (p.likes || 0) >= minLikes && (p.comments || 0) >= minComments
                );

                console.log('📝 COMMENTER: Qualifying posts:', qualifyingPosts.length);

                if (qualifyingPosts.length > 0) {
                    showToast(`Found ${qualifyingPosts.length} qualifying posts. Starting auto-engage...`, 'info');
                    await autoEngageWithPosts(qualifyingPosts);
                } else {
                    console.log('📝 COMMENTER: No qualifying posts - showing warning');
                    showToast('No posts matching your filters found', 'warning');
                }
            } else {
                console.log('📝 COMMENTER: No posts loaded - showing warning');
                showToast('No posts captured yet. Try again in a moment.', 'warning');
            }
        } catch (e: any) {
            console.error('📝 COMMENTER: Error triggering auto-engage:', e);
            showToast('Error: ' + e.message, 'error');
        }
    };

    // Show settings overlay before generating comment
    const showSettingsPreview = (postId: string, post: any) => {
        if (autoDecideEnabled) {
            // Auto-decide mode - will call auto-decide API first
            setOverlaySettings({ mode: 'auto-decide', reasoning: 'AI will analyze this specific post and your profile to pick optimal settings automatically.' });
        } else {
            // Manual mode - show current user settings
            setOverlaySettings({
                mode: 'manual',
                goal: csGoal || 'AddValue',
                tone: csTone || 'Friendly',
                length: csLength || 'Short',
                style: csStyle || 'direct',
            });
        }
        setPendingCommentData({ postId, post });
        setShowSettingsOverlay(true);
    };

    // Proceed with actual comment generation after overlay确认
    const proceedToGenerate = async () => {
        setShowSettingsOverlay(false);
        const { postId, post } = pendingCommentData!;
        const token = localStorage.getItem('authToken');
        if (!token) return;

        setGeneratingComment(postId);
        setPendingCommentData(null);

        try {
            let finalGoal = csGoal || 'AddValue';
            let finalTone = csTone || 'Friendly';
            let finalLength = csLength || 'Short';
            let finalStyle = csStyle || 'direct';

            // If auto-decide is-decide API first
            if (autoDecideEnabled) {
                showToast('AI is analyzing this post to find optimal settings...', 'info');
                try {
                    const autoDecideRes = await fetch('/api/ai/auto-decide-comment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ postText: post.postContent || '', authorName: post.authorName || '', model: csModel }),
                    });
                    const autoDecideData = await autoDecideRes.json();
                    if (autoDecideData.success && autoDecideData.settings) {
                        finalGoal = autoDecideData.settings.goal || finalGoal;
                        finalTone = autoDecideData.settings.tone || finalTone;
                        finalLength = autoDecideData.settings.length || finalLength;
                        finalStyle = autoDecideData.settings.style || finalStyle;
                        // Update overlay with final settings for user to see
                        setOverlaySettings({
                            mode: 'auto-decide',
                            goal: finalGoal,
                            tone: finalTone,
                            length: finalLength,
                            style: finalStyle,
                            reasoning: autoDecideData.settings.reasoning || 'AI analyzed this post and chose optimal settings.'
                        });
                        showToast('Auto-decide complete! Generating comment with: ' + finalGoal + ' goal, ' + finalTone + ' tone', 'success');
                    }
                } catch (e) {
                    console.error('Auto-decide failed, using manual settings:', e);
                    showToast('Auto-decide failed, using your saved settings', 'warning');
                }
            }

            // Step 1: Generate AI comment with final settings
            const res = await fetch('/api/ai/generate-comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    postText: post.postContent || '',
                    authorName: post.authorName || '',
                    goal: finalGoal,
                    tone: finalTone,
                    commentLength: finalLength,
                    commentStyle: finalStyle,
                    userExpertise: csExpertise || '',
                    userBackground: csBackground || '',
                    model: csModel || '',
                })
            });
            const data = await res.json();

            if (!data.success || !data.content) {
                showToast(data.error || 'Failed to generate comment', 'error');
                return;
            }

            const commentText = data.content;
            setAiGeneratedComments(prev => ({ ...prev, [postId]: commentText }));
            // Save AI comment to database for persistence
            saveAiCommentToDb(postId, commentText);

            // DON'T auto-send - just show the generated comment for user to review and edit
            // User can click "Send" button manually to send
            showToast('AI comment generated! Edit and click Send to post.', 'success');
        } catch (e: any) {
            showToast('Error: ' + e.message, 'error');
        } finally {
            setGeneratingComment(null);
        }
    };

    // Generate AI comment and send to LinkedIn via Voyager API
    const generateAiComment = async (postId: string, post: any) => {
        // Show settings preview overlay first
        showSettingsPreview(postId, post);
    };

    // Save AI comment to database for persistence
    const saveAiCommentToDb = async (postId: string, comment: string) => {
        const token = localStorage.getItem('authToken');
        if (!token || !postId) return;
        try {
            await fetch('/api/scraped-posts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: postId, aiComment: comment })
            });
        } catch (e) {
            console.error('Failed to save AI comment to DB:', e);
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
                window.dispatchEvent(new CustomEvent('kommentify-task-created'));
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
        <>
            {/* Settings Preview Overlay */}
            {showSettingsOverlay && overlaySettings && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999
                }} onClick={() => setShowSettingsOverlay(false)}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1a1a3e, #2d2d5a)', padding: '24px', borderRadius: '16px',
                        maxWidth: '420px', width: '90%', border: '1px solid rgba(168,85,247,0.3)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: overlaySettings.mode === 'auto-decide' ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'linear-gradient(135deg, #0077b5, #00a0dc)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                            }}>
                                {overlaySettings.mode === 'auto-decide' ? '🤖' : '⚙️'}
                            </div>
                            <div>
                                <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '700' }}>
                                    {overlaySettings.mode === 'auto-decide' ? 'Auto Decide Mode' : 'Your Comment Settings'}
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0', fontSize: '12px' }}>
                                    {overlaySettings.mode === 'auto-decide' ? 'AI will optimize settings for this specific post' : 'These settings will be used for the comment'}
                                </p>
                            </div>
                        </div>

                        {overlaySettings.mode === 'manual' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px' }}>GOAL</div>
                                    <div style={{ color: '#a855f7', fontWeight: '600', fontSize: '13px' }}>{overlaySettings.goal}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px' }}>TONE</div>
                                    <div style={{ color: '#22c55e', fontWeight: '600', fontSize: '13px' }}>{overlaySettings.tone}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px' }}>LENGTH</div>
                                    <div style={{ color: '#f59e0b', fontWeight: '600', fontSize: '13px' }}>{overlaySettings.length}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px' }}>STYLE</div>
                                    <div style={{ color: '#3b82f6', fontWeight: '600', fontSize: '13px' }}>{overlaySettings.style}</div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(168,85,247,0.1)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(168,85,247,0.2)' }}>
                                <div style={{ color: '#c4b5fd', fontSize: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>✨</span> AI will analyze this post and your profile
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontStyle: 'italic' }}>
                                    "{overlaySettings.reasoning || 'Selecting optimal goal, tone, length, and style for maximum engagement'}"
                                </div>
                                {overlaySettings.goal && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>GOAL</div>
                                            <div style={{ color: '#a855f7', fontWeight: '600', fontSize: '12px' }}>{overlaySettings.goal}</div>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>TONE</div>
                                            <div style={{ color: '#22c55e', fontWeight: '600', fontSize: '12px' }}>{overlaySettings.tone}</div>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>LENGTH</div>
                                            <div style={{ color: '#f59e0b', fontWeight: '600', fontSize: '12px' }}>{overlaySettings.length}</div>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>STYLE</div>
                                            <div style={{ color: '#3b82f6', fontWeight: '600', fontSize: '12px' }}>{overlaySettings.style}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowSettingsOverlay(false)} style={{
                                flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                            }}>
                                Cancel
                            </button>
                            <button onClick={proceedToGenerate} disabled={generatingComment !== null} style={{
                                flex: 1, padding: '12px', background: overlaySettings.mode === 'auto-decide' ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'linear-gradient(135deg, #0077b5, #00a0dc)',
                                border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: generatingComment !== null ? 'wait' : 'pointer',
                                opacity: generatingComment !== null ? 0.7 : 1
                            }}>
                                {generatingComment !== null ? 'Generating...' : 'Generate Comment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {(commenterCfgLoading || csSettingsLoading) ? (
                <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading settings...</div>
            ) : commenterCfg && (<>
                {/* Simplified Controls Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
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
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0' }}>Auto-Engage</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button onClick={() => setAutoLikeEnabled(!autoLikeEnabled)} disabled={autoEngaging}
                                style={{
                                    padding: '8px 12px', background: autoLikeEnabled ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.08)',
                                    border: `1px solid ${autoLikeEnabled ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
                                    borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: '600', cursor: autoEngaging ? 'wait' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: autoEngaging ? 0.7 : 1
                                }}>
                                {autoLikeEnabled ? '✓' : '○'} Auto-Like
                            </button>
                            <button onClick={() => setAutoCommentEnabled(!autoCommentEnabled)} disabled={autoEngaging}
                                style={{
                                    padding: '8px 12px', background: autoCommentEnabled ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'rgba(255,255,255,0.08)',
                                    border: `1px solid ${autoCommentEnabled ? '#a855f7' : 'rgba(255,255,255,0.15)'}`,
                                    borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: '600', cursor: autoEngaging ? 'wait' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: autoEngaging ? 0.7 : 1
                                }}>
                                {autoCommentEnabled ? '✓' : '○'} Auto-Comment
                            </button>
                            {/* Delay Setting */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Delay:</span>
                                <input
                                    type="number"
                                    min={1000}
                                    max={60000}
                                    step={1000}
                                    value={engagementDelay}
                                    onChange={(e) => setEngagementDelay(parseInt(e.target.value) || 10000)}
                                    disabled={autoEngaging}
                                    style={{
                                        width: '70px', padding: '6px', background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px',
                                        color: 'white', fontSize: '11px', textAlign: 'center'
                                    }}
                                />
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>ms/post</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar for Auto-Engage */}
                {autoEngaging && (
                    <div style={{ marginBottom: '12px', padding: '12px', background: 'rgba(168,85,247,0.1)', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: '#c4b5fd', fontSize: '12px', fontWeight: '600' }}>
                                {engagementProgress.phase === 'generating' ? '🤖 Generating AI Comments...' :
                                 engagementProgress.phase === 'engaging' ? '🔥 Auto-Engaging Posts...' :
                                 '⏳ Processing...'}
                            </span>
                            <span style={{ color: '#c4b5fd', fontSize: '12px' }}>
                                {engagementProgress.processed}/{engagementProgress.total}
                            </span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${(engagementProgress.processed / Math.max(engagementProgress.total, 1)) * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #a855f7, #7c3aed)',
                                borderRadius: '4px',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                        {engagementProgress.currentComment && (
                            <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '4px' }}>AI Comment:</div>
                                <div style={{ color: 'white', fontSize: '11px', fontStyle: 'italic' }}>"{engagementProgress.currentComment.substring(0, 100)}..."</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 1: Capture */}
                <div style={{ background: 'linear-gradient(135deg, rgba(0,119,181,0.1), rgba(0,160,220,0.05))', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(0,119,181,0.2)' }}>
                    <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', '#60a5fa', 14)} Step 1: Capture
                        {(autoLikeEnabled || autoCommentEnabled) && (
                            <span style={{ marginLeft: 'auto', fontSize: '10px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', padding: '2px 8px', borderRadius: '10px' }}>
                                Auto {autoLikeEnabled && autoCommentEnabled ? 'Like+Comment' : autoLikeEnabled ? 'Like' : 'Comment'} ON
                            </span>
                        )}
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
                                console.log('📝 COMMENTER: Task created:', data.commandId, 'userId:', data._debug?.userId);
                                if (data.success) {
                                    const captureMsg = 'Feed capture sent!';
                                    showToast((autoLikeEnabled || autoCommentEnabled) ? `${captureMsg} Auto-engage will start shortly...` : captureMsg, 'success');
                                    window.dispatchEvent(new CustomEvent('kommentify-task-created'));
                                    // Auto-trigger engagement after capture if auto-like or auto-comment is enabled
                                    if (autoLikeEnabled || autoCommentEnabled) {
                                        console.log('📝 COMMENTER: Scheduling auto-engage in 5 seconds...');
                                        setTimeout(() => triggerAutoEngageAfterCapture(token), 15000);
                                    }
                                }
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
                            showToast(`Searching posts for "${kw}"...`, 'info');
                            try {
                                const res = await fetch('/api/extension/command', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ command: 'linkedin_search_posts_api', data: { keyword: kw, count: commenterCfg?.totalPosts || 20, minLikes: commenterCfg?.minLikes || 0, minComments: commenterCfg?.minComments || 0 } })
                                });
                                const data = await res.json();
                                if (data.success) {
                                    const captureMsg = 'Search capture sent! Check results in a moment.';
                                    showToast(autoLikeEnabled ? `${captureMsg} Auto-engage will start shortly...` : captureMsg, 'success');
                                    window.dispatchEvent(new CustomEvent('kommentify-task-created'));
                                    // Auto-trigger engagement after capture if enabled
                                    if (autoLikeEnabled || autoCommentEnabled) {
                                        console.log('📝 COMMENTER: Scheduling auto-engage in 5 seconds...');
                                        setTimeout(() => triggerAutoEngageAfterCapture(token), 15000);
                                    }
                                }
                                else showToast(data.error || 'Failed', 'error');
                            } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
                        }}
                            style={{ padding: '10px 12px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                            {miniIcon('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', 'white', 12)} Search Posts
                        </button>
                        <button onClick={async () => {
                            const token = localStorage.getItem('authToken');
                            if (!token) return;
                            showToast('Fetching trending posts...', 'info');
                            try {
                                const res = await fetch('/api/extension/command', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ command: 'linkedin_get_trending_api', data: { count: 20, minLikes: commenterCfg?.minLikes || 0, minComments: commenterCfg?.minComments || 0 } })
                                });
                                const data = await res.json();
                                if (data.success) {
                                    const captureMsg = 'Trending capture sent! Check results in a moment.';
                                    showToast(autoLikeEnabled ? `${captureMsg} Auto-engage will start shortly...` : captureMsg, 'success');
                                    window.dispatchEvent(new CustomEvent('kommentify-task-created'));
                                    // Auto-trigger engagement after capture if enabled
                                    if (autoLikeEnabled || autoCommentEnabled) {
                                        console.log('📝 COMMENTER: Scheduling auto-engage in 5 seconds...');
                                        setTimeout(() => triggerAutoEngageAfterCapture(token), 15000);
                                    }
                                }
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

                {/* Step 2: Engage */}
                <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(124,58,237,0.05))', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(168,85,247,0.2)', marginTop: '16px' }}>
                    <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {miniIcon('M13 10V3L4 14h7v7l9-11h-7z', '#c4b5fd', 14)} Step 2: Engage
                    </h4>
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
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {/* Delete All Button */}
                            {capturedPosts.length > 0 && (
                                <button onClick={async () => {
                                    if (!confirm(`Delete all ${capturedPosts.length} captured posts?`)) return;
                                    const token = localStorage.getItem('authToken');
                                    if (!token) return;
                                    try {
                                        const res = await fetch('/api/scraped-posts', {
                                            method: 'DELETE',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                            body: JSON.stringify({ deleteAll: true })
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            showToast('All posts deleted', 'success');
                                            loadCapturedPosts();
                                        } else {
                                            showToast(data.error || 'Failed to delete', 'error');
                                        }
                                    } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
                                }}
                                    style={{ padding: '8px 12px', background: 'rgba(220,38,38,0.2)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '6px', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}>
                                    🗑 Delete All
                                </button>
                            )}
                            {/* Auto-Engage All Button */}
                            {(autoLikeEnabled || autoCommentEnabled) && capturedPosts.length > 0 && (
                                <button onClick={() => autoEngageWithPosts(capturedPosts)} disabled={autoEngaging}
                                    style={{
                                        padding: '8px 16px', background: autoEngaging ? 'rgba(220,38,38,0.4)' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                        color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px',
                                        cursor: autoEngaging ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: autoEngaging ? 0.7 : 1
                                    }}>
                                    {autoEngaging ? '⏳ Engaging...' : `🔥 Auto-Engage All${autoLikeEnabled && autoCommentEnabled ? '' : (autoLikeEnabled ? ' (Like)' : ' (Comment)')}`}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar for Auto-Engage in Captured Posts */}
                    {autoEngaging && (
                        <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(168,85,247,0.1)', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ color: '#c4b5fd', fontSize: '12px', fontWeight: '600' }}>
                                    {engagementProgress.phase === 'generating' ? '🤖 Generating AI Comments...' :
                                     engagementProgress.phase === 'engaging' ? '🔥 Auto-Engaging Posts...' :
                                     '⏳ Processing...'}
                                </span>
                                <span style={{ color: '#c4b5fd', fontSize: '12px' }}>
                                    {engagementProgress.processed}/{engagementProgress.total}
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${(engagementProgress.processed / Math.max(engagementProgress.total, 1)) * 100}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #a855f7, #7c3aed)',
                                    borderRadius: '4px',
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                            {engagementProgress.currentComment && (
                                <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '4px' }}>AI Comment:</div>
                                    <div style={{ color: 'white', fontSize: '11px', fontStyle: 'italic' }}>"{engagementProgress.currentComment.substring(0, 100)}..."</div>
                                </div>
                            )}
                        </div>
                    )}

                    {capturedLoading ? (
                        <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading posts...</div>
                    ) : capturedPosts.length === 0 ? (
                        <div style={{ color: 'rgba(255,255,255,0.4)', padding: '40px', textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>No posts captured yet</div>
                            <div style={{ fontSize: '12px' }}>Click "Capture Feed", "Search Posts", or "Trending" above to start</div>
                        </div>
                    ) : (
                        /* LinkedIn-style 3-column grid */
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {capturedPosts.map((post: any, idx: number) => {
                                const postId = post.id || idx;
                                const likeState = actionStates[`${postId}-like`];
                                const commentState = actionStates[`${postId}-comment`];
                                const followState = actionStates[`${postId}-follow`];

                                return (
                                    <div key={postId} style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                        {/* LinkedIn-style Post Header */}
                                        <div style={{ padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                                                {post.authorName?.charAt(0) || '?'}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ color: '#0a0a0a', fontSize: '13px', fontWeight: '600', marginBottom: '1px', lineHeight: '1.3' }}>{post.authorName || 'Unknown Author'}</div>
                                                <div style={{ color: '#666666', fontSize: '11px', lineHeight: '1.3' }}>
                                                    {new Date(post.createdAt).toLocaleDateString()} · {post.source || 'feed'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Post Content */}
                                        <div style={{ padding: '0 14px 10px 14px' }}>
                                            <div style={{ color: '#1a1a1a', fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '100px', overflowY: 'auto', fontFamily: '-apple-system, system-ui, sans-serif' }}>
                                                {post.postContent?.length > 200 ? post.postContent.substring(0, 200) + '...' : post.postContent || '(No content)'}
                                            </div>
                                        </div>

                                        {/* Engagement Stats - LinkedIn style */}
                                        <div style={{ padding: '8px 14px', borderTop: '1px solid #e5e5e5', display: 'flex', gap: '12px', fontSize: '11px', color: '#666666' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span>👍</span> <span>{post.likes || 0}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span>💬</span> <span>{post.comments || 0}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span>🔄</span> <span>{post.shares || 0}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons - All in one line */}
                                        <div style={{ padding: '8px', display: 'flex', gap: '6px', borderTop: '1px solid #e5e5e5', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => handleAction(postId, 'like', post)}
                                                disabled={likeState === 'loading' || likeState === 'success'}
                                                style={{ flex: '1 1 auto', padding: '6px 10px', background: likeState === 'success' ? '#e8f4fd' : '#f3f6f8', color: '#0077b5', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: likeState === 'loading' || likeState === 'success' ? 'not-allowed' : 'pointer', opacity: likeState === 'success' ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', minWidth: '70px' }}>
                                                {likeState === 'loading' ? '...' : likeState === 'success' ? '✓' : '👍'} Like
                                            </button>
                                            <button
                                                onClick={() => generateAiComment(postId, post)}
                                                disabled={generatingComment === postId || (actionStates[`${postId}-comment`] === 'success')}
                                                style={{ flex: '1 1 auto', padding: '6px 10px', background: (actionStates[`${postId}-comment`] === 'success') ? '#e8f5e9' : (generatingComment === postId ? '#f3e8ff' : '#f3f6f8'), color: (actionStates[`${postId}-comment`] === 'success') ? '#16a34a' : '#9333ea', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: (generatingComment === postId || actionStates[`${postId}-comment`] === 'success') ? 'not-allowed' : 'pointer', opacity: (generatingComment === postId || actionStates[`${postId}-comment`] === 'success') ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', minWidth: '70px' }}>
                                                {generatingComment === postId ? '...' : (actionStates[`${postId}-comment`] === 'success') ? '✓ Sent' : '🤖 AI Comment'}
                                            </button>
                                            <button onClick={() => deletePost(post.id)}
                                                style={{ flex: '1 1 auto', padding: '6px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', minWidth: '70px' }}>
                                                🗑 Delete
                                            </button>
                                            {post.postUrl && (
                                                <a href={post.postUrl} target="_blank" rel="noopener noreferrer"
                                                    style={{ flex: '1 1 auto', padding: '6px 10px', background: '#0077b5', color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', minWidth: '70px' }}>
                                                    🔗 View
                                                </a>
                                            )}
                                        </div>

                                        {/* AI Generated Comment Display - Editable */}
                                        {aiGeneratedComments[postId] && (
                                            <div style={{ padding: '8px', background: actionStates[`${postId}-comment`] === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(168,85,247,0.1)', borderTop: `1px solid ${actionStates[`${postId}-comment`] === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(168,85,247,0.3)'}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                    <span style={{ color: actionStates[`${postId}-comment`] === 'success' ? '#16a34a' : '#a855f7', fontSize: '10px', fontWeight: '600' }}>
                                                        {actionStates[`${postId}-comment`] === 'success' ? '✓ Commented' : '🤖 AI Generated Comment'}
                                                    </span>
                                                    {actionStates[`${postId}-comment`] !== 'success' && (
                                                        <button
                                                            onClick={() => handleAction(postId, 'comment', post, aiGeneratedComments[postId])}
                                                            disabled={actionStates[`${postId}-comment`] === 'loading'}
                                                            style={{ padding: '4px 8px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', fontWeight: '600', cursor: actionStates[`${postId}-comment`] === 'loading' ? 'not-allowed' : 'pointer' }}>
                                                            {actionStates[`${postId}-comment`] === 'loading' ? '...' : '🚀 Send'}
                                                        </button>
                                                    )}
                                                </div>
                                                <textarea
                                                    value={aiGeneratedComments[postId]}
                                                    onChange={(e) => setAiGeneratedComments(prev => ({ ...prev, [postId]: e.target.value }))}
                                                    rows={3}
                                                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '6px', color: '#1a1a1a', fontSize: '11px', fontFamily: '-apple-system,system-ui,sans-serif', resize: 'vertical' }}
                                                />
                                            </div>
                                        )}

                                        {/* Engaged Status */}
                                        {(likeState === 'success' || actionStates[`${postId}-comment`] === 'success') && (
                                            <div style={{ padding: '4px 8px', background: 'rgba(34,197,94,0.15)', borderTop: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ color: '#16a34a', fontSize: '10px', fontWeight: '600' }}>✓ Engaged</span>
                                            </div>
                                        )}
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
        </>
    );
}
