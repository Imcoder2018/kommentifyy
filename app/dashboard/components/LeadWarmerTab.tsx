import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Settings, Download, Upload, Search, X, Users, FileText, Heart, MessageCircle,
  ThumbsUp, Trash2, ChevronDown, ChevronRight, ChevronUp, Check, AlertCircle, Loader2,
  Sparkles, RefreshCw, ExternalLink, HelpCircle, UserPlus, Send, Plus, Minus,
  Clock, GripVertical, Edit2, Wand2, Eye, EyeOff, LayoutList, LayoutGrid, Calendar,
  BarChart2, Zap, PlayCircle, Target, Activity, CheckSquare, Square, Timer
} from 'lucide-react';

// ============= TYPES =============
interface Lead {
  id: string;
  firstName?: string;
  lastName?: string;
  linkedinUrl: string;
  vanityId?: string;
  headline?: string;
  company?: string;
  status: 'pending_fetch' | 'fetched' | 'engaged' | 'connected';
  posts?: Post[];
  postsFetched?: boolean;
  touchCount?: number;
  lastEngagedAt?: string;
  engagementType?: 'instant' | 'scheduled' | 'unassigned';
}

interface Post {
  id: string;
  postUrn: string;
  postText?: string;
  postDate?: string;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  isCommented?: boolean;
  commentText?: string;
}

interface WarmSettings {
  campaignName?: string;
  businessContext?: string;
  campaignGoal?: string;
  profilesPerDay?: number;
  autopilotEnabled?: boolean;
  autopilotTime?: string;
  postsToEngage?: number | 'random_2' | 'random_3' | 'random_5' | 'all';
  sequenceSteps?: string;
  bulkTaskLimit?: number;
  bulkTaskDelay?: number;
}

interface SequenceStep {
  id: string;
  day: number;
  actions: {
    like: boolean;
    comment: boolean;
    connect: boolean;
    message: boolean;
  };
  postTarget: string;
  postStartIndex: number;
  postCount: number;
  enabled: boolean;
  time?: string;
}

interface ExecutionLog {
  id: string;
  date: string;
  type: 'instant' | 'scheduled';
  leadsProcessed: number;
  likesGiven: number;
  commentsGiven: number;
  engagedCount?: number;
  status: 'completed' | 'failed' | 'running';
}

// Single scheduled task within an autopilot session
interface ScheduledTask {
  id: string;
  day: number;
  leadIndex?: number;
  action: string;
  postsPerDay?: number;
  postsRange?: string;
  scheduledFor: string;
  status: 'pending' | 'completed' | 'failed' | 'due';
  leadName?: string;
  postPreview?: string;
  targetPost?: string | null;
  postDate?: string | null;
}

// Autopilot session - created each time user adds leads to autopilot
interface AutopilotSession {
  id: string;
  createdAt: string;
  leadIds: string[];
  leadCount: number;
  commentsGenerated: number;
  status: 'generating' | 'scheduled' | 'completed' | 'partial';
  tasks: ScheduledTask[];
}

interface Props {
  t?: any;
  user?: any;
  miniIcon?: any;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  extensionConnected?: boolean;
  hideTitle?: boolean;
}

// ============= DESIGN SYSTEM =============
const THEME = {
  colors: {
    primary: '#693fe9',
    primaryHover: '#7c3aed',
    primaryLight: '#a78bfa',
    secondary: '#1e293b',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceHighlight: '#334155',
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      muted: '#64748b',
    },
    border: 'rgba(255,255,255,0.08)',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    linkedin: '#0a66c2',
  },
  radius: { sm: '6px', md: '8px', lg: '12px', xl: '16px', xxl: '24px', full: '9999px' },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(105, 63, 233, 0.25)',
  },
  transitions: { default: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }
};

