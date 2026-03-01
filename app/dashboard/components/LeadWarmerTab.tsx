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

// ============= DESIGN TOKENS =============
// Spacing scale
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Typography scale
const TYPOGRAPHY = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
};

// Color palette
const COLORS = {
  brand: {
    primary: '#693fe9',
    primaryLight: '#a78bfa',
    primaryDark: '#4c1d95',
  },
  status: {
    pending: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8', label: 'Pending' },
    fetched: { bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.3)', text: '#60a5fa', label: 'Fetched' },
    engaged: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24', label: 'Engaged' },
    connected: { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)', text: '#34d399', label: 'Connected' },
  },
  surface: {
    card: 'rgba(255,255,255,0.05)',
    cardHover: 'rgba(255,255,255,0.08)',
    input: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.1)',
    borderLight: 'rgba(255,255,255,0.06)',
  },
  text: {
    primary: 'white',
    secondary: 'rgba(255,255,255,0.6)',
    muted: 'rgba(255,255,255,0.4)',
    subtle: 'rgba(255,255,255,0.35)',
  },
  statusColors: {
    success: '#34d399',
    error: '#f87171',
    warning: '#fbbf24',
    info: '#60a5fa',
  },
};

// Shadows
const SHADOWS = {
  card: '0 4px 24px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1)',
  cardHover: '0 8px 32px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.15)',
  button: '0 4px 15px rgba(105,63,233,0.4)',
  buttonHover: '0 6px 20px rgba(105,63,233,0.5)',
};

// Border radius
const RADIUS = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  full: 20,
};

// Animation keyframes for CSS injection
const ANIMATIONS = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 12px rgba(105,63,233,0.3); }
    50% { box-shadow: 0 0 24px rgba(105,63,233,0.5); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-12px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

// ============= STYLES =============
const styles = {
  card: {
    background: 'linear-gradient(135deg, rgba(30,30,55,0.95) 0%, rgba(20,20,40,0.98) 100%)',
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    border: '1px solid rgba(105,63,233,0.2)',
    boxShadow: SHADOWS.card,
    backdropFilter: 'blur(8px)',
    animation: 'fadeIn 0.3s ease-out',
  } as const,

  cardHoverable: {
    background: 'linear-gradient(135deg, rgba(30,30,55,0.95) 0%, rgba(20,20,40,0.98) 100%)',
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    border: '1px solid rgba(105,63,233,0.2)',
    boxShadow: SHADOWS.card,
    backdropFilter: 'blur(8px)',
    transition: 'all 0.25s ease',
    cursor: 'pointer',
  } as const,

  cardGradient: (gradient: string) => ({
    background: gradient,
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    border: '1px solid rgba(105,63,233,0.3)',
    boxShadow: SHADOWS.card,
    backdropFilter: 'blur(8px)',
  } as const),

  input: {
    padding: '12px 16px',
    background: COLORS.surface.input,
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: RADIUS.sm,
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sm,
    height: '44px',
    width: '100%' as const,
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
  } as const,

  inputFocus: {
    border: '1px solid rgba(105,63,233,0.5)',
    boxShadow: '0 0 0 3px rgba(105,63,233,0.15)',
  } as const,

  // Enhanced input with label wrapper
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: SPACING.xs,
  },

  inputLabel: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    marginBottom: SPACING.xs,
    display: 'flex',
    alignItems: 'center' as const,
    gap: SPACING.xs,
  },

  inputHint: {
    color: COLORS.text.subtle,
    fontSize: TYPOGRAPHY.xs,
    marginTop: SPACING.xs - 2,
  },

  // Button variants
  btnPrimary: (disabled = false, isLoading = false) => ({
    padding: '12px 20px',
    background: disabled ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)',
    color: disabled ? 'rgba(255,255,255,0.4)' : COLORS.text.primary,
    border: 'none',
    borderRadius: RADIUS.md,
    fontWeight: '600' as const,
    fontSize: TYPOGRAPHY.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    boxShadow: disabled ? 'none' : SHADOWS.button,
    transition: 'all 0.2s ease',
    transform: disabled ? 'none' : 'translateY(0)',
    position: 'relative' as const,
    overflow: 'hidden',
  } as const),

  // Button with hover effect
  btnPrimaryHover: (disabled = false, isLoading = false, isHovered = false) => ({
    padding: '12px 20px',
    background: disabled ? 'rgba(255,255,255,0.1)' : isHovered ? 'linear-gradient(135deg, #7c3aed, #a78bfa)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)',
    color: disabled ? 'rgba(255,255,255,0.4)' : COLORS.text.primary,
    border: 'none',
    borderRadius: RADIUS.md,
    fontWeight: '600' as const,
    fontSize: TYPOGRAPHY.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    boxShadow: disabled ? 'none' : isHovered ? SHADOWS.buttonHover : SHADOWS.button,
    transition: 'all 0.2s ease',
    transform: disabled ? 'none' : isHovered ? 'translateY(-1px)' : 'translateY(0)',
  } as const),

  btnSecondary: (disabled = false) => ({
    padding: '12px 20px',
    background: disabled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
    color: disabled ? 'rgba(255,255,255,0.4)' : COLORS.text.primary,
    border: disabled ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.15)',
    borderRadius: RADIUS.md,
    fontWeight: '600' as const,
    fontSize: TYPOGRAPHY.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
  } as const),

  btnDanger: (disabled = false) => ({
    padding: '12px 20px',
    background: disabled ? 'rgba(248,113,113,0.1)' : 'rgba(248,113,113,0.2)',
    color: disabled ? 'rgba(248,113,113,0.4)' : COLORS.statusColors.error,
    border: disabled ? '1px solid rgba(248,113,113,0.1)' : '1px solid rgba(248,113,113,0.3)',
    borderRadius: RADIUS.md,
    fontWeight: '600' as const,
    fontSize: TYPOGRAPHY.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
  } as const),

  btnLinkedIn: (disabled = false) => ({
    padding: '12px 20px',
    background: disabled ? 'rgba(0,119,181,0.1)' : 'linear-gradient(135deg, #0077b5, #00a0dc)',
    color: disabled ? 'rgba(255,255,255,0.4)' : COLORS.text.primary,
    border: 'none',
    borderRadius: RADIUS.md,
    fontWeight: '600' as const,
    fontSize: TYPOGRAPHY.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    boxShadow: disabled ? 'none' : '0 4px 15px rgba(0,119,181,0.3)',
    transition: 'all 0.2s ease',
  } as const),

  btnSuccess: (disabled = false) => ({
    padding: '12px 20px',
    background: disabled ? 'rgba(16,185,129,0.1)' : 'linear-gradient(135deg, #10b981, #059669)',
    color: disabled ? 'rgba(255,255,255,0.4)' : COLORS.text.primary,
    border: 'none',
    borderRadius: RADIUS.md,
    fontWeight: '600' as const,
    fontSize: TYPOGRAPHY.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    boxShadow: disabled ? 'none' : '0 4px 15px rgba(16,185,129,0.3)',
    transition: 'all 0.2s ease',
  } as const),

  btnSuccessHover: (disabled = false) => ({
    padding: '12px 20px',
    background: disabled ? 'rgba(16,185,129,0.1)' : 'linear-gradient(135deg, #059669, #10b981)',
    color: disabled ? 'rgba(255,255,255,0.4)' : COLORS.text.primary,
    border: 'none',
    borderRadius: RADIUS.md,
    fontWeight: '600' as const,
    fontSize: TYPOGRAPHY.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    boxShadow: disabled ? 'none' : '0 6px 20px rgba(16,185,129,0.4)',
    transition: 'all 0.2s ease',
    transform: 'translateY(-1px)',
  } as const),

  // Small button for inline actions
  btnSmall: (bg: string, disabled = false) => ({
    padding: '8px 14px',
    background: disabled ? 'rgba(255,255,255,0.1)' : bg,
    color: disabled ? 'rgba(255,255,255,0.4)' : COLORS.text.primary,
    border: 'none',
    borderRadius: RADIUS.sm,
    fontWeight: '600' as const,
    fontSize: TYPOGRAPHY.xs,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
  } as const),

  // Label styles
  label: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    marginBottom: SPACING.xs,
    display: 'block',
  } as const,

  // Table styles
  tableHeader: {
    background: 'linear-gradient(135deg, rgba(105,63,233,0.15) 0%, rgba(76,29,149,0.1) 100%)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },

  tableRow: (isSelected: boolean, isAlternate: boolean) => ({
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    cursor: 'pointer',
    background: isSelected ? 'rgba(105,63,234,0.18)' : isAlternate ? 'rgba(255,255,255,0.015)' : 'transparent',
    transition: 'all 0.15s ease',
  } as const),

  // Skeleton loader
  skeleton: {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: RADIUS.sm,
  } as const,

  // Backward-compatible button function - maps old patterns to new variants
  btn: (bg: string, disabled = false) => {
    if (bg.includes('gradient(135deg, #693fe9') || bg.includes('rgba(105,63,233')) {
      return styles.btnPrimary(disabled);
    }
    if (bg.includes('gradient(135deg, #0077b5') || bg.includes('gradient(135deg, #00a0dc')) {
      return styles.btnLinkedIn(disabled);
    }
    if (bg.includes('gradient(135deg, #10b981') || bg.includes('gradient(135deg, #059669')) {
      return styles.btnSuccess(disabled);
    }
    if (bg.includes('rgba(248,113,113') || bg.includes('#f87171')) {
      return styles.btnDanger(disabled);
    }
    return styles.btnSecondary(disabled);
  },
};

