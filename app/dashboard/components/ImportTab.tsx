import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

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
  sequenceSteps?: string;
  bulkTaskLimit?: number;
}

interface SequenceStep {
  day: number;
  action: string;
  enabled: boolean;
}

interface Props {
  t?: any;
  user?: any;
  miniIcon?: any;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  extensionConnected?: boolean;
}

// ============= CONSTANTS =============
const STATUS_COLORS = {
  pending_fetch: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8', label: 'Pending' },
  fetched: { bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.3)', text: '#60a5fa', label: 'Fetched' },
  engaged: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24', label: 'Engaged' },
  connected: { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)', text: '#34d399', label: 'Connected' },
};

const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  follow: { label: 'Follow', icon: '👤', color: '#60a5fa' },
  like: { label: 'Like Post', icon: '👍', color: '#34d399' },
  comment: { label: 'Comment', icon: '💬', color: '#a78bfa' },
  connect: { label: 'Connect', icon: '🤝', color: '#10b981' },
};

const DEFAULT_SEQUENCE: SequenceStep[] = [
  { day: 1, action: 'follow', enabled: true },
  { day: 3, action: 'like', enabled: true },
  { day: 5, action: 'comment', enabled: true },
  { day: 7, action: 'like', enabled: true },
  { day: 10, action: 'connect', enabled: false },
];

// All magic numbers extracted to constants
const DEFAULTS = {
  PROFILES_PER_DAY: 20,
  MAX_PROFILES_PER_DAY: 50,
  POLL_INTERVAL_MS: 3000,
  POLL_TIMEOUT_MS: 300000,
  DEBOUNCE_MS: 300,
  MAX_HEADLINE_LENGTH: 50,
  MAX_POST_PREVIEW_LINES: 60,
  AUTO_REFRESH_INTERVAL_MS: 30000,
  ENGAGEMENT_DELAY_MS: 5000,
  UNDO_TIMEOUT_MS: 5000,
  BULK_LIMIT: 10,
};

// Filter constant
const FILTER_ALL = 'all';

// ============= STYLES =============
const styles = {
  card: { background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' as const },
  input: { padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', width: '100%' as const },
  btn: (bg: string, disabled = false) => ({
    padding: '8px 16px',
    background: disabled ? 'rgba(255,255,255,0.1)' : bg,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700' as const,
    fontSize: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }),
};

// ============= HOOKS =============
const useApi = () => {
  const getAuthToken = useCallback(() => typeof window !== 'undefined' ? localStorage.getItem('authToken') : null, []);

  const apiGet = useCallback(async (url: string) => {
    const token = getAuthToken();
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`API Error: ${res.status} - ${error}`);
    }
    return res.json();
  }, [getAuthToken]);

  const apiPost = useCallback(async (url: string, body: any) => {
    const token = getAuthToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`API Error: ${res.status} - ${error}`);
    }
    return res.json();
  }, [getAuthToken]);

  const apiDelete = useCallback(async (url: string) => {
    const token = getAuthToken();
    const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`API Error: ${res.status} - ${error}`);
    }
    return res.json();
  }, [getAuthToken]);

  return { apiGet, apiPost, apiDelete, getAuthToken };
};