const styles = {
  container: { display: 'flex', flexDirection: 'column' as const, gap: '24px', paddingBottom: '40px', fontFamily: 'Inter, system-ui, sans-serif' },
  card: { background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)', backdropFilter: 'blur(16px)', border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius.xl, padding: '24px', boxShadow: THEME.shadows.lg },
  statCard: { background: 'rgba(30, 41, 59, 0.5)', border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius.lg, padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  btn: (variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'linkedin' | 'success' | 'outline' = 'primary', disabled = false) => {
    const base = { padding: '10px 18px', borderRadius: THEME.radius.md, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, fontWeight: 600, fontSize: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: THEME.transitions.default, outline: 'none' };
    switch (variant) {
      case 'primary': return { ...base, background: 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', boxShadow: disabled ? 'none' : '0 4px 14px rgba(105, 63, 233, 0.3)' };
      case 'linkedin': return { ...base, background: '#0a66c2', color: 'white', boxShadow: disabled ? 'none' : '0 4px 14px rgba(10, 102, 194, 0.3)' };
      case 'success': return { ...base, background: THEME.colors.success, color: 'white', boxShadow: disabled ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.3)' };
      case 'secondary': return { ...base, background: 'rgba(255, 255, 255, 0.05)', color: THEME.colors.text.primary, border: `1px solid rgba(255, 255, 255, 0.1)` };
      case 'outline': return { ...base, background: 'transparent', color: THEME.colors.primaryLight, border: `1px solid ${THEME.colors.primaryLight}` };
      case 'danger': return { ...base, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
      case 'ghost': return { ...base, background: 'transparent', color: THEME.colors.text.secondary, padding: '8px' };
      default: return base;
    }
  },
  input: { background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius.md, padding: '12px 16px', color: THEME.colors.text.primary, fontSize: '14px', width: '100%', outline: 'none', transition: THEME.transitions.default },
  select: { background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius.md, padding: '12px 16px', color: THEME.colors.text.primary, fontSize: '14px', width: '100%', outline: 'none', appearance: 'none' as const, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { textAlign: 'left' as const, padding: '16px', color: THEME.colors.text.secondary, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: `1px solid ${THEME.colors.border}`, background: 'rgba(255, 255, 255, 0.02)' },
  td: { padding: '16px', borderBottom: `1px solid ${THEME.colors.border}`, color: THEME.colors.text.primary, fontSize: '14px', verticalAlign: 'top' as const },
  badge: (color: string) => ({ padding: '4px 10px', borderRadius: THEME.radius.full, fontSize: '12px', fontWeight: 600, background: `${color}15`, color: color, border: `1px solid ${color}30`, display: 'inline-flex', alignItems: 'center', gap: '6px' }),
};

// ============= CONSTANTS =============
const POSTS_PER_DAY_OPTIONS = [1, 2, 3, 5, 8, 10];

const POST_TARGETS = [
  { value: 'recent_1', label: 'Recent 1st Post' },
  { value: 'recent_2', label: 'Recent 2 Posts' },
  { value: 'recent_3', label: 'Recent 3 Posts' },
  { value: 'random_1', label: 'Random 1 Post' },
  { value: 'random_2', label: 'Random 2 Posts' },
  { value: 'all', label: 'All Recent Posts' },
];

const DELAY_OPTIONS = [
  { value: 1, label: '1 minute' },
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
];

const DEFAULT_SEQUENCE: SequenceStep[] = [
  { id: '1', day: 1, actions: { like: true, comment: true, connect: false, message: false }, postTarget: 'recent_1', postStartIndex: 0, postCount: 1, enabled: true, time: 'anytime' },
  { id: '2', day: 3, actions: { like: true, comment: false, connect: false, message: false }, postTarget: 'recent_2', postStartIndex: 0, postCount: 2, enabled: true, time: 'anytime' },
];

const MOCK_EXECUTIONS: ExecutionLog[] = [
  { id: '1', date: new Date().toISOString(), type: 'scheduled', leadsProcessed: 20, likesGiven: 45, commentsGiven: 12, status: 'completed' },
  { id: '2', date: new Date(Date.now() - 86400000).toISOString(), type: 'instant', leadsProcessed: 10, likesGiven: 15, commentsGiven: 5, status: 'completed' },
];

// ============= HOOKS =============
const useApi = () => {
  const getAuthToken = useCallback(() => typeof window !== 'undefined' ? localStorage.getItem('authToken') : null, []);
  const request = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const res = await fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }, [getAuthToken]);

  return {
    apiGet: (url: string) => request(url),
    apiPost: (url: string, body: any) => request(url, { method: 'POST', body: JSON.stringify(body) }),
    apiDelete: (url: string) => request(url, { method: 'DELETE' }),
    getAuthToken
  };
};

export default function LeadWarmerTab(props: Props) {
  const { showToast, extensionConnected = false } = props;
  const { apiGet, apiPost, apiDelete } = useApi();

  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'sequence' | 'settings'>('overview');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('detail');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [engagingPostId, setEngagingPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<{ postId: string; text: string } | null>(null);
  const [generatingAiId, setGeneratingAiId] = useState<string | null>(null);
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [instantConfig, setInstantConfig] = useState({ postTarget: 'recent_1', like: true, comment: true });
  const [bulkEngaging, setBulkEngaging] = useState(false);
  const [instantProgress, setInstantProgress] = useState({ current: 0, total: 0, message: '' });
  const [instantCancelled, setInstantCancelled] = useState(false);
  const [autopilotGenerating, setAutopilotGenerating] = useState(false);
  const [autopilotProgress, setAutopilotProgress] = useState({ current: 0, total: 0, leadName: '' });
  // Autopilot processing state
  const [isProcessingPosts, setIsProcessingPosts] = useState(false);
  const [isGeneratingComments, setIsGeneratingComments] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({
    stage: 'idle' as 'idle' | 'fetching' | 'generating' | 'complete',
    current: 0,
    total: 0,
    message: '',
  });
  const [processCancelled, setProcessCancelled] = useState(false);
  const [campaignName, setCampaignName] = useState('My Warm Leads');
  const [businessContext, setBusinessContext] = useState('');
  const [profilesPerDay, setProfilesPerDay] = useState(20);
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);
  const [autopilotTime, setAutopilotTime] = useState('09:00');
  const [bulkTaskDelay, setBulkTaskDelay] = useState(5);
  const [sequenceSteps, setSequenceSteps] = useState<SequenceStep[]>(DEFAULT_SEQUENCE);
  const [savingSettings, setSavingSettings] = useState(false);
  const [genDays, setGenDays] = useState(5);
  const [genPostsPerDay, setGenPostsPerDay] = useState(2);
  // Overview data
  const [executionHistory, setExecutionHistory] = useState<ExecutionLog[]>([]);
  const [autopilotSessions, setAutopilotSessions] = useState<AutopilotSession[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [autopilotPaused, setAutopilotPaused] = useState(false);
  const [upcomingTasks, setUpcomingTasks] = useState<ScheduledTask[]>([]);

  const csvFileRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load Data
  const loadLeads = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiGet('/api/warm-leads');
      if (data.success) {
        setLeads(data.leads || []);
        if (data.settings && !silent) {
          setCampaignName(data.settings.campaignName || 'My Warm Leads');
          setBusinessContext(data.settings.businessContext || '');
          setProfilesPerDay(data.settings.profilesPerDay || 20);
          setAutopilotEnabled(data.settings.autopilotEnabled || false);
          setAutopilotTime(data.settings.autopilotTime || '09:00');
          setBulkTaskDelay(data.settings.bulkTaskDelay || 5);
          try {
            const parsedSteps = JSON.parse(data.settings.sequenceSteps);
            // Ensure all steps have required properties with defaults
            const validatedSteps = parsedSteps.length ? parsedSteps.map((s: any) => ({
              ...s,
              postStartIndex: s.postStartIndex ?? 0,
              postCount: s.postCount ?? 1,
              day: s.day ?? 1,
              enabled: s.enabled ?? true,
              actions: s.actions ?? { like: true, comment: false, connect: false, message: false },
            })) : DEFAULT_SEQUENCE;
            setSequenceSteps(validatedSteps);
          } catch { setSequenceSteps(DEFAULT_SEQUENCE); }
        }
      }
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoading(false); }
  }, []);

  // Load Overview Data: execution history, autopilot sessions, upcoming tasks
  const loadOverviewData = useCallback(async () => {
    try {
      const data = await apiGet('/api/warm-leads?action=overview');
      if (data.success) {
        setExecutionHistory(data.executionHistory || []);
        const sessions = data.autopilotSessions || [];
        setAutopilotSessions(sessions);
        setUpcomingTasks(data.upcomingTasks || []);
        // Auto-expand most recent session
        if (sessions.length > 0) {
          setExpandedSession(sessions[0].id);
        }
      }
    } catch (e) { console.error('Failed to load overview data:', e); }
  }, []);

  useEffect(() => { loadLeads(); }, []);
  useEffect(() => { if (activeTab === 'overview') loadOverviewData(); }, [activeTab]);

  // Save Settings
  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await apiPost('/api/warm-leads', {
        action: 'save_settings',
        campaignName, businessContext, profilesPerDay, sequenceSteps, autopilotEnabled, autopilotTime, bulkTaskDelay
      });
      if (res.success) {
        showToast?.('Settings saved successfully!', 'success');
      } else {
        showToast?.(res.error || 'Error saving settings', 'error');
      }
    } catch (err) {
      console.error('Save settings error:', err);
      showToast?.('Error saving settings', 'error');
    }
    finally { setSavingSettings(false); }
  };

  // Import
  const handleImport = async () => {
    // Clean URLs: extract just the profile part, remove query params and trailing slashes
    const cleanUrl = (url: string): string | null => {
      // Extract just the linkedin.com/in/username part - match both http and https
      const match = url.match(/(https?:\/\/(?:www\.)?linkedin\.com\/in\/[^/?#\s]+)/i);
      if (match) return match[1].replace(/\/$/, '');
      return null;
    };

    const urls = importText.split('\n')
      .map(l => l.trim())
      .filter(l => l.match(/linkedin\.com\/in\//i))
      .map(cleanUrl)
      .filter((url): url is string => url !== null);

    const uniqueUrls = [...new Set(urls)]; // Remove duplicates

    if (!uniqueUrls.length) return showToast?.('No valid LinkedIn URLs found', 'error');

    setImporting(true);
    try {
      const leadsList = uniqueUrls.map(url => ({ linkedinUrl: url }));
      const res = await apiPost('/api/warm-leads', { leads: leadsList });
      if (res.success) {
        const msg = res.created > 0
          ? `Imported ${res.created} lead${res.created !== 1 ? 's' : ''} successfully${res.skipped?.length ? `, ${res.skipped.length} skipped (duplicates)` : ''}`
          : `No new leads imported (${res.skipped?.length || 0} already exist or invalid)`;
        showToast?.(msg, res.created > 0 ? 'success' : 'info');
        setImportText('');
        setShowImport(false);
        loadLeads();
      } else {
        showToast?.(res.error || 'Import failed', 'error');
      }
    } catch { showToast?.('Import failed', 'error'); }
    finally { setImporting(false); }
  };

  // Generate Sequence: distributes totalPosts across days evenly
  const handleGenerateSequence = () => {
    const totalPosts = genDays * genPostsPerDay;
    const newSteps: SequenceStep[] = [];
    let postIndex = 0;
    for (let day = 1; day <= genDays; day++) {
      const startIdx = postIndex;
      const count = genPostsPerDay;
      newSteps.push({
        id: Math.random().toString(),
        day,
        actions: { like: true, comment: true, connect: false, message: false },
        postTarget: `recent_${startIdx + 1}_to_${startIdx + count}`,
        postStartIndex: startIdx,
        postCount: count,
        enabled: true,
        time: 'anytime'
      });
      postIndex += count;
    }
    setSequenceSteps(newSteps);
    showToast?.(`Generated ${newSteps.length} steps for ${totalPosts} total posts across ${genDays} days`, 'success');
  };

  // Fetch Posts
  const fetchPosts = async (targetIds?: string[]) => {
    if (!extensionConnected) return showToast?.('Extension not connected. Please open LinkedIn tab.', 'error');
    const targets = targetIds ? leads.filter(l => targetIds.includes(l.id)) : leads.filter(l => !l.postsFetched);
    if (!targets.length) return showToast?.('No leads to fetch.', 'info');
    setFetchingPosts(true);
    try {
      const batchData = targets.slice(0, 10).map(l => ({
        leadId: l.id,
        vanityId: l.vanityId || l.linkedinUrl.match(/linkedin\.com\/in\/([^/?#]+)/i)?.[1],
      })).filter(b => b.vanityId);
      const res = await apiPost('/api/extension/command', { command: 'fetch_lead_posts_bulk', data: { leads: batchData } });
      if (res.success) {
        showToast?.('Fetching posts... Please keep LinkedIn open.', 'info');
        const poll = setInterval(async () => {
          try {
            const status = await apiGet(`/api/extension/command?commandId=${res.commandId}`);
            if (status.command?.status === 'completed') {
              clearInterval(poll);
              setFetchingPosts(false);
              showToast?.('Fetched posts successfully', 'success');
              loadLeads(true);
            } else if (status.command?.status === 'failed') {
              clearInterval(poll);
              setFetchingPosts(false);
              showToast?.('Fetch failed. Check extension logs.', 'error');
            }
          } catch { clearInterval(poll); setFetchingPosts(false); }
        }, 3000);
        pollIntervalRef.current = poll;
      }
    } catch { setFetchingPosts(false); showToast?.('Error starting fetch', 'error'); }
  };

  // Bulk Instant Engage - creates 1 bulk task per lead via extension command API
  const handleExecuteInstant = async () => {
    if (selectedLeads.size === 0) return showToast?.('Select leads to engage', 'error');
    if (!extensionConnected) return showToast?.('Extension not connected', 'error');

    setInstantCancelled(false);
    setBulkEngaging(true);
    const selectedArr = Array.from(selectedLeads);
    const targetLeads = leads.filter(l => selectedArr.includes(l.id));

    // Separate leads into those with posts and those without
    const leadsWithPosts = targetLeads.filter(l => l.posts && l.posts.length > 0);
    const leadsNeedingPostsCount = targetLeads.filter(l => !l.posts || l.posts.length === 0).length;

    setInstantProgress({ current: 0, total: leadsWithPosts.length, message: 'Starting...' });

    // If some leads need posts fetched, trigger fetch via backend
    if (leadsNeedingPostsCount > 0) {
      setInstantProgress(prev => ({ ...prev, message: `Fetching posts for ${leadsNeedingPostsCount} leads...` }));
      showToast?.(`Fetching posts for ${leadsNeedingPostsCount} leads first...`, 'info');

      try {
        // Get leads that need posts
        const leadsNeedingPosts = targetLeads.filter(l => !l.posts || l.posts.length === 0);
        // Call backend to setup autopilot (which handles post fetching)
        const res = await apiPost('/api/warm-leads', {
          action: 'setup_autopilot',
          leadIds: leadsNeedingPosts.map(l => l.id),
          businessContext,
          postsPerLead: 3,
        });

        if (res.success) {
          showToast?.(`Posts fetch queued for ${leadsNeedingPostsCount} leads. Will process after posts are fetched.`, 'info');
        }
      } catch (err) {
        console.error('Auto-fetch error:', err);
      }
    }

    // Process leads that already have posts
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < leadsWithPosts.length; i++) {
      // Check if cancelled
      if (instantCancelled) {
        showToast?.('Instant warmup cancelled', 'info');
        break;
      }

      const lead = leadsWithPosts[i];
      setInstantProgress({ current: i + 1, total: leadsWithPosts.length, message: `Processing ${lead.firstName || 'lead'}...` });
      const posts = lead.posts || [];

      // Determine which posts to engage based on instantConfig.postTarget
      const postTargetNum = parseInt(instantConfig.postTarget.replace('recent_', '').replace('random_', '').replace('all', '999'));
      const targetPosts = posts.slice(0, isNaN(postTargetNum) ? posts.length : postTargetNum);

      // If comment is enabled, generate AI comments for each post first
      const postsWithComments = await Promise.all(
        targetPosts.map(async (p) => {
          let commentText = null;
          // Generate AI comment if enabled
          if (instantConfig.comment && p.postText) {
            try {
              showToast?.(`Generating AI comment for post...`, 'info');
              const aiRes = await apiPost('/api/ai/generate-comment', {
                postText: p.postText || '',
                authorName: lead.firstName || '',
                goal: 'AddValue',
                tone: 'Professional',
                commentLength: 'Short',
                userBackground: businessContext
              });
              if (aiRes.success && aiRes.content) {
                commentText = aiRes.content;
                console.log('Generated AI comment:', commentText);
              }
            } catch (aiErr) {
              console.error('AI comment generation failed:', aiErr);
            }
          }
          return {
            postUrn: p.postUrn,
            postId: p.id,
            postText: p.postText,
            enableLike: instantConfig.like,
            enableComment: instantConfig.comment,
            commentText: commentText,
          };
        })
      );

      try {
        await apiPost('/api/extension/command', {
          command: 'warm_lead_bulk_engage',
          data: {
            leadId: lead.id,
            vanityId: lead.vanityId || lead.linkedinUrl.match(/linkedin\.com\/in\/([^/?#]+)/i)?.[1],
            posts: postsWithComments,
            businessContext,
            delayBetweenLeadsMs: 0,
          }
        });
        successCount++;
      } catch { failCount++; }
    }

    // Update engagementType via API
    try {
      await apiPost('/api/warm-leads', {
        action: 'bulk_update_type',
        leadIds: selectedArr,
        engagementType: 'instant',
      });
    } catch { /* best effort */ }

    setBulkEngaging(false);
    setInstantProgress({ current: 0, total: 0, message: '' });
    setShowInstantModal(false);

    // Build appropriate message
    if (instantCancelled) {
      // Already showed cancelled toast
    } else if (leadsNeedingPostsCount > 0 && successCount > 0) {
      showToast?.(`Processed ${successCount} leads with posts. ${leadsNeedingPostsCount} leads queued for post fetch.`, 'success');
    } else if (leadsNeedingPostsCount > 0) {
      showToast?.(`${leadsNeedingPostsCount} leads queued for post fetch. Will process after posts are fetched.`, 'info');
    } else {
      showToast?.(`Queued ${successCount} bulk tasks (${failCount} skipped). Extension will process them.`, 'success');
    }

    setSelectedLeads(new Set());
    loadLeads(true);
  };

  // Cancel instant warmup
  const cancelInstantWarmup = () => {
    setInstantCancelled(true);
    setBulkEngaging(false);
    setInstantProgress({ current: 0, total: 0, message: '' });
    showToast?.('Instant warmup cancelled', 'info');
  };

  // Schedule selected leads as autopilot with full automation
  const scheduleSelected = async () => {
    if (selectedLeads.size === 0) return;
    const selectedArr = Array.from(selectedLeads).slice(0, 20); // Max 20 leads
    const targetLeads = leads.filter(l => selectedArr.includes(l.id));
    const leadsWithPosts = targetLeads.filter(l => l.posts && l.posts.length > 0);

    // Reset processing state - ALWAYS show progress bar
    setProcessCancelled(false);
    setAutopilotGenerating(true);
    setProcessingProgress({
      stage: 'fetching',
      current: 0,
      total: selectedArr.length,
      message: 'Setting up autopilot...',
    });

    try {
      // Call backend to setup autopilot and queue post fetching if needed
      const res = await apiPost('/api/warm-leads', {
        action: 'setup_autopilot',
        leadIds: selectedArr,
        businessContext,
        postsPerLead: 3,
      });

      if (res.success) {
        // ALWAYS start processing - show appropriate stage
        if (res.postsFetchQueued && res.leadsNeedingPosts > 0) {
          // Posts need to be fetched first - start polling
          setProcessingProgress({
            stage: 'fetching',
            current: 0,
            total: res.leadsNeedingPosts || selectedArr.length,
            message: `Fetching posts for ${res.leadsNeedingPosts || selectedArr.length} leads... Keep LinkedIn open`,
          });

          // Poll for posts to be fetched and generate AI comments
          let pollCount = 0;
          const maxPolls = 30; // Poll for up to 5 minutes (30 * 10s)
          const pollInterval = setInterval(async () => {
            if (processCancelled) {
              clearInterval(pollInterval);
              setAutopilotGenerating(false);
              setProcessingProgress({ stage: 'idle', current: 0, total: 0, message: '' });
              return;
            }

            pollCount++;
            try {
              // Check status
              const statusRes = await apiGet('/api/warm-leads?action=autopilot_status');
              if (statusRes.success) {
                const fetched = (statusRes.leadsWithPosts || 0);
                setProcessingProgress(prev => ({
                  ...prev,
                  current: fetched,
                  message: `Fetched ${fetched} leads... ${statusRes.pendingFetchCommands > 0 ? 'Waiting for extension...' : 'Processing...'}`
                }));

                // When posts are fetched, start generating AI comments
                if (fetched > 0 && statusRes.pendingFetchCommands === 0) {
                  clearInterval(pollInterval);
                  // Start AI comment generation
                  setProcessingProgress({
                    stage: 'generating',
                    current: 0,
                    total: statusRes.postsWithoutComments || 0,
                    message: 'Generating AI comments...',
                  });

                  try {
                    const aiRes = await apiPost('/api/warm-leads', {
                      action: 'generate_for_scheduled',
                      postsPerLead: 3,
                    });

                    if (aiRes.success) {
                      setProcessingProgress({
                        stage: 'complete',
                        current: aiRes.commentsGenerated || 0,
                        total: aiRes.leadsProcessed || 0,
                        message: `Complete! ${aiRes.commentsGenerated} AI comments generated.`,
                      });
                      showToast?.(`Autopilot setup complete! ${aiRes.commentsGenerated} AI comments generated.`, 'success');
                    }
                  } catch (e) {
                    console.error('AI generation error:', e);
                    showToast?.('Posts fetched. AI comment generation will continue in background.', 'info');
                    setProcessingProgress({
                      stage: 'complete',
                      current: 0,
                      total: 0,
                      message: 'Posts fetched. AI generation continues in background.',
                    });
                  }
                }
              }

              // Timeout after max polls
              if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                showToast?.('Processing continued in background. Check back later.', 'info');
                setProcessingProgress({ stage: 'idle', current: 0, total: 0, message: '' });
                setAutopilotGenerating(false);
              }
            } catch (e) {
              console.error('Poll error:', e);
            }
          }, 10000); // Poll every 10 seconds

        } else if (res.commentsGenerated > 0 || leadsWithPosts.length > 0) {
          // Posts already exist - generate AI comments now
          setProcessingProgress({
            stage: 'generating',
            current: 0,
            total: leadsWithPosts.length,
            message: `Generating AI comments for ${leadsWithPosts.length} leads...`,
          });

          try {
            const aiRes = await apiPost('/api/warm-leads', {
              action: 'generate_for_scheduled',
              postsPerLead: 3,
            });

            if (aiRes.success) {
              setProcessingProgress({
                stage: 'complete',
                current: aiRes.commentsGenerated || 0,
                total: aiRes.leadsProcessed || 0,
                message: `Complete! ${aiRes.commentsGenerated} AI comments generated.`,
              });
              showToast?.(`Autopilot setup complete! ${aiRes.commentsGenerated} AI comments generated.`, 'success');
            } else {
              setProcessingProgress({
                stage: 'complete',
                current: selectedArr.length,
                total: selectedArr.length,
                message: 'Leads added to autopilot!',
              });
              showToast?.(`Added ${selectedArr.length} leads to Autopilot Sequence.`, 'success');
            }
          } catch (e) {
            console.error('AI generation error:', e);
            setProcessingProgress({
              stage: 'complete',
              current: selectedArr.length,
              total: selectedArr.length,
              message: 'Setup complete. AI generation continues in background.',
            });
            showToast?.('Leads added. AI comments will be generated in background.', 'info');
          }
        } else {
          // Just scheduled
          setProcessingProgress({
            stage: 'complete',
            current: selectedArr.length,
            total: selectedArr.length,
            message: `Added ${selectedArr.length} leads to autopilot!`,
          });
          showToast?.(`Added ${selectedArr.length} leads to Autopilot Sequence.`, 'success');
        }
      } else {
        // Fallback: just update type
        await apiPost('/api/warm-leads', {
          action: 'bulk_update_type',
          leadIds: selectedArr,
          engagementType: 'scheduled',
        });
        showToast?.(`Added ${selectedArr.length} leads to Autopilot Sequence`, 'success');
        setProcessingProgress({ stage: 'complete', current: selectedArr.length, total: selectedArr.length, message: 'Complete!' });
      }
    } catch (err) {
      console.error('Autopilot setup error:', err);
      showToast?.('Failed to setup autopilot', 'error');
      setProcessingProgress({ stage: 'idle', current: 0, total: 0, message: '' });
    }

    setTimeout(() => {
      setAutopilotGenerating(false);
      setProcessingProgress({ stage: 'idle', current: 0, total: 0, message: '' });
      setSelectedLeads(new Set());
      loadLeads(true);
    }, 5000);
  };

  // Cancel/stop processing
  const cancelProcessing = async () => {
    setProcessCancelled(true);
    setIsProcessingPosts(false);
    setIsGeneratingComments(false);
    setProcessingProgress({ stage: 'idle', current: 0, total: 0, message: 'Cancelled' });
    showToast?.('Processing cancelled', 'info');
  };

  // Single Engage
  const engage = async (lead: Lead, post: Post, type: 'like' | 'comment', text?: string) => {
    if (!extensionConnected) return showToast?.('Extension not connected', 'error');
    setEngagingPostId(post.id);
    try {
      const res = await apiPost('/api/extension/command', {
        command: 'engage_lead_post',
        data: { postUrn: post.postUrn, enableLike: type === 'like', enableComment: type === 'comment', commentText: text || '', leadId: lead.id, postId: post.id }
      });
      if (res.success) {
        showToast?.(type === 'like' ? 'Post liked!' : 'Comment posted!', 'success');
        setTimeout(() => loadLeads(true), 2000);
      }
    } catch { showToast?.('Engagement failed', 'error'); }
    finally { setEngagingPostId(null); }
  };

  const generateAiComment = async (lead: Lead, post: Post) => {
    setGeneratingAiId(post.id);
    try {
      const res = await apiPost('/api/ai/generate-comment', {
        postText: post.postText || '', authorName: lead.firstName || '', goal: 'AddValue', tone: 'Professional', commentLength: 'Short', userBackground: businessContext
      });
      if (res.success && res.content) { await engage(lead, post, 'comment', res.content); }
      else { showToast?.('Failed to generate comment', 'error'); }
    } catch { showToast?.('AI Error', 'error'); }
    finally { setGeneratingAiId(null); }
  };

  const deleteLead = async (id: string) => {
    try {
      await apiDelete(`/api/warm-leads?id=${id}`);
      setLeads(prev => prev.filter(l => l.id !== id));
      showToast?.('Lead deleted', 'success');
    } catch { showToast?.('Delete failed', 'error'); }
  };

  const stats = useMemo(() => {
    const total = leads.length;
    const instant = leads.filter(l => l.engagementType === 'instant').length;
    const scheduled = leads.filter(l => l.engagementType === 'scheduled').length;
    const unassigned = leads.filter(l => !l.engagementType || l.engagementType === 'unassigned').length;
    return { total, instant, scheduled, unassigned };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const query = searchQuery.toLowerCase().trim();
    return leads.filter(l =>
      (l.firstName?.toLowerCase().includes(query) || false) ||
      (l.lastName?.toLowerCase().includes(query) || false) ||
      (l.linkedinUrl?.toLowerCase().includes(query) || false) ||
      (l.vanityId?.toLowerCase().includes(query) || false)
    );
  }, [leads, searchQuery]);

  const { hideTitle } = props;

  return (
    <div style={styles.container}>
      {/* GLOBAL HEADER - hide when used in dashboard with existing header */}
      {!hideTitle && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
            Lead Warmer <span style={styles.badge(THEME.colors.primaryLight)}>Automation</span>
          </h1>
          <p style={{ color: THEME.colors.text.secondary, margin: 0, fontSize: '15px' }}>
            Automate personalized engagement with your prospects&apos; content. Set up multi-day warming sequences and let AI handle commenting.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(30, 41, 59, 0.6)', padding: '8px 16px', borderRadius: THEME.radius.full, border: `1px solid ${THEME.colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: extensionConnected ? THEME.colors.success : THEME.colors.error, boxShadow: `0 0 10px ${extensionConnected ? THEME.colors.success : THEME.colors.error}` }} />
            <span style={{ color: THEME.colors.text.primary, fontSize: '13px', fontWeight: 600 }}>Extension</span>
          </div>
          <div style={{ width: '1px', height: '20px', background: THEME.colors.border }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: autopilotEnabled ? THEME.colors.primaryLight : THEME.colors.text.muted }} />
            <span style={{ color: THEME.colors.text.primary, fontSize: '13px', fontWeight: 600 }}>Autopilot</span>
          </div>
        </div>
      </div>
      )}

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: `1px solid ${THEME.colors.border}`, paddingBottom: '12px' }}>
        {[
          { id: 'overview', label: 'Overview', icon: BarChart2 },
          { id: 'pipeline', label: 'Leads Pipeline', icon: LayoutList },
          { id: 'sequence', label: 'Warming Sequence', icon: Target },
          { id: 'settings', label: 'Autopilot Settings', icon: Zap },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
            padding: '10px 20px', background: activeTab === tab.id ? 'rgba(105, 63, 233, 0.1)' : 'transparent',
            border: 'none', borderRadius: THEME.radius.md,
            color: activeTab === tab.id ? THEME.colors.primaryLight : THEME.colors.text.secondary,
            fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: THEME.transitions.default,
          }}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== TAB: OVERVIEW ==================== */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Total Leads', value: stats.total, icon: Users, color: THEME.colors.primaryLight },
              { label: 'Unassigned', value: stats.unassigned, icon: HelpCircle, color: THEME.colors.text.muted },
              { label: 'Instant Engaged', value: stats.instant, icon: Zap, color: THEME.colors.warning },
              { label: 'On Autopilot', value: stats.scheduled, icon: Target, color: THEME.colors.success },
            ].map(s => (
              <div key={s.label} style={styles.statCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: THEME.colors.text.secondary, fontSize: '14px', fontWeight: 600 }}>{s.label}</span>
                  <s.icon size={18} color={s.color} />
                </div>
                <span style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '380px 380px 1fr', gap: '24px' }}>
            {/* Upcoming Executions */}
            <div style={{ ...styles.card, minHeight: '400px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color={THEME.colors.primaryLight} /> Upcoming Executions
              </h3>
              {upcomingTasks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto' }}>
                  {upcomingTasks.slice(0, 20).map((task, idx) => (
                    <div key={task.id} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: THEME.radius.sm, border: `1px solid ${THEME.colors.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{task.leadName}</span>
                        <span style={{ color: THEME.colors.warning, fontSize: '11px', fontWeight: 600 }}>{task.scheduledFor ? new Date(task.scheduledFor).toLocaleDateString() : 'Pending'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: task.targetPost ? '6px' : '0' }}>
                        <Clock size={11} color={THEME.colors.text.muted} />
                        <span style={{ color: THEME.colors.text.secondary, fontSize: '11px' }}>
                          {task.scheduledFor ? new Date(task.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} - Day {task.day}
                        </span>
                      </div>
                      {task.targetPost && (
                        <div style={{ marginTop: '6px', padding: '8px 10px', background: 'rgba(105, 63, 233, 0.12)', borderRadius: '6px', borderLeft: `3px solid ${THEME.colors.primaryLight}` }}>
                          <span style={{ color: 'white', fontSize: '11px', lineHeight: '1.4' }}>{task.targetPost}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: THEME.colors.text.muted, border: `1px dashed ${THEME.colors.border}`, borderRadius: THEME.radius.md }}>
                  {autopilotEnabled ? 'No upcoming tasks scheduled' : 'Autopilot is paused. Enable in settings.'}
                </div>
              )}
            </div>

            {/* Recent Performance */}
            <div style={{ ...styles.card, minHeight: '400px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color={THEME.colors.info} /> Recent Performance
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto' }}>
                {executionHistory.length > 0 ? (
                  executionHistory.slice(0, 20).map(log => (
                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: THEME.radius.sm, border: `1px solid ${THEME.colors.border}` }}>
                      <div>
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '14px', display: 'block' }}>{log.type === 'instant' ? 'Instant Execution' : 'Autopilot'}</span>
                        <span style={{ color: THEME.colors.text.muted, fontSize: '12px' }}>{new Date(log.date).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                          <span style={{ color: THEME.colors.text.secondary, fontSize: '11px' }}>Leads</span>
                          <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{log.leadsProcessed}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                          <span style={{ color: THEME.colors.text.secondary, fontSize: '11px' }}>Engaged</span>
                          <span style={{ color: THEME.colors.success, fontWeight: 700, fontSize: '13px' }}>{log.engagedCount ?? (log.likesGiven + log.commentsGiven)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: THEME.colors.text.muted, fontSize: '13px' }}>
                    No execution history yet
                  </div>
                )}
              </div>
            </div>

            {/* Full Sequence of Autopilot Tasks */}
            <div style={{ ...styles.card, minHeight: '500px' }}>
              <div style={{ margin: '0 0 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={18} color={THEME.colors.success} /> Autopilot Sessions
                </h3>
                <button onClick={() => setAutopilotPaused(!autopilotPaused)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, background: autopilotPaused ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: autopilotPaused ? THEME.colors.error : THEME.colors.success }}>
                  {autopilotPaused ? <><PlayCircle size={14} /> Resume</> : <><Timer size={14} /> Pause</>}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '650px', overflowY: 'auto' }}>
                {autopilotSessions.length > 0 ? (
                  autopilotSessions.slice(0, 10).map((session, sIdx) => {
                    const isExpanded = expandedSession === session.id;
                    const isMostRecent = sIdx === 0;
                    return (
                    <div key={session.id} style={{ background: 'rgba(34, 197, 94, 0.05)', borderRadius: THEME.radius.md, border: `1px solid ${isMostRecent ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.2)'}`, overflow: 'hidden' }}>
                      <div onClick={() => setExpandedSession(isExpanded ? null : session.id)} style={{ padding: '12px', background: isMostRecent ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {isExpanded ? <ChevronUp size={16} color={THEME.colors.success} /> : <ChevronDown size={16} color={THEME.colors.text.muted} />}
                          <div>
                            <span style={{ color: isMostRecent ? THEME.colors.success : 'white', fontWeight: 700, fontSize: '13px' }}>Session #{autopilotSessions.length - sIdx} {isMostRecent && '(Latest)'}</span>
                            <span style={{ color: THEME.colors.text.muted, fontSize: '11px', display: 'block' }}>{new Date(session.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ color: THEME.colors.success, fontWeight: 700, fontSize: '12px' }}>{session.leadCount} leads</span>
                            <span style={{ color: THEME.colors.primaryLight, fontSize: '10px', display: 'block' }}>{session.commentsGenerated} comments</span>
                          </div>
                          <button onClick={async (e) => { e.stopPropagation(); if (confirm('Delete session? This will remove leads from autopilot.')) { try { await apiPost('/api/warm-leads', { action: 'delete_session', sessionId: session.id, leadIds: session.leadIds }); setAutopilotSessions(prev => prev.filter(s => s.id !== session.id)); loadLeads(); showToast?.('Session deleted', 'success'); } catch { showToast?.('Delete failed', 'error'); } }}} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer' }}><Trash2 size={14} color={THEME.colors.error} /></button>
                        </div>
                      </div>
                      {isExpanded && (
                      <div style={{ padding: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                        {session.tasks && session.tasks.length > 0 ? (
                          session.tasks.map((task, tIdx) => (
                            <div key={task.id} style={{ padding: '8px', marginBottom: '4px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px', border: `1px solid ${THEME.colors.border}30` }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                                <span style={{ color: THEME.colors.primaryLight, fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>#{task.leadIndex || tIdx + 1}</span>
                                <span style={{ color: 'white', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{task.leadName || 'Unknown'}</span>
                                <span style={{ color: THEME.colors.text.muted, fontSize: '10px', flexShrink: 0 }}>|</span>
                                <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>{task.action}</span>
                                <span style={{ color: THEME.colors.info, fontSize: '10px', fontWeight: 600, flexShrink: 0, background: 'rgba(59, 130, 246, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>{task.postsPerDay || 1}p</span>
                                <span style={{ color: THEME.colors.text.muted, fontSize: '9px', flexShrink: 0 }}>{task.postsRange || ''}</span>
                                <span style={{ color: THEME.colors.text.muted, fontSize: '10px', flexShrink: 0 }}>|</span>
                                <span style={{ color: THEME.colors.text.secondary, fontSize: '10px', flexShrink: 0 }}>{task.scheduledFor ? new Date(task.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 700, flexShrink: 0, background: task.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' : task.status === 'failed' ? 'rgba(239, 68, 68, 0.2)' : task.status === 'due' ? 'rgba(251, 191, 36, 0.25)' : 'rgba(255,255,255,0.1)', color: task.status === 'completed' ? THEME.colors.success : task.status === 'failed' ? THEME.colors.error : task.status === 'due' ? '#FBBF24' : THEME.colors.text.muted }}>
                                  {task.status === 'completed' ? '✓' : task.status === 'failed' ? '✗' : task.status === 'due' ? '!' : '○'}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '12px', color: THEME.colors.text.muted, fontSize: '12px', textAlign: 'center' }}>No tasks</div>
                        )}
                      </div>
                      )}
                    </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: THEME.colors.text.muted, border: `1px dashed ${THEME.colors.border}`, borderRadius: THEME.radius.md }}>
                    No autopilot sessions yet. Add leads to autopilot to see them here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB: PIPELINE ==================== */}
      {activeTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Workflow Steps Guide */}
          <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)', borderRadius: THEME.radius.lg, border: `1px solid ${THEME.colors.border}`, padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Zap size={16} color={THEME.colors.primaryLight} />
              <span style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>How It Works</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap' }}>
              {[
                { step: 1, label: 'Select Leads', icon: Users, color: THEME.colors.primary },
                { step: 2, label: 'Instant / Autopilot', icon: Zap, color: THEME.colors.warning },
                { step: 3, label: 'Fetch Posts', icon: Download, color: '#3b82f6' },
                { step: 4, label: 'AI Comments', icon: MessageCircle, color: THEME.colors.success },
                { step: 5, label: 'Scheduled', icon: Clock, color: '#f59e0b' },
              ].map((item, idx) => (
                <div key={item.step} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `${item.color}15`, padding: '6px 12px', borderRadius: '20px', border: `1px solid ${item.color}30` }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: item.color, color: 'white', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.step}</span>
                    <item.icon size={12} color={item.color} />
                    <span style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>{item.label}</span>
                  </div>
                  {idx < 4 && <ChevronRight size={14} color={THEME.colors.text.muted} style={{ margin: '0 4px' }} />}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: THEME.colors.text.muted }} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search leads by name or URL..." style={{ ...styles.input, paddingLeft: '42px', background: 'rgba(30, 41, 59, 0.5)' }} />
              </div>
              <button onClick={() => loadLeads()} disabled={loading} style={{ ...styles.btn('ghost'), padding: '8px' }} title="Refresh leads">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              {stats.total > 0 && <span style={{ color: THEME.colors.text.muted, fontSize: '13px' }}>{stats.total} total</span>}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setViewMode(prev => prev === 'list' ? 'detail' : 'list')} style={styles.btn('secondary')}>
                {viewMode === 'detail' ? <EyeOff size={16} /> : <Eye size={16} />} {viewMode === 'detail' ? 'Hide Posts' : 'Show Posts'}
              </button>
              <button onClick={() => setShowImport(!showImport)} style={styles.btn('primary')}>
                <UserPlus size={16} /> Add Leads
              </button>
            </div>
          </div>

          {selectedLeads.size > 0 && (
            <div style={{ background: 'rgba(105, 63, 233, 0.15)', border: `1px solid rgba(105, 63, 233, 0.3)`, padding: '12px 20px', borderRadius: THEME.radius.md, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 600 }}>{selectedLeads.size} Leads Selected</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => fetchPosts(Array.from(selectedLeads))} disabled={fetchingPosts} style={styles.btn('secondary')}>
                  <Download size={14} /> Fetch Posts
                </button>
                <button onClick={() => setShowInstantModal(true)} style={{ ...styles.btn('primary'), background: THEME.colors.warning }}>
                  <Zap size={14} /> Instant Warm Up
                </button>
                <button onClick={scheduleSelected} disabled={autopilotGenerating} style={styles.btn('success')}>
                  <Target size={14} /> {autopilotGenerating ? 'Setting up...' : 'Set on Autopilot'}
                </button>
              </div>
              {/* Autopilot processing progress */}
              {autopilotGenerating && processingProgress.stage !== 'idle' && (
                <div style={{ marginTop: '12px', padding: '14px', background: processingProgress.stage === 'complete' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(105, 63, 233, 0.1)', borderRadius: '8px', border: `1px solid ${processingProgress.stage === 'complete' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(105, 63, 233, 0.3)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {processingProgress.stage === 'complete' ? (
                        <Check size={16} color={THEME.colors.success} />
                      ) : (
                        <Loader2 size={14} className="animate-spin" color={THEME.colors.primaryLight} />
                      )}
                      <span style={{ fontSize: '13px', color: processingProgress.stage === 'complete' ? THEME.colors.success : THEME.colors.primaryLight, fontWeight: 600 }}>
                        {processingProgress.stage === 'fetching' && 'Fetching Posts...'}
                        {processingProgress.stage === 'generating' && 'Generating AI Comments...'}
                        {processingProgress.stage === 'complete' && 'Setup Complete!'}
                      </span>
                    </div>
                    <button onClick={cancelProcessing} style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <X size={12} color={THEME.colors.error} />
                      <span style={{ color: THEME.colors.error, fontSize: '11px', fontWeight: 600 }}>Stop</span>
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                    <div style={{
                      width: processingProgress.total > 0 ? `${(processingProgress.current / processingProgress.total) * 100}%` : '100%',
                      height: '100%',
                      background: processingProgress.stage === 'complete' ? THEME.colors.success : THEME.colors.primaryLight,
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>

                  {/* Progress stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: THEME.colors.text.secondary }}>{processingProgress.message}</span>
                    {processingProgress.total > 0 && (
                      <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>
                        {processingProgress.current} / {processingProgress.total}
                      </span>
                    )}
                  </div>

                  {processingProgress.stage !== 'complete' && (
                    <p style={{ fontSize: '10px', color: THEME.colors.text.muted, margin: '8px 0 0 0' }}>
                      Keep LinkedIn open. Processing continues even if you close this page.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {showImport && (
            <div style={{ ...styles.card, border: `1px solid ${THEME.colors.primaryLight}40` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={20} color={THEME.colors.primaryLight} /> Import Leads
                </h3>
                <button onClick={() => setShowImport(false)} style={{ background: 'none', border: 'none', color: THEME.colors.text.muted, cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder={'Paste LinkedIn Profile URLs here (one per line)...\nhttps://www.linkedin.com/in/username'} style={{ ...styles.input, minHeight: '140px', fontFamily: 'monospace' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: THEME.colors.text.muted, fontSize: '13px' }}>
                    {importText.split('\n').filter(l => l.match(/linkedin\.com\/in\//i)).length} valid URLs detected
                  </span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="file" ref={csvFileRef} hidden accept=".csv" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const urls = (ev.target?.result as string).split('\n').filter(l => l.match(/linkedin\.com\/in\//i)).map(l => {
                            // Extract clean URL: stop at ?, #, /, ", ', or whitespace - match http and https
                            const match = l.match(/(https?:\/\/(?:www\.)?linkedin\.com\/in\/[^/?#"'\s,]+)/i);
                            return match ? match[1].replace(/\/$/, '') : '';
                          }).filter(Boolean).join('\n');
                          setImportText(urls);
                        };
                        reader.readAsText(file);
                      }
                    }} />
                    <button onClick={() => csvFileRef.current?.click()} style={styles.btn('secondary')}>Upload CSV</button>
                    <button onClick={handleImport} disabled={importing || !importText} style={styles.btn('primary', importing || !importText)}>
                      {importing ? 'Importing...' : 'Import Leads'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={styles.card}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: THEME.colors.text.muted }}>
                <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 20px', color: THEME.colors.primaryLight }} />
                <p style={{ fontSize: '16px' }}>Loading pipeline data...</p>
              </div>
            ) : leads.length === 0 ? (
              <div style={{ padding: '80px', textAlign: 'center', color: THEME.colors.text.muted }}>
                <Users size={64} style={{ opacity: 0.2, margin: '0 auto 20px' }} />
                <p style={{ fontSize: '18px', marginBottom: '8px', color: 'white', fontWeight: 600 }}>Your pipeline is empty</p>
                <p style={{ fontSize: '14px', marginBottom: '24px' }}>Import LinkedIn URLs to start warming up leads.</p>
                <button onClick={() => setShowImport(true)} style={styles.btn('primary')}><UserPlus size={16} /> Import Leads</button>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div style={{ padding: '80px', textAlign: 'center', color: THEME.colors.text.muted }}>
                <Search size={64} style={{ opacity: 0.2, margin: '0 auto 20px' }} />
                <p style={{ fontSize: '18px', marginBottom: '8px', color: 'white', fontWeight: 600 }}>No leads match your search</p>
                <p style={{ fontSize: '14px', marginBottom: '24px' }}>{leads.length} lead(s) in pipeline, but none match &quot;{searchQuery}&quot;</p>
                <button onClick={() => setSearchQuery('')} style={styles.btn('secondary')}><X size={16} /> Clear Search</button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, width: '40px', borderRadius: '8px 0 0 0' }}>
                        <input type="checkbox" onChange={() => {
                          if (selectedLeads.size === filteredLeads.length) setSelectedLeads(new Set());
                          else setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
                        }} checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0} style={{ width: '16px', height: '16px', accentColor: THEME.colors.primary }} />
                      </th>
                      <th style={styles.th}>Prospect Details</th>
                      <th style={styles.th}>Warmup Status</th>
                      <th style={styles.th}>{viewMode === 'detail' ? 'Content & Engagement' : 'Stats'}</th>
                      <th style={{ ...styles.th, borderRadius: '0 8px 0 0', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => (
                      <tr key={lead.id} style={{ background: selectedLeads.has(lead.id) ? 'rgba(105,63,233,0.05)' : 'transparent', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => { if (!selectedLeads.has(lead.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                        onMouseLeave={(e) => { if (!selectedLeads.has(lead.id)) e.currentTarget.style.background = 'transparent'; }}>
                        <td style={styles.td}>
                          <input type="checkbox" checked={selectedLeads.has(lead.id)} onChange={() => {
                            const s = new Set(selectedLeads);
                            if (s.has(lead.id)) s.delete(lead.id); else s.add(lead.id);
                            setSelectedLeads(s);
                          }} style={{ width: '16px', height: '16px', accentColor: THEME.colors.primary, marginTop: '4px' }} />
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <a href={lead.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: 'white', fontWeight: 600, fontSize: '15px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {lead.firstName || lead.vanityId || 'Unknown Lead'} <ExternalLink size={12} style={{ color: THEME.colors.text.muted }} />
                            </a>
                            <span style={{ fontSize: '13px', color: THEME.colors.text.secondary, marginTop: '6px', lineHeight: 1.4 }}>
                              {lead.headline?.substring(0, 80)}{lead.headline && lead.headline.length > 80 ? '...' : ''}
                            </span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                            <span style={styles.badge(
                              lead.engagementType === 'instant' ? THEME.colors.warning :
                              lead.engagementType === 'scheduled' ? THEME.colors.success : THEME.colors.text.muted
                            )}>
                              {lead.engagementType === 'instant' ? <Zap size={12} /> : lead.engagementType === 'scheduled' ? <Target size={12} /> : <HelpCircle size={12} />}
                              {lead.engagementType ? lead.engagementType.toUpperCase() : 'UNASSIGNED'}
                            </span>
                            {lead.postsFetched ? (
                              <span style={{ fontSize: '12px', color: THEME.colors.info, display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> Posts Fetched</span>
                            ) : (
                              <span style={{ fontSize: '12px', color: THEME.colors.text.muted, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Pending Fetch</span>
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.td, width: viewMode === 'detail' ? '500px' : 'auto' }}>
                          {viewMode === 'detail' ? (
                            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', maxWidth: '500px', scrollbarWidth: 'thin' }}>
                              {lead.postsFetched && lead.posts && lead.posts.length > 0 ? (
                                lead.posts.slice(0, 5).map(post => (
                                  <div key={post.id} style={{ minWidth: '280px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: THEME.radius.lg, padding: '16px', border: `1px solid ${THEME.colors.border}`, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                      <span style={{ fontSize: '12px', color: THEME.colors.text.secondary }}>{post.postDate ? new Date(post.postDate).toLocaleDateString() : 'Recent'}</span>
                                      <div style={{ display: 'flex', gap: '12px', color: THEME.colors.text.secondary, fontSize: '12px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={12} /> {post.likes}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageCircle size={12} /> {post.comments}</span>
                                      </div>
                                    </div>
                                    <p style={{ fontSize: '13px', color: THEME.colors.text.primary, lineHeight: '1.5', height: '60px', overflow: 'hidden', marginBottom: '8px', wordBreak: 'break-word' }}>
                                      {post.postText || 'No text content'}
                                    </p>
                                    {/* Show generated AI comment */}
                                    {post.commentText && (
                                      <div style={{ marginBottom: '12px', padding: '10px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                          <Wand2 size={12} color={THEME.colors.success} />
                                          <span style={{ fontSize: '11px', color: THEME.colors.success, fontWeight: 600 }}>AI Comment Generated</span>
                                        </div>
                                        <p style={{ fontSize: '12px', color: THEME.colors.text.primary, margin: 0, lineHeight: '1.4' }}>{post.commentText}</p>
                                      </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                      <button onClick={() => engage(lead, post, 'like')} disabled={engagingPostId === post.id || post.isLiked} style={{ ...styles.btn(post.isLiked ? 'ghost' : 'secondary'), padding: '6px 12px', fontSize: '12px', flex: 1, color: post.isLiked ? THEME.colors.linkedin : '' }}>
                                        <ThumbsUp size={14} /> {post.isLiked ? 'Liked' : 'Like'}
                                      </button>
                                      {!post.isCommented && (
                                        <>
                                          <button onClick={() => generateAiComment(lead, post)} disabled={generatingAiId === post.id} style={{ ...styles.btn('primary'), padding: '6px', width: '32px' }} title="Generate AI Comment">
                                            {generatingAiId === post.id ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                                          </button>
                                          <button onClick={() => setCommentInput({ postId: post.id, text: '' })} style={{ ...styles.btn('secondary'), padding: '6px', width: '32px' }} title="Manual Comment"><Edit2 size={14} /></button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : lead.postsFetched ? (
                                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: THEME.radius.md, border: `1px dashed ${THEME.colors.border}`, color: THEME.colors.text.muted, fontSize: '13px', width: '100%', textAlign: 'center' }}>No posts found recently.</div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: THEME.radius.md, border: `1px dashed ${THEME.colors.border}`, width: '100%' }}>
                                  <button onClick={() => fetchPosts([lead.id])} style={styles.btn('secondary')}><Download size={14} /> Fetch Recent Posts</button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {lead.postsFetched ? (
                                <span style={{ color: 'white', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14} color={THEME.colors.text.muted} /> {lead.posts?.length || 0} Posts</span>
                              ) : (
                                <span style={{ color: THEME.colors.text.muted, fontSize: '13px' }}>Posts not fetched</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button onClick={() => deleteLead(lead.id)} style={{ ...styles.btn('ghost'), color: THEME.colors.text.muted }} title="Remove Lead"
                            onMouseEnter={e => e.currentTarget.style.color = THEME.colors.error} onMouseLeave={e => e.currentTarget.style.color = THEME.colors.text.muted}>
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB: SEQUENCE ==================== */}
      {activeTab === 'sequence' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '18px' }}>Scheduled Warming Sequence Builder</h3>
              <p style={{ margin: 0, color: THEME.colors.text.secondary, fontSize: '14px' }}>Automate multi-day engagement flows. Each day creates 1 bulk task per lead.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: THEME.radius.lg, border: `1px solid ${THEME.colors.border}` }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: THEME.colors.text.muted, marginBottom: '4px', fontWeight: 600 }}>DAYS TO WARM</label>
                <input type="number" min="1" max="30" value={genDays} onChange={e => setGenDays(parseInt(e.target.value) || 1)} style={{ ...styles.input, width: '80px', padding: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: THEME.colors.text.muted, marginBottom: '4px', fontWeight: 600 }}>POSTS/DAY</label>
                <select value={genPostsPerDay} onChange={e => setGenPostsPerDay(parseInt(e.target.value))} style={{ ...styles.select, width: '100px', padding: '8px' }}>
                  {POSTS_PER_DAY_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <button onClick={handleGenerateSequence} style={{ ...styles.btn('outline'), padding: '8px 16px' }}>
                <Wand2 size={14} /> Auto-Generate
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sequenceSteps.sort((a, b) => (a.day || 0) - (b.day || 0)).map((step) => (
              <div key={step.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '20px',
                background: step.enabled ? 'rgba(30, 41, 59, 0.8)' : 'rgba(30, 41, 59, 0.3)',
                padding: '24px', borderRadius: THEME.radius.lg,
                border: `1px solid ${step.enabled ? THEME.colors.border : 'transparent'}`,
                opacity: step.enabled ? 1 : 0.6, transition: THEME.transitions.default
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '80px' }}>
                  <label style={{ fontSize: '12px', color: THEME.colors.text.muted, fontWeight: 600 }}>TIMELINE</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: THEME.radius.md, border: `1px solid ${THEME.colors.border}`, padding: '8px' }}>
                    <span style={{ color: THEME.colors.text.secondary, fontSize: '14px', marginRight: '4px' }}>Day</span>
                    <input type="number" min="1" value={step.day} onChange={e => {
                      const ns = [...sequenceSteps]; const s = ns.find(x => x.id === step.id);
                      if (s) s.day = parseInt(e.target.value) || 1; setSequenceSteps(ns);
                    }} style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '200px' }}>
                  <label style={{ fontSize: '12px', color: THEME.colors.text.muted, fontWeight: 600 }}>TARGET POSTS</label>
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: THEME.radius.md, border: `1px solid ${THEME.colors.border}`, padding: '10px 12px', color: THEME.colors.primaryLight, fontSize: '13px', fontWeight: 600 }}>
                    Recent #{(step.postStartIndex ?? 0) + 1} to #{(step.postStartIndex ?? 0) + (step.postCount ?? 1)}
                  </div>
                  <span style={{ fontSize: '11px', color: THEME.colors.text.muted }}>{step.postCount ?? 1} post(s)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <label style={{ fontSize: '12px', color: THEME.colors.text.muted, fontWeight: 600 }}>ACTIONS TO EXECUTE</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {(['like', 'comment'] as const).map(action => (
                      <button key={action} onClick={() => {
                        const ns = [...sequenceSteps]; const s = ns.find(x => x.id === step.id);
                        if (s) s.actions[action] = !s.actions[action]; setSequenceSteps(ns);
                      }} style={{ ...styles.btn(step.actions[action] ? 'primary' : 'secondary'), padding: '6px 12px', fontSize: '13px' }}>
                        {step.actions[action] ? <CheckSquare size={14} /> : <Square size={14} color={THEME.colors.text.muted} />}
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={step.enabled} onChange={e => {
                      const ns = [...sequenceSteps]; const s = ns.find(x => x.id === step.id);
                      if (s) s.enabled = e.target.checked; setSequenceSteps(ns);
                    }} style={{ width: '18px', height: '18px', accentColor: THEME.colors.success }} />
                    <span style={{ color: step.enabled ? THEME.colors.success : THEME.colors.text.muted, fontSize: '14px', fontWeight: 600 }}>{step.enabled ? 'Active' : 'Paused'}</span>
                  </label>
                  <button onClick={() => setSequenceSteps(sequenceSteps.filter(s => s.id !== step.id))} style={{ background: 'none', border: 'none', color: THEME.colors.error, cursor: 'pointer', padding: '8px', opacity: 0.8 }} title="Delete Step">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => {
                const lastDay = sequenceSteps.length > 0 ? Math.max(...sequenceSteps.map(s => s.day || 0)) : 0;
                const lastEnd = sequenceSteps.length > 0 ? Math.max(...sequenceSteps.map(s => (s.postStartIndex ?? 0) + (s.postCount ?? 1))) : 0;
                setSequenceSteps([...sequenceSteps, { id: Math.random().toString(), day: lastDay + 1, actions: { like: true, comment: false, connect: false, message: false }, postTarget: `recent_${lastEnd + 1}`, postStartIndex: lastEnd, postCount: 1, enabled: true }]);
              }} style={styles.btn('secondary')}>
                <Plus size={16} /> Add Custom Step
              </button>
              <button onClick={saveSettings} disabled={savingSettings} style={styles.btn('primary', savingSettings)}>
                {savingSettings ? 'Saving...' : 'Save Sequence'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB: SETTINGS ==================== */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: THEME.radius.md }}>
                <Zap size={24} color={THEME.colors.success} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '18px' }}>Autopilot Engine</h3>
                <p style={{ margin: '4px 0 0 0', color: THEME.colors.text.secondary, fontSize: '13px' }}>Run tasks automatically via CRON schedule</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: THEME.radius.md, border: `1px solid ${THEME.colors.border}` }}>
                <div>
                  <h4 style={{ margin: 0, color: 'white', fontSize: '15px' }}>Enable Autopilot</h4>
                  <p style={{ margin: '4px 0 0 0', color: THEME.colors.text.muted, fontSize: '13px' }}>Requires browser extension to be open</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', width: '44px', height: '24px', background: autopilotEnabled ? THEME.colors.success : 'rgba(255,255,255,0.1)', borderRadius: '12px', transition: '0.3s' }}>
                    <div style={{ position: 'absolute', top: '2px', left: autopilotEnabled ? '22px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.3s' }} />
                  </div>
                  <input type="checkbox" hidden checked={autopilotEnabled} onChange={e => setAutopilotEnabled(e.target.checked)} />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', color: THEME.colors.text.secondary, marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>DAILY EXECUTION TIME</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="time" value={autopilotTime} onChange={e => setAutopilotTime(e.target.value)} style={{ ...styles.input, width: '150px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: THEME.colors.text.muted, fontSize: '13px' }}>
                    <AlertCircle size={14} /> Executes via CRON job.
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: THEME.colors.text.secondary, marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>MAX LEADS TO PROCESS DAILY</label>
                <input type="number" min="1" max="100" value={profilesPerDay} onChange={e => setProfilesPerDay(parseInt(e.target.value) || 20)} style={{ ...styles.input, width: '150px' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: THEME.colors.text.secondary, marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                  <Timer size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  DELAY BETWEEN LEAD BULK TASKS
                </label>
                <p style={{ margin: '0 0 8px 0', color: THEME.colors.text.muted, fontSize: '12px' }}>
                  Time gap between processing each lead. E.g., if 20 leads with 5 min delay = ~100 min total.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {DELAY_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setBulkTaskDelay(opt.value)} style={{
                      ...styles.btn(bulkTaskDelay === opt.value ? 'primary' : 'secondary'),
                      padding: '8px 14px', fontSize: '13px',
                    }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(105, 63, 233, 0.1)', padding: '10px', borderRadius: THEME.radius.md }}>
                <Wand2 size={24} color={THEME.colors.primaryLight} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '18px' }}>Content Strategy</h3>
                <p style={{ margin: '4px 0 0 0', color: THEME.colors.text.secondary, fontSize: '13px' }}>Configure how AI writes comments</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: THEME.colors.text.secondary, marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>YOUR BUSINESS CONTEXT (AI PROMPT)</label>
                <textarea value={businessContext} onChange={e => setBusinessContext(e.target.value)} style={{ ...styles.input, minHeight: '180px', resize: 'vertical', lineHeight: '1.5' }}
                  placeholder="E.g., I am a SaaS founder selling a B2B marketing tool. My goal is to build relationships with VPs of Marketing." />
              </div>
            </div>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${THEME.colors.border}`, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={saveSettings} disabled={savingSettings} style={styles.btn('primary', savingSettings)}>
                {savingSettings ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save All Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== INSTANT WARM UP MODAL ==================== */}
      {showInstantModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div style={{ ...styles.card, width: '500px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}><Zap color={THEME.colors.warning} /> Instant Warm Up</h2>
              <button onClick={() => setShowInstantModal(false)} style={{ background: 'none', border: 'none', color: THEME.colors.text.muted, cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ marginBottom: '24px', background: 'rgba(245, 158, 11, 0.1)', border: `1px solid rgba(245, 158, 11, 0.3)`, padding: '16px', borderRadius: THEME.radius.md, color: THEME.colors.warning, fontSize: '14px' }}>
              Instantly execute engagement for <strong>{selectedLeads.size} leads</strong>. Each lead = 1 bulk task sent to extension.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: THEME.colors.text.secondary, marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>WHICH POSTS TO ENGAGE?</label>
                <select value={instantConfig.postTarget} onChange={e => setInstantConfig({ ...instantConfig, postTarget: e.target.value })} style={styles.select}>
                  {POST_TARGETS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: THEME.colors.text.secondary, marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>ACTIONS TO EXECUTE</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setInstantConfig({ ...instantConfig, like: !instantConfig.like })} style={{ ...styles.btn(instantConfig.like ? 'primary' : 'secondary'), flex: 1 }}>
                    {instantConfig.like ? <CheckSquare size={16} /> : <Square size={16} />} Like
                  </button>
                  <button onClick={() => setInstantConfig({ ...instantConfig, comment: !instantConfig.comment })} style={{ ...styles.btn(instantConfig.comment ? 'primary' : 'secondary'), flex: 1 }}>
                    {instantConfig.comment ? <CheckSquare size={16} /> : <Square size={16} />} AI Comment
                  </button>
                </div>
              </div>
            </div>

            {/* Progress bar for instant warmup */}
            {bulkEngaging && (
              <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: `1px solid rgba(245, 158, 11, 0.3)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={14} className="animate-spin" color={THEME.colors.warning} />
                    <span style={{ fontSize: '13px', color: THEME.colors.warning, fontWeight: 600 }}>Processing...</span>
                  </div>
                  <button onClick={cancelInstantWarmup} style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <X size={12} color={THEME.colors.error} />
                    <span style={{ color: THEME.colors.error, fontSize: '11px', fontWeight: 600 }}>Stop</span>
                  </button>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{
                    width: instantProgress.total > 0 ? `${(instantProgress.current / instantProgress.total) * 100}%` : '100%',
                    height: '100%',
                    background: THEME.colors.warning,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: THEME.colors.text.secondary }}>{instantProgress.message}</span>
                  {instantProgress.total > 0 && (
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>
                      {instantProgress.current} / {instantProgress.total}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setShowInstantModal(false); setBulkEngaging(false); }} disabled={bulkEngaging} style={styles.btn('secondary')}>Cancel</button>
              <button onClick={handleExecuteInstant} disabled={bulkEngaging} style={{ ...styles.btn('primary'), background: THEME.colors.warning }}>
                {bulkEngaging ? <><Loader2 size={16} className="animate-spin" /> Executing...</> : `Execute Now (${selectedLeads.size} Leads)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
