import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Template options (from old WriterTab)
const TEMPLATE_OPTIONS = [
    { value: 'lead_magnet', label: 'Lead Magnet' },
    { value: 'thought_leadership', label: 'Thought Leadership' },
    { value: 'personal_story', label: 'Personal Story' },
    { value: 'advice', label: 'Advice/Tips' },
    { value: 'case_study', label: 'Case Study' },
    { value: 'controversial', label: 'Controversial Opinion' },
    { value: 'question', label: 'Question/Poll' },
    { value: 'insight', label: 'Industry Insight' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'achievement', label: 'Achievement' },
    { value: 'tip', label: 'Pro Tip' },
    { value: 'story', label: 'Story' },
    { value: 'motivation', label: 'Motivation' },
    { value: 'how_to', label: 'How-To Guide' },
];

// Tone options (from old WriterTab)
const TONE_OPTIONS = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'bold', label: 'Bold/Provocative' },
    { value: 'educational', label: 'Educational' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'authoritative', label: 'Authoritative' },
    { value: 'humorous', label: 'Humorous' },
];

// Depth options
const DEPTH_OPTIONS = [
    { id: 'short', label: 'Short', value: '500', desc: '~100 words' },
    { id: 'standard', label: 'Standard', value: '900', desc: '~250 words' },
    { id: 'deep', label: 'Deep', value: '1500', desc: '~500 words' },
    { id: 'extra', label: 'Extra Long', value: '2500', desc: '~800 words' },
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
        showInspirationPopup, setShowInspirationPopup, plannerOpen, setPlannerOpen, plannerShowResults, setPlannerShowResults, openPlanner,
        plannerMode, setPlannerMode, plannerStep, setPlannerStep,
        plannerContext, setPlannerContext, plannerTopics, setPlannerTopics,
        plannerSelected, setPlannerSelected, plannerGeneratingTopics,
        plannerPublishTime, setPlannerPublishTime, plannerStartDate, setPlannerStartDate,
        plannerTemplate, setPlannerTemplate, plannerTone, setPlannerTone,
        plannerLength, setPlannerLength, plannerGenerating, plannerDoneCount, plannerTotal, plannerGeneratedPosts,
        plannerStatusMsg, plannerAbortRef, generatePlannerTopics, startPlannerGeneration,
        // History from props
        historyItems, historyLoading, loadHistory,
    } = props;

    // Load scheduled post for preview
    const loadScheduledPost = (post: any) => {
        setWriterContent(post.content || '');
        setWriterTopic(post.topic || '');
        showToast('Post loaded for preview', 'info');
    };

    // State for LinkedIn scheduled post removal notification
    const [linkedInRemovalNotification, setLinkedInRemovalNotification] = useState<{
        show: boolean;
        postId: string | null;
        countdown: number;
        linkedInOpened: boolean;
    }>({ show: false, postId: null, countdown: 30, linkedInOpened: false });

    // Handle removing a LinkedIn API scheduled post
    const handleRemoveLinkedInScheduledPost = async (post: any) => {
        if (!post.id) return;

        // Delete the scheduled post from database
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                await fetch('/api/post-drafts', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ id: post.id }),
                });
                // Reload scheduled posts
                loadScheduledPosts?.();
            }
        } catch (e) {
            console.error('Failed to delete scheduled post:', e);
        }

        // Show notification for 30 seconds
        setLinkedInRemovalNotification({ show: true, postId: post.id, countdown: 30, linkedInOpened: false });
    };

    // Countdown effect for notification
    useEffect(() => {
        if (linkedInRemovalNotification.show && linkedInRemovalNotification.countdown > 0) {
            const timer = setTimeout(() => {
                setLinkedInRemovalNotification(prev => {
                    // At 15 seconds, open LinkedIn
                    if (prev.countdown === 15 && !prev.linkedInOpened) {
                        window.open('https://www.linkedin.com/share/management', '_blank');
                        return { ...prev, countdown: prev.countdown - 1, linkedInOpened: true };
                    }
                    return { ...prev, countdown: prev.countdown - 1 };
                });
            }, 1000);
            return () => clearTimeout(timer);
        } else if (linkedInRemovalNotification.show && linkedInRemovalNotification.countdown === 0) {
            // Close notification when countdown reaches 0
            setLinkedInRemovalNotification({ show: false, postId: null, countdown: 0, linkedInOpened: false });
        }
    }, [linkedInRemovalNotification.show, linkedInRemovalNotification.countdown]);

    // Post generation state
    const [postDepth, setPostDepth] = useState<string>('standard');
    const [localWriterGenerating, setLocalWriterGenerating] = useState<boolean>(false);
    const [localWriterStatus, setLocalWriterStatus] = useState<string>('');
    
    // Use passed prop or local state for generating
    const isWriterGenerating = props.writerGenerating ?? localWriterGenerating;
    const setWriterGeneratingState = props.setWriterGenerating ?? setLocalWriterGenerating;
    
    // Use writerStatus from props, with fallback to local state
    const currentWriterStatus = writerStatus || localWriterStatus;
    const currentSetWriterStatus: React.Dispatch<React.SetStateAction<string>> = setWriterStatus || setLocalWriterStatus;

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
    const [editingHookIndex, setEditingHookIndex] = useState<number | null>(null);
    const [editingHookText, setEditingHookText] = useState('');
    const [customHook, setCustomHook] = useState('');
    const [showCustomHook, setShowCustomHook] = useState(false);

    // AI Chatbot state
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // LinkedIn Preview Edit state
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editedPostContent, setEditedPostContent] = useState('');
    const [originalPostContent, setOriginalPostContent] = useState('');

    // History popup state
    const [showHistoryPopup, setShowHistoryPopup] = useState(false);
    const lastSavedContentRef = useRef<string>('');
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Save to history function
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

    // Open history popup - load AI generated posts specifically
    const openHistoryPopup = () => {
        console.log('Opening history popup, calling loadHistory...');
        if (props.loadHistory) {
            props.loadHistory(1, 'ai_generated');
        }
        setShowHistoryPopup(true);
    };

    // Debug: log when history items change
    useEffect(() => {
        console.log('History items updated:', historyItems);
    }, [historyItems]);
    const [inlineEditMode, setInlineEditMode] = useState(false);
    const [showEditHint, setShowEditHint] = useState(true);

    // Start editing - capture current content
    const startEditingPost = () => {
        setEditedPostContent(writerContent);
        setOriginalPostContent(writerContent);
        setIsEditingPost(true);
    };

    // Cancel editing
    const cancelEditingPost = () => {
        setIsEditingPost(false);
        setEditedPostContent('');
    };

    // Save edited content
    const saveEditedPost = async () => {
        // Save to history before updating content
        await saveToHistory('edited_post', `Edited Post: ${writerTopic || 'Custom Post'}`, editedPostContent, { originalContent: originalPostContent });
        setWriterContent(editedPostContent);
        // Save to localStorage for persistence
        localStorage.setItem('savedWriterContent', editedPostContent);
        lastSavedContentRef.current = editedPostContent;
        setIsEditingPost(false);
        setOriginalPostContent(editedPostContent);
        showToast('Post updated and saved', 'success');
    };

    // Handle inline edit (contenteditable blur)
    const handleInlineEdit = async (e: React.FocusEvent<HTMLDivElement>) => {
        const newContent = e.currentTarget.textContent || '';
        if (newContent !== writerContent) {
            const oldLength = writerContent.length;
            // Save to history before updating content
            await saveToHistory('edited_post', `Edited Post: ${writerTopic || 'Custom Post'}`, newContent, { originalContent: writerContent });
            // Save to localStorage for persistence
            localStorage.setItem('savedWriterContent', newContent);
            lastSavedContentRef.current = newContent;
            setWriterContent(newContent);
            setOriginalPostContent(newContent);
            const changeDesc = newContent.length > oldLength ? 'expanded' : newContent.length < oldLength ? 'shortened' : 'modified';
            showToast(`Post ${changeDesc}: ${newContent.length} characters - saved`, 'success');
        }
        setInlineEditMode(false);
    };

    // Toggle inline edit mode
    const toggleInlineEdit = () => {
        if (inlineEditMode) {
            // Save current content from writerContent
            setInlineEditMode(false);
        } else {
            setEditedPostContent(writerContent);
            setOriginalPostContent(writerContent);
            setInlineEditMode(true);
            setShowEditHint(false);
        }
    };

    // Auto-save inline edit on Escape key
    const handleInlineKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            setInlineEditMode(false);
            setEditedPostContent(writerContent);
        } else if (e.key === 'Enter' && e.ctrlKey) {
            // Ctrl+Enter to save
            const newContent = (e.target as HTMLDivElement).textContent || '';
            if (newContent !== writerContent) {
                setWriterContent(newContent);
                setOriginalPostContent(newContent);
                showToast('Post updated successfully', 'success');
            }
            setInlineEditMode(false);
        }
    };

    // Debounced auto-save to history when user edits content
    useEffect(() => {
        // Clear previous timeout
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        // Skip if:
        // - no content
        // - content hasn't changed from last save
        // - edit modal is open (isEditingPost)
        // - inline edit mode is active
        if (!writerContent.trim() || writerContent === lastSavedContentRef.current || isEditingPost || inlineEditMode) {
            return;
        }

        // Set up debounced auto-save - saves after 3 seconds of no changes
        autoSaveTimeoutRef.current = setTimeout(async () => {
            if (writerContent !== lastSavedContentRef.current && writerContent.trim()) {
                lastSavedContentRef.current = writerContent;
                // Save to localStorage for persistence
                localStorage.setItem('savedWriterContent', writerContent);
                // Save to history
                await saveToHistory('auto_saved', `Auto-saved: ${writerTopic || 'Custom Post'}`, writerContent, { autoSaved: true });
                console.log('Auto-saved post to history');
            }
        }, 3000);

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [writerContent, writerTopic, isEditingPost, inlineEditMode]);

    // Update last saved content when AI generates a post
    useEffect(() => {
        if (writerContent && writerContent !== lastSavedContentRef.current) {
            lastSavedContentRef.current = writerContent;
        }
    }, [writerContent]);

    // Expose functions for chatbot integration via window (or props callback)
    useEffect(() => {
        // Make these functions available globally for chatbot integration
        (window as any).getLinkedInPostContent = () => writerContent;
        (window as any).updateLinkedInPostContent = (newContent: string) => {
            setWriterContent(newContent);
            return { success: true, content: newContent };
        };
        (window as any).getEditedPostContent = () => editedPostContent;
        (window as any).applyPostEdit = (newContent: string) => {
            setEditedPostContent(newContent);
            setWriterContent(newContent);
            return { success: true, originalContent: originalPostContent, newContent };
        };
        // Inline edit functions
        (window as any).getInlineEditMode = () => inlineEditMode;
        (window as any).setInlineEditMode = (enabled: boolean) => setInlineEditMode(enabled);
        (window as any).getInlineEditContent = () => writerContent;

        return () => {
            delete (window as any).getLinkedInPostContent;
            delete (window as any).updateLinkedInPostContent;
            delete (window as any).getEditedPostContent;
            delete (window as any).applyPostEdit;
            delete (window as any).getInlineEditMode;
            delete (window as any).setInlineEditMode;
            delete (window as any).getInlineEditContent;
        };
    }, [writerContent, editedPostContent, originalPostContent, inlineEditMode]);

    // Auto-fill from profile data
    const [writerTargetAudience, setWriterTargetAudience] = useState(userTargetAudience || '');
    const [writerKeyMessage, setWriterKeyMessage] = useState(userTargetAudience || '');
    const [writerBackground, setWriterBackground] = useState(
        voyagerData?.headline || linkedInProfile?.headline || ''
    );

    // Sync target audience when props change (e.g., after suggestGoals saves)
    useEffect(() => {
        if (userTargetAudience && userTargetAudience !== writerTargetAudience) {
            setWriterTargetAudience(userTargetAudience);
        }
    }, [userTargetAudience]);

    // Auto-save strategy fields with debounce
    const strategyFieldsRef = useRef({
        userGoal: '',
        userTargetAudience: '',
        writerBackground: '',
        userWritingStyle: ''
    });
    const strategySaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Update refs when fields change
    useEffect(() => {
        strategyFieldsRef.current = {
            userGoal,
            userTargetAudience,
            writerBackground,
            userWritingStyle
        };
    }, [userGoal, userTargetAudience, writerBackground, userWritingStyle]);

    // Auto-save strategy when fields change
    useEffect(() => {
        // Clear previous timeout
        if (strategySaveTimeoutRef.current) {
            clearTimeout(strategySaveTimeoutRef.current);
        }

        // Skip if all fields are empty
        if (!userGoal && !userTargetAudience && !writerBackground && !userWritingStyle) {
            return;
        }

        // Skip if currently suggesting goals (will save after)
        if (goalsSuggesting) {
            return;
        }

        // Set up debounced auto-save - saves after 2 seconds of no changes
        strategySaveTimeoutRef.current = setTimeout(async () => {
            const current = strategyFieldsRef.current;
            // Only save if there are actual values
            if (current.userGoal || current.userTargetAudience || current.writerBackground || current.userWritingStyle) {
                try {
                    // Save to localStorage for persistence
                    localStorage.setItem('savedWriterTargetAudience', current.userTargetAudience);
                    localStorage.setItem('savedWriterKeyMessage', current.userWritingStyle);

                    // Save to database via API
                    const token = localStorage.getItem('authToken');
                    if (token) {
                        await fetch('/api/user-goals', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                                goal: current.userGoal,
                                targetAudience: current.userTargetAudience,
                                writingStyle: current.userWritingStyle,
                                writingStyleSource: userWritingStyleSource
                            }),
                        });
                        showToast?.('Strategy auto-saved', 'success');
                    }
                } catch (e) {
                    console.error('Auto-save strategy failed:', e);
                }
            }
        }, 2000);

        return () => {
            if (strategySaveTimeoutRef.current) {
                clearTimeout(strategySaveTimeoutRef.current);
            }
        };
    }, [userGoal, userTargetAudience, writerBackground, userWritingStyle, userWritingStyleSource, goalsSuggesting]);

    // Sync depth to length
    useEffect(() => {
        const depthOpt = DEPTH_OPTIONS.find(d => d.id === postDepth);
        if (depthOpt) setWriterLength(depthOpt.value);
    }, [postDepth]);

    // AI-powered post analysis (replaces heuristic)
    const analyzePost = async () => {
        if (!writerContent.trim()) {
            showToast('Please generate or write a post first', 'error');
            return;
        }
        if (isFreePlan) { 
            setShowUpgradeModal(true); 
            return; 
        }
        
        setAnalyzing(true);
        setShowAnalysis(true);
        setAnalysisData(null);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setAnalysisData({ error: 'Not authenticated. Please refresh and log in again.' });
                setAnalyzing(false);
                return;
            }

            const res = await fetch('/api/ai/analyze-post-deep', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    postContent: writerContent,
                    authorHeadline: voyagerData?.headline || linkedInProfile?.headline || '',
                    model: writerModel
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Analyze API error:', res.status, errorText);
                setAnalysisData({ 
                    error: `API Error (${res.status}): ${errorText.substring(0, 100)}` 
                });
                showToast(`Analysis failed: ${res.status}`, 'error');
                setAnalyzing(false);
                return;
            }

            const data = await res.json();
            if (data.success && data.analysis) {
                setAnalysisData(data.analysis);
                showToast('Analysis complete!', 'success');
            } else {
                const errorMsg = data.error || 'Analysis failed - no data returned';
                setAnalysisData({ error: errorMsg });
                showToast(errorMsg, 'error');
                console.error('Analysis failed:', data);
            }
        } catch (e: any) {
            const errorMsg = 'Network error: ' + (e.message || 'Could not connect to server');
            setAnalysisData({ error: errorMsg });
            showToast(errorMsg, 'error');
            console.error('Analyze post exception:', e);
        } finally {
            setAnalyzing(false);
        }
    };

    // Generate hooks
    const generateHooks = async () => {
        if (isFreePlan) { 
            setShowUpgradeModal(true); 
            return; 
        }
        if (!writerTopic.trim()) { 
            setHooksStatus('Please enter a topic first'); 
            showToast('Please enter a topic first', 'error');
            return; 
        }

        setHooksGenerating(true);
        setHooksStatus('Generating 10 hook variations...');
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setHooksStatus('Not authenticated. Please refresh and log in again.');
                showToast('Authentication error', 'error');
                setHooksGenerating(false);
                return;
            }

            const res = await fetch('/api/ai/generate-hooks', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    topic: writerTopic,
                    voiceProfile: `${writerTone}, ${userGoal || 'engaging'}`,
                    goal: userGoal || 'Maximize engagement',
                    model: writerModel
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Generate hooks API error:', res.status, errorText);
                const errorMsg = `API Error (${res.status}): ${errorText.substring(0, 100)}`;
                setHooksStatus(errorMsg);
                showToast(`Hook generation failed: ${res.status}`, 'error');
                setHooksGenerating(false);
                return;
            }

            const data = await res.json();
            if (data.success && data.hooks) {
                setHooks(data.hooks);
                setHooksStatus(`Generated ${data.hooks.length} hooks! Click one to select.`);
                showToast(`${data.hooks.length} hooks generated!`, 'success');
            } else {
                const errorMsg = data.error || 'Failed to generate hooks - no data returned';
                setHooksStatus(errorMsg);
                showToast(errorMsg, 'error');
                console.error('Hook generation failed:', data);
            }
        } catch (e: any) {
            const errorMsg = 'Network error: ' + (e.message || 'Could not connect to server');
            setHooksStatus(errorMsg);
            showToast(errorMsg, 'error');
            console.error('Generate hooks exception:', e);
        } finally {
            setHooksGenerating(false);
        }
    };

    // Generate full post (with or without selected hook)
    const generatePostWithHook = async () => {
        if (isFreePlan) { 
            setShowUpgradeModal(true); 
            return; 
        }
        if (!writerTopic.trim()) { 
            currentSetWriterStatus('Please enter a topic first'); 
            showToast('Please enter a topic first', 'error');
            return; 
        }

        setWriterGeneratingState(true);
        currentSetWriterStatus(selectedHook ? 'Generating post with selected hook...' : 'Generating post...');
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                currentSetWriterStatus('Not authenticated. Please refresh and log in again.');
                showToast('Authentication error', 'error');
                setWriterGeneratingState(false);
                return;
            }

            const res = await fetch('/api/ai/generate-post-with-hook', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
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
                    useInspirationSources: userWritingStyleSource && userWritingStyleSource !== 'user_default',
                    inspirationSourceNames: userWritingStyleSource && userWritingStyleSource.startsWith('insp_')
                        ? [userWritingStyleSource.replace('insp_', '')]
                        : userWritingStyleSource && userWritingStyleSource.startsWith('shared_')
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
                    postDepth,
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Generate post API error:', res.status, errorText);
                const errorMsg = `API Error (${res.status}): ${errorText.substring(0, 100)}`;
                currentSetWriterStatus(errorMsg);
                showToast(`Post generation failed: ${res.status}`, 'error');
                setWriterGeneratingState(false);
                return;
            }

            const data = await res.json();
            if (data.success && data.content) {
                setWriterContent(data.content);
                // Save to localStorage for persistence
                localStorage.setItem('savedWriterContent', data.content);
                localStorage.setItem('savedWriterTopic', writerTopic);
                // Update last saved ref to prevent auto-save from trying to save immediately
                lastSavedContentRef.current = data.content;
                currentSetWriterStatus('Post generated! Review and edit as needed.');
                setWriterPreviewMode('desktop');
                setWriterPreviewExpanded(false);
                showToast('Post generated successfully!', 'success');

                // Auto-save to history
                const token = localStorage.getItem('authToken');
                if (token) {
                    try {
                        await fetch('/api/history/ai-generated', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                                title: `AI Generated Post: ${writerTopic}`,
                                content: JSON.stringify(data.content),
                                metadata: JSON.stringify({ template: writerTemplate, tone: writerTone, length: writerLength, model: data.model })
                            }),
                        });
                        console.log('Post saved to AI generated history');
                    } catch (e) {
                        console.error('Failed to save to history:', e);
                    }
                }
            } else {
                const errorMsg = data.error || 'Generation failed - no content returned';
                currentSetWriterStatus(errorMsg);
                showToast(errorMsg, 'error');
                console.error('Post generation failed:', data);
            }
        } catch (e: any) {
            const errorMsg = 'Network error: ' + (e.message || 'Could not connect to server');
            currentSetWriterStatus(errorMsg);
            showToast(errorMsg, 'error');
            console.error('Generate post exception:', e);
        } finally {
            setWriterGeneratingState(false);
        }
    };

    // AI Chatbot send message
    const sendChatMessage = async (message?: string) => {
        const inputToUse = message || chatInput;
        if (!inputToUse.trim() || chatSending) return;

        const userMsg = { role: 'user', content: inputToUse };
        setChatMessages([...chatMessages, userMsg]);
        setChatInput('');
        setChatSending(true);

        // Scroll to bottom immediately when sending
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }, 10);

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
                // Check if the chatbot modified the post
                if (data.modifiedPost) {
                    // Add message with modifiedPost attached for Copy/Apply buttons - show actual post content
                    setChatMessages(prev => [...prev, {
                        role: 'assistant',
                        content: data.response,
                        modifiedPost: data.modifiedPost,
                        originalContent: writerContent,
                        changeDescription: data.changeDescription
                    }]);
                    showToast('Review changes in chat and click Apply to update post', 'info');
                } else {
                    setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
                }
                // Scroll to bottom within chat container
                setTimeout(() => {
                    if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                    }
                }, 50);
            }
        } catch (e) {
            console.error('Chat error:', e);
        } finally {
            setChatSending(false);
        }
    };

    // Apply modified post from chat to LinkedIn Preview
    const applyChatPost = (modifiedPost: string) => {
        setWriterContent(modifiedPost);
        showToast('Post applied to LinkedIn Preview', 'success');
    };

    // Copy modified post to clipboard
    const copyChatPost = (modifiedPost: string) => {
        navigator.clipboard.writeText(modifiedPost);
        showToast('Copied to clipboard', 'success');
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
                                    {voyagerData.followerCount && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', flexShrink: 0 }}>{voyagerData.followerCount.toLocaleString()} followers</span>}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{voyagerData.headline || ''}</div>
                            </div>
                        ) : (
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{voyagerLoading ? 'Loading...' : 'Connect extension to sync profile'}</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={linkedInUseProfileData} onChange={e => toggleLinkedInProfileData(e.target.checked)}
                                style={{ width: '14px', height: '14px', accentColor: '#0077b5' }} />
                            <span style={{ color: 'white', fontSize: '13px' }}>Profile Data Active</span>
                        </label>
                        {/* Topics, Data, Sync buttons removed per user request */}
                    </div>
                </div>
            </div>

            {/* Personal Brand Strategy */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: 'white', fontSize: '17px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {miniIcon('M13 10V3L4 14h7v7l9-11h-7z', '#fbbf24', 16)} Personal Brand Strategy
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => {
                            if (!voyagerData) {
                                showToast?.('Please sync your LinkedIn profile first', 'error');
                                return;
                            }
                            suggestGoals();
                        }} disabled={goalsSuggesting}
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '8px', padding: '6px 14px', color: 'white', fontSize: '13px', fontWeight: 'bold', cursor: goalsSuggesting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {goalsSuggesting ? 'Suggesting...' : '✨ Suggest Strategy'}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Content Goal</label>
                        <input type="text" value={userGoal} onChange={e => setUserGoal(e.target.value)} placeholder="e.g. Build authority in B2B SaaS"
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '14px', width: '100%', outline: 'none', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Target Audience</label>
                        <input type="text" value={writerTargetAudience} onChange={e => setWriterTargetAudience(e.target.value)} placeholder="e.g. Startup Founders"
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '14px', width: '100%', outline: 'none', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Your Background</label>
                        <input type="text" value={writerBackground} onChange={e => setWriterBackground(e.target.value)} placeholder="e.g. CEO at TechCorp"
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '14px', width: '100%', outline: 'none', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Writing Style (Inspiration)</label>
                        <select value={userWritingStyleSource} onChange={e => setUserWritingStyleSource(e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '14px', width: '100%', outline: 'none', cursor: 'pointer', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
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

            {/* Main Grid Layout: 3 columns for main sections, calendar spans full width at bottom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.3fr', gap: '16px', marginBottom: '16px' }}>
                {/* Row 1: AI Post Helper, Hook Generator + Config, LinkedIn Preview */}
                {/* Column 1: AI Post Helper with scrollbar */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', maxHeight: '650px' }}>
                    <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {miniIcon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', '#60a5fa', 13)} AI Post Helper
                    </h3>

                    {/* Analyze Post Button */}
                    <button 
                        onClick={() => {
                            if (!writerContent.trim()) {
                                showToast('Please generate or write some content first before analyzing', 'info');
                                return;
                            }
                            if (analysisData && !showAnalysis) {
                                // If we have analysis data but panel is closed, just show the panel
                                setShowAnalysis(true);
                            } else {
                                // Otherwise run new analysis
                                analyzePost();
                            }
                        }} 
                        disabled={analyzing || !writerContent.trim()}
                        style={{ 
                            width: '100%', 
                            padding: '10px', 
                            background: (!writerContent.trim() || analyzing) 
                                ? 'rgba(139,92,246,0.2)' 
                                : (analysisData && !showAnalysis) 
                                    ? 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(16,185,129,0.2))' 
                                    : 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.2))', 
                            border: '1px solid rgba(139,92,246,0.4)', 
                            borderRadius: '8px', 
                            color: !writerContent.trim() ? 'rgba(167,139,250,0.5)' : (analysisData && !showAnalysis) ? '#22c55e' : '#a78bfa', 
                            fontSize: '13px', 
                            fontWeight: '700', 
                            cursor: (!writerContent.trim() || analyzing) ? 'not-allowed' : 'pointer', 
                            marginBottom: '10px', 
                            flexShrink: 0, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '6px', 
                            transition: 'all 0.2s',
                            opacity: (!writerContent.trim() || analyzing) ? 0.6 : 1
                        }}
                    >
                        {miniIcon('M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', '#a78bfa', 12)}
                        {analyzing ? 'Analyzing with AI...' : (!writerContent.trim() ? 'Analyze Post (write content first)' : (analysisData && !showAnalysis ? '📊 View Analysis' : 'Analyze Post'))}
                    </button>

                    {/* AI Analysis Results Panel */}
                    {showAnalysis && (
                        <div style={{ marginBottom: '10px', flexShrink: 0, maxHeight: '350px', overflowY: 'auto' }}>
                            {analyzing ? (
                                <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                    <div style={{ color: '#a78bfa', fontSize: '14px', marginBottom: '8px' }}>Analyzing your post against Q1 2026 LinkedIn algorithm...</div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Built to compare against current algorithm research</div>
                                </div>
                            ) : analysisData?.error ? (
                                <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '13px' }}>
                                    {analysisData.error}
                                    <button onClick={() => setShowAnalysis(false)} style={{ float: 'right', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>×</button>
                                </div>
                            ) : analysisData ? (
                                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.2)', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>📊 AI Post Analysis</span>
                                        <button onClick={() => setShowAnalysis(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px' }}>×</button>
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
                                                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600' }}>{metric.label}</span>
                                                        <span style={{ color, fontSize: '16px', fontWeight: '700' }}>{score}</span>
                                                    </div>
                                                    {metric.data?.reasoning && (
                                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', lineHeight: '1.4' }}>{metric.data.reasoning.substring(0, 120)}{metric.data.reasoning.length > 120 ? '...' : ''}</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {analysisData.overallVerdict && (
                                        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(139,92,246,0.08)' }}>
                                            <div style={{ color: '#c4b5fd', fontSize: '12px', fontWeight: '600', marginBottom: '2px' }}>Verdict</div>
                                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.4' }}>{analysisData.overallVerdict}</div>
                                        </div>
                                    )}
                                    {analysisData.topImprovements && analysisData.topImprovements.length > 0 && (
                                        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>💡 Top Improvements</div>
                                            {analysisData.topImprovements.slice(0, 3).map((tip: string, i: number) => (
                                                <div key={i} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', padding: '3px 0', lineHeight: '1.3' }}>• {tip}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )}

                    <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
                        {chatMessages.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '12px' }}>Ask me anything about your post:</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                                    {['Help me find ideas', 'Make it casual', 'More formal', 'Shorter version'].map(q => (
                                        <button key={q} onClick={() => { setChatInput(q); sendChatMessage(q); }}
                                            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
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
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: msg.role === 'user' ? 'linear-gradient(135deg, #693fe9, #8b5cf6)' : 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                                            {msg.role === 'user' ? 'U' : 'AI'}
                                        </div>
                                        <div style={{ flex: 1, background: msg.role === 'user' ? 'rgba(105,63,233,0.1)' : 'rgba(59,130,246,0.1)', padding: '10px 14px', borderRadius: '10px', color: 'rgba(255,255,255,0.85)', fontSize: '14px', lineHeight: '1.6' }}>
                                            {msg.role === 'user' ? (
                                                msg.content
                                            ) : (
                                                <div className="prose prose-invert prose-sm" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                            {/* Show modified post content with Copy and Apply buttons */}
                                            {msg.role === 'assistant' && msg.modifiedPost && (
                                                <div style={{ marginTop: '12px' }}>
                                                    {/* Show what changed */}
                                                    {msg.changeDescription && (
                                                        <div style={{ fontSize: '12px', color: '#a78bfa', marginBottom: '8px', fontStyle: 'italic' }}>
                                                            {msg.changeDescription}
                                                        </div>
                                                    )}
                                                    {/* Show the actual modified post content */}
                                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px', lineHeight: '1.5', color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                                                        {msg.modifiedPost}
                                                    </div>
                                                    {/* Copy and Apply buttons */}
                                                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                                                        <button onClick={() => copyChatPost(msg.modifiedPost)}
                                                            style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                            {miniIcon('M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3', 'white', 12)} Copy
                                                        </button>
                                                        <button onClick={() => applyChatPost(msg.modifiedPost)}
                                                            style={{ flex: 1, padding: '8px 12px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                            {miniIcon('M5 13l4 4L19 7', 'white', 12)} Apply
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {chatSending && (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                                            AI
                                        </div>
                                        <div style={{ flex: 1, background: 'rgba(59,130,246,0.1)', padding: '12px 14px', borderRadius: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <div style={{ display: 'flex', gap: '3px' }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', animation: 'bounce 1.4s infinite ease-in-out both 0.16s' }}></div>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', animation: 'bounce 1.4s infinite ease-in-out both 0.32s' }}></div>
                                                </div>
                                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Thinking...</span>
                                            </div>
                                            <style>{`
                                                @keyframes bounce {
                                                    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                                                    40% { transform: scale(1); opacity: 1; }
                                                }
                                            `}</style>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && sendChatMessage()}
                            placeholder="Ask for help or ideas..."
                            style={{ flex: 1, padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }} />
                        <button onClick={() => sendChatMessage()} disabled={!chatInput.trim() || chatSending}
                            style={{ padding: '10px 16px', background: chatSending ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '8px', cursor: chatSending || !chatInput.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {chatSending ? '...' : <>{miniIcon('M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z', 'white', 12)}</>}
                        </button>
                    </div>
                </div>

                {/* Column 2: Hook Generator + Config (merged) */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', maxHeight: '650px' }}>
                    <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {miniIcon('M13 10V3L4 14h7v7l9-11h-7z', '#fbbf24', 14)} Hook Generator & Config
                    </h3>

                    {/* Topic Input */}
                    <div style={{ marginBottom: '10px', flexShrink: 0 }}>
                        <textarea value={writerTopic} onChange={e => setWriterTopic(e.target.value)}
                            placeholder="What do you want to write about?"
                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', resize: 'none', minHeight: '60px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }} />
                    </div>

                    <button onClick={generateHooks} disabled={hooksGenerating || !writerTopic.trim()}
                        style={{ width: '100%', padding: '10px', background: hooksGenerating ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: hooksGenerating || !writerTopic.trim() ? 'not-allowed' : 'pointer', marginBottom: '10px', flexShrink: 0 }}>
                        {hooksGenerating ? 'Generating...' : '⚡ Generate Hooks'}
                    </button>

                    {hooks.length > 0 && (
                        <>
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                                {['all', 'question', 'bold', 'story'].map(cat => (
                                    <button key={cat} onClick={() => setHookCategory(cat === 'bold' ? 'bold_statement' : cat === 'story' ? 'anecdote' : cat)}
                                        style={{ padding: '4px 8px', background: (hookCategory === cat || (cat === 'bold' && hookCategory === 'bold_statement') || (cat === 'story' && hookCategory === 'anecdote')) ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', cursor: 'pointer', textTransform: 'capitalize' }}>
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                                {filteredHooks.map((hook, i) => (
                                    <div key={i} onClick={() => editingHookIndex !== i && setSelectedHook(hook.text)}
                                        style={{ padding: '8px', background: selectedHook === hook.text ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)', border: selectedHook === hook.text ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: editingHookIndex !== i ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                                        {editingHookIndex === i ? (
                                            <div>
                                                <textarea
                                                    value={editingHookText}
                                                    onChange={e => setEditingHookText(e.target.value)}
                                                    style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'white', fontSize: '13px', resize: 'none', minHeight: '50px', outline: 'none', fontFamily: 'Inter, system-ui, sans-serif' }}
                                                />
                                                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                                    <button
                                                        onClick={() => {
                                                            const newHooks = [...hooks];
                                                            newHooks[i] = { ...hook, text: editingHookText };
                                                            setHooks(newHooks);
                                                            setSelectedHook(editingHookText);
                                                            setEditingHookIndex(null);
                                                        }}
                                                        style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.5)', borderRadius: '4px', color: '#34d399', fontSize: '11px', cursor: 'pointer' }}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingHookIndex(null)}
                                                        style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', cursor: 'pointer' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                                <div style={{ color: 'white', fontSize: '13px', lineHeight: '1.4', flex: 1 }}>{hook.text}</div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setEditingHookIndex(i); setEditingHookText(hook.text); }}
                                                    style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '3px', color: 'rgba(255,255,255,0.6)', fontSize: '10px', cursor: 'pointer', flexShrink: 0 }}
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                        {selectedHook === hook.text && editingHookIndex !== i && <span style={{ color: '#34d399', fontSize: '12px', marginTop: '4px', display: 'block' }}>✓ Selected</span>}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {hooks.length === 0 && (
                        <div style={{ padding: '10px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '10px' }}>
                            Enter a topic and generate hooks
                        </div>
                    )}

                    {/* Custom Hook Section */}
                    <div style={{ marginBottom: '10px' }}>
                        <button
                            onClick={() => { setShowCustomHook(!showCustomHook); if (!showCustomHook) setSelectedHook(customHook); }}
                            style={{ width: '100%', padding: '8px', background: showCustomHook ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '12px', cursor: 'pointer', marginBottom: showCustomHook ? '8px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                            {showCustomHook ? '✕ Hide Custom Hook' : '✍️ Write Your Own Hook'}
                        </button>

                        {showCustomHook && (
                            <div>
                                <textarea
                                    value={customHook}
                                    onChange={e => { setCustomHook(e.target.value); setSelectedHook(e.target.value); }}
                                    placeholder="Write your own hook here..."
                                    style={{ width: '100%', padding: '10px', background: 'rgba(139,92,246,0.1)', border: selectedHook === customHook && customHook ? '2px solid #8b5cf6' : '1px solid rgba(139,92,246,0.3)', borderRadius: '6px', color: 'white', fontSize: '13px', resize: 'none', minHeight: '60px', outline: 'none', fontFamily: 'Inter, system-ui, sans-serif' }}
                                />
                                {customHook && selectedHook === customHook && (
                                    <span style={{ color: '#34d399', fontSize: '12px', marginTop: '4px', display: 'block' }}>✓ Using your custom hook</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Config Section with Template, Tone, Depth */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', marginTop: 'auto' }}>
                        {/* Template & Tone row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            <div>
                                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '4px', display: 'block' }}>Template</label>
                                <select value={writerTemplate} onChange={e => setWriterTemplate(e.target.value)}
                                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', fontSize: '13px', cursor: 'pointer', outline: 'none', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                    {TEMPLATE_OPTIONS.map((t: any) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '4px', display: 'block' }}>Tone</label>
                                <select value={writerTone} onChange={e => setWriterTone(e.target.value)}
                                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', fontSize: '13px', cursor: 'pointer', outline: 'none', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                    {TONE_OPTIONS.map((t: any) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* Depth Selection */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '4px', display: 'block' }}>📏 Depth</label>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {DEPTH_OPTIONS.map(depth => (
                                    <button key={depth.id} onClick={() => setPostDepth(depth.id)}
                                        style={{ flex: 1, padding: '6px 4px', background: postDepth === depth.id ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)', border: postDepth === depth.id ? '1px solid rgba(16,185,129,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', color: postDepth === depth.id ? '#34d399' : 'rgba(255,255,255,0.7)', fontSize: '11px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>
                                        {depth.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Options row - hashtags & emojis only */}
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={writerHashtags} onChange={e => setWriterHashtags(e.target.checked)}
                                    style={{ width: '14px', height: '14px', accentColor: '#a78bfa', cursor: 'pointer' }} />
                                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '500' }}>Hashtags</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={writerEmojis} onChange={e => setWriterEmojis(e.target.checked)}
                                    style={{ width: '14px', height: '14px', accentColor: '#a78bfa', cursor: 'pointer' }} />
                                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '500' }}>Emojis</span>
                            </label>
                        </div>

                        <button onClick={generatePostWithHook}
                            disabled={isWriterGenerating || !writerTopic.trim()}
                            style={{ width: '100%', padding: '12px', background: isWriterGenerating ? 'rgba(105,63,233,0.5)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: (isWriterGenerating || !writerTopic.trim()) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(105,63,233,0.4)', transition: 'all 0.2s' }}
                            onMouseOver={e => { if (!isWriterGenerating && writerTopic.trim()) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                            {isWriterGenerating ? 'Generating Post...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>{miniIcon('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', 'white', 14)} {(selectedHook || (showCustomHook && customHook)) ? 'Generate Full Post with Hook' : 'Generate Post'}</span>}
                        </button>

                        {writerStatus && (
                            <div style={{ marginTop: '8px', padding: '8px 12px', background: writerStatus.includes('Error') || writerStatus.includes('failed') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${writerStatus.includes('Error') || writerStatus.includes('failed') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '8px', color: writerStatus.includes('Error') || writerStatus.includes('failed') ? '#f87171' : '#34d399', fontSize: '13px' }}>
                                {writerStatus}
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 3: LinkedIn Preview */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', maxHeight: '650px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>LinkedIn Preview</span>
                            {showEditHint && writerContent.trim() && !inlineEditMode && (
                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                    Click edit to modify
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            {isEditingPost ? (
                                <>
                                    <button onClick={saveEditedPost}
                                        style={{ padding: '4px 10px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                                        Save
                                    </button>
                                    <button onClick={cancelEditingPost}
                                        style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    {(['desktop', 'mobile'] as const).map(mode => (
                                        <button key={mode} onClick={() => setWriterPreviewMode(writerPreviewMode === mode ? 'desktop' : mode)}
                                            style={{ padding: '3px 8px', background: writerPreviewMode === mode ? 'rgba(0,119,181,0.3)' : 'rgba(255,255,255,0.06)', border: writerPreviewMode === mode ? '1px solid rgba(0,119,181,0.5)' : '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: writerPreviewMode === mode ? '#60a5fa' : 'rgba(255,255,255,0.5)', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                                            {mode === 'desktop' ? 'Desktop' : 'Mobile'}
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    {
                        writerContent.trim() ? (() => {
                            const isMobile = writerPreviewMode === 'mobile';
                            const maxW = isMobile ? '375px' : '100%';
                            const TRUNCATE_CHARS = 130; // LinkedIn-style truncation at 130 characters
                            const truncated = writerContent.length > TRUNCATE_CHARS && !writerPreviewExpanded;
                            const displayText = truncated ? writerContent.substring(0, TRUNCATE_CHARS) : writerContent;
                            
                            // Use fresh user-specific data with proper fallbacks
                            const profileName = voyagerData?.name || linkedInProfile?.name || user?.name || user?.email?.split('@')[0] || 'Your Name';
                            const profileHeadline = voyagerData?.headline || linkedInProfile?.headline || user?.email || 'Your Headline';
                            
                            return (
                                <div style={{ maxWidth: maxW, margin: '0 auto', background: '#ffffff', borderRadius: '8px', border: '1px solid #e0dfdc', overflow: 'hidden', fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', flex: 1, overflowY: 'auto', boxShadow: '0 0 0 1px rgba(0,0,0,0.05)' }}>
                                    {/* Profile Header - LinkedIn Style */}
                                    <div style={{ padding: isMobile ? '12px' : '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        {voyagerData?.profilePicture ? (
                                            <img src={voyagerData.profilePicture} alt="" style={{ width: isMobile ? '48px' : '56px', height: isMobile ? '48px' : '56px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                        ) : (
                                            <div style={{ width: isMobile ? '48px' : '56px', height: isMobile ? '48px' : '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #0077b5, #00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: isMobile ? '20px' : '24px', flexShrink: 0 }}>
                                                {(profileName?.[0] || 'U').toUpperCase()}
                                            </div>
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ color: 'rgba(0,0,0,0.9)', fontWeight: '600', fontSize: isMobile ? '14px' : '16px', lineHeight: '1.2' }}>{profileName}</span>
                                                <span style={{ color: '#057642', fontSize: '14px', fontWeight: '500' }}>• 1st</span>
                                            </div>
                                            <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: isMobile ? '12px' : '14px', lineHeight: '1.3' }}>{profileHeadline}</div>
                                            <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: '12px', lineHeight: '1.3', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span>Just now</span>
                                                <span>•</span>
                                                <svg width="14" height="14" viewBox="0 0 18 18" fill="rgba(0,0,0,0.6)"><circle cx="9" cy="9" r="7" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" fill="none"/><path d="M9 5v4l2.5 2.5" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                            </div>
                                        </div>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                                        </button>
                                    </div>

                                    {/* Post Content - Edit Mode, Inline Edit, or Preview Mode */}
                                    <div style={{ padding: isMobile ? '0 12px 12px' : '0 16px 12px' }}>
                                        {isEditingPost ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <textarea
                                                    value={editedPostContent}
                                                    onChange={(e) => setEditedPostContent(e.target.value)}
                                                    placeholder="Write your post content here..."
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '150px',
                                                        padding: '12px',
                                                        background: 'rgba(0,0,0,0.03)',
                                                        border: '1px solid #e0dfdc',
                                                        borderRadius: '8px',
                                                        color: '#000',
                                                        fontSize: isMobile ? '14px' : '16px',
                                                        lineHeight: '1.5',
                                                        fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                        resize: 'vertical',
                                                        outline: 'none',
                                                    }}
                                                    autoFocus
                                                />
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: '12px', alignSelf: 'center' }}>
                                                        {editedPostContent.length} characters
                                                    </span>
                                                </div>
                                            </div>
                                        ) : inlineEditMode ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={handleInlineEdit}
                                                    onKeyDown={handleInlineKeyDown}
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '100px',
                                                        padding: '12px',
                                                        background: 'rgba(0,0,0,0.03)',
                                                        border: '2px solid #0a66c2',
                                                        borderRadius: '8px',
                                                        color: '#000',
                                                        fontSize: isMobile ? '14px' : '16px',
                                                        lineHeight: '1.5',
                                                        fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                        outline: 'none',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                    }}
                                                    ref={(el) => {
                                                        if (el) {
                                                            el.textContent = writerContent;
                                                            el.focus();
                                                        }
                                                    }}
                                                />
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: '12px' }}>
                                                        Click outside to save, or press Ctrl+Enter
                                                    </span>
                                                    <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: '12px' }}>
                                                        {writerContent.length} characters
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    onClick={() => setInlineEditMode(true)}
                                                    style={{
                                                        color: 'rgba(0,0,0,0.9)',
                                                        fontSize: isMobile ? '14px' : '16px',
                                                        lineHeight: '1.5',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        cursor: 'text',
                                                        borderRadius: '4px',
                                                        padding: '4px',
                                                        margin: '-4px',
                                                        transition: 'background 0.2s',
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.background = 'rgba(10,102,194,0.05)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                    }}
                                                    title="Click to edit inline"
                                                >
                                                    {displayText}
                                                    {truncated && <span onClick={(e) => { e.stopPropagation(); setWriterPreviewExpanded(true); }} style={{ color: '#0a66c2', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>...see more</span>}
                                                </div>
                                                {writerPreviewExpanded && writerContent.length > TRUNCATE_CHARS && (
                                                    <span onClick={() => setWriterPreviewExpanded(false)} style={{ color: '#0a66c2', cursor: 'pointer', fontSize: '14px', display: 'block', marginTop: '4px', fontWeight: '500' }}>show less</span>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Media */}
                                    {writerImageUrl && (
                                        <div style={{ borderTop: '1px solid #e0dfdc' }}>
                                            {writerMediaType === 'video' ? (
                                                <video src={writerImageUrl} controls style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', background: '#000' }} />
                                            ) : (
                                                <img src={writerImageUrl} alt="Post media" style={{ width: '100%', maxHeight: '420px', objectFit: 'cover' }} />
                                            )}
                                        </div>
                                    )}

                                    {/* Social Counts */}
                                    <div style={{ padding: '8px 16px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(0,0,0,0.6)', fontSize: '12px' }}>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '-4px' }}>
                                                    <svg width="10" height="10" viewBox="0 0 16 16" fill="white"><path d="M13.5 1h-11C1.7 1 1 1.7 1 2.5v11c0 .8.7 1.5 1.5 1.5h6.5v-5l-3-3h5l3-3v5h2.5c.8 0 1.5-.7 1.5-1.5v-11c0-.8-.7-1.5-1.5-1.5z"/></svg>
                                                </div>
                                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#e6683e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '-4px' }}>
                                                    <svg width="10" height="10" viewBox="0 0 16 16" fill="white"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 11.5l-4.5-2-1 1 4.5 2.5 1-1z"/></svg>
                                                </div>
                                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#a0b4b7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <svg width="10" height="10" viewBox="0 0 16 16" fill="white"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm1 12H7V7h2v5zm1-5c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7z"/></svg>
                                                </div>
                                            </div>
                                            <span style={{ color: 'rgba(0,0,0,0.6)', fontSize: '12px' }}>0</span>
                                        </div>
                                        <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: '12px' }}>
                                            <span style={{ cursor: 'pointer' }}>0 comments</span> • <span style={{ cursor: 'pointer' }}>0 reposts</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons - LinkedIn Style */}
                                    <div style={{ display: 'flex', padding: '4px 8px' }}>
                                        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', color: 'rgba(0,0,0,0.6)', fontSize: isMobile ? '14px' : '16px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.8"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                                            Like
                                        </button>
                                        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', color: 'rgba(0,0,0,0.6)', fontSize: isMobile ? '14px' : '16px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                            Comment
                                        </button>
                                        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', color: 'rgba(0,0,0,0.6)', fontSize: isMobile ? '14px' : '16px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.8"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                                            Repost
                                        </button>
                                        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', color: 'rgba(0,0,0,0.6)', fontSize: isMobile ? '14px' : '16px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                            Send
                                        </button>
                                    </div>
                                </div>
                            );
                        })() : (
                            <div style={{ padding: '60px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '8px', border: '1px solid #e0dfdc' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                                </svg>
                                <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: '14px', fontWeight: '500' }}>Your LinkedIn post will appear here</div>
                                <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: '12px', marginTop: '4px' }}>Generate content to see a preview</div>
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
                                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', cursor: writerUploading ? 'wait' : 'pointer' }}>
                                {miniIcon('M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'rgba(255,255,255,0.7)', 12)}
                                {writerUploading ? 'Uploading...' : writerImageFile ? 'Change Media' : 'Attach Media'}
                            </button>
                            {writerImageUrl && (
                                <button onClick={() => { setWriterImageFile(null); setWriterImageUrl(''); setWriterMediaBlobUrl(''); setWriterMediaType(''); }}
                                    style={{ background: 'rgba(239,68,68,0.2)', border: 'none', padding: '10px', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                            )}
                        </div>

                        {/* Single Post Button - Extension by default, LinkedIn API if connected */}
                        <button onClick={sendToExtension} disabled={writerPosting || !writerContent.trim()}
                            style={{ width: '100%', padding: '12px', background: writerPosting ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: writerPosting || !writerContent.trim() ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(105,63,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            {miniIcon('M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z', 'white', 13)} Post to LinkedIn
                        </button>

                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={openHistoryPopup}
                                style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                                {miniIcon('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 'white', 10)} History
                            </button>
                            {/* DATE Picker - Full clickable area */}
                            <div style={{ position: 'relative', flex: 1, minWidth: 0, height: '38px', borderRadius: '10px', overflow: 'hidden', border: '2px solid rgba(167,139,250,0.6)', background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(139,92,246,0.1))' }}>
                                <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#a78bfa', zIndex: 1, pointerEvents: 'none' }}>
                                    {miniIcon('M6 2v6h.01M12 2v6h.01M6 2C5 2 4 3 4 4v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2h-8', '#a78bfa', 16)}
                                </span>
                                <input type="date" value={writerScheduleDate} onChange={e => setWriterScheduleDate(e.target.value)}
                                    style={{
                                        width: '100%', height: '100%', padding: '0 10px 0 34px',
                                        background: 'transparent', border: 'none',
                                        color: writerScheduleDate ? 'white' : 'rgba(255,255,255,0.6)',
                                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                        outline: 'none'
                                    }} />
                            </div>

                            {/* TIME Picker - Full clickable area */}
                            <div style={{ position: 'relative', flex: 1, minWidth: 0, height: '38px', borderRadius: '10px', overflow: 'hidden', border: '2px solid rgba(167,139,250,0.6)', background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(139,92,246,0.1))' }}>
                                <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#a78bfa', zIndex: 1, pointerEvents: 'none' }}>
                                    {miniIcon('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', '#a78bfa', 16)}
                                </span>
                                <input type="time" value={writerScheduleTime} onChange={e => setWriterScheduleTime(e.target.value)}
                                    style={{
                                        width: '100%', height: '100%', padding: '0 10px 0 34px',
                                        background: 'transparent', border: 'none',
                                        color: writerScheduleTime ? 'white' : 'rgba(255,255,255,0.6)',
                                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                        outline: 'none'
                                    }} />
                            </div>
                            <button onClick={schedulePost}
                                style={{ padding: '6px 10px', background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', borderRadius: '6px', color: '#c4b5fd', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                {miniIcon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', '#c4b5fd', 9)} Schedule
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full-width Content Calendar Section - spans entire width */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                {/* Content Planner + Inspiration Sources */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* AI Content Planner */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(105,63,233,0.15) 0%, rgba(139,92,246,0.1) 100%)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(105,63,233,0.3)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {miniIcon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', '#a78bfa', 16)}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>AI Content Planner</span>
                                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>Generate & schedule full calendar</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => openPlanner?.('5days')}
                                style={{ flex: 1, padding: '8px 12px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(105,63,233,0.4)', transition: 'transform 0.1s' }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'none'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                5 Days
                            </button>
                            <button onClick={() => openPlanner?.('20days')}
                                style={{ flex: 1, padding: '8px 12px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(16,185,129,0.4)', transition: 'transform 0.1s' }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'none'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                20 Days
                            </button>
                        </div>
                    </div>
                    </div>

                    {/* Inspiration Sources Section */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '300px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {miniIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', '#fbbf24', 12)} Sources
                            </h4>
                            <button onClick={() => setShowInspirationPopup?.(true)}
                                style={{ padding: '4px 8px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                                + Add
                            </button>
                        </div>
                        {inspirationLoading ? (
                            <div style={{ textAlign: 'center', padding: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Loading...</div>
                        ) : inspirationSources && inspirationSources.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {inspirationSources.map((source: any, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: userWritingStyleSource === `insp_${source.name}` ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${userWritingStyleSource === `insp_${source.name}` ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => props.setUserWritingStyleSource?.(`insp_${source.name}`)}>
                                            <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{source.name}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{source.count || 0}p</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button onClick={(e) => { e.stopPropagation(); props.loadProfilePosts?.(source.name); }}
                                                style={{ padding: '2px 6px', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: '3px', color: '#60a5fa', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                                                View
                                            </button>
                                            <span style={{ padding: '2px 6px', background: userWritingStyleSource === `insp_${source.name}` ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${userWritingStyleSource === `insp_${source.name}` ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '3px', color: userWritingStyleSource === `insp_${source.name}` ? '#34d399' : 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                                                onClick={() => props.setUserWritingStyleSource?.(`insp_${source.name}`)}>
                                                {userWritingStyleSource === `insp_${source.name}` ? '✓ Active' : 'Use'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {sharedInspProfiles?.map((source: any, idx: number) => (
                                    <div key={`shared-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: userWritingStyleSource === `shared_${source.profileName}` ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.1)', border: `1px solid ${userWritingStyleSource === `shared_${source.profileName}` ? 'rgba(16,185,129,0.4)' : 'rgba(139,92,246,0.2)'}`, borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => props.setUserWritingStyleSource?.(`shared_${source.profileName}`)}>
                                            <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{source.profileName}</span>
                                            <span style={{ color: '#a78bfa', fontSize: '11px' }}>{source.postCount || 0}p</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button onClick={(e) => { e.stopPropagation(); props.loadProfilePosts?.(source.profileName); }}
                                                style={{ padding: '2px 6px', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '3px', color: '#a78bfa', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                                                View
                                            </button>
                                            <span style={{ padding: '2px 6px', background: userWritingStyleSource === `shared_${source.profileName}` ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${userWritingStyleSource === `shared_${source.profileName}` ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '3px', color: userWritingStyleSource === `shared_${source.profileName}` ? '#34d399' : 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                                                onClick={() => props.setUserWritingStyleSource?.(`shared_${source.profileName}`)}>
                                                {userWritingStyleSource === `shared_${source.profileName}` ? '✓ Active' : 'Use'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>No sources yet</div>
                        )}
                    </div>
                </div>

                {/* Content Calendar Display - takes 2/3 width */}
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
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 8px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>
                                ‹
                            </button>
                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '600', minWidth: '120px', textAlign: 'center' }}>
                                {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => {
                                const newMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
                                const newYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
                                setCalendarMonth(newMonth);
                                setCalendarYear(newYear);
                            }}
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 8px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>
                                ›
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} style={{ textAlign: 'center', padding: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600' }}>
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
                                const scheduledCount = writerScheduledPosts?.filter((p: any) => p.scheduledFor?.startsWith(dateStr)).length || 0;
                                
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
                                        onMouseOut={e => { if (!isToday && scheduledCount > 0) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                        onClick={() => {
                                            if (scheduledCount > 0) {
                                                const postsForDay = writerScheduledPosts?.filter((p: any) => p.scheduledFor?.startsWith(dateStr));
                                                if (postsForDay?.length) loadScheduledPost(postsForDay[0]);
                                            }
                                        }}>
                                        <div style={{ color: isToday ? '#60a5fa' : 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: isToday ? '700' : '500', marginBottom: '2px' }}>
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
                            <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                                {writerScheduledPosts.length} Post{writerScheduledPosts.length !== 1 ? 's' : ''} Scheduled
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '300px', overflowY: 'auto' }}>
                                {writerScheduledPosts.slice(0, 20).map((post: any, idx: number) => {
                                    // Get first line of content (up to first newline or use full content)
                                    const firstLine = post.content?.split('\n')[0] || post.content || '';
                                    // Show remove button for all scheduled posts since cron is disabled
                                    const canRemove = true;
                                    return (
                                    <div key={idx} onClick={() => loadScheduledPost(post)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', cursor: 'pointer' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                                            {firstLine}
                                        </span>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginLeft: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>{post.scheduledFor ? new Date(post.scheduledFor).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'N/A'}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemoveLinkedInScheduledPost(post); }}
                                                style={{
                                                    background: 'rgba(239,68,68,0.2)',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '2px 6px',
                                                    color: '#f87171',
                                                    fontSize: '10px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                }}
                                                title="Remove from schedule"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Source Popup Modal */}
            {showInspirationPopup && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowInspirationPopup(false)}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a3e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', padding: '24px', maxWidth: '500px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>{miniIcon('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', 'white', 16)} Add LinkedIn Profiles</h3>
                            <button onClick={() => setShowInspirationPopup(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '6px 10px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginBottom: '12px' }}>Add LinkedIn profiles to learn from their writing style. AI will mimic them when generating posts.</p>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', marginBottom: '12px' }}>
                            <textarea value={props.inspirationProfiles || ''} onChange={e => props.setInspirationProfiles?.(e.target.value)} placeholder={"https://linkedin.com/in/username1\nhttps://linkedin.com/in/username2"} rows={3}
                                style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'monospace', lineHeight: '1.5' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <select value={props.inspirationPostCount || 10} onChange={e => props.setInspirationPostCount?.(parseInt(e.target.value))} style={{ padding: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '13px' }}>
                                    <option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="30">30</option>
                                </select>
                                <button onClick={props.scrapeInspirationProfiles} disabled={props.inspirationScraping} style={{ padding: '10px 16px', background: props.inspirationScraping ? 'rgba(105,63,233,0.3)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: props.inspirationScraping ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
                                    {props.inspirationScraping ? 'Scraping...' : 'Scrape'}
                                </button>
                            </div>
                        </div>
                        {props.inspirationStatus && <div style={{ marginBottom: '12px', padding: '8px 12px', background: props.inspirationStatus.includes('Error') || props.inspirationStatus.includes('Failed') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${props.inspirationStatus.includes('Error') || props.inspirationStatus.includes('Failed') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '8px', color: props.inspirationStatus.includes('Error') || props.inspirationStatus.includes('Failed') ? '#f87171' : '#34d399', fontSize: '14px' }}>{props.inspirationStatus}</div>}
                        <button onClick={() => setShowInspirationPopup(false)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', cursor: 'pointer' }}>Done</button>
                    </div>
                </div>
            )}

            {/* View Profile Posts Popup Modal */}
            {props.viewingProfilePosts && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => { props.setViewingProfilePosts?.(null); props.setProfilePostsData?.([]); }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a3e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', padding: '24px', maxWidth: '800px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: 0 }}>Posts from {props.viewingProfilePosts}</h3>
                            <button onClick={() => { props.setViewingProfilePosts?.(null); props.setProfilePostsData?.([]); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '6px 10px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {props.profilePostsLoading ? (
                                <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.5)' }}>Loading posts...</div>
                            ) : props.profilePostsData && props.profilePostsData.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {props.profilePostsData.map((post: any, idx: number) => (
                                        <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{post.content?.substring(0, 500)}{post.content?.length > 500 ? '...' : ''}</div>
                                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                                                <span>👍 {post.likes || 0}</span>
                                                <span>💬 {post.comments || 0}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.5)' }}>No posts found</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Planner Wizard Modal */}
            {plannerOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div style={{ background: '#13132b', borderRadius: '20px', border: '1px solid rgba(105,63,233,0.4)', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '800', margin: 0 }}>
                                    {plannerMode === '5days' ? '5-Day' : '20-Day'} AI Content Planner
                                </h2>
                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginTop: '3px' }}>
                                    {plannerStep === 'context' && 'Step 1 of 3 — Add context & generate topics'}
                                    {plannerStep === 'select' && 'Step 2 of 3 — Select your topics'}
                                    {plannerStep === 'time' && 'Step 3 of 3 — Set schedule & generate posts'}
                                    {plannerStep === 'generating' && `Generating posts… ${plannerDoneCount}/${plannerTotal}`}
                                    {plannerStep === 'done' && 'All posts generated!'}
                                </div>
                            </div>
                            {plannerStep !== 'generating' && (
                                <button onClick={() => { plannerAbortRef.current = true; setPlannerOpen(false); }}
                                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '16px', cursor: 'pointer' }}>X</button>
                            )}
                        </div>

                        {/* Step 1: Context */}
                        {plannerStep === 'context' && (
                            <div>
                                {linkedInProfile ? (
                                    <div style={{ padding: '12px 14px', background: 'rgba(0,119,181,0.15)', border: '1px solid rgba(0,119,181,0.3)', borderRadius: '10px', marginBottom: '16px' }}>
                                        <div style={{ color: '#60a5fa', fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>Profile Data Available</div>
                                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{linkedInProfile.name} · {linkedInProfile.headline}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '3px' }}>AI will use your profile data to personalise topics to your niche and expertise.</div>
                                    </div>
                                ) : (
                                    <div style={{ padding: '12px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', marginBottom: '16px' }}>
                                        <div style={{ color: '#fbbf24', fontSize: '14px' }}>No LinkedIn profile scanned. Topics will be generic. Scan your profile for personalised results.</div>
                                    </div>
                                )}
                                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                                    Your context, goals & target audience <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: '400' }}>(optional but highly recommended)</span>
                                </label>
                                <textarea value={plannerContext} onChange={e => setPlannerContext(e.target.value)}
                                    placeholder={`Example:
"I'm a SaaS founder targeting startup CTOs. My goal is to generate inbound leads for our DevOps tool. I want to position myself as a thought leader in developer productivity."`}
                                    rows={5} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical', lineHeight: '1.6', boxSizing: 'border-box' }} />
                                {plannerStatusMsg && <div style={{ marginTop: '10px', color: '#f87171', fontSize: '14px' }}>{plannerStatusMsg}</div>}
                                <button onClick={generatePlannerTopics} disabled={plannerGeneratingTopics}
                                    style={{ marginTop: '16px', width: '100%', padding: '13px', background: plannerGeneratingTopics ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: plannerGeneratingTopics ? 'wait' : 'pointer' }}>
                                    {plannerGeneratingTopics ? `Generating ${plannerMode === '5days' ? '5' : '20'} topics...` : `Generate ${plannerMode === '5days' ? '5' : '20'} Topic Ideas`}
                                </button>
                            </div>
                        )}

                        {/* Step 2: Topic Selection */}
                        {plannerStep === 'select' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                                        {plannerSelected.filter(Boolean).length} of {plannerTopics.length} selected (need {plannerMode === '5days' ? '5' : '20'})
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setPlannerSelected(plannerTopics.map((_: any, i: number) => i < (plannerMode === '5days' ? 5 : 20)))}
                                            style={{ padding: '5px 12px', background: 'rgba(105,63,233,0.2)', border: '1px solid rgba(105,63,233,0.4)', borderRadius: '6px', color: '#a78bfa', fontSize: '13px', cursor: 'pointer' }}>Auto-select Top</button>
                                        <button onClick={() => setPlannerSelected(plannerTopics.map((_: any) => true))}
                                            style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer' }}>All</button>
                                        <button onClick={() => setPlannerSelected(plannerTopics.map((_: any) => false))}
                                            style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer' }}>None</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                                    {plannerTopics.map((topic: string, i: number) => (
                                        <div key={i} onClick={() => { const s = [...plannerSelected]; s[i] = !s[i]; setPlannerSelected(s); }}
                                            style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', background: plannerSelected[i] ? 'rgba(105,63,233,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${plannerSelected[i] ? 'rgba(105,63,233,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={!!plannerSelected[i]} readOnly style={{ accentColor: '#693fe9', marginTop: '2px', flexShrink: 0 }} />
                                            <span style={{ color: plannerSelected[i] ? '#c4b5fd' : 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: '1.5' }}><strong style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginRight: '6px' }}>Day {i + 1}</strong>{topic}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                    <button onClick={() => setPlannerStep('context')}
                                        style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                                    <button onClick={() => setPlannerStep('time')} disabled={plannerSelected.filter(Boolean).length === 0}
                                        style={{ flex: 1, padding: '11px 20px', background: plannerSelected.filter(Boolean).length === 0 ? 'rgba(105,63,233,0.4)' : 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: plannerSelected.filter(Boolean).length === 0 ? 'not-allowed' : 'pointer' }}>
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Settings & Generate */}
                        {plannerStep === 'time' && (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                    {/* Start Date - Full clickable area */}
                                    <div>
                                        <label style={{ color: '#a78bfa', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', textTransform: 'uppercase' }}>
                                            {miniIcon('M6 2v6h.01M12 2v6h.01M6 2C5 2 4 3 4 4v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2h-8', '#a78bfa', 14)} Start Date
                                        </label>
                                        <div style={{ position: 'relative', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(167,139,250,0.6)', background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(139,92,246,0.1))' }}>
                                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a78bfa', zIndex: 1, pointerEvents: 'none' }}>
                                                {miniIcon('M6 2v6h.01M12 2v6h.01M6 2C5 2 4 3 4 4v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2h-8', '#a78bfa', 18)}
                                            </span>
                                            <input type="date" value={plannerStartDate} onChange={e => setPlannerStartDate(e.target.value)}
                                                style={{
                                                    width: '100%', height: '100%', padding: '0 14px 0 42px',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: plannerStartDate ? 'white' : 'rgba(255,255,255,0.6)',
                                                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                                    outline: 'none'
                                                }} />
                                        </div>
                                    </div>

                                    {/* Publish Time - Full clickable area */}
                                    <div>
                                        <label style={{ color: '#a78bfa', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', textTransform: 'uppercase' }}>
                                            {miniIcon('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', '#a78bfa', 14)} Publish Time
                                        </label>
                                        <div style={{ position: 'relative', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(167,139,250,0.6)', background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(139,92,246,0.1))' }}>
                                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a78bfa', zIndex: 1, pointerEvents: 'none' }}>
                                                {miniIcon('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', '#a78bfa', 18)}
                                            </span>
                                            <input type="time" value={plannerPublishTime} onChange={e => setPlannerPublishTime(e.target.value)}
                                                style={{
                                                    width: '100%', height: '100%', padding: '0 14px 0 42px',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: plannerPublishTime ? 'white' : 'rgba(255,255,255,0.6)',
                                                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                                    outline: 'none'
                                                }} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Template</label>
                                        <select value={plannerTemplate} onChange={e => setPlannerTemplate(e.target.value)}
                                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px' }}>
                                            <option value="thought_leadership">Thought Leadership</option>
                                            <option value="how_to">How-To / Tutorial</option>
                                            <option value="case_study">Case Study</option>
                                            <option value="opinion">Opinion / Perspective</option>
                                            <option value="behind_scenes">Behind the Scenes</option>
                                            <option value="industry_news">Industry News</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Tone</label>
                                        <select value={plannerTone} onChange={e => setPlannerTone(e.target.value)}
                                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px' }}>
                                            <option value="professional">Professional</option>
                                            <option value="friendly">Friendly</option>
                                            <option value="casual">Casual</option>
                                            <option value="bold">Bold</option>
                                            <option value="humorous">Humorous</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Post Length</label>
                                    <select value={plannerLength} onChange={e => setPlannerLength(e.target.value)}
                                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px' }}>
                                        <option value="500">Short (~100 words)</option>
                                        <option value="900">Standard (~250 words)</option>
                                        <option value="1500">Deep (~500 words)</option>
                                        <option value="2500">Extra Long (~800 words)</option>
                                    </select>
                                </div>
                                <div style={{ padding: '12px', background: 'rgba(105,63,233,0.1)', border: '1px solid rgba(105,63,233,0.3)', borderRadius: '10px', marginBottom: '16px' }}>
                                    <div style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>Summary</div>
                                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                                        {plannerSelected.filter(Boolean).length} posts will be generated starting from {plannerStartDate} at {plannerPublishTime}.
                                    </div>
                                </div>
                                {plannerStatusMsg && <div style={{ marginBottom: '12px', color: '#f87171', fontSize: '14px' }}>{plannerStatusMsg}</div>}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => setPlannerStep('select')}
                                        style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                                    <button onClick={() => startPlannerGeneration?.()}
                                        style={{ flex: 1, padding: '11px 20px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                                        Generate & Schedule Posts
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Generating Step */}
                        {plannerStep === 'generating' && (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ width: '60px', height: '60px', border: '4px solid rgba(105,63,233,0.3)', borderTopColor: '#693fe9', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                <div style={{ color: 'white', fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Generating your content calendar...</div>
                                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '16px' }}>Post {plannerDoneCount} of {plannerTotal}</div>
                                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${(plannerDoneCount / plannerTotal) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #693fe9, #8b5cf6)', transition: 'width 0.3s ease' }}></div>
                                </div>
                                {plannerStatusMsg && <div style={{ marginTop: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{plannerStatusMsg}</div>}
                            </div>
                        )}

                        {/* Done Step */}
                        {plannerStep === 'done' && (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
                                <div style={{ color: 'white', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>All posts generated!</div>
                                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '24px' }}>
                                    {plannerDoneCount} posts have been saved and sent to LinkedIn! Check the "Posts Scheduled" section below the Content Calendar.
                                </div>
                                <button onClick={() => { setPlannerOpen(false); }}
                                    style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* History Popup Modal */}
            {showHistoryPopup && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowHistoryPopup(false)}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a3e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', padding: '24px', maxWidth: '700px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {miniIcon('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 'white', 18)} AI Generated Posts History
                            </h3>
                            <button onClick={() => setShowHistoryPopup(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '6px 10px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>✕</button>
                        </div>

                        {historyLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>Loading history...</div>
                        ) : historyItems && historyItems.length > 0 ? (
                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {historyItems
                                    .filter((item: any) => !item.title?.match(/AI Generated \d+ Posts/)) // Filter out bulk generated posts
                                    .map((item: any, idx: number) => {
                                    let content = '';
                                    try {
                                        const rawContent = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
                                        // Try to parse and extract clean content
                                        try {
                                            const parsed = JSON.parse(rawContent);
                                            if (Array.isArray(parsed)) {
                                                content = parsed[0] || '';
                                            } else if (parsed && typeof parsed === 'object' && parsed.content) {
                                                content = parsed.content;
                                            } else if (typeof parsed === 'string') {
                                                content = parsed;
                                            } else {
                                                content = rawContent;
                                            }
                                        } catch {
                                            content = rawContent;
                                        }
                                    } catch { content = String(item.content); }

                                    // Format content for display - clean up common patterns
                                    const formatContent = (text: string) => {
                                        // Truncate to ~300 chars for preview
                                        const maxLen = 280;
                                        let formatted = text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
                                        // Clean up escaped newlines
                                        formatted = formatted.replace(/\\n/g, '\n').replace(/\\"/g, '"');
                                        return formatted;
                                    };

                                    return (
                                        <div key={idx} style={{ padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onClick={() => {
                                                try {
                                                    let contentToLoad = '';
                                                    const rawContent = item.content;

                                                    // Try to parse as JSON first
                                                    if (typeof rawContent === 'string') {
                                                        try {
                                                            const parsed = JSON.parse(rawContent);
                                                            if (Array.isArray(parsed)) {
                                                                contentToLoad = parsed[0] || '';
                                                            } else if (parsed && typeof parsed === 'object' && parsed.content) {
                                                                contentToLoad = parsed.content;
                                                            } else if (typeof parsed === 'string') {
                                                                contentToLoad = parsed;
                                                            }
                                                        } catch {
                                                            // Not JSON, use as-is
                                                            contentToLoad = rawContent;
                                                        }
                                                    } else if (rawContent && typeof rawContent === 'object') {
                                                        if (Array.isArray(rawContent)) {
                                                            contentToLoad = rawContent[0] || '';
                                                        } else if (rawContent.content) {
                                                            contentToLoad = rawContent.content;
                                                        }
                                                    }

                                                    if (contentToLoad) {
                                                        setWriterContent(contentToLoad);
                                                        // Try to extract topic from metadata if available
                                                        if (item.metadata) {
                                                            try {
                                                                const metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata;
                                                                if (metadata?.template || metadata?.topic) {
                                                                    setWriterTopic(metadata.template || metadata.topic);
                                                                }
                                                            } catch { /* ignore metadata parse error */ }
                                                        }
                                                        setShowHistoryPopup(false);
                                                        showToast('Post loaded to LinkedIn Preview', 'success');
                                                    } else {
                                                        showToast('Could not extract post content', 'error');
                                                    }
                                                } catch { showToast('Failed to load post', 'error'); }
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <span style={{ color: '#a78bfa', fontSize: '12px', fontWeight: '600' }}>{item.title || 'AI Generated Post'}</span>
                                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </div>
                                            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                {formatContent(content)}
                                            </div>
                                            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                                                <span style={{ color: '#a78bfa', fontSize: '11px', fontWeight: '500' }}>Click to load this post</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                                No AI generated posts in history yet.<br />
                                <span style={{ fontSize: '12px' }}>Generate a post to see it here.</span>
                            </div>
                        )}

                        <button onClick={() => setShowHistoryPopup(false)} style={{ marginTop: '16px', width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', cursor: 'pointer' }}>Close</button>
                    </div>
                </div>
            )}

            {/* LinkedIn Scheduled Post Removal Notification */}
            {linkedInRemovalNotification.show && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    maxWidth: '360px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                    zIndex: 99999,
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <style>{`
                        @keyframes slideIn {
                            from { transform: translateX(100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                    `}</style>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ fontSize: '24px' }}>⚠️</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>
                                Remove from LinkedIn
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: '1.5' }}>
                                This post was scheduled on LinkedIn. Please manually remove it from <strong>LinkedIn Share Management</strong>.
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '8px' }}>
                                {linkedInRemovalNotification.linkedInOpened ? (
                                    <span style={{ color: '#4ade80', fontWeight: '600' }}>✓ LinkedIn opened for you</span>
                                ) : (
                                    <>Opening LinkedIn in <span style={{ fontWeight: '700', color: 'white' }}>{linkedInRemovalNotification.countdown - 15}</span> seconds...</>
                                )}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginTop: '4px' }}>
                                This notification will close in {linkedInRemovalNotification.countdown} seconds.
                            </div>
                        </div>
                        <button
                            onClick={() => setLinkedInRemovalNotification({ show: false, postId: null, countdown: 0, linkedInOpened: false })}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                color: 'white',
                                fontSize: '14px',
                                cursor: 'pointer',
                                lineHeight: 1
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
