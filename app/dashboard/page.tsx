'use client';

import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useClerk, useAuth } from '@clerk/nextjs';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, getLanguageDir } from '@/lib/i18n';
import { cleanLinkedInProfileUrl, cleanLinkedInProfileUrls } from '@/lib/linkedin-url-cleaner';
import OverviewTab from './components/OverviewTab';
import WriterTabNew from './components/WriterTabNew';
import CommentsTab from './components/CommentsTab';
import TrendingPostsTab from './components/TrendingPostsTab';
import TasksTab from './components/TasksTab';
import HistoryTab from './components/HistoryTab';
import LimitsTab from './components/LimitsTab';
import ActivityTab from './components/ActivityTab';
import CommenterTab from './components/CommenterTab';
import ImportTab from './components/ImportTab';
import AnalyticsTab from './components/AnalyticsTab';
import UsageTab from './components/UsageTab';
import ReferralsTab from './components/ReferralsTab';
import ExtensionTab from './components/ExtensionTab';
import AccountTab from './components/AccountTab';


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
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)' }}><div style={{ textAlign: 'center', color: 'white' }}><div style={{ marginBottom: '20px' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg></div><div style={{ fontSize: '18px', opacity: 0.8 }}>Loading your dashboard...</div></div></div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, i18n } = useTranslation();
    const [dashLang, setDashLang] = useState<string>(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('dashboard-language') || 'en';
        return 'en';
    });
    const changeDashboardLanguage = (lang: string) => {
        setDashLang(lang);
        i18n.changeLanguage(lang);
        localStorage.setItem('dashboard-language', lang);
        document.documentElement.dir = getLanguageDir(lang);
        document.documentElement.lang = lang;
    };
    const [user, setUser] = useState<any>(null);
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [copied, setCopied] = useState(false);
    const [showReferrals, setShowReferrals] = useState(false);
    const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const { signOut } = useClerk();
    const { isSignedIn: isClerkSignedIn, isLoaded: isClerkLoaded } = useAuth();

    // Ref to prevent multiple validations
    const hasValidated = useRef(false);

    // Check if user is on a free plan (no AI access)
    // Also treat expired trial users as free (trial plan with past trialEndsAt)
    const isTrialExpired = user?.plan?.isTrialPlan && user?.trialEndsAt && new Date(user.trialEndsAt) < new Date();
    const isFreePlan = user?.plan && (
        user.plan.isDefaultFreePlan ||
        (user.plan.price === 0 && !user.plan.isLifetime && !user.plan.isTrialPlan) ||
        isTrialExpired
    );

    // Writer tab state
    const [writerTopic, setWriterTopic] = useState('');
    const [writerTemplate, setWriterTemplate] = useState('lead_magnet');
    const [writerTone, setWriterTone] = useState('professional');
    const [writerLength, setWriterLength] = useState('1500');
    const [writerHashtags, setWriterHashtags] = useState(false);
    const [writerEmojis, setWriterEmojis] = useState(true);
    const [writerLanguage, setWriterLanguage] = useState('');
    const [writerAdvancedOpen, setWriterAdvancedOpen] = useState(true);
    const [writerTargetAudience, setWriterTargetAudience] = useState('');
    const [writerKeyMessage, setWriterKeyMessage] = useState('');
    const [writerBackground, setWriterBackground] = useState('');
    const [writerContent, setWriterContent] = useState('');
    const [writerGenerating, setWriterGenerating] = useState(false);
    const [writerScheduleDate, setWriterScheduleDate] = useState('');
    const [writerScheduleTime, setWriterScheduleTime] = useState('');
    const [writerDrafts, setWriterDrafts] = useState<any[]>([]);
    const [writerScheduledPosts, setWriterScheduledPosts] = useState<any[]>([]);
    const [writerTokenUsage, setWriterTokenUsage] = useState<any>(null);
    const [writerImageFile, setWriterImageFile] = useState<File | null>(null);
    const [writerImageUrl, setWriterImageUrl] = useState<string>('');
    const [writerMediaBlobUrl, setWriterMediaBlobUrl] = useState<string>('');
    const [writerMediaType, setWriterMediaType] = useState<string>('');
    const [writerUploading, setWriterUploading] = useState(false);
    const [writerPreviewMode, setWriterPreviewMode] = useState<'off' | 'desktop' | 'mobile'>('off');
    const [writerPreviewExpanded, setWriterPreviewExpanded] = useState(false);
    const [writerUseLinkedInAPI, setWriterUseLinkedInAPI] = useState(true); // Default to LinkedIn API
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [taskCounts, setTaskCounts] = useState({ pending: 0, in_progress: 0, completed: 0, failed: 0 });
    const [writerStatus, setWriterStatus] = useState('');
    const [writerModel, setWriterModel] = useState<string>('gpt-4o');
    const [writerUseInspirationSources, setWriterUseInspirationSources] = useState(true);
    const [writerInspirationSourceNames, setWriterInspirationSourceNames] = useState<string[]>([]);

    // User goals state (for WriterTabNew)
    const [userGoal, setUserGoal] = useState('');
    const [userTargetAudience, setUserTargetAudience] = useState('');
    const [userWritingStyle, setUserWritingStyle] = useState('');
    const [userWritingStyleSource, setUserWritingStyleSource] = useState('user_default');
    const [goalsLoading, setGoalsLoading] = useState(false);
    const [goalsSuggesting, setGoalsSuggesting] = useState(false);

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
    const [trendingUseProfileData, setTrendingUseProfileData] = useState(false); // Profile data toggle for trending
    // Feed scrape live status
    const [feedScrapeCommandId, setFeedScrapeCommandId] = useState<string | null>(null);
    const [feedScrapeStatus, setFeedScrapeStatus] = useState<any>(null);
    const [feedScrapePolling, setFeedScrapePolling] = useState(false);
    const feedScrapeIntervalRef = useRef<any>(null);

    // Developer emails for showing token costs
    const DEVELOPER_EMAILS = ['alanemarkef199@gmail.com', 'arman@arwebcraftslive.com'];
    const isDeveloper = user?.email ? DEVELOPER_EMAILS.includes(user.email) : false;
    // Check if user is admin
    const isAdmin = user?.role === 'admin' || user?.email === 'arman@arwebcraftslive.com';

    // AI Models state - fetched from database (admin-controlled)
    const [aiModels, setAiModels] = useState<any[]>([]);
    const [aiModelsLoading, setAiModelsLoading] = useState(false);
    const [userModelSettings, setUserModelSettings] = useState<any>(null);
    // Admin AI model settings - fetched from database
    const [adminModelSettings, setAdminModelSettings] = useState<any>(null);

    // Model options derived from fetched models - sorted by writing score
    const MODEL_OPTIONS = aiModels.length > 0
        ? aiModels.map(m => ({
            id: m.modelId,
            name: m.name,
            inputCost: `$${m.inputCostPer1M.toFixed(2)}/1M`,
            outputCost: `$${m.outputCostPer1M.toFixed(2)}/1M`,
            category: m.category,
            isFeatured: m.isFeatured,
            writingScore: m.writingScore,
            speedScore: m.speedScore,
            provider: m.provider,
            isReasoningModel: m.isReasoningModel
        }))
        : [
            { id: 'gpt-4o', name: 'GPT-4o (Best Quality)', inputCost: '$2.50/1M', outputCost: '$10.00/1M', category: 'premium', isFeatured: true, writingScore: 9, speedScore: 8, provider: 'openai', isReasoningModel: false },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast)', inputCost: '$0.15/1M', outputCost: '$0.60/1M', category: 'budget', isFeatured: true, writingScore: 8, speedScore: 10, provider: 'openai', isReasoningModel: false },
        ];

    // Fetch AI models from database
    const fetchAIModels = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setAiModelsLoading(true);
        
        // First fetch admin model settings (independent of user settings)
        try {
            const adminRes = await fetch('/api/admin/ai-models/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const adminData = await adminRes.json();
            console.log('Admin settings response:', adminData);
            if (adminData.success) {
                setAdminModelSettings(adminData.settings);
                // Use admin-configured model if user selection is not allowed
                if (!adminData.settings?.allowUserModelSelection) {
                    if (adminData.settings?.postModelId) {
                        console.log('Setting writer model to admin config:', adminData.settings.postModelId);
                        setWriterModel(adminData.settings.postModelId);
                    }
                    if (adminData.settings?.trendingModelId) {
                        console.log('Setting trending model to admin config:', adminData.settings.trendingModelId);
                        setTrendingModel(adminData.settings.trendingModelId);
                    }
                }
            }
        } catch (adminErr) {
            console.error('Failed to fetch admin settings:', adminErr);
        }
        
        // Then fetch user/AI models
        try {
            const res = await fetch('/api/ai-models', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAiModels(data.models || []);
                setUserModelSettings(data.userSettings);
                // Only use user settings if admin allows user selection
                if (adminModelSettings?.allowUserModelSelection) {
                    if (data.userSettings?.postModelId) setWriterModel(data.userSettings.postModelId);
                    if (data.userSettings?.commentModelId) setCsModel(data.userSettings.commentModelId);
                }
            }
        } catch (e) {
            console.error('Failed to fetch AI models:', e);
        } finally {
            setAiModelsLoading(false);
        }
    };

    // Save user model preferences when changed
    const handleWriterModelChange = async (modelId: string) => {
        setWriterModel(modelId);
        await saveUserModelSettings({ postModelId: modelId });
    };

    const handleCommentModelChange = async (modelId: string) => {
        setCsModel(modelId);
        await saveUserModelSettings({ commentModelId: modelId });
    };

    // Save user model preferences
    const saveUserModelSettings = async (settings: { postModelId?: string; commentModelId?: string; topicModelId?: string }) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/ai-models/settings', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (data.success) {
                setUserModelSettings(data.settings);
                showToast('Model preferences saved!', 'success');
            }
        } catch (e) {
            console.error('Failed to save model settings:', e);
        }
    };
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
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    const [inspirationDeleteMode, setInspirationDeleteMode] = useState(false);
    const [inspirationDeleteSelected, setInspirationDeleteSelected] = useState<string[]>([]);
    const [useProfileData, setUseProfileData] = useState(false);
    const [showInspirationPopup, setShowInspirationPopup] = useState(false);
    const [showSharedProfilesPopup, setShowSharedProfilesPopup] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

    // Content Planner state
    const [plannerOpen, setPlannerOpen] = useState(false);
    const [plannerMode, setPlannerMode] = useState<'7days' | '30days'>('7days');
    const [plannerStep, setPlannerStep] = useState<'context' | 'select' | 'time' | 'generating' | 'done'>('context');
    const [plannerContext, setPlannerContext] = useState('');
    const [plannerTopics, setPlannerTopics] = useState<string[]>([]);
    const [plannerSelected, setPlannerSelected] = useState<boolean[]>([]);
    const [plannerGeneratingTopics, setPlannerGeneratingTopics] = useState(false);
    const [plannerPublishTime, setPlannerPublishTime] = useState('09:00');
    const [plannerStartDate, setPlannerStartDate] = useState('');
    const [plannerTemplate, setPlannerTemplate] = useState('thought_leadership');
    const [plannerTone, setPlannerTone] = useState('professional');
    const [plannerLength, setPlannerLength] = useState('1500');
    const [plannerGenerating, setPlannerGenerating] = useState(false);
    const [plannerDoneCount, setPlannerDoneCount] = useState(0);
    const [plannerTotal, setPlannerTotal] = useState(0);
    const [plannerStatusMsg, setPlannerStatusMsg] = useState('');
    const plannerAbortRef = useRef<boolean>(false);

    // LinkedIn OAuth state
    const [linkedInOAuth, setLinkedInOAuth] = useState<any>(null);
    const [linkedInOAuthLoading, setLinkedInOAuthLoading] = useState(true);

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
    const [csUseProfileData, setCsUseProfileData] = useState(false);
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

    // Live activity log state
    const [liveActivityLogs, setLiveActivityLogs] = useState<any[]>([]);
    const [liveActivityLoading, setLiveActivityLoading] = useState(false);
    const [showLogsPopup, setShowLogsPopup] = useState(false);

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
    const [selectedInspirationPosts, setSelectedInspirationPosts] = useState<string[]>([]);
    const [showFullPageText, setShowFullPageText] = useState(false);
    const [rescanningMissing, setRescanningMissing] = useState(false);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [viewingProfilePosts, setViewingProfilePosts] = useState<string | null>(null);
    const [profilePostsData, setProfilePostsData] = useState<any[]>([]);
    const [profilePostsLoading, setProfilePostsLoading] = useState(false);
    // Voyager data state
    const [voyagerData, setVoyagerData] = useState<any>(null);
    const [voyagerLoading, setVoyagerLoading] = useState(false);
    const [voyagerSyncing, setVoyagerSyncing] = useState(false);

    // Toggle inspiration post selection
    const toggleInspirationPost = (post: string) => {
        setSelectedInspirationPosts(prev =>
            prev.includes(post)
                ? prev.filter(p => p !== post)
                : [...prev, post]
        );
    };

    // Load individual posts from a profile
    const loadProfilePosts = async (profileName: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setProfilePostsLoading(true);
        setViewingProfilePosts(profileName);
        try {
            const res = await fetch(`/api/vector/posts?sourceName=${encodeURIComponent(profileName)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setProfilePostsData(data.posts || []);
            }
        } catch (e) {
            console.error('Failed to load profile posts:', e);
        } finally {
            setProfilePostsLoading(false);
        }
    };

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
        // Prevent multiple validations
        if (hasValidated.current) return;
        hasValidated.current = true;

        if (loggingOut) return;

        // Wait for Clerk to load
        if (!isClerkLoaded) return;

        // If not signed in with Clerk, redirect to login
        if (!isClerkSignedIn) {
            router.push('/login');
            return;
        }

        const token = localStorage.getItem('authToken');

        // If no token but Clerk is signed in, need to sync with backend
        if (!token) {
            router.push('/auth-callback');
            return;
        }

        let isRedirecting = false;

        // Validate token and get user info
        const validateAndLoad = async () => {
            try {
                const validateRes = await fetch('/api/auth/validate', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const validateData = await validateRes.json();

                if (!validateData.success) {
                    // Token invalid - clear and redirect to auth-callback to re-sync
                    localStorage.removeItem('authToken');
                    isRedirecting = true;
                    router.push('/auth-callback');
                    return;
                }

                setUser(validateData.user);

                // Check if user has paid plan
                const userPlan = validateData.user?.plan;
                const hasPaidPlan = userPlan && (
                    (userPlan.price > 0 && !userPlan.isDefaultFreePlan) ||
                    userPlan.isLifetime ||
                    (userPlan.isTrialPlan && validateData.user?.trialEndsAt && new Date(validateData.user.trialEndsAt) > new Date())
                );

                // For free users: redirect to plans ONCE after login, then let them use dashboard
                if (!hasPaidPlan) {
                    const redirectKey = 'kommentify_plans_redirect_done';
                    if (!sessionStorage.getItem(redirectKey)) {
                        sessionStorage.setItem(redirectKey, 'true');
                        isRedirecting = true;
                        router.push('/plans');
                        return;
                    }
                }

                // Fetch usage data (non-blocking)
                try {
                    const usageRes = await fetch('/api/usage/daily', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const usageData = await usageRes.json();
                    if (usageData?.success) {
                        setUsage(usageData);
                    }
                } catch (usageErr) {
                    console.error('Failed to fetch usage:', usageErr);
                }
            } catch (err) {
                console.error('Dashboard auth error:', err);
                // Only redirect to auth-callback on auth failure, not network errors
                // Check if token is still valid by trying refresh
                try {
                    const refreshRes = await fetch('/api/auth/refresh', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token })
                    });
                    const refreshData = await refreshRes.json();
                    if (refreshData.success && refreshData.token) {
                        localStorage.setItem('authToken', refreshData.token);
                        // Retry validation with new token
                        window.location.reload();
                        return;
                    }
                } catch (refreshErr) {
                    // Refresh also failed
                }
                localStorage.removeItem('authToken');
                isRedirecting = true;
                router.push('/auth-callback');
            } finally {
                if (!isRedirecting) {
                    setLoading(false);
                }
            }
        };

        validateAndLoad();
        loadVoyagerData(); // Load LinkedIn Voyager data on overview tab

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
            .catch(() => { });
    }, [isClerkLoaded, isClerkSignedIn, loggingOut, router]);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy to clipboard:', e);
            showToast('Failed to copy to clipboard', 'error');
        }
    };

    // User goals functions (for WriterTabNew)
    const loadUserGoals = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setGoalsLoading(true);
        try {
            const res = await fetch('/api/user-goals', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success && data.goals) {
                setUserGoal(data.goals.goal || '');
                setUserTargetAudience(data.goals.targetAudience || '');
                setUserWritingStyle(data.goals.writingStyle || '');
                setUserWritingStyleSource(data.goals.writingStyleSource || 'user_default');
            }
        } catch (e) { console.error('Failed to load user goals:', e); } finally { setGoalsLoading(false); }
    };

    const saveUserGoals = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/user-goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ goal: userGoal, targetAudience: userTargetAudience, writingStyle: userWritingStyle, writingStyleSource: userWritingStyleSource }),
            });
            const data = await res.json();
            if (data.success) showToast('Strategy saved!', 'success');
            else showToast('Failed to save', 'error');
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
    };

    const suggestGoals = async () => {
        if (isFreePlan) { setShowUpgradeModal(true); return; }
        if (!voyagerData) { showToast('Please sync your LinkedIn profile first', 'error'); return; }
        setGoalsSuggesting(true);
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/ai/suggest-goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    profileData: {
                        headline: voyagerData.headline,
                        about: voyagerData.about,
                        experience: voyagerData.experience,
                        skills: voyagerData.skills,
                    }
                }),
            });
            const data = await res.json();
            if (data.success) {
                if (data.goal) setUserGoal(data.goal);
                if (data.targetAudience) setUserTargetAudience(data.targetAudience);
                if (data.writingStyle) setUserWritingStyle(data.writingStyle);
                showToast('Strategy suggested! Review and save.', 'success');
            } else {
                showToast(data.error || 'Failed to suggest', 'error');
            }
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
        finally { setGoalsSuggesting(false); }
    };

    // Writer functions
    const generatePost = async () => {
        if (isFreePlan) { setShowUpgradeModal(true); return; }
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
                    useProfileData: useProfileData && linkedInProfile,
                    profileData: useProfileData && linkedInProfile ? {
                        headline: linkedInProfile.headline,
                        about: linkedInProfile.about,
                        skills: linkedInProfile.skills,
                        experience: linkedInProfile.experience,
                        education: linkedInProfile.education,
                        posts: linkedInProfile.posts
                    } : null,
                    model: writerModel
                }),
            });
            const data = await res.json();
            if (data.success && data.content) {
                setWriterContent(data.content);
                // Auto-save to localStorage for persistence
                localStorage.setItem('savedWriterContent', data.content);
                localStorage.setItem('savedWriterTopic', writerTopic);
                setWriterStatus(`Post generated using ${data.model || writerModel}! Review and edit as needed.`);
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
        } catch (e) { console.error('Failed to load drafts:', e); }
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
        } catch (e) { console.error('Failed to load scheduled posts:', e); }
    };

    const [writerPosting, setWriterPosting] = useState(false);
    const sendToExtension = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !writerContent.trim()) { setWriterStatus('No content to post'); return; }
        setWriterPosting(true);

        // Use LinkedIn API via extension - fast and reliable
        showToast('Posting via LinkedIn...', 'info');
        setWriterStatus('Posting...');
        try {
            const cmdData: any = { content: writerContent };

            // For media, include blob URL and type
            if (writerMediaBlobUrl) {
                cmdData.mediaUrl = writerMediaBlobUrl;
                cmdData.imageUrl = writerMediaBlobUrl;
                cmdData.mediaType = writerMediaType;
                cmdData.hasImage = writerMediaType === 'image';
                cmdData.hasVideo = writerMediaType === 'video';
            } else if (writerImageUrl) {
                cmdData.hasImage = true;
                cmdData.imageUrl = writerImageUrl;
            }

            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ command: 'post_via_voyager', data: cmdData }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text.includes('413') || text.includes('Too Large') ? 'Image too large. Please use a smaller image.' : 'Server error');
            }

            const data = await res.json();
            if (data.success) {
                setWriterStatus('✅ Posting... Check Tasks for status.');
                showToast('Post command sent! Extension will post to LinkedIn.', 'success');
                await saveToHistory('published_post', 'LinkedIn Post', { content: writerContent, source: 'linkedin', hasImage: !!writerImageUrl || !!writerMediaBlobUrl });
                // Clear content after successful send
                setWriterContent('');
                setWriterImageFile(null);
                setWriterImageUrl('');
                setWriterMediaBlobUrl('');
                setWriterMediaType('');
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
        
        const scheduledFor = new Date(`${writerScheduleDate}T${writerScheduleTime}`).toISOString();
        
        // Option 1: Use LinkedIn's native scheduling via API (faster, more reliable)
        showToast('Scheduling via LinkedIn...', 'info');
        setWriterStatus('Scheduling...');
        
        try {
            // Send schedule command to extension
            const cmdRes = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ 
                    command: 'linkedin_schedule_via_api', 
                    data: { 
                        content: writerContent, 
                        scheduledTime: scheduledFor,
                        mediaUrl: writerMediaBlobUrl || null,
                        mediaType: writerMediaType || null
                    } 
                }),
            });
            const cmdData = await cmdRes.json();
            
            if (cmdData.success) {
                // Also save to database for tracking
                await fetch('/api/post-drafts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ content: writerContent, topic: writerTopic, template: writerTemplate, tone: writerTone, scheduledFor, mediaUrl: writerMediaBlobUrl || null, mediaType: writerMediaType || null, status: 'scheduled_via_linkedin' }),
                });
                
                setWriterStatus('✅ Post scheduled via LinkedIn! Check Tasks for status.');
                showToast('Post scheduled via LinkedIn!', 'success');
                loadScheduledPosts();
                setWriterScheduleDate('');
                setWriterScheduleTime('');
                setWriterContent('');
                setWriterTopic('');
                setWriterImageFile(null);
                setWriterImageUrl('');
                setWriterMediaBlobUrl('');
                setWriterMediaType('');
            } else {
                setWriterStatus(cmdData.error || 'Failed to schedule');
                showToast(cmdData.error || 'Failed to schedule', 'error');
            }
        } catch (e: any) { 
            setWriterStatus('Error: ' + e.message); 
            showToast('Error: ' + e.message, 'error');
        }
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
        } catch (e) { console.error('Failed to delete draft:', e); }
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
                const d = new Date(); d.setHours(0, 0, 0, 0);
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
        } catch (e) { console.error('Failed to load saved posts:', e); } finally { setSavedPostsLoading(false); }
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
        } catch (e) { console.error('Failed to delete saved post:', e); }
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
        } catch (e) { console.error('Failed to load feed schedule:', e); } finally { setFeedScheduleLoading(false); }
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
        } catch (e) { console.error('Failed to save feed schedule:', e); }
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
        } catch (e) { console.error('Failed to load inspiration sources:', e); } finally { setInspirationLoading(false); }
    };

    const scrapeInspirationProfiles = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) { setInspirationStatus('Not authenticated'); return; }
        const urls = cleanLinkedInProfileUrls(inspirationProfiles);
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
            setInspirationStatus(`${urls.length} profile(s) queued for scraping! Extension will process them.`);
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
        } catch (e) { console.error('Failed to delete inspiration source:', e); }
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
        } catch (e) { console.error('Failed to load shared posts:', e); } finally { setSharedPostsLoading(false); }
    };
    const loadSharedInspProfiles = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/shared/inspiration-profiles', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setSharedInspProfiles(data.profiles || []);
        } catch (e) { console.error('Failed to load shared inspiration profiles:', e); }
    };
    const loadSharedCommentProfiles = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const res = await fetch('/api/shared/comment-profiles', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setSharedCommentProfiles(data.profiles || []);
        } catch (e) { console.error('Failed to load shared comment profiles:', e); }
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
        } catch (e) { console.error('Failed to load comment style profiles:', e); } finally { setCommentStyleLoading(false); }
    };

    const commentScrapeIntervalRef = useRef<any>(null);
    const scrapeCommentStyle = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const url = cleanLinkedInProfileUrl(commentStyleUrl);
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
                setCommentStyleStatus('Scraping in progress... Extension is collecting comments.');
                showToast('Comment scraping started!', 'info');
                setCommentStyleUrl('');
                // Poll for command completion every 5 seconds
                if (commentScrapeIntervalRef.current) clearInterval(commentScrapeIntervalRef.current);
                const commandId = data.commandId;
                let pollCount = 0;
                commentScrapeIntervalRef.current = setInterval(async () => {
                    pollCount++;
                    try {
                        const statusRes = await fetch('/api/extension/command/all', { headers: { 'Authorization': `Bearer ${token}` } });
                        const statusData = await statusRes.json();
                        const cmd = statusData.commands?.find((c: any) => c.id === commandId);
                        if (cmd) {
                            if (cmd.status === 'completed') {
                                clearInterval(commentScrapeIntervalRef.current);
                                commentScrapeIntervalRef.current = null;
                                setCommentStyleScraping(false);
                                setCommentStyleStatus('Scraping complete! Comments saved.');
                                showToast('Comment scraping complete!', 'success');
                                loadCommentStyleProfiles();
                            } else if (cmd.status === 'failed' || cmd.status === 'cancelled') {
                                clearInterval(commentScrapeIntervalRef.current);
                                commentScrapeIntervalRef.current = null;
                                setCommentStyleScraping(false);
                                setCommentStyleStatus(`Scraping ${cmd.status}.`);
                                showToast(`Comment scraping ${cmd.status}`, 'error');
                            } else {
                                setCommentStyleStatus(`Scraping in progress... (${pollCount * 5}s elapsed)`);
                            }
                        }
                    } catch (e) { console.error('Error polling comment scrape status:', e); }
                    // Timeout after 3 minutes
                    if (pollCount > 36) {
                        clearInterval(commentScrapeIntervalRef.current);
                        commentScrapeIntervalRef.current = null;
                        setCommentStyleScraping(false);
                        setCommentStyleStatus('Scraping timed out. Check extension logs.');
                        loadCommentStyleProfiles(); // Try loading anyway
                    }
                }, 5000);
            } else {
                setCommentStyleScraping(false);
                setCommentStyleStatus(data.error || 'Failed to send command');
                showToast(data.error || 'Failed', 'error');
            }
        } catch (e: any) { setCommentStyleScraping(false); setCommentStyleStatus('Error: ' + e.message); }
    };

    const loadProfileComments = async (profileId: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setCommentStyleCommentsLoading(true);
        try {
            const res = await fetch(`/api/scraped-comments?profileId=${profileId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setCommentStyleComments(data.comments || []);
        } catch (e) { console.error('Failed to load profile comments:', e); } finally { setCommentStyleCommentsLoading(false); }
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
        } catch (e) { console.error('Failed to toggle comment top status:', e); }
    };

    const toggleProfileSelect = async (profileId: string) => {
        // Optimistic update - immediately update UI
        const profile = commentStyleProfiles.find(p => p.id === profileId);
        if (!profile) return;

        const newSelectedState = !profile.isSelected;
        setCommentStyleProfiles(prev => prev.map(p => p.id === profileId ? { ...p, isSelected: newSelectedState } : p));

        // Sync with server in background
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/scraped-comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action: 'toggleSelect', profileId }),
            });
        } catch (e) {
            // Revert on error
            setCommentStyleProfiles(prev => prev.map(p => p.id === profileId ? { ...p, isSelected: !newSelectedState } : p));
        }
    };

    const deleteCommentStyleProfile = async (profileId: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch(`/api/scraped-comments?profileId=${profileId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            setCommentStyleProfiles(prev => prev.filter(p => p.id !== profileId));
            if (commentStyleExpanded === profileId) { setCommentStyleExpanded(null); setCommentStyleComments([]); }
            showToast('Profile and comments deleted', 'success');
        } catch (e) { console.error('Failed to delete comment style profile:', e); }
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
                setCsUseProfileData(data.settings.useProfileData === true);
                setCsGoal(data.settings.goal || 'AddValue');
                setCsTone(data.settings.tone || 'Friendly');
                setCsLength(data.settings.commentLength || 'Short');
                setCsStyle(data.settings.commentStyle || 'direct');
                setCsModel(data.settings.model || 'gpt-4o');
                setCsExpertise(data.settings.userExpertise || '');
                setCsBackground(data.settings.userBackground || '');
                setCsAutoPost(data.settings.aiAutoPost || 'manual');
            }
        } catch (e) { console.error('Failed to load comment settings:', e); } finally { setCsSettingsLoading(false); }
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
                    useProfileData: csUseProfileData,
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
                // Select all items by default for AI inspiration
                const allItems: string[] = [
                    ...(data.data.posts || []),
                    ...(data.data.experience || []),
                    ...(data.data.education || []),
                    ...(data.data.skills || []),
                    ...(data.data.certifications || []),
                    ...(data.data.projects || []),
                    ...(data.data.interests || [])
                ];
                setSelectedInspirationPosts(allItems);

                // Auto-fill Target Audience and Background if they are currently empty
                if (!writerTargetAudience && data.data.skills && Array.isArray(data.data.skills) && data.data.skills.length > 0) {
                    setWriterTargetAudience(`Professionals interested in ${data.data.skills.slice(0, 3).join(', ')}`);
                }
                if (!writerBackground && data.data.headline) {
                    setWriterBackground(data.data.headline);
                }
            }
        } catch (e) { console.error('Failed to load LinkedIn profile:', e); } finally { setLinkedInProfileLoading(false); }
    };

    // Voyager data functions
    const loadVoyagerData = async () => {
        const token = localStorage.getItem('authToken');
        console.debug('[VOYAGER UI] loadVoyagerData called, token exists:', !!token);
        if (!token) return;
        setVoyagerLoading(true);
        try {
            const res = await fetch('/api/linkedin-profile', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            console.debug('[VOYAGER UI] API response:', { success: data.success, hasData: !!data.data, fields: data.data ? Object.keys(data.data) : [], linkedInUrn: data.data?.linkedInUrn, followerCount: data.data?.followerCount, voyagerLastSyncAt: data.data?.voyagerLastSyncAt });
            if (data.success && data.data) {
                const d = data.data;
                const recentPosts = Array.isArray(d.recentPosts) ? d.recentPosts : (typeof d.recentPosts === 'string' ? JSON.parse(d.recentPosts || '[]') : []);
                const experience = Array.isArray(d.experience) ? d.experience : (typeof d.experience === 'string' ? JSON.parse(d.experience || '[]') : []);
                const education = Array.isArray(d.education) ? d.education : (typeof d.education === 'string' ? JSON.parse(d.education || '[]') : []);
                const profileViewsData = d.profileViewsData
                    ? (typeof d.profileViewsData === 'string' ? JSON.parse(d.profileViewsData) : d.profileViewsData)
                    : null;
                const invitationsData = d.interests
                    ? (typeof d.interests === 'string' ? (() => { try { return JSON.parse(d.interests); } catch { return null; } })() : d.interests)
                    : null;
                const profileMetadata = d.certifications
                    ? (typeof d.certifications === 'string' ? (() => { try { return JSON.parse(d.certifications); } catch { return null; } })() : d.certifications)
                    : null;
                const topConnections = d.voyagerEmail
                    ? (typeof d.voyagerEmail === 'string' ? (() => { try { return JSON.parse(d.voyagerEmail); } catch { return null; } })() : d.voyagerEmail)
                    : null;
                const voyagerState = {
                    linkedInUrn: d.linkedInUrn,
                    linkedInUsername: d.linkedInUsername,
                    name: d.name,
                    headline: d.headline,
                    location: d.location,
                    about: d.about,
                    profileUrl: d.profileUrl,
                    profilePicture: profileViewsData?.profilePicture || '',
                    backgroundImage: profileViewsData?.backgroundImage || '',
                    followerCount: d.followerCount,
                    connectionCount: d.connectionCount,
                    profileViewsData,
                    recentPosts,
                    experience,
                    education,
                    voyagerLastSyncAt: d.voyagerLastSyncAt,
                    // New comprehensive data
                    invitationsData,
                    profileMetadata,
                    topConnections: Array.isArray(topConnections) ? topConnections : [],
                };
                console.debug('[VOYAGER UI] Setting voyagerData state:', { name: voyagerState.name, followers: voyagerState.followerCount, posts: voyagerState.recentPosts?.length, experience: voyagerState.experience?.length, education: voyagerState.education?.length, invitations: voyagerState.invitationsData, lastSync: voyagerState.voyagerLastSyncAt });
                setVoyagerData(voyagerState);
            } else {
                console.debug('[VOYAGER UI] No data returned from API:', data);
            }
        } catch (e) { console.debug('[VOYAGER UI] Failed to load data:', e); } finally { setVoyagerLoading(false); }
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

    const scanLinkedInProfile = async (forceUseAI?: boolean) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        // Check localStorage for user preference (default to AI)
        const scanMethod = localStorage.getItem('profileScanMethod') || 'ai';
        const useAI = forceUseAI !== undefined ? forceUseAI : scanMethod === 'ai';

        setLinkedInProfileScanning(true);
        setLinkedInProfileStatus(useAI
            ? 'Scanning LinkedIn profile with AI... Extension will capture and restructure your profile data.'
            : 'Scanning LinkedIn profile... Extension will open LinkedIn feed, find your profile, and extract data.');
        try {
            // Send command to extension to scan profile
            const command = useAI ? 'AI_PROFILE_RECAPTURE' : 'scan_my_linkedin_profile';
            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ command }),
            });
            const data = await res.json();
            if (data.success) {
                setLinkedInProfileStatus('Profile scan started! Check extension popup for progress. Data will appear here when complete.');
                showToast('Profile scan started! Check extension popup.', 'info');

                // Track polling state with a flag to avoid stale closure issues
                let isPollingActive = true;
                let pollIntervalId: ReturnType<typeof setInterval> | null = null;
                let timeoutId: ReturnType<typeof setTimeout> | null = null;

                // Poll for completion to update UI automatically
                pollIntervalId = setInterval(async () => {
                    try {
                        const statusRes = await fetch('/api/extension/command/all', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const statusData = await statusRes.json();
                        console.debug('📊 Dashboard polling - commands:', statusData.commands?.length, 'looking for:', data.commandId);
                        const cmd = statusData.commands?.find((c: any) => c.id === data.commandId);
                        console.debug('📊 Found command:', cmd?.command, 'status:', cmd?.status);

                        if (cmd && isPollingActive) {
                            if (cmd.status === 'completed') {
                                isPollingActive = false;
                                if (pollIntervalId) clearInterval(pollIntervalId);
                                if (timeoutId) clearTimeout(timeoutId);
                                setLinkedInProfileScanning(false);
                                setLinkedInProfileStatus('Scan completed successfully!');
                                showToast('Profile scan complete! Data loaded.', 'success');
                                loadLinkedInProfile(); // Auto-load the new data
                            } else if (cmd.status === 'failed' || cmd.status === 'cancelled') {
                                isPollingActive = false;
                                if (pollIntervalId) clearInterval(pollIntervalId);
                                if (timeoutId) clearTimeout(timeoutId);
                                setLinkedInProfileScanning(false);
                                setLinkedInProfileStatus(`Scan ${cmd.status}`);
                                showToast(`Profile scan ${cmd.status}`, 'error');
                            }
                        }
                    } catch (e) {
                        // Ignore polling errors
                    }
                }, 2000);

                // Timeout polling after 2 minutes
                timeoutId = setTimeout(() => {
                    if (isPollingActive && pollIntervalId) {
                        isPollingActive = false;
                        clearInterval(pollIntervalId);
                        setLinkedInProfileScanning(false);
                        setLinkedInProfileStatus('Scan timed out waiting for response.');
                        loadLinkedInProfile(); // Try loading anyway
                    }
                }, 120000);

            } else {
                setLinkedInProfileScanning(false);
                setLinkedInProfileStatus(data.error || 'Failed to start scan');
            }
        } catch (e: any) {
            setLinkedInProfileScanning(false);
            setLinkedInProfileStatus('Error: ' + e.message);
        }
    };

    const generateTopicSuggestions = async () => {
        if (isFreePlan) { setShowUpgradeModal(true); return; }
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

    // Content Planner functions
    const openPlanner = (mode: '7days' | '30days') => {
        if (isFreePlan) { setShowUpgradeModal(true); return; }
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        setPlannerMode(mode);
        setPlannerStep('context');
        setPlannerTopics([]);
        setPlannerSelected([]);
        setPlannerContext('');
        setPlannerDoneCount(0);
        setPlannerStatusMsg('');
        setPlannerStartDate(`${tomorrow.getFullYear()}-${mm}-${dd}`);
        plannerAbortRef.current = false;
        // Check localStorage for incomplete session
        const key = `planner_${user?.id}_${mode}`;
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const s = JSON.parse(saved);
                if (s.step === 'generating' && s.doneCount < s.total) {
                    setPlannerTopics(s.topics || []);
                    setPlannerSelected(s.selected || []);
                    setPlannerPublishTime(s.publishTime || '09:00');
                    setPlannerStartDate(s.startDate || `${tomorrow.getFullYear()}-${mm}-${dd}`);
                    setPlannerTemplate(s.template || 'thought_leadership');
                    setPlannerTone(s.tone || 'professional');
                    setPlannerLength(s.length || '1500');
                    setPlannerDoneCount(s.doneCount || 0);
                    setPlannerTotal(s.total || 0);
                    setPlannerStep('generating');
                    setPlannerOpen(true);
                    return;
                }
            }
        } catch (e) { console.error('Failed to restore planner session:', e); }
        setPlannerOpen(true);
    };

    const generatePlannerTopics = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setPlannerGeneratingTopics(true);
        setPlannerStatusMsg('');
        try {
            const profileData = linkedInProfile ? {
                name: linkedInProfile.name,
                headline: linkedInProfile.headline,
                about: linkedInProfile.about,
                skills: Array.isArray(linkedInProfile.skills) ? linkedInProfile.skills : [],
                experience: Array.isArray(linkedInProfile.experience) ? linkedInProfile.experience : [],
                posts: Array.isArray(linkedInProfile.posts) ? linkedInProfile.posts : [],
            } : null;
            const res = await fetch('/api/ai/content-planner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ mode: plannerMode, userContext: plannerContext, profileData }),
            });
            const data = await res.json();
            if (data.success) {
                setPlannerTopics(data.topics);
                const count = plannerMode === '7days' ? 7 : 30;
                setPlannerSelected(data.topics.map((_: string, i: number) => i < count));
                setPlannerStep('select');
            } else {
                setPlannerStatusMsg('Error: ' + data.error);
            }
        } catch (e: any) {
            setPlannerStatusMsg('Error: ' + e.message);
        } finally {
            setPlannerGeneratingTopics(false);
        }
    };

    const startPlannerGeneration = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !plannerStartDate || !plannerPublishTime) return;
        const topics = plannerTopics.filter((_, i) => plannerSelected[i]);
        if (topics.length === 0) return;
        plannerAbortRef.current = false;
        setPlannerGenerating(true);
        setPlannerDoneCount(0);
        setPlannerTotal(topics.length);
        setPlannerStep('generating');
        // Save session for disconnect resilience
        const key = `planner_${user?.id}_${plannerMode}`;
        const session = { step: 'generating', topics: plannerTopics, selected: plannerSelected, publishTime: plannerPublishTime, startDate: plannerStartDate, template: plannerTemplate, tone: plannerTone, length: plannerLength, doneCount: 0, total: topics.length };
        try { localStorage.setItem(key, JSON.stringify(session)); } catch (e) { console.error('Failed to save planner session:', e); }
        for (let i = 0; i < topics.length; i++) {
            if (plannerAbortRef.current) break;
            const topic = topics[i];
            const scheduledDate = new Date(plannerStartDate + 'T' + plannerPublishTime + ':00');
            scheduledDate.setDate(scheduledDate.getDate() + i);
            setPlannerStatusMsg(`Generating post ${i + 1} of ${topics.length}: "${topic.substring(0, 60)}..."`);
            try {
                const genRes = await fetch('/api/ai/generate-post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ topic, template: plannerTemplate, tone: plannerTone, length: plannerLength, includeHashtags: writerHashtags, includeEmojis: writerEmojis, userBackground: linkedInProfile?.headline || '', useInspirationSources: writerUseInspirationSources, model: writerModel }),
                });
                const genData = await genRes.json();
                if (!genData.success) { setPlannerStatusMsg(`Post ${i + 1} failed: ${genData.error}`); continue; }
                const schedRes = await fetch('/api/post-drafts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ content: genData.content, topic, template: plannerTemplate, tone: plannerTone, scheduledFor: scheduledDate.toISOString() }),
                });
                const schedData = await schedRes.json();
                if (schedData.success) {
                    const newCount = i + 1;
                    setPlannerDoneCount(newCount);
                    try { localStorage.setItem(key, JSON.stringify({ ...session, doneCount: newCount })); } catch (e) { console.error('Failed to update planner session:', e); }
                    loadScheduledPosts();
                }
            } catch (e: any) {
                setPlannerStatusMsg(`Error on post ${i + 1}: ${e.message}`);
            }
            await new Promise(r => setTimeout(r, 400));
        }
        setPlannerGenerating(false);
        setPlannerStep('done');
        setPlannerStatusMsg('');
        try { localStorage.removeItem(key); } catch (e) { console.error('Failed to clear planner session:', e); }
        loadScheduledPosts();
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
        } catch (e) { console.error('Failed to toggle LinkedIn profile data:', e); }
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
        } catch (e) { console.error('Failed to load automation settings:', e); } finally { setAutoSettingsLoading(false); }
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

    // Live activity log functions
    const loadLiveActivity = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setLiveActivityLoading(true);
        try {
            const res = await fetch('/api/live-activity?limit=100', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setLiveActivityLogs(data.logs || []);
        } catch (e) { console.error('Failed to load live activity:', e); } finally { setLiveActivityLoading(false); }
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
        } catch (e) { console.error('Failed to load commenter config:', e); } finally { setCommenterCfgLoading(false); }
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
        } catch (e) { console.error('Failed to load import config:', e); } finally { setImportCfgLoading(false); }
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
        } catch (e) { console.error('Failed to load tasks:', e); } finally { if (!silent) setTasksLoading(false); }
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
        } catch (e) { console.error('Failed to load referral data:', e); }
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

            const isConnected = !!data.connected;
            setExtensionConnected(isConnected);

            // Always update last seen from server data if available
            if (data.lastSeen) {
                setExtensionLastSeen(new Date(data.lastSeen));
            } else if (isConnected) {
                setExtensionLastSeen(new Date());
            }
        } catch (e) { console.error('Failed to check extension connectivity:', e); }
    };

    // Poll tasks every 15 seconds for live notifications - empty deps so interval is created once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        checkExtensionConnectivity();
        const taskInterval = setInterval(() => loadTasks(true), 15000);
        const heartbeatInterval = setInterval(() => checkExtensionConnectivity(), 15000); // Check every 15 seconds
        return () => { clearInterval(taskInterval); clearInterval(heartbeatInterval); };
    }, []);

    // Load LinkedIn OAuth status on mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) { setLinkedInOAuthLoading(false); return; }
        fetch('/api/auth/linkedin', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setLinkedInOAuth(d); })
            .catch(() => { })
            .finally(() => setLinkedInOAuthLoading(false));
    }, []);

    // Load saved writer content from localStorage on mount
    useEffect(() => {
        const savedContent = localStorage.getItem('savedWriterContent');
        const savedTopic = localStorage.getItem('savedWriterTopic');
        if (savedContent) setWriterContent(savedContent);
        if (savedTopic) setWriterTopic(savedTopic);
    }, []);

    // Auto-fill expertise and background from LinkedIn profile data for both Writer and Comments tabs
    useEffect(() => {
        if (!linkedInProfile) return;

        // Auto-fill writer background if empty
        if (!writerBackground && linkedInProfile.headline) {
            setWriterBackground(linkedInProfile.headline);
        }

        // Auto-fill comment settings expertise and background if empty
        if (!csExpertise && linkedInProfile.headline) {
            const expertise = linkedInProfile.headline.split('|')[0]?.trim() || linkedInProfile.headline.substring(0, 50);
            setCsExpertise(expertise);
        }
        if (!csBackground && linkedInProfile.about) {
            const background = linkedInProfile.about.substring(0, 100);
            setCsBackground(background);
        }
    }, [linkedInProfile]);

    // Load tab-specific data on initial mount when auth completes (fixes ?tab=import reload)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (loading || !user) return;
        const tab = activeTab;
        if (tab === 'writer') { loadDrafts(); loadInspirationSources(); loadSharedInspProfiles(); loadLinkedInProfile(); loadScheduledPosts(); fetchAIModels(); }
        if (tab === 'comments') { loadCommentSettings(); loadCommentStyleProfiles(); loadSharedCommentProfiles(); loadLinkedInProfile(); fetchAIModels(); }
        if (tab === 'commenter') { loadCommenterCfg(); loadCommentSettings(); }
        if (tab === 'trending-posts') { loadSavedPosts(); loadSharedPosts(); loadFeedSchedule(); }
        if (tab === 'tasks') loadTasks();
        if (tab === 'history') loadHistory();
        if (tab === 'analytics') loadAnalytics();
        if (tab === 'limits') { loadAutoSettings(); loadLiveActivity(); }
        if (tab === 'activity') loadLiveActivity();
        if (tab === 'import') loadImportCfg();
        if (tab === 'referrals') loadReferralData();
        if (tab === 'account') loadAccountSettings();
    }, [loading, user, activeTab]);

    // Feed scrape polling - poll command status every 3 seconds while scraping
    const startFeedScrapePolling = (commandId: string) => {
        setFeedScrapeCommandId(commandId);
        setFeedScrapePolling(true);
        setFeedScrapeStatus({ status: 'pending', data: { message: 'Waiting for extension to pick up task...' } });
        if (feedScrapeIntervalRef.current) clearInterval(feedScrapeIntervalRef.current);
        feedScrapeIntervalRef.current = setInterval(async () => {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            try {
                const res = await fetch('/api/extension/command/all', { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await res.json();
                if (data.success && data.commands) {
                    const cmd = data.commands.find((c: any) => c.id === commandId);
                    if (cmd) {
                        setFeedScrapeStatus(cmd);
                        if (cmd.status === 'completed' || cmd.status === 'failed' || cmd.status === 'cancelled') {
                            clearInterval(feedScrapeIntervalRef.current);
                            feedScrapeIntervalRef.current = null;
                            setFeedScrapePolling(false);
                            if (cmd.status === 'completed') {
                                showToast(`Feed scrape complete! ${cmd.data?.postsFound || 0} posts saved.`, 'success');
                                loadSavedPosts();
                            } else if (cmd.status === 'failed') {
                                showToast(cmd.data?.message || 'Feed scrape failed', 'error');
                            }
                        }
                    }
                }
            } catch (e) { console.error('Error polling feed scrape status:', e); }
        }, 3000);
    };
    const stopFeedScrape = async () => {
        if (!feedScrapeCommandId) return;
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch('/api/extension/command', { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ commandId: feedScrapeCommandId, status: 'cancelled' }) });
            if (feedScrapeIntervalRef.current) { clearInterval(feedScrapeIntervalRef.current); feedScrapeIntervalRef.current = null; }
            setFeedScrapePolling(false);
            setFeedScrapeStatus(null);
            setFeedScrapeCommandId(null);
            showToast('Feed scrape stopped', 'info');
        } catch (e) { console.error('Failed to stop feed scrape:', e); }
    };
    useEffect(() => {
        return () => {
            if (feedScrapeIntervalRef.current) clearInterval(feedScrapeIntervalRef.current);
            if (commentScrapeIntervalRef.current) clearInterval(commentScrapeIntervalRef.current);
        };
    }, []);

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
        } catch (e) { console.error('Failed to stop all tasks:', e); }
    };

    // Trending AI generation
    const generateTrendingPosts = async () => {
        if (isFreePlan) { setShowUpgradeModal(true); return; }
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
                    model: trendingModel,
                    useProfileData: trendingUseProfileData,
                    profileData: trendingUseProfileData ? linkedInProfile : null
                }),
            });
            const data = await res.json();
            if (data.success && data.posts) {
                setTrendingGeneratedPosts(data.posts);
                setTrendingShowGenPreview(true);
                setTrendingStatus(`Generated ${data.posts.length} viral posts using ${data.model || trendingModel}!`);
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
        if (isFreePlan) { setShowUpgradeModal(true); return; }
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
                setTrendingStatus('Analysis complete!');
                // Save to history
                await saveToHistory('viral_analysis', 'Viral Potential Analysis', data.analysis, { postCount: allPosts.length, aiPostCount: aiPostIndices.length });
            } else setTrendingStatus(data.error || 'Analysis failed');
        } catch (e: any) { setTrendingStatus('Error: ' + e.message); }
        finally { setAnalysisLoading(false); }
    };

    // Toast notification helper
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        // Clear any existing toast timeout to prevent memory leaks
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        setToast({ message, type });
        toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
            toastTimeoutRef.current = null;
        }, 4000);
    };

    // Analytics functions
    const loadAnalytics = async (periodOverride?: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setAnalyticsLoading(true);
        try {
            const period = periodOverride || analyticsPeriod;
            const res = await fetch(`/api/analytics?period=${period}`, {
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
        } catch (e) { console.error('Failed to load history:', e); } finally { setHistoryLoading(false); }
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
        } catch (e) { console.error('Failed to save to history:', e); }
    };

    const deleteHistoryItem = async (id: string) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            await fetch(`/api/history?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            loadHistory(historyPage);
        } catch (e) { console.error('Failed to delete history item:', e); }
    };

    const postGeneratedToLinkedIn = async (content: string, imageDataUrl?: string, postIndex?: number) => {
        const token = localStorage.getItem('authToken');
        if (!token || !content.trim()) return;
        if (postIndex !== undefined) setPostingToLinkedIn(prev => ({ ...prev, [postIndex]: true }));
        showToast('Sending post to extension...', 'info');
        try {
            const cmdData: any = { content };

            // For images, send via CustomEvent to content script which can access chrome.storage
            if (imageDataUrl) {
                cmdData.hasImage = true;
                window.dispatchEvent(new CustomEvent('kommentify-post-to-linkedin', {
                    detail: { content, hasImage: true, imageDataUrl }
                }));
            } else {
                window.dispatchEvent(new CustomEvent('kommentify-post-to-linkedin', { detail: cmdData }));
            }

            const res = await fetch('/api/extension/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ command: 'post_to_linkedin', data: cmdData }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text.includes('413') || text.includes('Too Large') ? 'Image too large. Please use a smaller image.' : 'Server error');
            }

            const data = await res.json();
            if (data.success) {
                showToast('Post sent to extension! It will auto-open LinkedIn.', 'success');
                setTrendingStatus('Post sent to extension! It will auto-open LinkedIn.');
                // Save to history as published post
                await saveToHistory('published_post', 'LinkedIn Post', { content, hasImage: !!imageDataUrl });
            } else {
                showToast(data.error || 'Failed to send', 'error');
                setTrendingStatus(data.error || 'Failed');
            }
        } catch (e: any) {
            console.error("Post error:", e);
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
        if (tabId === 'overview') { loadVoyagerData(); }
        if (tabId === 'writer') { loadDrafts(); loadInspirationSources(); loadSharedInspProfiles(); loadLinkedInProfile(); loadScheduledPosts(); fetchAIModels(); }
        if (tabId === 'comments') { loadCommentSettings(); loadCommentStyleProfiles(); loadSharedCommentProfiles(); loadLinkedInProfile(); fetchAIModels(); }
        if (tabId === 'commenter') { loadCommenterCfg(); loadCommentSettings(); }
        if (tabId === 'trending-posts') { loadSavedPosts(); loadSharedPosts(); loadFeedSchedule(); }
        if (tabId === 'tasks') loadTasks();
        if (tabId === 'history') loadHistory();
        if (tabId === 'limits') { loadAutoSettings(); loadLiveActivity(); }
        if (tabId === 'activity') loadLiveActivity();
        if (tabId === 'import') loadImportCfg();
        if (tabId === 'analytics') loadAnalytics();
        if (tabId === 'referrals') loadReferralData();
        if (tabId === 'account') loadAccountSettings();
    };

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
                    <div style={{ marginBottom: '20px' }}>{miniIcon('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9', '#a78bfa', 48)}</div>
                    <div style={{ fontSize: '18px', opacity: 0.8 }}>{t('common.loggingOut')}</div>
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
                    <div style={{ marginBottom: '20px', animation: 'spin 1s linear infinite' }}>{miniIcon('M13 2L3 14h9l-1 8 10-12h-9l1-8z', '#a78bfa', 48)}</div>
                    <div style={{ fontSize: '18px', opacity: 0.8 }}>{t('common.loading')}</div>
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

    // Navigation items with grouped sections
    const navItems = [
        { id: 'overview', label: t('nav.overview'), icon: svgIcon('M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10'), section: 'dashboard' },
        // Posts section - Rearranged with Personalized first
        { id: 'writer', label: t('nav.personalizedPostWriter'), icon: svgIcon('M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'), section: 'posts' },
        { id: 'trending-posts', label: t('nav.viralPostsWriter'), icon: svgIcon('M13 2L3 14h9l-1 8 10-12h-9l1-8z'), section: 'posts', badge: 'BETA' },
        // Comments section
        { id: 'commenter', label: t('nav.autoCommenter'), icon: svgIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'), section: 'comments' },
        { id: 'comments', label: t('nav.commentsSettings'), icon: svgIcon('M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'), section: 'comments' },
        { id: 'import', label: t('nav.importProfiles'), icon: svgIcon('M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8.5 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M20 8v6 M23 11h-6'), section: 'comments' },
        // Other
        { id: 'limits', label: t('nav.limitsDelays'), icon: svgIcon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'), section: 'management' },
        { id: 'tasks', label: t('nav.tasks'), icon: svgIcon('M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'), section: 'management' },
        { id: 'activity', label: t('nav.activityLogs'), icon: svgIcon('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8'), section: 'management' },
        { id: 'history', label: t('nav.history'), icon: svgIcon('M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'), section: 'management' },
    ];

    const accountItems = [
        { id: 'analytics', label: t('nav.analytics'), icon: svgIcon('M3 3v18h18 M9 17V9 M13 17V5 M17 17v-4 M5 17v-2') },
        { id: 'usage', label: t('nav.usageLimits'), icon: svgIcon('M18 20V10 M12 20V4 M6 20v-6') },
        { id: 'referrals', label: t('nav.referrals'), icon: svgIcon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z') },
        { id: 'extension', label: t('nav.extension'), icon: svgIcon('M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z') },
    ];

    const settingsItems = [
        { id: 'account', label: t('nav.account'), icon: svgIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z') },
        { id: 'billing', label: t('nav.billing'), icon: svgIcon('M1 4h22v16H1z M1 10h22'), action: () => router.push('/plans') },
    ];


    // ---- Tab Props: pass all state and functions to tab components ----
    const tabProps = {
        // Core
        t, user, usage, router, miniIcon, showToast, setActiveTab, isFreePlan, showUpgradeModal, setShowUpgradeModal, dashLang, isDeveloper, isAdmin, adminModelSettings,
        // Writer
        writerTopic, setWriterTopic, writerTemplate, setWriterTemplate, writerTone, setWriterTone,
        writerLength, setWriterLength, writerHashtags, setWriterHashtags, writerEmojis, setWriterEmojis,
        writerLanguage, setWriterLanguage, writerAdvancedOpen, setWriterAdvancedOpen,
        writerTargetAudience, setWriterTargetAudience, writerKeyMessage, setWriterKeyMessage,
        writerBackground, setWriterBackground, writerContent, setWriterContent,
        writerGenerating, setWriterGenerating, writerScheduleDate, setWriterScheduleDate, writerScheduleTime, setWriterScheduleTime,
        writerDrafts, writerScheduledPosts, writerTokenUsage, writerImageFile, setWriterImageFile,
        writerImageUrl, setWriterImageUrl, writerMediaBlobUrl, setWriterMediaBlobUrl,
        writerMediaType, setWriterMediaType, writerUploading, setWriterUploading,
        writerPreviewMode, setWriterPreviewMode, writerPreviewExpanded, setWriterPreviewExpanded,
        writerUseLinkedInAPI, setWriterUseLinkedInAPI, fileInputRef, writerStatus, setWriterStatus, writerModel,
        writerUseInspirationSources, setWriterUseInspirationSources, writerInspirationSourceNames,
        writerPosting, MODEL_OPTIONS, handleWriterModelChange,
        userGoal, setUserGoal, userTargetAudience, setUserTargetAudience,
        userWritingStyle, setUserWritingStyle, userWritingStyleSource, setUserWritingStyleSource,
        goalsLoading, goalsSuggesting, loadUserGoals, saveUserGoals, suggestGoals,
        generatePost, saveDraft, loadDrafts, loadScheduledPosts, sendToExtension, schedulePost, deleteDraft,
        // Saved posts
        savedPosts, savedPostsLoading, savedPostsPage, setSavedPostsPage, savedPostsTotal,
        savedPostsSortBy, setSavedPostsSortBy, savedPostsSortOrder, setSavedPostsSortOrder,
        savedPostsSearch, setSavedPostsSearch, loadSavedPosts, deleteSavedPost,
        // Feed schedule
        feedSchedule, feedScheduleLoading, scheduleTimesInput, setScheduleTimesInput,
        scheduleDuration, setScheduleDuration, scheduleMinLikes, setScheduleMinLikes,
        scheduleMinComments, setScheduleMinComments, scheduleKeywords, setScheduleKeywords,
        scheduleActive, setScheduleActive, loadFeedSchedule, saveFeedSchedule,
        feedScrapeCommandId, feedScrapeStatus, feedScrapePolling, startFeedScrapePolling, stopFeedScrape,
        // Tasks
        tasks, tasksLoading, taskNotifications, taskStatusExpanded, setTaskStatusExpanded,
        taskCounts, loadTasks, addTaskNotification, stopAllTasks,
        // Trending
        trendingPeriod, setTrendingPeriod, trendingSelectedPosts, setTrendingSelectedPosts,
        trendingGenerating, trendingCustomPrompt, setTrendingCustomPrompt,
        trendingIncludeHashtags, setTrendingIncludeHashtags, trendingLanguage, setTrendingLanguage,
        trendingGeneratedPosts, trendingShowGenPreview, setTrendingShowGenPreview,
        trendingStatus, trendingModel, setTrendingModel, trendingTokenUsage,
        trendingUseProfileData, setTrendingUseProfileData,
        generateTrendingPosts, analyzePosts, analysisResults, analysisLoading, showAnalysis, setShowAnalysis,
        generatedPostImages, setGeneratedPostImages, postingToLinkedIn, postGeneratedToLinkedIn, handleImageAttach,
        // History
        historyItems, historyLoading, historyFilter, setHistoryFilter, historyPage, setHistoryPage,
        historyTotal, loadHistory, deleteHistoryItem,
        // Inspiration
        inspirationProfiles, setInspirationProfiles, inspirationPostCount, setInspirationPostCount,
        inspirationScraping, inspirationStatus, inspirationSources, inspirationLoading,
        inspirationUseAll, setInspirationUseAll, inspirationSelected, setInspirationSelected,
        inspirationDeleteMode, setInspirationDeleteMode, inspirationDeleteSelected, setInspirationDeleteSelected,
        useProfileData, setUseProfileData, showInspirationPopup, setShowInspirationPopup,
        showSharedProfilesPopup, setShowSharedProfilesPopup,
        loadInspirationSources, scrapeInspirationProfiles, deleteInspirationSource,
        selectedInspirationPosts, setSelectedInspirationPosts, toggleInspirationPost,
        viewingProfilePosts, setViewingProfilePosts, profilePostsData, setProfilePostsData, profilePostsLoading, loadProfilePosts,
        // Comment style
        commentStyleProfiles, commentStyleLoading, commentStyleUrl, setCommentStyleUrl,
        commentStyleScraping, commentStyleStatus, commentStyleExpanded, setCommentStyleExpanded,
        commentStyleComments, commentStyleCommentsLoading,
        csUseProfileStyle, setCsUseProfileStyle, csUseProfileData, setCsUseProfileData,
        csGoal, setCsGoal, csTone, setCsTone, csLength, setCsLength, csStyle, setCsStyle,
        csModel, setCsModel, csExpertise, setCsExpertise, csBackground, setCsBackground,
        csAutoPost, setCsAutoPost, csSettingsLoading, csSettingsSaving,
        loadCommentStyleProfiles, scrapeCommentStyle, loadProfileComments, toggleCommentTop,
        toggleProfileSelect, deleteCommentStyleProfile, loadCommentSettings, saveCommentSettings,
        handleCommentModelChange,
        // Shared content
        sharedPosts, sharedPostsLoading, sharedInspProfiles, sharedCommentProfiles,
        loadSharedPosts, loadSharedInspProfiles, loadSharedCommentProfiles,
        // Automation settings
        autoSettings, autoSettingsLoading, autoSettingsSaving, loadAutoSettings, saveAutoSettings,
        // Activity
        liveActivityLogs, liveActivityLoading, showLogsPopup, setShowLogsPopup, loadLiveActivity,
        // Commenter
        commenterCfg, commenterCfgLoading, commenterCfgSaving, loadCommenterCfg, saveCommenterCfg,
        // Import
        importCfg, importCfgLoading, importCfgSaving, loadImportCfg, saveImportCfg,
        // LinkedIn profile
        linkedInProfile, linkedInProfileLoading, linkedInProfileScanning, linkedInProfileStatus,
        linkedInUseProfileData, setLinkedInUseProfileData, linkedInTopicSuggestions, linkedInGeneratingTopics,
        showLinkedInDataModal, setShowLinkedInDataModal, showFullPageText, setShowFullPageText,
        rescanningMissing, setRescanningMissing, editingSection, setEditingSection, editValue, setEditValue,
        loadLinkedInProfile, deleteLinkedInProfile, scanLinkedInProfile,
        generateTopicSuggestions, selectTopicSuggestion, toggleLinkedInProfileData,
        // Planner
        plannerOpen, setPlannerOpen, plannerMode, setPlannerMode, plannerStep, setPlannerStep,
        plannerContext, setPlannerContext, plannerTopics, setPlannerTopics,
        plannerSelected, setPlannerSelected, plannerGeneratingTopics,
        plannerPublishTime, setPlannerPublishTime, plannerStartDate, setPlannerStartDate,
        plannerTemplate, setPlannerTemplate, plannerTone, setPlannerTone,
        plannerLength, setPlannerLength, plannerGenerating, plannerDoneCount, plannerTotal,
        plannerStatusMsg, plannerAbortRef,
        openPlanner, generatePlannerTopics, startPlannerGeneration,
        // Voyager
        voyagerData, voyagerLoading, voyagerSyncing, setVoyagerSyncing, loadVoyagerData,
        // Analytics
        analyticsData, analyticsLoading, analyticsPeriod, setAnalyticsPeriod,
        analyticsAutoSearch, setAnalyticsAutoSearch, analyticsNetworkSearch, setAnalyticsNetworkSearch,
        analyticsImportSearch, setAnalyticsImportSearch, analyticsLeadsSearch, setAnalyticsLeadsSearch,
        analyticsAutoFilter, setAnalyticsAutoFilter, analyticsNetworkFilter, setAnalyticsNetworkFilter,
        loadAnalytics,
        // Referral
        referralData, copied, setCopied, showReferrals, setShowReferrals, copyToClipboard, loadReferralData,
        // Extension
        extensionConnected, extensionLastSeen, checkExtensionConnectivity,
        // Account
        linkedInOAuth, linkedInOAuthLoading, theme, setTheme,
        calendarMonth, setCalendarMonth, calendarYear, setCalendarYear,
        // Other
        signOut, loggingOut, setLoggingOut, sidebarCollapsed,
        // Additional (used by AccountTab and ActivityTab)
        changeDashboardLanguage, setLinkedInOAuth, setLinkedInProfileScanning, setLinkedInProfile,
        SUPPORTED_LANGUAGES, setLiveActivityLogs, setLiveActivityLoading,
        setCommenterCfg, setCommentStyleComments, setImportCfg, setAutoSettings,
        setTrendingStatus, setFeedScrapeStatus, setFeedScrapeCommandId, setTrendingGeneratedPosts, setPlannerGenerating,
    };
    return (
        <div data-theme={theme} style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            minHeight: '100vh',
            background: theme === 'light' ? 'linear-gradient(135deg, #f8f9fc 0%, #eef1f8 100%)' : theme === 'dark' ? 'linear-gradient(135deg, #0a0a1a 0%, #111128 100%)' : 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
            color: theme === 'light' ? '#1a1a2e' : 'white',
            display: 'flex'
        }}>
            {/* Upgrade Plan Modal for Free Users */}
            {showUpgradeModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10001,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} onClick={() => setShowUpgradeModal(false)}>
                    <div onClick={(e) => e.stopPropagation()} style={{
                        background: 'linear-gradient(135deg, #1a1a3e 0%, #0f0f23 100%)',
                        borderRadius: '24px', padding: '40px', maxWidth: '480px', width: '90%',
                        border: '2px solid rgba(105,63,233,0.4)', boxShadow: '0 25px 80px rgba(105,63,233,0.3)',
                        textAlign: 'center', position: 'relative'
                    }}>
                        <button onClick={() => setShowUpgradeModal(false)} style={{
                            position: 'absolute', top: '16px', right: '16px', background: 'none',
                            border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '20px', cursor: 'pointer'
                        }}>✕</button>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
                            Upgrade Your Plan
                        </h2>
                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '24px' }}>
                            AI features like post generation, topic suggestions, and content analysis require a paid plan. Upgrade now to unlock the full power of Kommentify!
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => { setShowUpgradeModal(false); router.push('/plans'); }}
                                style={{
                                    padding: '14px 32px', background: 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)',
                                    color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px',
                                    fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 20px rgba(105,63,233,0.4)',
                                    transition: 'transform 0.2s'
                                }}>
                                View Plans
                            </button>
                            <button onClick={() => setShowUpgradeModal(false)}
                                style={{
                                    padding: '14px 24px', background: 'rgba(255,255,255,0.1)',
                                    color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                                }}>
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                    <span>{tn.type === 'success' ? miniIcon('M9 11l3 3L22 4', 'white', 13) : tn.type === 'error' ? miniIcon('M18 6L6 18 M6 6l12 12', 'white', 13) : miniIcon('M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15', 'white', 13)}</span>
                    {tn.message}
                    <button onClick={() => setTaskNotifications(prev => prev.filter(n => n.id !== tn.id))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px', opacity: 0.7, marginLeft: '4px' }}>✕</button>
                </div>
            ))}

            {/* Persistent Task Status Boxes (top-center) */}
            <div style={{
                position: 'fixed',
                top: '18px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9998,
                display: 'flex',
                gap: '6px',
                padding: '6px 10px',
                background: 'rgba(0,0,0,0.25)',
                borderRadius: '12px',
                backdropFilter: 'blur(6px)'
            }}>
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
                {/* Logs box */}
                <div onClick={() => { if (liveActivityLogs.length === 0) loadLiveActivity(); setShowLogsPopup(true); }}
                    style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px', padding: '6px 12px', cursor: 'pointer', textAlign: 'center', minWidth: '60px', transition: 'all 0.2s', backdropFilter: 'blur(10px)', transform: showLogsPopup ? 'scale(1.05)' : 'scale(1)' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#a78bfa', lineHeight: 1 }}>{liveActivityLogs.length > 0 ? liveActivityLogs.length : miniIcon('M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7z M2 12h20', '#a78bfa', 16)}</div>
                    <div style={{ fontSize: '9px', color: '#a78bfa', fontWeight: '600', opacity: 0.8, whiteSpace: 'nowrap' }}>Logs</div>
                </div>
            </div>

            {/* Live Activity Logs Popup */}
            {showLogsPopup && (
                <>
                    <div onClick={() => setShowLogsPopup(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9997 }} />
                    <div style={{ position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)', zIndex: 9998, background: theme === 'light' ? '#fff' : '#1a1a3e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '16px', width: '520px', maxHeight: '480px', overflowY: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ color: theme === 'light' ? '#1a1a2e' : 'white', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>{miniIcon('M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7z M2 12h20', theme === 'light' ? '#1a1a2e' : 'white', 14)} Live Activity Logs</span>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button onClick={() => loadLiveActivity()} disabled={liveActivityLoading}
                                    style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '10px', cursor: 'pointer' }}>
                                    {liveActivityLoading ? '...' : 'Refresh'}
                                </button>
                                <button onClick={() => { handleTabChange('activity'); setShowLogsPopup(false); }}
                                    style={{ padding: '4px 10px', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '6px', color: '#a78bfa', fontSize: '10px', cursor: 'pointer', fontWeight: '600' }}>
                                    Open Full View
                                </button>
                                <button onClick={() => setShowLogsPopup(false)} style={{ background: 'none', border: 'none', color: theme === 'light' ? '#666' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                            </div>
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '11px', lineHeight: '1.6' }}>
                            {liveActivityLogs.length === 0 ? (
                                <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '30px', fontSize: '12px' }}>
                                    No activity logs yet. Extension will log actions here in real-time.
                                </div>
                            ) : (
                                liveActivityLogs.slice(0, 50).map((log: any) => {
                                    const icons: any = { like: 'L', comment: 'C', share: 'S', follow: 'F', connect: 'K', post: 'P', delay: 'D', start: '>', stop: 'X', error: '!', info: 'i' };
                                    const colors: any = { success: '#34d399', warning: '#fbbf24', error: '#f87171', info: 'rgba(255,255,255,0.6)' };
                                    const icon = icons[log.action] || 'i';
                                    const color = colors[log.level] || colors.info;
                                    const time = new Date(log.createdAt).toLocaleTimeString();
                                    const date = new Date(log.createdAt).toLocaleDateString();
                                    return (
                                        <div key={log.id} style={{ display: 'flex', gap: '8px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.25)', minWidth: '55px', fontSize: '9px' }}>{time}</span>
                                            <span>{icon}</span>
                                            <span style={{ color: '#a78bfa', fontSize: '9px', minWidth: '55px' }}>{log.taskType}</span>
                                            <span style={{ color, flex: 1 }}>{log.message}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}

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
                                                } catch (e) { console.error('Failed to stop task:', e); } finally { btn.style.opacity = '1'; }
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
                            {t('sidebar.dashboard')}
                        </div>
                    )}
                    {navItems.filter(i => i.section === 'dashboard').map(item => (
                        <button key={item.id} onClick={() => handleTabChange(item.id)} title={sidebarCollapsed ? item.label : undefined}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: sidebarCollapsed ? '14px' : '12px 16px', background: activeTab === item.id ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)' : 'transparent', color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'), border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent', borderRadius: '12px', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.2s ease', fontWeight: activeTab === item.id ? '600' : '500', fontSize: '14px', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}

                    {!sidebarCollapsed && <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', margin: '18px 0 8px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>{t('sidebar.posts')}</div>}
                    {sidebarCollapsed && <div style={{ margin: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />}
                    {navItems.filter(i => i.section === 'posts').map(item => (
                        <button key={item.id} onClick={() => handleTabChange(item.id)} title={sidebarCollapsed ? item.label : undefined}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: sidebarCollapsed ? '14px' : '12px 16px', background: activeTab === item.id ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)' : 'transparent', color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'), border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent', borderRadius: '12px', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.2s ease', fontWeight: activeTab === item.id ? '600' : '500', fontSize: '14px', gap: '12px', position: 'relative' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                    {item.label}
                                    {(item as any).badge && (
                                        <span style={{ padding: '2px 6px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '4px', fontSize: '8px', fontWeight: '800', color: 'white', letterSpacing: '0.5px' }}>
                                            {(item as any).badge}
                                        </span>
                                    )}
                                </span>
                            )}
                        </button>
                    ))}

                    {!sidebarCollapsed && <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', margin: '18px 0 8px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>{t('sidebar.comments')}</div>}
                    {sidebarCollapsed && <div style={{ margin: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />}
                    {navItems.filter(i => i.section === 'comments').map(item => (
                        <button key={item.id} onClick={() => handleTabChange(item.id)} title={sidebarCollapsed ? item.label : undefined}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: sidebarCollapsed ? '14px' : '12px 16px', background: activeTab === item.id ? 'linear-gradient(135deg, rgba(105,63,233,0.3) 0%, rgba(139,92,246,0.2) 100%)' : 'transparent', color: activeTab === item.id ? (theme === 'light' ? '#693fe9' : 'white') : (theme === 'light' ? '#555' : 'rgba(255,255,255,0.6)'), border: activeTab === item.id ? '1px solid rgba(105,63,233,0.4)' : '1px solid transparent', borderRadius: '12px', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.2s ease', fontWeight: activeTab === item.id ? '600' : '500', fontSize: '14px', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}

                    {!sidebarCollapsed && <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', margin: '18px 0 8px 12px', letterSpacing: '1.5px', fontWeight: '600' }}>{t('sidebar.management')}</div>}
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
                            {t('sidebar.account')}
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
                        <span>{miniIcon('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9', sidebarCollapsed ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.7)', 18)}</span>
                        {!sidebarCollapsed && t('common.logout')}
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
                            {t(`headers.${activeTab}`, activeTab)}
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', margin: 0 }}>
                            {t(`descriptions.${activeTab}`, '')}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Extension Connection Status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {extensionConnected ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.6)', animation: 'pulse 2s infinite' }} />
                                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#34d399' }}>Extension Connected</span>
                                    {extensionLastSeen && <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>· {extensionLastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#f87171' }}>Extension Offline</span>
                                        {extensionLastSeen && (() => {
                                            const ago = Math.floor((Date.now() - extensionLastSeen.getTime()) / 1000);
                                            const label = ago < 60 ? `${ago}s ago` : ago < 3600 ? `${Math.floor(ago / 60)}m ago` : ago < 86400 ? `${Math.floor(ago / 3600)}h ago` : `${Math.floor(ago / 86400)}d ago`;
                                            return <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>· last seen {label}</span>;
                                        })()}
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
                                        title="Auto-checks every 15s. Click to check now."
                                    >
                                        {miniIcon('M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15', 'white', 11)} Retry
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
                                {miniIcon('M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z', 'white', 12)} Get Extension
                            </button>
                            {/* LinkedIn Connect Button */}
                            <button
                                onClick={() => {
                                    if (linkedInOAuth?.connected && !linkedInOAuth?.tokenExpired) {
                                        showToast('LinkedIn already connected!', 'success');
                                    } else {
                                        const token = localStorage.getItem('authToken');
                                        fetch('/api/auth/linkedin', { headers: { 'Authorization': `Bearer ${token}` } })
                                            .then(r => r.json())
                                            .then(d => {
                                                if (d.authUrl) window.location.href = d.authUrl;
                                                else showToast('Failed to get LinkedIn auth URL', 'error');
                                            });
                                    }
                                }}
                                style={{
                                    padding: '4px 10px',
                                    background: linkedInOAuth?.connected && !linkedInOAuth?.tokenExpired ? 'rgba(16,185,129,0.15)' : 'rgba(0,119,181,0.15)',
                                    border: linkedInOAuth?.connected && !linkedInOAuth?.tokenExpired ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(0,119,181,0.4)',
                                    borderRadius: '6px',
                                    color: linkedInOAuth?.connected && !linkedInOAuth?.tokenExpired ? '#34d399' : '#0ea5e9',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.background = linkedInOAuth?.connected && !linkedInOAuth?.tokenExpired ? 'rgba(16,185,129,0.25)' : 'rgba(0,119,181,0.25)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.background = linkedInOAuth?.connected && !linkedInOAuth?.tokenExpired ? 'rgba(16,185,129,0.15)' : 'rgba(0,119,181,0.15)';
                                }}
                            >
                                {linkedInOAuth?.connected && !linkedInOAuth?.tokenExpired ? (
                                    <>{miniIcon('M9 12l2 2 4-4', '#34d399', 11)} LinkedIn Connected</>
                                ) : (
                                    <>{miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', '#0ea5e9', 11)} Connect LinkedIn</>
                                )}
                            </button>
                            {/* Profile Scan Button */}
                            {extensionConnected && (
                                <button
                                    onClick={linkedInProfile ? () => setShowLinkedInDataModal(true) : () => scanLinkedInProfile()}
                                    disabled={linkedInProfileScanning}
                                    style={{
                                        padding: '4px 10px',
                                        background: linkedInProfile ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                        border: linkedInProfile ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(245,158,11,0.4)',
                                        borderRadius: '6px',
                                        color: linkedInProfile ? '#34d399' : '#fbbf24',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        cursor: linkedInProfileScanning ? 'wait' : 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.background = linkedInProfile ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = linkedInProfile ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'; }}
                                >
                                    {linkedInProfileScanning ? (
                                        <>Scanning...</>
                                    ) : linkedInProfile ? (
                                        <>{miniIcon('M18 20V10 M12 20V4 M6 20v-6', '#34d399', 11)} View Data</>
                                    ) : (
                                        <>{miniIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', '#fbbf24', 11)} Scan Profile</>
                                    )}
                                </button>
                            )}
                        </div>
                        {/* Theme Toggle */}
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
                            {(['current', 'light', 'dark'] as const).map(t => (
                                <button key={t} onClick={() => { setTheme(t); localStorage.setItem('dashboard-theme', t); }}
                                    style={{ padding: '8px 14px', background: theme === t ? 'rgba(105,63,233,0.6)' : 'transparent', color: theme === t ? 'white' : 'rgba(255,255,255,0.6)', border: 'none', fontSize: '12px', fontWeight: theme === t ? '700' : '500', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    {t === 'current' ? 'Current' : t === 'light' ? 'Light' : 'Dark'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Content â€” rendered via extracted components */}
                {activeTab === 'overview' && <OverviewTab {...tabProps} />}
                {activeTab === 'writer' && <WriterTabNew {...tabProps} />}
                {activeTab === 'comments' && <CommentsTab {...tabProps} />}
                {activeTab === 'trending-posts' && <TrendingPostsTab {...tabProps} />}
                {activeTab === 'tasks' && <TasksTab {...tabProps} />}
                {activeTab === 'history' && <HistoryTab {...tabProps} />}
                {activeTab === 'limits' && <LimitsTab {...tabProps} />}
                {activeTab === 'activity' && <ActivityTab {...tabProps} />}
                {activeTab === 'commenter' && <CommenterTab {...tabProps} />}
                {activeTab === 'import' && <ImportTab {...tabProps} />}
                {activeTab === 'analytics' && <AnalyticsTab {...tabProps} />}
                {activeTab === 'usage' && <UsageTab {...tabProps} />}
                {activeTab === 'referrals' && <ReferralsTab {...tabProps} />}
                {activeTab === 'extension' && <ExtensionTab {...tabProps} />}
                {activeTab === 'account' && <AccountTab {...tabProps} />}
            </div>
        </div>
    );
}