// Legacy compatibility - map old STATUS_COLORS to new COLORS
const STATUS_COLORS = {
  pending_fetch: COLORS.status.pending,
  fetched: COLORS.status.fetched,
  engaged: COLORS.status.engaged,
  connected: COLORS.status.connected,
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
  const [isMobile, setIsMobile] = useState(false);

  // Hover states for interactive elements
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredLeadId, setHoveredLeadId] = useState<string | null>(null);

  // Focus states for accessibility
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 12px rgba(105,63,233,0.3); }
          50% { box-shadow: 0 0 24px rgba(105,63,233,0.5); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.9); }
          50% { transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: #4a4a6a #1e1b4b;
        }
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        *::-webkit-scrollbar-track {
          background: #1e1b4b;
        }
        *::-webkit-scrollbar-thumb {
          background: #4a4a6a;
          border-radius: 4px;
        }
        *::-webkit-scrollbar-thumb:hover {
          background: #5a5a7a;
        }
        .lead-row:hover {
          background: rgba(105,63,234,0.08) !important;
        }
        .btn-hover:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(105,63,233,0.4);
        }
        .btn-hover:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.lg, minHeight: '100vh' }}>
      {/* Undo delete toast - Enhanced with animation */}
      {recentlyDeleted && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          background: 'linear-gradient(135deg, rgba(30,30,60,0.98) 0%, rgba(20,20,40,0.98) 100%)',
          padding: SPACING.md + ' ' + SPACING.lg,
          borderRadius: RADIUS.lg,
          border: '1px solid rgba(105,63,233,0.4)',
          display: 'flex', gap: SPACING.md, alignItems: 'center',
          boxShadow: '0 8px 32px rgba(105,63,233,0.3), 0 0 0 1px rgba(167,139,250,0.2)',
          backdropFilter: 'blur(12px)',
          animation: 'slideInRight 0.3s ease-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
            <span style={{ fontSize: '18px' }}>🗑️</span>
            <span style={{ color: COLORS.text.primary, fontSize: TYPOGRAPHY.sm, fontWeight: '500' }}>
              Deleted <span style={{ color: COLORS.brand.primaryLight, fontWeight: '600' }}>{recentlyDeleted.firstName || recentlyDeleted.vanityId || 'lead'}</span>
            </span>
          </div>
          <button
            onClick={undoDelete}
            onMouseEnter={() => setHoveredButton('undo')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              ...styles.btnPrimaryHover(false, false, hoveredButton === 'undo'),
              padding: '8px 16px',
              fontSize: TYPOGRAPHY.xs,
            }}
          >
            Undo
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{
        ...styles.cardGradient('linear-gradient(135deg, rgba(105,63,234,0.25) 0%, rgba(139,92,246,0.12) 100%)'),
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeIn 0.4s ease-out',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-5%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg, flexWrap: 'wrap', gap: SPACING.md }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm + 2, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.lg }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: RADIUS.lg,
                background: 'linear-gradient(135deg, #693fe9 0%, #a78bfa 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 4px 16px rgba(105,63,233,0.4)',
                animation: 'pulse-glow 2s infinite ease-in-out',
              }}>
                🔥
              </div>
              <div>
                <h3 style={{ color: COLORS.text.primary, fontSize: TYPOGRAPHY.xxl + 2, fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>Warm Leads</h3>
                {campaignName && (
                  <span style={{
                    background: 'rgba(105,63,233,0.3)',
                    color: COLORS.brand.primaryLight,
                    fontSize: TYPOGRAPHY.xs,
                    padding: SPACING.xs + ' ' + SPACING.sm,
                    borderRadius: RADIUS.full,
                    fontWeight: '600',
                    border: '1px solid rgba(167,139,250,0.3)',
                    display: 'inline-block',
                    marginTop: SPACING.xs,
                  }}>
                    {campaignName}
                  </span>
                )}
              </div>
            </div>
            </div>
            {/* Pipeline Flow - Visual step indicator */}
            <p style={{ color: COLORS.text.muted, fontSize: TYPOGRAPHY.md, margin: SPACING.sm + ' 0 0 0', display: 'flex', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#60a5fa' }}>📥</span> Import</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#a78bfa' }}>📄</span> Fetch Posts</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#fbbf24' }}>💬</span> Engage</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#34d399' }}>🤝</span> Connect</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: SPACING.sm, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Extension Status Indicator - Enhanced with accessibility */}
            <div
              role="status"
              aria-live="polite"
              aria-label={extensionConnected ? 'Extension connected' : 'Extension disconnected'}
              style={{
                display: 'flex', alignItems: 'center', gap: SPACING.sm,
                padding: SPACING.sm + ' ' + SPACING.md + 2, borderRadius: RADIUS.lg,
                background: extensionConnected ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                border: `1px solid ${extensionConnected ? 'rgba(52,211,153,0.35)' : 'rgba(248,113,113,0.35)'}`,
                boxShadow: extensionConnected ? '0 0 20px rgba(52,211,153,0.15)' : '0 0 20px rgba(248,113,113,0.15)',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: extensionConnected ? COLORS.statusColors.success : COLORS.statusColors.error,
                boxShadow: `0 0 12px ${extensionConnected ? 'rgba(52,211,153,0.8)' : 'rgba(248,113,113,0.8)'}`,
                animation: extensionConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
              <span style={{ fontSize: TYPOGRAPHY.sm, color: extensionConnected ? COLORS.statusColors.success : COLORS.statusColors.error, fontWeight: '600' }}>
                {extensionConnected ? 'Extension Connected' : 'Extension Disconnected'}
              </span>
            </div>
            {fetchingPosts && (
              <div
                role="progressbar"
                aria-valuenow={fetchProgress?.includes('%') ? parseInt(fetchProgress) : 50}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}
              >
                <span style={{ color: COLORS.brand.primaryLight, fontSize: TYPOGRAPHY.sm }}>{fetchProgress || 'Fetching...'}</span>
                <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #693fe9, #a78bfa)',
                    width: fetchProgress?.includes('%') ? fetchProgress : '50%',
                    transition: 'width 0.3s ease',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              aria-label={showSettings ? 'Close settings' : 'Open settings'}
              aria-expanded={showSettings}
              onMouseEnter={() => setHoveredButton('settings')}
              onMouseLeave={() => setHoveredButton(null)}
              style={hoveredButton === 'settings' ? styles.btnSecondary() : styles.btnSecondary()}
            >
              <span style={{ marginRight: SPACING.xs }}>⚙️</span> Settings
            </button>
            <button
              onClick={() => fetchPostsForLeads()}
              disabled={fetchingPosts || !extensionConnected}
              aria-label={fetchingPosts ? 'Fetching posts in progress' : 'Fetch all posts from LinkedIn'}
              onMouseEnter={() => setHoveredButton('fetchAll')}
              onMouseLeave={() => setHoveredButton(null)}
              style={styles.btnLinkedIn(fetchingPosts || !extensionConnected)}
            >
              {fetchingPosts ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: SPACING.xs }}>⏳</span>
                  Fetching...
                </>
              ) : (
                <>📥 Fetch All Posts</>
              )}
            </button>
          </div>
        </div>
        </div>
        {/* Pipeline Stats - Enhanced with accessibility and visual hierarchy */}
        <div
          role="group"
          aria-label="Lead status filters"
          style={{
            display: 'flex',
            gap: SPACING.sm,
            alignItems: 'flex-end',
            flexDirection: isMobile ? 'column' : 'row',
            marginTop: SPACING.lg,
          }}
        >
          {Object.entries(STATUS_COLORS).map(([key, val]) => {
            const count = statusCounts[key as keyof typeof statusCounts] || 0;
            const totalLeads = leads.length || 1;
            const percentage = Math.round((count / totalLeads) * 100);
            const maxCount = Math.max(...Object.values(statusCounts), 1);
            const height = Math.max(40, (count / maxCount) * 80);
            const isActive = statusFilter === key;
            return (
              <div
                key={key}
                onClick={() => setStatusFilter(statusFilter === key ? FILTER_ALL : key)}
                onMouseEnter={() => setHoveredLeadId(key)}
                onMouseLeave={() => setHoveredLeadId(null)}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={`${val.label}: ${count} leads (${percentage}%). Click to filter.`}
                onKeyDown={(e) => e.key === 'Enter' && setStatusFilter(statusFilter === key ? FILTER_ALL : key)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  padding: SPACING.md,
                  background: isActive ? val.bg : hoveredLeadId === key ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                  border: isActive ? `1px solid ${val.border}` : hoveredLeadId === key ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: RADIUS.lg,
                  transition: 'all 0.25s ease',
                  outline: isActive ? `2px solid ${val.text}` : 'none',
                  outlineOffset: '2px',
                  minWidth: '80px',
                  transform: hoveredLeadId === key && !isActive ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                <div style={{
                  height: `${height}px`,
                  background: isActive
                    ? `linear-gradient(180deg, ${val.border} 0%, ${val.bg} 100%)`
                    : `linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`,
                  borderRadius: RADIUS.sm + ' ' + RADIUS.sm + ' 0 0',
                  margin: '0 auto ' + SPACING.sm,
                  width: '70%',
                  border: `1px solid ${isActive ? val.border : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isActive ? `0 0 20px ${val.border}, 0 4px 12px rgba(0,0,0,0.2)` : 'none',
                  transition: 'all 0.25s ease',
                }} />
                <div style={{
                  fontSize: TYPOGRAPHY.xl + 2,
                  fontWeight: '800',
                  color: isActive ? val.text : COLORS.text.secondary,
                  transition: 'color 0.2s ease'
                }}>
                  {count}
                </div>
                <div style={{ fontSize: TYPOGRAPHY.xs, color: isActive ? val.text : COLORS.text.muted, fontWeight: '600', marginTop: '2px' }}>{val.label}</div>
                <div style={{ fontSize: TYPOGRAPHY.xs - 2, color: COLORS.text.subtle, marginTop: '2px' }}>{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings Panel - Enhanced with animation and sections */}
      {showSettings && (
        <div style={{ ...styles.card, animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
            <h4 style={{ color: COLORS.text.primary, fontSize: TYPOGRAPHY.lg, fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
              <span style={{ fontSize: '20px' }}>⚙️</span> Engagement Settings
            </h4>
            <button
              onClick={() => setShowSettings(false)}
              aria-label="Close settings"
              style={{
                background: 'transparent',
                border: 'none',
                color: COLORS.text.muted,
                fontSize: TYPOGRAPHY.lg,
                cursor: 'pointer',
                padding: SPACING.xs,
                borderRadius: RADIUS.sm,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = COLORS.text.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = COLORS.text.muted}
            >
              ✕
            </button>
          </div>

          {/* Section 1: Campaign Basics */}
          <div style={{ marginBottom: SPACING.xl }}>
            <h5 style={{ color: COLORS.brand.primaryLight, fontSize: TYPOGRAPHY.sm, fontWeight: '600', margin: '0 0 ' + SPACING.md + ' 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Campaign Basics
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: SPACING.lg }}>
              <div style={styles.inputGroup}>
                <label htmlFor="campaignName" style={styles.inputLabel}>
                  Campaign Name
                </label>
                <input
                  id="campaignName"
                  value={campaignName}
                  onChange={e => setCampaignName(e.target.value)}
                  style={styles.input}
                  placeholder="Q1 SaaS Founders Outreach"
                  aria-describedby="campaignNameHint"
                />
                <span id="campaignNameHint" style={styles.inputHint}>Give your campaign a descriptive name</span>
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="profilesPerDay" style={styles.inputLabel}>
                  Profiles/Day
                </label>
                <input
                  id="profilesPerDay"
                  type="number"
                  value={profilesPerDay}
                  onChange={e => setProfilesPerDay(parseInt(e.target.value) || DEFAULTS.PROFILES_PER_DAY)}
                  min={1}
                  max={DEFAULTS.MAX_PROFILES_PER_DAY}
                  style={styles.input}
                  aria-describedby="profilesHint"
                />
                <span id="profilesHint" style={styles.inputHint}>Max: {DEFAULTS.MAX_PROFILES_PER_DAY} profiles per day for safety</span>
              </div>
            </div>
          </div>

          {/* Section 2: Business Context */}
          <div style={{ marginBottom: SPACING.xl }}>
            <h5 style={{ color: COLORS.brand.primaryLight, fontSize: TYPOGRAPHY.sm, fontWeight: '600', margin: '0 0 ' + SPACING.md + ' 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Business Context
            </h5>
            <div style={styles.inputGroup}>
              <label htmlFor="businessContext" style={styles.inputLabel}>
                Your Business / Offer
              </label>
              <textarea
                id="businessContext"
                value={businessContext}
                onChange={e => setBusinessContext(e.target.value)}
                rows={3}
                style={{ ...styles.input, resize: 'vertical', minHeight: '80px' }}
                placeholder="I help SaaS founders reduce churn through onboarding audits..."
                aria-describedby="contextHint"
              />
              <span id="contextHint" style={styles.inputHint}>This helps generate more personalized comments</span>
            </div>
          </div>

          {/* Section 3: Campaign Goal */}
          <div style={{ marginBottom: SPACING.xl }}>
            <h5 style={{ color: COLORS.brand.primaryLight, fontSize: TYPOGRAPHY.sm, fontWeight: '600', margin: '0 0 ' + SPACING.md + ' 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Campaign Goal
            </h5>
            <div style={{ display: 'flex', gap: SPACING.sm, flexWrap: 'wrap' }} role="radiogroup" aria-label="Campaign goal selection">
              {[
                { key: 'relationship', icon: '🤝', label: 'Relationship' },
                { key: 'authority', icon: '👑', label: 'Authority' },
                { key: 'warm_pitch', icon: '🎯', label: 'Warm Pitch' },
                { key: 'recruit', icon: '🔍', label: 'Recruit' },
              ].map(g => (
                <button
                  key={g.key}
                  onClick={() => setCampaignGoal(g.key)}
                  role="radio"
                  aria-checked={campaignGoal === g.key}
                  style={{
                    padding: SPACING.sm + ' ' + (SPACING.sm + 6),
                    background: campaignGoal === g.key ? 'rgba(105,63,233,0.25)' : 'rgba(255,255,255,0.05)',
                    border: campaignGoal === g.key ? '2px solid rgba(105,63,233,0.6)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: RADIUS.sm,
                    cursor: 'pointer',
                    color: COLORS.text.primary,
                    fontSize: TYPOGRAPHY.sm,
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    transform: campaignGoal === g.key ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {g.icon} {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Sequence Timeline */}
          <div style={{ marginBottom: SPACING.xl }}>
            <h5 style={{ color: COLORS.brand.primaryLight, fontSize: TYPOGRAPHY.sm, fontWeight: '600', margin: '0 0 ' + SPACING.md + ' 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Warm Sequence Timeline
            </h5>
            <div style={{ display: 'flex', gap: SPACING.sm, alignItems: 'center', flexWrap: 'wrap' }}>
              {sequenceSteps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
                  <div
                    style={{
                      padding: SPACING.sm + ' ' + SPACING.md,
                      background: step.enabled ? 'rgba(105,63,233,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${step.enabled ? 'rgba(105,63,233,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: RADIUS.sm,
                      cursor: 'pointer',
                      opacity: step.enabled ? 1 : 0.5,
                      transition: 'all 0.2s ease',
                      transform: step.enabled ? 'scale(1.02)' : 'scale(1)',
                    }}
                    onClick={() => { const newSteps = [...sequenceSteps]; newSteps[idx].enabled = !newSteps[idx].enabled; setSequenceSteps(newSteps); }}
                    role="switch"
                    aria-checked={step.enabled}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && (() => { const newSteps = [...sequenceSteps]; newSteps[idx].enabled = !newSteps[idx].enabled; setSequenceSteps(newSteps); })()}
                  >
                    <div style={{ fontSize: TYPOGRAPHY.xs - 1, color: COLORS.text.muted }}>Day {step.day}</div>
                    <div style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.text.primary, fontWeight: '600' }}>
                      {ACTION_LABELS[step.action]?.icon} {ACTION_LABELS[step.action]?.label}
                    </div>
                  </div>
                  {idx < sequenceSteps.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>}
                </div>
              ))}
            </div>
            <p style={{ color: COLORS.text.subtle, fontSize: TYPOGRAPHY.xs - 1, margin: SPACING.xs + ' 0 0 0' }}>Click to enable/disable steps. Follow & Connect are in beta.</p>
          </div>

          {/* Section 5: Autopilot & Save */}
          <div style={{
            display: 'flex',
            gap: SPACING.sm,
            marginTop: SPACING.xl,
            alignItems: 'center',
            flexWrap: 'wrap',
            paddingTop: SPACING.lg,
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.xs + 2,
                cursor: 'pointer',
                padding: SPACING.sm + ' ' + SPACING.md,
                background: autopilotEnabled ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.03)',
                borderRadius: RADIUS.md,
                border: `1px solid ${autopilotEnabled ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="checkbox"
                checked={autopilotEnabled}
                onChange={e => setAutopilotEnabled(e.target.checked)}
                style={{
                  accentColor: COLORS.brand.primary,
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
              />
              <span style={{ color: COLORS.text.primary, fontSize: TYPOGRAPHY.sm, fontWeight: '600' }}>Autopilot Mode</span>
            </label>
            <span style={{ color: COLORS.text.muted, fontSize: TYPOGRAPHY.xs }}>Runs sequences automatically via cron</span>
            <div style={{ flex: 1 }} />
            <button
              onClick={saveSettings}
              disabled={settingsSaving}
              aria-label={settingsSaving ? 'Saving settings' : 'Save settings'}
              onMouseEnter={() => setHoveredButton('saveSettings')}
              onMouseLeave={() => setHoveredButton(null)}
              style={hoveredButton === 'saveSettings' ? styles.btnPrimaryHover(settingsSaving, settingsSaving) : styles.btnPrimary(settingsSaving, settingsSaving)}
            >
              {settingsSaving ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: SPACING.xs }}>⏳</span>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Import Section - Enhanced */}
      <div style={{ ...styles.card, animation: 'fadeIn 0.3s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm + 4, flexWrap: 'wrap', gap: SPACING.sm }}>
          <h4 style={{ color: COLORS.text.primary, fontSize: TYPOGRAPHY.md + 1, fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
            <span style={{ fontSize: '18px' }}>📥</span> Import Leads
          </h4>
          <div style={{ display: 'flex', gap: SPACING.sm, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              ref={csvFileRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleCsvUpload}
              aria-label="Upload CSV file with LinkedIn profile URLs"
            />
            <button
              onClick={() => csvFileRef.current?.click()}
              disabled={importingCsv}
              onMouseEnter={() => setHoveredButton('uploadCsv')}
              onMouseLeave={() => setHoveredButton(null)}
              style={hoveredButton === 'uploadCsv' ? styles.btnSecondary() : styles.btnSecondary(importingCsv)}
            >
              {importingCsv ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: SPACING.xs }}>⏳</span>
                  Importing...
                </>
              ) : (
                'Upload CSV'
              )}
            </button>
            <button
              onClick={downloadTemplate}
              onMouseEnter={() => setHoveredButton('template')}
              onMouseLeave={() => setHoveredButton(null)}
              style={hoveredButton === 'template' ? styles.btnSecondary() : styles.btnSecondary()}
              title="Download CSV template"
              aria-label="Download CSV template"
            >
              Template
            </button>
            {detectedUrlCount > 0 && (
              <span style={{
                color: COLORS.brand.primaryLight,
                fontSize: TYPOGRAPHY.sm,
                alignSelf: 'center',
                background: 'rgba(105,63,233,0.2)',
                padding: SPACING.xs + ' ' + SPACING.sm,
                borderRadius: RADIUS.full,
                fontWeight: '600',
              }}>
                {detectedUrlCount} detected
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: SPACING.sm, flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: SPACING.xs }}>
            <label htmlFor="importText" style={styles.inputLabel}>
              LinkedIn Profile URLs
            </label>
            <textarea
              id="importText"
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Paste LinkedIn profile URLs (one per line)&#10;Example: https://linkedin.com/in/johndoe"
              rows={4}
              style={{
                ...styles.input,
                flex: 1,
                fontFamily: 'monospace',
                resize: 'vertical',
                minHeight: '100px',
              }}
              aria-describedby="importHint"
            />
            <span id="importHint" style={styles.inputHint}>Paste one LinkedIn profile URL per line</span>
          </div>
          <button
            onClick={handleImportLeads}
            disabled={!importText.trim() || detectedUrlCount === 0}
            onMouseEnter={() => setHoveredButton('import')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              ...(hoveredButton === 'import' ? styles.btnSuccessHover?.() : styles.btnSuccess(!importText.trim() || detectedUrlCount === 0)),
              alignSelf: 'flex-end',
              minWidth: '100px',
            }}
          >
            {importingCsv ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div style={{ display: 'flex', gap: SPACING.sm, alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search leads..." style={{ ...styles.input, width: isMobile ? '100%' : '250px', maxWidth: '250px' }} aria-label="Search leads" />
        {hasActiveFilters && (
          <button onClick={clearFilters} style={styles.btnSecondary()}>
            Clear filters
          </button>
        )}
        <span style={{ color: COLORS.text.muted, fontSize: TYPOGRAPHY.sm }}>{filteredLeads.length} of {leads.length} leads</span>

        {/* Bulk Actions */}
        {leads.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: SPACING.sm }}>
            <button
              onClick={handleBulkFetch}
              disabled={selectedLeads.size === 0 || !extensionConnected}
              style={styles.btnLinkedIn(selectedLeads.size === 0 || !extensionConnected)}
            >
              Fetch Selected ({selectedLeads.size})
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedLeads.size === 0}
              style={styles.btnDanger(selectedLeads.size === 0)}
            >
              Delete Selected ({selectedLeads.size})
            </button>
          </div>
        )}
      </div>

      {/* Leads Table */}
      {leadsLoading ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: SPACING.xxl + 16 }}>
          {/* Skeleton loader */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.md }}>
            <div style={{ ...styles.skeleton, height: '20px', width: '150px', margin: '0 auto' }} />
            <div style={{ ...styles.skeleton, height: '60px', width: '100%' }} />
            <div style={{ ...styles.skeleton, height: '20px', width: '80%', margin: '0 auto' }} />
          </div>
        </div>
      ) : leads.length === 0 ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: SPACING.xxl + 16 }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(105,63,233,0.2) 0%, rgba(139,92,246,0.1) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto ' + SPACING.lg + '',
            boxShadow: '0 8px 32px rgba(105,63,233,0.2)',
          }}>
            <span style={{ fontSize: '36px' }}>📋</span>
          </div>
          <div style={{ color: COLORS.text.primary, fontWeight: '600', marginBottom: SPACING.xs, fontSize: TYPOGRAPHY.lg }}>No leads yet</div>
          <div style={{ color: COLORS.text.muted, fontSize: TYPOGRAPHY.sm, marginBottom: SPACING.lg }}>Import LinkedIn profile URLs to get started</div>
          <button
            onClick={() => document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="LinkedIn"]')?.focus()}
            style={styles.btnSuccess()}
          >
            Import Your First Lead
          </button>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: SPACING.xxl + 16 }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(96,165,250,0.2) 0%, rgba(96,165,250,0.1) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto ' + SPACING.lg + '',
            boxShadow: '0 8px 32px rgba(96,165,250,0.2)',
          }}>
            <span style={{ fontSize: '36px' }}>🔍</span>
          </div>
          <div style={{ color: COLORS.text.primary, fontWeight: '600', marginBottom: SPACING.xs, fontSize: TYPOGRAPHY.lg }}>No results found</div>
          <div style={{ color: COLORS.text.muted, fontSize: TYPOGRAPHY.sm }}>Try adjusting your search or filter</div>
        </div>
      ) : (
        <div style={{ ...styles.card, padding: '0', overflow: 'hidden', borderRadius: RADIUS.xl, border: '1px solid rgba(105,63,233,0.2)' }}>
          {/* Table Header Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: SPACING.lg + ' ' + SPACING.xl,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(135deg, rgba(105,63,233,0.15) 0%, rgba(76,29,149,0.1) 100%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.lg }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: RADIUS.lg,
                background: 'linear-gradient(135deg, #693fe9, #a78bfa)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                boxShadow: '0 4px 16px rgba(105,63,233,0.4)',
              }}>
                👥
              </div>
              <div>
                <div style={{ color: COLORS.text.primary, fontWeight: '700', fontSize: TYPOGRAPHY.lg, letterSpacing: '-0.3px' }}>
                  {filteredLeads.length} Lead{filteredLeads.length !== 1 ? 's' : ''}
                </div>
                <div style={{ color: COLORS.text.muted, fontSize: TYPOGRAPHY.sm }}>
                  {selectedLeads.size > 0 ? `${selectedLeads.size} selected` : 'Select leads to take action'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: SPACING.sm + 2 }}>
              {selectedLeads.size > 0 && (
                <button
                  onClick={() => fetchPostsForLeads(Array.from(selectedLeads))}
                  disabled={fetchingPosts}
                  style={{
                    ...styles.btnPrimary(fetchingPosts),
                    display: 'flex',
                    alignItems: 'center',
                    gap: SPACING.sm,
                  }}
                >
                  <span>📥</span> Fetch Posts
                </button>
              )}
            </div>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }} role="region" aria-label="Leads list">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: TYPOGRAPHY.sm + 1, minWidth: '900px' }} role="table">
                <thead style={{ ...styles.tableHeader, zIndex: 10 }}>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: SPACING.md + 2 + ' ' + SPACING.lg, width: '48px' }}>
                      <input
                        type="checkbox"
                        checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                        onChange={toggleAllSelection}
                        style={{ accentColor: COLORS.brand.primary, cursor: 'pointer', width: '18px', height: '18px' }}
                        aria-label="Select all"
                      />
                    </th>
                    {['Name', 'Status & Activity', 'Recent Posts', ''].map(h => (
                      <th key={h} style={{ padding: SPACING.md + 2 + ' ' + SPACING.lg, color: COLORS.text.secondary, fontWeight: '600', textAlign: 'left', fontSize: TYPOGRAPHY.xs, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, index) => {
                    const sc = STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending_fetch;
                    const isExpanded = expandedLeadId === lead.id;
                    const isSelected = selectedLeads.has(lead.id);
                    const isAlternate = index % 2 === 1;
                    return (
                      <>
                        <tr key={lead.id}
                          style={styles.tableRow(isSelected, isAlternate)}
                          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(105,63,234,0.08)'; }}
                          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = isAlternate ? 'rgba(255,255,255,0.015)' : 'transparent'; }}
                          onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                          role="row"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && setExpandedLeadId(isExpanded ? null : lead.id)}
                        >
                          <td style={{ padding: SPACING.md + 2 + ' ' + SPACING.lg }} onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleLeadSelection(lead.id)}
                              style={{ accentColor: COLORS.brand.primary, cursor: 'pointer', width: '18px', height: '18px' }}
                              aria-label={`Select ${lead.firstName || lead.vanityId}`}
                            />
                          </td>
                          <td style={{ padding: SPACING.md + 2 + ' ' + SPACING.lg, minWidth: '180px' }}>
                            <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.text.primary, textDecoration: 'none', fontWeight: '600', fontSize: TYPOGRAPHY.md }}
                              onClick={e => e.stopPropagation()}>
                              {lead.firstName || lead.vanityId || 'Unknown'} {lead.lastName || ''}
                            </a>
                            {lead.headline && <div style={{ color: COLORS.text.muted, fontSize: TYPOGRAPHY.xs + 1, marginTop: SPACING.xs, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.headline}</div>}
                          </td>
                          <td style={{ padding: SPACING.md + 2 + ' ' + SPACING.lg }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm + 2 }}>
                              {/* Status Badge */}
                              <span style={{
                                padding: SPACING.xs + 1 + ' ' + SPACING.sm + 2,
                                background: sc.bg,
                                border: `1px solid ${sc.border}`,
                                borderRadius: RADIUS.full,
                                color: sc.text,
                                fontSize: TYPOGRAPHY.xs + 1,
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: SPACING.xs,
                                boxShadow: `0 0 12px ${sc.bg}`,
                                transition: 'all 0.2s ease',
                              }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.text, boxShadow: `0 0 8px ${sc.text}` }}></span>
                                {sc.label}
                              </span>
                              {/* Touches Counter */}
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: SPACING.xs + 2,
                                padding: SPACING.xs + ' ' + SPACING.md,
                                background: (lead.touchCount || 0) > 0 ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
                                borderRadius: RADIUS.full,
                                border: `1px solid ${(lead.touchCount || 0) > 0 ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                transition: 'all 0.2s ease',
                              }}>
                                <span style={{ fontSize: TYPOGRAPHY.sm }}>👆</span>
                                <span style={{ color: (lead.touchCount || 0) > 0 ? COLORS.statusColors.success : COLORS.text.subtle, fontWeight: '600', fontSize: TYPOGRAPHY.sm }}>
                                  {lead.touchCount || 0}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: SPACING.md + ' ' + SPACING.lg, minWidth: '1fr' }}>
                            {lead.posts && lead.posts.length > 0 ? (
                              <div style={{
                                display: 'flex',
                                gap: SPACING.md + 2,
                                overflowX: 'auto',
                                paddingBottom: SPACING.sm,
                                maxWidth: '1000px',
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#4a4a6a #1e1b4b',
                              }}>
                                {lead.posts.slice(0, 10).map((post) => (
                                  <div key={post.id} style={{
                                    minWidth: '320px',
                                    maxWidth: '320px',
                                    background: 'linear-gradient(180deg, rgba(30,30,55,0.95) 0%, rgba(20,20,40,0.98) 100%)',
                                    borderRadius: RADIUS.lg,
                                    padding: SPACING.lg,
                                    border: '1px solid rgba(105,63,233,0.15)',
                                    flexShrink: 0,
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                                  }}>
                                    {/* LinkedIn-style Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm + 2 }}>
                                      <span style={{ color: COLORS.text.subtle, fontSize: TYPOGRAPHY.xs, fontWeight: '500' }}>
                                        {post.postDate ? new Date(post.postDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                      </span>
                                      {post.isLiked && (
                                        <span style={{ color: '#0a66c2', fontSize: TYPOGRAPHY.xs - 1, display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
                                          👍 Liked
                                        </span>
                                      )}
                                    </div>
                                    {/* Post Text with proper formatting */}
                                    <div style={{
                                      color: 'rgba(255,255,255,0.88)',
                                      fontSize: TYPOGRAPHY.sm + 1,
                                      lineHeight: '1.6',
                                      maxHeight: '150px',
                                      overflowY: 'auto',
                                      marginBottom: SPACING.md,
                                      scrollbarWidth: 'thin',
                                      scrollbarColor: '#4a4a6a transparent',
                                      fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                      whiteSpace: 'pre-wrap',
                                      wordBreak: 'break-word',
                                    }}>
                                      {post.postText?.split(/(#\w+)/g).map((part, i) =>
                                        part.startsWith('#') ? (
                                          <span key={i} style={{ color: '#0a66c2', fontWeight: '600' }}>{part}</span>
                                        ) : part.match(/^@\w+/) ? (
                                          <span key={i} style={{ color: '#0a66c2', fontWeight: '600' }}>{part}</span>
                                        ) : (
                                          part
                                        )
                                      )}
                                    </div>
                                    {/* LinkedIn-style Engagement bar */}
                                    <div style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      paddingTop: SPACING.sm,
                                      borderTop: '1px solid rgba(255,255,255,0.06)',
                                    }}>
                                      <span style={{ color: COLORS.text.subtle, fontSize: TYPOGRAPHY.sm }}>
                                        👍 {post.likes || 0} · 💬 {post.comments || 0}
                                      </span>
                                      <div style={{ display: 'flex', gap: SPACING.xs + 2 }}>
                                        {!post.isLiked && (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); engageWithPost(lead, post, 'like'); }}
                                            disabled={engagingPost === post.id}
                                            style={{
                                              background: 'rgba(10,102,194,0.15)',
                                              border: '1px solid rgba(10,102,194,0.3)',
                                              borderRadius: RADIUS.full,
                                              color: '#70b5f9',
                                              fontSize: TYPOGRAPHY.xs,
                                              padding: '6px 14px',
                                              cursor: engagingPost === post.id ? 'not-allowed' : 'pointer',
                                              opacity: engagingPost === post.id ? 0.5 : 1,
                                              fontWeight: '600',
                                              transition: 'all 0.2s ease',
                                            }}
                                          >
                                            👍 Like
                                          </button>
                                        )}
                                        {!post.isCommented && (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setCommentInput({ postId: post.id, text: '' }); }}
                                            disabled={engagingPost === post.id}
                                            style={{
                                              background: COLORS.surface.input,
                                              border: '1px solid rgba(255,255,255,0.1)',
                                              borderRadius: RADIUS.full,
                                              color: COLORS.text.secondary,
                                              fontSize: TYPOGRAPHY.xs,
                                              padding: '6px 14px',
                                              cursor: engagingPost === post.id ? 'not-allowed' : 'pointer',
                                              opacity: engagingPost === post.id ? 0.5 : 1,
                                              fontWeight: '600',
                                              transition: 'all 0.2s ease',
                                            }}
                                          >
                                            💬 Comment
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    {/* Comment input */}
                                    {commentInput?.postId === post.id && (
                                      <div style={{ marginTop: SPACING.sm + 2, display: 'flex', gap: SPACING.xs + 2 }}>
                                        <input
                                          type="text"
                                          value={commentInput.text}
                                          onChange={(e) => setCommentInput({ ...commentInput, text: e.target.value })}
                                          placeholder="Write a comment..."
                                          style={{
                                            flex: 1,
                                            background: COLORS.surface.input,
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            borderRadius: RADIUS.sm,
                                            padding: SPACING.sm + ' ' + SPACING.md,
                                            color: COLORS.text.primary,
                                            fontSize: TYPOGRAPHY.sm,
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                          }}
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
                                          style={{
                                            background: !commentInput.text ? COLORS.surface.input : 'rgba(167,139,250,0.3)',
                                            border: 'none',
                                            borderRadius: RADIUS.sm,
                                            padding: SPACING.sm + ' ' + SPACING.md,
                                            color: !commentInput.text ? COLORS.text.subtle : COLORS.text.primary,
                                            fontSize: TYPOGRAPHY.xs,
                                            fontWeight: '600',
                                            cursor: !commentInput.text ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s ease',
                                          }}
                                        >
                                          Send
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: SPACING.sm,
                                padding: SPACING.sm + ' ' + SPACING.lg,
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: RADIUS.sm,
                                border: '1px dashed rgba(255,255,255,0.1)',
                              }}>
                                <span style={{ fontSize: TYPOGRAPHY.md }}>📝</span>
                                <span style={{ color: COLORS.text.subtle, fontSize: TYPOGRAPHY.xs }}>No posts yet</span>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: SPACING.md + 2 + ' ' + SPACING.lg }}>
                            <div style={{ display: 'flex', gap: SPACING.sm }} onClick={e => e.stopPropagation()}>
                              {!lead.postsFetched && (
                                <button onClick={() => fetchPostsForLeads([lead.id])} disabled={fetchingPosts}
                                  aria-label={`Fetch posts for ${lead.firstName || lead.vanityId}`}
                                  style={{
                                    background: fetchingPosts ? 'rgba(0,119,181,0.1)' : 'linear-gradient(135deg, rgba(0,119,181,0.3), rgba(0,119,181,0.2))',
                                    border: 'none',
                                    borderRadius: RADIUS.sm,
                                    padding: SPACING.xs + ' ' + SPACING.md,
                                    color: COLORS.text.primary,
                                    fontSize: TYPOGRAPHY.xs,
                                    fontWeight: '600',
                                    cursor: fetchingPosts ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: SPACING.xs,
                                    boxShadow: fetchingPosts ? 'none' : '0 2px 8px rgba(0,119,181,0.2)',
                                    transition: 'all 0.2s ease',
                                  }}>
                                  <span>📄</span> Fetch
                                </button>
                              )}
                              <button onClick={() => deleteLead(lead)}
                                disabled={deletingLeadId === lead.id}
                                aria-label={`Delete ${lead.firstName || lead.vanityId}`}
                                style={{
                                  background: 'rgba(248,113,113,0.1)',
                                  border: '1px solid rgba(248,113,113,0.2)',
                                  borderRadius: RADIUS.sm,
                                  padding: SPACING.xs + ' ' + SPACING.sm + 2,
                                  color: COLORS.statusColors.error,
                                  cursor: deletingLeadId === lead.id ? 'not-allowed' : 'pointer',
                                  fontSize: TYPOGRAPHY.sm,
                                  opacity: deletingLeadId === lead.id ? 0.5 : 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'all 0.2s ease',
                                }}>
                                {deletingLeadId === lead.id ? '...' : '🗑️'}
                              </button>
                            </div>
                          </td>
                        </tr>
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
      <div style={{
        ...styles.card,
        background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.05) 100%)',
        border: '1px solid rgba(251,191,36,0.25)',
        borderRadius: RADIUS.lg,
        padding: SPACING.lg + ' ' + SPACING.xl,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.lg }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: RADIUS.lg,
            background: 'linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.15))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: TYPOGRAPHY.xl,
            boxShadow: '0 4px 16px rgba(251,191,36,0.2)',
          }}>
            🛡️
          </div>
          <div>
            <div style={{ color: COLORS.statusColors.warning, fontSize: TYPOGRAPHY.md + 1, fontWeight: '700', marginBottom: SPACING.xs - 1 }}>LinkedIn Safety Built-In</div>
            <div style={{ color: COLORS.text.muted, fontSize: TYPOGRAPHY.sm }}>
              Max 20-30 profiles/day · Actions spaced across days · No same-session like+comment · Auto-pause on warnings
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
