'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReferralData {
    referralCode: string;
    referralLink: string;
    stats: {
        totalReferrals: number;
        totalPaidReferrals: number;
        totalRevenue: number;
        commission: number;
        commissionRate: string;
        minPayout: number;
        canRequestPayout: boolean;
    };
    referrals: Array<{
        id: string;
        name: string;
        joinedAt: string;
        hasPaid: boolean;
        totalPaid: number;
        planName: string;
    }>;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [copied, setCopied] = useState(false);
    const [showReferrals, setShowReferrals] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Writer tab state
    const [writerTopic, setWriterTopic] = useState('');
    const [writerTemplate, setWriterTemplate] = useState('lead_magnet');
    const [writerTone, setWriterTone] = useState('professional');
    const [writerLength, setWriterLength] = useState('1500');
    const [writerHashtags, setWriterHashtags] = useState(false);
    const [writerEmojis, setWriterEmojis] = useState(true);
    const [writerTargetAudience, setWriterTargetAudience] = useState('');
    const [writerKeyMessage, setWriterKeyMessage] = useState('');
    const [writerBackground, setWriterBackground] = useState('');
    const [writerContent, setWriterContent] = useState('');
    const [writerGenerating, setWriterGenerating] = useState(false);
    const [writerScheduleDate, setWriterScheduleDate] = useState('');
    const [writerScheduleTime, setWriterScheduleTime] = useState('');
    const [writerDrafts, setWriterDrafts] = useState<any[]>([]);
    const [writerStatus, setWriterStatus] = useState('');
    const [writerShowAdvanced, setWriterShowAdvanced] = useState(false);

    // Saved posts tab state
    const [savedPosts, setSavedPosts] = useState<any[]>([]);
    const [savedPostsLoading, setSavedPostsLoading] = useState(false);
    const [savedPostsPage, setSavedPostsPage] = useState(1);
    const [savedPostsTotal, setSavedPostsTotal] = useState(0);
    const [savedPostsSortBy, setSavedPostsSortBy] = useState('comments');
    const [savedPostsSortOrder, setSavedPostsSortOrder] = useState('desc');
    const [savedPostsSearch, setSavedPostsSearch] = useState('');

    // Feed schedule state
    const [feedSchedule, setFeedSchedule] = useState<any>(null);
    const [feedScheduleLoading, setFeedScheduleLoading] = useState(false);
    const [scheduleTimesInput, setScheduleTimesInput] = useState<string[]>(['09:00']);
    const [scheduleDuration, setScheduleDuration] = useState(5);
    const [scheduleMinLikes, setScheduleMinLikes] = useState(0);
    const [scheduleMinComments, setScheduleMinComments] = useState(0);
    const [scheduleKeywords, setScheduleKeywords] = useState('');
    const [scheduleActive, setScheduleActive] = useState(true);

    // Tasks tab state
    const [tasks, setTasks] = useState<any[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);

    // Trending Posts AI generation state
    const [trendingPeriod, setTrendingPeriod] = useState<string>('all');
    const [trendingSelectedPosts, setTrendingSelectedPosts] = useState<string[]>([]);
    const [trendingGenerating, setTrendingGenerating] = useState(false);
    const [trendingCustomPrompt, setTrendingCustomPrompt] = useState('');
    const [trendingGeneratedPosts, setTrendingGeneratedPosts] = useState<any[]>([]);
    const [trendingShowGenPreview, setTrendingShowGenPreview] = useState(false);
    const [trendingStatus, setTrendingStatus] = useState('');
    
    // Analysis state
    const [analysisResults, setAnalysisResults] = useState<any[]>([]);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    // Image attachment for generated posts (index -> base64 data URL)
    const [generatedPostImages, setGeneratedPostImages] = useState<Record<number, string>>({});
    // Button loading states for Post to LinkedIn (index -> loading)
    const [postingToLinkedIn, setPostingToLinkedIn] = useState<Record<number, boolean>>({});
    // Toast notification
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    // History tab state
    const [historyItems, setHistoryItems] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyFilter, setHistoryFilter] = useState<string>('all');
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotal, setHistoryTotal] = useState(0);

    // Inspiration Sources state
    const [inspirationProfiles, setInspirationProfiles] = useState<string>('');
    const [inspirationPostCount, setInspirationPostCount] = useState(10);
    const [inspirationScraping, setInspirationScraping] = useState(false);
    const [inspirationStatus, setInspirationStatus] = useState('');
    const [inspirationSources, setInspirationSources] = useState<any[]>([]);
    const [inspirationLoading, setInspirationLoading] = useState(false);
    const [inspirationUseAll, setInspirationUseAll] = useState(true);
    const [inspirationSelected, setInspirationSelected] = useState<string[]>([]);

    // Comment Style Sources state
    const [commentStyleProfiles, setCommentStyleProfiles] = useState<any[]>([]);
    const [commentStyleLoading, setCommentStyleLoading] = useState(false);
    const [commentStyleUrl, setCommentStyleUrl] = useState('');
    const [commentStyleScraping, setCommentStyleScraping] = useState(false);
    const [commentStyleStatus, setCommentStyleStatus] = useState('');
    const [commentStyleExpanded, setCommentStyleExpanded] = useState<string | null>(null);
    const [commentStyleComments, setCommentStyleComments] = useState<any[]>([]);
    const [commentStyleCommentsLoading, setCommentStyleCommentsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
            return;
        }

        // Validate token and get user info
        fetch('/api/auth/validate', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(data.user);
                    // Check if user has paid plan, if not redirect to plans
                    const userPlan = data.user?.plan;
                    // User has access if: has a plan with price > 0, OR has a lifetime plan, OR has a trial plan that hasn't expired
                    const hasPaidPlan = userPlan && (
                        (userPlan.price > 0 && !userPlan.isDefaultFreePlan) ||
                        userPlan.isLifetime ||
                        (userPlan.isTrialPlan && data.user?.trialEndsAt && new Date(data.user.trialEndsAt) > new Date())
                    );
                    if (!hasPaidPlan) {
                        router.push('/plans');
                        return;
                    }
                    // Fetch usage data
                    return fetch('/api/usage/daily', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                } else {
                    localStorage.removeItem('authToken');
                    router.push('/login');
                }
            })
            .then(res => res?.json())
            .then(data => {
                if (data?.success) {
                    setUsage(data);
                }
            })
            .catch(() => {
                router.push('/login');
            })
            .finally(() => setLoading(false));

        // Fetch referral data
        fetch('/api/referrals', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setReferralData(data);
                }
            })
            .catch(() => {});
    }, [router]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Writer functions
    const generatePost = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !writerTopic.trim()) { setWriterStatus('Please enter a topic'); return; }
        setWriterGenerating(true);
        setWriterStatus('Generating...');
        try {
            const res = await fetch('/api/ai/generate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    topic: writerTopic, template: writerTemplate, tone: writerTone,
                    length: writerLength, includeHashtags: writerHashtags, includeEmojis: writerEmojis,
                    targetAudience: writerTargetAudience, keyMessage: writerKeyMessage, userBackground: writerBackground
                }),
            });
            const data = await res.json();
            if (data.success) { setWriterContent(data.content); setWriterStatus('Post generated!'); }
            else setWriterStatus(data.error || 'Failed to generate');
        } catch (e: any) { setWriterStatus('Error: ' + e.message); }
        finally { setWriterGenerating(false); }
    };

    const saveDraft = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !writerContent.trim()) { setWriterStatus('No content to save'); return; }
        try {
            const res = await fetch('/api/post-drafts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: writerContent, topic: writerTopic, template: writerTemplate, tone: writerTone }),
            });
            const data = await res.json();
            if (data.success) { setWriterStatus('Draft saved!'); loadDrafts(); }
            else setWriterStatus(data.error || 'Failed to save');
        } catch (e: any) { setWriterStatus('Error: ' + e.message); }
    };

    const loadDrafts = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/post-drafts', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setWriterDrafts(data.drafts || []);
        } catch {}
    };

    const [writerPosting, setWriterPosting] = useState(false);
    const sendToExtension = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !writerContent.trim()) { setWriterStatus('No content to post'); return; }
        setWriterPosting(true);
        showToast('📤 Sending post to extension...', 'info');
        setWriterStatus('Sending to extension...');
        try {
            window.dispatchEvent(new CustomEvent('kommentify-post-to-linkedin', {
                detail: { content: writerContent }
            }));
            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ command: 'post_to_linkedin', data: { content: writerContent } }),
            });
            const data = await res.json();
            if (data.success) {
                setWriterStatus('✅ Command sent! Extension will auto-open LinkedIn and post your content.');
                showToast('✅ Post sent to extension! It will auto-open LinkedIn.', 'success');
                await saveToHistory('published_post', 'LinkedIn Post (Writer)', { content: writerContent, source: 'writer' });
            } else {
                setWriterStatus(data.error || 'Failed to send');
                showToast(data.error || 'Failed to send', 'error');
            }
        } catch (e: any) {
            setWriterStatus('Error: ' + e.message);
            showToast('Error: ' + e.message, 'error');
        } finally { setWriterPosting(false); }
    };

    const schedulePost = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !writerContent.trim()) { setWriterStatus('No content to schedule'); return; }
        if (!writerScheduleDate || !writerScheduleTime) { setWriterStatus('Please set date and time'); return; }
        try {
            const scheduledFor = new Date(`${writerScheduleDate}T${writerScheduleTime}`).toISOString();
            const res = await fetch('/api/post-drafts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: writerContent, topic: writerTopic, template: writerTemplate, tone: writerTone, scheduledFor }),
            });
            const data = await res.json();
            if (data.success) { setWriterStatus('Post scheduled!'); loadDrafts(); }
            else setWriterStatus(data.error || 'Failed to schedule');
        } catch (e: any) { setWriterStatus('Error: ' + e.message); }
    };

    const deleteDraft = async (id: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/post-drafts', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id }),
            });
            loadDrafts();
        } catch {}
    };

    // Saved posts functions
    const loadSavedPosts = async (page = 1) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setSavedPostsLoading(true);
        try {
            // Calculate date filter based on trending period
            let periodFilter = '';
            if (trendingPeriod === 'today') {
                const d = new Date(); d.setHours(0,0,0,0);
                periodFilter = d.toISOString();
            } else if (trendingPeriod === 'week') {
                const d = new Date(); d.setDate(d.getDate() - 7);
                periodFilter = d.toISOString();
            } else if (trendingPeriod === 'month') {
                const d = new Date(); d.setMonth(d.getMonth() - 1);
                periodFilter = d.toISOString();
            }
            const params = new URLSearchParams({
                page: page.toString(), limit: '20',
                sortBy: savedPostsSortBy, sortOrder: savedPostsSortOrder,
                ...(savedPostsSearch && { search: savedPostsSearch }),
                ...(periodFilter && { since: periodFilter }),
            });
            const res = await fetch(`/api/scraped-posts?${params}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setSavedPosts(data.posts || []);
                setSavedPostsTotal(data.pagination?.total || 0);
                setSavedPostsPage(page);
            }
        } catch {} finally { setSavedPostsLoading(false); }
    };

    const deleteSavedPost = async (id: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/scraped-posts', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id }),
            });
            loadSavedPosts(savedPostsPage);
        } catch {}
    };

    // Feed schedule functions
    const loadFeedSchedule = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setFeedScheduleLoading(true);
        try {
            const res = await fetch('/api/feed-schedules', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success && data.schedule) {
                setFeedSchedule(data.schedule);
                const times = JSON.parse(data.schedule.scheduleTimes || '["09:00"]');
                setScheduleTimesInput(times);
                setScheduleDuration(data.schedule.durationMinutes || 5);
                setScheduleMinLikes(data.schedule.minLikes || 0);
                setScheduleMinComments(data.schedule.minComments || 0);
                setScheduleKeywords(data.schedule.keywords || '');
                setScheduleActive(data.schedule.isActive);
            }
        } catch {} finally { setFeedScheduleLoading(false); }
    };

    const saveFeedSchedule = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/feed-schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    scheduleTimes: scheduleTimesInput, durationMinutes: scheduleDuration,
                    isActive: scheduleActive, minLikes: scheduleMinLikes,
                    minComments: scheduleMinComments, keywords: scheduleKeywords,
                }),
            });
            const data = await res.json();
            if (data.success) { setFeedSchedule(data.schedule); setWriterStatus('Schedule saved!'); }
        } catch {}
    };

    // Inspiration Sources functions
    const loadInspirationSources = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setInspirationLoading(true);
        try {
            const res = await fetch('/api/vector/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ query: '', limit: 100 }),
            });
            const data = await res.json();
            if (data.success) {
                // Group by source name
                const sourcesMap: Record<string, { name: string; profileUrl: string; count: number }> = {};
                (data.results || []).forEach((r: any) => {
                    const srcName = r.metadata?.sourceName || r.metadata?.authorName || 'Unknown';
                    const srcUrl = r.metadata?.profileUrl || '';
                    if (!sourcesMap[srcName]) {
                        sourcesMap[srcName] = { name: srcName, profileUrl: srcUrl, count: 0 };
                    }
                    sourcesMap[srcName].count++;
                });
                setInspirationSources(Object.values(sourcesMap));
            }
        } catch {} finally { setInspirationLoading(false); }
    };

    const scrapeInspirationProfiles = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) { setInspirationStatus('Not authenticated'); return; }
        const urls = inspirationProfiles.split('\n').map(u => u.trim()).filter(u => u.includes('linkedin.com/in/'));
        if (urls.length === 0) { setInspirationStatus('Please enter valid LinkedIn profile URLs (one per line)'); return; }
        setInspirationScraping(true);
        setInspirationStatus(`Scraping ${urls.length} profile(s)... Extension will open tabs.`);
        try {
            for (let i = 0; i < urls.length; i++) {
                setInspirationStatus(`Scraping profile ${i + 1}/${urls.length}: ${urls[i].split('/in/')[1]?.split('/')[0] || 'profile'}...`);
                // Send command to extension via API
                const res = await fetch('/api/extension/command', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ command: 'scrape_profile', data: { profileUrl: urls[i], postCount: inspirationPostCount } }),
                });
                const data = await res.json();
                if (!data.success) {
                    setInspirationStatus(`Failed to queue profile ${i + 1}: ${data.error}`);
                    continue;
                }
            }
            // Trigger extension to pick up commands immediately
            window.dispatchEvent(new CustomEvent('kommentify-post-to-linkedin', { detail: { command: 'scrape_profile' } }));
            setInspirationStatus(`✅ ${urls.length} profile(s) queued for scraping! Extension will process them.`);
            setInspirationProfiles('');
            // Reload sources after a delay
            setTimeout(() => loadInspirationSources(), 15000);
        } catch (e: any) { setInspirationStatus('Error: ' + e.message); }
        finally { setInspirationScraping(false); }
    };

    const deleteInspirationSource = async (sourceName: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/vector/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ sourceName }),
            });
            loadInspirationSources();
        } catch {}
    };

    // Comment Style Sources functions
    const loadCommentStyleProfiles = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setCommentStyleLoading(true);
        try {
            const res = await fetch('/api/scraped-comments', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setCommentStyleProfiles(data.profiles || []);
        } catch {} finally { setCommentStyleLoading(false); }
    };

    const scrapeCommentStyle = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const url = commentStyleUrl.trim();
        if (!url.includes('linkedin.com/in/')) { setCommentStyleStatus('Please enter a valid LinkedIn profile URL'); return; }
        setCommentStyleScraping(true);
        setCommentStyleStatus('Sending scrape command to extension...');
        try {
            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ command: 'scrape_comments', data: { profileUrl: url } }),
            });
            const data = await res.json();
            if (data.success) {
                setCommentStyleStatus('✅ Command sent! Extension will scrape comments from this profile.');
                showToast('📤 Comment scraping command sent to extension!', 'info');
                setCommentStyleUrl('');
                setTimeout(() => loadCommentStyleProfiles(), 30000);
            } else {
                setCommentStyleStatus(data.error || 'Failed to send command');
                showToast(data.error || 'Failed', 'error');
            }
        } catch (e: any) { setCommentStyleStatus('Error: ' + e.message); }
        finally { setCommentStyleScraping(false); }
    };

    const loadProfileComments = async (profileId: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setCommentStyleCommentsLoading(true);
        try {
            const res = await fetch(`/api/scraped-comments?profileId=${profileId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setCommentStyleComments(data.comments || []);
        } catch {} finally { setCommentStyleCommentsLoading(false); }
    };

    const toggleCommentTop = async (commentId: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/scraped-comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action: 'toggleTop', commentId }),
            });
            // Refresh comments
            setCommentStyleComments(prev => prev.map(c => c.id === commentId ? { ...c, isTopComment: !c.isTopComment } : c));
        } catch {}
    };

    const toggleProfileSelect = async (profileId: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/scraped-comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action: 'toggleSelect', profileId }),
            });
            setCommentStyleProfiles(prev => prev.map(p => p.id === profileId ? { ...p, isSelected: !p.isSelected } : p));
        } catch {}
    };

    const deleteCommentStyleProfile = async (profileId: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch(`/api/scraped-comments?profileId=${profileId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            setCommentStyleProfiles(prev => prev.filter(p => p.id !== profileId));
            if (commentStyleExpanded === profileId) { setCommentStyleExpanded(null); setCommentStyleComments([]); }
            showToast('Profile and comments deleted', 'success');
        } catch {}
    };

    // Tasks functions
    const loadTasks = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setTasksLoading(true);
        try {
            const res = await fetch('/api/extension/command/all', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setTasks(data.commands || []);
        } catch {} finally { setTasksLoading(false); }
    };

    const stopAllTasks = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            // Tell extension to stop
            window.dispatchEvent(new CustomEvent('kommentify-stop-all-tasks'));
            // Cancel on server
            await fetch('/api/extension/command/stop-all', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            // Reload tasks
            setTimeout(() => loadTasks(), 1000);
        } catch {}
    };

    // Trending AI generation
    const generateTrendingPosts = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const selected = savedPosts.filter(p => trendingSelectedPosts.includes(p.id));
        if (selected.length === 0) { setTrendingStatus('Please select at least 1 trending post'); return; }
        if (selected.length > 10) { setTrendingStatus('Maximum 10 posts allowed'); return; }
        setTrendingGenerating(true);
        setTrendingStatus('Generating viral posts from trending patterns...');
        setTrendingShowGenPreview(false);
        try {
            const res = await fetch('/api/ai/generate-trending', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ trendingPosts: selected, customPrompt: trendingCustomPrompt }),
            });
            const data = await res.json();
            if (data.success && data.posts) {
                setTrendingGeneratedPosts(data.posts);
                setTrendingShowGenPreview(true);
                setTrendingStatus(`✅ Generated ${data.posts.length} viral posts!`);
                setGeneratedPostImages({});
                // Save to history
                await saveToHistory('ai_generated', `AI Generated ${data.posts.length} Posts`, data.posts, { customPrompt: trendingCustomPrompt, selectedCount: selected.length });
            } else setTrendingStatus(data.error || 'Generation failed');
        } catch (e: any) { setTrendingStatus('Error: ' + e.message); }
        finally { setTrendingGenerating(false); }
    };

    // Analysis function
    const analyzePosts = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        if (trendingGeneratedPosts.length === 0) { setTrendingStatus('Generate posts first before analyzing'); return; }
        const selected = savedPosts.filter(p => trendingSelectedPosts.includes(p.id));
        if (selected.length === 0) { setTrendingStatus('Select some trending posts first'); return; }
        setAnalysisLoading(true);
        setShowAnalysis(false);
        setTrendingStatus('Analyzing posts for viral potential...');
        try {
            // Mix AI posts with trending posts - AI posts go at the end
            const allPosts = [
                ...selected.map(p => ({ content: p.postContent, source: 'trending' })),
                ...trendingGeneratedPosts.map(p => ({ content: p.content, source: 'ai' })),
            ];
            const aiPostIndices = allPosts.map((p, i) => p.source === 'ai' ? i : -1).filter(i => i >= 0);
            
            const res = await fetch('/api/ai/analyze-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ allPosts, aiPostIndices }),
            });
            const data = await res.json();
            if (data.success && data.analysis) {
                setAnalysisResults(data.analysis);
                setShowAnalysis(true);
                setTrendingStatus('✅ Analysis complete!');
                // Save to history
                await saveToHistory('viral_analysis', 'Viral Potential Analysis', data.analysis, { postCount: allPosts.length, aiPostCount: aiPostIndices.length });
            } else setTrendingStatus(data.error || 'Analysis failed');
        } catch (e: any) { setTrendingStatus('Error: ' + e.message); }
        finally { setAnalysisLoading(false); }
    };

    // Toast notification helper
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // History functions
    const loadHistory = async (page = 1) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setHistoryLoading(true);
        try {
            const typeParam = historyFilter === 'all' ? '' : historyFilter;
            const res = await fetch(`/api/history?page=${page}&limit=20${typeParam ? `&type=${typeParam}` : ''}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setHistoryItems(data.items || []);
                setHistoryTotal(data.total || 0);
                setHistoryPage(page);
            }
        } catch {} finally { setHistoryLoading(false); }
    };

    const saveToHistory = async (type: string, title: string, content: any, metadata?: any) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ type, title, content: JSON.stringify(content), metadata: metadata ? JSON.stringify(metadata) : null }),
            });
        } catch {}
    };

    const deleteHistoryItem = async (id: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch(`/api/history?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            loadHistory(historyPage);
        } catch {}
    };

    const postGeneratedToLinkedIn = async (content: string, imageDataUrl?: string, postIndex?: number) => {
        const token = localStorage.getItem('authToken');
        if (!token || !content.trim()) return;
        if (postIndex !== undefined) setPostingToLinkedIn(prev => ({ ...prev, [postIndex]: true }));
        showToast('📤 Sending post to extension...', 'info');
        try {
            const cmdData: any = { content };
            if (imageDataUrl) cmdData.imageDataUrl = imageDataUrl;
            window.dispatchEvent(new CustomEvent('kommentify-post-to-linkedin', { detail: cmdData }));
            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ command: 'post_to_linkedin', data: cmdData }),
            });
            const data = await res.json();
            if (data.success) {
                showToast('✅ Post sent to extension! It will auto-open LinkedIn.', 'success');
                setTrendingStatus('✅ Post sent to extension! It will auto-open LinkedIn.');
                // Save to history as published post
                await saveToHistory('published_post', 'LinkedIn Post', { content, hasImage: !!imageDataUrl });
            } else {
                showToast(data.error || 'Failed to send', 'error');
                setTrendingStatus(data.error || 'Failed');
            }
        } catch (e: any) {
            showToast('Error: ' + e.message, 'error');
            setTrendingStatus('Error: ' + e.message);
        } finally {
            if (postIndex !== undefined) setPostingToLinkedIn(prev => ({ ...prev, [postIndex]: false }));
        }
    };

    const handleImageAttach = (index: number, file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setGeneratedPostImages(prev => ({ ...prev, [index]: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
    };

    // Load data when tabs become active
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (tabId === 'writer') { loadDrafts(); loadInspirationSources(); loadCommentStyleProfiles(); }
        if (tabId === 'trending-posts') loadSavedPosts();
        if (tabId === 'tasks') loadTasks();
        if (tabId === 'feed-schedule') loadFeedSchedule();
        if (tabId === 'history') loadHistory();
    };

    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)'
            }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'spin 1s linear infinite' }}>⚡</div>
                    <div style={{ fontSize: '18px', opacity: 0.8 }}>Loading your dashboard...</div>
                </div>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    const navItems = [
        { id: 'overview', label: 'Overview', icon: '🏠' },
        { id: 'writer', label: 'Post Writer', icon: '✍️' },
        { id: 'trending-posts', label: 'Trending Posts', icon: '🔥' },
        { id: 'tasks', label: 'Tasks', icon: '📋' },
        { id: 'history', label: 'History', icon: '📜' },
        { id: 'feed-schedule', label: 'Feed Schedule', icon: '⏰' },
        { id: 'usage', label: 'Usage & Limits', icon: '📊' },
        { id: 'referrals', label: 'Referrals', icon: '🎁' },
        { id: 'extension', label: 'Extension', icon: '🧩' },
    ];

    const settingsItems = [
        { id: 'account', label: 'Account', icon: '👤' },
        { id: 'billing', label: 'Billing', icon: '💳', action: () => router.push('/plans') },
    ];

    return (
        <div style={{ 
            fontFamily: 'system-ui, -apple-system, sans-serif', 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
            display: 'flex'
        }}>
            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '24px', right: '24px', zIndex: 10000,
                    padding: '14px 24px', borderRadius: '14px', fontSize: '14px', fontWeight: '600',
                    color: 'white', boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                    animation: 'slideIn 0.3s ease-out',
                    background: toast.type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                               toast.type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                               'linear-gradient(135deg, #3b82f6, #2563eb)',
                    border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.5)' : toast.type === 'error' ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.5)'}`,
                    display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '400px',
                }}>
                    {toast.message}
                    <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px', opacity: 0.7, marginLeft: '8px' }}>✕</button>
                </div>
            )}
            <style>{`@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
            {/* Professional Sidebar */}
            <div style={{
                width: sidebarCollapsed ? '80px' : '260px',
                background: 'rgba(15, 15, 35, 0.95)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
                zIndex: 100,
                backdropFilter: 'blur(20px)'
            }}>
                {/* Logo Section */}
                <div style={{ 
                    padding: sidebarCollapsed ? '24px 16px' : '24px 20px', 
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src="/logo32x32-2.png" alt="Kommentify" style={{ width: '36px', height: '36px' }} />
                        {!sidebarCollapsed && (
                            <span style={{ 
                                fontSize: '20px', 
                                fontWeight: '700', 
                                background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>Kommentify</span>
                        )}
                    </div>
                    {!sidebarCollapsed && (
                        <button 
                            onClick={() => setSidebarCollapsed(true)}
                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '18px' }}
                        >
                            ◀
                        </button>
                    )}
                </div>

                {/* User Profile Card */}
                {!sidebarCollapsed && (
                    <div style={{ 
                        margin: '20px 16px', 
                        padding: '16px',
                        background: 'linear-gradient(135deg, rgba(105,63,233,0.2) 0%, rgba(139,92,246,0.1) 100%)',
                        borderRadius: '16px',
                        border: '1px solid rgba(105,63,233,0.3)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ 
                                width: '44px', 
                                height: '44px', 
                                borderRadius: '12px', 
                                background: 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '18px',
                                fontWeight: '700',
                                boxShadow: '0 4px 15px rgba(105,63,233,0.4)'
                            }}>
                                {user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.name || 'User'}
                                </div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.email || ''}
                                </div>
                            </div>
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: 'rgba(16,185,129,0.15)',
                            borderRadius: '8px',
                            border: '1px solid rgba(16,185,129,0.3)'
                        }}>
                            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                                {user?.plan?.name || 'Free'} Plan
                            </span>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                ${user?.plan?.price || 0}/mo
                            </span>
                        </div>
                    </div>
                )}

                {/* Collapsed User Avatar */}
                {sidebarCollapsed && (
                    <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ 
                            width: '44px', 
                            height: '44px', 
                            borderRadius: '12px', 
                            background: 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: '700'
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
                    {!sidebarCollapsed && (
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', paddingLeft: '12px', letterSpacing: '1.5px', fontWeight: '600' }}>
                            Dashboard
                        </div>
                    )}
                    
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            title={sidebarCollapsed ? item.label : undefined}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                width: '100%',
                                padding: sidebarCollapsed ? '14px' : '12px 16px',
                                background: activeTab === item.id 
                                    ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)'
                                    : 'transparent',
                                color: activeTab === item.id ? 'white' : 'rgba(255,255,255,0.6)',
                                border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                marginBottom: '6px',
                                transition: 'all 0.2s ease',
                                fontWeight: activeTab === item.id ? '600' : '500',
                                fontSize: '14px',
                                gap: '12px'
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}

                    {!sidebarCollapsed && (
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '24px 0 12px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>
                            Settings
                        </div>
                    )}

                    {sidebarCollapsed && <div style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>}

                    {settingsItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => item.action ? item.action() : setActiveTab(item.id)}
                            title={sidebarCollapsed ? item.label : undefined}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                width: '100%',
                                padding: sidebarCollapsed ? '14px' : '12px 16px',
                                background: activeTab === item.id 
                                    ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)'
                                    : 'transparent',
                                color: activeTab === item.id ? 'white' : 'rgba(255,255,255,0.6)',
                                border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                marginBottom: '6px',
                                transition: 'all 0.2s ease',
                                fontWeight: activeTab === item.id ? '600' : '500',
                                fontSize: '14px',
                                gap: '12px'
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}
                </div>

                {/* Logout Button */}
                <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                        onClick={() => {
                            localStorage.removeItem('authToken');
                            router.push('/login');
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                            width: '100%',
                            padding: sidebarCollapsed ? '14px' : '12px 16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            gap: '12px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>🚪</span>
                        {!sidebarCollapsed && 'Logout'}
                    </button>

                    {sidebarCollapsed && (
                        <button 
                            onClick={() => setSidebarCollapsed(false)}
                            style={{ 
                                width: '100%', 
                                marginTop: '12px',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '12px',
                                color: 'rgba(255,255,255,0.6)', 
                                cursor: 'pointer', 
                                fontSize: '18px' 
                            }}
                        >
                            ▶
                        </button>
                    )}
                </div>
            </div>
            
            {/* Main Content */}
            <div style={{ 
                flex: 1, 
                marginLeft: sidebarCollapsed ? '80px' : '260px',
                padding: '30px 40px',
                transition: 'margin-left 0.3s ease',
                minHeight: '100vh'
            }}>
                {/* Page Header */}
                <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px'
                }}>
                    <div>
                        <h1 style={{ 
                            fontSize: '32px', 
                            fontWeight: '800',
                            color: 'white',
                            margin: 0,
                            marginBottom: '8px'
                        }}>
                            {activeTab === 'overview' && 'Welcome back, ' + (user?.name?.split(' ')[0] || 'User') + '! 👋'}
                            {activeTab === 'writer' && 'Post Writer ✍️'}
                            {activeTab === 'saved-posts' && 'Saved Posts 📋'}
                            {activeTab === 'feed-schedule' && 'Feed Schedule ⏰'}
                            {activeTab === 'usage' && 'Usage & Limits'}
                            {activeTab === 'referrals' && 'Referral Program'}
                            {activeTab === 'extension' && 'Chrome Extension'}
                            {activeTab === 'account' && 'Account Settings'}
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', margin: 0 }}>
                            {activeTab === 'overview' && 'Here\'s what\'s happening with your LinkedIn automation'}
                            {activeTab === 'writer' && 'Create AI-powered LinkedIn posts and publish via extension'}
                            {activeTab === 'saved-posts' && 'View and manage posts saved from your LinkedIn feed'}
                            {activeTab === 'feed-schedule' && 'Schedule automatic feed scraping and post saving'}
                            {activeTab === 'usage' && 'Monitor your daily usage and plan limits'}
                            {activeTab === 'referrals' && 'Earn 30% commission on every paid referral'}
                            {activeTab === 'extension' && 'Install the Chrome extension to get started'}
                            {activeTab === 'account' && 'Manage your account settings'}
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => router.push('/plans')}
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            boxShadow: '0 4px 15px rgba(105,63,233,0.4)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>⚡</span>
                        Manage Plan
                    </button>
                </div>

                {/* Overview Tab Content */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Cards Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                            {/* Plan Card */}
                            <div style={{ 
                                background: 'linear-gradient(135deg, rgba(105,63,233,0.2) 0%, rgba(139,92,246,0.1) 100%)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid rgba(105,63,233,0.3)'
                            }}>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Current Plan</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{user?.plan?.name || 'Free'}</div>
                                <div style={{ fontSize: '14px', color: '#10b981' }}>${user?.plan?.price || 0}/month</div>
                            </div>

                            {/* Referral Earnings */}
                            <div style={{ 
                                background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.1) 100%)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid rgba(245,158,11,0.3)'
                            }}>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Referral Earnings</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>${(referralData?.stats.commission || 0).toFixed(2)}</div>
                                <div style={{ fontSize: '14px', color: '#f59e0b' }}>{referralData?.stats.totalPaidReferrals || 0} paid users</div>
                            </div>

                            {/* Total Referrals */}
                            <div style={{ 
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.1) 100%)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid rgba(16,185,129,0.3)'
                            }}>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Total Referrals</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{referralData?.stats.totalReferrals || 0}</div>
                                <div style={{ fontSize: '14px', color: '#10b981' }}>users joined</div>
                            </div>

                            {/* Member Since */}
                            <div style={{ 
                                background: 'rgba(255,255,255,0.05)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Member Since</div>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
                                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{user?.email}</div>
                            </div>
                        </div>

                        {/* Quick Usage Summary */}
                        <div style={{ 
                            background: 'rgba(255,255,255,0.05)',
                            padding: '24px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginBottom: '30px'
                        }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '20px' }}>📊 Today's Usage</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                {[
                                    { icon: '❤️', label: 'Likes', used: usage?.usage?.likes || 0, limit: usage?.limits?.likes || 0 },
                                    { icon: '🤖', label: 'AI Posts', used: usage?.usage?.aiPosts || 0, limit: usage?.limits?.aiPosts || 0 },
                                    {
                                        icon: '💭',
                                        label: 'AI Comments',
                                        used: usage?.usage?.aiComments || 0,
                                        limit: (usage?.limits?.aiComments || 0) + (usage?.usage?.bonusAiComments || 0),
                                        isTotalAvailable: true
                                    },
                                    { icon: '👥', label: 'Follows', used: usage?.usage?.follows || 0, limit: usage?.limits?.follows || 0 },
                                ].map((item, i) => {
                                    const pct = item.limit > 0 ? (item.used / item.limit) * 100 : 0;
                                    return (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{item.icon} {item.label}</span>
                                                <span style={{ fontSize: '14px', fontWeight: '600', color: pct >= 100 ? '#ef4444' : pct > 80 ? '#f59e0b' : '#10b981' }}>{item.used}/{item.limit}</span>
                                            </div>
                                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 100 ? '#ef4444' : pct > 80 ? '#f59e0b' : '#10b981', borderRadius: '3px', transition: 'width 0.3s' }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ 
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.1) 100%)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid rgba(16,185,129,0.3)',
                                textDecoration: 'none',
                                display: 'block'
                            }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧩</div>
                                <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Get Chrome Extension</h4>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Install our extension to start automating</p>
                            </a>
                            <div onClick={() => setActiveTab('referrals')} style={{ 
                                background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.1) 100%)',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid rgba(245,158,11,0.3)',
                                cursor: 'pointer'
                            }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎁</div>
                                <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Invite Friends</h4>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Earn 30% commission on every paid referral</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Writer Tab */}
                {activeTab === 'writer' && (
                    <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Left Column: Settings */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Post Settings */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>⚙️</span> Post Settings
                                </h3>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>💡 Topic/Idea</label>
                                    <input type="text" value={writerTopic} onChange={e => setWriterTopic(e.target.value)} placeholder="What do you want to write about?"
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>📝 Template</label>
                                        <select value={writerTemplate} onChange={e => setWriterTemplate(e.target.value)}
                                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px' }}>
                                            <option value="lead_magnet">Lead Magnet</option>
                                            <option value="thought_leadership">Thought Leadership</option>
                                            <option value="personal_story">Personal Story</option>
                                            <option value="advice">Advice/Tips</option>
                                            <option value="case_study">Case Study</option>
                                            <option value="controversial">Controversial Opinion</option>
                                            <option value="question">Question/Poll</option>
                                            <option value="insight">Industry Insight</option>
                                            <option value="announcement">Announcement</option>
                                            <option value="achievement">Achievement</option>
                                            <option value="tip">Pro Tip</option>
                                            <option value="story">Story</option>
                                            <option value="motivation">Motivation</option>
                                            <option value="how_to">How-To Guide</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>🎭 Tone</label>
                                        <select value={writerTone} onChange={e => setWriterTone(e.target.value)}
                                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px' }}>
                                            <option value="professional">Professional</option>
                                            <option value="friendly">Friendly</option>
                                            <option value="inspirational">Inspirational</option>
                                            <option value="bold">Bold/Provocative</option>
                                            <option value="educational">Educational</option>
                                            <option value="conversational">Conversational</option>
                                            <option value="authoritative">Authoritative</option>
                                            <option value="humorous">Humorous</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>📏 Post Length</label>
                                    <select value={writerLength} onChange={e => setWriterLength(e.target.value)}
                                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px' }}>
                                        <option value="500">Short (500 chars)</option>
                                        <option value="900">Medium (900 chars)</option>
                                        <option value="1500">Long (1500 chars)</option>
                                        <option value="2500">Extra Long (2500 chars)</option>
                                    </select>
                                </div>
                                {/* Advanced Settings */}
                                <div style={{ marginBottom: '16px' }}>
                                    <button onClick={() => setWriterShowAdvanced(!writerShowAdvanced)}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 16px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', width: '100%', textAlign: 'left' }}>
                                        ⚙️ Advanced Settings {writerShowAdvanced ? '▲' : '▼'}
                                    </button>
                                    {writerShowAdvanced && (
                                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <input type="text" value={writerTargetAudience} onChange={e => setWriterTargetAudience(e.target.value)} placeholder="Target Audience (e.g., Startup founders)"
                                                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none' }} />
                                            <input type="text" value={writerKeyMessage} onChange={e => setWriterKeyMessage(e.target.value)} placeholder="Key Message/CTA (e.g., Book a call)"
                                                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none' }} />
                                            <input type="text" value={writerBackground} onChange={e => setWriterBackground(e.target.value)} placeholder="Your Background (e.g., CEO at TechCorp)"
                                                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none' }} />
                                        </div>
                                    )}
                                </div>
                                {/* Options */}
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={writerHashtags} onChange={e => setWriterHashtags(e.target.checked)} style={{ accentColor: '#693fe9' }} />
                                        #️⃣ Hashtags
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={writerEmojis} onChange={e => setWriterEmojis(e.target.checked)} style={{ accentColor: '#693fe9' }} />
                                        😊 Emojis
                                    </label>
                                </div>
                                <button onClick={generatePost} disabled={writerGenerating}
                                    style={{ width: '100%', padding: '14px', background: writerGenerating ? 'rgba(105,63,233,0.5)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: writerGenerating ? 'wait' : 'pointer', boxShadow: '0 4px 15px rgba(105,63,233,0.4)' }}>
                                    {writerGenerating ? '⏳ Generating...' : '✨ Generate AI Post'}
                                </button>
                            </div>
                            {/* Schedule Post */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>📅</span> Schedule Post
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '6px' }}>Date</label>
                                        <input type="date" value={writerScheduleDate} onChange={e => setWriterScheduleDate(e.target.value)}
                                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '6px' }}>Time</label>
                                        <input type="time" value={writerScheduleTime} onChange={e => setWriterScheduleTime(e.target.value)}
                                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px' }} />
                                    </div>
                                </div>
                                <button onClick={schedulePost}
                                    style={{ width: '100%', padding: '12px', background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.5)', borderRadius: '12px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                                    📅 Schedule Post
                                </button>
                            </div>
                        </div>
                        {/* Right Column: Content Editor */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                        <span>📝</span> Post Content
                                    </h3>
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{writerContent.length} / 3,000</span>
                                </div>
                                <textarea value={writerContent} onChange={e => setWriterContent(e.target.value)}
                                    placeholder="Your AI-generated post will appear here... or start writing your own!"
                                    style={{ flex: 1, minHeight: '350px', width: '100%', padding: '16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', fontSize: '14px', lineHeight: '1.7', resize: 'vertical', outline: 'none', fontFamily: 'system-ui, sans-serif' }} />
                                {/* Status */}
                                {writerStatus && (
                                    <div style={{ marginTop: '12px', padding: '10px 16px', background: writerStatus.includes('Error') || writerStatus.includes('Failed') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${writerStatus.includes('Error') || writerStatus.includes('Failed') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '10px', color: writerStatus.includes('Error') || writerStatus.includes('Failed') ? '#f87171' : '#34d399', fontSize: '13px', fontWeight: '500' }}>
                                        {writerStatus}
                                    </div>
                                )}
                                {/* Action Buttons */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                                    <button onClick={sendToExtension} disabled={writerPosting}
                                        style={{ padding: '14px', background: writerPosting ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: writerPosting ? 'wait' : 'pointer', boxShadow: writerPosting ? 'none' : '0 4px 15px rgba(105,63,233,0.4)', opacity: writerPosting ? 0.7 : 1, transition: 'all 0.2s', transform: writerPosting ? 'scale(0.97)' : 'scale(1)' }}>
                                        {writerPosting ? '⏳ Sending...' : '🚀 Post to LinkedIn'}
                                    </button>
                                    <button onClick={saveDraft}
                                        style={{ padding: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                                        💾 Save Draft
                                    </button>
                                </div>
                            </div>
                            {/* Saved Drafts */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
                                    💾 Saved Drafts ({writerDrafts.length})
                                </h3>
                                {writerDrafts.length === 0 ? (
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No saved drafts yet</p>
                                ) : (
                                    <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {writerDrafts.map((draft: any) => (
                                            <div key={draft.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                                                        {draft.status === 'scheduled' ? '📅 Scheduled' : '📝 Draft'} - {new Date(draft.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => { setWriterContent(draft.content); setWriterTopic(draft.topic || ''); }}
                                                            style={{ background: 'rgba(105,63,233,0.2)', border: '1px solid rgba(105,63,233,0.4)', borderRadius: '6px', color: '#a78bfa', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>
                                                            Load
                                                        </button>
                                                        <button onClick={() => deleteDraft(draft.id)}
                                                            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {draft.content.substring(0, 120)}...
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Inspiration Sources Section */}
                    <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>✨</span> Inspiration Sources
                            </h3>
                            <button onClick={loadInspirationSources}
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                                🔄 Refresh
                            </button>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '20px' }}>
                            Add LinkedIn profiles to learn from their writing style. AI will mimic the style of your saved sources.
                        </p>
                        {/* Add Profile Links */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>🔗 Add Profile Links (one per line)</label>
                            <textarea value={inspirationProfiles} onChange={e => setInspirationProfiles(e.target.value)}
                                placeholder={"https://linkedin.com/in/username1\nhttps://linkedin.com/in/username2\nhttps://linkedin.com/in/username3"}
                                rows={4}
                                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'system-ui, sans-serif', lineHeight: '1.6' }} />
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                                    Posts per profile:
                                    <select value={inspirationPostCount} onChange={e => setInspirationPostCount(parseInt(e.target.value))}
                                        style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px' }}>
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="15">15</option>
                                        <option value="20">20</option>
                                        <option value="30">30</option>
                                    </select>
                                </label>
                                <span style={{ flex: 1 }} />
                                <button onClick={scrapeInspirationProfiles} disabled={inspirationScraping}
                                    style={{ padding: '10px 20px', background: inspirationScraping ? 'rgba(105,63,233,0.3)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: inspirationScraping ? 'wait' : 'pointer', boxShadow: '0 4px 15px rgba(105,63,233,0.3)' }}>
                                    {inspirationScraping ? '⏳ Scraping...' : '🔍 Scrape & Add Profiles'}
                                </button>
                            </div>
                            {inspirationStatus && (
                                <div style={{ marginTop: '12px', padding: '10px 16px', background: inspirationStatus.includes('Error') || inspirationStatus.includes('Failed') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${inspirationStatus.includes('Error') || inspirationStatus.includes('Failed') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '10px', color: inspirationStatus.includes('Error') || inspirationStatus.includes('Failed') ? '#f87171' : '#34d399', fontSize: '13px' }}>
                                    {inspirationStatus}
                                </div>
                            )}
                        </div>
                        {/* Saved Sources */}
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>📚 Saved Inspiration Sources</h4>
                            {inspirationLoading ? (
                                <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.5)' }}>Loading sources...</div>
                            ) : inspirationSources.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No inspiration sources yet. Add LinkedIn profiles above to get started.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {inspirationSources.map((src: any, i: number) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.05)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                                                👤
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{src.name}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{src.count} posts saved</div>
                                            </div>
                                            <button onClick={() => deleteInspirationSource(src.name)}
                                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Use Inspiration Context */}
                        {inspirationSources.length > 0 && (
                            <div style={{ background: 'rgba(105,63,233,0.1)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(105,63,233,0.3)' }}>
                                <h4 style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>🎯 Use Inspiration Context</h4>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '14px' }}>AI will mimic the style of your saved sources when generating posts.</p>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', cursor: 'pointer', marginBottom: '12px' }}>
                                    <input type="checkbox" checked={inspirationUseAll} onChange={e => { setInspirationUseAll(e.target.checked); if (e.target.checked) setInspirationSelected(inspirationSources.map(s => s.name)); }}
                                        style={{ accentColor: '#693fe9', width: '18px', height: '18px' }} />
                                    <strong>Use All Sources</strong>
                                </label>
                                {!inspirationUseAll && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '28px' }}>
                                        {inspirationSources.map((src: any, i: number) => (
                                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={inspirationSelected.includes(src.name)}
                                                    onChange={e => {
                                                        if (e.target.checked) setInspirationSelected([...inspirationSelected, src.name]);
                                                        else setInspirationSelected(inspirationSelected.filter(n => n !== src.name));
                                                    }}
                                                    style={{ accentColor: '#693fe9', width: '16px', height: '16px' }} />
                                                {src.name}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Comment Style Sources Section */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>💬</span> Comment Style Sources
                            </h3>
                            <button onClick={loadCommentStyleProfiles}
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                                🔄 Refresh
                            </button>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px' }}>
                            Add LinkedIn profiles to learn from their commenting style. The extension will scrape their comments and AI will mimic their tone.
                        </p>
                        {/* Add Profile Input */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '6px' }}>🔗 LinkedIn Profile URL</label>
                                <input value={commentStyleUrl} onChange={e => setCommentStyleUrl(e.target.value)}
                                    placeholder="https://linkedin.com/in/username"
                                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }} />
                            </div>
                            <button onClick={scrapeCommentStyle} disabled={commentStyleScraping}
                                style={{ padding: '10px 20px', background: commentStyleScraping ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: commentStyleScraping ? 'wait' : 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.3)', marginTop: '18px', opacity: commentStyleScraping ? 0.7 : 1, transition: 'all 0.2s' }}>
                                {commentStyleScraping ? '⏳ Sending...' : '💬 Scrape Comments'}
                            </button>
                        </div>
                        {commentStyleStatus && (
                            <div style={{ marginBottom: '16px', padding: '10px 16px', background: commentStyleStatus.includes('Error') || commentStyleStatus.includes('Failed') ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)', border: `1px solid ${commentStyleStatus.includes('Error') ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`, borderRadius: '10px', color: commentStyleStatus.includes('Error') ? '#f87171' : '#60a5fa', fontSize: '13px' }}>
                                {commentStyleStatus}
                            </div>
                        )}
                        {/* Saved Profiles */}
                        <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>👤 Saved Comment Style Profiles</h4>
                        {commentStyleLoading ? (
                            <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.5)' }}>Loading profiles...</div>
                        ) : commentStyleProfiles.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No comment style profiles yet. Add a LinkedIn profile above to get started.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {commentStyleProfiles.map((profile: any) => (
                                    <div key={profile.id}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: profile.isSelected ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.05)', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${profile.isSelected ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                                            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>💬</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{profile.profileName || profile.profileId}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{profile._count?.comments || profile.commentCount} comments scraped{profile.lastScrapedAt ? ` · Last: ${new Date(profile.lastScrapedAt).toLocaleDateString()}` : ''}</div>
                                            </div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: profile.isSelected ? '#60a5fa' : 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
                                                <input type="checkbox" checked={profile.isSelected} onChange={() => toggleProfileSelect(profile.id)}
                                                    style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} />
                                                AI Train
                                            </label>
                                            <button onClick={() => { if (commentStyleExpanded === profile.id) { setCommentStyleExpanded(null); setCommentStyleComments([]); } else { setCommentStyleExpanded(profile.id); loadProfileComments(profile.id); } }}
                                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
                                                {commentStyleExpanded === profile.id ? '▲ Hide' : '▼ View'}
                                            </button>
                                            <button onClick={() => deleteCommentStyleProfile(profile.id)}
                                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}>
                                                🗑️
                                            </button>
                                        </div>
                                        {/* Expanded comments list */}
                                        {commentStyleExpanded === profile.id && (
                                            <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '0 0 12px 12px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', maxHeight: '500px', overflowY: 'auto' }}>
                                                {commentStyleCommentsLoading ? (
                                                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.5)' }}>Loading comments...</div>
                                                ) : commentStyleComments.length === 0 ? (
                                                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>No comments found. Try scraping again.</div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{commentStyleComments.length} comments · {commentStyleComments.filter((c: any) => c.isTopComment).length} marked as top</span>
                                                        </div>
                                                        {commentStyleComments.map((comment: any) => (
                                                            <div key={comment.id} style={{ background: comment.isTopComment ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: `1px solid ${comment.isTopComment ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '4px' }}>
                                                                            {comment.context === 'DIRECT COMMENT ON POST' ? '💬 Direct comment' : `↩️ ${comment.context.substring(0, 80)}...`}
                                                                        </div>
                                                                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginBottom: '6px', fontStyle: 'italic' }}>
                                                                            On: {(comment.postText || '').substring(0, 100)}...
                                                                        </div>
                                                                        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: '1.5', maxHeight: '80px', overflowY: 'auto', paddingRight: '4px' }}>
                                                                            {comment.commentText}
                                                                        </div>
                                                                    </div>
                                                                    <button onClick={() => toggleCommentTop(comment.id)}
                                                                        title={comment.isTopComment ? 'Remove from top comments' : 'Mark as top comment for AI training'}
                                                                        style={{ background: comment.isTopComment ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${comment.isTopComment ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.15)'}`, borderRadius: '8px', padding: '4px 10px', fontSize: '14px', cursor: 'pointer', flexShrink: 0, color: comment.isTopComment ? '#fbbf24' : 'rgba(255,255,255,0.5)' }}>
                                                                        {comment.isTopComment ? '⭐' : '☆'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* AI Training Info */}
                        {commentStyleProfiles.some((p: any) => p.isSelected) && (
                            <div style={{ background: 'rgba(59,130,246,0.1)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(59,130,246,0.3)', marginTop: '16px' }}>
                                <h4 style={{ color: '#60a5fa', fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>🎯 AI Comment Style Training Active</h4>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
                                    AI will use {commentStyleProfiles.filter((p: any) => p.isSelected).length} selected profile(s) with their top-starred comments to match their commenting style when generating comments (both manual and auto-commenting).
                                </p>
                            </div>
                        )}
                    </div>
                    </>
                )}

                {/* Trending Posts Tab */}
                {activeTab === 'trending-posts' && (
                    <div>
                        {/* Period Filters */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            {[{ id: 'today', label: '🔥 Today' }, { id: 'week', label: '📈 This Week' }, { id: 'month', label: '📊 This Month' }, { id: 'all', label: '🌐 All Time' }].map(p => (
                                <button key={p.id} onClick={() => { setTrendingPeriod(p.id); loadSavedPosts(1); }}
                                    style={{ padding: '10px 20px', background: trendingPeriod === p.id ? 'linear-gradient(135deg, #693fe9, #8b5cf6)' : 'rgba(255,255,255,0.08)', border: trendingPeriod === p.id ? 'none' : '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', fontWeight: trendingPeriod === p.id ? '700' : '500', cursor: 'pointer', fontSize: '14px' }}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        {/* Controls Row */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <input type="text" value={savedPostsSearch} onChange={e => setSavedPostsSearch(e.target.value)} placeholder="Search trending posts..."
                                onKeyDown={e => e.key === 'Enter' && loadSavedPosts(1)}
                                style={{ flex: 1, minWidth: '200px', padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' }} />
                            <select value={savedPostsSortBy} onChange={e => { setSavedPostsSortBy(e.target.value); }}
                                style={{ padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', fontSize: '13px' }}>
                                <option value="comments">Comments</option>
                                <option value="likes">Likes</option>
                                <option value="shares">Shares</option>
                                <option value="scrapedAt">Date Saved</option>
                            </select>
                            <button onClick={() => loadSavedPosts(1)}
                                style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                                🔍 Search
                            </button>
                        </div>
                        {/* Selection info + AI Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                                Total: <strong style={{ color: 'white' }}>{savedPostsTotal}</strong> trending posts
                                {trendingSelectedPosts.length > 0 && (
                                    <span style={{ marginLeft: '16px', color: '#a78bfa' }}>
                                        {trendingSelectedPosts.length} selected <span style={{ color: 'rgba(255,255,255,0.3)' }}>(max 10)</span>
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button onClick={() => {
                                    if (trendingSelectedPosts.length === savedPosts.length) setTrendingSelectedPosts([]);
                                    else setTrendingSelectedPosts(savedPosts.slice(0, 3).map(p => p.id));
                                }}
                                    style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '13px' }}>
                                    {trendingSelectedPosts.length > 0 ? 'Clear Selection' : 'Auto-Select Top 3'}
                                </button>
                                <button onClick={generateTrendingPosts} disabled={trendingGenerating || trendingSelectedPosts.length === 0}
                                    style={{ padding: '8px 18px', background: trendingGenerating ? 'rgba(105,63,233,0.3)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: trendingGenerating ? 'wait' : 'pointer', fontSize: '13px', boxShadow: '0 4px 15px rgba(105,63,233,0.3)' }}>
                                    {trendingGenerating ? '⏳ Generating...' : '🤖 AI Generate Posts'}
                                </button>
                                <button onClick={analyzePosts} disabled={analysisLoading || trendingGeneratedPosts.length === 0}
                                    style={{ padding: '8px 18px', background: analysisLoading ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: analysisLoading ? 'wait' : 'pointer', fontSize: '13px' }}>
                                    {analysisLoading ? '⏳ Analyzing...' : '📊 Analyze Posts'}
                                </button>
                            </div>
                        </div>
                        {/* Custom Prompt */}
                        <div style={{ marginBottom: '16px' }}>
                            <input type="text" value={trendingCustomPrompt} onChange={e => setTrendingCustomPrompt(e.target.value)}
                                placeholder="Custom AI instruction (optional): e.g., Focus on SaaS topics, write for tech founders..."
                                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' }} />
                        </div>
                        {/* Status */}
                        {trendingStatus && (
                            <div style={{ marginBottom: '16px', padding: '10px 16px', background: trendingStatus.includes('Error') || trendingStatus.includes('fail') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${trendingStatus.includes('Error') || trendingStatus.includes('fail') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '10px', color: trendingStatus.includes('Error') || trendingStatus.includes('fail') ? '#f87171' : '#34d399', fontSize: '13px' }}>
                                {trendingStatus}
                            </div>
                        )}
                        {/* Analysis Results Table - shown on TOP */}
                        {showAnalysis && analysisResults.length > 0 && (
                            <div style={{ marginBottom: '24px', background: 'rgba(245,158,11,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.3)' }}>
                                <h4 style={{ color: '#fbbf24', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>📊 Viral Potential Analysis</h4>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.15)' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Rank</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Score</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Post Preview</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Brutal Feedback</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Viral Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analysisResults.map((item: any, i: number) => (
                                                <tr key={i} style={{
                                                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                                                    background: item.isAiGenerated ? 'rgba(105,63,233,0.15)' : 'transparent'
                                                }}>
                                                    <td style={{ padding: '12px', color: 'white', fontWeight: '700', fontSize: '16px' }}>#{i + 1}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{
                                                            padding: '4px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '14px',
                                                            background: item.score >= 80 ? 'rgba(16,185,129,0.2)' : item.score >= 60 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                                                            color: item.score >= 80 ? '#34d399' : item.score >= 60 ? '#fbbf24' : '#f87171',
                                                            border: `1px solid ${item.score >= 80 ? 'rgba(16,185,129,0.4)' : item.score >= 60 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'}`
                                                        }}>{item.score}/100</span>
                                                    </td>
                                                    <td style={{ padding: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', maxWidth: '250px' }}>
                                                        {item.isAiGenerated && <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '11px', marginRight: '6px', background: 'rgba(105,63,233,0.3)', padding: '2px 8px', borderRadius: '10px' }}>AI</span>}
                                                        {(() => {
                                                            const idx = (item.postIndex || 1) - 1;
                                                            const selected = savedPosts.filter(p => trendingSelectedPosts.includes(p.id));
                                                            const allMixed = [...selected.map(p => p.postContent || ''), ...trendingGeneratedPosts.map(p => p.content || '')];
                                                            return (allMixed[idx] || '').substring(0, 100) + '...';
                                                        })()}
                                                    </td>
                                                    <td style={{ padding: '12px', color: '#fbbf24', fontSize: '13px', fontWeight: '500', maxWidth: '250px' }}>{item.feedback}</td>
                                                    <td style={{ padding: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', maxWidth: '200px' }}>{item.viralReason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {/* Generated Posts Preview */}
                        {trendingShowGenPreview && trendingGeneratedPosts.length > 0 && (
                            <div style={{ marginBottom: '24px', background: 'rgba(105,63,233,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(105,63,233,0.3)' }}>
                                <h4 style={{ color: '#a78bfa', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>🤖 AI Generated Posts ({trendingGeneratedPosts.length})</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {trendingGeneratedPosts.map((gp: any, i: number) => (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(105,63,233,0.2)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '14px' }}>✨ {gp.title || `Post ${i + 1}`}</span>
                                                <button onClick={() => postGeneratedToLinkedIn(gp.content, generatedPostImages[i], i)}
                                                    disabled={postingToLinkedIn[i]}
                                                    style={{ padding: '6px 16px', background: postingToLinkedIn[i] ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: postingToLinkedIn[i] ? 'wait' : 'pointer', fontSize: '12px', opacity: postingToLinkedIn[i] ? 0.7 : 1, transition: 'all 0.2s', transform: postingToLinkedIn[i] ? 'scale(0.95)' : 'scale(1)' }}>
                                                    {postingToLinkedIn[i] ? '⏳ Sending...' : '🚀 Post to LinkedIn'}
                                                </button>
                                            </div>
                                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 12px 0', whiteSpace: 'pre-wrap' }}>
                                                {gp.content}
                                            </p>
                                            {/* Image attachment */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '12px' }}>
                                                    📷 {generatedPostImages[i] ? 'Change Image' : 'Attach Image'}
                                                    <input type="file" accept="image/*" style={{ display: 'none' }}
                                                        onChange={(e) => { if (e.target.files?.[0]) handleImageAttach(i, e.target.files[0]); }} />
                                                </label>
                                                {generatedPostImages[i] && (
                                                    <>
                                                        <img src={generatedPostImages[i]} alt="Attached" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(105,63,233,0.4)' }} />
                                                        <button onClick={() => setGeneratedPostImages(prev => { const n = { ...prev }; delete n[i]; return n; })}
                                                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Posts List */}
                        {savedPostsLoading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.5)' }}>Loading trending posts...</div>
                        ) : savedPosts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔥</div>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>No trending posts yet. Enable post saving in the extension commenter tab.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {savedPosts.map((post: any) => {
                                    const isSelected = trendingSelectedPosts.includes(post.id);
                                    return (
                                    <div key={post.id} onClick={() => {
                                        if (isSelected) setTrendingSelectedPosts(trendingSelectedPosts.filter(id => id !== post.id));
                                        else if (trendingSelectedPosts.length < 10) setTrendingSelectedPosts([...trendingSelectedPosts, post.id]);
                                    }}
                                        style={{ background: isSelected ? 'rgba(105,63,233,0.15)' : 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: isSelected ? '2px solid rgba(105,63,233,0.5)' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <input type="checkbox" checked={isSelected} readOnly
                                                    style={{ width: '18px', height: '18px', accentColor: '#693fe9', cursor: 'pointer' }} />
                                                <div>
                                                    {post.authorName && <div style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}>{post.authorName}</div>}
                                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{new Date(post.scrapedAt).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); deleteSavedPost(post.id); }}
                                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>
                                                🗑️
                                            </button>
                                        </div>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px', paddingRight: '4px' }}>
                                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                                                {post.postContent}
                                            </p>
                                        </div>
                                        {post.imageUrl && (
                                            <div style={{ marginBottom: '12px' }}>
                                                <img src={post.imageUrl} alt="Post image" style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }} />
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '20px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                            <span style={{ color: '#ec4899', fontSize: '13px', fontWeight: '600' }}>❤️ {post.likes}</span>
                                            <span style={{ color: '#8b5cf6', fontSize: '13px', fontWeight: '600' }}>💬 {post.comments}</span>
                                            <span style={{ color: '#06b6d4', fontSize: '13px', fontWeight: '600' }}>🔄 {post.shares}</span>
                                            {post.postUrl && (
                                                <a href={post.postUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                                    style={{ color: '#693fe9', fontSize: '13px', fontWeight: '600', textDecoration: 'none', marginLeft: 'auto' }}>
                                                    🔗 View
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    );
                                })}
                                {savedPostsTotal > 20 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', paddingTop: '20px' }}>
                                        <button onClick={() => loadSavedPosts(savedPostsPage - 1)} disabled={savedPostsPage <= 1}
                                            style={{ padding: '10px 20px', background: savedPostsPage <= 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: savedPostsPage <= 1 ? 'rgba(255,255,255,0.3)' : 'white', cursor: savedPostsPage <= 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                                            ← Previous
                                        </button>
                                        <span style={{ color: 'rgba(255,255,255,0.6)', alignSelf: 'center', fontSize: '14px' }}>Page {savedPostsPage} of {Math.ceil(savedPostsTotal / 20)}</span>
                                        <button onClick={() => loadSavedPosts(savedPostsPage + 1)} disabled={savedPostsPage >= Math.ceil(savedPostsTotal / 20)}
                                            style={{ padding: '10px 20px', background: savedPostsPage >= Math.ceil(savedPostsTotal / 20) ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: savedPostsPage >= Math.ceil(savedPostsTotal / 20) ? 'rgba(255,255,255,0.3)' : 'white', cursor: savedPostsPage >= Math.ceil(savedPostsTotal / 20) ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                                            Next →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Tasks Tab */}
                {activeTab === 'tasks' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0 }}>📋 Extension Tasks</h3>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={loadTasks}
                                    style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                                    🔄 Refresh
                                </button>
                                <button onClick={stopAllTasks}
                                    style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 15px rgba(239,68,68,0.4)' }}>
                                    🛑 Stop All Tasks
                                </button>
                            </div>
                        </div>
                        {/* Task Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            {[
                                { label: 'Pending', count: tasks.filter(t => t.status === 'pending').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
                                { label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
                                { label: 'Completed', count: tasks.filter(t => t.status === 'completed' || t.status === 'completed_manual').length, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                                { label: 'Failed/Cancelled', count: tasks.filter(t => t.status === 'failed' || t.status === 'cancelled').length, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
                            ].map((s, i) => (
                                <div key={i} style={{ background: s.bg, padding: '20px', borderRadius: '16px', textAlign: 'center', border: `1px solid ${s.color}33` }}>
                                    <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.count}</div>
                                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                        {/* Task List */}
                        {tasksLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.5)' }}>Loading tasks...</div>
                        ) : tasks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>No tasks in the last 24 hours.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {tasks.map((task: any) => {
                                    const statusConfig: Record<string, { icon: string; color: string; bg: string }> = {
                                        pending: { icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
                                        in_progress: { icon: '🔄', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
                                        completed: { icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                                        completed_manual: { icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                                        failed: { icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
                                        cancelled: { icon: '🛑', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
                                    };
                                    const sc = statusConfig[task.status] || statusConfig.pending;
                                    return (
                                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <span style={{ fontSize: '20px' }}>{sc.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
                                                    {task.command === 'post_to_linkedin' ? '🚀 Post to LinkedIn' :
                                                     task.command === 'scrape_feed_now' ? '🔍 Scrape Feed' :
                                                     task.command === 'scrape_profile' ? '👤 Scrape Profile' : task.command}
                                                </div>
                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                                                    {task.createdAt ? new Date(task.createdAt).toLocaleString() : ''}
                                                    {task.data?.content && <span> - {task.data.content.substring(0, 60)}...</span>}
                                                    {task.data?.profileUrl && <span> - {task.data.profileUrl}</span>}
                                                </div>
                                            </div>
                                            <span style={{ padding: '4px 12px', background: sc.bg, color: sc.color, borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: `1px solid ${sc.color}33` }}>
                                                {task.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0 }}>📜 History</h3>
                            <button onClick={() => loadHistory(1)}
                                style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                                🔄 Refresh
                            </button>
                        </div>
                        {/* Filter Buttons */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            {[{ id: 'all', label: '📋 All', color: '#8b5cf6' }, { id: 'ai_generated', label: '🤖 AI Generated', color: '#a78bfa' }, { id: 'viral_analysis', label: '📊 Analysis', color: '#fbbf24' }, { id: 'published_post', label: '🚀 Published', color: '#10b981' }].map(f => (
                                <button key={f.id} onClick={() => { setHistoryFilter(f.id); setTimeout(() => loadHistory(1), 0); }}
                                    style={{ padding: '10px 20px', background: historyFilter === f.id ? `${f.color}33` : 'rgba(255,255,255,0.08)', border: `1px solid ${historyFilter === f.id ? f.color + '66' : 'rgba(255,255,255,0.15)'}`, borderRadius: '12px', color: historyFilter === f.id ? f.color : 'rgba(255,255,255,0.7)', fontWeight: historyFilter === f.id ? '700' : '500', cursor: 'pointer', fontSize: '14px' }}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '16px' }}>
                            Total: <strong style={{ color: 'white' }}>{historyTotal}</strong> entries
                        </div>
                        {/* History Items */}
                        {historyLoading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.5)' }}>Loading history...</div>
                        ) : historyItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>No history yet. Generate posts, run analysis, or publish to LinkedIn to build your history.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {historyItems.map((item: any) => {
                                    const typeConfig: Record<string, { icon: string; color: string; bg: string; label: string }> = {
                                        ai_generated: { icon: '🤖', color: '#a78bfa', bg: 'rgba(105,63,233,0.15)', label: 'AI Generated Posts' },
                                        viral_analysis: { icon: '📊', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', label: 'Viral Analysis' },
                                        published_post: { icon: '🚀', color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Published Post' },
                                    };
                                    const tc = typeConfig[item.type] || { icon: '📄', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', label: item.type };
                                    let parsedContent: any = null;
                                    try { parsedContent = JSON.parse(item.content); } catch { parsedContent = item.content; }
                                    let parsedMeta: any = null;
                                    try { if (item.metadata) parsedMeta = JSON.parse(item.metadata); } catch {}

                                    return (
                                        <div key={item.id} style={{ background: tc.bg, padding: '20px', borderRadius: '16px', border: `1px solid ${tc.color}33` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                        <span style={{ fontSize: '18px' }}>{tc.icon}</span>
                                                        <span style={{ color: tc.color, fontWeight: '700', fontSize: '15px' }}>{item.title || tc.label}</span>
                                                        <span style={{ padding: '2px 10px', background: `${tc.color}22`, borderRadius: '10px', fontSize: '11px', color: tc.color, fontWeight: '600', border: `1px solid ${tc.color}33` }}>{tc.label}</span>
                                                    </div>
                                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                                                        {new Date(item.createdAt).toLocaleString()}
                                                        {parsedMeta?.selectedCount && <span> · {parsedMeta.selectedCount} posts selected</span>}
                                                        {parsedMeta?.postCount && <span> · {parsedMeta.postCount} posts analyzed</span>}
                                                    </div>
                                                </div>
                                                <button onClick={() => deleteHistoryItem(item.id)}
                                                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>
                                                    🗑️
                                                </button>
                                            </div>
                                            {/* Content display based on type */}
                                            {item.type === 'ai_generated' && Array.isArray(parsedContent) && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {parsedContent.map((post: any, pi: number) => (
                                                        <div key={pi} style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px' }}>
                                                            <div style={{ color: '#a78bfa', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>✨ {post.title || `Post ${pi + 1}`}</div>
                                                            <div style={{ maxHeight: '100px', overflowY: 'auto', paddingRight: '4px' }}>
                                                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>{post.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {item.type === 'viral_analysis' && Array.isArray(parsedContent) && (
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                                        <thead>
                                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                                <th style={{ padding: '8px', textAlign: 'left', color: 'rgba(255,255,255,0.5)' }}>Rank</th>
                                                                <th style={{ padding: '8px', textAlign: 'left', color: 'rgba(255,255,255,0.5)' }}>Score</th>
                                                                <th style={{ padding: '8px', textAlign: 'left', color: 'rgba(255,255,255,0.5)' }}>Feedback</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {parsedContent.map((r: any, ri: number) => (
                                                                <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                    <td style={{ padding: '8px', color: 'white', fontWeight: '700' }}>#{ri + 1}</td>
                                                                    <td style={{ padding: '8px' }}>
                                                                        <span style={{ padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: r.score >= 80 ? 'rgba(16,185,129,0.2)' : r.score >= 60 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)', color: r.score >= 80 ? '#34d399' : r.score >= 60 ? '#fbbf24' : '#f87171' }}>{r.score}/100</span>
                                                                    </td>
                                                                    <td style={{ padding: '8px', color: 'rgba(255,255,255,0.6)', maxWidth: '300px' }}>{r.feedback}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                            {item.type === 'published_post' && parsedContent && (
                                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px' }}>
                                                    <div style={{ maxHeight: '100px', overflowY: 'auto', paddingRight: '4px' }}>
                                                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>{parsedContent.content || (typeof parsedContent === 'string' ? parsedContent : '')}</p>
                                                    </div>
                                                    {parsedContent.hasImage && <span style={{ color: '#a78bfa', fontSize: '11px', marginTop: '6px', display: 'inline-block' }}>📷 Image attached</span>}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {/* Pagination */}
                                {historyTotal > 20 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', paddingTop: '20px' }}>
                                        <button onClick={() => loadHistory(historyPage - 1)} disabled={historyPage <= 1}
                                            style={{ padding: '10px 20px', background: historyPage <= 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: historyPage <= 1 ? 'rgba(255,255,255,0.3)' : 'white', cursor: historyPage <= 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                                            ← Previous
                                        </button>
                                        <span style={{ color: 'rgba(255,255,255,0.6)', alignSelf: 'center', fontSize: '14px' }}>Page {historyPage} of {Math.ceil(historyTotal / 20)}</span>
                                        <button onClick={() => loadHistory(historyPage + 1)} disabled={historyPage >= Math.ceil(historyTotal / 20)}
                                            style={{ padding: '10px 20px', background: historyPage >= Math.ceil(historyTotal / 20) ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: historyPage >= Math.ceil(historyTotal / 20) ? 'rgba(255,255,255,0.3)' : 'white', cursor: historyPage >= Math.ceil(historyTotal / 20) ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                                            Next →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Feed Schedule Tab */}
                {activeTab === 'feed-schedule' && (
                    <div style={{ maxWidth: '800px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0 }}>⏰ Feed Scraping Schedule</h3>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <span style={{ color: scheduleActive ? '#10b981' : 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '600' }}>
                                        {scheduleActive ? '🟢 Active' : '🔴 Inactive'}
                                    </span>
                                    <div onClick={() => setScheduleActive(!scheduleActive)} style={{ width: '44px', height: '24px', background: scheduleActive ? '#10b981' : 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '2px', cursor: 'pointer', transition: 'background 0.2s' }}>
                                        <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '10px', transition: 'transform 0.2s', transform: scheduleActive ? 'translateX(20px)' : 'translateX(0)' }} />
                                    </div>
                                </label>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px' }}>
                                Configure when the extension should automatically visit your LinkedIn feed and save posts matching your criteria.
                            </p>
                            {/* Schedule Times */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>🕐 Schedule Times (daily)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                                    {scheduleTimesInput.map((time, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(105,63,233,0.2)', border: '1px solid rgba(105,63,233,0.4)', borderRadius: '10px', padding: '8px 12px' }}>
                                            <input type="time" value={time} onChange={e => { const arr = [...scheduleTimesInput]; arr[i] = e.target.value; setScheduleTimesInput(arr); }}
                                                style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '14px', outline: 'none' }} />
                                            <button onClick={() => setScheduleTimesInput(scheduleTimesInput.filter((_, idx) => idx !== i))}
                                                style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>×</button>
                                        </div>
                                    ))}
                                    <button onClick={() => {
                                        const now = new Date();
                                        now.setMinutes(now.getMinutes() + 2);
                                        const hh = String(now.getHours()).padStart(2, '0');
                                        const mm = String(now.getMinutes()).padStart(2, '0');
                                        setScheduleTimesInput([...scheduleTimesInput, `${hh}:${mm}`]);
                                    }}
                                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px dashed rgba(255,255,255,0.3)', borderRadius: '10px', padding: '8px 16px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px' }}>
                                        + Add Time
                                    </button>
                                </div>
                            </div>
                            {/* Duration */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
                                    <span>⏱️ Duration per session</span>
                                    <strong style={{ color: '#a78bfa' }}>{scheduleDuration} min</strong>
                                </label>
                                <input type="range" min="1" max="30" value={scheduleDuration} onChange={e => setScheduleDuration(parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: '#693fe9' }} />
                            </div>
                            {/* Criteria */}
                            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🎯 Post Qualification Criteria</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                                        <span>❤️ Min Likes</span>
                                        <strong style={{ color: '#ec4899' }}>{scheduleMinLikes}</strong>
                                    </label>
                                    <input type="range" min="0" max="500" step="5" value={scheduleMinLikes} onChange={e => setScheduleMinLikes(parseInt(e.target.value))}
                                        style={{ width: '100%', accentColor: '#ec4899' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                                        <span>💬 Min Comments</span>
                                        <strong style={{ color: '#8b5cf6' }}>{scheduleMinComments}</strong>
                                    </label>
                                    <input type="range" min="0" max="200" step="5" value={scheduleMinComments} onChange={e => setScheduleMinComments(parseInt(e.target.value))}
                                        style={{ width: '100%', accentColor: '#8b5cf6' }} />
                                </div>
                            </div>
                            {/* Keywords */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>🔑 Keywords to match (comma-separated)</label>
                                <input type="text" value={scheduleKeywords} onChange={e => setScheduleKeywords(e.target.value)} placeholder="e.g., AI, machine learning, startup, SaaS"
                                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' }} />
                                <small style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '6px', display: 'block' }}>Leave empty to save all posts. Posts containing any of these words will be captured.</small>
                            </div>
                            {/* Save & Run Buttons */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button onClick={saveFeedSchedule}
                                    style={{ padding: '16px', background: 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(105,63,233,0.4)' }}>
                                    💾 Save Schedule
                                </button>
                                <button onClick={async () => {
                                    setWriterStatus('Sending scrape task to extension...');
                                    try {
                                        const token = localStorage.getItem('authToken');
                                        if (!token) { setWriterStatus('Not authenticated'); return; }
                                        // Save schedule first
                                        await saveFeedSchedule();
                                        // Send command to extension to start scraping now
                                        const res = await fetch('/api/extension/command', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                            body: JSON.stringify({ command: 'scrape_feed_now', data: { durationMinutes: scheduleDuration, minLikes: scheduleMinLikes, minComments: scheduleMinComments, keywords: scheduleKeywords } }),
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            setWriterStatus('✅ Scrape task sent! Extension will open LinkedIn and start scraping.');
                                            // Trigger extension via custom event
                                            window.dispatchEvent(new CustomEvent('kommentify-post-to-linkedin', { detail: { command: 'scrape_feed_now' } }));
                                        } else setWriterStatus(data.error || 'Failed to send task');
                                    } catch (e: any) { setWriterStatus('Error: ' + e.message); }
                                }}
                                    style={{ padding: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}>
                                    🚀 Send Task Now
                                </button>
                            </div>
                        </div>
                        {/* Info Card */}
                        <div style={{ background: 'rgba(105,63,233,0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(105,63,233,0.3)' }}>
                            <h4 style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>ℹ️ How it works</h4>
                            <ul style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
                                <li>The extension will automatically open LinkedIn at your scheduled times</li>
                                <li>It scrolls through your feed for the configured duration</li>
                                <li>Posts matching your criteria (likes, comments, keywords) will be saved</li>
                                <li>You can review all saved posts in the "Saved Posts" tab</li>
                                <li>Make sure the extension is installed and you are logged into LinkedIn</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Usage Tab */}
                {activeTab === 'usage' && (
                    <div style={{ 
                        background: 'rgba(255,255,255,0.05)',
                        padding: '30px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                            {[
                                { icon: '❤️', label: 'Likes', used: usage?.usage?.likes || 0, limit: usage?.limits?.likes || 0 },
                                { icon: '📤', label: 'Shares', used: usage?.usage?.shares || 0, limit: usage?.limits?.shares || 0 },
                                { icon: '👥', label: 'Follows', used: usage?.usage?.follows || 0, limit: usage?.limits?.follows || 0 },
                                { icon: '🔗', label: 'Connections', used: usage?.usage?.connections || 0, limit: usage?.limits?.connections || 0 },
                                { icon: '🤖', label: 'AI Posts', used: usage?.usage?.aiPosts || 0, limit: usage?.limits?.aiPosts || 0 },
                                {
                                    icon: '💭',
                                    label: 'AI Comments',
                                    used: usage?.usage?.aiComments || 0,
                                    limit: (usage?.limits?.aiComments || 0) + (usage?.usage?.bonusAiComments || 0),
                                    isTotalAvailable: true
                                },
                                { icon: '💡', label: 'AI Topics', used: usage?.usage?.aiTopicLines || 0, limit: usage?.limits?.aiTopicLines || 0 },
                            ].map((item, i) => {
                                const pct = item.limit > 0 ? (item.used / item.limit) * 100 : 0;
                                return (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>{item.icon}</div>
                                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>{item.label}</div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>{item.used} / {item.limit}</div>
                                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 100 ? '#ef4444' : pct > 80 ? '#f59e0b' : 'linear-gradient(90deg, #693fe9, #8b5cf6)', borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Referrals Tab */}
                {activeTab === 'referrals' && (
                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(105,63,233,0.15) 0%, rgba(139,92,246,0.1) 100%)',
                        padding: '30px',
                        borderRadius: '20px',
                        border: '1px solid rgba(105,63,233,0.2)'
                    }}>
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>🔗 Your Referral Link</h3>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input type="text" readOnly value={referralData?.referralLink || ''} style={{ flex: 1, minWidth: '250px', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '14px' }} />
                                <button onClick={() => copyToClipboard(referralData?.referralLink || '')} style={{ padding: '14px 28px', background: copied ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>{copied ? '✓ Copied!' : '📋 Copy'}</button>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out Kommentify!&url=${encodeURIComponent(referralData?.referralLink || '')}`, '_blank')} style={{ padding: '10px 20px', background: 'rgba(29,161,242,0.2)', color: '#1DA1F2', border: '1px solid rgba(29,161,242,0.3)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>𝕏 Twitter</button>
                                <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralData?.referralLink || '')}`, '_blank')} style={{ padding: '10px 20px', background: 'rgba(10,102,194,0.2)', color: '#0A66C2', border: '1px solid rgba(10,102,194,0.3)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>💼 LinkedIn</button>
                                <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Check out Kommentify! ' + (referralData?.referralLink || ''))}`, '_blank')} style={{ padding: '10px 20px', background: 'rgba(37,211,102,0.2)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>📱 WhatsApp</button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: 'white' }}>{referralData?.stats.totalReferrals || 0}</div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Total Referrals</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: 'white' }}>{referralData?.stats.totalPaidReferrals || 0}</div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Paid Users</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>${(referralData?.stats.commission || 0).toFixed(2)}</div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Your Earnings</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>30%</div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Commission Rate</div>
                            </div>
                        </div>
                        {referralData && referralData.referrals.length > 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Name</th>
                                            <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Joined</th>
                                            <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Plan</th>
                                            <th style={{ padding: '16px', textAlign: 'right', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {referralData.referrals.map((ref) => (
                                            <tr key={ref.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                                <td style={{ padding: '16px', color: 'white', fontSize: '14px' }}>{ref.name || 'Anonymous'}</td>
                                                <td style={{ padding: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{new Date(ref.joinedAt).toLocaleDateString()}</td>
                                                <td style={{ padding: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{ref.planName}</td>
                                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                                    {ref.hasPaid ? (
                                                        <span style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>💰 Paid</span>
                                                    ) : (
                                                        <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px' }}>Free</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Extension Tab */}
                {activeTab === 'extension' && (
                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.1) 100%)',
                        padding: '40px',
                        borderRadius: '20px',
                        border: '1px solid rgba(16,185,129,0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🧩</div>
                        <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>Kommentify Chrome Extension</h2>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>Install our Chrome extension to automate your LinkedIn engagement and grow your network faster.</p>
                        <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '16px 40px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: '14px', textDecoration: 'none', fontWeight: '700', fontSize: '16px', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }}>🌐 Add to Chrome - Free</a>
                        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'left' }}>
                            {['Click "Add to Chrome"', 'Confirm installation', 'Pin to toolbar', 'Start automating!'].map((step, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', marginBottom: '12px' }}>{i + 1}</div>
                                    <div style={{ color: 'white', fontSize: '14px' }}>{step}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                    <div style={{ 
                        background: 'rgba(255,255,255,0.05)',
                        padding: '30px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ display: 'grid', gap: '20px', maxWidth: '500px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Full Name</label>
                                <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'white', fontSize: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>{user?.name || 'N/A'}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Email Address</label>
                                <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'white', fontSize: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>{user?.email || 'N/A'}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Current Plan</label>
                                <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(105,63,233,0.2), rgba(139,92,246,0.1))', borderRadius: '12px', color: 'white', fontSize: '15px', border: '1px solid rgba(105,63,233,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{user?.plan?.name || 'Free'} - ${user?.plan?.price || 0}/mo</span>
                                    <button onClick={() => router.push('/plans')} style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Change Plan</button>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Member Since</label>
                                <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'white', fontSize: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 1200px) {
                    div[style*="gridTemplateColumns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 768px) {
                    div[style*="gridTemplateColumns: repeat(4"] { grid-template-columns: 1fr !important; }
                    div[style*="gridTemplateColumns: repeat(2"] { grid-template-columns: 1fr !important; }
                    .dashboard-sidebar { 
                        position: fixed !important;
                        width: 100% !important;
                        height: auto !important;
                        bottom: 0 !important;
                        top: auto !important;
                        left: 0 !important;
                        flex-direction: row !important;
                        padding: 10px !important;
                        border-top: 1px solid rgba(255,255,255,0.1) !important;
                        border-right: none !important;
                    }
                    .dashboard-main {
                        margin-left: 0 !important;
                        padding: 20px 15px 100px 15px !important;
                    }
                    .dashboard-header {
                        flex-direction: column !important;
                        gap: 16px !important;
                        align-items: flex-start !important;
                    }
                    .dashboard-header h1 {
                        font-size: 24px !important;
                    }
                    .stats-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 480px) {
                    .dashboard-main {
                        padding: 15px 10px 100px 10px !important;
                    }
                }
            `}</style>
        </div>
    );
}