export default function ImportTab(props: Props) {
  const { showToast, extensionConnected = false } = props;
  const { apiGet, apiPost, apiDelete, getAuthToken } = useApi();

  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>(FILTER_ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [fetchProgress, setFetchProgress] = useState('');
  const [engagingPost, setEngagingPost] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [importingCsv, setImportingCsv] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<{ postId: string; text: string } | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [recentlyDeleted, setRecentlyDeleted] = useState<Lead | null>(null);

  const [importText, setImportText] = useState('');
  const csvFileRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  const [campaignName, setCampaignName] = useState('My Warm Leads');
  const [businessContext, setBusinessContext] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('relationship');
  const [profilesPerDay, setProfilesPerDay] = useState(DEFAULTS.PROFILES_PER_DAY);
  const [sequenceSteps, setSequenceSteps] = useState<SequenceStep[]>(DEFAULT_SEQUENCE);
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), DEFAULTS.DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-refresh leads every 30 seconds
  useEffect(() => {
    autoRefreshRef.current = setInterval(() => {
      loadLeads(false);
    }, DEFAULTS.AUTO_REFRESH_INTERVAL_MS);
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, []);

  // Load leads
  const loadLeads = useCallback(async (showLoading = true) => {
    if (showLoading) setLeadsLoading(true);
    try {
      const data = await apiGet('/api/warm-leads');
      if (data.success) {
        setLeads(data.leads || []);
        if (data.settings) {
          setSettings(data.settings);
          setCampaignName(data.settings.campaignName || 'My Warm Leads');
          setBusinessContext(data.settings.businessContext || '');
          setCampaignGoal(data.settings.campaignGoal || 'relationship');
          setProfilesPerDay(data.settings.profilesPerDay || DEFAULTS.PROFILES_PER_DAY);
          setAutopilotEnabled(data.settings.autopilotEnabled || false);
          try { setSequenceSteps(JSON.parse(data.settings.sequenceSteps)); } catch { setSequenceSteps(DEFAULT_SEQUENCE); }
        }
      }
    } catch (e) { console.error('Load leads error:', e); }
    finally { if (showLoading) setLeadsLoading(false); }
  }, [apiGet]);

  // Save settings
  const saveSettings = useCallback(async () => {
    setSettingsSaving(true);
    try {
      const data = await apiPost('/api/warm-leads', {
        action: 'save_settings',
        campaignName, businessContext, campaignGoal, profilesPerDay,
        sequenceSteps, autopilotEnabled,
      });
      if (data.success) {
        setSettings(data.settings);
        showToast?.('Settings saved!', 'success');
      } else { showToast?.(data.error || 'Failed to save', 'error'); }
    } catch (e: any) { showToast?.('Error: ' + e.message, 'error'); }
    finally { setSettingsSaving(false); }
  }, [apiPost, campaignName, businessContext, campaignGoal, profilesPerDay, sequenceSteps, autopilotEnabled, showToast]);

  // Import leads from text
  const handleImportLeads = useCallback(async () => {
    const urls = importText.split('\n').map(l => l.trim()).filter(l => l.includes('linkedin.com/in/'));
    if (urls.length === 0) { showToast?.('No LinkedIn URLs found', 'error'); return; }
    const leadsList = urls.map(url => ({ linkedinUrl: url.split('?')[0].replace(/\/$/, '') }));
    try {
      const data = await apiPost('/api/warm-leads', { leads: leadsList });
      if (data.success) {
        showToast?.(`Added ${data.created} leads (${data.skipped?.length || 0} duplicates)`, 'success');
        setImportText('');
        loadLeads();
      } else { showToast?.(data.error || 'Import failed', 'error'); }
    } catch (e: any) { showToast?.('Error: ' + e.message, 'error'); }
  }, [importText, apiPost, loadLeads, showToast]);

  // CSV parsing with error handling
  const parseCsvLine = useCallback((line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }, []);

  // CSV upload with error handling and loading state
  const handleCsvUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingCsv(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const text = ev.target?.result as string;
          if (!text) {
            showToast?.('File is empty', 'error');
            setImportingCsv(false);
            return;
          }
          const lines = text.split('\n');
          const header = parseCsvLine(lines[0]?.toLowerCase() || '');
          const urlCol = header.findIndex(h => h.includes('url') || h.includes('linkedin'));
          const leadsList: { linkedinUrl: string }[] = [];

          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const cols = parseCsvLine(lines[i]);
            const url = (cols[urlCol >= 0 ? urlCol : 0] || '').replace(/^"|"$/g, '');
            if (url.includes('linkedin.com/in/')) {
              leadsList.push({ linkedinUrl: url.split('?')[0].replace(/\/$/, '') });
            }
          }

          if (leadsList.length > 0) {
            const data = await apiPost('/api/warm-leads', { leads: leadsList });
            if (data.success) {
              showToast?.(`Imported ${data.created} leads`, 'success');
              loadLeads();
            } else {
              showToast?.(data.error || 'Import failed', 'error');
            }
          } else {
            showToast?.('No LinkedIn URLs found in CSV', 'error');
          }
        } catch (err: any) {
          showToast?.('Error parsing CSV: ' + err.message, 'error');
        } finally {
          setImportingCsv(false);
        }
      };
      reader.onerror = () => {
        showToast?.('Error reading file', 'error');
        setImportingCsv(false);
      };
      reader.readAsText(file);
    } catch (err: any) {
      showToast?.('Error: ' + err.message, 'error');
      setImportingCsv(false);
    }
    e.target.value = '';
  }, [parseCsvLine, apiPost, loadLeads, showToast]);

  // Download CSV template
  const downloadTemplate = useCallback(() => {
    const csvContent = 'linkedin_url\nhttps://linkedin.com/in/example-profile-1\nhttps://linkedin.com/in/example-profile-2';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Fetch posts for leads
  const fetchPostsForLeads = useCallback(async (leadIds?: string[]) => {
    if (!extensionConnected) { showToast?.('Extension not connected. Please open LinkedIn.', 'error'); return; }
    setFetchingPosts(true);
    setFetchProgress('Starting...');
    const targetLeads = leadIds ? leads.filter(l => leadIds.includes(l.id)) : leads.filter(l => !l.postsFetched);
    if (targetLeads.length === 0) { showToast?.('No leads to fetch', 'info'); setFetchingPosts(false); return; }
    const bulkLimit = settings?.bulkTaskLimit || DEFAULTS.BULK_LIMIT;
    const batch = targetLeads.slice(0, bulkLimit);
    try {
      const batchData = batch.map(l => ({
        leadId: l.id,
        vanityId: l.vanityId || l.linkedinUrl.match(/linkedin\.com\/in\/([^/?#]+)/i)?.[1],
      })).filter(b => b.vanityId);

      const res = await fetch('/api/extension/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ command: 'fetch_lead_posts_bulk', data: { leads: batchData } })
      });
      const data = await res.json();
      if (data.success) {
        showToast?.(`Fetching posts for ${batchData.length} leads...`, 'info');

        // Clear any existing intervals/timeouts
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

        // Declare timeoutId BEFORE the interval
        const timeoutId = setTimeout(() => {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setFetchingPosts(false);
          setFetchProgress('');
          showToast?.('Fetch timed out', 'error');
        }, DEFAULTS.POLL_TIMEOUT_MS);

        pollTimeoutRef.current = timeoutId;

        pollIntervalRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/extension/command?commandId=${data.commandId}`, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
            const statusData = await statusRes.json();
            if (statusData.command?.status === 'completed') {
              clearInterval(pollIntervalRef.current!);
              clearTimeout(pollTimeoutRef.current!);
              pollIntervalRef.current = null;
              pollTimeoutRef.current = null;
              setFetchingPosts(false);
              setFetchProgress('');
              showToast?.(`Fetched posts for ${statusData.command.data?.success || 0} leads!`, 'success');
              loadLeads();
            } else if (statusData.command?.status === 'failed') {
              clearInterval(pollIntervalRef.current!);
              clearTimeout(pollTimeoutRef.current!);
              pollIntervalRef.current = null;
              pollTimeoutRef.current = null;
              setFetchingPosts(false);
              showToast?.('Fetch failed', 'error');
            } else if (statusData.command?.data?.progress) {
              setFetchProgress(statusData.command.data.progress);
            }
          } catch (e) {}
        }, DEFAULTS.POLL_INTERVAL_MS);
      } else { showToast?.(data.error || 'Failed', 'error'); setFetchingPosts(false); }
    } catch (e: any) { showToast?.('Error: ' + e.message, 'error'); setFetchingPosts(false); }
  }, [extensionConnected, leads, settings?.bulkTaskLimit, getAuthToken, loadLeads, showToast]);

  // Bulk fetch selected leads
  const handleBulkFetch = useCallback(() => {
    if (selectedLeads.size > 0) {
      fetchPostsForLeads(Array.from(selectedLeads));
    }
  }, [selectedLeads, fetchPostsForLeads]);

  // Bulk delete selected leads
  const handleBulkDelete = useCallback(async () => {
    if (selectedLeads.size === 0) return;
    for (const id of selectedLeads) {
      try {
        await apiDelete(`/api/warm-leads?id=${id}`);
      } catch (e) { console.error('Error deleting lead:', e); }
    }
    showToast?.(`Deleted ${selectedLeads.size} leads`, 'success');
    setSelectedLeads(new Set());
    loadLeads();
  }, [selectedLeads, apiDelete, loadLeads, showToast]);

  // Engage with post
  const engageWithPost = useCallback(async (lead: Lead, post: Post, action: 'like' | 'comment', commentText?: string) => {
    if (!extensionConnected) { showToast?.('Extension not connected', 'error'); return; }
    setEngagingPost(post.id);
    try {
      const res = await fetch('/api/extension/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify({
          command: 'engage_lead_post',
          data: { postUrn: post.postUrn, enableLike: action === 'like', enableComment: action === 'comment', commentText: commentText || '', leadId: lead.id, postId: post.id }
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast?.(`${action === 'like' ? 'Liking' : 'Commenting on'} post...`, 'info');
        setTimeout(() => { loadLeads(); setEngagingPost(null); }, DEFAULTS.ENGAGEMENT_DELAY_MS);
      } else { showToast?.(data.error || 'Failed', 'error'); setEngagingPost(null); }
    } catch (e: any) { showToast?.('Error: ' + e.message, 'error'); setEngagingPost(null); }
  }, [extensionConnected, getAuthToken, loadLeads, showToast]);

  // Delete lead with undo functionality
  const deleteLead = useCallback((lead: Lead) => {
    // Store the lead for undo
    setRecentlyDeleted(lead);

    // Remove from UI immediately
    setLeads(prev => prev.filter(l => l.id !== lead.id));

    showToast?.(`Deleted ${lead.firstName || lead.vanityId || 'lead'}`, 'success');

    // Clear any existing undo timeout
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);

    // Set timeout to permanently delete
    undoTimeoutRef.current = setTimeout(async () => {
      try {
        await apiDelete(`/api/warm-leads?id=${lead.id}`);
      } catch (e) { console.error('Error deleting lead:', e); }
      setRecentlyDeleted(null);
    }, DEFAULTS.UNDO_TIMEOUT_MS);
  }, [apiDelete, showToast]);

  // Undo delete
  const undoDelete = useCallback(() => {
    if (recentlyDeleted) {
      setLeads(prev => [...prev, recentlyDeleted]);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      setRecentlyDeleted(null);
      showToast?.('Restore successful', 'success');
    }
  }, [recentlyDeleted, showToast]);

  // Toggle lead selection
  const toggleLeadSelection = useCallback((leadId: string) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  }, []);

  // Memoized filtered leads (must be before toggleAllSelection)
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (statusFilter !== FILTER_ALL && l.status !== statusFilter) return false;
      if (debouncedQuery) {
        const q = debouncedQuery.toLowerCase();
        return (l.firstName || '').toLowerCase().includes(q) || (l.lastName || '').toLowerCase().includes(q) ||
          (l.company || '').toLowerCase().includes(q) || (l.linkedinUrl || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [leads, statusFilter, debouncedQuery]);

  // Toggle all selection
  const toggleAllSelection = useCallback(() => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  }, [selectedLeads.size, filteredLeads]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter(FILTER_ALL);
    setSelectedLeads(new Set());
  }, []);

  // Initial load
  useEffect(() => { loadLeads(); }, [loadLeads]);

  // Cleanup interval and timeout on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, []);

  // Memoized status counts
  const statusCounts = useMemo(() => ({
    pending_fetch: leads.filter(l => l.status === 'pending_fetch').length,
    fetched: leads.filter(l => l.status === 'fetched').length,
    engaged: leads.filter(l => l.status === 'engaged').length,
    connected: leads.filter(l => l.status === 'connected').length,
  }), [leads]);

  // Count detected URLs in import text
  const detectedUrlCount = useMemo(() =>
    importText.split('\n').filter(l => l.includes('linkedin.com/in/')).length,
    [importText]
  );

  // Check if any filters are active
  const hasActiveFilters = searchQuery || statusFilter !== FILTER_ALL;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Undo delete toast */}
      {recentlyDeleted && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          background: 'rgba(30,30,60,0.95)', padding: '12px 16px', borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <span style={{ color: 'white', fontSize: '12px' }}>
            Deleted {recentlyDeleted.firstName || recentlyDeleted.vanityId || 'lead'}
          </span>
          <button onClick={undoDelete} style={styles.btn('rgba(105,63,233,0.3)')}>
            Undo
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(105,63,233,0.15) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(105,63,233,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '800', margin: 0 }}>Warm Leads</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: '4px 0 0 0' }}>Import → Fetch Posts → Engage → Connect</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Extension Status Indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '6px',
              background: extensionConnected ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
              border: `1px solid ${extensionConnected ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: extensionConnected ? '#34d399' : '#f87171'
              }} />
              <span style={{ fontSize: '10px', color: extensionConnected ? '#34d399' : '#f87171' }}>
                {extensionConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {fetchingPosts && <span style={{ color: '#a78bfa', fontSize: '11px' }}>{fetchProgress || 'Fetching...'}</span>}
            <button onClick={() => setShowSettings(!showSettings)} aria-label="Settings" style={styles.btn('rgba(255,255,255,0.1)')}>Settings</button>
            <button onClick={() => fetchPostsForLeads()} disabled={fetchingPosts || !extensionConnected}
              aria-label="Fetch all posts" style={styles.btn('linear-gradient(135deg, #0077b5, #00a0dc)', fetchingPosts || !extensionConnected)}>
              {fetchingPosts ? 'Fetching...' : 'Fetch All Posts'}
            </button>
          </div>
        </div>
        {/* Pipeline Stats */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
          {Object.entries(STATUS_COLORS).map(([key, val]) => {
            const count = statusCounts[key as keyof typeof statusCounts] || 0;
            const maxCount = Math.max(...Object.values(statusCounts), 1);
            const height = Math.max(20, (count / maxCount) * 50);
            return (
              <div key={key} onClick={() => setStatusFilter(statusFilter === key ? FILTER_ALL : key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setStatusFilter(statusFilter === key ? FILTER_ALL : key)}
                style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '6px 4px',
                  background: statusFilter === key ? val.bg : 'transparent',
                  border: statusFilter === key ? `1px solid ${val.border}` : '1px solid transparent',
                  borderRadius: '8px', transition: 'all 0.2s' }}>
                <div style={{ height: `${height}px`, background: val.bg, borderRadius: '4px 4px 0 0', margin: '0 auto 4px', width: '60%', border: `1px solid ${val.border}` }} />
                <div style={{ fontSize: '16px', fontWeight: '800', color: val.text }}>{count}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>{val.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div style={styles.card}>
          <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: '0 0 12px 0' }}>Engagement Settings</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '4px', display: 'block' }}>Campaign Name</label>
              <input value={campaignName} onChange={e => setCampaignName(e.target.value)} style={styles.input} placeholder="Q1 SaaS Founders Outreach" aria-label="Campaign name" />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '4px', display: 'block' }}>Profiles/Day</label>
              <input type="number" value={profilesPerDay} onChange={e => setProfilesPerDay(parseInt(e.target.value) || DEFAULTS.PROFILES_PER_DAY)} min={1} max={DEFAULTS.MAX_PROFILES_PER_DAY} style={styles.input} aria-label="Profiles per day" />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '4px', display: 'block' }}>Your Business / Offer</label>
            <textarea value={businessContext} onChange={e => setBusinessContext(e.target.value)} rows={2}
              style={{ ...styles.input, resize: 'vertical' }} placeholder="I help SaaS founders reduce churn through onboarding audits..." aria-label="Business context" />
          </div>
          <div style={{ marginTop: '12px' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '6px', display: 'block' }}>Campaign Goal</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { key: 'relationship', icon: '🤝', label: 'Relationship' },
                { key: 'authority', icon: '👑', label: 'Authority' },
                { key: 'warm_pitch', icon: '🎯', label: 'Warm Pitch' },
                { key: 'recruit', icon: '🔍', label: 'Recruit' },
              ].map(g => (
                <button key={g.key} onClick={() => setCampaignGoal(g.key)}
                  style={{ padding: '8px 14px', background: campaignGoal === g.key ? 'rgba(105,63,233,0.2)' : 'rgba(255,255,255,0.05)',
                    border: campaignGoal === g.key ? '2px solid rgba(105,63,233,0.6)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '11px', fontWeight: '600' }}>
                  {g.icon} {g.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '6px', display: 'block' }}>Warm Sequence Timeline</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {sequenceSteps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ padding: '8px 12px', background: step.enabled ? 'rgba(105,63,233,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${step.enabled ? 'rgba(105,63,233,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '8px', cursor: 'pointer', opacity: step.enabled ? 1 : 0.5 }}
                    onClick={() => { const newSteps = [...sequenceSteps]; newSteps[idx].enabled = !newSteps[idx].enabled; setSequenceSteps(newSteps); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && (() => { const newSteps = [...sequenceSteps]; newSteps[idx].enabled = !newSteps[idx].enabled; setSequenceSteps(newSteps); })()}
                  >
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>Day {step.day}</div>
                    <div style={{ fontSize: '11px', color: 'white', fontWeight: '600' }}>
                      {ACTION_LABELS[step.action]?.icon} {ACTION_LABELS[step.action]?.label}
                    </div>
                  </div>
                  {idx < sequenceSteps.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>}
                </div>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px', margin: '6px 0 0 0' }}>Click to enable/disable steps. Follow & Connect are in beta.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={autopilotEnabled} onChange={e => setAutopilotEnabled(e.target.checked)} style={{ accentColor: '#693fe9' }} />
              <span style={{ color: 'white', fontSize: '11px', fontWeight: '600' }}>Autopilot Mode</span>
            </label>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Runs sequences automatically via cron</span>
            <div style={{ flex: 1 }} />
            <button onClick={saveSettings} disabled={settingsSaving} aria-label="Save settings" style={styles.btn('linear-gradient(135deg, #693fe9, #8b5cf6)', settingsSaving)}>
              {settingsSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}

      {/* Import Section */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>Import Leads</h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input ref={csvFileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvUpload} aria-label="Upload CSV file" />
            <button onClick={() => csvFileRef.current?.click()} disabled={importingCsv} style={styles.btn('rgba(255,255,255,0.08)', importingCsv)}>
              {importingCsv ? 'Importing...' : 'Upload CSV'}
            </button>
            <button onClick={downloadTemplate} style={styles.btn('rgba(255,255,255,0.08)')} title="Download CSV template">
              Template
            </button>
            <span style={{ color: '#a78bfa', fontSize: '11px', alignSelf: 'center' }}>
              {detectedUrlCount} detected
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <textarea value={importText} onChange={e => setImportText(e.target.value)}
            placeholder="Paste LinkedIn profile URLs (one per line)" rows={3}
            style={{ ...styles.input, flex: 1, fontFamily: 'monospace', resize: 'vertical' }} aria-label="LinkedIn URLs to import" />
          <button onClick={handleImportLeads} disabled={!importText.trim()} style={{ ...styles.btn('linear-gradient(135deg, #10b981, #059669)', !importText.trim()), alignSelf: 'flex-end' }}>
            Import
          </button>
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search leads..." style={{ ...styles.input, width: '250px' }} aria-label="Search leads" />
        {hasActiveFilters && (
          <button onClick={clearFilters} style={styles.btn('rgba(255,255,255,0.1)')}>
            Clear filters
          </button>
        )}
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{filteredLeads.length} of {leads.length} leads</span>

        {/* Bulk Actions */}
        {leads.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button
              onClick={handleBulkFetch}
              disabled={selectedLeads.size === 0 || !extensionConnected}
              style={styles.btn('linear-gradient(135deg, #0077b5, #00a0dc)', selectedLeads.size === 0 || !extensionConnected)}
            >
              Fetch Selected ({selectedLeads.size})
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedLeads.size === 0}
              style={styles.btn('rgba(248,113,113,0.2)', selectedLeads.size === 0)}
            >
              Delete Selected ({selectedLeads.size})
            </button>
          </div>
        )}
      </div>

      {/* Leads Table */}
      {leadsLoading ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)' }}>Loading leads...</div>
        </div>
      ) : leads.length === 0 ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
          <div style={{ color: 'white', fontWeight: '600', marginBottom: '4px' }}>No leads yet</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Import LinkedIn profile URLs to get started</div>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
          <div style={{ color: 'white', fontWeight: '600', marginBottom: '4px' }}>No results found</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Try adjusting your search or filter</div>
        </div>
      ) : (
        <div style={{ ...styles.card, padding: '0', overflow: 'hidden' }}>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }} role="region" aria-label="Leads list">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '700px' }} role="table">
                <thead style={{ position: 'sticky', top: 0, background: '#1a1a3e', zIndex: 1 }}>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '10px 12px', width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                        onChange={toggleAllSelection}
                        style={{ accentColor: '#693fe9', cursor: 'pointer' }}
                        aria-label="Select all"
                      />
                    </th>
                    {['Name', 'Company', 'Status', 'Posts', 'Engaged', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => {
                    const sc = STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending_fetch;
                    const isExpanded = expandedLeadId === lead.id;
                    const isSelected = selectedLeads.has(lead.id);
                    return (
                      <>
                        <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: isSelected ? 'rgba(105,63,233,0.1)' : 'transparent' }}
                          onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                          role="row"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && setExpandedLeadId(isExpanded ? null : lead.id)}
                        >
                          <td style={{ padding: '10px 12px' }} onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleLeadSelection(lead.id)}
                              style={{ accentColor: '#693fe9', cursor: 'pointer' }}
                              aria-label={`Select ${lead.firstName || lead.vanityId}`}
                            />
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', fontWeight: '600' }}
                              onClick={e => e.stopPropagation()}>
                              {lead.firstName || lead.vanityId || 'Unknown'} {lead.lastName || ''}
                            </a>
                            {lead.headline && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '2px' }}>{lead.headline.slice(0, DEFAULTS.MAX_HEADLINE_LENGTH)}...</div>}
                          </td>
                          <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.6)' }}>{lead.company || '-'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ padding: '3px 8px', background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: '6px', color: sc.text, fontSize: '10px', fontWeight: '600' }}>
                              {sc.label}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#a78bfa', fontWeight: '600' }}>{lead.posts?.length || 0}</td>
                          <td style={{ padding: '10px 12px', color: '#34d399', fontWeight: '600' }}>{lead.touchCount || 0}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                              {!lead.postsFetched && (
                                <button onClick={() => fetchPostsForLeads([lead.id])} disabled={fetchingPosts}
                                  aria-label={`Fetch posts for ${lead.firstName || lead.vanityId}`}
                                  style={{ ...styles.btn('rgba(0,119,181,0.2)', fetchingPosts), padding: '4px 8px', fontSize: '10px' }}>
                                  Fetch
                                </button>
                              )}
                              <button onClick={() => deleteLead(lead)}
                                disabled={deletingLeadId === lead.id}
                                aria-label={`Delete ${lead.firstName || lead.vanityId}`}
                                style={{ background: 'none', border: 'none', color: '#f87171', cursor: deletingLeadId === lead.id ? 'not-allowed' : 'pointer', fontSize: '14px', padding: '4px', opacity: deletingLeadId === lead.id ? 0.5 : 1 }}>
                                {deletingLeadId === lead.id ? '...' : '✕'}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {/* Expanded Posts Row */}
                        {isExpanded && lead.posts && lead.posts.length > 0 && (
                          <tr key={`${lead.id}-posts`}>
                            <td colSpan={7} style={{ padding: '0', background: 'rgba(0,0,0,0.2)' }}>
                              <div style={{ padding: '12px 16px', maxHeight: '300px', overflowY: 'auto' }}>
                                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', marginBottom: '8px' }}>
                                  Recent Posts ({lead.posts.length})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {lead.posts.map((post) => (
                                    <div key={post.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
                                          {post.postDate ? new Date(post.postDate).toLocaleDateString() : 'Unknown date'}
                                        </span>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                          {post.isLiked && <span style={{ color: '#34d399', fontSize: '10px' }}>✓ Liked</span>}
                                          {post.isCommented && <span style={{ color: '#a78bfa', fontSize: '10px' }}>✓ Commented</span>}
                                        </div>
                                      </div>
                                      <div style={{ color: 'white', fontSize: '11px', lineHeight: '1.4', maxHeight: `${DEFAULTS.MAX_POST_PREVIEW_LINES}px`, overflow: 'auto', marginBottom: '8px' }}>
                                        {post.postText || '(No text)'}
                                      </div>

                                      {/* Inline comment input */}
                                      {commentInput?.postId === post.id ? (
                                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                          <input
                                            type="text"
                                            value={commentInput.text}
                                            onChange={(e) => setCommentInput({ ...commentInput, text: e.target.value })}
                                            placeholder="Enter your comment..."
                                            style={{ ...styles.input, flex: 1 }}
                                            aria-label="Comment text"
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' && commentInput.text) {
                                                engageWithPost(lead, post, 'comment', commentInput.text);
                                                setCommentInput(null);
                                              }
                                            }}
                                          />
                                          <button
                                            onClick={() => { engageWithPost(lead, post, 'comment', commentInput.text); setCommentInput(null); }}
                                            disabled={!commentInput.text}
                                            style={styles.btn('rgba(167,139,250,0.2)', !commentInput.text)}
                                          >
                                            Send
                                          </button>
                                          <button
                                            onClick={() => setCommentInput(null)}
                                            style={styles.btn('rgba(255,255,255,0.1)')}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>
                                            👍 {post.likes || 0} · 💬 {post.comments || 0}
                                          </span>
                                          <div style={{ flex: 1 }} />
                                          {!post.isLiked && (
                                            <button onClick={() => engageWithPost(lead, post, 'like')} disabled={engagingPost === post.id}
                                              aria-label="Like post"
                                              style={{ ...styles.btn('rgba(52,211,153,0.2)', engagingPost === post.id), padding: '4px 10px', fontSize: '10px' }}>
                                              👍 Like
                                            </button>
                                          )}
                                          {!post.isCommented && (
                                            <button onClick={() => setCommentInput({ postId: post.id, text: '' })} disabled={engagingPost === post.id}
                                              aria-label="Comment on post"
                                              style={{ ...styles.btn('rgba(167,139,250,0.2)', engagingPost === post.id), padding: '4px 10px', fontSize: '10px' }}>
                                              💬 Comment
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <div style={{ ...styles.card, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🛡️</span>
          <div>
            <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: '700' }}>LinkedIn Safety Built-In</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
              Max 20-30 profiles/day · Actions spaced across days · No same-session like+comment · Auto-pause on warnings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
