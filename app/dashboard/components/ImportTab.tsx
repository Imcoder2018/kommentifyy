import { useState, useEffect, useRef } from 'react';

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

const DEFAULT_SEQUENCE = [
  { day: 1, action: 'follow', enabled: true },
  { day: 3, action: 'like', enabled: true },
  { day: 5, action: 'comment', enabled: true },
  { day: 7, action: 'like', enabled: true },
  { day: 10, action: 'connect', enabled: false },
];

export default function ImportTab(props: any) {
    const { t, user, miniIcon, showToast, extensionConnected } = props;

    const [leads, setLeads] = useState<any[]>([]);
    const [leadsLoading, setLeadsLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
    const [fetchingPosts, setFetchingPosts] = useState(false);
    const [fetchProgress, setFetchProgress] = useState('');
    const [engagingPost, setEngagingPost] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    const [importText, setImportText] = useState('');
    const csvFileRef = useRef<HTMLInputElement>(null);

    const [campaignName, setCampaignName] = useState('My Warm Leads');
    const [businessContext, setBusinessContext] = useState('');
    const [campaignGoal, setCampaignGoal] = useState('relationship');
    const [profilesPerDay, setProfilesPerDay] = useState(20);
    const [sequenceSteps, setSequenceSteps] = useState(DEFAULT_SEQUENCE);
    const [autopilotEnabled, setAutopilotEnabled] = useState(false);

    // Get fresh auth token on each call
    const getAuthToken = () => typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const apiGet = async (url: string) => {
        const token = getAuthToken();
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        return res.json();
    };
    const apiPost = async (url: string, body: any) => {
        const token = getAuthToken();
        const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        return res.json();
    };
    const apiDelete = async (url: string) => {
        const token = getAuthToken();
        const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        return res.json();
    };

    const loadLeads = async () => {
        setLeadsLoading(true);
        try {
            const data = await apiGet('/api/warm-leads');
            if (data.success) {
                setLeads(data.leads || []);
                if (data.settings) {
                    setSettings(data.settings);
                    setCampaignName(data.settings.campaignName || 'My Warm Leads');
                    setBusinessContext(data.settings.businessContext || '');
                    setCampaignGoal(data.settings.campaignGoal || 'relationship');
                    setProfilesPerDay(data.settings.profilesPerDay || 20);
                    setAutopilotEnabled(data.settings.autopilotEnabled || false);
                    try { setSequenceSteps(JSON.parse(data.settings.sequenceSteps)); } catch { setSequenceSteps(DEFAULT_SEQUENCE); }
                }
            }
        } catch (e) { console.error('Load leads error:', e); }
        finally { setLeadsLoading(false); }
    };

    const saveSettings = async () => {
        setSettingsSaving(true);
        try {
            const data = await apiPost('/api/warm-leads', {
                action: 'save_settings',
                campaignName, businessContext, campaignGoal, profilesPerDay,
                sequenceSteps, autopilotEnabled,
            });
            if (data.success) {
                setSettings(data.settings);
                showToast('Settings saved!', 'success');
            } else { showToast(data.error || 'Failed to save', 'error'); }
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
        finally { setSettingsSaving(false); }
    };

    const handleImportLeads = async () => {
        const urls = importText.split('\n').map(l => l.trim()).filter(l => l.includes('linkedin.com/in/'));
        if (urls.length === 0) { showToast('No LinkedIn URLs found', 'error'); return; }
        const leadsList = urls.map(url => ({ linkedinUrl: url.split('?')[0].replace(/\/$/, '') }));
        const data = await apiPost('/api/warm-leads', { leads: leadsList });
        if (data.success) {
            showToast(`Added ${data.created} leads (${data.skipped?.length || 0} duplicates)`, 'success');
            setImportText('');
            loadLeads();
        } else { showToast(data.error || 'Import failed', 'error'); }
    };

    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            if (!text) return;
            const lines = text.split('\n');
            const header = lines[0]?.toLowerCase() || '';
            const urlCol = header.split(',').findIndex(h => h.includes('url') || h.includes('linkedin'));
            const leadsList: any[] = [];
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                const url = cols[urlCol >= 0 ? urlCol : 0] || '';
                if (url.includes('linkedin.com/in/')) {
                    leadsList.push({ linkedinUrl: url.split('?')[0].replace(/\/$/, '') });
                }
            }
            if (leadsList.length > 0) {
                apiPost('/api/warm-leads', { leads: leadsList }).then(data => {
                    if (data.success) { showToast(`Imported ${data.created} leads`, 'success'); loadLeads(); }
                });
            } else { showToast('No LinkedIn URLs found in CSV', 'error'); }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const fetchPostsForLeads = async (leadIds?: string[]) => {
        if (!extensionConnected) { showToast('Extension not connected. Please open LinkedIn.', 'error'); return; }
        setFetchingPosts(true);
        setFetchProgress('Starting...');
        const targetLeads = leadIds ? leads.filter(l => leadIds.includes(l.id)) : leads.filter(l => !l.postsFetched);
        if (targetLeads.length === 0) { showToast('No leads to fetch', 'info'); setFetchingPosts(false); return; }
        const bulkLimit = settings?.bulkTaskLimit || 10;
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
                showToast(`Fetching posts for ${batchData.length} leads...`, 'info');
                const pollInterval = setInterval(async () => {
                    try {
                        const statusRes = await fetch(`/api/extension/command?commandId=${data.commandId}`, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
                        const statusData = await statusRes.json();
                        if (statusData.command?.status === 'completed') {
                            clearInterval(pollInterval);
                            clearTimeout(timeoutId); // Clear timeout when completed
                            setFetchingPosts(false);
                            setFetchProgress('');
                            showToast(`Fetched posts for ${statusData.command.data?.success || 0} leads!`, 'success');
                            loadLeads();
                        } else if (statusData.command?.status === 'failed') {
                            clearInterval(pollInterval);
                            clearTimeout(timeoutId); // Clear timeout when failed
                            setFetchingPosts(false);
                            showToast('Fetch failed', 'error');
                        } else if (statusData.command?.data?.progress) {
                            setFetchProgress(statusData.command.data.progress);
                        }
                    } catch (e) {}
                }, 3000);
                // Store timeout ID for cleanup and clear both after 5 minutes
                const timeoutId = setTimeout(() => {
                    clearInterval(pollInterval);
                    setFetchingPosts(false);
                    setFetchProgress('');
                    showToast('Fetch timed out', 'error');
                }, 300000);
            } else { showToast(data.error || 'Failed', 'error'); setFetchingPosts(false); }
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); setFetchingPosts(false); }
    };

    const engageWithPost = async (lead: any, post: any, action: 'like' | 'comment', commentText?: string) => {
        if (!extensionConnected) { showToast('Extension not connected', 'error'); return; }
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
                showToast(`${action === 'like' ? 'Liking' : 'Commenting on'} post...`, 'info');
                setTimeout(() => { loadLeads(); setEngagingPost(null); }, 5000);
            } else { showToast(data.error || 'Failed', 'error'); setEngagingPost(null); }
        } catch (e: any) { showToast('Error: ' + e.message, 'error'); setEngagingPost(null); }
    };

    const deleteLead = async (id: string) => {
        const data = await apiDelete(`/api/warm-leads?id=${id}`);
        if (data.success) loadLeads();
    };

    useEffect(() => { loadLeads(); }, []);

    const filteredLeads = leads.filter(l => {
        if (statusFilter !== 'all' && l.status !== statusFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (l.firstName || '').toLowerCase().includes(q) || (l.lastName || '').toLowerCase().includes(q) ||
                (l.company || '').toLowerCase().includes(q) || (l.linkedinUrl || '').toLowerCase().includes(q);
        }
        return true;
    });

    const statusCounts = {
        pending_fetch: leads.filter(l => l.status === 'pending_fetch').length,
        fetched: leads.filter(l => l.status === 'fetched').length,
        engaged: leads.filter(l => l.status === 'engaged').length,
        connected: leads.filter(l => l.status === 'connected').length,
    };

    const card = { background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' };
    const btn = (bg: string, disabled = false) => ({
        padding: '8px 16px', background: disabled ? 'rgba(255,255,255,0.1)' : bg, color: 'white',
        border: 'none', borderRadius: '8px', fontWeight: '700' as const, fontSize: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    });
    const input = { padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', width: '100%' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Header */}
            <div style={{ ...card, background: 'linear-gradient(135deg, rgba(105,63,233,0.15) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(105,63,233,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                        <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '800', margin: 0 }}>Warm Leads</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: '4px 0 0 0' }}>Import → Fetch Posts → Engage → Connect</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {fetchingPosts && <span style={{ color: '#a78bfa', fontSize: '11px' }}>{fetchProgress || 'Fetching...'}</span>}
                        <button onClick={() => setShowSettings(!showSettings)} style={btn('rgba(255,255,255,0.1)')}>Settings</button>
                        <button onClick={() => fetchPostsForLeads()} disabled={fetchingPosts || !extensionConnected}
                            style={btn('linear-gradient(135deg, #0077b5, #00a0dc)', fetchingPosts || !extensionConnected)}>
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
                            <div key={key} onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
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
                <div style={card}>
                    <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: '0 0 12px 0' }}>Engagement Settings</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '4px', display: 'block' }}>Campaign Name</label>
                            <input value={campaignName} onChange={e => setCampaignName(e.target.value)} style={input} placeholder="Q1 SaaS Founders Outreach" />
                        </div>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '4px', display: 'block' }}>Profiles/Day</label>
                            <input type="number" value={profilesPerDay} onChange={e => setProfilesPerDay(parseInt(e.target.value) || 20)} min={1} max={50} style={input} />
                        </div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '4px', display: 'block' }}>Your Business / Offer</label>
                        <textarea value={businessContext} onChange={e => setBusinessContext(e.target.value)} rows={2}
                            style={{ ...input, resize: 'vertical' }} placeholder="I help SaaS founders reduce churn through onboarding audits..." />
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
                                        onClick={() => { const newSteps = [...sequenceSteps]; newSteps[idx].enabled = !newSteps[idx].enabled; setSequenceSteps(newSteps); }}>
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
                        <button onClick={saveSettings} disabled={settingsSaving} style={btn('linear-gradient(135deg, #693fe9, #8b5cf6)', settingsSaving)}>
                            {settingsSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            )}

            {/* Import Section */}
            <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', margin: 0 }}>Import Leads</h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input ref={csvFileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvUpload} />
                        <button onClick={() => csvFileRef.current?.click()} style={btn('rgba(255,255,255,0.08)')}>Upload CSV</button>
                        <span style={{ color: '#a78bfa', fontSize: '11px', alignSelf: 'center' }}>
                            {importText.split('\n').filter(l => l.includes('linkedin.com/in/')).length} detected
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <textarea value={importText} onChange={e => setImportText(e.target.value)}
                        placeholder="Paste LinkedIn profile URLs (one per line)" rows={3}
                        style={{ ...input, flex: 1, fontFamily: 'monospace', resize: 'vertical' }} />
                    <button onClick={handleImportLeads} disabled={!importText.trim()} style={{ ...btn('linear-gradient(135deg, #10b981, #059669)', !importText.trim()), alignSelf: 'flex-end' }}>
                        Import
                    </button>
                </div>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search leads..." style={{ ...input, width: '250px' }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{filteredLeads.length} of {leads.length} leads</span>
            </div>

            {/* Leads Table */}
            {leadsLoading ? (
                <div style={{ ...card, textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)' }}>Loading leads...</div>
                </div>
            ) : leads.length === 0 ? (
                <div style={{ ...card, textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                    <div style={{ color: 'white', fontWeight: '600', marginBottom: '4px' }}>No leads yet</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Import LinkedIn profile URLs to get started</div>
                </div>
            ) : (
                <div style={{ ...card, padding: '0', overflow: 'hidden' }}>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#1a1a3e', zIndex: 1 }}>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    {['Name', 'Company', 'Status', 'Posts', 'Engaged', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', textAlign: 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map(lead => {
                                    const sc = STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending_fetch;
                                    const isExpanded = expandedLeadId === lead.id;
                                    return (
                                        <>
                                            <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                                                onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', fontWeight: '600' }}
                                                        onClick={e => e.stopPropagation()}>
                                                        {lead.firstName || lead.vanityId || 'Unknown'} {lead.lastName || ''}
                                                    </a>
                                                    {lead.headline && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '2px' }}>{lead.headline.slice(0, 50)}...</div>}
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
                                                                style={{ ...btn('rgba(0,119,181,0.2)', fetchingPosts), padding: '4px 8px', fontSize: '10px' }}>
                                                                Fetch
                                                            </button>
                                                        )}
                                                        <button onClick={() => deleteLead(lead.id)}
                                                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px', padding: '4px' }}>✕</button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Expanded Posts Row */}
                                            {isExpanded && lead.posts?.length > 0 && (
                                                <tr key={`${lead.id}-posts`}>
                                                    <td colSpan={6} style={{ padding: '0', background: 'rgba(0,0,0,0.2)' }}>
                                                        <div style={{ padding: '12px 16px', maxHeight: '300px', overflowY: 'auto' }}>
                                                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', marginBottom: '8px' }}>
                                                                Recent Posts ({lead.posts.length})
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                {lead.posts.map((post: any) => (
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
                                                                        <div style={{ color: 'white', fontSize: '11px', lineHeight: '1.4', maxHeight: '60px', overflow: 'auto', marginBottom: '8px' }}>
                                                                            {post.postText || '(No text)'}
                                                                        </div>
                                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>
                                                                                👍 {post.likes || 0} · 💬 {post.comments || 0}
                                                                            </span>
                                                                            <div style={{ flex: 1 }} />
                                                                            {!post.isLiked && (
                                                                                <button onClick={() => engageWithPost(lead, post, 'like')} disabled={engagingPost === post.id}
                                                                                    style={{ ...btn('rgba(52,211,153,0.2)', engagingPost === post.id), padding: '4px 10px', fontSize: '10px' }}>
                                                                                    👍 Like
                                                                                </button>
                                                                            )}
                                                                            {!post.isCommented && (
                                                                                <button onClick={() => {
                                                                                    const comment = prompt('Enter your comment:');
                                                                                    if (comment) engageWithPost(lead, post, 'comment', comment);
                                                                                }} disabled={engagingPost === post.id}
                                                                                    style={{ ...btn('rgba(167,139,250,0.2)', engagingPost === post.id), padding: '4px 10px', fontSize: '10px' }}>
                                                                                    💬 Comment
                                                                                </button>
                                                                            )}
                                                                        </div>
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
            )}

            {/* Safety Notice */}
            <div style={{ ...card, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
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
