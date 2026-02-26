// @ts-nocheck
import { useState, useEffect, useRef } from 'react';

const STATUS_COLORS = {
  cold: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8', label: 'Cold' },
  touched: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24', label: 'Touched' },
  warm: { bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.3)', text: '#fb923c', label: 'Warm' },
  connected: { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)', text: '#34d399', label: 'Connected' },
  replied: { bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa', label: 'Replied' },
};

const ACTION_LABELS: Record<string, string> = {
  follow: 'Follow', like: 'Like Post', comment: 'Comment on Post',
  like_2: 'Like Another Post', comment_2: 'Second Comment', connect: 'Connection Request',
};

const DEFAULT_SEQUENCE = [
  { day: 1, action: 'follow', enabled: true },
  { day: 3, action: 'like', enabled: true },
  { day: 5, action: 'comment', enabled: true },
  { day: 7, action: 'like_2', enabled: true },
  { day: 10, action: 'connect', enabled: true },
];

export default function LeadWarmerTab(props: any) {
  const { t, user, miniIcon, showToast, extensionConnected } = props;

  // State
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [prospects, setProspects] = useState<any[]>([]);
  const [prospectsLoading, setProspectsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showTouchHistory, setShowTouchHistory] = useState<string | null>(null);
  const [touchLogs, setTouchLogs] = useState<any[]>([]);
  const [touchLogsLoading, setTouchLogsLoading] = useState(false);
  const [fetchingProfiles, setFetchingProfiles] = useState(false);
  const [executingTouch, setExecutingTouch] = useState<string | null>(null);

  // New campaign form
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('relationship');
  const [newBizContext, setNewBizContext] = useState('');
  const [newProfilesPerDay, setNewProfilesPerDay] = useState(20);
  const [newSequence, setNewSequence] = useState(DEFAULT_SEQUENCE);

  // CSV import
  const [csvText, setCsvText] = useState('');
  const csvFileRef = useRef<HTMLInputElement>(null);

  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // ── API helpers ──
  const apiGet = async (url: string) => {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${authToken}` } });
    return res.json();
  };
  const apiPost = async (url: string, body: any) => {
    const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return res.json();
  };
  const apiPut = async (url: string, body: any) => {
    const res = await fetch(url, { method: 'PUT', headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return res.json();
  };
  const apiDelete = async (url: string) => {
    const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${authToken}` } });
    return res.json();
  };

  // ── Load campaigns ──
  const loadCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const data = await apiGet('/api/lead-warmer/campaigns');
      if (data.success) {
        setCampaigns(data.campaigns || []);
        if (!activeCampaignId && data.campaigns?.length > 0) {
          setActiveCampaignId(data.campaigns[0].id);
        }
      }
    } catch {} finally { setCampaignsLoading(false); }
  };

  // ── Load prospects for active campaign ──
  const loadProspects = async (campId?: string) => {
    const cid = campId || activeCampaignId;
    if (!cid) return;
    setProspectsLoading(true);
    try {
      const data = await apiGet(`/api/lead-warmer/prospects?campaignId=${cid}`);
      if (data.success) setProspects(data.prospects || []);
    } catch {} finally { setProspectsLoading(false); }
  };

  // ── Create campaign ──
  const handleCreateCampaign = async () => {
    if (!newName.trim()) { showToast('Campaign name required', 'error'); return; }
    const data = await apiPost('/api/lead-warmer/campaigns', {
      name: newName, campaignGoal: newGoal, businessContext: newBizContext,
      sequenceSteps: newSequence, profilesPerDay: newProfilesPerDay,
    });
    if (data.success) {
      showToast('Campaign created!', 'success');
      setShowCreateCampaign(false);
      setNewName(''); setNewBizContext('');
      setActiveCampaignId(data.campaign.id);
      loadCampaigns();
    } else { showToast(data.error || 'Failed', 'error'); }
  };

  // ── Pause/Resume campaign ──
  const toggleCampaignStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const data = await apiPut('/api/lead-warmer/campaigns', { id, status: newStatus });
    if (data.success) { loadCampaigns(); showToast(`Campaign ${newStatus}`, 'success'); }
  };

  // ── Delete campaign ──
  const deleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign and all its prospects?')) return;
    const data = await apiDelete(`/api/lead-warmer/campaigns?id=${id}`);
    if (data.success) {
      if (activeCampaignId === id) setActiveCampaignId(null);
      loadCampaigns(); showToast('Campaign deleted', 'success');
    }
  };

  // ── Extract vanity ID from URL ──
  function extractVanityId(url: string): string | null {
    const m = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
    return m ? m[1].replace(/\/$/, '') : null;
  }

  // ── CSV import handler ──
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (!text) return;
      const lines = text.split('\n');
      const header = lines[0]?.toLowerCase() || '';
      const urlCol = header.split(',').findIndex(h => h.includes('url') || h.includes('linkedin'));
      const nameCol = header.split(',').findIndex(h => h.includes('first') || h.includes('name'));
      const companyCol = header.split(',').findIndex(h => h.includes('company'));
      const titleCol = header.split(',').findIndex(h => h.includes('title') || h.includes('job'));
      const tagCol = header.split(',').findIndex(h => h.includes('tag') || h.includes('campaign'));
      const noteCol = header.split(',').findIndex(h => h.includes('note'));

      const prospects: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const url = cols[urlCol >= 0 ? urlCol : 0] || '';
        if (!url.includes('linkedin.com/in/')) continue;
        prospects.push({
          linkedinUrl: url,
          firstName: nameCol >= 0 ? cols[nameCol] : '',
          company: companyCol >= 0 ? cols[companyCol] : '',
          jobTitle: titleCol >= 0 ? cols[titleCol] : '',
          campaignTag: tagCol >= 0 ? cols[tagCol] : '',
          notes: noteCol >= 0 ? cols[noteCol] : '',
        });
      }
      if (prospects.length > 0) {
        importProspects(prospects);
      } else {
        showToast('No LinkedIn URLs found in CSV', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Import prospects from parsed data ──
  const importProspects = async (prospectList: any[]) => {
    if (!activeCampaignId) { showToast('Select or create a campaign first', 'error'); return; }
    const data = await apiPost('/api/lead-warmer/prospects', { campaignId: activeCampaignId, prospects: prospectList });
    if (data.success) {
      showToast(`Added ${data.created} prospects (${data.skipped?.length || 0} skipped)`, 'success');
      loadProspects();
      loadCampaigns();
      // Auto-fetch profile data via extension
      const newVanityIds = prospectList.map(p => extractVanityId(p.linkedinUrl || p.url || '')).filter(Boolean);
      if (newVanityIds.length > 0 && extensionConnected) {
        fetchProfilesFromExtension(newVanityIds as string[]);
      }
    } else { showToast(data.error || 'Import failed', 'error'); }
  };

  // ── Add profiles from text input ──
  const handleAddFromText = () => {
    const urls = csvText.split('\n').map(l => l.trim()).filter(l => l.includes('linkedin.com/in/'));
    if (urls.length === 0) { showToast('No LinkedIn URLs found', 'error'); return; }
    const prospectList = urls.map(url => ({ linkedinUrl: url }));
    importProspects(prospectList);
    setCsvText('');
  };

  // ── Fetch profile data from extension (Voyager API) ──
  const fetchProfilesFromExtension = async (vanityIds: string[]) => {
    setFetchingProfiles(true);
    showToast(`Fetching profile data for ${vanityIds.length} profiles via extension...`, 'info');
    try {
      // Send message to extension
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        const extId = await getExtensionId();
        if (extId) {
          chrome.runtime.sendMessage(extId, { action: 'leadWarmer_fetchProfiles', vanityIds }, async (response: any) => {
            if (response?.success && response.results) {
              let updated = 0;
              for (const r of response.results) {
                if (!r.success) continue;
                // Find matching prospect and update
                const prospect = prospects.find(p => p.vanityId === r.vanityId);
                if (prospect) {
                  await apiPut('/api/lead-warmer/prospects', {
                    id: prospect.id, firstName: r.firstName, lastName: r.lastName,
                    profileUrn: r.profileUrn, recentPosts: r.recentPosts || [],
                  });
                  updated++;
                }
              }
              showToast(`Updated ${updated} profiles with LinkedIn data`, 'success');
              loadProspects();
            } else {
              showToast('Extension fetch failed: ' + (response?.error || 'Unknown'), 'error');
            }
            setFetchingProfiles(false);
          });
          return;
        }
      }
      showToast('Extension not available. Profile data will be fetched when touches execute.', 'info');
    } catch (err: any) {
      showToast('Fetch error: ' + err.message, 'error');
    }
    setFetchingProfiles(false);
  };

  const getExtensionId = async (): Promise<string | null> => {
    try {
      const extIds = ['your-extension-id']; // Will auto-detect
      // Check if extension is installed by trying known pattern
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        return null; // Will use internal messaging if on same extension
      }
    } catch {}
    return null;
  };

  // ── Execute a touch manually ──
  const executeManualTouch = async (prospect: any) => {
    if (!extensionConnected) { showToast('Extension not connected. Please open LinkedIn and ensure extension is active.', 'error'); return; }
    setExecutingTouch(prospect.id);
    showToast(`Executing ${prospect.nextTouchAction || 'touch'} on ${prospect.firstName || prospect.vanityId}...`, 'info');

    const campaign = campaigns.find(c => c.id === prospect.campaignId);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/extension/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          command: 'lead_warmer_touch',
          data: {
            prospectId: prospect.id,
            vanityId: prospect.vanityId,
            linkedinUrl: prospect.linkedinUrl,
            action: prospect.nextTouchAction || 'follow',
            touchNumber: prospect.touchCount + 1,
            campaignGoal: campaign?.campaignGoal || 'relationship',
            businessContext: campaign?.businessContext || '',
            firstName: prospect.firstName,
            lastName: prospect.lastName,
            company: prospect.company,
            jobTitle: prospect.jobTitle,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Touch command sent to extension!', 'success');
        setTimeout(() => loadProspects(), 5000);
      } else {
        showToast(data.error || 'Failed to send command', 'error');
      }
    } catch (err: any) { showToast('Error: ' + err.message, 'error'); }
    setExecutingTouch(null);
  };

  // ── Load touch history ──
  const loadTouchHistory = async (prospectId: string) => {
    setShowTouchHistory(prospectId);
    setTouchLogsLoading(true);
    try {
      const data = await apiGet(`/api/lead-warmer/touch-log?prospectId=${prospectId}`);
      if (data.success) setTouchLogs(data.logs || []);
    } catch {} finally { setTouchLogsLoading(false); }
  };

  // ── Delete prospect ──
  const deleteProspect = async (id: string) => {
    const data = await apiDelete(`/api/lead-warmer/prospects?id=${id}`);
    if (data.success) { loadProspects(); loadCampaigns(); }
  };

  // ── Export warm leads to CSV ──
  const exportWarmLeads = () => {
    const warm = prospects.filter(p => ['warm', 'connected', 'replied'].includes(p.status));
    if (warm.length === 0) { showToast('No warm leads to export', 'error'); return; }
    const header = 'LinkedIn URL,First Name,Last Name,Company,Job Title,Status,Touch Count\n';
    const rows = warm.map(p => `${p.linkedinUrl},${p.firstName || ''},${p.lastName || ''},${p.company || ''},${p.jobTitle || ''},${p.status},${p.touchCount}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'warm-leads.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${warm.length} warm leads`, 'success');
  };

  // ── Initial load ──
  useEffect(() => { loadCampaigns(); }, []);
  useEffect(() => { if (activeCampaignId) loadProspects(activeCampaignId); }, [activeCampaignId]);

  // ── Computed ──
  const activeCampaign = campaigns.find(c => c.id === activeCampaignId);
  const filteredProspects = prospects.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (p.firstName || '').toLowerCase().includes(q) || (p.lastName || '').toLowerCase().includes(q) ||
        (p.company || '').toLowerCase().includes(q) || (p.linkedinUrl || '').toLowerCase().includes(q);
    }
    return true;
  });

  const hotSignals = prospects.filter(p => p.engagedBack);
  const pipelineCounts = {
    cold: prospects.filter(p => p.status === 'cold').length,
    touched: prospects.filter(p => p.status === 'touched').length,
    warm: prospects.filter(p => p.status === 'warm').length,
    connected: prospects.filter(p => p.status === 'connected').length,
    replied: prospects.filter(p => p.status === 'replied').length,
  };

  // ── Styles ──
  const card = { background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' };
  const btn = (bg: string, disabled = false) => ({
    padding: '8px 16px', background: disabled ? 'rgba(255,255,255,0.1)' : bg, color: 'white',
    border: 'none', borderRadius: '8px', fontWeight: '700' as const, fontSize: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
  });
  const input = { padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', width: '100%' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* ── Header with funnel visualization ── */}
      <div style={{ ...card, background: 'linear-gradient(135deg, rgba(105,63,233,0.15) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(105,63,233,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '800', margin: 0 }}>Lead Warmer</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: '4px 0 0 0' }}>
              Cold prospect → Warm lead → Conversation → Sale
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={exportWarmLeads} style={btn('rgba(255,255,255,0.1)')}>Export Warm Leads</button>
            <button onClick={() => setShowCreateCampaign(true)} style={btn('linear-gradient(135deg, #693fe9, #8b5cf6)')}>+ New Campaign</button>
          </div>
        </div>

        {/* Pipeline Funnel */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
          {Object.entries(STATUS_COLORS).map(([key, val]) => {
            const count = pipelineCounts[key as keyof typeof pipelineCounts] || 0;
            const maxCount = Math.max(...Object.values(pipelineCounts), 1);
            const height = Math.max(20, (count / maxCount) * 60);
            return (
              <div key={key} onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
                style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '6px 4px',
                  background: statusFilter === key ? val.bg : 'transparent',
                  border: statusFilter === key ? `1px solid ${val.border}` : '1px solid transparent',
                  borderRadius: '8px', transition: 'all 0.2s' }}>
                <div style={{ height: `${height}px`, background: val.bg, borderRadius: '4px 4px 0 0', margin: '0 auto 4px', width: '60%', border: `1px solid ${val.border}` }} />
                <div style={{ fontSize: '18px', fontWeight: '800', color: val.text }}>{count}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>{val.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Hot Signals Alert ── */}
      {hotSignals.length > 0 && (
        <div style={{ ...card, background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)' }}>
          <h4 style={{ color: '#fb923c', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {miniIcon('M13 2L3 14h9l-1 8 10-12h-9l1-8z', '#fb923c', 14)} Hot Signals — Follow Up Now!
          </h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {hotSignals.map(p => (
              <div key={p.id} style={{ padding: '6px 12px', background: 'rgba(251,146,60,0.15)', borderRadius: '8px', border: '1px solid rgba(251,146,60,0.3)' }}>
                <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{p.firstName} {p.lastName}</span>
                <span style={{ color: '#fb923c', fontSize: '10px', marginLeft: '8px' }}>engaged back!</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Campaign Selector ── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {campaignsLoading ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', padding: '8px' }}>Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', padding: '8px' }}>No campaigns yet. Create one to get started.</div>
        ) : campaigns.map(c => (
          <div key={c.id} onClick={() => setActiveCampaignId(c.id)}
            style={{ padding: '8px 14px', background: activeCampaignId === c.id ? 'rgba(105,63,233,0.2)' : 'rgba(255,255,255,0.05)',
              border: activeCampaignId === c.id ? '2px solid rgba(105,63,233,0.6)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>
              <div style={{ color: 'white', fontSize: '12px', fontWeight: '700' }}>{c.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>
                {c.totalProspects} prospects · {c.status}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={(e) => { e.stopPropagation(); toggleCampaignStatus(c.id, c.status); }}
                style={{ background: 'none', border: 'none', color: c.status === 'active' ? '#fbbf24' : '#34d399', cursor: 'pointer', fontSize: '10px', padding: '2px 6px' }}>
                {c.status === 'active' ? 'Pause' : 'Resume'}
              </button>
              <button onClick={(e) => { e.stopPropagation(); deleteCampaign(c.id); }}
                style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '10px', padding: '2px 6px' }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create Campaign Modal ── */}
      {showCreateCampaign && (
        <div style={{ ...card, border: '2px solid rgba(105,63,233,0.4)', background: 'linear-gradient(180deg, rgba(105,63,233,0.08) 0%, rgba(255,255,255,0.03) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {miniIcon('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', 'white', 18)}
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '800', margin: 0 }}>Create New Campaign</h4>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: '2px 0 0 0' }}>Set up a multi-touch warm outreach sequence</p>
            </div>
            <button onClick={() => setShowCreateCampaign(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          </div>

          {/* Campaign Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Campaign Name *</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Q1 SaaS Founders Outreach" style={{ ...input, fontSize: '13px', padding: '10px 14px' }} />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Business / Offer</label>
                <textarea value={newBizContext} onChange={e => setNewBizContext(e.target.value)}
                  placeholder="I help SaaS founders reduce churn through onboarding audits. Our tool saved $2M+ in revenue for 50+ companies." rows={2} style={{ ...input, resize: 'vertical', lineHeight: '1.5' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Campaign Goal</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {[
                    { value: 'relationship', label: 'Relationship', icon: '🤝', desc: 'Build trust' },
                    { value: 'authority', label: 'Authority', icon: '👑', desc: 'Thought leader' },
                    { value: 'warm_pitch', label: 'Warm Pitch', icon: '🎯', desc: 'Sales ready' },
                    { value: 'recruit', label: 'Recruit', icon: '🔍', desc: 'Hire talent' },
                  ].map(g => (
                    <button key={g.value} onClick={() => setNewGoal(g.value)}
                      style={{ padding: '8px 6px', background: newGoal === g.value ? 'rgba(105,63,233,0.2)' : 'rgba(255,255,255,0.04)', border: newGoal === g.value ? '2px solid rgba(105,63,233,0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', marginBottom: '2px' }}>{g.icon}</div>
                      <div style={{ color: 'white', fontSize: '10px', fontWeight: '700' }}>{g.label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '8px' }}>{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Profiles/Day</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="range" min={1} max={30} value={newProfilesPerDay} onChange={e => setNewProfilesPerDay(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: '#693fe9' }} />
                  <span style={{ color: '#a78bfa', fontSize: '16px', fontWeight: '800', minWidth: '28px', textAlign: 'center' }}>{newProfilesPerDay}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Sequence Builder */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Warm Sequence Timeline</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', padding: '12px 8px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
              {newSequence.map((step, idx) => {
                const actionIcons: Record<string, string> = { follow: '👤', like: '👍', comment: '💬', like_2: '❤️', comment_2: '✍️', connect: '🤝' };
                const actionColors: Record<string, string> = { follow: '#60a5fa', like: '#34d399', comment: '#a78bfa', like_2: '#f472b6', comment_2: '#fbbf24', connect: '#10b981' };
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                    <div onClick={() => {
                      const ns = [...newSequence]; ns[idx] = { ...ns[idx], enabled: !ns[idx].enabled }; setNewSequence(ns);
                    }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 12px', background: step.enabled ? 'rgba(105,63,233,0.12)' : 'rgba(255,255,255,0.03)', borderRadius: '10px', border: step.enabled ? `2px solid ${actionColors[step.action] || '#693fe9'}40` : '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', minWidth: '80px', opacity: step.enabled ? 1 : 0.4, transition: 'all 0.2s' }}>
                      <div style={{ fontSize: '20px' }}>{actionIcons[step.action] || '📌'}</div>
                      <select value={step.action} onClick={e => e.stopPropagation()} onChange={e => {
                        const ns = [...newSequence]; ns[idx] = { ...ns[idx], action: e.target.value }; setNewSequence(ns);
                      }} style={{ background: 'transparent', border: 'none', color: actionColors[step.action] || '#a78bfa', fontSize: '10px', fontWeight: '700', textAlign: 'center', cursor: 'pointer', outline: 'none', width: '100%' }}>
                        {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k} style={{ background: '#1a1a3e' }}>{v}</option>)}
                      </select>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>Day</span>
                        <input type="number" value={step.day} min={1} max={30} onClick={e => e.stopPropagation()} onChange={e => {
                          const ns = [...newSequence]; ns[idx] = { ...ns[idx], day: parseInt(e.target.value) || 1 }; setNewSequence(ns);
                        }} style={{ width: '30px', background: 'transparent', border: 'none', color: 'white', fontSize: '12px', fontWeight: '700', textAlign: 'center', outline: 'none' }} />
                      </div>
                    </div>
                    {idx < newSequence.length - 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 2px' }}>
                        <div style={{ width: '20px', height: '2px', background: 'linear-gradient(90deg, rgba(105,63,233,0.4), rgba(105,63,233,0.1))' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', margin: '4px 0 0 8px' }}>Click to enable/disable steps. Dropdown to change action. Edit day numbers inline.</p>
          </div>

          {/* Quick Add Profiles */}
          <div style={{ marginBottom: '14px', padding: '12px', background: 'rgba(0,119,181,0.06)', borderRadius: '10px', border: '1px solid rgba(0,119,181,0.15)' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {miniIcon('M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75', '#60a5fa', 12)} Quick Add Profiles (optional — add more after creating)
            </label>
            <textarea value={csvText} onChange={e => setCsvText(e.target.value)}
              placeholder="Paste LinkedIn profile URLs (one per line):&#10;https://www.linkedin.com/in/john-doe&#10;https://www.linkedin.com/in/jane-smith" rows={3}
              style={{ ...input, fontFamily: 'monospace', fontSize: '11px', resize: 'vertical', lineHeight: '1.6' }} />
            {csvText.trim() && (() => {
              const count = csvText.split('\n').filter(l => l.trim().includes('linkedin.com/in/')).length;
              return <p style={{ color: count > 0 ? '#34d399' : '#f87171', fontSize: '10px', margin: '4px 0 0 0' }}>{count} profile{count !== 1 ? 's' : ''} detected</p>;
            })()}
          </div>

          {/* LinkedIn Post Preview Mockup */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preview: How your outreach will look</label>
            <div style={{ maxWidth: '380px', background: '#1b1f23', borderRadius: '10px', border: '1px solid #38434f', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              <div style={{ padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px' }}>
                  {(user?.name?.[0] || 'Y').toUpperCase()}
                </div>
                <div>
                  <div style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{user?.name || 'Your Name'}</div>
                  <div style={{ color: '#ffffffb3', fontSize: '10px' }}>Just now</div>
                </div>
              </div>
              <div style={{ padding: '0 14px 10px', color: '#ffffffe6', fontSize: '12px', lineHeight: '1.5' }}>
                {newGoal === 'relationship' && "Great insights on scaling SaaS! Your approach to customer success resonated with me. Would love to connect and exchange ideas."}
                {newGoal === 'authority' && "This is an excellent breakdown. I've seen similar patterns in my work with 50+ SaaS companies. The churn reduction framework is spot on."}
                {newGoal === 'warm_pitch' && "Impressive growth numbers! We helped similar companies save $2M+ with our approach. Would love to share some relevant case studies."}
                {newGoal === 'recruit' && "Your work at this company is impressive! We're building something exciting and your expertise would be invaluable. Let's connect!"}
              </div>
              <div style={{ padding: '6px 14px', borderTop: '1px solid #38434f', display: 'flex', justifyContent: 'space-around' }}>
                {['👍 Like', '💬 Comment', '🔄 Repost'].map(a => (
                  <span key={a} style={{ color: '#ffffff60', fontSize: '10px', padding: '4px' }}>{a}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={async () => {
              await handleCreateCampaign();
              if (csvText.trim()) {
                const urls = csvText.split('\n').map(l => l.trim()).filter(l => l.includes('linkedin.com/in/'));
                if (urls.length > 0) {
                  const prospectList = urls.map(url => ({ linkedinUrl: url }));
                  setTimeout(() => importProspects(prospectList), 500);
                }
              }
            }} style={{ ...btn('linear-gradient(135deg, #693fe9, #8b5cf6)'), padding: '12px 24px', fontSize: '13px', boxShadow: '0 4px 15px rgba(105,63,233,0.3)' }}>
              {miniIcon('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', 'white', 12)} Create Campaign{csvText.trim() ? ' & Import Profiles' : ''}
            </button>
            <button onClick={() => setShowCreateCampaign(false)} style={{ ...btn('rgba(255,255,255,0.1)'), padding: '12px 20px' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Add Prospects Section ── */}
      {activeCampaignId && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>Add Prospects</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input ref={csvFileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvFileUpload} />
              <button onClick={() => csvFileRef.current?.click()} style={btn('rgba(255,255,255,0.08)')}>
                Upload CSV
              </button>
              {fetchingProfiles && <span style={{ color: '#a78bfa', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>Fetching profiles...</span>}
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '6px' }}>
            CSV columns: LinkedIn Profile URL (required), First Name, Company, Job Title, Campaign Tag, Notes
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <textarea value={csvText} onChange={e => setCsvText(e.target.value)}
              placeholder="https://www.linkedin.com/in/john-doe&#10;https://www.linkedin.com/in/jane-smith" rows={3}
              style={{ ...input, flex: 1, fontFamily: 'monospace', resize: 'vertical' }} />
            <button onClick={handleAddFromText} disabled={!csvText.trim()} style={{ ...btn('linear-gradient(135deg, #10b981, #059669)', !csvText.trim()), alignSelf: 'flex-end' }}>
              Add
            </button>
          </div>
        </div>
      )}

      {/* ── Prospects Table ── */}
      {activeCampaignId && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>
              Prospects ({filteredProspects.length})
            </h4>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..."
              style={{ ...input, width: '200px' }} />
          </div>

          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setStatusFilter('all')}
              style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', cursor: 'pointer',
                background: statusFilter === 'all' ? 'rgba(255,255,255,0.15)' : 'transparent', color: 'rgba(255,255,255,0.7)',
                border: statusFilter === 'all' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>All</button>
            {Object.entries(STATUS_COLORS).map(([key, val]) => (
              <button key={key} onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
                style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', cursor: 'pointer',
                  background: statusFilter === key ? val.bg : 'transparent', color: val.text,
                  border: statusFilter === key ? `1px solid ${val.border}` : '1px solid rgba(255,255,255,0.08)' }}>
                {val.label}
              </button>
            ))}
          </div>

          {prospectsLoading ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px', fontSize: '12px' }}>Loading prospects...</div>
          ) : filteredProspects.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '30px', fontSize: '12px' }}>
              {prospects.length === 0 ? 'No prospects yet. Add LinkedIn URLs or upload a CSV above.' : 'No matches for current filter.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#1a1a3e', zIndex: 1 }}>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Name', 'Company', 'Status', 'Touches', 'Next Touch', 'Recent Post', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProspects.map(p => {
                    const sc = STATUS_COLORS[p.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.cold;
                    let posts: any[] = [];
                    try { posts = JSON.parse(p.recentPosts || '[]'); } catch {}
                    const latestPost = posts[0]?.text || '';
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px', minWidth: '120px' }}>
                          <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', fontWeight: '600' }}>
                            {p.firstName || p.vanityId || 'Unknown'} {p.lastName || ''}
                          </a>
                          {p.jobTitle && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>{p.jobTitle}</div>}
                        </td>
                        <td style={{ padding: '8px', color: 'rgba(255,255,255,0.6)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.company || '-'}</td>
                        <td style={{ padding: '8px' }}>
                          <span style={{ padding: '2px 8px', background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: '4px', color: sc.text, fontSize: '9px', fontWeight: '600' }}>
                            {sc.label}
                          </span>
                          {p.engagedBack && <span style={{ marginLeft: '4px', color: '#fb923c', fontSize: '9px' }}>🔥</span>}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <button onClick={() => loadTouchHistory(p.id)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                            {p.touchCount}
                          </button>
                        </td>
                        <td style={{ padding: '8px', fontSize: '10px' }}>
                          {p.nextTouchAction ? (
                            <div>
                              <span style={{ color: '#a78bfa' }}>{ACTION_LABELS[p.nextTouchAction] || p.nextTouchAction}</span>
                              {p.nextTouchDate && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>{new Date(p.nextTouchDate).toLocaleDateString()}</div>}
                            </div>
                          ) : <span style={{ color: 'rgba(255,255,255,0.3)' }}>Done</span>}
                        </td>
                        <td style={{ padding: '8px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>
                          {latestPost ? latestPost.substring(0, 80) + '...' : <span style={{ color: 'rgba(255,255,255,0.2)' }}>No posts fetched</span>}
                        </td>
                        <td style={{ padding: '8px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {p.nextTouchAction && (
                              <button onClick={() => executeManualTouch(p)} disabled={!!executingTouch}
                                style={{ ...btn('linear-gradient(135deg,#693fe9,#8b5cf6)', !!executingTouch), padding: '4px 8px', fontSize: '10px' }}>
                                {executingTouch === p.id ? '...' : 'Execute'}
                              </button>
                            )}
                            <button onClick={() => deleteProspect(p.id)}
                              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px', padding: '4px' }}>✕</button>
                          </div>
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

      {/* ── Touch History Modal ── */}
      {showTouchHistory && (
        <>
          <div onClick={() => setShowTouchHistory(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10001, background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', padding: '20px', width: '500px', maxHeight: '500px', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0 }}>Touch History</h4>
              <button onClick={() => setShowTouchHistory(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            {touchLogsLoading ? (
              <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px' }}>Loading...</div>
            ) : touchLogs.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px' }}>No touches recorded yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {touchLogs.map(log => (
                  <div key={log.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ color: '#a78bfa', fontSize: '11px', fontWeight: '700' }}>
                        Touch #{log.touchNumber} — {ACTION_LABELS[log.action] || log.action}
                      </span>
                      <span style={{ color: log.status === 'completed' ? '#34d399' : log.status === 'failed' ? '#f87171' : '#fbbf24', fontSize: '10px', fontWeight: '600' }}>
                        {log.status}
                      </span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>{new Date(log.createdAt).toLocaleString()}</div>
                    {log.commentText && (
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginTop: '4px', padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontStyle: 'italic' }}>
                        &ldquo;{log.commentText}&rdquo;
                      </div>
                    )}
                    {log.connectionNote && (
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginTop: '4px' }}>
                        Note: &ldquo;{log.connectionNote}&rdquo;
                      </div>
                    )}
                    {log.postUrl && (
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', marginTop: '2px' }}>Post: {log.postUrl}</div>
                    )}
                    {log.errorMessage && (
                      <div style={{ color: '#f87171', fontSize: '10px', marginTop: '2px' }}>Error: {log.errorMessage}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Campaign Sequence Preview ── */}
      {activeCampaign && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>Warm Sequence — {activeCampaign.name}</h4>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>Goal: {activeCampaign.campaignGoal}</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {(() => {
              try {
                const steps = JSON.parse(activeCampaign.sequenceSteps || '[]');
                return steps.filter((s: any) => s.enabled).map((step: any, idx: number, arr: any[]) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ padding: '6px 10px', background: 'rgba(105,63,233,0.1)', borderRadius: '8px', border: '1px solid rgba(105,63,233,0.2)', textAlign: 'center' }}>
                      <div style={{ color: '#a78bfa', fontSize: '9px', fontWeight: '600' }}>Day {step.day}</div>
                      <div style={{ color: 'white', fontSize: '10px', fontWeight: '700' }}>{ACTION_LABELS[step.action] || step.action}</div>
                    </div>
                    {idx < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '16px' }}>→</span>}
                  </div>
                ));
              } catch { return null; }
            })()}
          </div>
          {activeCampaign.businessContext && (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '8px', fontStyle: 'italic' }}>
              Business: {activeCampaign.businessContext}
            </div>
          )}
        </div>
      )}

      {/* ── Safety Notice ── */}
      <div style={{ ...card, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {miniIcon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', '#fbbf24', 14)}
          <div>
            <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: '700' }}>LinkedIn Safety Built-In</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
              Max 20-30 profiles/day · Actions spaced across days · No same-session like+comment · Skips inactive profiles · Auto-pause on warnings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
