import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// High Performance Post Generator - Goal options
const POST_GOALS = [
    { id: 'reach', label: 'Reach', icon: '📈', desc: 'Maximize impressions & views' },
    { id: 'authority', label: 'Authority', icon: '👑', desc: 'Build thought leadership' },
    { id: 'conversation', label: 'Conversation', icon: '💬', desc: 'Drive comments & discussion' },
    { id: 'follower_growth', label: 'Followers', icon: '👥', desc: 'Gain new followers' },
    { id: 'trust', label: 'Trust', icon: '🤝', desc: 'Build credibility' },
    { id: 'lead_gen', label: 'Leads', icon: '🎯', desc: 'Generate business leads' },
];

// Post Types based on HIGH PERFORMANCE POST GENERATOR
const POST_TYPES = [
    { id: 'operator_insight', label: 'Operator Insight', desc: 'Behind-the-scenes knowledge' },
    { id: 'personal_story', label: 'Personal Story', desc: 'Vulnerable narrative with lesson' },
    { id: 'contrarian_take', label: 'Contrarian Take', desc: 'Challenge conventional wisdom' },
    { id: 'framework', label: 'Framework', desc: 'Step-by-step system or process' },
    { id: 'mistake_lesson', label: 'Mistake / Lesson', desc: 'What you learned the hard way' },
    { id: 'commentary', label: 'Commentary', desc: 'Industry news analysis' },
    { id: 'question_post', label: 'Question Post', desc: 'Spark discussion & debate' },
    { id: 'proof_case', label: 'Proof / Case Study', desc: 'Results with evidence' },
];

// Depth options
const DEPTH_OPTIONS = [
    { id: 'short', label: 'Short', chars: '500', desc: '~100 words' },
    { id: 'standard', label: 'Standard', chars: '1200', desc: '~250 words' },
    { id: 'deep', label: 'Deep', chars: '2500', desc: '~500 words' },
];

// Outcome Focus options
const OUTCOME_OPTIONS = [
    { id: 'conversation', label: 'Conversation', icon: '💬' },
    { id: 'saves', label: 'Saves', icon: '🔖' },
    { id: 'shares', label: 'Shares', icon: '🔄' },
    { id: 'profile_interest', label: 'Profile Interest', icon: '👤' },
    { id: 'followers', label: 'Followers', icon: '➕' },
];

