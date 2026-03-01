'use client';

import React, { useState, useEffect } from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

// LinkedIn-style colors
const colors = {
    primary: '#693fe9',
    secondary: '#5b7dff',
    accent: '#f59e0b',
    linkedInBlue: '#0a66c2',
    linkedInBg: '#f3f2ef',
    linkedInGray: '#666666',
    success: '#057642',
};

export default function AuthLayout({ children }: AuthLayoutProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedComment, setGeneratedComment] = useState('');
    const [showcaseStep, setShowcaseStep] = useState(0);

    // Auto-cycle through showcase elements
    useEffect(() => {
        const interval = setInterval(() => {
            setShowcaseStep((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Simulate AI comment generation
    const simulateGeneration = () => {
        setIsGenerating(true);
        setGeneratedComment('');

        const comments = [
            "This is incredibly insightful! Your perspective on building in public is exactly what the community needs to hear. Looking forward to more content like this.",
            "Great point! I've been thinking about this same challenge. Would love to hear more about your implementation approach.",
            "This resonates deeply. The willingness to share both wins and learnings is what makes this community so valuable. Thanks for being so open!",
        ];

        let charIndex = 0;
        const targetComment = comments[Math.floor(Math.random() * comments.length)];

        const interval = setInterval(() => {
            if (charIndex < targetComment.length) {
                setGeneratedComment(targetComment.slice(0, charIndex + 1));
                charIndex++;
            } else {
                clearInterval(interval);
                setIsGenerating(false);
            }
        }, 30);

        return () => clearInterval(interval);
    };

    return (
        <div style={styles.container}>
            {/* Left Panel - Auth Form */}
            <div style={styles.leftPanel}>
                <div style={styles.authCard}>
                    {children}
                </div>
            </div>

            {/* Right Panel - LinkedIn Automation Showcase */}
            <div style={styles.rightPanel}>
                <div style={styles.showcaseContent}>
                    {/* Hero Section */}
                    <div style={styles.heroSection}>
                        <div style={styles.logoBadge}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
                                <rect x="2" y="9" width="4" height="12"/>
                                <circle cx="4" cy="4" r="2"/>
                            </svg>
                            <span style={styles.logoText}>Kommentify</span>
                        </div>
                        <h1 style={styles.heroHeadline}>
                            Grow Your LinkedIn Presence on Autopilot
                        </h1>
                        <p style={styles.heroSubheadline}>
                            AI-Powered Post & Comment Generation that looks 100% human
                        </p>
                    </div>

                    {/* Animated Mock Showcase */}
                    <div style={styles.mockContainer}>
                        {/* Tab Navigation */}
                        <div style={styles.mockTabs}>
                            <button
                                style={{...styles.mockTab, ...(activeTab === 0 ? styles.mockTabActive : {})}}
                                onClick={() => setActiveTab(0)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Post Writer
                            </button>
                            <button
                                style={{...styles.mockTab, ...(activeTab === 1 ? styles.mockTabActive : {})}}
                                onClick={() => setActiveTab(1)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                                </svg>
                                Comments
                            </button>
                            <button
                                style={{...styles.mockTab, ...(activeTab === 2 ? styles.mockTabActive : {})}}
                                onClick={() => setActiveTab(2)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 20V10M12 20V4M6 20v-6"/>
                                </svg>
                                Analytics
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div style={styles.mockContent}>
                            {/* Tab 0: AI Post Writer */}
                            {activeTab === 0 && (
                                <div style={styles.tabPane}>
                                    {/* LinkedIn Post Preview */}
                                    <div style={styles.linkedInPost}>
                                        <div style={styles.postHeader}>
                                            <div style={styles.postAvatar}>
                                                <span style={styles.avatarInitial}>S</span>
                                            </div>
                                            <div style={styles.postMeta}>
                                                <span style={styles.postName}>Sarah Chen</span>
                                                <span style={styles.postTitle}>VP of Growth | Tech Founder</span>
                                                <span style={styles.postTime}>2h • <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></span>
                                            </div>
                                            <div style={styles.postBadge}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                                </svg>
                                                <span>Posted via Kommentify</span>
                                            </div>
                                        </div>
                                        <div style={styles.postBody}>
                                            <p style={styles.postText}>
                                                Building in public isn't just about sharing wins — it's about building trust with your audience.
                                            </p>
                                            <p style={styles.postText}>
                                                Here's what I learned from launching 3 products this year:
                                            </p>
                                            <ol style={styles.postList}>
                                                <li>Share the messy middle, not just the finished product</li>
                                                <li>Ask for feedback early and often</li>
                                                <li>Document your journey, not just your results</li>
                                            </ol>
                                            <p style={styles.postText}>
                                                The creators who win are the ones who show up authentically every single day.
                                            </p>
                                        </div>
                                        <div style={styles.postStats}>
                                            <div style={styles.postStat}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.linkedInBlue} strokeWidth="2">
                                                    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                                                </svg>
                                                <span>847</span>
                                            </div>
                                            <div style={styles.postStat}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.linkedInGray} strokeWidth="2">
                                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                                                </svg>
                                                <span>124</span>
                                            </div>
                                            <div style={styles.postStat}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.linkedInGray} strokeWidth="2">
                                                    <circle cx="18" cy="5" r="3"/>
                                                    <circle cx="6" cy="12" r="3"/>
                                                    <circle cx="18" cy="19" r="3"/>
                                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                                                </svg>
                                                <span>2,341</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Writing Assistant */}
                                    <div style={styles.aiAssistant}>
                                        <div style={styles.aiHeader}>
                                            <div style={styles.aiIcon}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                                </svg>
                                            </div>
                                            <span style={styles.aiTitle}>AI Writing Assistant</span>
                                            <span style={styles.aiStatus}>Generating...</span>
                                        </div>
                                        <div style={styles.aiSuggestions}>
                                            <div style={styles.suggestionChip}>Launch Tips</div>
                                            <div style={styles.suggestionChip}>Growth Hacks</div>
                                            <div style={styles.suggestionChip}>Founder Story</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 1: AI Comment Generator */}
                            {activeTab === 1 && (
                                <div style={styles.tabPane}>
                                    {/* LinkedIn Post to Comment On */}
                                    <div style={styles.commentPost}>
                                        <div style={styles.postHeader}>
                                            <div style={styles.postAvatar}>
                                                <span style={styles.avatarInitial}>M</span>
                                            </div>
                                            <div style={styles.postMeta}>
                                                <span style={styles.postName}>Michael Torres</span>
                                                <span style={styles.postTitle}>SaaS Founder | 100K+ MRR</span>
                                            </div>
                                        </div>
                                        <div style={styles.postBody}>
                                            <p style={styles.postText}>
                                                Just hit $100K MRR! Here's the exact playbook that got us there...
                                            </p>
                                        </div>
                                    </div>

                                    {/* AI Comment Widget */}
                                    <div style={styles.commentWidget}>
                                        <div style={styles.widgetHeader}>
                                            <div style={styles.widgetIcon}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                                </svg>
                                            </div>
                                            <span style={styles.widgetTitle}>AI Smart Comment</span>
                                        </div>

                                        {generatedComment ? (
                                            <div style={styles.generatedComment}>
                                                <p style={styles.commentText}>{generatedComment}</p>
                                                <div style={styles.commentActions}>
                                                    <button style={styles.copyButton}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                                        </svg>
                                                        Copy
                                                    </button>
                                                    <button style={styles.postButton}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <line x1="22" y1="2" x2="11" y2="13"/>
                                                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                                        </svg>
                                                        Post
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                style={styles.generateButton}
                                                onClick={simulateGeneration}
                                                disabled={isGenerating}
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <span style={styles.spinner}></span>
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                                        </svg>
                                                        Generate Smart Comment
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        <div style={styles.toneSelector}>
                                            <span style={styles.toneLabel}>Tone:</span>
                                            <div style={styles.toneOptions}>
                                                <span style={styles.toneOption}>Supportive</span>
                                                <span style={{...styles.toneOption, ...styles.toneOptionActive}}>Excited</span>
                                                <span style={styles.toneOption}>Curious</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Analytics Dashboard */}
                            {activeTab === 2 && (
                                <div style={styles.tabPane}>
                                    <div style={styles.analyticsDashboard}>
                                        {/* Stats Cards */}
                                        <div style={styles.statsGrid}>
                                            <div style={styles.statCard}>
                                                <span style={styles.statValue}>12.5K</span>
                                                <span style={styles.statLabel}>Followers</span>
                                                <span style={styles.statChange}>+23% this month</span>
                                            </div>
                                            <div style={styles.statCard}>
                                                <span style={styles.statValue}>847</span>
                                                <span style={styles.statLabel}>Engagements</span>
                                                <span style={styles.statChange}>+156% this week</span>
                                            </div>
                                            <div style={styles.statCard}>
                                                <span style={styles.statValue}>2.4K</span>
                                                <span style={styles.statLabel}>Post Views</span>
                                                <span style={styles.statChange}>+89% this month</span>
                                            </div>
                                        </div>

                                        {/* Growth Chart */}
                                        <div style={styles.chartContainer}>
                                            <div style={styles.chartHeader}>
                                                <span style={styles.chartTitle}>Growth Overview</span>
                                                <div style={styles.chartLegend}>
                                                    <span style={styles.legendItem}>
                                                        <span style={styles.legendDot}></span>
                                                        This Month
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={styles.chart}>
                                                {[35, 45, 38, 52, 48, 65, 72, 68, 85, 78, 92, 88].map((height, i) => (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            ...styles.chartBar,
                                                            height: `${height}%`,
                                                            animationDelay: `${i * 0.05}s`
                                                        }}
                                                    ></div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Automation Status */}
                                        <div style={styles.automationStatus}>
                                            <div style={styles.statusHeader}>
                                                <span style={styles.statusTitle}>Automation Active</span>
                                                <span style={styles.statusBadge}>
                                                    <span style={styles.statusDot}></span>
                                                    Running
                                                </span>
                                            </div>
                                            <div style={styles.automationList}>
                                                <div style={styles.automationItem}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2">
                                                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                                    </svg>
                                                    <span>Auto-like targeted posts</span>
                                                </div>
                                                <div style={styles.automationItem}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2">
                                                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                                    </svg>
                                                    <span>AI comment on influencers</span>
                                                </div>
                                                <div style={styles.automationItem}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2">
                                                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                                    </svg>
                                                    <span>Weekly content scheduled</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Feature Highlights */}
                    <div style={styles.features}>
                        <div style={{...styles.featureItem, ...(showcaseStep === 0 ? styles.featureItemActive : {})}}>
                            <div style={styles.featureIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                </svg>
                            </div>
                            <div style={styles.featureText}>
                                <h3 style={styles.featureTitle}>AI Post Writer</h3>
                                <p style={styles.featureDescription}>Create viral content in your voice</p>
                            </div>
                        </div>

                        <div style={{...styles.featureItem, ...(showcaseStep === 1 ? styles.featureItemActive : {})}}>
                            <div style={styles.featureIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                                </svg>
                            </div>
                            <div style={styles.featureText}>
                                <h3 style={styles.featureTitle}>Smart Comments</h3>
                                <p style={styles.featureDescription}>Engage authentically with AI</p>
                            </div>
                        </div>

                        <div style={{...styles.featureItem, ...(showcaseStep === 2 ? styles.featureItemActive : {})}}>
                            <div style={styles.featureIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </div>
                            <div style={styles.featureText}>
                                <h3 style={styles.featureTitle}>Automation</h3>
                                <p style={styles.featureDescription}>Grow while you sleep</p>
                            </div>
                        </div>
                    </div>

                    {/* Social Proof */}
                    <div style={styles.socialProof}>
                        <div style={styles.socialProofAvatars}>
                            <div style={{...styles.avatar, marginLeft: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>A</div>
                            <div style={{...styles.avatar, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>B</div>
                            <div style={{...styles.avatar, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>C</div>
                            <div style={{...styles.avatar, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>D</div>
                            <div style={styles.avatarPlus}>+</div>
                        </div>
                        <p style={styles.socialProofText}>Join 12,500+ professionals growing with Kommentify</p>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div style={styles.decorativeOrb1}></div>
                <div style={styles.decorativeOrb2}></div>
                <div style={styles.decorativeOrb3}></div>

                {/* Floating LinkedIn Icons */}
                <div style={styles.floatingIcon1}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.1)">
                        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
                        <rect x="2" y="9" width="4" height="12"/>
                        <circle cx="4" cy="4" r="2"/>
                    </svg>
                </div>
                <div style={styles.floatingIcon2}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.08)">
                        <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                    </svg>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    leftPanel: {
        width: '40%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
    },
    rightPanel: {
        width: '60%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #693fe9 0%, #5b7dff 50%, #4f6ef5 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '40px',
    },
    authCard: {
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    showcaseContent: {
        position: 'relative',
        zIndex: 1,
        maxWidth: '540px',
        width: '100%',
    },
    heroSection: {
        marginBottom: '28px',
        textAlign: 'center',
    },
    logoBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.15)',
        padding: '8px 16px',
        borderRadius: '24px',
        marginBottom: '20px',
        backdropFilter: 'blur(10px)',
        color: '#ffffff',
    },
    logoText: {
        fontSize: '16px',
        fontWeight: 600,
    },
    heroHeadline: {
        fontSize: '28px',
        fontWeight: 700,
        color: '#ffffff',
        margin: '0 0 12px 0',
        lineHeight: 1.25,
    },
    heroSubheadline: {
        fontSize: '16px',
        color: 'rgba(255, 255, 255, 0.85)',
        margin: 0,
        lineHeight: 1.5,
    },
    mockContainer: {
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '24px',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.25), 0 10px 30px rgba(0, 0, 0, 0.15)',
    },
    mockTabs: {
        display: 'flex',
        background: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
    },
    mockTab: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 12px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 500,
        color: '#666',
        transition: 'all 0.2s ease',
    },
    mockTabActive: {
        color: '#693fe9',
        background: '#ffffff',
        borderBottom: '2px solid #693fe9',
    },
    mockContent: {
        padding: '16px',
        minHeight: '320px',
    },
    tabPane: {
        animation: 'fadeIn 0.3s ease',
    },
    linkedInPost: {
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
    },
    postHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        padding: '12px',
        gap: '10px',
    },
    postAvatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    avatarInitial: {
        color: '#ffffff',
        fontSize: '20px',
        fontWeight: 600,
    },
    postMeta: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    postName: {
        fontSize: '14px',
        fontWeight: 600,
        color: 'rgba(0, 0, 0, 0.9)',
    },
    postTitle: {
        fontSize: '12px',
        color: 'rgba(0, 0, 0, 0.6)',
    },
    postTime: {
        fontSize: '12px',
        color: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
    },
    postBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'linear-gradient(135deg, #693fe9 0%, #5b7dff 100%)',
        padding: '4px 8px',
        borderRadius: '4px',
        color: '#ffffff',
        fontSize: '10px',
        fontWeight: 500,
    },
    postBody: {
        padding: '0 12px 12px 12px',
    },
    postText: {
        fontSize: '14px',
        color: 'rgba(0, 0, 0, 0.9)',
        lineHeight: 1.5,
        margin: '0 0 8px 0',
    },
    postList: {
        fontSize: '14px',
        color: 'rgba(0, 0, 0, 0.9)',
        lineHeight: 1.6,
        paddingLeft: '20px',
        margin: '0 0 8px 0',
    },
    postStats: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '10px 12px',
        borderTop: '1px solid #e0e0e0',
    },
    postStat: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        color: 'rgba(0, 0, 0, 0.6)',
    },
    aiAssistant: {
        marginTop: '12px',
        padding: '12px',
        background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.08) 0%, rgba(91, 125, 255, 0.08) 100%)',
        borderRadius: '8px',
        border: '1px solid rgba(105, 63, 233, 0.2)',
    },
    aiHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '10px',
    },
    aiIcon: {
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #693fe9 0%, #5b7dff 100%)',
        borderRadius: '6px',
        color: '#ffffff',
    },
    aiTitle: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#333',
        flex: 1,
    },
    aiStatus: {
        fontSize: '11px',
        color: '#693fe9',
        fontWeight: 500,
        animation: 'pulse 1.5s ease-in-out infinite',
    },
    aiSuggestions: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
    },
    suggestionChip: {
        padding: '4px 10px',
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        fontSize: '11px',
        color: '#666',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    commentPost: {
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        padding: '12px',
        marginBottom: '12px',
    },
    commentWidget: {
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        padding: '16px',
    },
    widgetHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
    },
    widgetIcon: {
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
        borderRadius: '8px',
        color: '#ffffff',
    },
    widgetTitle: {
        fontSize: '15px',
        fontWeight: 600,
        color: '#333',
    },
    generateButton: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '14px 20px',
        background: 'linear-gradient(135deg, #693fe9 0%, #5b7dff 100%)',
        border: 'none',
        borderRadius: '8px',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    spinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: '#ffffff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    generatedComment: {
        background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.06) 0%, rgba(91, 125, 255, 0.06) 100%)',
        borderRadius: '8px',
        padding: '14px',
        marginBottom: '12px',
    },
    commentText: {
        fontSize: '14px',
        color: '#333',
        lineHeight: 1.6,
        margin: '0 0 12px 0',
    },
    commentActions: {
        display: 'flex',
        gap: '8px',
    },
    copyButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        color: '#666',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
    },
    postButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        background: '#0a66c2',
        border: 'none',
        borderRadius: '6px',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
    },
    toneSelector: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        paddingTop: '12px',
        borderTop: '1px solid #e9ecef',
    },
    toneLabel: {
        fontSize: '12px',
        color: '#666',
        fontWeight: 500,
    },
    toneOptions: {
        display: 'flex',
        gap: '6px',
    },
    toneOption: {
        padding: '4px 10px',
        background: '#f5f5f5',
        borderRadius: '12px',
        fontSize: '11px',
        color: '#666',
    },
    toneOptionActive: {
        background: 'linear-gradient(135deg, #693fe9 0%, #5b7dff 100%)',
        color: '#ffffff',
    },
    analyticsDashboard: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
    },
    statCard: {
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '12px',
        textAlign: 'center',
    },
    statValue: {
        display: 'block',
        fontSize: '20px',
        fontWeight: 700,
        color: '#693fe9',
    },
    statLabel: {
        display: 'block',
        fontSize: '11px',
        color: '#666',
        marginBottom: '4px',
    },
    statChange: {
        display: 'block',
        fontSize: '10px',
        color: '#059669',
        fontWeight: 500,
    },
    chartContainer: {
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '12px',
    },
    chartHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
    },
    chartTitle: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#333',
    },
    chartLegend: {
        display: 'flex',
        gap: '12px',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        color: '#666',
    },
    legendDot: {
        width: '8px',
        height: '8px',
        background: '#693fe9',
        borderRadius: '2px',
    },
    chart: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '60px',
        gap: '4px',
    },
    chartBar: {
        flex: 1,
        background: 'linear-gradient(180deg, #693fe9 0%, #5b7dff 100%)',
        borderRadius: '2px 2px 0 0',
        animation: 'growBar 0.5s ease-out both',
    },
    automationStatus: {
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '12px',
    },
    statusHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    statusTitle: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#333',
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        background: 'rgba(5, 150, 105, 0.1)',
        borderRadius: '12px',
        fontSize: '11px',
        color: '#059669',
        fontWeight: 500,
    },
    statusDot: {
        width: '6px',
        height: '6px',
        background: '#059669',
        borderRadius: '50%',
        animation: 'pulse 1.5s ease-in-out infinite',
    },
    automationList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    automationItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: '#666',
    },
    features: {
        marginBottom: '24px',
    },
    featureItem: {
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '16px',
        padding: '14px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
    },
    featureItemActive: {
        background: 'rgba(255, 255, 255, 0.15)',
        transform: 'translateX(8px)',
    },
    featureIcon: {
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '10px',
        marginRight: '14px',
        flexShrink: 0,
        color: '#ffffff',
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: '15px',
        fontWeight: 600,
        color: '#ffffff',
        margin: '0 0 4px 0',
    },
    featureDescription: {
        fontSize: '13px',
        color: 'rgba(255, 255, 255, 0.75)',
        margin: 0,
        lineHeight: 1.4,
    },
    socialProof: {
        textAlign: 'center',
    },
    socialProofAvatars: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '10px',
    },
    avatar: {
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #693fe9 0%, #5835c7 100%)',
        border: '3px solid #ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: 600,
        marginLeft: '-10px',
    },
    avatarPlus: {
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.2)',
        border: '3px solid #ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 600,
        marginLeft: '-10px',
    },
    socialProofText: {
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.9)',
        margin: 0,
        fontWeight: 500,
    },
    decorativeOrb1: {
        position: 'absolute',
        top: '8%',
        left: '8%',
        width: '280px',
        height: '280px',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite',
    },
    decorativeOrb2: {
        position: 'absolute',
        bottom: '12%',
        right: '12%',
        width: '350px',
        height: '350px',
        background: 'rgba(245, 158, 11, 0.08)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'float 10s ease-in-out infinite reverse',
    },
    decorativeOrb3: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '450px',
        height: '450px',
        background: 'rgba(91, 125, 255, 0.05)',
        borderRadius: '50%',
        filter: 'blur(100px)',
    },
    floatingIcon1: {
        position: 'absolute',
        top: '20%',
        right: '20%',
        animation: 'float 6s ease-in-out infinite',
    },
    floatingIcon2: {
        position: 'absolute',
        bottom: '25%',
        left: '15%',
        animation: 'float 7s ease-in-out infinite reverse',
    },
};

// Add keyframes via style tag
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes fadeSlideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes float {
            0%, 100% {
                transform: translateY(0) scale(1);
            }
            50% {
                transform: translateY(-20px) scale(1.05);
            }
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }

        @keyframes growBar {
            from {
                transform: scaleY(0);
            }
            to {
                transform: scaleY(1);
            }
        }

        @media (max-width: 1024px) {
            .auth-layout-left {
                width: 45% !important;
            }
            .auth-layout-right {
                width: 55% !important;
            }
        }

        @media (max-width: 768px) {
            .auth-layout-container {
                flex-direction: column !important;
            }
            .auth-layout-left,
            .auth-layout-right {
                width: 100% !important;
            }
            .auth-layout-right {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(styleSheet);
}
