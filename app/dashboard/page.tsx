'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

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
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)' }}><div style={{ textAlign: 'center', color: 'white' }}><div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div><div style={{ fontSize: '18px', opacity: 0.8 }}>Loading your dashboard...</div></div></div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [copied, setCopied] = useState(false);
    const [showReferrals, setShowReferrals] = useState(false);
    const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const { signOut } = useClerk();

    // Writer tab state
    const [writerTopic, setWriterTopic] = useState('');
    const [writerTemplate, setWriterTemplate] = useState('lead_magnet');
    const [writerTone, setWriterTone] = useState('professional');
    const [writerLength, setWriterLength] = useState('1500');
    const [writerHashtags, setWriterHashtags] = useState(false);
    const [writerEmojis, setWriterEmojis] = useState(true);
    const [writerLanguage, setWriterLanguage] = useState('');
    const [writerTargetAudience, setWriterTargetAudience] = useState('');
    const [writerKeyMessage, setWriterKeyMessage] = useState('');
    const [writerBackground, setWriterBackground] = useState('');
    const [writerContent, setWriterContent] = useState('');
    const [writerGenerating, setWriterGenerating] = useState(false);
    const [writerScheduleDate, setWriterScheduleDate] = useState('');
    const [writerScheduleTime, setWriterScheduleTime] = useState('');
    const [writerDrafts, setWriterDrafts] = useState<any[]>([]);
    const [writerScheduledPosts, setWriterScheduledPosts] = useState<any[]>([]);
    const [taskCounts, setTaskCounts] = useState({ pending: 0, in_progress: 0, completed: 0, failed: 0 });
    const [writerStatus, setWriterStatus] = useState('');
    const [writerShowAdvanced, setWriterShowAdvanced] = useState(false);
    const [writerModel, setWriterModel] = useState<string>('gpt-4o');
    const [writerTokenUsage, setWriterTokenUsage] = useState<any>(null);
    const [writerUseInspirationSources, setWriterUseInspirationSources] = useState(true);
    const [writerInspirationSourceNames, setWriterInspirationSourceNames] = useState<string[]>([]);

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
    const [taskNotifications, setTaskNotifications] = useState<Array<{ id: string; message: string; type: 'info' | 'success' | 'error'; time: number }>>([]);
    const [taskStatusExpanded, setTaskStatusExpanded] = useState<string | null>(null);
    const prevTasksRef = useRef<any[]>([]);
    const notifiedTaskIds = useRef<Set<string>>(new Set());

    // Trending Posts AI generation state
    const [trendingPeriod, setTrendingPeriod] = useState<string>('all');
    const [trendingSelectedPosts, setTrendingSelectedPosts] = useState<string[]>([]);
    const [trendingGenerating, setTrendingGenerating] = useState(false);
    const [trendingCustomPrompt, setTrendingCustomPrompt] = useState('');
    const [trendingIncludeHashtags, setTrendingIncludeHashtags] = useState(false);
    const [trendingLanguage, setTrendingLanguage] = useState('');
    const [trendingGeneratedPosts, setTrendingGeneratedPosts] = useState<any[]>([]);
    const [trendingShowGenPreview, setTrendingShowGenPreview] = useState(false);
    const [trendingStatus, setTrendingStatus] = useState('');
    const [trendingModel, setTrendingModel] = useState<string>('gpt-4o');
    const [trendingTokenUsage, setTrendingTokenUsage] = useState<any>(null);
    
    // Developer emails for showing token costs
    const DEVELOPER_EMAILS = ['alanemarkef199@gmail.com', 'arman@arwebcraftslive.com'];
    const isDeveloper = user?.email ? DEVELOPER_EMAILS.includes(user.email) : false;
    
    // Model options with pricing - best models first, cheap ones at end
    const MODEL_OPTIONS = [
        { id: 'o1', name: 'o1 (Reasoning - Best)', inputCost: '$15.00/1M', outputCost: '$60.00/1M' },
        { id: 'o1-mini', name: 'o1-mini (Fast Reasoning)', inputCost: '$3.00/1M', outputCost: '$12.00/1M' },
        { id: 'gpt-4o', name: 'GPT-4o (Best Quality)', inputCost: '$2.50/1M', outputCost: '$10.00/1M' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast)', inputCost: '$0.15/1M', outputCost: '$0.60/1M' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo (Premium)', inputCost: '$10.00/1M', outputCost: '$30.00/1M' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Budget)', inputCost: '$0.50/1M', outputCost: '$1.50/1M' },
    ];
    
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

    // Comment settings state (synced to server)
    const [csUseProfileStyle, setCsUseProfileStyle] = useState(false);
    const [csGoal, setCsGoal] = useState('AddValue');
    const [csTone, setCsTone] = useState('Friendly');
    const [csLength, setCsLength] = useState('Short');
    const [csStyle, setCsStyle] = useState('direct');
    const [csModel, setCsModel] = useState<string>('gpt-4o');
    const [csExpertise, setCsExpertise] = useState('');
    const [csBackground, setCsBackground] = useState('');
    const [csAutoPost, setCsAutoPost] = useState('manual');
    const [csSettingsLoading, setCsSettingsLoading] = useState(false);
    const [csSettingsSaving, setCsSettingsSaving] = useState(false);

    // Kommentify shared content state
    const [sharedPosts, setSharedPosts] = useState<any[]>([]);
    const [sharedPostsLoading, setSharedPostsLoading] = useState(false);
    const [sharedInspProfiles, setSharedInspProfiles] = useState<any[]>([]);
    const [sharedCommentProfiles, setSharedCommentProfiles] = useState<any[]>([]);

    // Automation settings (limits & delays) state
    const [autoSettings, setAutoSettings] = useState<any>(null);
    const [autoSettingsLoading, setAutoSettingsLoading] = useState(false);
    const [autoSettingsSaving, setAutoSettingsSaving] = useState(false);

    // Commenter config state
    const [commenterCfg, setCommenterCfg] = useState<any>(null);
    const [commenterCfgLoading, setCommenterCfgLoading] = useState(false);
    const [commenterCfgSaving, setCommenterCfgSaving] = useState(false);

    // Import config state
    const [importCfg, setImportCfg] = useState<any>(null);
    const [importCfgLoading, setImportCfgLoading] = useState(false);
    const [importCfgSaving, setImportCfgSaving] = useState(false);

    // LinkedIn Profile Data state
    const [linkedInProfile, setLinkedInProfile] = useState<any>(null);
    const [linkedInProfileLoading, setLinkedInProfileLoading] = useState(false);
    const [linkedInProfileScanning, setLinkedInProfileScanning] = useState(false);
    const [linkedInProfileStatus, setLinkedInProfileStatus] = useState('');
    const [linkedInUseProfileData, setLinkedInUseProfileData] = useState(true);
    const [linkedInTopicSuggestions, setLinkedInTopicSuggestions] = useState<string[]>([]);
    const [linkedInGeneratingTopics, setLinkedInGeneratingTopics] = useState(false);
    const [showLinkedInDataModal, setShowLinkedInDataModal] = useState(false);

    // Analytics tab state
    const [analyticsData, setAnalyticsData] = useState<any>({ engagements: { total: 0, comments: 0, likes: 0, shares: 0, follows: 0 }, automationHistory: [], networkingHistory: [], importHistory: [], leads: [] });
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsPeriod, setAnalyticsPeriod] = useState('today');
    const [analyticsAutoSearch, setAnalyticsAutoSearch] = useState('');
    const [analyticsNetworkSearch, setAnalyticsNetworkSearch] = useState('');
    const [analyticsImportSearch, setAnalyticsImportSearch] = useState('');
    const [analyticsLeadsSearch, setAnalyticsLeadsSearch] = useState('');
    const [analyticsAutoFilter, setAnalyticsAutoFilter] = useState('all');
    const [analyticsNetworkFilter, setAnalyticsNetworkFilter] = useState('all');

    // Extension connectivity state
    const [extensionConnected, setExtensionConnected] = useState(false);
    const [extensionLastSeen, setExtensionLastSeen] = useState<Date | null>(null);

    // Theme state
    const [theme, setTheme] = useState<'current' | 'light' | 'dark'>('current');

    useEffect(() => {
        const savedTheme = localStorage.getItem('dashboard-theme') as 'current' | 'light' | 'dark' | null;
        if (savedTheme) setTheme(savedTheme);
    }, []);

    useEffect(() => {
        if (loggingOut) return;
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
        setWriterStatus('Analyzing inspiration sources and generating post...');
        setWriterTokenUsage(null);
        try {
            const res = await fetch('/api/ai/generate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    topic: writerTopic, template: writerTemplate, tone: writerTone,
                    length: writerLength, includeHashtags: writerHashtags, includeEmojis: writerEmojis,
                    language: writerLanguage,
                    targetAudience: writerTargetAudience, keyMessage: writerKeyMessage, userBackground: writerBackground,
                    useInspirationSources: inspirationSources.length > 0 && (inspirationUseAll || inspirationSelected.length > 0),
                    inspirationSourceNames: inspirationUseAll ? inspirationSources.map(s => s.name) : inspirationSelected,
                    model: writerModel
                }),
            });
            const data = await res.json();
            if (data.success && data.content) {
                setWriterContent(data.content);
                setWriterStatus(`✅ Post generated using ${data.model || writerModel}! Review and edit as needed.`);
                // Capture token usage for developers
                if (data.tokenUsage) {
                    setWriterTokenUsage(data.tokenUsage);
                }
                await saveToHistory('ai_generated', `AI Generated Post: ${writerTopic}`, data.content, { template: writerTemplate, tone: writerTone, length: writerLength, model: data.model });
            } else setWriterStatus(data.error || 'Generation failed');
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
            if (data.success) {
                const drafts = data.drafts || [];
                // Separate scheduled posts from regular drafts
                const scheduled = drafts.filter((d: any) => d.status === 'scheduled' && d.scheduledFor);
                const regularDrafts = drafts.filter((d: any) => d.status !== 'scheduled' || !d.scheduledFor);
                setWriterScheduledPosts(scheduled);
                setWriterDrafts(regularDrafts);
            }
        } catch {}
    };

    const loadScheduledPosts = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/scheduled-posts', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setWriterScheduledPosts(data.scheduledPosts || []);
                setTaskCounts(data.taskCounts || { pending: 0, in_progress: 0, completed: 0, failed: 0 });
            }
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
            if (data.success) { 
                setWriterStatus('✅ Post scheduled! Task created for extension.'); 
                loadScheduledPosts(); // Refresh scheduled posts
                // Clear schedule inputs
                setWriterScheduleDate('');
                setWriterScheduleTime('');
                // Clear content
                setWriterContent('');
                setWriterTopic('');
            }
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
    const loadSavedPosts = async (page = 1, periodOverride?: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setSavedPostsLoading(true);
        try {
            // Calculate date filter based on trending period
            const activePeriod = periodOverride !== undefined ? periodOverride : trendingPeriod;
            let periodFilter = '';
            if (activePeriod === 'today') {
                const d = new Date(); d.setHours(0,0,0,0);
                periodFilter = d.toISOString();
            } else if (activePeriod === 'week') {
                const d = new Date(); d.setDate(d.getDate() - 7);
                periodFilter = d.toISOString();
            } else if (activePeriod === 'month') {
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
            const res = await fetch('/api/vector/ingest', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success && data.sources) {
                setInspirationSources(data.sources.map((s: any) => ({ name: s.name, profileUrl: s.profileUrl, count: s.postCount || 0 })));
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

    // Kommentify shared content functions
    const loadSharedPosts = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setSharedPostsLoading(true);
        try {
            const res = await fetch('/api/shared/posts?limit=50', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setSharedPosts(data.posts || []);
        } catch {} finally { setSharedPostsLoading(false); }
    };
    const loadSharedInspProfiles = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/shared/inspiration-profiles', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setSharedInspProfiles(data.profiles || []);
        } catch {}
    };
    const loadSharedCommentProfiles = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/shared/comment-profiles', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setSharedCommentProfiles(data.profiles || []);
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

    const loadCommentSettings = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setCsSettingsLoading(true);
        try {
            const res = await fetch('/api/comment-settings', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success && data.settings) {
                setCsUseProfileStyle(data.settings.useProfileStyle === true);
                setCsGoal(data.settings.goal || 'AddValue');
                setCsTone(data.settings.tone || 'Friendly');
                setCsLength(data.settings.commentLength || 'Short');
                setCsStyle(data.settings.commentStyle || 'direct');
                setCsModel(data.settings.model || 'gpt-4o');
                setCsExpertise(data.settings.userExpertise || '');
                setCsBackground(data.settings.userBackground || '');
                setCsAutoPost(data.settings.aiAutoPost || 'manual');
            }
        } catch {} finally { setCsSettingsLoading(false); }
    };

    const saveCommentSettings = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setCsSettingsSaving(true);
        try {
            const res = await fetch('/api/comment-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ 
                    useProfileStyle: csUseProfileStyle, 
                    goal: csGoal, 
                    tone: csTone, 
                    commentLength: csLength, 
                    commentStyle: csStyle, 
                    model: csModel, 
                    userExpertise: csExpertise, 
                    userBackground: csBackground, 
                    aiAutoPost: csAutoPost 
                }),
            });
            const data = await res.json();
            if (data.success) showToast('Comment settings saved!', 'success');
            else showToast('Failed to save settings', 'error');
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
        finally { setCsSettingsSaving(false); }
    };

    // LinkedIn Profile Data functions
    const loadLinkedInProfile = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setLinkedInProfileLoading(true);
        try {
            const res = await fetch('/api/linkedin-profile', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success && data.data) {
                setLinkedInProfile(data.data);
                setLinkedInUseProfileData(data.data.isSelected !== false);
            }
        } catch {} finally { setLinkedInProfileLoading(false); }
    };

    const deleteLinkedInProfile = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        if (!confirm('Are you sure you want to delete your LinkedIn profile data?')) return;
        
        try {
            const res = await fetch('/api/linkedin-profile', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setLinkedInProfile(null);
                setLinkedInTopicSuggestions([]);
                showToast('LinkedIn profile data deleted successfully', 'success');
            } else {
                showToast(data.error || 'Failed to delete profile data', 'error');
            }
        } catch (e: any) {
            showToast('Error: ' + e.message, 'error');
        }
    };

    const scanLinkedInProfile = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setLinkedInProfileScanning(true);
        setLinkedInProfileStatus('Scanning LinkedIn profile... Extension will open LinkedIn feed, find your profile, and extract data.');
        try {
            // Send command to extension to scan profile
            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ command: 'scan_my_linkedin_profile' }),
            });
            const data = await res.json();
            if (data.success) {
                setLinkedInProfileStatus('Profile scan started! Check extension popup for progress. Data will appear here when complete.');
                showToast('📡 Profile scan started! Check extension popup.', 'info');
            } else {
                setLinkedInProfileStatus(data.error || 'Failed to start scan');
            }
        } catch (e: any) {
            setLinkedInProfileStatus('Error: ' + e.message);
        } finally { setLinkedInProfileScanning(false); }
    };

    const generateTopicSuggestions = async () => {
        if (!linkedInProfile) return;
        setLinkedInGeneratingTopics(true);
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            // Use arrays directly - they're already parsed by the API
            const experience = Array.isArray(linkedInProfile.experience) ? linkedInProfile.experience : [];
            const skills = Array.isArray(linkedInProfile.skills) ? linkedInProfile.skills : [];
            
            const res = await fetch('/api/ai/generate-topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    profileData: {
                        headline: linkedInProfile.headline,
                        about: linkedInProfile.about,
                        experience,
                        skills
                    }
                }),
            });
            const data = await res.json();
            if (data.success && data.topics) {
                setLinkedInTopicSuggestions(data.topics);
            } else {
                showToast(data.error || 'Failed to generate topics', 'error');
            }
        } catch (e: any) {
            showToast('Error: ' + e.message, 'error');
        } finally { setLinkedInGeneratingTopics(false); }
    };

    const selectTopicSuggestion = (topic: string) => {
        setWriterTopic(topic);
        showToast('Topic added to input!', 'success');
    };

    const toggleLinkedInProfileData = async (enabled: boolean) => {
        setLinkedInUseProfileData(enabled);
        const token = localStorage.getItem('authToken');
        if (!token || !linkedInProfile) return;
        try {
            await fetch('/api/linkedin-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ isSelected: enabled }),
            });
        } catch {}
    };

    // Automation settings functions
    const loadAutoSettings = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setAutoSettingsLoading(true);
        try {
            const res = await fetch('/api/automation-settings', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setAutoSettings(data.settings);
        } catch {} finally { setAutoSettingsLoading(false); }
    };
    const saveAutoSettings = async (updates: any) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setAutoSettingsSaving(true);
        try {
            const res = await fetch('/api/automation-settings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(updates) });
            const data = await res.json();
            if (data.success) { setAutoSettings(data.settings); showToast('Settings saved!', 'success'); }
            else showToast('Failed to save', 'error');
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
        finally { setAutoSettingsSaving(false); }
    };

    // Commenter config functions
    const loadCommenterCfg = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setCommenterCfgLoading(true);
        try {
            const res = await fetch('/api/commenter-config', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setCommenterCfg(data.config);
        } catch {} finally { setCommenterCfgLoading(false); }
    };
    const saveCommenterCfg = async (updates: any) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setCommenterCfgSaving(true);
        try {
            const res = await fetch('/api/commenter-config', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(updates) });
            const data = await res.json();
            if (data.success) { setCommenterCfg(data.config); showToast('Commenter settings saved!', 'success'); }
            else showToast('Failed to save', 'error');
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
        finally { setCommenterCfgSaving(false); }
    };

    // Import config functions
    const loadImportCfg = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setImportCfgLoading(true);
        try {
            const res = await fetch('/api/import-config', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setImportCfg(data.config);
        } catch {} finally { setImportCfgLoading(false); }
    };
    const saveImportCfg = async (updates: any) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setImportCfgSaving(true);
        try {
            const res = await fetch('/api/import-config', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(updates) });
            const data = await res.json();
            if (data.success) { setImportCfg(data.config); showToast('Import settings saved!', 'success'); }
            else showToast('Failed to save', 'error');
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
        finally { setImportCfgSaving(false); }
    };

    // Tasks functions
    const addTaskNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        setTaskNotifications(prev => [...prev.slice(-4), { id, message, type, time: Date.now() }]);
        setTimeout(() => setTaskNotifications(prev => prev.filter(n => n.id !== id)), 5000);
    };

    const loadTasks = async (silent = false) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        if (!silent) setTasksLoading(true);
        try {
            const res = await fetch('/api/extension/command/all', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                const newTasks = data.commands || [];
                // Detect changes for notifications - use refs to avoid duplicates
                if (prevTasksRef.current.length > 0) {
                    for (const nt of newTasks) {
                        const notifKey = `${nt.id}_${nt.status}`;
                        if (notifiedTaskIds.current.has(notifKey)) continue;
                        const prev = prevTasksRef.current.find((t: any) => t.id === nt.id);
                        const cmdName = nt.command === 'post_to_linkedin' ? 'Post to LinkedIn' : nt.command === 'scrape_feed_now' ? 'Scrape Feed' : nt.command === 'scrape_profile' ? 'Scrape Profile' : nt.command;
                        if (!prev) {
                            notifiedTaskIds.current.add(notifKey);
                            addTaskNotification(`New task: ${cmdName}`, 'info');
                        } else if (prev.status !== nt.status) {
                            notifiedTaskIds.current.add(notifKey);
                            if (nt.status === 'completed' || nt.status === 'completed_manual') addTaskNotification(`Completed: ${cmdName}`, 'success');
                            else if (nt.status === 'failed' || nt.status === 'cancelled') addTaskNotification(`Failed: ${cmdName}`, 'error');
                            else if (nt.status === 'in_progress') addTaskNotification(`Processing: ${cmdName}`, 'info');
                        }
                    }
                }
                prevTasksRef.current = newTasks;
                setTasks(newTasks);
                
                // Connectivity is handled by heartbeat polling (see checkExtensionConnectivity)
            }
        } catch {} finally { if (!silent) setTasksLoading(false); }
    };

    const loadReferralData = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/referrals', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setReferralData(data);
            }
        } catch {}
    };

    const loadAccountSettings = async () => {
        // Account settings are loaded in the main auth useEffect
    };

    // Check extension connectivity via heartbeat endpoint and recent activity
    const checkExtensionConnectivity = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/extension/heartbeat', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            
            // Consider extension connected if:
            // 1. Recent heartbeat (within 5 minutes)
            // 2. Recent successful task completion (within 10 minutes)
            const heartbeatConnected = !!data.connected;
            const now = new Date();
            const recentTasks = tasks.filter(task => 
                task.status === 'completed' && 
                new Date(task.updatedAt) > new Date(now.getTime() - 10 * 60 * 1000)
            );
            
            const taskActivityConnected = recentTasks.length > 0;
            const isConnected = heartbeatConnected || taskActivityConnected;
            
            setExtensionConnected(isConnected);
            if (isConnected) setExtensionLastSeen(new Date());
        } catch {}
    };

    // Poll tasks every 15 seconds for live notifications - empty deps so interval is created once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        checkExtensionConnectivity();
        const taskInterval = setInterval(() => loadTasks(true), 15000);
        const heartbeatInterval = setInterval(() => checkExtensionConnectivity(), 15000); // Check every 15 seconds
        return () => { clearInterval(taskInterval); clearInterval(heartbeatInterval); };
    }, []);

    // Load tab-specific data on initial mount when auth completes (fixes ?tab=import reload)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (loading || !user) return;
        const tab = activeTab;
        if (tab === 'writer') { loadDrafts(); loadInspirationSources(); loadSharedInspProfiles(); loadLinkedInProfile(); loadScheduledPosts(); }
        if (tab === 'comments') { loadCommentSettings(); loadCommentStyleProfiles(); loadSharedCommentProfiles(); }
        if (tab === 'trending-posts') { loadSavedPosts(); loadSharedPosts(); loadFeedSchedule(); }
        if (tab === 'tasks') loadTasks();
        if (tab === 'referrals') loadReferralData();
        if (tab === 'account') loadAccountSettings();
    }, [loading, user, activeTab]);

    const stopAllTasks = async () => {
        const token = localStorage.getItem('authToken');
// ... (rest of the code remains the same)
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
        setTrendingStatus('Analyzing voice patterns and generating posts...');
        setTrendingShowGenPreview(false);
        setTrendingTokenUsage(null);
        try {
            const res = await fetch('/api/ai/generate-trending', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ 
                    trendingPosts: selected, 
                    customPrompt: trendingCustomPrompt, 
                    includeHashtags: trendingIncludeHashtags, 
                    language: trendingLanguage,
                    model: trendingModel 
                }),
            });
            const data = await res.json();
            if (data.success && data.posts) {
                setTrendingGeneratedPosts(data.posts);
                setTrendingShowGenPreview(true);
                setTrendingStatus(`✅ Generated ${data.posts.length} viral posts using ${data.model || trendingModel}!`);
                setGeneratedPostImages({});
                // Capture token usage for developers
                if (data.tokenUsage) {
                    setTrendingTokenUsage(data.tokenUsage);
                }
                // Save to history
                await saveToHistory('ai_generated', `AI Generated ${data.posts.length} Posts`, data.posts, { customPrompt: trendingCustomPrompt, selectedCount: selected.length, model: data.model });
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

    // Analytics functions
    const loadAnalytics = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setAnalyticsLoading(true);
        try {
            const res = await fetch(`/api/analytics?period=${analyticsPeriod}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setAnalyticsData(data);
            }
        } catch (e) { console.error('Failed to load analytics:', e); }
        finally { setAnalyticsLoading(false); }
    };

    // History functions
    const loadHistory = async (page = 1, filterOverride?: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setHistoryLoading(true);
        try {
            const activeFilter = filterOverride !== undefined ? filterOverride : historyFilter;
            const typeParam = activeFilter === 'all' ? '' : activeFilter;
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
        // Update URL without full navigation so reload preserves tab
        window.history.replaceState(null, '', `/dashboard?tab=${tabId}`);
        if (tabId === 'writer') { loadDrafts(); loadInspirationSources(); loadSharedInspProfiles(); }
        if (tabId === 'comments') { loadCommentSettings(); loadCommentStyleProfiles(); loadSharedCommentProfiles(); }
        if (tabId === 'trending-posts') { loadSavedPosts(); loadSharedPosts(); loadFeedSchedule(); }
        if (tabId === 'tasks') loadTasks();
        if (tabId === 'history') loadHistory();
        if (tabId === 'limits') loadAutoSettings();
        if (tabId === 'commenter') { loadCommenterCfg(); loadCommentSettings(); }
        if (tabId === 'import') loadImportCfg();
        if (tabId === 'analytics') loadAnalytics();
    };

    if (loggingOut) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)'
            }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚪</div>
                    <div style={{ fontSize: '18px', opacity: 0.8 }}>Logging out...</div>
                </div>
            </div>
        );
    }

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

    const svgIcon = (path: string, color = 'currentColor') => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={path} />
        </svg>
    );

    const miniIcon = (path: string, color = 'currentColor', size = 14) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
            <path d={path} />
        </svg>
    );

    // Navigation items with grouped sections
    const navItems = [
        { id: 'overview', label: 'Overview', icon: svgIcon('M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10'), section: 'dashboard' },
        // Posts section
        { id: 'trending-posts', label: 'Viral Posts Writer', icon: svgIcon('M13 2L3 14h9l-1 8 10-12h-9l1-8z'), section: 'posts' },
        { id: 'writer', label: 'Personalized Post Writer', icon: svgIcon('M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'), section: 'posts' },
        // Comments section
        { id: 'commenter', label: 'Auto Commenter', icon: svgIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'), section: 'comments' },
        { id: 'comments', label: 'Comments Settings', icon: svgIcon('M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'), section: 'comments' },
        { id: 'import', label: 'Import Profiles', icon: svgIcon('M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8.5 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M20 8v6 M23 11h-6'), section: 'comments' },
        // Other
        { id: 'limits', label: 'Limits & Delays', icon: svgIcon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'), section: 'management' },
        { id: 'tasks', label: 'Tasks', icon: svgIcon('M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'), section: 'management' },
        { id: 'history', label: 'History', icon: svgIcon('M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'), section: 'management' },
    ];

    const accountItems = [
        { id: 'analytics', label: 'Analytics', icon: svgIcon('M3 3v18h18 M9 17V9 M13 17V5 M17 17v-4 M5 17v-2') },
        { id: 'usage', label: 'Usage & Limits', icon: svgIcon('M18 20V10 M12 20V4 M6 20v-6') },
        { id: 'referrals', label: 'Referrals', icon: svgIcon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z') },
        { id: 'extension', label: 'Extension', icon: svgIcon('M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z') },
    ];

    const settingsItems = [
        { id: 'account', label: 'Account', icon: svgIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z') },
        { id: 'billing', label: 'Billing', icon: svgIcon('M1 4h22v16H1z M1 10h22'), action: () => router.push('/plans') },
    ];

    return (
        <div data-theme={theme} style={{ 
            fontFamily: 'system-ui, -apple-system, sans-serif', 
            minHeight: '100vh', 
            background: theme === 'light' ? 'linear-gradient(135deg, #f8f9fc 0%, #eef1f8 100%)' : theme === 'dark' ? 'linear-gradient(135deg, #0a0a1a 0%, #111128 100%)' : 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
            color: theme === 'light' ? '#1a1a2e' : 'white',
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
            {/* Task Notification Popups */}
            {taskNotifications.map((tn, idx) => (
                <div key={tn.id} style={{
                    position: 'fixed', top: `${70 + idx * 52}px`, right: '24px', zIndex: 9999,
                    padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                    color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    animation: 'slideIn 0.3s ease-out',
                    background: tn.type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                               tn.type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                               'linear-gradient(135deg, #3b82f6, #2563eb)',
                    display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '340px',
                }}>
                    <span>{tn.type === 'success' ? '✅' : tn.type === 'error' ? '❌' : '🔄'}</span>
                    {tn.message}
                    <button onClick={() => setTaskNotifications(prev => prev.filter(n => n.id !== tn.id))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px', opacity: 0.7, marginLeft: '4px' }}>✕</button>
                </div>
            ))}

            {/* Persistent Task Status Boxes (top-right) */}
            <div style={{ position: 'fixed', top: '24px', right: '440px', zIndex: 9998, display: 'flex', gap: '6px' }}>
                {[
                    { key: 'pending', label: 'Pending', count: tasks.filter(t => t.status === 'pending').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
                    { key: 'in_progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
                    { key: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed' || t.status === 'completed_manual').length, color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
                    { key: 'failed', label: 'Failed', count: tasks.filter(t => t.status === 'failed' || t.status === 'cancelled').length, color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
                ].map(s => (
                    <div key={s.key} onClick={() => setTaskStatusExpanded(taskStatusExpanded === s.key ? null : s.key)}
                        style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '6px 12px', cursor: 'pointer', textAlign: 'center', minWidth: '60px', transition: 'all 0.2s', backdropFilter: 'blur(10px)', transform: taskStatusExpanded === s.key ? 'scale(1.05)' : 'scale(1)' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.count}</div>
                        <div style={{ fontSize: '9px', color: s.color, fontWeight: '600', opacity: 0.8, whiteSpace: 'nowrap' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Expanded Task List Popup */}
            {taskStatusExpanded && (
                <>
                    <div onClick={() => setTaskStatusExpanded(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9997 }} />
                    <div style={{ position: 'fixed', top: '72px', right: '440px', zIndex: 9998, background: theme === 'light' ? '#fff' : '#1a1a3e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '16px', width: '380px', maxHeight: '400px', overflowY: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ color: theme === 'light' ? '#1a1a2e' : 'white', fontWeight: '700', fontSize: '14px' }}>
                                {taskStatusExpanded === 'pending' ? 'Pending' : taskStatusExpanded === 'in_progress' ? 'In Progress' : taskStatusExpanded === 'completed' ? 'Completed' : 'Failed/Cancelled'} Tasks
                            </span>
                            <button onClick={() => setTaskStatusExpanded(null)} style={{ background: 'none', border: 'none', color: theme === 'light' ? '#666' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                        </div>
                        {tasks.filter(t => {
                            if (taskStatusExpanded === 'pending') return t.status === 'pending';
                            if (taskStatusExpanded === 'in_progress') return t.status === 'in_progress';
                            if (taskStatusExpanded === 'completed') return t.status === 'completed' || t.status === 'completed_manual';
                            if (taskStatusExpanded === 'failed') return t.status === 'failed' || t.status === 'cancelled';
                            return false;
                        }).length === 0 ? (
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No tasks</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {tasks.filter(t => {
                                    if (taskStatusExpanded === 'pending') return t.status === 'pending';
                                    if (taskStatusExpanded === 'in_progress') return t.status === 'in_progress';
                                    if (taskStatusExpanded === 'completed') return t.status === 'completed' || t.status === 'completed_manual';
                                    if (taskStatusExpanded === 'failed') return t.status === 'failed' || t.status === 'cancelled';
                                    return false;
                                }).map((task: any) => (
                                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ color: theme === 'light' ? '#1a1a2e' : 'white', fontWeight: '600', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {task.command === 'post_to_linkedin' ? 'Post to LinkedIn' : task.command === 'scrape_feed_now' ? 'Scrape Feed' : task.command === 'scrape_profile' ? 'Scrape Profile' : task.command === 'start_bulk_commenting' ? 'Bulk Commenting' : task.command === 'start_import_automation' ? 'Import Automation' : task.command}
                                            </div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{task.createdAt ? new Date(task.createdAt).toLocaleString() : ''}</div>
                                        </div>
                                        {(task.status === 'pending' || task.status === 'in_progress') && (
                                            <button onClick={async (e) => {
                                                e.stopPropagation();
                                                const btn = e.currentTarget;
                                                btn.textContent = 'Stopping...';
                                                btn.style.opacity = '0.6';
                                                const token = localStorage.getItem('authToken');
                                                if (!token) return;
                                                try {
                                                    window.dispatchEvent(new CustomEvent('kommentify-stop-all-tasks'));
                                                    await fetch('/api/extension/command', { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: task.id, status: 'cancelled' }) });
                                                    await loadTasks(true);
                                                    addTaskNotification(`Stopped: ${task.command === 'post_to_linkedin' ? 'Post to LinkedIn' : task.command === 'scrape_feed_now' ? 'Scrape Feed' : task.command === 'start_bulk_commenting' ? 'Bulk Commenting' : task.command === 'start_import_automation' ? 'Import Automation' : task.command}`, 'error');
                                                } catch {} finally { btn.style.opacity = '1'; }
                                            }}
                                                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
                                                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                                                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}>
                                                Stop
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            <style>{`
                @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                /* Fix select dropdown options for dark/current themes */
                [data-theme="current"] select option,
                [data-theme="dark"] select option {
                    background: #1a1a3e !important;
                    color: white !important;
                }
                /* ===== LIGHT THEME OVERRIDES ===== */
                [data-theme="light"] { color: #1a1a2e !important; }
                [data-theme="light"] h1, [data-theme="light"] h2, [data-theme="light"] h3, [data-theme="light"] h4, [data-theme="light"] h5 { color: #1a1a2e !important; }
                [data-theme="light"] p, [data-theme="light"] span, [data-theme="light"] label, [data-theme="light"] div { color: inherit; }
                /* Main content area text */
                [data-theme="light"] input, [data-theme="light"] textarea {
                    background: white !important; color: #1a1a2e !important; border-color: rgba(0,0,0,0.2) !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
                }
                [data-theme="light"] input::placeholder, [data-theme="light"] textarea::placeholder { color: #999 !important; }
                [data-theme="light"] select {
                    background: white !important; color: #1a1a2e !important; border-color: rgba(0,0,0,0.2) !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
                }
                [data-theme="light"] select option { background: white !important; color: #1a1a2e !important; }
                /* SVG icons in sidebar */
                [data-theme="light"] svg { stroke: currentColor !important; }
                /* Fix all white text to dark - comprehensive */
                [data-theme="light"] [style*="color: white"],
                [data-theme="light"] [style*="color: rgb(255, 255, 255)"] { color: #1a1a2e !important; }
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.8)"],
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.85)"],
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.7)"] { color: #333 !important; }
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.6)"],
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.5)"] { color: #666 !important; }
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.4)"],
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.3)"],
                [data-theme="light"] [style*="color: rgba(255, 255, 255, 0.35)"] { color: #888 !important; }
                /* Cards, containers and boxes - make visible */
                [data-theme="light"] [style*="background: rgba(255, 255, 255, 0.05)"],
                [data-theme="light"] [style*="background: rgba(255,255,255,0.05)"] { background: white !important; box-shadow: 0 1px 4px rgba(0,0,0,0.08) !important; }
                [data-theme="light"] [style*="background: rgba(255, 255, 255, 0.08)"],
                [data-theme="light"] [style*="background: rgba(255,255,255,0.08)"] { background: rgba(245,245,250,0.9) !important; box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important; }
                [data-theme="light"] [style*="background: rgba(255, 255, 255, 0.03)"],
                [data-theme="light"] [style*="background: rgba(255,255,255,0.03)"] { background: rgba(248,248,252,0.8) !important; }
                [data-theme="light"] [style*="background: rgba(255, 255, 255, 0.04)"],
                [data-theme="light"] [style*="background: rgba(255,255,255,0.04)"] { background: rgba(245,245,250,0.6) !important; }
                [data-theme="light"] [style*="background: rgba(0, 0, 0, 0.2)"],
                [data-theme="light"] [style*="background: rgba(0,0,0,0.2)"],
                [data-theme="light"] [style*="background: rgba(0, 0, 0, 0.15)"],
                [data-theme="light"] [style*="background: rgba(0,0,0,0.15)"] { background: rgba(240,240,248,0.8) !important; }
                /* Borders */
                [data-theme="light"] [style*="border: 1px solid rgba(255, 255, 255"],
                [data-theme="light"] [style*="border: 1px solid rgba(255,255,255"] { border-color: rgba(0,0,0,0.1) !important; }
                [data-theme="light"] [style*="border: 2px solid rgba(255, 255, 255"],
                [data-theme="light"] [style*="border: 2px solid rgba(255,255,255"] { border-color: rgba(0,0,0,0.12) !important; }
                [data-theme="light"] [style*="border-top: 1px solid rgba(255, 255, 255"],
                [data-theme="light"] [style*="border-top: 1px solid rgba(255,255,255"] { border-top-color: rgba(0,0,0,0.08) !important; }
                [data-theme="light"] [style*="border-right: 1px solid rgba(255, 255, 255"],
                [data-theme="light"] [style*="borderRight"] { border-right-color: rgba(0,0,0,0.08) !important; }
                /* Gradient cards - keep visible */
                [data-theme="light"] [style*="background: linear-gradient(135deg, rgba(105,63,233"] { background: linear-gradient(135deg, rgba(105,63,233,0.08), rgba(139,92,246,0.05)) !important; border-color: rgba(105,63,233,0.2) !important; }
                [data-theme="light"] [style*="background: linear-gradient(135deg, rgba(16,185,129"] { background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.05)) !important; border-color: rgba(16,185,129,0.2) !important; }
                [data-theme="light"] [style*="background: linear-gradient(135deg, rgba(245,158,11"] { background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.05)) !important; border-color: rgba(245,158,11,0.2) !important; }
                /* Table styling */
                [data-theme="light"] table { color: #1a1a2e !important; }
                [data-theme="light"] th { color: #555 !important; }
                [data-theme="light"] td { color: #333 !important; }
                /* Buttons - keep gradient buttons white text */
                [data-theme="light"] button[style*="linear-gradient"] { color: white !important; }
                /* Toast text */
                [data-theme="light"] [style*="animation: slideIn"] { color: white !important; }
                /* Progress bars */
                [data-theme="light"] [style*="background: rgba(255, 255, 255, 0.1)"],
                [data-theme="light"] [style*="background: rgba(255,255,255,0.1)"] { background: rgba(0,0,0,0.08) !important; }
                /* Logout border */
                [data-theme="light"] [style*="border-top: 1px solid rgba(255,255,255,0.08)"] { border-top-color: rgba(0,0,0,0.08) !important; }
                /* Sidebar collapse divider */
                [data-theme="light"] [style*="borderTop: 1px solid rgba(255,255,255,0.1)"] { border-top-color: rgba(0,0,0,0.1) !important; }
                /* Colored status badges - keep readable */
                [data-theme="light"] [style*="rgba(16,185,129,0.08)"] { background: rgba(16,185,129,0.08) !important; }
                [data-theme="light"] [style*="rgba(105,63,233,0.08)"],
                [data-theme="light"] [style*="rgba(105,63,233,0.06)"] { background: rgba(105,63,233,0.06) !important; }
                [data-theme="light"] [style*="rgba(245,158,11,0.08)"] { background: rgba(245,158,11,0.06) !important; }
                [data-theme="light"] [style*="rgba(59,130,246,0.12)"] { background: rgba(59,130,246,0.08) !important; }
                [data-theme="light"] [style*="rgba(59,130,246,0.08)"] { background: rgba(59,130,246,0.06) !important; }
            `}</style>
            {/* Professional Sidebar */}
            <div style={{
                width: sidebarCollapsed ? '80px' : '260px',
                background: theme === 'light' ? 'rgba(255,255,255,0.97)' : 'rgba(15, 15, 35, 0.95)',
                borderRight: theme === 'light' ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.08)',
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
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', marginBottom: '8px', paddingLeft: '12px', letterSpacing: '1.5px', fontWeight: '600' }}>
                            Dashboard
                        </div>
                    )}
                    {navItems.filter(i => i.section === 'dashboard').map(item => (
                        <button key={item.id} onClick={() => handleTabChange(item.id)} title={sidebarCollapsed ? item.label : undefined}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: sidebarCollapsed ? '14px' : '12px 16px', background: activeTab === item.id ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)' : 'transparent', color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'), border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent', borderRadius: '12px', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.2s ease', fontWeight: activeTab === item.id ? '600' : '500', fontSize: '14px', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}

                    {!sidebarCollapsed && <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', margin: '18px 0 8px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>Posts</div>}
                    {sidebarCollapsed && <div style={{ margin: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />}
                    {navItems.filter(i => i.section === 'posts').map(item => (
                        <button key={item.id} onClick={() => handleTabChange(item.id)} title={sidebarCollapsed ? item.label : undefined}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: sidebarCollapsed ? '14px' : '12px 16px', background: activeTab === item.id ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)' : 'transparent', color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'), border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent', borderRadius: '12px', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.2s ease', fontWeight: activeTab === item.id ? '600' : '500', fontSize: '14px', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}

                    {!sidebarCollapsed && <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', margin: '18px 0 8px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>Comments</div>}
                    {sidebarCollapsed && <div style={{ margin: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />}
                    {navItems.filter(i => i.section === 'comments').map(item => (
                        <button key={item.id} onClick={() => handleTabChange(item.id)} title={sidebarCollapsed ? item.label : undefined}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: sidebarCollapsed ? '14px' : '12px 16px', background: activeTab === item.id ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)' : 'transparent', color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'), border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent', borderRadius: '12px', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.2s ease', fontWeight: activeTab === item.id ? '600' : '500', fontSize: '14px', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}

                    {!sidebarCollapsed && <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', margin: '18px 0 8px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>Management</div>}
                    {sidebarCollapsed && <div style={{ margin: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />}
                    {navItems.filter(i => i.section === 'management').map(item => (
                        <button key={item.id} onClick={() => handleTabChange(item.id)} title={sidebarCollapsed ? item.label : undefined}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: sidebarCollapsed ? '14px' : '12px 16px', background: activeTab === item.id ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)' : 'transparent', color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'), border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent', borderRadius: '12px', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.2s ease', fontWeight: activeTab === item.id ? '600' : '500', fontSize: '14px', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}

                    {!sidebarCollapsed && (
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', margin: '24px 0 12px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>
                            Account
                        </div>
                    )}

                    {sidebarCollapsed && <div style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>}

                    {accountItems.map(item => (
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
                                color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'),
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
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}

                    {!sidebarCollapsed && (
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', margin: '24px 0 12px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>
                            Settings
                        </div>
                    )}

                    {sidebarCollapsed && <div style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>}

                    {settingsItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => item.action ? item.action() : handleTabChange(item.id)}
                            title={sidebarCollapsed ? item.label : undefined}
                            data-settings-btn="true"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                width: '100%',
                                padding: sidebarCollapsed ? '14px' : '12px 16px',
                                background: activeTab === item.id 
                                    ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)'
                                    : 'transparent',
                                color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'),
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
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}
                </div>

                {/* Logout Button */}
                <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                        onClick={async () => {
                            setLoggingOut(true);
                            try {
                                localStorage.removeItem('authToken');
                                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
                                await signOut();
                            } catch (e) {
                                console.error('Sign out error:', e);
                            }
                            window.location.href = '/login';
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
                            margin: '0 0 8px 0',
                        }}>
                            {activeTab === 'overview' && 'Overview'}
                            {activeTab === 'writer' && 'Personalized Post Writer'}
                            {activeTab === 'comments' && 'Comments Settings'}
                            {activeTab === 'trending-posts' && 'Viral Posts Writer'}
                            {activeTab === 'tasks' && 'Tasks'}
                            {activeTab === 'history' && 'History'}
                            {activeTab === 'limits' && 'Limits & Delays'}
                            {activeTab === 'commenter' && 'Auto Commenter'}
                            {activeTab === 'import' && 'Import Profiles'}
                            {activeTab === 'analytics' && 'Analytics'}
                            {activeTab === 'usage' && 'Usage & Limits'}
                            {activeTab === 'referrals' && 'Referral Program'}
                            {activeTab === 'extension' && 'Chrome Extension'}
                            {activeTab === 'account' && 'Account Settings'}
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', margin: 0 }}>
                            {activeTab === 'overview' && 'Here\'s what\'s happening with your LinkedIn automation'}
                            {activeTab === 'writer' && 'Create personalized AI posts that match your unique voice and style'}
                            {activeTab === 'trending-posts' && 'Generate viral posts inspired by top-performing LinkedIn content'}
                            {activeTab === 'comments' && 'Configure AI comment style, tone, goal, and voice profiles'}
                            {activeTab === 'tasks' && 'View and manage extension tasks'}
                            {activeTab === 'history' && 'Browse your generation and publishing history'}
                            {activeTab === 'limits' && 'LinkedIn-safe automation limits and timing controls'}
                            {activeTab === 'commenter' && 'AI-powered bulk commenting and automated engagement'}
                            {activeTab === 'import' && 'Import LinkedIn profiles for automated engagement'}
                            {activeTab === 'analytics' && 'Track engagement metrics, automation history, networking sessions, and import activities'}
                            {activeTab === 'usage' && 'Monitor your daily usage and plan limits'}
                            {activeTab === 'referrals' && 'Earn 30% commission on every paid referral'}
                            {activeTab === 'extension' && 'Install the Chrome extension to get started'}
                            {activeTab === 'account' && 'Manage your account settings'}
                        </p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Extension Connection Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {extensionConnected ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
                                <span style={{ fontSize: '11px', fontWeight: '600', color: '#34d399' }}>Extension Active</span>
                                {extensionLastSeen && <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>· {extensionLastSeen.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(251,191,36,0.1)', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.3)' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#fbbf24' }}>Extension Idle</span>
                                </div>
                                <button
                                    onClick={checkExtensionConnectivity}
                                    style={{ 
                                        padding: '4px 8px', 
                                        background: 'rgba(255,255,255,0.1)', 
                                        border: '1px solid rgba(255,255,255,0.2)', 
                                        borderRadius: '6px', 
                                        color: 'rgba(255,255,255,0.8)', 
                                        fontSize: '10px', 
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                    title="Check extension connection"
                                >
                                    🔄 Check
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => window.open('https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei', '_blank')}
                            style={{ 
                                padding: '4px 8px', 
                                background: 'rgba(59,130,246,0.1)', 
                                border: '1px solid rgba(59,130,246,0.3)', 
                                borderRadius: '6px', 
                                color: '#60a5fa', 
                                fontSize: '10px', 
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                        >
                            🧩 Get Extension
                        </button>
                    </div>
                    {/* Theme Toggle */}
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
                        {(['current', 'light', 'dark'] as const).map(t => (
                            <button key={t} onClick={() => { setTheme(t); localStorage.setItem('dashboard-theme', t); }}
                                style={{ padding: '8px 14px', background: theme === t ? 'rgba(105,63,233,0.6)' : 'transparent', color: theme === t ? 'white' : 'rgba(255,255,255,0.6)', border: 'none', fontSize: '12px', fontWeight: theme === t ? '700' : '500', cursor: 'pointer', transition: 'all 0.2s' }}>
                                {t === 'current' ? '🎨 Current' : t === 'light' ? '☀️ Light' : '🌙 Dark'}
                            </button>
                        ))}
                    </div>
                    </div>
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
                                <div style={{ fontSize: '14px', color: '#10b981' }}>Active Plan</div>
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
                            {/* LinkedIn Profile Scan Card */}
                            <div style={{ background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '24px' }}>🔗</span>
                                        <h4 style={{ margin: 0, color: 'white', fontSize: '15px', fontWeight: '700' }}>LinkedIn Profile Data</h4>
                                    </div>
                                    <button onClick={scanLinkedInProfile} disabled={linkedInProfileScanning}
                                        style={{ background: 'white', color: '#0077b5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: linkedInProfileScanning ? 'wait' : 'pointer' }}>
                                        {linkedInProfileScanning ? '⏳ Scanning...' : '📡 Scan My Profile'}
                                    </button>
                                </div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '12px' }}>
                                    {linkedInProfileStatus || 'Scan your LinkedIn profile to use your data for AI-generated content that matches your style.'}
                                </div>
                                
                                {/* Toggle for using profile data */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                                        <input type="checkbox" checked={linkedInUseProfileData} onChange={e => toggleLinkedInProfileData(e.target.checked)}
                                            style={{ width: '18px', height: '18px', accentColor: '#0077b5' }} />
                                        <span style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>Use my profile data in AI prompts</span>
                                    </label>
                                    <button onClick={loadLinkedInProfile} disabled={linkedInProfileLoading}
                                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', padding: '6px 12px', color: 'white', fontSize: '11px', cursor: 'pointer' }}>
                                        {linkedInProfileLoading ? '...' : '🔄'}
                                    </button>
                                </div>

                                {/* Profile Data Display */}
                                {linkedInProfile ? (
                                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <div>
                                                <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0' }}>
                                                    {linkedInProfile.name || 'LinkedIn Profile'}
                                                </h4>
                                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
                                                    {linkedInProfile.lastScannedAt ? `Scanned: ${new Date(linkedInProfile.lastScannedAt).toLocaleDateString()}` : ''}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={deleteLinkedInProfile}
                                                style={{ 
                                                    background: 'rgba(239, 68, 68, 0.2)', 
                                                    border: '1px solid rgba(239, 68, 68, 0.3)', 
                                                    borderRadius: '4px', 
                                                    padding: '4px 8px', 
                                                    color: '#ef4444', 
                                                    fontSize: '16px', 
                                                    cursor: 'pointer',
                                                    lineHeight: '1'
                                                }}
                                                title="Delete profile data"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                                            {linkedInProfile.headline || ''}
                                        </p>
                                        
                                        {/* Topic Suggestions */}
                                        <div style={{ marginTop: '12px' }}>
                                            <button onClick={generateTopicSuggestions} disabled={linkedInGeneratingTopics}
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '12px', cursor: 'pointer', marginBottom: '8px' }}>
                                                {linkedInGeneratingTopics ? '⏳ Generating...' : '💡 Get Topic Ideas from My Profile'}
                                            </button>
                                            
                                            {/* View All Data Button */}
                                            <button onClick={() => setShowLinkedInDataModal(true)}
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '11px', cursor: 'pointer', marginBottom: '8px' }}>
                                                📊 View All Profile Data
                                            </button>
                                            {linkedInTopicSuggestions.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {linkedInTopicSuggestions.map((topic, idx) => (
                                                        <button key={idx} onClick={() => selectTopicSuggestion(topic)}
                                                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '4px', padding: '6px 10px', color: 'white', fontSize: '11px', cursor: 'pointer', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {topic}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                                        No profile data scanned yet. Click "Scan My Profile" to get started.
                                    </div>
                                )}
                            </div>

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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>📏 Post Length</label>
                                        <select value={writerLength} onChange={e => setWriterLength(e.target.value)}
                                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px' }}>
                                            <option value="500">Short (500 chars)</option>
                                            <option value="900">Medium (900 chars)</option>
                                            <option value="1500">Long (1500 chars)</option>
                                            <option value="2500">Extra Long (2500 chars)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>🤖 AI Model</label>
                                        <select value={writerModel} onChange={e => setWriterModel(e.target.value)}
                                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px' }}>
                                            {MODEL_OPTIONS.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
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
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={writerHashtags} onChange={e => setWriterHashtags(e.target.checked)} style={{ accentColor: '#693fe9' }} />
                                        #️⃣ Hashtags
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={writerEmojis} onChange={e => setWriterEmojis(e.target.checked)} style={{ accentColor: '#693fe9' }} />
                                        😊 Emojis
                                    </label>
                                    <select value={writerLanguage} onChange={e => setWriterLanguage(e.target.value)}
                                        style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '12px' }}>
                                        <option value="">Language: Auto</option>
                                        <option value="English">English</option>
                                        <option value="Spanish">Spanish</option>
                                        <option value="French">French</option>
                                        <option value="German">German</option>
                                        <option value="Portuguese">Portuguese</option>
                                        <option value="Italian">Italian</option>
                                        <option value="Dutch">Dutch</option>
                                        <option value="Russian">Russian</option>
                                        <option value="Chinese">Chinese</option>
                                        <option value="Japanese">Japanese</option>
                                        <option value="Korean">Korean</option>
                                        <option value="Arabic">Arabic</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Urdu">Urdu</option>
                                        <option value="Turkish">Turkish</option>
                                        <option value="Polish">Polish</option>
                                        <option value="Swedish">Swedish</option>
                                        <option value="Indonesian">Indonesian</option>
                                        <option value="Thai">Thai</option>
                                        <option value="Vietnamese">Vietnamese</option>
                                    </select>
                                </div>
                                <button onClick={generatePost} disabled={writerGenerating}
                                    style={{ width: '100%', padding: '14px', background: writerGenerating ? 'rgba(105,63,233,0.5)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: writerGenerating ? 'wait' : 'pointer', boxShadow: '0 4px 15px rgba(105,63,233,0.4)' }}>
                                    {writerGenerating ? '⏳ Generating...' : '✨ Generate AI Post'}
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
                                {/* Token Usage Display - Developer Only */}
                                {isDeveloper && writerTokenUsage && (
                                    <div style={{ marginTop: '12px', padding: '14px 18px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                            {miniIcon('M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', '#60a5fa', 16)}
                                            <span style={{ color: '#60a5fa', fontSize: '13px', fontWeight: '700' }}>🔧 Developer Token Usage</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                            <div>
                                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Model</span>
                                                <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{writerTokenUsage.modelName}</div>
                                            </div>
                                            <div>
                                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Input Tokens</span>
                                                <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '600' }}>{writerTokenUsage.inputTokens?.toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Output Tokens</span>
                                                <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '600' }}>{writerTokenUsage.outputTokens?.toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Input Cost</span>
                                                <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '600' }}>{writerTokenUsage.inputCost}</div>
                                            </div>
                                            <div>
                                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Output Cost</span>
                                                <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '600' }}>{writerTokenUsage.outputCost}</div>
                                            </div>
                                            <div>
                                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Total Cost</span>
                                                <div style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '700' }}>{writerTokenUsage.totalCost}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Action Buttons */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '16px' }}>
                                    <button onClick={sendToExtension} disabled={writerPosting}
                                        style={{ padding: '13px 8px', background: writerPosting ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '13px', cursor: writerPosting ? 'wait' : 'pointer', boxShadow: writerPosting ? 'none' : '0 4px 15px rgba(105,63,233,0.4)', opacity: writerPosting ? 0.7 : 1, transition: 'all 0.2s' }}>
                                        {writerPosting ? '⏳ Sending...' : '🚀 Post to LinkedIn'}
                                    </button>
                                    <button onClick={saveDraft}
                                        style={{ padding: '13px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                                        💾 Save Draft
                                    </button>
                                    <button onClick={schedulePost}
                                        style={{ padding: '13px 8px', background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', borderRadius: '12px', color: '#c4b5fd', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                                        📅 Schedule
                                    </button>
                                </div>
                                {/* Inline Schedule Controls */}
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                                    <input type="date" value={writerScheduleDate} onChange={e => setWriterScheduleDate(e.target.value)}
                                        style={{ flex: 1, padding: '8px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
                                    <input type="time" value={writerScheduleTime} onChange={e => setWriterScheduleTime(e.target.value)}
                                        style={{ flex: 1, padding: '8px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
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
                    {/* Inspiration Sources Section - Below Grid */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><span>✨</span> Inspiration Sources</h3>
                            <button onClick={loadInspirationSources} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>🔄 Refresh</button>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '14px' }}>Add LinkedIn profiles to learn from their writing style. AI will mimic the style of your saved sources.</p>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                            <textarea value={inspirationProfiles} onChange={e => setInspirationProfiles(e.target.value)} placeholder={"https://linkedin.com/in/username1\nhttps://linkedin.com/in/username2"} rows={2}
                                style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'system-ui, sans-serif', lineHeight: '1.5' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <select value={inspirationPostCount} onChange={e => setInspirationPostCount(parseInt(e.target.value))} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px' }}>
                                    <option value="5">5 posts</option><option value="10">10 posts</option><option value="15">15 posts</option><option value="20">20 posts</option><option value="30">30 posts</option>
                                </select>
                                <button onClick={scrapeInspirationProfiles} disabled={inspirationScraping} style={{ padding: '8px 16px', background: inspirationScraping ? 'rgba(105,63,233,0.3)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: inspirationScraping ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
                                    {inspirationScraping ? '⏳ Scraping...' : '🔍 Scrape'}
                                </button>
                            </div>
                        </div>
                        {inspirationStatus && <div style={{ marginBottom: '12px', padding: '8px 14px', background: inspirationStatus.includes('Error') || inspirationStatus.includes('Failed') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${inspirationStatus.includes('Error') || inspirationStatus.includes('Failed') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '10px', color: inspirationStatus.includes('Error') || inspirationStatus.includes('Failed') ? '#f87171' : '#34d399', fontSize: '12px' }}>{inspirationStatus}</div>}
                        {inspirationSources.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                {inspirationSources.map((src: any, i: number) => {
                                    const isChecked = inspirationUseAll || inspirationSelected.includes(src.name);
                                    return (
                                    <div key={i} onClick={() => {
                                        if (inspirationUseAll) { setInspirationUseAll(false); setInspirationSelected([src.name]); }
                                        else if (isChecked) setInspirationSelected(inspirationSelected.filter(n => n !== src.name));
                                        else setInspirationSelected([...inspirationSelected, src.name]);
                                    }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isChecked ? 'rgba(105,63,233,0.15)' : 'rgba(255,255,255,0.05)', padding: '8px 14px', borderRadius: '10px', border: isChecked ? '1px solid rgba(105,63,233,0.4)' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <input type="checkbox" checked={isChecked} readOnly style={{ accentColor: '#693fe9', width: '15px', height: '15px', cursor: 'pointer' }} />
                                        <span style={{ fontSize: '12px' }}>👤</span>
                                        <span style={{ color: isChecked ? '#a78bfa' : 'white', fontSize: '13px', fontWeight: '600' }}>{src.name}</span>
                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{src.count} posts</span>
                                        <button onClick={(e) => { e.stopPropagation(); deleteInspirationSource(src.name); }} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px', padding: '0 2px', lineHeight: 1 }}>×</button>
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                        {inspirationSources.length === 0 && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', textAlign: 'center', margin: '8px 0 0' }}>No sources yet. Add LinkedIn profiles above to get started.</p>}
                        {inspirationSources.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(105,63,233,0.1)', borderRadius: '10px', border: '1px solid rgba(105,63,233,0.25)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={inspirationUseAll} onChange={e => { setInspirationUseAll(e.target.checked); if (e.target.checked) setInspirationSelected(inspirationSources.map(s => s.name)); }} style={{ accentColor: '#693fe9', width: '16px', height: '16px' }} />
                                    <strong>Use All Sources</strong>
                                </label>
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>AI will mimic their writing style when generating posts</span>
                            </div>
                        )}
                        {/* Kommentify Shared Profiles */}
                        {sharedInspProfiles.length > 0 && (
                            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(245,158,11,0.08)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.2)' }}>
                                <div style={{ color: '#fbbf24', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>⭐ Kommentify Shared Profiles</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {sharedInspProfiles.map((p: any, i: number) => {
                                        const isChecked = inspirationSelected.includes(p.profileName);
                                        return (
                                        <div key={i} onClick={() => {
                                            if (isChecked) setInspirationSelected(inspirationSelected.filter(n => n !== p.profileName));
                                            else { setInspirationUseAll(false); setInspirationSelected([...inspirationSelected, p.profileName]); }
                                        }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isChecked ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '8px', border: isChecked ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <input type="checkbox" checked={isChecked} readOnly style={{ accentColor: '#f59e0b', width: '14px', height: '14px', cursor: 'pointer' }} />
                                            <span style={{ fontSize: '11px' }}>👤</span>
                                            <span style={{ color: isChecked ? '#fbbf24' : 'white', fontSize: '12px', fontWeight: '600' }}>{p.profileName}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{p.postCount} posts</span>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Scheduled Posts Calendar & Task Status */}
                    {(writerScheduledPosts.length > 0 || taskCounts.pending > 0 || taskCounts.in_progress > 0 || taskCounts.completed > 0 || taskCounts.failed > 0) ? (
                        <div style={{ marginTop: '24px' }}>
                            {/* Task Status Overview */}
                            <div style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                padding: '20px', 
                                borderRadius: '16px', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                marginBottom: '20px' 
                            }}>
                                <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>📊</span> Task Status Overview
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                    {[
                                        { label: 'Pending', count: taskCounts.pending, color: '#f59e0b', icon: '⏳' },
                                        { label: 'In Progress', count: taskCounts.in_progress, color: '#3b82f6', icon: '🔄' },
                                        { label: 'Completed', count: taskCounts.completed, color: '#10b981', icon: '✅' },
                                        { label: 'Failed', count: taskCounts.failed, color: '#ef4444', icon: '❌' }
                                    ].map((status, idx) => (
                                        <div key={idx} style={{ 
                                            background: 'rgba(255,255,255,0.05)', 
                                            padding: '12px', 
                                            borderRadius: '10px', 
                                            border: `1px solid ${status.color}33`,
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{status.icon}</div>
                                            <div style={{ fontSize: '18px', fontWeight: '700', color: status.color, marginBottom: '2px' }}>
                                                {status.count}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                                                {status.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {taskCounts.failed > 0 && (
                                    <div style={{ 
                                        marginTop: '12px', 
                                        padding: '10px', 
                                        background: 'rgba(239,68,68,0.1)', 
                                        border: '1px solid rgba(239,68,68,0.3)', 
                                        borderRadius: '8px',
                                        color: '#f87171',
                                        fontSize: '12px',
                                        textAlign: 'center'
                                    }}>
                                        ⚠️ {taskCounts.failed} task{taskCounts.failed > 1 ? 's' : ''} failed due to extension inactivity. Consider rescheduling.
                                    </div>
                                )}
                            </div>

                            {/* Calendar View */}
                            {writerScheduledPosts.length > 0 && (
                                <div style={{ 
                                    background: 'rgba(255,255,255,0.05)', 
                                    padding: '20px', 
                                    borderRadius: '16px', 
                                    border: '1px solid rgba(255,255,255,0.1)' 
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>📅</span> Scheduled Posts Calendar
                                        </h3>
                                        <button
                                            onClick={loadScheduledPosts}
                                            style={{ 
                                                background: 'rgba(255,255,255,0.1)', 
                                                border: '1px solid rgba(255,255,255,0.2)', 
                                                borderRadius: '6px', 
                                                padding: '6px 12px', 
                                                color: 'rgba(255,255,255,0.8)', 
                                                fontSize: '12px', 
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            🔄 Refresh
                                        </button>
                                    </div>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {writerScheduledPosts
                                            .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
                                            .map((post: any, idx: number) => {
                                                const scheduledDate = new Date(post.scheduledFor);
                                                const statusColor: { [key: string]: string } = {
                                                    pending: '#f59e0b',
                                                    in_progress: '#3b82f6',
                                                    completed: '#10b981',
                                                    failed: '#ef4444'
                                                };
                                                const color = statusColor[post.taskStatus || 'pending'] || '#f59e0b';
                                                
                                                return (
                                                    <div key={idx} style={{ 
                                                        background: 'rgba(255,255,255,0.05)', 
                                                        padding: '14px', 
                                                        borderRadius: '10px', 
                                                        border: `1px solid ${color}33`,
                                                        borderLeft: `4px solid ${color}`
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                                    <span style={{ 
                                                                        background: color, 
                                                                        color: 'white', 
                                                                        padding: '2px 8px', 
                                                                        borderRadius: '12px', 
                                                                        fontSize: '10px', 
                                                                        fontWeight: '600',
                                                                        textTransform: 'uppercase'
                                                                    }}>
                                                                        {post.taskStatus || 'pending'}
                                                                    </span>
                                                                    {post.taskId && post.taskStatus === 'pending' && (
                                                                        <span style={{ 
                                                                            background: '#8b5cf6', 
                                                                            color: 'white', 
                                                                            padding: '2px 6px', 
                                                                            borderRadius: '8px', 
                                                                            fontSize: '9px', 
                                                                            fontWeight: '600'
                                                                        }}>
                                                                            📤 Sent
                                                                        </span>
                                                                    )}
                                                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                                                                        {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                    </span>
                                                                </div>
                                                                {post.topic && (
                                                                    <div style={{ color: '#a78bfa', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                                                                        📝 {post.topic}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                                {post.taskStatus === 'failed' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            // Reschedule failed post
                                                                            const newDate = new Date();
                                                                            newDate.setDate(newDate.getDate() + 1);
                                                                            setWriterScheduleDate(newDate.toISOString().split('T')[0]);
                                                                            setWriterScheduleTime('12:00');
                                                                            setWriterContent(post.content);
                                                                            setWriterTopic(post.topic || '');
                                                                            setWriterTemplate(post.template || '');
                                                                            setWriterTone(post.tone || '');
                                                                        }}
                                                                        style={{ 
                                                                            background: 'rgba(239,68,68,0.2)', 
                                                                            border: '1px solid rgba(239,68,68,0.3)', 
                                                                            borderRadius: '4px', 
                                                                            padding: '4px 8px', 
                                                                            color: '#ef4444', 
                                                                            fontSize: '10px', 
                                                                            cursor: 'pointer' 
                                                                        }}
                                                                        title="Reschedule this post"
                                                                    >
                                                                        🔄 Reschedule
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm('Delete this scheduled post?')) {
                                                                            // Delete the post
                                                                            fetch('/api/post-drafts', {
                                                                                method: 'DELETE',
                                                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
                                                                                body: JSON.stringify({ id: post.id })
                                                                            }).then(() => loadScheduledPosts());
                                                                        }
                                                                    }}
                                                                    style={{ 
                                                                        background: 'rgba(239,68,68,0.1)', 
                                                                        border: '1px solid rgba(239,68,68,0.2)', 
                                                                        borderRadius: '4px', 
                                                                        padding: '4px 8px', 
                                                                        color: '#ef4444', 
                                                                        fontSize: '10px', 
                                                                        cursor: 'pointer' 
                                                                    }}
                                                                    title="Delete this post"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div style={{ 
                                                            color: 'rgba(255,255,255,0.8)', 
                                                            fontSize: '12px', 
                                                            lineHeight: '1.4',
                                                            maxHeight: '60px',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {post.content}
                                                        </div>
                                                        {post.taskFailureReason && (
                                                            <div style={{ 
                                                                marginTop: '8px', 
                                                                padding: '6px', 
                                                                background: 'rgba(239,68,68,0.1)', 
                                                                borderRadius: '4px', 
                                                                color: '#f87171', 
                                                                fontSize: '11px' 
                                                            }}>
                                                                ❌ {post.taskFailureReason}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ marginTop: '24px', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No Scheduled Posts</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '20px' }}>
                                Schedule posts using the date and time inputs above. Your posts will appear here with their current status.
                            </p>
                            <button
                                onClick={loadScheduledPosts}
                                style={{ 
                                    background: 'rgba(255,255,255,0.1)', 
                                    border: '1px solid rgba(255,255,255,0.2)', 
                                    borderRadius: '6px', 
                                    padding: '8px 16px', 
                                    color: 'rgba(255,255,255,0.8)', 
                                    fontSize: '12px', 
                                    cursor: 'pointer'
                                }}
                            >
                                🔄 Refresh
                            </button>
                        </div>
                    )}
                    </>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                    <div>
                        {/* Comment Settings Section */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
                            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>⚙️</span> Comment Settings
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '20px' }}>
                                These settings control how AI generates comments - both from the manual AI button on LinkedIn posts and auto-commenting.
                            </p>
                            {csSettingsLoading ? (
                                <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.5)' }}>Loading settings...</div>
                            ) : (
                                <>
                                {/* Use Profile Style Toggle */}
                                <div style={{ background: csUseProfileStyle ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)', padding: '16px 20px', borderRadius: '14px', border: `1px solid ${csUseProfileStyle ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}`, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onClick={() => { const newVal = !csUseProfileStyle; setCsUseProfileStyle(newVal); setTimeout(() => { const token = localStorage.getItem('authToken'); if (!token) return; fetch('/api/comment-settings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ useProfileStyle: newVal, goal: csGoal, tone: csTone, commentLength: csLength, commentStyle: csStyle, userExpertise: csExpertise, userBackground: csBackground, aiAutoPost: csAutoPost }) }).then(r => r.json()).then(d => { if (d.success) showToast('Settings auto-saved!', 'success'); }); }, 100); }}>
                                    <div style={{ width: '48px', height: '26px', borderRadius: '13px', background: csUseProfileStyle ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.15)', position: 'relative', transition: 'all 0.3s', flexShrink: 0 }}>
                                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: csUseProfileStyle ? '24px' : '2px', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '2px' }}>
                                            🎨 Use Selected Profiles&apos; Comment Style
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                                            {csUseProfileStyle 
                                                ? 'AI will learn ONLY from your selected profiles\' scraped comments (up to 20). Goal, Tone, Length, and Style settings below are disabled.'
                                                : 'Turn ON to let AI mimic the commenting style of your selected profiles instead of using manual settings below.'}
                                        </div>
                                    </div>
                                </div>
                                {csUseProfileStyle && (
                                    <div style={{ background: 'rgba(59,130,246,0.08)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '20px' }}>
                                        <p style={{ color: '#60a5fa', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                                            <strong>Profile Style Mode Active:</strong> AI will analyze up to 20 comments from your selected profiles below and generate comments that match their exact tone, structure, and personality. The Goal, Tone, Length, and Style settings are ignored in this mode.
                                        </p>
                                    </div>
                                )}
                                <div style={{ opacity: csUseProfileStyle ? 0.4 : 1, pointerEvents: csUseProfileStyle ? 'none' : 'auto', transition: 'opacity 0.3s' }}>

                                    {/* Comment Goal */}
                                    <div style={{ marginBottom: '18px' }}>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comment Goal <span style={{ color: 'rgba(255,255,255,0.35)', textTransform: 'none', letterSpacing: 0, fontWeight: '400' }}>— what you want to achieve</span></label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                                            {[{v:'AddValue',l:'Add Value',d:'Pure contribution, helpful insight',e:'💡'},{v:'ShareExperience',l:'Share Experience',d:'Personal story adds perspective',e:'💭'},{v:'AskQuestion',l:'Ask Question',d:'Deepen discussion with curiosity',e:'❓'},{v:'DifferentPerspective',l:'Different Perspective',d:'Respectfully challenge',e:'🔄'},{v:'BuildRelationship',l:'Build Relationship',d:'Warm, supportive engagement',e:'🤝'},{v:'SubtlePitch',l:'Subtle Pitch',d:'Strategic positioning with soft CTA',e:'🎯'}].map(o => (
                                                <button key={o.v} onClick={() => setCsGoal(o.v)} style={{ padding:'8px 14px', background: csGoal===o.v ? 'linear-gradient(135deg,rgba(105,63,233,0.4),rgba(139,92,246,0.3))' : 'rgba(255,255,255,0.05)', border: csGoal===o.v ? '1px solid rgba(105,63,233,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color: csGoal===o.v ? 'white' : 'rgba(255,255,255,0.6)', fontSize:'12px', fontWeight: csGoal===o.v ? '700' : '500', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', transition:'all 0.2s' }}>
                                                    <span>{o.e}</span><span>{o.l}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tone of Voice */}
                                    <div style={{ marginBottom: '18px' }}>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tone of Voice <span style={{ color: 'rgba(255,255,255,0.35)', textTransform: 'none', letterSpacing: 0, fontWeight: '400' }}>— AI comment personality</span></label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                                            {[{v:'Professional',l:'Professional',e:'💼'},{v:'Friendly',l:'Friendly',e:'😊'},{v:'ThoughtProvoking',l:'Thought Provoking',e:'🤔'},{v:'Supportive',l:'Supportive',e:'🌟'},{v:'Contrarian',l:'Contrarian',e:'⚡'},{v:'Humorous',l:'Humorous',e:'😄'}].map(o => (
                                                <button key={o.v} onClick={() => setCsTone(o.v)} style={{ padding:'8px 14px', background: csTone===o.v ? 'linear-gradient(135deg,rgba(59,130,246,0.4),rgba(37,99,235,0.3))' : 'rgba(255,255,255,0.05)', border: csTone===o.v ? '1px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color: csTone===o.v ? 'white' : 'rgba(255,255,255,0.6)', fontSize:'12px', fontWeight: csTone===o.v ? '700' : '500', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', transition:'all 0.2s' }}>
                                                    <span>{o.e}</span><span>{o.l}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Comment Length */}
                                    <div style={{ marginBottom: '18px' }}>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comment Length</label>
                                        <div style={{ display: 'flex', gap: '7px' }}>
                                            {[{v:'Brief',l:'Brief',d:'≤100 chars'},{v:'Short',l:'Short',d:'≤300 chars'},{v:'Mid',l:'Medium',d:'≤600 chars'},{v:'Long',l:'Long',d:'≤900 chars'}].map(o => (
                                                <button key={o.v} onClick={() => setCsLength(o.v)} style={{ flex:1, padding:'10px 8px', background: csLength===o.v ? 'linear-gradient(135deg,rgba(16,185,129,0.3),rgba(5,150,105,0.2))' : 'rgba(255,255,255,0.05)', border: csLength===o.v ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color: csLength===o.v ? '#34d399' : 'rgba(255,255,255,0.6)', fontSize:'12px', fontWeight: csLength===o.v ? '700' : '500', cursor:'pointer', textAlign:'center', transition:'all 0.2s' }}>
                                                    <div>{o.l}</div><div style={{ fontSize:'10px', opacity:0.7, marginTop:'2px' }}>{o.d}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Comment Style */}
                                    <div style={{ marginBottom: '18px' }}>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comment Style <span style={{ color: 'rgba(255,255,255,0.35)', textTransform: 'none', letterSpacing: 0, fontWeight: '400' }}>— structure of your comments</span></label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '7px' }}>
                                            {[{v:'direct',l:'Direct & Concise',d:'Single paragraph',e:'📝'},{v:'structured',l:'Structured',d:'2-3 short paragraphs',e:'📑'},{v:'storyteller',l:'Storyteller',d:'Personal anecdote lead',e:'📖'},{v:'challenger',l:'Challenger',d:'Different perspective',e:'⚡'},{v:'supporter',l:'Supporter',d:'Validate with evidence',e:'🤜'},{v:'expert',l:'Expert',d:'Data/experience refs',e:'🎓'},{v:'conversational',l:'Conversational',d:'Casual, colleague-like',e:'💬'}].map(o => (
                                                <button key={o.v} onClick={() => setCsStyle(o.v)} style={{ padding:'10px 12px', background: csStyle===o.v ? 'linear-gradient(135deg,rgba(245,158,11,0.3),rgba(217,119,6,0.2))' : 'rgba(255,255,255,0.05)', border: csStyle===o.v ? '1px solid rgba(245,158,11,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color: csStyle===o.v ? '#fbbf24' : 'rgba(255,255,255,0.6)', fontSize:'12px', fontWeight: csStyle===o.v ? '700' : '500', cursor:'pointer', textAlign:'left', transition:'all 0.2s' }}>
                                                    <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'2px' }}><span>{o.e}</span><span>{o.l}</span></div>
                                                    <div style={{ fontSize:'10px', opacity:0.65 }}>{o.d}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* AI Model */}
                                    <div>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Model</label>
                                        <select value={csModel} onChange={e => setCsModel(e.target.value)}
                                            style={{ width: '100%', maxWidth: '400px', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none' }}>
                                            {MODEL_OPTIONS.map(m => (
                                                <option key={m.id} value={m.id} style={{ background: '#1a1a3e' }}>{m.name} ({m.inputCost} in / {m.outputCost} out)</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/* Expertise, Background, AI Behavior - always enabled */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
                                    {/* Expertise */}
                                    <div>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Your Expertise/Niche</label>
                                        <input value={csExpertise} onChange={e => setCsExpertise(e.target.value)}
                                            placeholder="e.g., SaaS Marketing, AI Development, Leadership Coach"
                                            style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }} />
                                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '4px' }}>Your role, industry, or what you&apos;re known for</p>
                                    </div>
                                    {/* Background */}
                                    <div>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Your Background (Optional)</label>
                                        <input value={csBackground} onChange={e => setCsBackground(e.target.value)}
                                            placeholder="e.g., Scaled 3 startups, 15 years in B2B sales"
                                            style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }} />
                                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '4px' }}>Experience, credentials, or results that add authority</p>
                                    </div>
                                    {/* AI Button Behavior */}
                                    <div>
                                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>AI Button Behavior</label>
                                        <select value={csAutoPost} onChange={e => setCsAutoPost(e.target.value)}
                                            style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }}>
                                            <option value="manual" style={{ background: '#1a1a3e' }}>Manual Review - Generate, paste, wait for me to post</option>
                                            <option value="auto" style={{ background: '#1a1a3e' }}>Auto Post - Generate and submit automatically</option>
                                        </select>
                                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '4px' }}>Controls what happens when you click AI button on posts</p>
                                    </div>
                                </div>
                                </>
                            )}
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={saveCommentSettings} disabled={csSettingsSaving}
                                    style={{ padding: '12px 28px', background: csSettingsSaving ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: csSettingsSaving ? 'wait' : 'pointer', boxShadow: '0 4px 15px rgba(105,63,233,0.4)', opacity: csSettingsSaving ? 0.7 : 1, transition: 'all 0.2s' }}>
                                    {csSettingsSaving ? '⏳ Saving...' : '💾 Save Settings'}
                                </button>
                            </div>
                        </div>

                        {/* Comment Style Sources Section */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>🎨</span> Comment Style Sources
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
                            {/* Kommentify Shared Comment Profiles */}
                            {sharedCommentProfiles.length > 0 && (
                                <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(245,158,11,0.08)', borderRadius: '14px', border: '1px solid rgba(245,158,11,0.2)' }}>
                                    <h4 style={{ color: '#fbbf24', fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>⭐ Kommentify Shared Profiles</h4>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '10px' }}>Pre-scraped comment profiles shared by Kommentify. Select to use for AI comment style.</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {sharedCommentProfiles.map((p: any, i: number) => {
                                            const profileMatch = commentStyleProfiles.find((cp: any) => cp.profileId === p.profileId || cp.profileName === (p.profileName || p.profileId));
                                            const isSelected = profileMatch?.isSelected || false;
                                            return (
                                            <div key={i} onClick={() => { if (profileMatch) toggleProfileSelect(profileMatch.id); }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isSelected ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)', padding: '8px 14px', borderRadius: '10px', border: isSelected ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                                <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: '#f59e0b', width: '15px', height: '15px', cursor: 'pointer' }} />
                                                <span style={{ fontSize: '12px' }}>💬</span>
                                                <span style={{ color: isSelected ? '#fbbf24' : 'white', fontSize: '13px', fontWeight: '600' }}>{p.profileName || p.profileId}</span>
                                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{p.commentCount} comments</span>
                                            </div>
                                            );
                                        })}
                                    </div>
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
                    </div>
                )}

                {/* Trending Posts Tab */}
                {activeTab === 'trending-posts' && (
                    <div>
                        {/* Instant Feed Scrape Task */}
                        <div style={{ background: 'rgba(16,185,129,0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                <h3 style={{ color: '#34d399', fontSize: '15px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>{miniIcon('M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z', '#34d399', 16)} Scrape Feed Now</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div style={{ flex: '0 0 auto' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>{miniIcon('M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', 'rgba(255,255,255,0.6)', 12)} Duration</label>
                                    <select value={scheduleDuration} onChange={e => setScheduleDuration(parseInt(e.target.value))} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px' }}>
                                        <option value="1">1 min</option><option value="2">2 min</option><option value="3">3 min</option><option value="5">5 min</option><option value="10">10 min</option><option value="15">15 min</option>
                                    </select>
                                </div>
                                <div style={{ flex: '0 0 auto' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>{miniIcon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', 'rgba(255,255,255,0.6)', 12)} Min Likes</label>
                                    <input type="number" value={scheduleMinLikes} onChange={e => setScheduleMinLikes(parseInt(e.target.value) || 0)} min={0} style={{ width: '70px', padding: '8px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }} />
                                </div>
                                <div style={{ flex: '0 0 auto' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>{miniIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', 'rgba(255,255,255,0.6)', 12)} Min Comments</label>
                                    <input type="number" value={scheduleMinComments} onChange={e => setScheduleMinComments(parseInt(e.target.value) || 0)} min={0} style={{ width: '70px', padding: '8px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>{miniIcon('M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4', 'rgba(255,255,255,0.6)', 12)} Keywords</label>
                                    <input type="text" value={scheduleKeywords} onChange={e => setScheduleKeywords(e.target.value)} placeholder="AI, startup, SaaS..." style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }} />
                                </div>
                                <button onClick={async () => {
                                    try {
                                        const token = localStorage.getItem('authToken');
                                        if (!token) { setTrendingStatus('Not authenticated'); return; }
                                        setTrendingStatus('Sending scrape task to extension...');
                                        await saveFeedSchedule();
                                        const res = await fetch('/api/extension/command', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                            body: JSON.stringify({ command: 'scrape_feed_now', data: { durationMinutes: scheduleDuration, minLikes: scheduleMinLikes, minComments: scheduleMinComments, keywords: scheduleKeywords } }),
                                        });
                                        const data = await res.json();
                                        if (data.success) setTrendingStatus('✅ Scrape task sent! Extension will open LinkedIn and start scraping.');
                                        else setTrendingStatus(data.error || 'Failed to send task');
                                    } catch (e: any) { setTrendingStatus('Error: ' + e.message); }
                                }} style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(16,185,129,0.3)' , display: 'flex', alignItems: 'center', gap: '4px' }}>{miniIcon('M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z', 'white', 13)} Start Now</button>
                            </div>
                            {/* Schedule Times (moved from Feed Schedule tab) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>{miniIcon('M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', 'rgba(255,255,255,0.6)', 12)} Daily Schedule:</span>
                                {scheduleTimesInput.map((time, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(105,63,233,0.2)', border: '1px solid rgba(105,63,233,0.4)', borderRadius: '8px', padding: '4px 8px' }}>
                                        <input type="time" value={time} onChange={e => { const arr = [...scheduleTimesInput]; arr[i] = e.target.value; setScheduleTimesInput(arr); }}
                                            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '12px', outline: 'none', width: '70px' }} />
                                        <button onClick={() => setScheduleTimesInput(scheduleTimesInput.filter((_, idx) => idx !== i))}
                                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px', padding: '0 2px', lineHeight: 1 }}>×</button>
                                    </div>
                                ))}
                                <button onClick={() => {
                                    const now = new Date(); now.setMinutes(now.getMinutes() + 2);
                                    setScheduleTimesInput([...scheduleTimesInput, `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`]);
                                }}
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px dashed rgba(255,255,255,0.3)', borderRadius: '8px', padding: '4px 10px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '12px' }}>
                                    + Add Time
                                </button>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', cursor: 'pointer' }}>
                                    <span style={{ color: scheduleActive ? '#10b981' : 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600' }}>
                                        {scheduleActive ? 'Active' : 'Off'}
                                    </span>
                                    <div onClick={() => setScheduleActive(!scheduleActive)} style={{ width: '36px', height: '20px', background: scheduleActive ? '#10b981' : 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '2px', cursor: 'pointer', transition: 'background 0.2s' }}>
                                        <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '8px', transition: 'transform 0.2s', transform: scheduleActive ? 'translateX(16px)' : 'translateX(0)' }} />
                                    </div>
                                </label>
                                <button onClick={saveFeedSchedule} style={{ padding: '4px 12px', background: 'rgba(105,63,233,0.3)', border: '1px solid rgba(105,63,233,0.4)', borderRadius: '8px', color: '#a78bfa', cursor: 'pointer', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>{miniIcon('M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8', '#a78bfa', 10)} Save</button>
                            </div>
                        </div>
                        {/* Kommentify Trending Posts (Admin-shared) */}
                        {sharedPosts.length > 0 && (
                            <div style={{ background: 'rgba(105,63,233,0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(105,63,233,0.2)', marginBottom: '20px' }}>
                                <h3 style={{ color: '#a78bfa', fontSize: '15px', fontWeight: '700', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>{miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#a78bfa', 14)} Kommentify Trending Posts</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '0 0 12px 0' }}>Curated posts shared by Kommentify for inspiration</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                                    {sharedPosts.slice(0, 10).map((p: any, i: number) => (
                                        <div key={p.id || i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <input type="checkbox" checked={trendingSelectedPosts.includes(p.id)} onChange={() => { setTrendingSelectedPosts(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]); }}
                                                style={{ accentColor: '#693fe9', width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px' }}>{p.authorName || 'Unknown'} · {p.likes} likes · {p.comments} comments</div>
                                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{p.postContent?.substring(0, 200)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {sharedPostsLoading && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px' }}>Loading Kommentify posts...</div>}

                        {/* Period Filters */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            {[{ id: 'today', label: 'Today' }, { id: 'week', label: 'This Week' }, { id: 'month', label: 'This Month' }, { id: 'all', label: 'All Time' }].map(p => (
                                <button key={p.id} onClick={() => { setTrendingPeriod(p.id); loadSavedPosts(1, p.id); }}
                                    style={{ padding: '10px 20px', background: trendingPeriod === p.id ? 'linear-gradient(135deg, #693fe9, #8b5cf6)' : 'rgba(255,255,255,0.08)', border: trendingPeriod === p.id ? 'none' : '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', fontWeight: trendingPeriod === p.id ? '700' : '500', cursor: 'pointer', fontSize: '14px' }}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        {/* Controls Row */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '0 0 10px 0' }}>Search and filter your scraped trending posts by keyword, then sort by engagement metrics.</p>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <input type="text" value={savedPostsSearch} onChange={e => setSavedPostsSearch(e.target.value)} placeholder="Search by keyword in post content..."
                                    onKeyDown={e => e.key === 'Enter' && loadSavedPosts(1)}
                                    style={{ flex: 1, minWidth: '200px', padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(105,63,233,0.3)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' }} />
                                <select value={savedPostsSortBy} onChange={e => { setSavedPostsSortBy(e.target.value); }}
                                    style={{ padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', fontSize: '13px' }}>
                                    <option value="comments">Sort: Comments</option>
                                    <option value="likes">Sort: Likes</option>
                                    <option value="shares">Sort: Shares</option>
                                    <option value="scrapedAt">Sort: Date Saved</option>
                                </select>
                                <button onClick={() => loadSavedPosts(1)}
                                    style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                                    {miniIcon('M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35', 'white', 13)} Search
                                </button>
                            </div>
                        </div>
                        {/* AI Actions Panel */}
                        <div style={{ background: 'rgba(105,63,233,0.06)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(105,63,233,0.2)', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
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
                                        {trendingGenerating ? 'Generating...' : 'AI Generate Posts'}
                                    </button>
                                    <button onClick={analyzePosts} disabled={analysisLoading || trendingGeneratedPosts.length === 0}
                                        style={{ padding: '8px 18px', background: analysisLoading ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: analysisLoading ? 'wait' : 'pointer', fontSize: '13px' }}>
                                        {analysisLoading ? 'Analyzing...' : 'Analyze Posts'}
                                    </button>
                                </div>
                            </div>
                            {/* Custom AI Instruction - Redesigned as textarea */}
                            <div style={{ marginTop: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a78bfa', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                                    {miniIcon('M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z', '#a78bfa', 14)} 
                                    Custom AI Instructions
                                </label>
                                <textarea 
                                    value={trendingCustomPrompt} 
                                    onChange={e => setTrendingCustomPrompt(e.target.value)}
                                    placeholder="Write specific instructions for the AI here...&#10;&#10;Examples:&#10;• Focus on SaaS and B2B topics&#10;• Write for tech founders and startup CEOs&#10;• Keep posts under 200 words&#10;• Use more storytelling and personal anecdotes&#10;• Include specific numbers and data points"
                                    rows={4}
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px 16px', 
                                        background: 'rgba(105,63,233,0.08)', 
                                        border: '2px solid rgba(105,63,233,0.25)', 
                                        borderRadius: '12px', 
                                        color: 'white', 
                                        fontSize: '14px', 
                                        outline: 'none',
                                        resize: 'vertical',
                                        minHeight: '100px',
                                        lineHeight: '1.5',
                                        fontFamily: 'inherit'
                                    }} 
                                />
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '8px 0 0 0', lineHeight: '1.4' }}>
                                    💡 Tip: Be specific about tone, topics, audience, and style preferences. The AI will analyze the voice patterns from selected posts and apply your instructions.
                                </p>
                            </div>
                            
                            {/* Model Selection & Options Row */}
                            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                {/* AI Model Selection */}
                                <div style={{ flex: '1', minWidth: '200px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', marginBottom: '6px' }}>
                                        {miniIcon('M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', 'rgba(255,255,255,0.6)', 12)}
                                        AI Model
                                    </label>
                                    <select 
                                        value={trendingModel} 
                                        onChange={e => setTrendingModel(e.target.value)}
                                        style={{ 
                                            width: '100%',
                                            padding: '10px 14px', 
                                            background: 'rgba(255,255,255,0.08)', 
                                            border: '1px solid rgba(255,255,255,0.15)', 
                                            borderRadius: '10px', 
                                            color: 'white', 
                                            fontSize: '13px' 
                                        }}
                                    >
                                        {MODEL_OPTIONS.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Language Selection */}
                                <div style={{ minWidth: '150px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', marginBottom: '6px' }}>
                                        {miniIcon('M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129', 'rgba(255,255,255,0.6)', 12)}
                                        Language
                                    </label>
                                    <select value={trendingLanguage} onChange={e => setTrendingLanguage(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px' }}>
                                        <option value="">Auto-detect</option>
                                        <option value="English">English</option>
                                        <option value="Spanish">Spanish</option>
                                        <option value="French">French</option>
                                        <option value="German">German</option>
                                        <option value="Portuguese">Portuguese</option>
                                        <option value="Italian">Italian</option>
                                        <option value="Dutch">Dutch</option>
                                        <option value="Russian">Russian</option>
                                        <option value="Chinese">Chinese</option>
                                        <option value="Japanese">Japanese</option>
                                        <option value="Korean">Korean</option>
                                        <option value="Arabic">Arabic</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Urdu">Urdu</option>
                                        <option value="Turkish">Turkish</option>
                                        <option value="Polish">Polish</option>
                                        <option value="Swedish">Swedish</option>
                                        <option value="Indonesian">Indonesian</option>
                                        <option value="Thai">Thai</option>
                                        <option value="Vietnamese">Vietnamese</option>
                                    </select>
                                </div>
                                
                                {/* Hashtags Toggle */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', cursor: 'pointer', padding: '10px 0' }}>
                                    <input type="checkbox" checked={trendingIncludeHashtags} onChange={e => setTrendingIncludeHashtags(e.target.checked)} style={{ accentColor: '#693fe9', width: '16px', height: '16px' }} />
                                    #️⃣ Hashtags
                                </label>
                            </div>
                        </div>
                        {/* Status */}
                        {trendingStatus && (
                            <div style={{ marginBottom: '16px', padding: '10px 16px', background: trendingStatus.includes('Error') || trendingStatus.includes('fail') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${trendingStatus.includes('Error') || trendingStatus.includes('fail') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '10px', color: trendingStatus.includes('Error') || trendingStatus.includes('fail') ? '#f87171' : '#34d399', fontSize: '13px' }}>
                                {trendingStatus}
                            </div>
                        )}
                        {/* Token Usage Display - Developer Only */}
                        {isDeveloper && trendingTokenUsage && (
                            <div style={{ marginBottom: '16px', padding: '14px 18px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    {miniIcon('M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', '#60a5fa', 16)}
                                    <span style={{ color: '#60a5fa', fontSize: '13px', fontWeight: '700' }}>🔧 Developer Token Usage</span>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Model</span>
                                        <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{trendingTokenUsage.modelName}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Input Tokens</span>
                                        <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '600' }}>{trendingTokenUsage.inputTokens?.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Output Tokens</span>
                                        <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '600' }}>{trendingTokenUsage.outputTokens?.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Input Cost</span>
                                        <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '600' }}>{trendingTokenUsage.inputCost}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Output Cost</span>
                                        <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '600' }}>{trendingTokenUsage.outputCost}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Total Cost</span>
                                        <div style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '700' }}>{trendingTokenUsage.totalCost}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Analysis Results Table - shown on TOP */}
                        {showAnalysis && analysisResults.length > 0 && (
                            <div style={{ marginBottom: '24px', background: 'rgba(245,158,11,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.3)' }}>
                                <h4 style={{ color: '#fbbf24', fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>{miniIcon('M18 20V10 M12 20V4 M6 20v-6', '#fbbf24', 16)} Viral Potential Analysis</h4>
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
                                <h4 style={{ color: '#a78bfa', fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>{miniIcon('M12 8V4l8 8-8 8v-4H4V8h8z', '#a78bfa', 16)} AI Generated Posts ({trendingGeneratedPosts.length})</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {trendingGeneratedPosts.map((gp: any, i: number) => (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(105,63,233,0.2)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>{miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#a78bfa', 13)} {gp.title || `Post ${i + 1}`}</span>
                                                <button onClick={() => postGeneratedToLinkedIn(gp.content, generatedPostImages[i], i)}
                                                    disabled={postingToLinkedIn[i]}
                                                    style={{ padding: '6px 16px', background: postingToLinkedIn[i] ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: postingToLinkedIn[i] ? 'wait' : 'pointer', fontSize: '12px', opacity: postingToLinkedIn[i] ? 0.7 : 1, transition: 'all 0.2s', transform: postingToLinkedIn[i] ? 'scale(0.95)' : 'scale(1)' }}>
                                                    {postingToLinkedIn[i] ? 'Sending...' : 'Post to LinkedIn'}
                                                </button>
                                            </div>
                                            <textarea value={gp.content} onChange={(e) => {
                                                const updated = [...trendingGeneratedPosts];
                                                updated[i] = { ...updated[i], content: e.target.value };
                                                setTrendingGeneratedPosts(updated);
                                            }}
                                                style={{ width: '100%', minHeight: '260px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 12px 0', whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(105,63,233,0.2)', borderRadius: '10px', padding: '14px', outline: 'none', resize: 'vertical', fontFamily: 'system-ui, sans-serif' }} />
                                            {/* Image attachment */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '12px' }}>
                                                    {miniIcon('M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z', 'rgba(255,255,255,0.7)', 13)} {generatedPostImages[i] ? 'Change Image' : 'Attach Image'}
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
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{miniIcon('M13 2L3 14h9l-1 8 10-12h-9l1-8z', 'rgba(255,255,255,0.3)', 48)}</div>
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
                                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                {miniIcon('M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', '#f87171', 12)}
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
                                            <span style={{ color: '#ec4899', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>{miniIcon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', '#ec4899', 13)} {post.likes}</span>
                                            <span style={{ color: '#8b5cf6', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>{miniIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', '#8b5cf6', 13)} {post.comments}</span>
                                            <span style={{ color: '#06b6d4', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>{miniIcon('M23 4v6h-6 M1 20v-6h6 M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15', '#06b6d4', 13)} {post.shares}</span>
                                            {post.postUrl && (
                                                <a href={post.postUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                                    style={{ color: '#693fe9', fontSize: '13px', fontWeight: '600', textDecoration: 'none', marginLeft: 'auto' }}>
                                                    {miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', '#693fe9', 13)} View
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
                                <button onClick={() => loadTasks()}
                                    style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.15s ease', transform: 'scale(1)' }}
                                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.93)')}
                                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                                    🔄 Refresh
                                </button>
                                <button onClick={stopAllTasks}
                                    style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 15px rgba(239,68,68,0.4)', transition: 'all 0.15s ease', transform: 'scale(1)' }}
                                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.93)')}
                                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
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
                        {/* Queue Info Banner */}
                        {tasks.filter(t => t.status === 'pending').length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.25)', marginBottom: '16px' }}>
                                <span>⏱️</span>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                    <strong style={{ color: '#fbbf24' }}>{tasks.filter(t => t.status === 'pending').length} task(s) queued</strong> — only one task runs at a time. Each pending task waits for the current one to finish before starting.
                                </span>
                            </div>
                        )}
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
                                {tasks.map((task: any, taskIdx: number) => {
                                    const statusConfig: Record<string, { icon: string; color: string; bg: string }> = {
                                        pending: { icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
                                        in_progress: { icon: '🔄', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
                                        completed: { icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                                        completed_manual: { icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                                        failed: { icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
                                        cancelled: { icon: '🛑', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
                                    };
                                    const sc = statusConfig[task.status] || statusConfig.pending;
                                    const cmdLabel = task.command === 'post_to_linkedin' ? '🚀 Post to LinkedIn' :
                                        task.command === 'scrape_feed_now' ? '🔍 Scrape Feed' :
                                        task.command === 'scrape_profile' ? '👤 Scrape Profile' :
                                        task.command === 'bulk_comment' ? '💬 Bulk Comment' :
                                        task.command === 'networking' ? '🤝 Networking' :
                                        task.command === 'import_profiles' ? '📥 Import Profiles' : task.command;
                                    // Calculate pending countdown
                                    let pendingCountdown = '';
                                    if (task.status === 'pending' && task.createdAt) {
                                        const startDelaySec = autoSettings?.automationStartDelay ?? 30;
                                        const created = new Date(task.createdAt).getTime();
                                        const executeAt = created + (startDelaySec * 1000);
                                        const remaining = Math.max(0, Math.round((executeAt - Date.now()) / 1000));
                                        pendingCountdown = remaining > 0 ? `Starts in ${remaining}s` : 'Starting soon...';
                                    }
                                    return (
                                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: task.status === 'pending' ? 'rgba(245,158,11,0.07)' : 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: '14px', border: task.status === 'pending' ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.08)' }}>
                                            {task.status === 'in_progress' ? (
                                                <span style={{ fontSize: '20px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>{sc.icon}</span>
                                            ) : (
                                                <span style={{ fontSize: '20px' }}>{sc.icon}</span>
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: 'white', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {cmdLabel}
                                                    {taskIdx === 0 && task.status === 'pending' && <span style={{ fontSize: '10px', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>NEXT</span>}
                                                </div>
                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>
                                                    {task.createdAt ? new Date(task.createdAt).toLocaleString() : ''}
                                                    {task.data?.content && <span> · {task.data.content.substring(0, 50)}…</span>}
                                                    {task.data?.profileUrl && <span> · {task.data.profileUrl}</span>}
                                                </div>
                                                {task.status === 'pending' && pendingCountdown && (
                                                    <div style={{ color: '#fbbf24', fontSize: '11px', marginTop: '3px', fontWeight: '600' }}>⏱ {pendingCountdown}</div>
                                                )}
                                            </div>
                                            <span style={{ padding: '4px 12px', background: sc.bg, color: sc.color, borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: `1px solid ${sc.color}33`, whiteSpace: 'nowrap' }}>
                                                {task.status.replace('_', ' ')}
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
                                <button key={f.id} onClick={() => { setHistoryFilter(f.id); loadHistory(1, f.id); }}
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


                {/* Limits & Delays Tab */}
                {activeTab === 'limits' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {autoSettingsLoading ? <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading settings...</div> : autoSettings && (<>

                        {/* Row 1: Preset + Global Base Delay + Random Toggle */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Account Preset</label>
                                <select value={autoSettings.accountPreset} onChange={e => setAutoSettings((p: any) => ({ ...p, accountPreset: e.target.value }))}
                                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px' }}>
                                    <option value="your-choice">Custom</option>
                                    <option value="new-conservative">New - Conservative</option>
                                    <option value="new-moderate">New - Moderate</option>
                                    <option value="matured-safe">Matured - Safe</option>
                                    <option value="matured-aggressive">Matured - Aggressive</option>
                                    <option value="premium-user">Premium User</option>
                                    <option value="sales-navigator">Sales Navigator</option>
                                    <option value="speed-mode">Speed Mode</option>
                                </select>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Base Delay (sec) — applied to all</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input type="number" min="0" max="120" value={autoSettings.baseDelay ?? 5} onChange={e => { const v = parseInt(e.target.value) || 0; setAutoSettings((p: any) => ({ ...p, baseDelay: v })); }}
                                        style={{ width: '70px', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '700' }} />
                                    <button onClick={() => { const b = autoSettings.baseDelay ?? 5; setAutoSettings((p: any) => ({ ...p, automationStartDelay: b * 2, networkingStartDelay: b * 2, importStartDelay: b * 2, postWriterPageLoad: b, postWriterClick: Math.max(1, Math.round(b * 0.6)), postWriterTyping: Math.max(1, Math.round(b * 0.8)), postWriterSubmit: Math.max(1, Math.round(b * 0.6)), searchDelayMin: b * 6, searchDelayMax: b * 12, commentDelayMin: b * 8, commentDelayMax: b * 18, networkingDelayMin: b * 4, networkingDelayMax: b * 9, beforeOpeningDelay: b, postPageLoadDelay: Math.max(1, Math.round(b * 0.8)), beforeLikeDelay: Math.max(1, Math.round(b * 0.6)), beforeCommentDelay: Math.max(1, Math.round(b * 0.8)), beforeShareDelay: Math.max(1, Math.round(b * 0.6)), beforeFollowDelay: Math.max(1, Math.round(b * 0.6)) })); showToast('All delays set from base value', 'success'); }}
                                        style={{ padding: '8px 12px', background: 'linear-gradient(135deg,#693fe9,#8b5cf6)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '11px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Apply to All</button>
                                </div>
                            </div>
                        </div>

                        {/* Random Delay Toggle + Range */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: '0 0 auto' }}>
                                <input type="checkbox" checked={autoSettings.randomDelayEnabled !== false} onChange={e => setAutoSettings((p: any) => ({ ...p, randomDelayEnabled: e.target.checked }))} style={{ accentColor: '#693fe9', width: '16px', height: '16px' }} />
                                <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>Random Delay</span>
                            </label>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Add random jitter between</span>
                            <input type="number" min="0" max="300" value={autoSettings.randomIntervalMin} onChange={e => setAutoSettings((p: any) => ({ ...p, randomIntervalMin: parseInt(e.target.value) || 0 }))}
                                style={{ width: '55px', padding: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '13px', textAlign: 'center' }} />
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>–</span>
                            <input type="number" min="0" max="300" value={autoSettings.randomIntervalMax} onChange={e => setAutoSettings((p: any) => ({ ...p, randomIntervalMax: parseInt(e.target.value) || 0 }))}
                                style={{ width: '55px', padding: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '13px', textAlign: 'center' }} />
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>sec</span>
                        </div>

                        {/* Daily Limits — compact row */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0' }}>Daily Limits</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                {[
                                    { key: 'dailyCommentLimit', label: 'Comments', icon: '💬' },
                                    { key: 'dailyLikeLimit', label: 'Likes', icon: '👍' },
                                    { key: 'dailyShareLimit', label: 'Shares', icon: '🔄' },
                                    { key: 'dailyFollowLimit', label: 'Follows', icon: '➕' },
                                ].map(f => (
                                    <div key={f.key} style={{ textAlign: 'center' }}>
                                        <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', display: 'block', marginBottom: '4px' }}>{f.icon} {f.label}</label>
                                        <input type="number" min="0" max="300" value={autoSettings[f.key]} onChange={e => setAutoSettings((p: any) => ({ ...p, [f.key]: parseInt(e.target.value) || 0 }))}
                                            style={{ width: '100%', padding: '7px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px', textAlign: 'center', fontWeight: '600' }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Automation + Networking Intervals — preset range buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h4 style={{ color: 'white', fontSize: '12px', fontWeight: '700', margin: '0 0 10px 0' }}>⚙️ Automation Intervals</h4>
                                <div style={{ marginBottom: '10px' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '5px' }}>Search delay (sec)</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {[[30,60],[60,120],[90,180],[120,240],[180,360]].map(([mn,mx]) => {
                                            const on = autoSettings.searchDelayMin===mn && autoSettings.searchDelayMax===mx;
                                            return <button key={mn} onClick={() => setAutoSettings((p:any)=>({...p,searchDelayMin:mn,searchDelayMax:mx}))} style={{ padding:'4px 9px', background: on?'linear-gradient(135deg,#693fe9,#8b5cf6)':'rgba(255,255,255,0.08)', border: on?'none':'1px solid rgba(255,255,255,0.15)', borderRadius:'6px', color:'white', fontSize:'11px', cursor:'pointer' }}>{mn}–{mx}</button>;
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '5px' }}>Comment delay (sec)</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {[[60,120],[90,180],[120,240],[150,300],[180,360]].map(([mn,mx]) => {
                                            const on = autoSettings.commentDelayMin===mn && autoSettings.commentDelayMax===mx;
                                            return <button key={mn} onClick={() => setAutoSettings((p:any)=>({...p,commentDelayMin:mn,commentDelayMax:mx}))} style={{ padding:'4px 9px', background: on?'linear-gradient(135deg,#693fe9,#8b5cf6)':'rgba(255,255,255,0.08)', border: on?'none':'1px solid rgba(255,255,255,0.15)', borderRadius:'6px', color:'white', fontSize:'11px', cursor:'pointer' }}>{mn}–{mx}</button>;
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h4 style={{ color: 'white', fontSize: '12px', fontWeight: '700', margin: '0 0 10px 0' }}>🤝 Networking Intervals</h4>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '5px' }}>Connect delay (sec)</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {[[30,60],[60,120],[90,180],[120,240],[180,360]].map(([mn,mx]) => {
                                        const on = autoSettings.networkingDelayMin===mn && autoSettings.networkingDelayMax===mx;
                                        return <button key={mn} onClick={() => setAutoSettings((p:any)=>({...p,networkingDelayMin:mn,networkingDelayMax:mx}))} style={{ padding:'4px 9px', background: on?'linear-gradient(135deg,#693fe9,#8b5cf6)':'rgba(255,255,255,0.08)', border: on?'none':'1px solid rgba(255,255,255,0.15)', borderRadius:'6px', color:'white', fontSize:'11px', cursor:'pointer' }}>{mn}–{mx}</button>;
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Post Writer Delays — delay mode toggle */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h4 style={{ color: 'white', fontSize: '12px', fontWeight: '700', margin: 0 }}>✍️ Post Writer Delays</h4>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {[{v:'base',l:'Base Delay'},{v:'random',l:'Random Delay'}].map(o => (
                                        <button key={o.v} onClick={() => setAutoSettings((p:any)=>({...p,postWriterDelayMode:o.v}))}
                                            style={{ padding:'4px 10px', background:(autoSettings.postWriterDelayMode??'base')===o.v?'linear-gradient(135deg,#693fe9,#8b5cf6)':'rgba(255,255,255,0.08)', border:'none', borderRadius:'6px', color:'white', fontSize:'11px', fontWeight:'600', cursor:'pointer' }}>{o.l}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                                {['Page Load','Click Btn','Before Type','Before Submit'].map(lbl => {
                                    const mode = autoSettings.postWriterDelayMode??'base';
                                    const val = mode==='random' ? `${autoSettings.randomIntervalMin??5}–${autoSettings.randomIntervalMax??15}s` : `${autoSettings.baseDelay??5}s`;
                                    return (
                                        <div key={lbl} style={{ textAlign:'center', padding:'8px', background:'rgba(255,255,255,0.04)', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.08)' }}>
                                            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'10px', marginBottom:'4px' }}>{lbl}</div>
                                            <div style={{ color: mode==='random'?'#a78bfa':'#34d399', fontSize:'13px', fontWeight:'700' }}>{val}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Post Action Delays — delay mode toggle */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h4 style={{ color: 'white', fontSize: '12px', fontWeight: '700', margin: 0 }}>📝 Post Action Delays</h4>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {[{v:'base',l:'Base Delay'},{v:'random',l:'Random Delay'}].map(o => (
                                        <button key={o.v} onClick={() => setAutoSettings((p:any)=>({...p,postActionDelayMode:o.v}))}
                                            style={{ padding:'4px 10px', background:(autoSettings.postActionDelayMode??'base')===o.v?'linear-gradient(135deg,#693fe9,#8b5cf6)':'rgba(255,255,255,0.08)', border:'none', borderRadius:'6px', color:'white', fontSize:'11px', fontWeight:'600', cursor:'pointer' }}>{o.l}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                                {['Open Post','Page Load','Like','Comment','Reshare','Follow'].map(lbl => {
                                    const mode = autoSettings.postActionDelayMode??'base';
                                    const val = mode==='random' ? `${autoSettings.randomIntervalMin??5}–${autoSettings.randomIntervalMax??15}s` : `${autoSettings.baseDelay??5}s`;
                                    return (
                                        <div key={lbl} style={{ textAlign:'center', padding:'8px', background:'rgba(255,255,255,0.04)', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.08)' }}>
                                            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'10px', marginBottom:'4px' }}>{lbl}</div>
                                            <div style={{ color: mode==='random'?'#a78bfa':'#34d399', fontSize:'13px', fontWeight:'700' }}>{val}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Human Simulation — compact inline */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h4 style={{ color: 'white', fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0' }}>🧑 Human Simulation</h4>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                {[
                                    { key: 'mouseMovement', label: 'Mouse Curves' },
                                    { key: 'scrollSimulation', label: 'Random Scroll' },
                                    { key: 'readingPause', label: 'Reading Pause' },
                                ].map(f => (
                                    <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={autoSettings[f.key]} onChange={e => setAutoSettings((p: any) => ({ ...p, [f.key]: e.target.checked }))}
                                            style={{ accentColor: '#693fe9', width: '15px', height: '15px' }} />
                                        {f.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Save */}
                        <button onClick={() => saveAutoSettings(autoSettings)} disabled={autoSettingsSaving}
                            style={{ width: '100%', padding: '14px', background: autoSettingsSaving ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: autoSettingsSaving ? 'wait' : 'pointer', boxShadow: '0 4px 20px rgba(105,63,233,0.3)' }}>
                            {autoSettingsSaving ? 'Saving...' : '💾 Save All Settings'}
                        </button>
                        </>)}
                    </div>
                )}

                {/* Commenter Tab */}
                {activeTab === 'commenter' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {(commenterCfgLoading || csSettingsLoading) ? <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading settings...</div> : commenterCfg && (<>

                        {/* Row 1: Post Source + Processing Settings side-by-side */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {/* Post Source */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0' }}>📌 Post Source</h4>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                    {[{ val: 'search', label: '🔍 Search' }, { val: 'feed', label: '📰 Feed' }].map(s => (
                                        <button key={s.val} onClick={() => setCommenterCfg((p: any) => ({ ...p, postSource: s.val }))}
                                            style={{ flex: 1, padding: '8px', background: commenterCfg.postSource === s.val ? 'linear-gradient(135deg,#693fe9,#8b5cf6)' : 'rgba(255,255,255,0.08)', border: commenterCfg.postSource === s.val ? 'none' : '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontWeight: commenterCfg.postSource === s.val ? '700' : '500', cursor: 'pointer', fontSize: '12px' }}>
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                                {commenterCfg.postSource === 'search' && (
                                    <textarea value={commenterCfg.searchKeywords} onChange={e => setCommenterCfg((p: any) => ({ ...p, searchKeywords: e.target.value }))}
                                        placeholder="AI marketing&#10;SaaS growth&#10;startup tips" rows={3}
                                        style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', resize: 'vertical' }} />
                                )}
                                {commenterCfg.postSource === 'feed' && (
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>Processes your home feed, ignores ads</p>
                                )}
                            </div>

                            {/* Processing Settings */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0' }}>⚙️ Processing</h4>
                                {[
                                    { key: 'totalPosts', label: 'Total Posts', min: 1, max: 50 },
                                    { key: 'minLikes', label: 'Min Likes', min: 0, max: 9999 },
                                    { key: 'minComments', label: 'Min Comments', min: 0, max: 9999 },
                                ].map(f => (
                                    <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{f.label}</span>
                                        <input type="number" min={f.min} max={f.max} value={commenterCfg[f.key]} onChange={e => setCommenterCfg((p: any) => ({ ...p, [f.key]: parseInt(e.target.value) || 0 }))}
                                            style={{ width: '65px', padding: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '13px', textAlign: 'center' }} />
                                    </div>
                                ))}
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: '4px 0 0 0' }}>0 = no minimum filter</p>
                            </div>
                        </div>

                        {/* Actions + Window Prefs — single compact row */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>⚡ Actions</h4>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {[{ val: true, label: '🪟 Window' }, { val: false, label: '📑 Tabs' }].map(o => (
                                        <button key={String(o.val)} onClick={() => setCommenterCfg((p: any) => ({ ...p, openInNewWindow: o.val }))}
                                            style={{ padding: '4px 10px', background: commenterCfg.openInNewWindow === o.val ? '#693fe9' : 'rgba(255,255,255,0.08)', border: commenterCfg.openInNewWindow === o.val ? 'none' : '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '10px', fontWeight: commenterCfg.openInNewWindow === o.val ? '700' : '500', cursor: 'pointer' }}>
                                            {o.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {[
                                    { key: 'savePosts', label: '💾 Save' },
                                    { key: 'likePosts', label: '👍 Like' },
                                    { key: 'commentOnPosts', label: '💬 Comment' },
                                    { key: 'likeOrComment', label: '🎲 Like/Comment' },
                                    { key: 'sharePosts', label: '🔄 Share' },
                                    { key: 'followAuthors', label: '➕ Follow' },
                                ].map(f => (
                                    <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', cursor: 'pointer', padding: '7px 8px', background: commenterCfg[f.key] ? 'rgba(105,63,233,0.15)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: commenterCfg[f.key] ? '1px solid rgba(105,63,233,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
                                        <input type="checkbox" checked={commenterCfg[f.key]} onChange={e => setCommenterCfg((p: any) => ({ ...p, [f.key]: e.target.checked }))}
                                            style={{ accentColor: '#693fe9', width: '14px', height: '14px' }} />
                                        {f.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Ignore Keywords — collapsible-style compact */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0' }}>🚫 Ignore Keywords</h4>
                            <textarea value={commenterCfg.ignoreKeywords} onChange={e => setCommenterCfg((p: any) => ({ ...p, ignoreKeywords: e.target.value }))}
                                placeholder="hiring&#10;we're hiring&#10;job opening&#10;apply now" rows={3}
                                style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', resize: 'vertical', fontFamily: 'monospace' }} />
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', margin: '4px 0 0 0' }}>One per line. Posts containing these are skipped.</p>
                        </div>

                        {/* Schedule — compact inline */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>📅 Auto-Schedule</h4>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={commenterCfg.autoScheduleEnabled} onChange={e => setCommenterCfg((p: any) => ({ ...p, autoScheduleEnabled: e.target.checked }))} style={{ accentColor: '#693fe9', width: '15px', height: '15px' }} />
                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Enabled</span>
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                {(() => { try { const sches = JSON.parse(commenterCfg.schedules || '[]'); return sches.map((s: any, i: number) => (
                                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: 'rgba(167,139,250,0.15)', borderRadius: '6px', border: '1px solid rgba(167,139,250,0.3)', fontSize: '11px', color: '#a78bfa' }}>
                                        {s.time} {s.ampm}
                                        <button onClick={() => { const arr = [...sches]; arr.splice(i, 1); setCommenterCfg((p: any) => ({ ...p, schedules: JSON.stringify(arr) })); }}
                                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '10px', padding: '0 2px' }}>✕</button>
                                    </span>
                                )); } catch { return null; } })()}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input id="commenter-sched-time" type="time" defaultValue="09:00" style={{ padding: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px' }} />
                                <select id="commenter-sched-ampm" defaultValue="AM" style={{ padding: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px' }}>
                                    <option value="AM">AM</option><option value="PM">PM</option>
                                </select>
                                <button onClick={() => { const t = (document.getElementById('commenter-sched-time') as HTMLInputElement)?.value || '09:00'; const ap = (document.getElementById('commenter-sched-ampm') as HTMLSelectElement)?.value || 'AM'; try { const arr = JSON.parse(commenterCfg.schedules || '[]'); arr.push({ time: t, ampm: ap }); setCommenterCfg((p: any) => ({ ...p, schedules: JSON.stringify(arr) })); } catch { setCommenterCfg((p: any) => ({ ...p, schedules: JSON.stringify([{ time: t, ampm: ap }]) })); } }}
                                    style={{ padding: '5px 10px', background: 'linear-gradient(135deg,#693fe9,#8b5cf6)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>+ Add</button>
                            </div>
                        </div>

                        {/* Save + Start Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={async () => { await saveCommenterCfg(commenterCfg); await saveCommentSettings(); }} disabled={commenterCfgSaving || csSettingsSaving}
                                style={{ padding: '14px', background: (commenterCfgSaving || csSettingsSaving) ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: (commenterCfgSaving || csSettingsSaving) ? 'wait' : 'pointer' }}>
                                {(commenterCfgSaving || csSettingsSaving) ? 'Saving...' : '💾 Save Settings'}
                            </button>
                            <button onClick={async () => { const token = localStorage.getItem('authToken'); if (!token) return; await saveCommenterCfg(commenterCfg); await saveCommentSettings(); showToast('🚀 Starting bulk commenting...', 'info'); try { const res = await fetch('/api/extension/command', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ command: 'start_bulk_commenting', data: { ...commenterCfg, commentSettings: { goal: csGoal, tone: csTone, commentLength: csLength, commentStyle: csStyle, userExpertise: csExpertise, userBackground: csBackground, aiAutoPost: csAutoPost } } }) }); const data = await res.json(); if (data.success) showToast('✅ Task sent to extension!', 'success'); else showToast(data.error || 'Failed', 'error'); } catch (e: any) { showToast('Error: ' + e.message, 'error'); } }}
                                style={{ padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                                🚀 Start Commenting
                            </button>
                        </div>
                        </>)}
                    </div>
                )}

                {/* Import Tab */}
                {activeTab === 'import' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {importCfgLoading ? <div style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading settings...</div> : importCfg && (<>

                        {/* Profile URLs + CSV upload merged */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>✏️ Profile URLs</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input type="file" accept=".csv" id="import-csv-upload" style={{ display: 'none' }}
                                        onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { const text = ev.target?.result as string; if (!text) return; const lines = text.split('\n').map(l => l.split(',')[0]?.trim()).filter(l => l.includes('linkedin.com/in/')); if (lines.length > 0) { const existing = importCfg.profileUrls ? importCfg.profileUrls.trim() : ''; const combined = existing ? existing + '\n' + lines.join('\n') : lines.join('\n'); setImportCfg((p: any) => ({ ...p, profileUrls: combined })); showToast(`Imported ${lines.length} profiles from CSV`, 'success'); } else { showToast('No LinkedIn URLs found in CSV', 'error'); } }; reader.readAsText(file); e.target.value = ''; }} />
                                    <button onClick={() => document.getElementById('import-csv-upload')?.click()}
                                        style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                                        📂 CSV
                                    </button>
                                    <span style={{ color: '#a78bfa', fontSize: '12px', fontWeight: '700' }}>{importCfg.profileUrls ? importCfg.profileUrls.split('\n').filter((u: string) => u.trim().includes('linkedin.com/in/')).length : 0} detected</span>
                                </div>
                            </div>
                            <textarea value={importCfg.profileUrls} onChange={e => setImportCfg((p: any) => ({ ...p, profileUrls: e.target.value }))}
                                placeholder="https://www.linkedin.com/in/john-doe/&#10;https://www.linkedin.com/in/jane-smith/" rows={4}
                                style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', resize: 'vertical', fontFamily: 'monospace' }} />
                        </div>

                        {/* Credits + Settings side-by-side */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {/* Import Credits */}
                            <div style={{ background: 'rgba(105,63,233,0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(105,63,233,0.3)' }}>
                                <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0' }}>🎫 Credits {user?.plan ? `(${user.plan.name})` : ''}</h4>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#34d399' }}>{Math.max(0, (user?.plan?.monthlyImportCredits || 50) - (usage?.usage?.importProfiles || 0))}</div>
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>Left</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#a78bfa' }}>{user?.plan?.monthlyImportCredits || 50}</div>
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>Total</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>{usage?.usage?.importProfiles || 0}</div>
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>Used</div>
                                    </div>
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: '8px 0 0 0' }}>1 credit per profile</p>
                            </div>

                            {/* Automation Config */}
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0' }}>🤖 Config</h4>
                                {[
                                    { key: 'profilesPerDay', label: 'Profiles/Day', min: 1, max: 100 },
                                    { key: 'postsPerProfile', label: 'Posts/Profile', min: 1, max: 10 },
                                ].map(f => (
                                    <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{f.label}</span>
                                        <input type="number" min={f.min} max={f.max} value={importCfg[f.key]} onChange={e => setImportCfg((p: any) => ({ ...p, [f.key]: parseInt(e.target.value) || f.min }))}
                                            style={{ width: '60px', padding: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '13px', textAlign: 'center' }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Engagement Actions — compact */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0' }}>⚡ Engagement Actions</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {[
                                    { key: 'sendConnections', label: '🤝 Connect' },
                                    { key: 'engageLikes', label: '👍 Like' },
                                    { key: 'engageComments', label: '💬 Comment' },
                                    { key: 'engageShares', label: '🔄 Share' },
                                    { key: 'engageFollows', label: '➕ Follow' },
                                    { key: 'smartRandom', label: '🎲 Random' },
                                ].map(f => (
                                    <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', cursor: 'pointer', padding: '7px 8px', background: importCfg[f.key] ? 'rgba(105,63,233,0.15)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: importCfg[f.key] ? '1px solid rgba(105,63,233,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
                                        <input type="checkbox" checked={importCfg[f.key]} onChange={e => setImportCfg((p: any) => ({ ...p, [f.key]: e.target.checked }))}
                                            style={{ accentColor: '#693fe9', width: '14px', height: '14px' }} />
                                        {f.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Schedule — compact inline */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>📅 Auto-Schedule</h4>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={importCfg.autoScheduleEnabled} onChange={e => setImportCfg((p: any) => ({ ...p, autoScheduleEnabled: e.target.checked }))} style={{ accentColor: '#693fe9', width: '15px', height: '15px' }} />
                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Enabled</span>
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                {(() => { try { const sches = JSON.parse(importCfg.schedules || '[]'); return sches.map((s: any, i: number) => (
                                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: 'rgba(167,139,250,0.15)', borderRadius: '6px', border: '1px solid rgba(167,139,250,0.3)', fontSize: '11px', color: '#a78bfa' }}>
                                        {s.time} {s.ampm}
                                        <button onClick={() => { const arr = [...sches]; arr.splice(i, 1); setImportCfg((p: any) => ({ ...p, schedules: JSON.stringify(arr) })); }}
                                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '10px', padding: '0 2px' }}>✕</button>
                                    </span>
                                )); } catch { return null; } })()}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input id="import-sched-time" type="time" defaultValue="09:00" style={{ padding: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px' }} />
                                <select id="import-sched-ampm" defaultValue="AM" style={{ padding: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '12px' }}>
                                    <option value="AM">AM</option><option value="PM">PM</option>
                                </select>
                                <button onClick={() => { const t = (document.getElementById('import-sched-time') as HTMLInputElement)?.value || '09:00'; const ap = (document.getElementById('import-sched-ampm') as HTMLSelectElement)?.value || 'AM'; try { const arr = JSON.parse(importCfg.schedules || '[]'); arr.push({ time: t, ampm: ap }); setImportCfg((p: any) => ({ ...p, schedules: JSON.stringify(arr) })); } catch { setImportCfg((p: any) => ({ ...p, schedules: JSON.stringify([{ time: t, ampm: ap }]) })); } }}
                                    style={{ padding: '5px 10px', background: 'linear-gradient(135deg,#693fe9,#8b5cf6)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>+ Add</button>
                            </div>
                        </div>

                        {/* Save + Launch Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={() => saveImportCfg(importCfg)} disabled={importCfgSaving}
                                style={{ padding: '14px', background: importCfgSaving ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: importCfgSaving ? 'wait' : 'pointer' }}>
                                {importCfgSaving ? 'Saving...' : '💾 Save Settings'}
                            </button>
                            <button onClick={async () => { const token = localStorage.getItem('authToken'); if (!token) return; await saveImportCfg(importCfg); showToast('🚀 Launching import...', 'info'); try { const res = await fetch('/api/extension/command', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ command: 'start_import_automation', data: importCfg }) }); const data = await res.json(); if (data.success) showToast('Task sent to extension!', 'success'); else showToast(data.error || 'Failed', 'error'); } catch (e: any) { showToast('Error: ' + e.message, 'error'); } }}
                                style={{ padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                                🚀 Launch Import
                            </button>
                        </div>

                        {/* Import History — compact */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0' }}>📊 History</h4>
                            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                {[
                                    { label: 'Profiles', val: importCfg.profileUrls ? importCfg.profileUrls.split('\n').filter((u: string) => u.trim().includes('linkedin.com/in/')).length : 0, color: '#a78bfa' },
                                    { label: 'Connects', val: 0, color: '#34d399' },
                                    { label: 'Posts', val: 0, color: '#60a5fa' },
                                    { label: 'Comments', val: 0, color: '#fbbf24' },
                                    { label: 'Rate', val: '0%', color: '#f472b6' },
                                ].map(s => (
                                    <div key={s.label} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '16px', fontWeight: '800', color: s.color }}>{s.val}</div>
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            {['Date', 'Profile', 'Connect', 'Likes', 'Comments', 'Status'].map(h => (
                                                <th key={h} style={{ padding: '6px 4px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colSpan={6} style={{ padding: '14px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>No actions yet. Launch to see history.</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        </>)}
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Engagement Analytics Card */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ color: '#a78bfa', fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>📊 Engagement Analytics</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <select value={analyticsPeriod} onChange={e => { setAnalyticsPeriod(e.target.value); loadAnalytics(); }}
                                        style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px' }}>
                                        <option value="today">Today</option>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="3days">Last 3 Days</option>
                                        <option value="7days">Last 7 Days</option>
                                        <option value="30days">Last 30 Days</option>
                                        <option value="90days">Last 90 Days</option>
                                    </select>
                                    <button onClick={loadAnalytics} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '13px' }}>🔄</button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                                {[
                                    { label: 'Total', value: analyticsData.engagements?.total || 0, color: '#693fe9', bg: 'linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)' },
                                    { label: 'Comments', value: analyticsData.engagements?.comments || 0, color: '#4CAF50', bg: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' },
                                    { label: 'Likes', value: analyticsData.engagements?.likes || 0, color: '#2196F3', bg: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)' },
                                    { label: 'Shares', value: analyticsData.engagements?.shares || 0, color: '#FF9800', bg: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)' },
                                    { label: 'Follows', value: analyticsData.engagements?.follows || 0, color: '#E91E63', bg: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)' },
                                ].map(s => (
                                    <div key={s.label} style={{ padding: '16px', textAlign: 'center', background: s.bg, borderRadius: '12px', boxShadow: `0 2px 10px ${s.color}40` }}>
                                        <div style={{ fontSize: '24px', color: 'white', fontWeight: '700' }}>{s.value}</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Leads Database */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0 }}>👥 Leads Database</h3>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={loadAnalytics} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>🔄</button>
                                    <button style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>📥</button>
                                </div>
                            </div>
                            <input type="text" value={analyticsLeadsSearch} onChange={e => setAnalyticsLeadsSearch(e.target.value)} placeholder="🔍 Search leads..."
                                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', marginBottom: '12px' }} />
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                <span>Total: <strong style={{ color: 'white' }}>{analyticsData.leads?.length || 0}</strong></span>
                                <span>Email: <strong style={{ color: 'white' }}>{analyticsData.leads?.filter((l: any) => l.email).length || 0}</strong></span>
                                <span>Phone: <strong style={{ color: 'white' }}>{analyticsData.leads?.filter((l: any) => l.phone).length || 0}</strong></span>
                                <span>Connected: <strong style={{ color: 'white' }}>{analyticsData.leads?.filter((l: any) => l.connected).length || 0}</strong></span>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                    <thead style={{ background: 'linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            {['Name', 'Headline', 'Location', 'Query', 'Date', 'Actions'].map(h => (
                                                <th key={h} style={{ padding: '10px', textAlign: 'left', color: 'white', fontWeight: '600' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!analyticsData.leads || analyticsData.leads.length === 0) ? (
                                            <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No leads found. Start a People Search to collect leads.</td></tr>
                                        ) : analyticsData.leads.filter((l: any) => !analyticsLeadsSearch || l.name?.toLowerCase().includes(analyticsLeadsSearch.toLowerCase())).map((lead: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                <td style={{ padding: '10px', color: 'white', fontWeight: '600' }}>{lead.name || '-'}</td>
                                                <td style={{ padding: '10px', color: 'rgba(255,255,255,0.7)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.headline || '-'}</td>
                                                <td style={{ padding: '10px', color: 'rgba(255,255,255,0.6)' }}>{lead.location || '-'}</td>
                                                <td style={{ padding: '10px', color: 'rgba(255,255,255,0.6)' }}>{lead.query || '-'}</td>
                                                <td style={{ padding: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{lead.date ? new Date(lead.date).toLocaleDateString() : '-'}</td>
                                                <td style={{ padding: '10px' }}>{lead.profileUrl && <a href={lead.profileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#693fe9', fontSize: '11px' }}>View</a>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Automation History */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0 }}>🤖 Automation History</h3>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <select value={analyticsAutoFilter} onChange={e => setAnalyticsAutoFilter(e.target.value)} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '11px' }}>
                                        <option value="all">All</option>
                                        <option value="success">Success</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                    <button onClick={loadAnalytics} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>🔄</button>
                                    <button style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>📥</button>
                                </div>
                            </div>
                            <input type="text" value={analyticsAutoSearch} onChange={e => setAnalyticsAutoSearch(e.target.value)} placeholder="🔍 Search by keyword, author..."
                                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', marginBottom: '12px' }} />
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                <span>Sessions: <strong style={{ color: 'white' }}>{analyticsData.automationHistory?.length || 0}</strong></span>
                                <span>Posts: <strong style={{ color: 'white' }}>{analyticsData.automationHistory?.reduce((sum: number, s: any) => sum + (s.postsProcessed || 0), 0) || 0}</strong></span>
                                <span>Comments: <strong style={{ color: 'white' }}>{analyticsData.automationHistory?.reduce((sum: number, s: any) => sum + (s.commentsGenerated || 0), 0) || 0}</strong></span>
                                <span>Rate: <strong style={{ color: 'white' }}>{analyticsData.automationHistory?.length > 0 ? Math.round((analyticsData.automationHistory.filter((s: any) => s.status === 'success').length / analyticsData.automationHistory.length) * 100) : 0}%</strong></span>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                    <thead style={{ background: 'linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            {['Keywords', 'Author', 'Post Content', 'Generated Comment', 'Actions', 'Status', 'Date'].map(h => (
                                                <th key={h} style={{ padding: '10px', textAlign: 'left', color: 'white', fontWeight: '600' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!analyticsData.automationHistory || analyticsData.automationHistory.length === 0) ? (
                                            <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No automation history found. Start Bulk Processing to see post details here.</td></tr>
                                        ) : analyticsData.automationHistory.filter((r: any) => analyticsAutoFilter === 'all' || r.status === analyticsAutoFilter).filter((r: any) => !analyticsAutoSearch || r.keywords?.toLowerCase().includes(analyticsAutoSearch.toLowerCase()) || r.authorName?.toLowerCase().includes(analyticsAutoSearch.toLowerCase())).slice(0, 100).map((record: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.7)' }}>{(record.keywords || '-').substring(0, 30)}</td>
                                                <td style={{ padding: '8px', color: 'white', fontWeight: '600' }}>{(record.authorName || '-').substring(0, 20)}</td>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.6)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.postContent}>{(record.postContent || '-').substring(0, 50)}</td>
                                                <td style={{ padding: '8px', color: '#a78bfa', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.generatedComment}>{(record.generatedComment || '-').substring(0, 50)}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{record.actions?.liked && '👍'}{record.actions?.commented && '💬'}{record.postUrl && <a href={record.postUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '4px', background: '#693fe9', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '10px', textDecoration: 'none' }}>👁️</a>}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{record.status === 'success' ? '✅' : record.status === 'failed' ? '❌' : '⏳'}</td>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{record.timestamp ? new Date(record.timestamp).toLocaleString() : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Networking History */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0 }}>🔗 Networking History</h3>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <select value={analyticsNetworkFilter} onChange={e => setAnalyticsNetworkFilter(e.target.value)} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '11px' }}>
                                        <option value="all">All</option>
                                        <option value="completed">Done</option>
                                        <option value="stopped">Stopped</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                    <button onClick={loadAnalytics} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>🔄</button>
                                    <button style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>📥</button>
                                </div>
                            </div>
                            <input type="text" value={analyticsNetworkSearch} onChange={e => setAnalyticsNetworkSearch(e.target.value)} placeholder="🔍 Search by query..."
                                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', marginBottom: '12px' }} />
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                <span>Sessions: <strong style={{ color: 'white' }}>{analyticsData.networkingHistory?.length || 0}</strong></span>
                                <span>Sent: <strong style={{ color: 'white' }}>{analyticsData.networkingHistory?.reduce((sum: number, s: any) => sum + (s.successful || 0), 0) || 0}</strong></span>
                                <span>Found: <strong style={{ color: 'white' }}>{analyticsData.networkingHistory?.reduce((sum: number, s: any) => sum + (s.processed || 0), 0) || 0}</strong></span>
                                <span>Rate: <strong style={{ color: 'white' }}>{analyticsData.networkingHistory?.length > 0 ? Math.round((analyticsData.networkingHistory.filter((s: any) => s.status === 'completed').length / analyticsData.networkingHistory.length) * 100) : 0}%</strong></span>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                    <thead style={{ background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            {['Search Query', 'Target', 'Found', 'Sent', 'Success Rate', 'Duration', 'Status', 'Date'].map(h => (
                                                <th key={h} style={{ padding: '10px', textAlign: h === 'Search Query' ? 'left' : 'center', color: 'white', fontWeight: '600' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!analyticsData.networkingHistory || analyticsData.networkingHistory.length === 0) ? (
                                            <tr><td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No networking history found. Start People Search to see history here.</td></tr>
                                        ) : analyticsData.networkingHistory.filter((s: any) => analyticsNetworkFilter === 'all' || s.status === analyticsNetworkFilter).filter((s: any) => !analyticsNetworkSearch || s.query?.toLowerCase().includes(analyticsNetworkSearch.toLowerCase())).slice(0, 50).map((session: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                <td style={{ padding: '8px', color: 'white' }}>{session.query || session.keywords || '-'}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{session.target || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{session.processed || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{session.successful || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{session.processed > 0 ? Math.round((session.successful / session.processed) * 100) : 0}%</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>{session.duration ? (session.duration > 60000 ? `${Math.floor(session.duration / 60000)}m ${Math.floor((session.duration % 60000) / 1000)}s` : `${Math.floor(session.duration / 1000)}s`) : '< 1s'}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{session.status === 'completed' ? '✅' : session.status === 'stopped' ? '⏹️' : session.status === 'failed' ? '❌' : '⏳'} <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{session.status}</span></td>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{session.startTime ? new Date(session.startTime).toLocaleString() : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Import History */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0 }}>📥 Import Profile History</h3>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={loadAnalytics} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>🔄</button>
                                    <button style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>📥</button>
                                </div>
                            </div>
                            <input type="text" value={analyticsImportSearch} onChange={e => setAnalyticsImportSearch(e.target.value)} placeholder="🔍 Search profiles..."
                                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', marginBottom: '12px' }} />
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                <span>Profiles: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.length || 0}</strong></span>
                                <span>Connects: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.reduce((sum: number, r: any) => sum + (r.connectionsSent || 0), 0) || 0}</strong></span>
                                <span>Posts: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.reduce((sum: number, r: any) => sum + (r.likes || 0) + (r.comments || 0), 0) || 0}</strong></span>
                                <span>Comments: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.reduce((sum: number, r: any) => sum + (r.comments || 0), 0) || 0}</strong></span>
                                <span>Rate: <strong style={{ color: 'white' }}>{analyticsData.importHistory?.length > 0 ? Math.round((analyticsData.importHistory.filter((r: any) => r.status === 'completed' || r.status === 'Success').length / analyticsData.importHistory.length) * 100) : 0}%</strong></span>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                    <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            {['Date', 'Profile', 'Link', 'Connect', 'Likes', 'Comments', 'Status'].map(h => (
                                                <th key={h} style={{ padding: '10px', textAlign: h === 'Profile' || h === 'Date' ? 'left' : 'center', color: 'white', fontWeight: '600' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!analyticsData.importHistory || analyticsData.importHistory.length === 0) ? (
                                            <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No actions yet. Launch Import to see history here.</td></tr>
                                        ) : analyticsData.importHistory.filter((r: any) => !analyticsImportSearch || r.profileName?.toLowerCase().includes(analyticsImportSearch.toLowerCase())).map((record: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                                <td style={{ padding: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{record.date || (record.timestamp ? new Date(record.timestamp).toLocaleDateString() : '-')}</td>
                                                <td style={{ padding: '8px', color: 'white', fontWeight: '600' }}>{record.profileName || 'Unknown'}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{record.profileUrl ? <a href={record.profileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0a66c2' }}>🔗</a> : '-'}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{record.connectionsSent || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{record.likes || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{record.comments || 0}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                                    <span style={{ background: record.status === 'completed' || record.status === 'Success' ? '#28a745' : record.status === 'failed' ? '#dc3545' : '#6c757d', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '9px' }}>
                                                        {record.status === 'completed' || record.status === 'Success' ? '✓' : record.status === 'failed' ? '✗' : record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                                    <span>{user?.plan?.name || 'Free'}</span>
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
            {/* WhatsApp Button */}
            <button
                onClick={() => { window.open(`https://wa.me/13072784862?text=${encodeURIComponent("Hi, I'm interested in Kommentify (from kommentify.com). I have a question about: ")}`, '_blank'); }}
                style={{ position: 'fixed', bottom: '24px', right: '24px', width: '56px', height: '56px', background: '#25D366', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)', zIndex: 9999, cursor: 'pointer', transition: 'transform 0.3s ease' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                title="Chat with us on WhatsApp"
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
            </button>
            
            {/* LinkedIn Profile Data Modal */}
            {showLinkedInDataModal && linkedInProfile && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'rgba(0,0,0,0.8)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 10000 
                }}>
                    <div style={{ 
                        background: '#1a1a1a', 
                        borderRadius: '12px', 
                        padding: '24px', 
                        maxWidth: '600px', 
                        maxHeight: '80vh', 
                        overflow: 'auto', 
                        color: 'white',
                        width: '90%'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>LinkedIn Profile Data</h3>
                            <button 
                                onClick={() => setShowLinkedInDataModal(false)}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: 'white', 
                                    fontSize: '24px', 
                                    cursor: 'pointer',
                                    padding: '0'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <strong style={{ color: '#0077b5' }}>Name:</strong>
                                <p style={{ margin: '4px 0', color: 'rgba(255,255,255,0.8)' }}>{linkedInProfile.name || 'N/A'}</p>
                            </div>
                            
                            <div>
                                <strong style={{ color: '#0077b5' }}>Headline:</strong>
                                <p style={{ margin: '4px 0', color: 'rgba(255,255,255,0.8)' }}>{linkedInProfile.headline || 'N/A'}</p>
                            </div>
                            
                            <div>
                                <strong style={{ color: '#0077b5' }}>About:</strong>
                                <p style={{ margin: '4px 0', color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap' }}>{linkedInProfile.about || 'N/A'}</p>
                            </div>
                            
                            <div>
                                <strong style={{ color: '#0077b5' }}>Language:</strong>
                                <p style={{ margin: '4px 0', color: 'rgba(255,255,255,0.8)' }}>{linkedInProfile.language || 'N/A'}</p>
                            </div>
                            
                            <div>
                                <strong style={{ color: '#0077b5' }}>Skills ({Array.isArray(linkedInProfile.skills) ? linkedInProfile.skills.length : 0}):</strong>
                                <ul style={{ margin: '4px 0', paddingLeft: '20px', color: 'rgba(255,255,255,0.8)' }}>
                                    {Array.isArray(linkedInProfile.skills) ? 
                                        linkedInProfile.skills.map((skill: string, idx: number) => (
                                            <li key={idx}>{skill}</li>
                                        )) : 
                                        <li>Error loading skills</li>
                                    }
                                </ul>
                            </div>
                            
                            <div>
                                <strong style={{ color: '#0077b5' }}>Experience ({Array.isArray(linkedInProfile.experience) ? linkedInProfile.experience.length : 0}):</strong>
                                <ul style={{ margin: '4px 0', paddingLeft: '20px', color: 'rgba(255,255,255,0.8)' }}>
                                    {Array.isArray(linkedInProfile.experience) ? 
                                        linkedInProfile.experience.map((exp: string, idx: number) => (
                                            <li key={idx} style={{ marginBottom: '8px' }}>{exp}</li>
                                        )) : 
                                        <li>Error loading experience</li>
                                    }
                                </ul>
                            </div>
                            
                            <div>
                                <strong style={{ color: '#0077b5' }}>Education ({Array.isArray(linkedInProfile.education) ? linkedInProfile.education.length : 0}):</strong>
                                <ul style={{ margin: '4px 0', paddingLeft: '20px', color: 'rgba(255,255,255,0.8)' }}>
                                    {Array.isArray(linkedInProfile.education) ? 
                                        linkedInProfile.education.map((edu: string, idx: number) => (
                                            <li key={idx}>{edu}</li>
                                        )) : 
                                        <li>Error loading education</li>
                                    }
                                </ul>
                            </div>
                            
                            <div>
                                <strong style={{ color: '#0077b5' }}>Posts ({Array.isArray(linkedInProfile.posts) ? linkedInProfile.posts.length : 0}):</strong>
                                <div style={{ maxHeight: '200px', overflow: 'auto', margin: '4px 0' }}>
                                    {Array.isArray(linkedInProfile.posts) ? 
                                        linkedInProfile.posts.map((post: string, idx: number) => (
                                            <div key={idx} style={{ 
                                                padding: '8px', 
                                                margin: '4px 0', 
                                                background: 'rgba(255,255,255,0.05)', 
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                whiteSpace: 'pre-wrap'
                                            }}>
                                                {post}
                                            </div>
                                        )) : 
                                        <div>Error loading posts</div>
                                    }
                                </div>
                            </div>
                            
                            <div>
                                <strong style={{ color: '#0077b5' }}>Last Scanned:</strong>
                                <p style={{ margin: '4px 0', color: 'rgba(255,255,255,0.8)' }}>
                                    {linkedInProfile.lastScannedAt ? new Date(linkedInProfile.lastScannedAt).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