export default function WriterTabNew(props: any) {
    const {
        // Core
        t, user, usage, router, miniIcon, showToast, setActiveTab, isFreePlan, showUpgradeModal, setShowUpgradeModal, dashLang, isDeveloper,
        // All other props
        writerTopic, setWriterTopic, writerTemplate, setWriterTemplate, writerTone, setWriterTone,
        writerLength, setWriterLength, writerHashtags, setWriterHashtags, writerEmojis, setWriterEmojis,
        writerLanguage, setWriterLanguage, writerContent, setWriterContent,
        writerGenerating, setWriterGenerating, writerScheduleDate, setWriterScheduleDate, writerScheduleTime, setWriterScheduleTime,
        writerDrafts, writerScheduledPosts, writerTokenUsage, writerImageFile, setWriterImageFile,
        writerImageUrl, setWriterImageUrl, writerMediaBlobUrl, setWriterMediaBlobUrl,
        writerMediaType, setWriterMediaType, writerUploading, setWriterUploading,
        writerPreviewMode, setWriterPreviewMode, writerPreviewExpanded, setWriterPreviewExpanded,
        writerUseLinkedInAPI, setWriterUseLinkedInAPI, fileInputRef, writerStatus, setWriterStatus, writerModel,
        writerPosting, MODEL_OPTIONS, handleWriterModelChange,
        userGoal, setUserGoal, userTargetAudience, setUserTargetAudience,
        userWritingStyle, setUserWritingStyle, userWritingStyleSource, setUserWritingStyleSource,
        goalsLoading, goalsSuggesting, loadUserGoals, saveUserGoals, suggestGoals,
        generatePost, saveDraft, loadDrafts, loadScheduledPosts, sendToExtension, schedulePost, deleteDraft,
        savedPosts, savedPostsLoading, inspirationSources, inspirationLoading, inspirationSelected, setInspirationSelected,
        useProfileData, setUseProfileData, loadInspirationSources, sharedInspProfiles, linkedInProfile,
        voyagerData, voyagerLoading, loadVoyagerData, generateTopicSuggestions,
        linkedInUseProfileData, setLinkedInUseProfileData, linkedInTopicSuggestions, linkedInGeneratingTopics,
        showLinkedInDataModal, setShowLinkedInDataModal, toggleLinkedInProfileData, selectTopicSuggestion,
        taskCounts, calendarMonth, setCalendarMonth, calendarYear, setCalendarYear,
        showInspirationPopup, setShowInspirationPopup, plannerOpen, setPlannerOpen
    } = props;

    // High Performance Post Generator state
    const [postGoal, setPostGoal] = useState<string>('reach');
    const [postType, setPostType] = useState<string>('operator_insight');
    const [postDepth, setPostDepth] = useState<string>('standard');
    const [outcomeF, setOutcomeF] = useState<string>('conversation');
    const [postStrength, setPostStrength] = useState<number>(50); // 0-100 slider

    // Analysis state
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    // Hook generator state
    const [hooks, setHooks] = useState<any[]>([]);
    const [hooksGenerating, setHooksGenerating] = useState(false);
    const [selectedHook, setSelectedHook] = useState<string>('');
    const [hookCategory, setHookCategory] = useState<string>('all');
    const [hooksStatus, setHooksStatus] = useState('');

    // AI Chatbot state
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-fill from profile data
    const [writerTargetAudience, setWriterTargetAudience] = useState(userTargetAudience || '');
    const [writerKeyMessage, setWriterKeyMessage] = useState('');
    const [writerBackground, setWriterBackground] = useState(
        voyagerData?.headline || linkedInProfile?.headline || ''
    );

    // Sync depth to length
    useEffect(() => {
        const depthOpt = DEPTH_OPTIONS.find(d => d.id === postDepth);
        if (depthOpt) setWriterLength(depthOpt.chars);
    }, [postDepth]);

    // Sync post type to template
    useEffect(() => {
        const typeMap: Record<string, string> = {
            'operator_insight': 'thought_leadership',
            'personal_story': 'personal_story',
            'contrarian_take': 'controversial',
            'framework': 'how_to',
            'mistake_lesson': 'personal_story',
            'commentary': 'insight',
            'question_post': 'question',
            'proof_case': 'case_study'
        };
        if (typeMap[postType]) setWriterTemplate(typeMap[postType]);
    }, [postType]);

    // AI-powered post analysis (replaces heuristic)
    const analyzePost = async () => {
        if (!writerContent.trim()) return;
        if (isFreePlan) { setShowUpgradeModal(true); return; }
        setAnalyzing(true);
        setShowAnalysis(true);
        setAnalysisData(null);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/ai/analyze-post-deep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    postContent: writerContent,
                    authorHeadline: voyagerData?.headline || linkedInProfile?.headline || '',
                    model: writerModel
                }),
            });
            const data = await res.json();
            if (data.success && data.analysis) {
                setAnalysisData(data.analysis);
            } else {
                setAnalysisData({ error: data.error || 'Analysis failed' });
            }
        } catch (e: any) {
            setAnalysisData({ error: 'Error: ' + e.message });
        } finally {
            setAnalyzing(false);
        }
    };

    // Generate hooks
    const generateHooks = async () => {
        if (isFreePlan) { setShowUpgradeModal(true); return; }
        if (!writerTopic.trim()) { setHooksStatus('Please enter a topic first'); return; }

        setHooksGenerating(true);
        setHooksStatus('Generating 10 hook variations...');
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/ai/generate-hooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    topic: writerTopic,
                    voiceProfile: `${writerTone}, ${userGoal || 'engaging'}`,
                    goal: userGoal || 'Maximize engagement',
                    model: writerModel
                }),
            });
            const data = await res.json();
            if (data.success && data.hooks) {
                setHooks(data.hooks);
                setHooksStatus(`Generated ${data.hooks.length} hooks! Click one to select.`);
            } else {
                setHooksStatus(data.error || 'Failed to generate hooks');
            }
        } catch (e: any) {
            setHooksStatus('Error: ' + e.message);
        } finally {
            setHooksGenerating(false);
        }
    };

    // Generate full post (with or without selected hook)
    const generatePostWithHook = async () => {
        if (isFreePlan) { setShowUpgradeModal(true); return; }
        if (!writerTopic.trim()) { setWriterStatus('Please enter a topic first'); return; }

        setWriterGenerating(true);
        setWriterStatus(selectedHook ? 'Generating post with selected hook...' : 'Generating post...');
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/ai/generate-post-with-hook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    selectedHook,
                    topic: writerTopic,
                    template: writerTemplate,
                    tone: writerTone,
                    length: writerLength,
                    includeHashtags: writerHashtags,
                    includeEmojis: writerEmojis,
                    language: writerLanguage,
                    targetAudience: writerTargetAudience || userTargetAudience,
                    keyMessage: writerKeyMessage,
                    userBackground: writerBackground,
                    useInspirationSources: userWritingStyleSource !== 'user_default',
                    inspirationSourceNames: userWritingStyleSource.startsWith('insp_')
                        ? [userWritingStyleSource.replace('insp_', '')]
                        : userWritingStyleSource.startsWith('shared_')
                            ? [userWritingStyleSource.replace('shared_', '')]
                            : [],
                    useProfileData: linkedInUseProfileData && voyagerData,
                    profileData: linkedInUseProfileData && voyagerData ? {
                        headline: voyagerData.headline,
                        about: voyagerData.about,
                        location: voyagerData.location,
                        skills: voyagerData.skills,
                        experience: voyagerData.experience,
                        recentPosts: voyagerData.recentPosts,
                    } : null,
                    model: writerModel,
                    userGoal,
                    postGoal,
                    postType,
                    postDepth,
                    outcomeF,
                }),
            });
            const data = await res.json();
            if (data.success && data.content) {
                setWriterContent(data.content);
                setWriterStatus('Post generated! Review and edit as needed.');
                setWriterPreviewMode('desktop');
                setWriterPreviewExpanded(false);
            } else {
                setWriterStatus(data.error || 'Generation failed');
            }
        } catch (e: any) {
            setWriterStatus('Error: ' + e.message);
        } finally {
            setWriterGenerating(false);
        }
    };

    // AI Chatbot send message
    const sendChatMessage = async () => {
        if (!chatInput.trim() || chatSending) return;

        const userMsg = { role: 'user', content: chatInput };
        setChatMessages([...chatMessages, userMsg]);
        setChatInput('');
        setChatSending(true);

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/ai/post-helper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    messages: [...chatMessages, userMsg],
                    currentPost: writerContent,
                    model: writerModel
                }),
            });
            const data = await res.json();
            if (data.success) {
                setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        } catch (e) {
            console.error('Chat error:', e);
        } finally {
            setChatSending(false);
        }
    };

    const filteredHooks = hookCategory === 'all' ? hooks : hooks.filter((h: any) => h.category === hookCategory);

    return (
        <div style={{ padding: 0 }}>
            {/* Voyager LinkedIn Profile Banner */}
            <div style={{ background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        {typeof voyagerData?.profilePicture === 'string' && voyagerData.profilePicture ? (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)', background: `url(${voyagerData.profilePicture}) center/cover no-repeat` }} />
                        ) : (
                            <span style={{ flexShrink: 0 }}>{miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', 'white', 18)}</span>
                        )}
                        {voyagerData ? (
                            <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: 'white', fontSize: '14px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{voyagerData.name || 'LinkedIn Profile'}</span>
                                    {voyagerData.followerCount && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', flexShrink: 0 }}>{voyagerData.followerCount.toLocaleString()} followers</span>}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{voyagerData.headline || ''}</div>
                            </div>
                        ) : (
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{voyagerLoading ? 'Loading...' : 'Connect extension to sync profile'}</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={linkedInUseProfileData} onChange={e => toggleLinkedInProfileData(e.target.checked)}
                                style={{ width: '14px', height: '14px', accentColor: '#0077b5' }} />
                            <span style={{ color: 'white', fontSize: '11px' }}>Profile Data Active</span>
                        </label>
                        {voyagerData && <button onClick={generateTopicSuggestions} disabled={linkedInGeneratingTopics}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', padding: '5px 10px', color: 'white', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {linkedInGeneratingTopics ? '...' : <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>{miniIcon('M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', 'white', 11)} Topics</span>}
                        </button>}
                        {voyagerData && <button onClick={() => setShowLinkedInDataModal(true)}
                            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', padding: '5px 10px', color: 'white', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px' }}>{miniIcon('M18 20V10 M12 20V4 M6 20v-6', 'white', 10)} Data</button>}
                        <button onClick={() => loadVoyagerData()} disabled={voyagerLoading}
                            style={{ background: 'white', color: '#0077b5', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: voyagerLoading ? 'wait' : 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {voyagerLoading ? '...' : <>{miniIcon('M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15', '#0077b5', 12)} Sync</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Personal Brand Strategy */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {miniIcon('M13 10V3L4 14h7v7l9-11h-7z', '#fbbf24', 16)} Personal Brand Strategy
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {(!userGoal && !userTargetAudience) ? (
                            <button onClick={suggestGoals} disabled={goalsSuggesting || !voyagerData}
                                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '8px', padding: '6px 14px', color: 'white', fontSize: '11px', fontWeight: 'bold', cursor: (goalsSuggesting || !voyagerData) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: voyagerData ? 1 : 0.5 }}>
                                {goalsSuggesting ? 'Suggesting...' : '✨ Suggest Strategy'}
                            </button>
                        ) : (
                            <button onClick={saveUserGoals}
                                style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '6px', padding: '6px 12px', color: '#34d399', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Save Strategy
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Content Goal</label>
                        <input type="text" value={userGoal} onChange={e => setUserGoal(e.target.value)} placeholder="e.g. Build authority in B2B SaaS"
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '12px', width: '100%', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Target Audience</label>
                        <input type="text" value={writerTargetAudience} onChange={e => setWriterTargetAudience(e.target.value)} placeholder="e.g. Startup Founders"
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '12px', width: '100%', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Your Background</label>
                        <input type="text" value={writerBackground} onChange={e => setWriterBackground(e.target.value)} placeholder="e.g. CEO at TechCorp"
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '12px', width: '100%', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Writing Style (Inspiration)</label>
                        <select value={userWritingStyleSource} onChange={e => setUserWritingStyleSource(e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '12px', width: '100%', outline: 'none', cursor: 'pointer' }}>
                            <option value="user_default">My Own Top Posts</option>
                            {inspirationSources && inspirationSources.map((s: any, idx: number) => (
                                <option key={idx} value={`insp_${s.name}`}>{s.name}</option>
                            ))}
                            {sharedInspProfiles && sharedInspProfiles.map((s: any, idx: number) => (
                                <option key={`shared_${idx}`} value={`shared_${s.profileName}`}>{s.profileName} (Shared)</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* High Performance Post Generator Flow */}
            <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.08) 100%)', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(139,92,246,0.2)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {miniIcon('M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', '#a78bfa', 16)} High Performance Post Generator
                    </h3>
                </div>

                {/* Goal & Post Type Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                    {/* Goal Selection */}
                    <div>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '8px', display: 'block' }}>🎯 Post Goal</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {POST_GOALS.map(goal => (
                                <button key={goal.id} onClick={() => setPostGoal(goal.id)}
                                    style={{ padding: '8px 6px', background: postGoal === goal.id ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)', border: postGoal === goal.id ? '1px solid rgba(139,92,246,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: postGoal === goal.id ? '#a78bfa' : 'rgba(255,255,255,0.7)', fontSize: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', transition: 'all 0.2s' }}>
                                    <span style={{ fontSize: '14px' }}>{goal.icon}</span>
                                    <span style={{ fontWeight: '600' }}>{goal.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Post Type Selection */}
                    <div>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '8px', display: 'block' }}>📝 Post Type</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {POST_TYPES.map(type => (
                                <button key={type.id} onClick={() => setPostType(type.id)}
                                    style={{ padding: '6px 4px', background: postType === type.id ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)', border: postType === type.id ? '1px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: postType === type.id ? '#60a5fa' : 'rgba(255,255,255,0.7)', fontSize: '9px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', textAlign: 'center' }}>
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Depth Selection - single row */}
                <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '8px', display: 'block' }}>📏 Depth</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {DEPTH_OPTIONS.map(depth => (
                            <button key={depth.id} onClick={() => setPostDepth(depth.id)}
                                style={{ flex: 1, padding: '8px 6px', background: postDepth === depth.id ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)', border: postDepth === depth.id ? '1px solid rgba(16,185,129,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: postDepth === depth.id ? '#34d399' : 'rgba(255,255,255,0.7)', fontSize: '10px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>
                                {depth.label} <span style={{ opacity: 0.6, fontSize: '9px' }}>({depth.desc})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI-Powered Analysis Panel - moved to AI Post Helper column */}
            </div>

            {/* 3 Column Layout: AI Post Helper, Hook Generator + Config, LinkedIn Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.3fr', gap: '16px', marginBottom: '16px' }}>
                {/* Column 1: AI Post Helper with scrollbar */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', maxHeight: '650px' }}>
                    <h3 style={{ color: 'white', fontSize: '13px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {miniIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', '#60a5fa', 13)} AI Post Helper
                    </h3>

                    {/* Analyze Post Button */}
                    {writerContent.trim() && (
                        <button onClick={analyzePost} disabled={analyzing}
                            style={{ width: '100%', padding: '10px', background: analyzing ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.2))', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '8px', color: '#a78bfa', fontSize: '11px', fontWeight: '700', cursor: analyzing ? 'wait' : 'pointer', marginBottom: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}>
                            {miniIcon('M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', '#a78bfa', 12)}
                            {analyzing ? 'Analyzing with AI...' : 'Analyze Post'}
                        </button>
                    )}

                    {/* AI Analysis Results Panel */}
                    {showAnalysis && (
                        <div style={{ marginBottom: '10px', flexShrink: 0, maxHeight: '350px', overflowY: 'auto' }}>
                            {analyzing ? (
                                <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                    <div style={{ color: '#a78bfa', fontSize: '12px', marginBottom: '8px' }}>Analyzing your post against Q1 2026 LinkedIn algorithm...</div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Built to compare against current algorithm research</div>
                                </div>
                            ) : analysisData?.error ? (
                                <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '11px' }}>
                                    {analysisData.error}
                                    <button onClick={() => setShowAnalysis(false)} style={{ float: 'right', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>×</button>
                                </div>
                            ) : analysisData ? (
                                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.2)', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span style={{ color: 'white', fontSize: '11px', fontWeight: '700' }}>📊 AI Post Analysis</span>
                                        <button onClick={() => setShowAnalysis(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px' }}>×</button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', padding: '10px' }}>
                                        {[
                                            { label: 'Human Score', data: analysisData.humanScore, good: (s: number) => s >= 70 },
                                            { label: 'Performance', data: analysisData.performanceStrength, good: (s: number) => s >= 70 },
                                            { label: 'Reach Potential', data: analysisData.reachPotential, good: (s: number) => s >= 70 },
                                            { label: 'AI Pattern Risk', data: analysisData.aiPatternRisk, good: (s: number) => s <= 30 },
                                        ].map((metric, idx) => {
                                            const score = metric.data?.score ?? 0;
                                            const isGood = metric.good(score);
                                            const isMid = metric.label === 'AI Pattern Risk' ? (score > 30 && score <= 50) : (score >= 50 && score < 70);
                                            const color = isGood ? '#34d399' : isMid ? '#fbbf24' : '#f87171';
                                            return (
                                                <div key={idx} style={{ padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', fontWeight: '600' }}>{metric.label}</span>
                                                        <span style={{ color, fontSize: '16px', fontWeight: '700' }}>{score}</span>
                                                    </div>
                                                    {metric.data?.reasoning && (
                                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', lineHeight: '1.4' }}>{metric.data.reasoning.substring(0, 120)}{metric.data.reasoning.length > 120 ? '...' : ''}</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {analysisData.overallVerdict && (
                                        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(139,92,246,0.08)' }}>
                                            <div style={{ color: '#c4b5fd', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>Verdict</div>
                                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', lineHeight: '1.4' }}>{analysisData.overallVerdict}</div>
                                        </div>
                                    )}
                                    {analysisData.topImprovements && analysisData.topImprovements.length > 0 && (
                                        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', fontWeight: '600', marginBottom: '4px' }}>💡 Top Improvements</div>
                                            {analysisData.topImprovements.slice(0, 3).map((tip: string, i: number) => (
                                                <div key={i} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', padding: '3px 0', lineHeight: '1.3' }}>• {tip}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )}

                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
                        {chatMessages.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '12px' }}>Ask me anything about your post:</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                                    {['Help me find ideas', 'Make it casual', 'More formal', 'Shorter version'].map(q => (
                                        <button key={q} onClick={() => { setChatInput(q); setTimeout(() => sendChatMessage(), 100); }}
                                            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {chatMessages.map((msg, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: msg.role === 'user' ? 'linear-gradient(135deg, #693fe9, #8b5cf6)' : 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                                            {msg.role === 'user' ? 'U' : 'AI'}
                                        </div>
                                        <div style={{ flex: 1, background: msg.role === 'user' ? 'rgba(105,63,233,0.1)' : 'rgba(59,130,246,0.1)', padding: '10px 14px', borderRadius: '10px', color: 'rgba(255,255,255,0.85)', fontSize: '12px', lineHeight: '1.6' }}>
                                            {msg.role === 'user' ? (
                                                msg.content
                                            ) : (
                                                <div className="prose prose-invert prose-sm" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && sendChatMessage()}
                            placeholder="Ask for help or ideas..."
                            style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }} />
                        <button onClick={sendChatMessage} disabled={!chatInput.trim() || chatSending}
                            style={{ padding: '10px 16px', background: chatSending ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '8px', cursor: chatSending || !chatInput.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {chatSending ? '...' : <>{miniIcon('M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z', 'white', 12)}</>}
                        </button>
                    </div>
                </div>

                {/* Column 2: Hook Generator + Config (merged) */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', maxHeight: '650px' }}>
                    <h3 style={{ color: 'white', fontSize: '13px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {miniIcon('M13 10V3L4 14h7v7l9-11h-7z', '#fbbf24', 14)} Hook Generator & Config
                    </h3>

                    {/* Topic Input */}
                    <div style={{ marginBottom: '10px', flexShrink: 0 }}>
                        <textarea value={writerTopic} onChange={e => setWriterTopic(e.target.value)}
                            placeholder="What do you want to write about?"
                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none', resize: 'none', minHeight: '50px', fontFamily: 'system-ui, sans-serif' }} />
                    </div>

                    <button onClick={generateHooks} disabled={hooksGenerating || !writerTopic.trim()}
                        style={{ width: '100%', padding: '10px', background: hooksGenerating ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: hooksGenerating || !writerTopic.trim() ? 'not-allowed' : 'pointer', marginBottom: '10px', flexShrink: 0 }}>
                        {hooksGenerating ? 'Generating...' : '⚡ Generate Hooks'}
                    </button>

                    {hooks.length > 0 && (
                        <>
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                                {['all', 'question', 'bold', 'story'].map(cat => (
                                    <button key={cat} onClick={() => setHookCategory(cat === 'bold' ? 'bold_statement' : cat === 'story' ? 'anecdote' : cat)}
                                        style={{ padding: '4px 8px', background: (hookCategory === cat || (cat === 'bold' && hookCategory === 'bold_statement') || (cat === 'story' && hookCategory === 'anecdote')) ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', fontSize: '9px', cursor: 'pointer', textTransform: 'capitalize' }}>
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                                {filteredHooks.map((hook, i) => (
                                    <div key={i} onClick={() => setSelectedHook(hook.text)}
                                        style={{ padding: '8px', background: selectedHook === hook.text ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)', border: selectedHook === hook.text ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <div style={{ color: 'white', fontSize: '11px', lineHeight: '1.4' }}>{hook.text}</div>
                                        {selectedHook === hook.text && <span style={{ color: '#34d399', fontSize: '10px' }}>✓ Selected</span>}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {hooks.length === 0 && (
                        <div style={{ padding: '10px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '10px' }}>
                            Enter a topic and generate hooks
                        </div>
                    )}

                    {/* Config Section - simplified */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginBottom: '4px', display: 'block' }}>AI Model</label>
                                <select value={writerModel} onChange={e => handleWriterModelChange(e.target.value)}
                                    style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', fontSize: '10px', cursor: 'pointer', outline: 'none' }}>
                                    {MODEL_OPTIONS.map((m: any) => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', paddingBottom: '4px' }}>
                                <input type="checkbox" checked={writerHashtags} onChange={e => setWriterHashtags(e.target.checked)} 
                                    style={{ width: '12px', height: '12px', accentColor: '#a78bfa', cursor: 'pointer' }} />
                                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '10px' }}>Hashtags</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', paddingBottom: '4px' }}>
                                <input type="checkbox" checked={writerEmojis} onChange={e => setWriterEmojis(e.target.checked)} 
                                    style={{ width: '12px', height: '12px', accentColor: '#a78bfa', cursor: 'pointer' }} />
                                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '10px' }}>Emojis</span>
                            </label>
                        </div>

                        <button onClick={generatePostWithHook} 
                            disabled={writerGenerating || !writerTopic.trim()}
                            style={{ width: '100%', padding: '12px', background: writerGenerating ? 'rgba(105,63,233,0.5)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: (writerGenerating || !writerTopic.trim()) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(105,63,233,0.4)', transition: 'all 0.2s' }}
                            onMouseOver={e => { if (!writerGenerating && writerTopic.trim()) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                            {writerGenerating ? 'Generating Post...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>{miniIcon('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', 'white', 14)} {selectedHook ? 'Generate Full Post with Hook' : 'Generate Post'}</span>}
                        </button>

                        {writerStatus && (
                            <div style={{ marginTop: '8px', padding: '8px 12px', background: writerStatus.includes('Error') || writerStatus.includes('failed') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${writerStatus.includes('Error') || writerStatus.includes('failed') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '8px', color: writerStatus.includes('Error') || writerStatus.includes('failed') ? '#f87171' : '#34d399', fontSize: '11px' }}>
                                {writerStatus}
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 3: LinkedIn Preview */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', maxHeight: '650px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
                        <span style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>LinkedIn Preview</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {(['desktop', 'mobile'] as const).map(mode => (
                                <button key={mode} onClick={() => setWriterPreviewMode(writerPreviewMode === mode ? 'desktop' : mode)}
                                    style={{ padding: '3px 8px', background: writerPreviewMode === mode ? 'rgba(0,119,181,0.3)' : 'rgba(255,255,255,0.06)', border: writerPreviewMode === mode ? '1px solid rgba(0,119,181,0.5)' : '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: writerPreviewMode === mode ? '#60a5fa' : 'rgba(255,255,255,0.5)', fontSize: '10px', cursor: 'pointer', fontWeight: '600' }}>
                                    {mode === 'desktop' ? '🖥 Desktop' : '📱 Mobile'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {
                        writerContent.trim() ? (() => {
                            const isMobile = writerPreviewMode === 'mobile';
                            const maxW = isMobile ? '375px' : '100%';
                            const TRUNCATE_LINES = isMobile ? 3 : 5;
                            const lines = writerContent.split('\n');
                            const truncated = lines.length > TRUNCATE_LINES && !writerPreviewExpanded;
                            const displayText = truncated ? lines.slice(0, TRUNCATE_LINES).join('\n') : writerContent;
                            const profileName = voyagerData?.name || linkedInProfile?.name || user?.name || 'Your Name';
                            const profileHeadline = voyagerData?.headline || linkedInProfile?.headline || 'Your Headline';
                            return (
                                <div style={{ maxWidth: maxW, margin: '0 auto', background: '#1b1f23', borderRadius: '10px', border: '1px solid #38434f', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                    <div style={{ padding: isMobile ? '10px 12px' : '12px 16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                        <div style={{ width: isMobile ? '36px' : '48px', height: isMobile ? '36px' : '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: isMobile ? '14px' : '18px', flexShrink: 0 }}>{(profileName?.[0] || 'U').toUpperCase()}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ color: 'white', fontWeight: '600', fontSize: isMobile ? '13px' : '14px', lineHeight: '1.3' }}>{profileName}</div>
                                            <div style={{ color: '#ffffffb3', fontSize: isMobile ? '11px' : '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profileHeadline}</div>
                                            <div style={{ color: '#ffffff80', fontSize: '11px', marginTop: '2px' }}>Just now · {miniIcon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', '#ffffff80', 10)}</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: isMobile ? '0 12px 10px' : '0 16px 12px' }}>
                                        <div contentEditable suppressContentEditableWarning onBlur={e => setWriterContent(e.currentTarget.textContent || '')}
                                            style={{ color: '#ffffffe6', fontSize: isMobile ? '13px' : '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', outline: 'none', cursor: 'text' }}>
                                            {displayText}
                                        </div>
                                        {truncated && <span onClick={() => setWriterPreviewExpanded(true)} style={{ color: '#ffffff80', cursor: 'pointer' }}>... <span style={{ color: '#70b5f9' }}>see more</span></span>}
                                        {writerPreviewExpanded && lines.length > TRUNCATE_LINES && (
                                            <span onClick={() => setWriterPreviewExpanded(false)} style={{ color: '#70b5f9', cursor: 'pointer', fontSize: '13px' }}>show less</span>
                                        )}
                                    </div>
                                    {writerImageUrl && (
                                        <div style={{ borderTop: '1px solid #38434f' }}>
                                            {writerMediaType === 'video' ? (
                                                <video src={writerImageUrl} controls style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', background: '#000' }} />
                                            ) : (
                                                <img src={writerImageUrl} alt="Post media" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                                            )}
                                        </div>
                                    )}
                                    <div style={{ padding: isMobile ? '8px 12px' : '8px 16px', borderTop: '1px solid #38434f' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff80', fontSize: isMobile ? '11px' : '12px' }}>
                                            <span>👍 ❤️ 💡</span>
                                            <span>0 comments · 0 reposts</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '4px 0', borderTop: '1px solid #38434f' }}>
                                        {['👍 Like', '💬 Comment', '🔄 Repost', '✈️ Send'].map(action => (
                                            <div key={action} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 8px', color: '#ffffff80', fontSize: isMobile ? '11px' : '12px', fontWeight: '600' }}>{action}</div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })() : (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                                Generate a post to see live preview
                            </div>
                        )
                    }

                    {/* Publishing Actions */}
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/gif,image/webp,video/webm,video/mp4" style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const isVideo = file.type.startsWith('video/');
                                    setWriterImageFile(file);
                                    setWriterMediaType(isVideo ? 'video' : 'image');
                                    const reader = new FileReader();
                                    reader.onload = (ev) => setWriterImageUrl(ev.target?.result as string);
                                    reader.readAsDataURL(file);
                                    setWriterUploading(true);
                                    try {
                                        const token = localStorage.getItem('authToken');
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        const res = await fetch('/api/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
                                        const data = await res.json();
                                        if (data.success) {
                                            setWriterMediaBlobUrl(data.url);
                                            showToast(`${isVideo ? 'Video' : 'Image'} uploaded!`, 'success');
                                        }
                                    } catch (err: any) { showToast('Upload failed', 'error'); }
                                    finally { setWriterUploading(false); }
                                }} />
                            <button onClick={() => fileInputRef.current?.click()} disabled={writerUploading}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', cursor: writerUploading ? 'wait' : 'pointer' }}>
                                {miniIcon('M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'rgba(255,255,255,0.7)', 12)}
                                {writerUploading ? 'Uploading...' : writerImageFile ? 'Change Media' : 'Attach Media'}
                            </button>
                            {writerImageUrl && (
                                <button onClick={() => { setWriterImageFile(null); setWriterImageUrl(''); setWriterMediaBlobUrl(''); setWriterMediaType(''); }}
                                    style={{ background: 'rgba(239,68,68,0.2)', border: 'none', padding: '10px', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                            )}
                        </div>

                        {/* Post via Extension API (Voyager) - default for non-OAuth users */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={async () => {
                                if (!writerContent.trim()) return;
                                const token = localStorage.getItem('authToken');
                                if (!token) return;
                                setWriterStatus('Posting via extension API...');
                                try {
                                    const res = await fetch('/api/extension/command', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({
                                            command: 'linkedin_post_via_api',
                                            data: { content: writerContent, mediaUrl: writerMediaBlobUrl || null }
                                        })
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                        showToast('Post sent to extension! Publishing via LinkedIn API...', 'success');
                                        setWriterStatus('Task queued - extension will post via LinkedIn API');
                                    } else {
                                        showToast(data.error || 'Failed to queue post', 'error');
                                        setWriterStatus('Failed: ' + (data.error || 'Unknown error'));
                                    }
                                } catch (e: any) { showToast('Error: ' + e.message, 'error'); setWriterStatus('Error: ' + e.message); }
                            }} disabled={writerPosting || !writerContent.trim()}
                                style={{ flex: 1, padding: '12px', background: writerPosting ? 'rgba(0,119,181,0.3)' : 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: writerPosting || !writerContent.trim() ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(0,119,181,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                {miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', 'white', 12)} Post via API
                            </button>
                            <button onClick={sendToExtension} disabled={writerPosting || !writerContent.trim()}
                                style={{ flex: 1, padding: '12px', background: writerPosting ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: writerPosting || !writerContent.trim() ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(105,63,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                {miniIcon('M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z', 'white', 12)} Post via UI
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={saveDraft}
                                style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                                {miniIcon('M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z', 'white', 11)} Save Draft
                            </button>
                            <div style={{ display: 'flex', flex: 2, gap: '4px' }}>
                                <input type="date" value={writerScheduleDate} onChange={e => setWriterScheduleDate(e.target.value)}
                                    style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'white', fontSize: '10px', width: '100%', minWidth: 0 }} />
                                <input type="time" value={writerScheduleTime} onChange={e => setWriterScheduleTime(e.target.value)}
                                    style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'white', fontSize: '10px', width: '100%', minWidth: 0 }} />
                                <button onClick={schedulePost}
                                    style={{ padding: '8px', background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', borderRadius: '8px', color: '#c4b5fd', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    {miniIcon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', '#c4b5fd', 10)} Schedule
                                </button>
                                <button onClick={async () => {
                                    if (!writerContent.trim() || !writerScheduleDate || !writerScheduleTime) { showToast('Set date/time first', 'error'); return; }
                                    const token = localStorage.getItem('authToken');
                                    if (!token) return;
                                    const scheduledTime = new Date(`${writerScheduleDate}T${writerScheduleTime}`).toISOString();
                                    setWriterStatus('Scheduling via LinkedIn API...');
                                    try {
                                        const res = await fetch('/api/extension/command', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                            body: JSON.stringify({ command: 'linkedin_schedule_via_api', data: { content: writerContent, scheduledTime } })
                                        });
                                        const data = await res.json();
                                        if (data.success) { showToast('Schedule task sent to extension!', 'success'); setWriterStatus('Scheduling via LinkedIn native scheduler...'); }
                                        else { showToast(data.error || 'Failed', 'error'); setWriterStatus('Failed: ' + (data.error || '')); }
                                    } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
                                }}
                                    title="Schedule directly on LinkedIn via API"
                                    style={{ padding: '8px', background: 'rgba(0,119,181,0.2)', border: '1px solid rgba(0,119,181,0.4)', borderRadius: '8px', color: '#60a5fa', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    {miniIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', '#60a5fa', 9)} LI
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Planner */}
                <div style={{ background: 'linear-gradient(135deg, rgba(105,63,233,0.15) 0%, rgba(139,92,246,0.1) 100%)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(105,63,233,0.3)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {miniIcon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', '#a78bfa', 16)}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>AI Content Planner</span>
                                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>Generate & schedule full calendar</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => props.openPlanner?.('7days')}
                                style={{ flex: 1, padding: '8px 12px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(105,63,233,0.4)', transition: 'transform 0.1s' }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'none'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                7 Days
                            </button>
                            <button onClick={() => props.openPlanner?.('30days')}
                                style={{ flex: 1, padding: '8px 12px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(16,185,129,0.4)', transition: 'transform 0.1s' }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'none'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                30 Days
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Calendar Display */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {miniIcon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', '#60a5fa', 14)} Content Calendar
                        </h3>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button onClick={() => {
                                const newMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
                                const newYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
                                setCalendarMonth(newMonth);
                                setCalendarYear(newYear);
                            }}
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 8px', color: 'white', fontSize: '12px', cursor: 'pointer' }}>
                                ‹
                            </button>
                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: '600', minWidth: '120px', textAlign: 'center' }}>
                                {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => {
                                const newMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
                                const newYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
                                setCalendarMonth(newMonth);
                                setCalendarYear(newYear);
                            }}
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 8px', color: 'white', fontSize: '12px', cursor: 'pointer' }}>
                                ›
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} style={{ textAlign: 'center', padding: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '600' }}>
                                {day}
                            </div>
                        ))}
                        {(() => {
                            const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
                            const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                            const today = new Date();
                            const cells = [];
                            
                            // Empty cells before first day
                            for (let i = 0; i < firstDay; i++) {
                                cells.push(<div key={`empty-${i}`} style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }} />);
                            }
                            
                            // Calendar days
                            for (let day = 1; day <= daysInMonth; day++) {
                                const date = new Date(calendarYear, calendarMonth, day);
                                const isToday = date.toDateString() === today.toDateString();
                                const dateStr = date.toISOString().split('T')[0];
                                const scheduledCount = writerScheduledPosts?.filter((p: any) => p.scheduledAt?.startsWith(dateStr)).length || 0;
                                
                                cells.push(
                                    <div key={day}
                                        style={{
                                            padding: '8px',
                                            background: isToday ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                                            border: isToday ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '6px',
                                            textAlign: 'center',
                                            cursor: scheduledCount > 0 ? 'pointer' : 'default',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => { if (scheduledCount > 0) e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
                                        onMouseOut={e => { if (!isToday && scheduledCount > 0) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                                        <div style={{ color: isToday ? '#60a5fa' : 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: isToday ? '700' : '500', marginBottom: '2px' }}>
                                            {day}
                                        </div>
                                        {scheduledCount > 0 && (
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', margin: '0 auto' }} />
                                        )}
                                    </div>
                                );
                            }
                            
                            return cells;
                        })()}
                    </div>

                    {/* Scheduled Posts Summary */}
                    {writerScheduledPosts && writerScheduledPosts.length > 0 && (
                        <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px' }}>
                            <div style={{ color: '#34d399', fontSize: '11px', fontWeight: '600', marginBottom: '6px' }}>
                                {writerScheduledPosts.length} Post{writerScheduledPosts.length !== 1 ? 's' : ''} Scheduled
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                                {writerScheduledPosts.slice(0, 5).map((post: any, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                            {post.content?.substring(0, 40)}...
                                        </span>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', marginLeft: '8px', flexShrink: 0 }}>
                                            {new Date(post.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
