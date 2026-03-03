import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Settings, Download, Upload, Search, X, Users, FileText, Heart, MessageCircle,
  ThumbsUp, Trash2, ChevronDown, ChevronRight, ChevronUp, Check, AlertCircle, Loader2,
  Sparkles, RefreshCw, ExternalLink, HelpCircle, UserPlus, Send, Plus, Minus,
  Clock, GripVertical, Edit2, Wand2, Eye, EyeOff, LayoutList, LayoutGrid, Calendar,
  BarChart2, Zap, PlayCircle, Target, Activity, CheckSquare, Square
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
}

interface Settings {
  campaignName?: string;
  businessContext?: string;
  campaignGoal?: string;
  profilesPerDay?: number;
  autopilotEnabled?: boolean;
  autopilotTime?: string;
  postsToEngage?: number | 'random_2' | 'random_3' | 'random_5' | 'all';
  sequenceSteps?: string;
  bulkTaskLimit?: number;
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
  postTarget: 'recent_1' | 'recent_2' | 'random_1' | 'random_2' | 'all';
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
  status: 'completed' | 'failed' | 'running';
}

interface Props {
  t?: any;
  user?: any;
  miniIcon?: any;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  extensionConnected?: boolean;
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
const POST_TARGETS = [
  { value: 'recent_1', label: 'Recent 1st Post' },
  { value: 'recent_2', label: 'Recent 2 Posts' },
  { value: 'recent_3', label: 'Recent 3 Posts' },
  { value: 'random_1', label: 'Random 1 Post' },
  { value: 'random_2', label: 'Random 2 Posts' },
  { value: 'all', label: 'All Recent Posts' },
];

const DEFAULT_SEQUENCE: SequenceStep[] = [
  { id: '1', day: 1, actions: { like: true, comment: true, connect: false, message: false }, postTarget: 'recent_1', enabled: true, time: 'anytime' },
  { id: '2', day: 3, actions: { like: true, comment: false, connect: false, message: false }, postTarget: 'recent_2', enabled: true, time: 'anytime' },
];

// MOCK DATA for Dashboard
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
  const { apiGet, apiPost, apiDelete, getAuthToken } = useApi();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'sequence' | 'settings'>('overview');

  // Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('detail'); 
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  
  // Actions State
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [engagingPostId, setEngagingPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<{ postId: string; text: string } | null>(null);
  const [generatingAiId, setGeneratingAiId] = useState<string | null>(null);
  
  // Instant Warmup Modal State
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [instantConfig, setInstantConfig] = useState({ postTarget: 'recent_1', like: true, comment: true });
  const [bulkEngaging, setBulkEngaging] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<Settings | null>(null);
  const [campaignName, setCampaignName] = useState('My Warm Leads');
  const [businessContext, setBusinessContext] = useState('');
  const [profilesPerDay, setProfilesPerDay] = useState(20);
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);
  const [autopilotTime, setAutopilotTime] = useState('09:00');
  const [sequenceSteps, setSequenceSteps] = useState<SequenceStep[]>(DEFAULT_SEQUENCE);
  const [savingSettings, setSavingSettings] = useState(false);

  // Sequence Generator State
  const [genDays, setGenDays] = useState(5);
  const [genPosts, setGenPosts] = useState('recent_1');

  // Refs
  const csvFileRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load Data
  const loadLeads = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiGet('/api/warm-leads');
      if (data.success) {
        // Assign random mock status for testing UI
        const mappedLeads = (data.leads || []).map((l: any, i: number) => ({
          ...l,
          engagementType: i % 3 === 0 ? 'instant' : i % 2 === 0 ? 'scheduled' : 'unassigned'
        }));
        setLeads(mappedLeads);

        if (data.settings && !silent) {
          setSettings(data.settings);
          setCampaignName(data.settings.campaignName || 'My Warm Leads');
          setBusinessContext(data.settings.businessContext || '');
          setProfilesPerDay(data.settings.profilesPerDay || 20);
          setAutopilotEnabled(data.settings.autopilotEnabled || false);
          setAutopilotTime(data.settings.autopilotTime || '09:00');
          
          try {
            const parsedSteps = JSON.parse(data.settings.sequenceSteps);
            setSequenceSteps(parsedSteps.length ? parsedSteps : DEFAULT_SEQUENCE);
          } catch { setSequenceSteps(DEFAULT_SEQUENCE); }
        }
      }
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoading(false); }
  }, []); 

  useEffect(() => { loadLeads(); }, []); 

  // Save Settings
  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await apiPost('/api/warm-leads', {
        action: 'save_settings',
        campaignName, businessContext, profilesPerDay, sequenceSteps, autopilotEnabled, autopilotTime
      });
      if (res.success) showToast?.('Settings saved successfully!', 'success');
    } catch (e: any) { showToast?.('Error saving settings', 'error'); }
    finally { setSavingSettings(false); }
  };

  // Import
  const handleImport = async () => {
    const urls = importText.split('\n').map(l => l.trim()).filter(l => l.includes('linkedin.com/in/'));
    if (!urls.length) return showToast?.('No valid LinkedIn URLs found', 'error');
    setImporting(true);
    try {
      const leadsList = urls.map(url => ({ linkedinUrl: url.split('?')[0].replace(/\/$/, '') }));
      const res = await apiPost('/api/warm-leads', { leads: leadsList });
      if (res.success) {
        showToast?.(`Imported ${res.created} leads successfully`, 'success');
        setImportText('');
        setShowImport(false);
        loadLeads();
      }
    } catch (e: any) { showToast?.('Import failed', 'error'); }
    finally { setImporting(false); }
  };

  // Generate Sequence
  const handleGenerateSequence = () => {
    const newSteps: SequenceStep[] = [];
    for (let i = 1; i <= genDays; i += 2) {
      newSteps.push({
        id: Math.random().toString(),
        day: i,
        actions: { like: true, comment: true, connect: false, message: false },
        postTarget: genPosts as any,
        enabled: true,
        time: 'anytime'
      });
    }
    setSequenceSteps(newSteps);
    showToast?.(`Generated ${newSteps.length} steps automatically`, 'success');
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
    } catch (e) { setFetchingPosts(false); showToast?.('Error starting fetch', 'error'); }
  };

  // Bulk Instant Engage
  const handleExecuteInstant = async () => {
    if (selectedLeads.size === 0) return showToast?.('Select leads to engage', 'error');
    if (!extensionConnected) return showToast?.('Extension not connected', 'error');
    
    setBulkEngaging(true);
    showToast?.('Sending instant bulk task to extension...', 'info');
    
    // Simulate updating leads state
    setTimeout(() => {
      setLeads(prev => prev.map(l => selectedLeads.has(l.id) ? { ...l, engagementType: 'instant', touchCount: (l.touchCount || 0) + 1 } : l));
      setBulkEngaging(false);
      setShowInstantModal(false);
      showToast?.(`Instant warmup queued for ${selectedLeads.size} leads!`, 'success');
      setSelectedLeads(new Set());
    }, 1500);
  };

  const scheduleSelected = () => {
    if (selectedLeads.size === 0) return;
    setLeads(prev => prev.map(l => selectedLeads.has(l.id) ? { ...l, engagementType: 'scheduled' } : l));
    showToast?.(`Added ${selectedLeads.size} leads to Autopilot Sequence`, 'success');
    setSelectedLeads(new Set());
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
    } catch (e) { showToast?.('Engagement failed', 'error'); }
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
    } catch (e) { showToast?.('AI Error', 'error'); }
    finally { setGeneratingAiId(null); }
  };

  const deleteLead = async (id: string) => {
    try {
      await apiDelete(`/api/warm-leads?id=${id}`);
      setLeads(prev => prev.filter(l => l.id !== id));
      showToast?.('Lead deleted', 'success');
    } catch { showToast?.('Delete failed', 'error'); }
  };

  // Computed Stats
  const stats = useMemo(() => {
    const total = leads.length;
    const fetched = leads.filter(l => l.postsFetched).length;
    const instant = leads.filter(l => l.engagementType === 'instant').length;
    const scheduled = leads.filter(l => l.engagementType === 'scheduled').length;
    const unassigned = leads.filter(l => !l.engagementType || l.engagementType === 'unassigned').length;
    return { total, fetched, instant, scheduled, unassigned };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => (l.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || l.linkedinUrl.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [leads, searchQuery]);

  return (
    <div style={styles.container}>
      {/* GLOBAL HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
            Lead Warmer <span style={styles.badge(THEME.colors.primaryLight)}>Dashboard</span>
          </h1>
          <p style={{ color: THEME.colors.text.secondary, margin: 0, fontSize: '15px' }}>
            Automate personalized engagement with your prospects' content.
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

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: `1px solid ${THEME.colors.border}`, paddingBottom: '12px' }}>
        {[
          { id: 'overview', label: 'Overview', icon: BarChart2 },
          { id: 'pipeline', label: 'Leads Pipeline', icon: LayoutList },
          { id: 'sequence', label: 'Warming Sequence', icon: Target },
          { id: 'settings', label: 'Autopilot Settings', icon: Zap },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab.id ? 'rgba(105, 63, 233, 0.1)' : 'transparent',
              border: 'none',
              borderRadius: THEME.radius.md,
              color: activeTab === tab.id ? THEME.colors.primaryLight : THEME.colors.text.secondary,
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: THEME.transitions.default,
            }}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== TAB: OVERVIEW ==================== */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={styles.statCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: THEME.colors.text.secondary, fontSize: '14px', fontWeight: 600 }}>Total Leads</span>
                <Users size={18} color={THEME.colors.primaryLight} />
              </div>
              <span style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>{stats.total}</span>
            </div>
            <div style={styles.statCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: THEME.colors.text.secondary, fontSize: '14px', fontWeight: 600 }}>Unassigned</span>
                <HelpCircle size={18} color={THEME.colors.text.muted} />
              </div>
              <span style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>{stats.unassigned}</span>
            </div>
            <div style={styles.statCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: THEME.colors.text.secondary, fontSize: '14px', fontWeight: 600 }}>Instant Engaged</span>
                <Zap size={18} color={THEME.colors.warning} />
              </div>
              <span style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>{stats.instant}</span>
            </div>
            <div style={styles.statCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: THEME.colors.text.secondary, fontSize: '14px', fontWeight: 600 }}>On Autopilot</span>
                <Target size={18} color={THEME.colors.success} />
              </div>
              <span style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>{stats.scheduled}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Upcoming Plan */}
            <div style={styles.card}>
              <h3 style={{ margin: '0 0 16px 0', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color={THEME.colors.primaryLight} /> Upcoming Executions
              </h3>
              {autopilotEnabled ? (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: THEME.radius.md, border: `1px solid ${THEME.colors.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: THEME.colors.text.secondary, fontWeight: 600 }}>Next Run</span>
                    <span style={{ color: THEME.colors.success, fontWeight: 600 }}>Today at {autopilotTime}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: THEME.colors.text.secondary }}>Target Queue</span>
                    <span style={{ color: 'white' }}>{Math.min(stats.scheduled, profilesPerDay)} Leads via Extension</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: THEME.colors.text.muted, border: `1px dashed ${THEME.colors.border}`, borderRadius: THEME.radius.md }}>
                  Autopilot is currently paused. <br/> Enable it in settings to schedule tasks.
                </div>
              )}
            </div>

            {/* Past Executions */}
            <div style={styles.card}>
              <h3 style={{ margin: '0 0 16px 0', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color={THEME.colors.info} /> Recent Performance
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {MOCK_EXECUTIONS.map(log => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: THEME.radius.md, border: `1px solid ${THEME.colors.border}` }}>
                    <div>
                      <span style={{ color: 'white', fontWeight: 600, display: 'block' }}>{log.type === 'instant' ? 'Instant Execution' : 'Autopilot Execution'}</span>
                      <span style={{ color: THEME.colors.text.muted, fontSize: '12px' }}>{new Date(log.date).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: THEME.colors.text.secondary, fontSize: '12px' }}>Leads</span>
                        <span style={{ color: 'white', fontWeight: 600 }}>{log.leadsProcessed}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: THEME.colors.text.secondary, fontSize: '12px' }}>Engagements</span>
                        <span style={{ color: THEME.colors.success, fontWeight: 600 }}>{log.likesGiven + log.commentsGiven}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB: PIPELINE ==================== */}
      {activeTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: THEME.colors.text.muted }} />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search leads by name or URL..." 
                style={{ ...styles.input, paddingLeft: '42px', background: 'rgba(30, 41, 59, 0.5)' }} 
              />
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

          {/* Bulk Action Bar */}
          {selectedLeads.size > 0 && (
            <div style={{ 
              background: 'rgba(105, 63, 233, 0.15)', border: `1px solid rgba(105, 63, 233, 0.3)`, padding: '12px 20px', borderRadius: THEME.radius.md,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeIn 0.2s ease-in-out'
            }}>
              <span style={{ color: 'white', fontWeight: 600 }}>{selectedLeads.size} Leads Selected</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => fetchPosts(Array.from(selectedLeads))} disabled={fetchingPosts} style={styles.btn('secondary')}>
                  <Download size={14} /> Fetch Posts
                </button>
                <button onClick={() => setShowInstantModal(true)} style={{...styles.btn('primary'), background: THEME.colors.warning}}>
                  <Zap size={14} /> Instant Warm Up
                </button>
                <button onClick={scheduleSelected} style={styles.btn('success')}>
                  <Target size={14} /> Set on Autopilot
                </button>
              </div>
            </div>
          )}

          {/* Import Panel */}
          {showImport && (
            <div style={{ ...styles.card, border: `1px solid ${THEME.colors.primaryLight}40` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={20} color={THEME.colors.primaryLight} /> Import Leads
                </h3>
                <button onClick={() => setShowImport(false)} style={{ background: 'none', border: 'none', color: THEME.colors.text.muted, cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                <textarea
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder="Paste LinkedIn Profile URLs here (one per line)...&#10;https://www.linkedin.com/in/username"
                  style={{ ...styles.input, minHeight: '140px', fontFamily: 'monospace' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: THEME.colors.text.muted, fontSize: '13px' }}>
                    {importText.split('\n').filter(l => l.includes('linkedin.com')).length} valid URLs detected
                  </span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="file" ref={csvFileRef} hidden accept=".csv" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const urls = (ev.target?.result as string).split('\n').filter(l => l.includes('linkedin.com/in/')).map(l => {
                            const match = l.match(/(https:\/\/(?:www\.)?linkedin\.com\/in\/[^/,"]+)/);
                            return match ? match[1] : '';
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

          {/* Data Table */}
          <div style={styles.card}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: THEME.colors.text.muted }}>
                <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 20px', color: THEME.colors.primaryLight }} />
                <p style={{ fontSize: '16px' }}>Loading pipeline data...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div style={{ padding: '80px', textAlign: 'center', color: THEME.colors.text.muted }}>
                <Users size={64} style={{ opacity: 0.2, margin: '0 auto 20px' }} />
                <p style={{ fontSize: '18px', marginBottom: '8px', color: 'white', fontWeight: 600 }}>Your pipeline is empty</p>
                <p style={{ fontSize: '14px', marginBottom: '24px' }}>Import LinkedIn URLs to start warming up leads.</p>
                <button onClick={() => setShowImport(true)} style={styles.btn('primary')}>
                  <UserPlus size={16} /> Import Leads
                </button>
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
                        }} checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0} 
                           style={{ width: '16px', height: '16px', accentColor: THEME.colors.primary }}
                        />
                      </th>
                      <th style={styles.th}>Prospect Details</th>
                      <th style={styles.th}>Warmup Status</th>
                      <th style={styles.th}>{viewMode === 'detail' ? 'Content & Engagement' : 'Stats'}</th>
                      <th style={{ ...styles.th, borderRadius: '0 8px 0 0', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => (
                      <tr key={lead.id} style={{ 
                        background: selectedLeads.has(lead.id) ? 'rgba(105,63,233,0.05)' : 'transparent',
                        transition: 'background 0.2s',
                      }} onMouseEnter={(e) => { if(!selectedLeads.has(lead.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                         onMouseLeave={(e) => { if(!selectedLeads.has(lead.id)) e.currentTarget.style.background = 'transparent' }}>
                        
                        <td style={styles.td}>
                          <input 
                            type="checkbox" 
                            checked={selectedLeads.has(lead.id)}
                            onChange={() => {
                              const newSet = new Set(selectedLeads);
                              if (newSet.has(lead.id)) newSet.delete(lead.id);
                              else newSet.add(lead.id);
                              setSelectedLeads(newSet);
                            }} 
                            style={{ width: '16px', height: '16px', accentColor: THEME.colors.primary, marginTop: '4px' }}
                          />
                        </td>
                        
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <a 
                              href={lead.linkedinUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ color: 'white', fontWeight: 600, fontSize: '15px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              {lead.firstName || lead.vanityId || 'Unknown Lead'}
                              <ExternalLink size={12} style={{ color: THEME.colors.text.muted }} />
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
                              lead.engagementType === 'scheduled' ? THEME.colors.success :
                              THEME.colors.text.muted
                            )}>
                              {lead.engagementType === 'instant' ? <Zap size={12} /> : 
                               lead.engagementType === 'scheduled' ? <Target size={12} /> : <HelpCircle size={12} />}
                              {lead.engagementType ? lead.engagementType.toUpperCase() : 'UNASSIGNED'}
                            </span>
                            
                            {lead.postsFetched ? (
                              <span style={{ fontSize: '12px', color: THEME.colors.info, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={12} /> Posts Fetched
                              </span>
                            ) : (
                              <span style={{ fontSize: '12px', color: THEME.colors.text.muted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> Pending Fetch
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ ...styles.td, width: viewMode === 'detail' ? '500px' : 'auto' }}>
                          {viewMode === 'detail' ? (
                            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', maxWidth: '500px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
                              {lead.postsFetched && lead.posts && lead.posts.length > 0 ? (
                                lead.posts.slice(0, 5).map(post => (
                                  <div key={post.id} style={{ 
                                    minWidth: '280px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: THEME.radius.lg, padding: '16px', border: `1px solid ${THEME.colors.border}`, display: 'flex', flexDirection: 'column'
                                  }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                      <span style={{ fontSize: '12px', color: THEME.colors.text.secondary }}>{post.postDate ? new Date(post.postDate).toLocaleDateString() : 'Recent'}</span>
                                      <div style={{ display: 'flex', gap: '12px', color: THEME.colors.text.secondary, fontSize: '12px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={12} /> {post.likes}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageCircle size={12} /> {post.comments}</span>
                                      </div>
                                    </div>
                                    <p style={{ fontSize: '13px', color: THEME.colors.text.primary, lineHeight: '1.5', height: '60px', overflow: 'hidden', marginBottom: '16px', wordBreak: 'break-word' }}>
                                      {post.postText || 'No text content'}
                                    </p>
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
                                <span style={{ color: 'white', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14} color={THEME.colors.text.muted} /> {lead.posts?.length || 0} Posts Available</span>
                              ) : (
                                <span style={{ color: THEME.colors.text.muted, fontSize: '13px' }}>Posts not fetched</span>
                              )}
                            </div>
                          )}
                        </td>

                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button onClick={() => deleteLead(lead.id)} style={{ ...styles.btn('ghost'), color: THEME.colors.text.muted }} title="Remove Lead" onMouseEnter={e => e.currentTarget.style.color = THEME.colors.error} onMouseLeave={e => e.currentTarget.style.color = THEME.colors.text.muted}>
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
              <p style={{ margin: 0, color: THEME.colors.text.secondary, fontSize: '14px' }}>Automate multi-day engagement flows with specific posts and actions.</p>
            </div>
            
            {/* Auto Generate Block */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: THEME.radius.lg, border: `1px solid ${THEME.colors.border}` }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: THEME.colors.text.muted, marginBottom: '4px', fontWeight: 600 }}>DAYS TO WARM</label>
                <input type="number" min="1" max="30" value={genDays} onChange={e => setGenDays(parseInt(e.target.value))} style={{ ...styles.input, width: '80px', padding: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: THEME.colors.text.muted, marginBottom: '4px', fontWeight: 600 }}>POSTS/DAY</label>
                <select value={genPosts} onChange={e => setGenPosts(e.target.value)} style={{ ...styles.select, width: '140px', padding: '8px' }}>
                  {POST_TARGETS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <button onClick={handleGenerateSequence} style={{ ...styles.btn('outline'), padding: '8px 16px' }}>
                <Wand2 size={14} /> Auto-Generate
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sequenceSteps.sort((a,b) => a.day - b.day).map((step, idx) => (
              <div key={step.id} style={{ 
                display: 'flex', alignItems: 'flex-start', gap: '20px', 
                background: step.enabled ? 'rgba(30, 41, 59, 0.8)' : 'rgba(30, 41, 59, 0.3)', 
                padding: '24px', 
                borderRadius: THEME.radius.lg,
                border: `1px solid ${step.enabled ? THEME.colors.border : 'transparent'}`,
                opacity: step.enabled ? 1 : 0.6,
                transition: THEME.transitions.default
              }}>
                {/* Day Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '80px' }}>
                  <label style={{ fontSize: '12px', color: THEME.colors.text.muted, fontWeight: 600 }}>TIMELINE</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: THEME.radius.md, border: `1px solid ${THEME.colors.border}`, padding: '8px' }}>
                    <span style={{ color: THEME.colors.text.secondary, fontSize: '14px', marginRight: '4px' }}>Day</span>
                    <input type="number" min="1" value={step.day} onChange={e => {
                        const newSteps = [...sequenceSteps]; const s = newSteps.find(x => x.id === step.id);
                        if(s) s.day = parseInt(e.target.value) || 1; setSequenceSteps(newSteps);
                      }} style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                  </div>
                </div>

                {/* Target Posts Select */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '200px' }}>
                  <label style={{ fontSize: '12px', color: THEME.colors.text.muted, fontWeight: 600 }}>TARGET POSTS</label>
                  <select value={step.postTarget} onChange={e => {
                      const newSteps = [...sequenceSteps]; const s = newSteps.find(x => x.id === step.id);
                      if(s) s.postTarget = e.target.value as any; setSequenceSteps(newSteps);
                    }} style={styles.select}>
                    {POST_TARGETS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Multi-Action Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <label style={{ fontSize: '12px', color: THEME.colors.text.muted, fontWeight: 600 }}>ACTIONS TO EXECUTE</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {(['like', 'comment'] as const).map(action => (
                      <button key={action} onClick={() => {
                        const newSteps = [...sequenceSteps]; const s = newSteps.find(x => x.id === step.id);
                        if(s) s.actions[action] = !s.actions[action]; setSequenceSteps(newSteps);
                      }} style={{ ...styles.btn(step.actions[action] ? 'primary' : 'secondary'), padding: '6px 12px', fontSize: '13px' }}>
                        {step.actions[action] ? <CheckSquare size={14} /> : <Square size={14} color={THEME.colors.text.muted} />}
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles & Delete */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={step.enabled} onChange={e => {
                        const newSteps = [...sequenceSteps]; const s = newSteps.find(x => x.id === step.id);
                        if(s) s.enabled = e.target.checked; setSequenceSteps(newSteps);
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
              <button onClick={() => setSequenceSteps([...sequenceSteps, { id: Math.random().toString(), day: sequenceSteps.length > 0 ? Math.max(...sequenceSteps.map(s => s.day)) + 1 : 1, actions: { like: true, comment: false, connect: false, message: false }, postTarget: 'recent_1', enabled: true }])} style={styles.btn('secondary')}>
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
          {/* Autopilot Config */}
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
                    <AlertCircle size={14} /> Executes automatically via CRON job. If PC is asleep, runs on next wake.
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: THEME.colors.text.secondary, marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>MAX LEADS TO PROCESS DAILY</label>
                <input type="number" min="1" max="100" value={profilesPerDay} onChange={e => setProfilesPerDay(parseInt(e.target.value))} style={{ ...styles.input, width: '150px' }} />
              </div>
            </div>
          </div>

          {/* AI & Content Settings */}
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
                <textarea 
                  value={businessContext} 
                  onChange={e => setBusinessContext(e.target.value)} 
                  style={{ ...styles.input, minHeight: '180px', resize: 'vertical', lineHeight: '1.5' }} 
                  placeholder="E.g., I am a SaaS founder selling a B2B marketing tool. My goal is to build relationships with VPs of Marketing by providing insightful, non-salesy comments on their posts that add value to their perspective." 
                />
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

      {/* ==================== MODALS ==================== */}
      {/* Instant Warm Up Modal */}
      {showInstantModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div style={{ ...styles.card, width: '500px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}><Zap color={THEME.colors.warning} /> Instant Warm Up</h2>
              <button onClick={() => setShowInstantModal(false)} style={{ background: 'none', border: 'none', color: THEME.colors.text.muted, cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ marginBottom: '24px', background: 'rgba(245, 158, 11, 0.1)', border: `1px solid rgba(245, 158, 11, 0.3)`, padding: '16px', borderRadius: THEME.radius.md, color: THEME.colors.warning, fontSize: '14px' }}>
              You are about to instantly execute engagement tasks for <strong>{selectedLeads.size} selected leads</strong>. This will bypass the scheduled sequence.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: THEME.colors.text.secondary, marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>WHICH POSTS TO ENGAGE?</label>
                <select value={instantConfig.postTarget} onChange={e => setInstantConfig({...instantConfig, postTarget: e.target.value})} style={styles.select}>
                  {POST_TARGETS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: THEME.colors.text.secondary, marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>ACTIONS TO EXECUTE</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setInstantConfig({...instantConfig, like: !instantConfig.like})} style={{ ...styles.btn(instantConfig.like ? 'primary' : 'secondary'), flex: 1 }}>
                    {instantConfig.like ? <CheckSquare size={16} /> : <Square size={16} />} Like
                  </button>
                  <button onClick={() => setInstantConfig({...instantConfig, comment: !instantConfig.comment})} style={{ ...styles.btn(instantConfig.comment ? 'primary' : 'secondary'), flex: 1 }}>
                    {instantConfig.comment ? <CheckSquare size={16} /> : <Square size={16} />} AI Comment
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowInstantModal(false)} style={styles.btn('secondary')}>Cancel</button>
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
