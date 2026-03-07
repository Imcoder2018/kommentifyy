'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardTab, WriterTab, AutomationTab, NetworkTab, ImportTab, AnalyticsTab, LimitsTab, SettingsTab } from './components/tabs';
import WhatsAppButton from './components/WhatsAppButton';
import Footer from './components/Footer';
import MonthlyPlans from './components/MonthlyPlans';
import LifetimeDeals from './components/LifetimeDeals';
import './components/tabs/extension-preview.css';

// SVG Icon Components for Website
const IconFire = ({ size = 16, color = '#f59e0b' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
        <path d="M12 23c-3.866 0-7-2.686-7-6 0-2.5 1.5-4.5 3-6 .5 2.5 2 3 2 3s-1-3 1-6c0 0 3 1 4 4 .5-1 1-2 1-2s2.5 3.5 2.5 7c0 3.314-2.634 6-6.5 6z"/>
    </svg>
);

const IconRocket = ({ size = 16, color = '#693fe9' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
);

const IconCreditCard = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2"/>
        <line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
);

const IconClock = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
    </svg>
);

const IconX = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
);

const IconChart = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
    </svg>
);

const IconEdit = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    </svg>
);

const IconBot = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
    </svg>
);

const IconUsers = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

const IconPlug = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>
    </svg>
);

const IconSettings = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </svg>
);

const IconMessage = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
);

const IconSearch = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
);

const IconHandshake = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88"/><path d="m16 16 2 2"/><path d="M4 6h16v10H4V6z"/>
    </svg>
);

const IconDownload = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
    </svg>
);

const IconShield = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
);

const IconCrown = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
    </svg>
);

const IconBrandWhatsapp = ({ size = 16, color = '#25D366', style }: { size?: number; color?: string; style?: React.CSSProperties }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" style={style}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);

const IconCalendar = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
    </svg>
);

const IconAlert = ({ size = 16, color = '#ef4444' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
);

const IconStar = ({ size = 16, color = '#f59e0b' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
);

const IconCheck = ({ size = 16, color = '#10b981' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5"/>
    </svg>
);

const IconBan = ({ size = 16, color = '#ef4444' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>
    </svg>
);

const IconTarget = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
);

const IconZap = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
);

const IconDatabase = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>
    </svg>
);

const IconUser = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);

const IconBrain = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
);

const IconUpload = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
    </svg>
);

const IconSliders = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/>
    </svg>
);

const IconActivity = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
);

const IconSparkles = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
);

const IconArrowRight = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
);

const IconMenu = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
    </svg>
);

interface Plan {
    id: string;
    name: string;
    price: number;
    period: 'monthly' | 'annual' | 'lifetime';
    isLifetime: boolean;
    isTrialPlan: boolean;
    isDefaultFreePlan: boolean;
    trialDurationDays: number;
    lifetimeMaxSpots: number;
    lifetimeSoldSpots: number;
    lifetimeSpotsRemaining: number | null;
    lifetimeExpiresAt: string | null;
    stripeLink: string;
    stripeYearlyLink?: string | null;
    displayOrder: number;
    limits: {
        monthlyComments: number;
        monthlyLikes: number;
        monthlyShares: number;
        monthlyFollows: number;
        monthlyConnections: number;
        aiPostsPerMonth: number;
        aiCommentsPerMonth: number;
        aiTopicLinesPerMonth: number;
    };
    monthlyImportCredits: number;
    features: {
        autoLike: boolean;
        autoComment: boolean;
        autoFollow: boolean;
        aiContent: boolean;
        aiTopicLines: boolean;
        scheduling: boolean;
        automationScheduling: boolean;
        networkScheduling: boolean;
        analytics: boolean;
        importProfiles: boolean;
    };
}

// Screenshot paths for each tab (check if exists)
const TAB_SCREENSHOTS: { [key: string]: string } = {
    dashboard: '/extension-screenshots/dashboard/screenshot.png',
    writer: '/extension-screenshots/writer/screenshot.png',
    automation: '/extension-screenshots/automation/screenshot.png',
    network: '/extension-screenshots/network/screenshot.png',
    import: '/extension-screenshots/import/screenshot.png',
    analytics: '/extension-screenshots/analytics/screenshot.png',
    limits: '/extension-screenshots/limits/screenshot.png',
    settings: '/extension-screenshots/settings/screenshot.png',
};

// Extension Preview Component - Responsive
function ExtensionPreview() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showTabHint, setShowTabHint] = useState(true);
    const [screenshotExists, setScreenshotExists] = useState<{ [key: string]: boolean }>({});
    
    const tabs = ['Dashboard', 'Writer', 'Automation', 'Network', 'Import', 'Analytics', 'Limits', 'Settings'];
    
    const primaryGradient = 'linear-gradient(135deg, #693fe9 0%, #7c4dff 100%)';

    // Check which screenshots exist on mount
    useEffect(() => {
        const checkScreenshots = async () => {
            const results: { [key: string]: boolean } = {};
            for (const [tab, path] of Object.entries(TAB_SCREENSHOTS)) {
                try {
                    const res = await fetch(path, { method: 'HEAD' });
                    results[tab] = res.ok;
                } catch {
                    results[tab] = false;
                }
            }
            setScreenshotExists(results);
        };
        checkScreenshots();
    }, []);

    const renderContent = () => {
        // If screenshot exists for this tab, show it
        if (screenshotExists[activeTab]) {
            return (
                <div style={{ width: '100%', position: 'relative' }}>
                    <Image
                        src={TAB_SCREENSHOTS[activeTab]}
                        alt={`${activeTab} tab screenshot`}
                        width={580}
                        height={450}
                        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                        priority
                    />
                </div>
            );
        }
        
        // Otherwise render the component
        switch(activeTab) {
            case 'dashboard':
                return <div className="extension-tab-content"><DashboardTab /></div>;
            case 'writer':
                return <div className="extension-tab-content"><WriterTab /></div>;
            case 'automation':
                return <div className="extension-tab-content"><AutomationTab /></div>;
            case 'network':
                return <div className="extension-tab-content"><NetworkTab /></div>;
            case 'import':
                return <div className="extension-tab-content"><ImportTab /></div>;
            case 'analytics':
                return <div className="extension-tab-content"><AnalyticsTab /></div>;
            case 'limits':
                return <div className="extension-tab-content"><LimitsTab /></div>;
            case 'settings':
                return <div className="extension-tab-content"><SettingsTab /></div>;
            default:
                return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Select a tab</div>;
        }
    };
    
    const handleTabClick = (tab: string) => {
        setActiveTab(tab.toLowerCase());
        setShowTabHint(false);
    };

    return (
        <div className="extension-preview" style={{ 
            width: '100%',
            maxWidth: '580px', 
            background: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 25px 80px rgba(0,0,0,0.4)', 
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
            position: 'relative'
        }}>
            {/* Extension Header - Modern Design */}
            <div style={{ 
                background: primaryGradient, 
                padding: '14px 16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderRadius: '14px',
                margin: '12px',
                boxShadow: '0 8px 24px rgba(105, 63, 233, 0.35)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/favicon.png" alt="Kommentify" style={{ width: '36px', height: '36px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }} />
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>Kommentify</div>
                        <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase' }}>AI-Powered LinkedIn Suite</div>
                    </div>
                </div>
                <div style={{ padding: '5px 12px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '20px', fontSize: '10px', fontWeight: '600', color: '#ffffff', backdropFilter: 'blur(10px)' }}>
                    <span style={{ opacity: 0.8, marginRight: '4px' }}>Plan:</span>Starters
                </div>
            </div>
            
            {/* Tabs - Scrollable on mobile with Highlight Hint */}
            <div style={{ position: 'relative' }}>
                {/* Tab Hint Popup */}
                {showTabHint && (
                    <div style={{
                        position: 'absolute',
                        top: '-45px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.5)',
                        zIndex: 10,
                        animation: 'pulse 2s infinite'
                    }}>
                        👆 Click tabs to explore all features!
                        <div style={{
                            position: 'absolute',
                            bottom: '-6px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '6px solid #d97706'
                        }}></div>
                    </div>
                )}
                
                {/* Tabs Container with Highlight Border */}
                <div style={{ 
                    display: 'flex', 
                    gap: '3px', 
                    padding: '6px 10px', 
                    background: showTabHint ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))' : '#ffffff', 
                    borderBottom: '1px solid #e2e8f0', 
                    overflowX: 'auto', 
                    WebkitOverflowScrolling: 'touch',
                    border: showTabHint ? '2px solid rgba(245, 158, 11, 0.5)' : 'none',
                    borderRadius: showTabHint ? '8px' : '0',
                    margin: showTabHint ? '0 8px 0 8px' : '0',
                    transition: 'all 0.3s ease'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabClick(tab)}
                            style={{
                                flex: '0 0 auto',
                                padding: '8px 10px',
                                fontSize: '10px',
                                fontWeight: '600',
                                background: activeTab === tab.toLowerCase() ? primaryGradient : 'transparent',
                                color: activeTab === tab.toLowerCase() ? 'white' : '#64748B',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                                boxShadow: activeTab === tab.toLowerCase() ? '0 4px 12px rgba(105, 63, 233, 0.35)' : 'none',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Tab Content */}
            <div style={{ minHeight: '350px', maxHeight: '450px', overflowY: 'auto' }}>
                {renderContent()}
            </div>
            
            {/* CSS Animation for pulse */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: translateX(-50%) scale(1); }
                    50% { transform: translateX(-50%) scale(1.05); }
                }
            `}</style>
        </div>
    );
}

export default function LandingPageWrapper() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a' }} />}>
            <LandingPage />
        </Suspense>
    );
}

function LandingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Capture referral code from URL (e.g. /?ref=CODE) and persist in localStorage
    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            localStorage.setItem('referralCode', ref);
        }
    }, [searchParams]);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [lifetimeDeals, setLifetimeDeals] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalLifetimeSpots, setTotalLifetimeSpots] = useState(200);
    const [soldLifetimeSpots, setSoldLifetimeSpots] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [aiCommentsPerDollar, setAiCommentsPerDollar] = useState(100);
    
    // Yearly discount tiers: 18.17% for Starter, 24.24% for Growth, 33.64% for Pro+
    const getYearlyDiscount = (paidPlanIndex: number) => {
        if (paidPlanIndex === 0) return 0.1817; // 18.17% off (Starter)
        if (paidPlanIndex === 1) return 0.2424; // 24.24% off (Growth)
        return 0.3364; // 33.64% off for Pro and beyond
    };

    // No auto-redirect - logged-in users can browse the landing page freely
    // Just check if they're logged in to show Dashboard button in nav
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            fetch('/api/auth/validate', { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => { if (data.success) setIsLoggedIn(true); })
                .catch(() => {});
        }
    }, []);

    useEffect(() => {
        fetch('/api/plans')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Filter regular plans - exclude plans with lifetime/life time in name or isLifetime flag
                    const allPlans = data.plans || [];
                    const isLifetimePlan = (p: Plan) => {
                        const nameLower = p.name.toLowerCase();
                        return p.isLifetime || nameLower.includes('lifetime') || nameLower.includes('life time');
                    };
                    const regularPlans = allPlans.filter((p: Plan) => !isLifetimePlan(p));
                    setPlans(regularPlans);
                    
                    // Combine API lifetime deals with any plans containing 'lifetime' or 'life time' in name
                    const apiLifetimeDeals = data.lifetimeDeals || [];
                    const nameBasedLifetimeDeals = allPlans.filter((p: Plan) => isLifetimePlan(p));
                    const allLifetimeDeals = [...apiLifetimeDeals, ...nameBasedLifetimeDeals.filter((p: Plan) => !apiLifetimeDeals.find((d: Plan) => d.id === p.id))];
                    setLifetimeDeals(allLifetimeDeals);
                    
                    const totalSpots = allLifetimeDeals.reduce((sum: number, p: Plan) => sum + (p.lifetimeMaxSpots || 100), 0);
                    const soldSpots = allLifetimeDeals.reduce((sum: number, p: Plan) => sum + (p.lifetimeSoldSpots || 0), 0);
                    setTotalLifetimeSpots(totalSpots || 200);
                    setSoldLifetimeSpots(soldSpots);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // Fetch settings for AI comments per dollar
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAiCommentsPerDollar(data.settings.aiCommentsPerDollar || 100);
                }
            })
            .catch(() => console.log('Failed to fetch settings'));
    }, []);

    // Load Cal.com embed script
    useEffect(() => {
        // Initialize Cal.com using the official pattern
        (function (C: any, A: string, L: string) {
            let p = function (a: any, ar: any) { (a.q as any[]).push(ar); };
            let d = C.document;
            C.Cal = C.Cal || function () {
                let cal = C.Cal;
                let ar = arguments;
                if (!cal.loaded) {
                    cal.ns = {};
                    cal.q = cal.q || [];
                    d.head.appendChild(d.createElement("script")).src = A;
                    cal.loaded = true;
                }
                if (ar[0] === L) {
                    const api = function () { p(api, arguments); };
                    const namespace = ar[1];
                    (api as any).q = (api as any).q || [];
                    if (typeof namespace === "string") {
                        cal.ns[namespace] = cal.ns[namespace] || api;
                        p(cal.ns[namespace], ar);
                        p(cal, ["initNamespace", namespace]);
                    } else p(cal, ar);
                    return;
                }
                p(cal, ar);
            };
        })(window, "https://app.cal.com/embed/embed.js", "init");

        // Initialize Cal.com widget
        if (window.Cal) {
            window.Cal("init", "15min", { origin: "https://app.cal.com" });

            if (window.Cal.ns && window.Cal.ns["15min"]) {
                window.Cal.ns["15min"]("inline", {
                    elementOrSelector: "#my-cal-inline-15min",
                    config: { layout: "month_view" },
                    calLink: "ar-webcrafts/15min",
                });

                window.Cal.ns["15min"]("ui", { hideEventTypeDetails: false, layout: "month_view" });
            }
        }
    }, []);

    // Helper to format large numbers - show actual numbers, not K
    const formatNumber = (num: number) => {
        if (num >= 100000) return 'Unlimited';
        return num.toLocaleString(); // Shows 1000 as "1,000" etc.
    };

    return (
        <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0a0a', color: 'white' }}>
            {/* Launch Week Banner - Fixed at top */}
            <div className="lifetime-deal-banner" style={{
                background: 'linear-gradient(90deg, #dc2626, #ea580c, #dc2626)',
                padding: '12px 20px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    animation: 'shimmer 2s infinite'
                }}></div>
                <a href="/plans" target="_blank" rel="noopener noreferrer" style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    position: 'relative',
                    zIndex: 1,
                    textDecoration: 'none',
                    transition: 'transform 0.2s ease'
                }}>
                    🔥 LIFETIME DEAL AVAILABLE — <span style={{ background: 'rgba(245, 158, 11, 0.3)', padding: '2px 10px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.5)' }}>Pay Once, Use Forever</span> — Use code <span style={{ background: 'rgba(34, 197, 94, 0.3)', padding: '2px 10px', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.5)', fontWeight: '800' }}>Kommentify</span> for 30% OFF
                </a>
            </div>

            {/* CSS for responsive styles */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @media (max-width: 968px) {
                    .desktop-nav { display: none !important; }
                    .mobile-menu-btn { display: flex !important; }
                    .hero-title { font-size: 36px !important; }
                    .hero-subtitle { font-size: 16px !important; }
                    .section-title { font-size: 28px !important; }
                    .section-padding { padding: 60px 20px !important; }
                    .nav-padding { padding: 12px 20px !important; }
                    .grid-2-col { grid-template-columns: 1fr !important; }
                    .grid-3-col { grid-template-columns: 1fr !important; }
                    .grid-4-col { grid-template-columns: 1fr !important; }
                    .pricing-grid { grid-template-columns: 1fr !important; }
                    .feature-grid { grid-template-columns: 1fr !important; }
                    .cta-buttons { flex-direction: column !important; }
                    .cta-buttons a { width: 100% !important; justify-content: center !important; }
                    .trust-badges { flex-direction: column !important; gap: 12px !important; align-items: center !important; }
                    .comparison-table { overflow-x: auto !important; }
                    .comparison-table table { min-width: 800px !important; }
                    .extension-preview-section { display: none !important; }
                    .footer-content { flex-direction: column !important; gap: 24px !important; text-align: center !important; }
                    .footer-links { justify-content: center !important; }
                    .lifetime-deal-banner { flex-direction: column !important; gap: 4px !important; padding: 10px 16px !important; }
                    .lifetime-deal-banner a { font-size: 12px !important; flex-direction: column !important; gap: 4px !important; text-align: center !important; }
                    .lifetime-deal-banner span { display: inline-block !important; }
                }
                @media (max-width: 480px) {
                    .lifetime-deal-banner { padding: 8px 12px !important; }
                    .lifetime-deal-banner a { font-size: 11px !important; white-space: normal !important; line-height: 1.4 !important; }
                }
                @media (max-width: 640px) {
                    .hero-title { font-size: 28px !important; letter-spacing: -1px !important; }
                    .section-title { font-size: 24px !important; }
                    .pricing-card { padding: 24px !important; }
                }
                .mobile-menu {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(10, 10, 10, 0.98);
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    padding: 20px;
                    animation: slideIn 0.3s ease;
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes goldenPulse {
                    0%, 100% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.3), inset 0 0 60px rgba(245, 158, 11, 0.05); }
                    50% { box-shadow: 0 0 50px rgba(245, 158, 11, 0.5), inset 0 0 80px rgba(245, 158, 11, 0.08); }
                }
                @keyframes shimmerGold {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .golden-highlight-box:hover {
                    transform: scale(1.02);
                    transition: transform 0.3s ease;
                }
            `}</style>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="mobile-menu">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src="/favicon.png" alt="Kommentify" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                            Kommentify
                        </div>
                        <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                            <IconX size={24} color="white" />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <Link href="/features" onClick={() => setMobileMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '18px', fontWeight: '500', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Features</Link>
                        <Link href="#why-kommentify" onClick={() => setMobileMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '18px', fontWeight: '500', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Why Kommentify</Link>
                        <Link href="/plans" onClick={() => setMobileMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '18px', fontWeight: '500', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Pricing</Link>
                        <Link href="/blog" onClick={() => setMobileMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '18px', fontWeight: '500', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Blog</Link>
                        <Link href="/lifetime-deal" onClick={() => setMobileMenuOpen(false)} style={{ color: '#f59e0b', textDecoration: 'none', fontSize: '18px', fontWeight: '600', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}><IconFire size={18} /> Lifetime Deal</Link>
                        <Link href="#comparison" onClick={() => setMobileMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '18px', fontWeight: '500', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Compare</Link>
                        <Link href="#faq" onClick={() => setMobileMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '18px', fontWeight: '500', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>FAQ</Link>
                        {isLoggedIn ? (
                            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ color: '#a78bfa', textDecoration: 'none', fontSize: '18px', fontWeight: '600', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>🚀 Dashboard</Link>
                        ) : (
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '18px', fontWeight: '500', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Login</Link>
                        )}
                        <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} style={{
                            marginTop: '20px',
                            padding: '16px 24px',
                            background: 'white',
                            color: '#0a0a0a',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            textAlign: 'center'
                        }}>
                            🌐 Add to Chrome →
                        </a>
                    </div>
                </div>
            )}

            {/* Dark Navbar */}
            <nav className="nav-padding" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 60px',
                background: 'rgba(10, 10, 10, 0.95)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/favicon.png" alt="Kommentify" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                    Kommentify
                </div>
                
                {/* Mobile Menu Button */}
                <button 
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(true)} 
                    style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                >
                    <IconMenu size={24} color="white" />
                </button>

                {/* Desktop Navigation */}
                <div className="desktop-nav" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
                    <Link href="/features" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Features</Link>
                    <Link href="#why-kommentify" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Why Us</Link>
                    <Link href="/plans" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Pricing</Link>
                    <Link href="/blog" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Blog</Link>
                    <Link href="/lifetime-deal" style={{ color: '#f59e0b', textDecoration: 'none', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><IconFire size={14} /> Lifetime Deal</Link>
                    <Link href="#comparison" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Compare</Link>
                    <Link href="#faq" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>FAQ</Link>
                    {isLoggedIn ? (
                        <Link href="/dashboard" style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 15px rgba(105,63,233,0.4)'
                        }}>
                            Dashboard <span>→</span>
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Login</Link>
                            <Link href="/signup" style={{
                                padding: '10px 20px',
                                background: 'white',
                                color: '#0a0a0a',
                                textDecoration: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                Get Started <span>→</span>
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section - Dark Theme */}
            <header className="section-padding" style={{
                background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
                padding: '80px 60px 100px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Gradient Orbs */}
                <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(105, 63, 233, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
                <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
                
                <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    {/* Centered Hero Content */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-block', background: 'rgba(105, 63, 233, 0.1)', border: '1px solid rgba(105, 63, 233, 0.3)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', marginBottom: '24px', color: '#693fe9' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconRocket size={14} color="#693fe9" /> No API · No Account Connection · 100% Browser-Based</span>
                        </div>
                        
                        <h1 className="hero-title" style={{ fontSize: '52px', fontWeight: '800', lineHeight: '1.15', marginBottom: '24px', letterSpacing: '-1.5px' }}>
                            Automate Your LinkedIn Growth<br/>
                            <span style={{ color: '#693fe9' }}>With Human-Like Precision</span>
                        </h1>
                        
                        <p className="hero-subtitle" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 20px' }}>
                            Grow faster, engage smarter, and build your personal brand — all on autopilot.
                            Create posts, comment intelligently, connect with the right people, and boost your reach with AI-powered, human-behavior automation.
                        </p>
                        
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
                            <strong style={{ color: '#10b981' }}>Just install the extension, set limits, and let the agent work.</strong>
                        </p>
                        
                        {/* Video Below Content - Full Width */}
                        <div style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto' }}>
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 30px 100px rgba(0,0,0,0.5)'
                            }}>
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                                    <iframe
                                        src="https://www.loom.com/embed/0f5fd7b490e840609f8e32cef8a0e602?sid=auto&hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true"
                                        frameBorder="0"
                                        allowFullScreen
                                        loading="eager"
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '20px'
                                        }}
                                    />
                                </div>
                            </div>
                            {/* Watch Demo Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '-12px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'linear-gradient(135deg, #693fe9, #7c4dff)',
                                padding: '8px 20px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: 'white',
                                boxShadow: '0 4px 15px rgba(105, 63, 233, 0.4)'
                            }}>
                                ▶ Watch Demo
                            </div>
                        </div>

                        {/* Star Rating with Chrome Store Link - Below Video */}
                        <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '32px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#fbbf24', fontSize: '18px' }}>★</span>)}
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Rated 5.0 on Chrome Web Store · 500+ Users</span>
                            </div>
                        </a>

                        {/* CTA Buttons - Below Video */}
                        <div className="cta-buttons" style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Link href="/signup" style={{
                                padding: '16px 32px',
                                background: 'white',
                                color: '#0a0a0a',
                                textDecoration: 'none',
                                borderRadius: '10px',
                                fontSize: '16px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 20px rgba(255,255,255,0.2)'
                            }}>
                                🚀 Start Free Forever <span>→</span>
                            </Link>
                            <a href="/plans" style={{
                                padding: '16px 32px',
                                background: 'transparent',
                                border: '2px solid rgba(255,255,255,0.3)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '10px',
                                fontSize: '16px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                View Pricing
                            </a>
                        </div>

                        {/* Trust Badges - Below Video */}
                        <div className="trust-badges" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '50px' }}>
                            {[
                                { icon: <IconShield size={13} color="#10b981" />, text: '500+ Chrome Users' },
                                { icon: <IconShield size={13} color="#10b981" />, text: 'Browser-based = LinkedIn-safe' },
                                { icon: <IconShield size={13} color="#10b981" />, text: 'Your data stays in your browser' },
                                { icon: <IconX size={13} color="rgba(255,255,255,0.5)" />, text: 'Cancel anytime' }
                            ].map((badge, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                    <span>{badge.icon}</span> {badge.text}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Scroll indicator */}
                    <div style={{ marginTop: '50px', color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center' }}>
                        Scroll to explore ↓
                    </div>
                </div>
            </header>

            {/* Live Extension Preview Section */}
            <section id="demo" className="section-padding extension-preview-section" style={{ background: '#0a0a0a', padding: '80px 60px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'inline-block', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '6px 14px', borderRadius: '16px', fontSize: '12px', marginBottom: '20px', color: '#818cf8' }}>
                                Live Preview · Interactive Demo
                            </div>
                            <h2 className="section-title" style={{ fontSize: '38px', fontWeight: '700', marginBottom: '20px', lineHeight: '1.2' }}>
                                See the Extension<br/>
                                <span style={{ color: '#693fe9' }}>In Action</span>
                            </h2>
                            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '30px', lineHeight: '1.7' }}>
                                Try our live interactive preview. Click through tabs, explore features, and see exactly how Kommentify helps you grow on LinkedIn.
                            </p>
                            
                            {/* Feature Cards */}
                            <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {[
                                    { icon: <IconChart size={22} color="#693fe9" />, title: 'Dashboard', desc: 'Track all your activity' },
                                    { icon: <IconEdit size={22} color="#693fe9" />, title: 'AI Writer', desc: 'Generate viral posts' },
                                    { icon: <IconBot size={22} color="#693fe9" />, title: 'Automation', desc: 'Set it and forget it' },
                                    { icon: <IconUpload size={22} color="#693fe9" />, title: 'Import', desc: 'Import leads & engage' },
                                ].map((f, i) => (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px', borderRadius: '10px' }}>
                                        <div style={{ marginBottom: '6px' }}>{f.icon}</div>
                                        <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '14px' }}>{f.title}</div>
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{f.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Extension Preview */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <ExtensionPreview />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Kommentify Section */}
            <section id="why-kommentify" className="section-padding" style={{ background: '#111111', padding: '80px 60px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <div style={{ display: 'inline-block', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '6px 14px', borderRadius: '16px', fontSize: '12px', marginBottom: '20px', color: '#f59e0b' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconZap size={14} color="#f59e0b" /> The Problem We Solve</span>
                        </div>
                        <h2 className="section-title" style={{ fontSize: '38px', fontWeight: '700', marginBottom: '20px' }}>
                            Why <span style={{ color: '#693fe9' }}>Kommentify</span>?
                        </h2>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', marginBottom: '40px' }}>
                        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', marginBottom: '24px', textAlign: 'center' }}>
                            People spend <strong style={{ color: '#f59e0b' }}>3–5 hours daily</strong> on LinkedIn trying to:
                        </p>
                        <div className="grid-3-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            {['Write posts', 'Comment to stay visible', 'Find leads', 'Send connection requests', 'Engage with profiles', 'Maintain consistency'].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(105, 63, 233, 0.1)', borderRadius: '8px' }}>
                                    <IconCheck size={16} color="#693fe9" />
                                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: '24px' }}>
                            But life gets busy. Consistency breaks. And LinkedIn growth dies.
                        </p>
                        <div style={{ textAlign: 'center', padding: '24px', background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.2), rgba(99, 102, 241, 0.1))', borderRadius: '12px', border: '1px solid rgba(105, 63, 233, 0.3)' }}>
                            <p style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
                                <span style={{ color: '#693fe9' }}>Kommentify</span> fixes this.
                            </p>
                            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>
                                You set it once. It works forever — <strong>safely, silently, and human-like.</strong>
                            </p>
                        </div>
                    </div>

                    {/* Key Benefits */}
                    <div className="grid-3-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {[
                            { icon: <IconShield size={28} color="#10b981" />, title: 'Safe & Undetectable', desc: 'Human-like delays, random patterns, natural behavior simulation' },
                            { icon: <IconClock size={28} color="#693fe9" />, title: 'Save 20+ Hours/Week', desc: 'Automate repetitive tasks while you focus on high-value work' },
                            { icon: <IconRocket size={28} color="#f59e0b" />, title: '10x Your Growth', desc: 'Consistent engagement builds authority and attracts opportunities' }
                        ].map((benefit, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                                <div style={{ marginBottom: '12px' }}>{benefit.icon}</div>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{benefit.title}</h3>
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works - Dark Theme */}
            <section id="how-it-works" className="how-it-works-section" style={{ background: '#0a0a0a', padding: '100px 60px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <div style={{ display: 'inline-block', background: 'rgba(105, 63, 233, 0.1)', border: '1px solid rgba(105, 63, 233, 0.3)', padding: '6px 14px', borderRadius: '16px', fontSize: '12px', marginBottom: '20px', color: '#693fe9' }}>
                            Simple Setup · Powerful Results
                        </div>
                        <h2 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }}>
                            How Kommentify<br/>
                            <span style={{ color: '#693fe9' }}>Works For You</span>
                        </h2>
                        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto' }}>
                            Get started in minutes with our simple 3-step process.
                        </p>
                    </div>
                    
                    <div className="how-it-works-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                        {[
                            { step: '1', icon: <IconPlug size={32} color="#693fe9" />, title: 'Install Extension', desc: 'Add our Chrome extension in 30 seconds. No API keys, no complex setup. Just install and go.', gradient: 'linear-gradient(135deg, #693fe9, #8b5cf6)' },
                            { step: '2', icon: <IconSettings size={32} color="#f59e0b" />, title: 'Configure Settings', desc: 'Set your target keywords, engagement limits, and automation preferences. Our AI learns your style.', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
                            { step: '3', icon: <IconRocket size={32} color="#22c55e" />, title: 'Watch Growth Happen', desc: 'Sit back as Kommentify engages, comments, connects, and grows your network on autopilot.', gradient: 'linear-gradient(135deg, #22c55e, #10b981)' }
                        ].map((item, i) => (
                            <div key={i} className="how-it-works-step" style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.08)', 
                                borderRadius: '20px', 
                                padding: '32px 28px', 
                                textAlign: 'center',
                                position: 'relative',
                                transition: 'transform 0.3s, border-color 0.3s'
                            }}>
                                {/* Step Badge */}
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '-16px', 
                                    left: '50%', 
                                    transform: 'translateX(-50%)',
                                    background: item.gradient,
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    color: 'white',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                }}>
                                    {item.step}
                                </div>
                                
                                {/* Icon Container */}
                                <div style={{ 
                                    width: '70px', 
                                    height: '70px', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    borderRadius: '16px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    margin: '24px auto 20px auto',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {item.icon}
                                </div>
                                
                                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{item.title}</h3>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: '1.6' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Teaser Section */}
            <section id="features" className="section-padding" style={{ background: '#111111', padding: '80px 60px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)',
                        border: '1px solid rgba(105, 63, 233, 0.3)',
                        borderRadius: '24px',
                        padding: '60px 50px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Background Decoration */}
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(105, 63, 233, 0.2) 0%, transparent 70%)', borderRadius: '50%' }}></div>
                        <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
                        
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                background: 'rgba(105, 63, 233, 0.2)', 
                                border: '1px solid rgba(105, 63, 233, 0.4)', 
                                padding: '8px 18px', 
                                borderRadius: '30px', 
                                fontSize: '13px', 
                                marginBottom: '24px', 
                                color: '#a78bfa' 
                            }}>
                                <IconSparkles size={16} color="#a78bfa" />
                                11 Powerful Features
                            </div>
                            
                            <h2 className="section-title" style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px', lineHeight: '1.2' }}>
                                Discover What Makes<br/>
                                <span style={{ color: '#693fe9' }}>Kommentify Unstoppable</span>
                            </h2>
                            
                            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 20px' }}>
                                AI Post Writer, Smart Comments, Profile Import, Content Planner, Trending Discovery,
                                Human-Like Automation, Analytics, Referrals and more — everything you need to dominate LinkedIn growth.
                            </p>
                            
                            {/* Feature Highlights */}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
                                {['AI Post Writer', 'Manual Import', 'Content Planner', 'Analytics', 'Smart Engagement', 'Safe Automation'].map((f, i) => (
                                    <span key={i} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: f === 'Manual Import' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.08)',
                                        padding: '10px 18px',
                                        borderRadius: '30px',
                                        fontSize: '13px',
                                        color: f === 'Manual Import' ? 'white' : 'rgba(255,255,255,0.8)',
                                        fontWeight: f === 'Manual Import' ? '600' : '400',
                                        boxShadow: f === 'Manual Import' ? '0 4px 15px rgba(245, 158, 11, 0.4)' : 'none'
                                    }}>
                                        <IconCheck size={14} color={f === 'Manual Import' ? 'white' : '#693fe9'} /> {f}
                                    </span>
                                ))}
                            </div>
                            
                            <Link href="/features" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '16px 36px',
                                background: 'linear-gradient(135deg, #693fe9, #8b5cf6)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                boxShadow: '0 8px 30px rgba(105, 63, 233, 0.4)',
                                transition: 'transform 0.3s, box-shadow 0.3s'
                            }}>
                                Explore All Features <IconArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Stories Section - CAROUSEL */}
            <section id="success-stories" className="section-padding" style={{ background: '#111111', padding: '80px 60px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: '16px', fontSize: '12px', marginBottom: '20px', color: '#10b981' }}>
                            ⭐ Real Results · Verified Chrome Users
                        </div>
                        <h2 className="section-title" style={{ fontSize: '38px', fontWeight: '700', marginBottom: '16px' }}>
                            Success Stories from<br/>
                            <span style={{ color: '#693fe9' }}>Real Kommentify Users</span>
                        </h2>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto' }}>
                            See how professionals are transforming their LinkedIn presence with Kommentify
                        </p>
                    </div>

                    {/* Testimonials Carousel */}
                    <style>{`
                        @keyframes scrollTestimonials {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                        .testimonials-track {
                            display: flex;
                            gap: 24px;
                            animation: scrollTestimonials 40s linear infinite;
                            width: max-content;
                        }
                        .testimonials-track:hover {
                            animation-play-state: paused;
                        }
                        .testimonial-card {
                            flex-shrink: 0;
                            width: 380px;
                            background: rgba(255,255,255,0.03);
                            border: 1px solid rgba(255,255,255,0.08);
                            border-radius: 16px;
                            padding: 28px;
                        }
                    `}</style>
                    <div style={{ overflow: 'hidden', marginBottom: '40px' }}>
                        <div className="testimonials-track">
                            {/* Duplicate testimonials for seamless loop */}
                            {[...Array(2)].map((_, dupIndex) => (
                                <React.Fragment key={dupIndex}>
                                    {/* Review 1 */}
                                    <div className="testimonial-card">
                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>)}</div>
                                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7', marginBottom: '20px', fontStyle: 'italic' }}>&quot;After just 1 week using Kommentify, my post impressions went from 500 to 8,000. The AI comments are so natural that people actually reply to them!&quot;</p>
                                        <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'white' }}>SM</div>
                                                <div><div style={{ fontWeight: '600', fontSize: '14px', color: 'white' }}>Sarah M.</div><div style={{ fontSize: '12px', color: '#10b981' }}>Verified Chrome User</div></div>
                                            </div>
                                        </a>
                                    </div>
                                    {/* Review 2 */}
                                    <div className="testimonial-card" style={{ border: '2px solid #693fe9', background: 'linear-gradient(180deg, rgba(105, 63, 233, 0.1) 0%, rgba(105, 63, 233, 0.03) 100%)' }}>
                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>)}</div>
                                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7', marginBottom: '20px', fontStyle: 'italic' }}>&quot;One month in and Kommentify has completely changed my LinkedIn game. My follower count grew significantly and I&apos;ve closed 2 new clients. Best investment for my business!&quot;</p>
                                        <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'white' }}>JR</div>
                                                <div><div style={{ fontWeight: '600', fontSize: '14px', color: 'white' }}>James R.</div><div style={{ fontSize: '12px', color: '#10b981' }}>Verified Chrome User</div></div>
                                            </div>
                                        </a>
                                    </div>
                                    {/* Review 3 */}
                                    <div className="testimonial-card">
                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>)}</div>
                                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7', marginBottom: '20px', fontStyle: 'italic' }}>&quot;3 months with Kommentify and I&apos;ve become a recognized voice in my industry. The automation feels completely natural and I get inbound leads weekly now!&quot;</p>
                                        <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'white' }}>AK</div>
                                                <div><div style={{ fontWeight: '600', fontSize: '14px', color: 'white' }}>Amanda K.</div><div style={{ fontSize: '12px', color: '#10b981' }}>Verified Chrome User</div></div>
                                            </div>
                                        </a>
                                    </div>
                                    {/* Review 4 */}
                                    <div className="testimonial-card">
                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>)}</div>
                                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7', marginBottom: '20px', fontStyle: 'italic' }}>&quot;I was skeptical at first but Kommentify delivered. The human-like behavior keeps my account safe while growing my network. Worth every penny!&quot;</p>
                                        <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'white' }}>MT</div>
                                                <div><div style={{ fontWeight: '600', fontSize: '14px', color: 'white' }}>Michael T.</div><div style={{ fontSize: '12px', color: '#10b981' }}>Verified Chrome User</div></div>
                                            </div>
                                        </a>
                                    </div>
                                    {/* Review 5 */}
                                    <div className="testimonial-card">
                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>)}</div>
                                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7', marginBottom: '20px', fontStyle: 'italic' }}>&quot;The AI writer saves me hours every week. My posts now get 10x more engagement and the comment automation is brilliant. Highly recommend!&quot;</p>
                                        <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #be185d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'white' }}>LP</div>
                                                <div><div style={{ fontWeight: '600', fontSize: '14px', color: 'white' }}>Lisa P.</div><div style={{ fontSize: '12px', color: '#10b981' }}>Verified Chrome User</div></div>
                                            </div>
                                        </a>
                                    </div>
                                    {/* Review 6 */}
                                    <div className="testimonial-card">
                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>)}</div>
                                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7', marginBottom: '20px', fontStyle: 'italic' }}>&quot;Finally a LinkedIn tool that actually works! The profile import feature is a game-changer for lead generation. Been using it for 2 months now.&quot;</p>
                                        <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'white' }}>DW</div>
                                                <div><div style={{ fontWeight: '600', fontSize: '14px', color: 'white' }}>David W.</div><div style={{ fontSize: '12px', color: '#10b981' }}>Verified Chrome User</div></div>
                                            </div>
                                        </a>
                                    </div>
                                    {/* Review 7 */}
                                    <div className="testimonial-card">
                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>)}</div>
                                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7', marginBottom: '20px', fontStyle: 'italic' }}>&quot;As a consultant, visibility is everything. Kommentify helped me build authority in my niche. The lifetime deal was a no-brainer investment.&quot;</p>
                                        <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'white' }}>RH</div>
                                                <div><div style={{ fontWeight: '600', fontSize: '14px', color: 'white' }}>Rachel H.</div><div style={{ fontSize: '12px', color: '#10b981' }}>Verified Chrome User</div></div>
                                            </div>
                                        </a>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'linear-gradient(135deg, #693fe9, #8b5cf6)', color: 'white', textDecoration: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', boxShadow: '0 4px 20px rgba(105, 63, 233, 0.4)' }}>
                            See All Reviews on Chrome Store <span>→</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Competitor Comparison Table - MOVED BEFORE PRICING */}
            <section id="comparison" className="section-padding" style={{ background: '#0a0a0a', padding: '80px 60px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: '16px', fontSize: '12px', marginBottom: '20px', color: '#10b981' }}>
                            🔎 See The Difference
                        </div>
                        <h2 className="section-title" style={{ fontSize: '38px', fontWeight: '700', marginBottom: '16px' }}>
                            Why Kommentify vs Others:<br/>
                            <span style={{ color: '#693fe9' }}>All-in-One LinkedIn Growth Suite</span>
                        </h2>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', maxWidth: '700px', margin: '0 auto' }}>
                            Other tools focus on outreach. Kommentify gives you content creation + engagement + automation + safety.
                        </p>
                    </div>
                    
                    {/* Why Different Box */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.15), rgba(99, 102, 241, 0.1))', border: '1px solid rgba(105, 63, 233, 0.3)', borderRadius: '16px', padding: '24px 32px', marginBottom: '40px', textAlign: 'center' }}>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', margin: 0 }}>
                            <strong style={{ color: '#693fe9' }}>Why Kommentify is Different:</strong> Unlike cloud-based tools that risk LinkedIn bans, Kommentify runs directly in your browser—making it <strong>safer, faster, and more affordable</strong>. Your data never leaves your device, and the human-like behavior engine keeps your account protected.
                        </p>
                    </div>
                    
                    <div className="comparison-table" style={{ overflowX: 'auto', marginBottom: '40px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(105, 63, 233, 0.1)' }}>
                                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', fontWeight: '600' }}>Feature</th>
                                    <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', fontWeight: '600', background: 'rgba(105, 63, 233, 0.2)', color: '#693fe9' }}>Kommentify</th>
                                    <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>Cloud Tool A</th>
                                    <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>API Tool B</th>
                                    <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>Outreach Tool C</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { feature: 'Lifetime Deal', kommentify: 'From $69', octopus: '❌ None', dripify: '❌ None', alfred: '❌ None' },
                                    { feature: 'Browser-Based (Safer)', kommentify: true, octopus: false, dripify: false, alfred: false },
                                    { feature: 'AI Post Writing + Scheduling', kommentify: true, octopus: false, dripify: false, alfred: false },
                                    { feature: 'AI Comment Generation', kommentify: true, octopus: false, dripify: false, alfred: false },
                                    { feature: 'Smart Comment Automation', kommentify: true, octopus: false, dripify: false, alfred: false },
                                    { feature: 'Profile Import & Auto-Engage', kommentify: true, octopus: false, dripify: false, alfred: false },
                                    { feature: 'Content Planner & Calendar', kommentify: true, octopus: false, dripify: false, alfred: false },
                                    { feature: 'Trending Posts Discovery', kommentify: true, octopus: false, dripify: false, alfred: false },
                                    { feature: 'Inspiration Sources', kommentify: true, octopus: false, dripify: false, alfred: false },
                                    { feature: 'Lead Database & Export', kommentify: true, octopus: false, dripify: false, alfred: false },
                                    { feature: 'Full Analytics Dashboard', kommentify: true, octopus: false, dripify: false, alfred: false },
                                    { feature: 'Referral Program', kommentify: true, octopus: false, dripify: false, alfred: false },
                                    { feature: 'Lifetime Updates Included', kommentify: true, octopus: false, dripify: false, alfred: false },
                                    { feature: '30-Day Money-Back Guarantee', kommentify: true, octopus: false, dripify: false, alfred: false },
                                ].map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '14px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{row.feature}</td>
                                        <td style={{ padding: '14px 16px', textAlign: 'center', background: 'rgba(105, 63, 233, 0.05)' }}>
                                            {typeof row.kommentify === 'boolean' ? (row.kommentify ? <IconCheck size={18} color="#10b981" /> : <IconX size={18} color="#ef4444" />) : <span style={{ fontSize: '13px', fontWeight: '600', color: '#10b981' }}>{row.kommentify}</span>}
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>{typeof row.octopus === 'boolean' ? (row.octopus ? <IconCheck size={18} color="#10b981" /> : <IconX size={18} color="rgba(255,255,255,0.2)" />) : <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{row.octopus}</span>}</td>
                                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>{typeof row.dripify === 'boolean' ? (row.dripify ? <IconCheck size={18} color="#10b981" /> : <IconX size={18} color="rgba(255,255,255,0.2)" />) : <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{row.dripify}</span>}</td>
                                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>{typeof row.alfred === 'boolean' ? (row.alfred ? <IconCheck size={18} color="#10b981" /> : <IconX size={18} color="rgba(255,255,255,0.2)" />) : <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{row.alfred}</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.1))', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>
                            <strong style={{ color: '#f59e0b' }}>🔥 Limited Time:</strong> Get <strong>Lifetime Access</strong> starting at just <strong style={{ color: '#10b981' }}>$69</strong> — Pay once, use forever!
                        </p>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                            <strong style={{ color: '#693fe9' }}>Kommentify</strong> is the only tool that combines <strong>AI content creation + intelligent engagement + full automation + human-like safety</strong> — with lifetime deals no competitor offers.
                        </p>
                        <a href="/plans" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}>
                            🚀 Get Lifetime Access <span>→</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Pricing - Dark Theme - Show ALL Features */}
            <section id="monthly-pricing" className="section-padding" style={{ background: '#0a0a0a', padding: '80px 60px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h2 className="section-title" style={{ fontSize: '38px', fontWeight: '700', textAlign: 'center', marginBottom: '16px' }}>
                        Simple, Transparent Pricing<br/>
                        <span style={{ color: '#693fe9' }}>For Every Business Size</span>
                    </h2>
                    <p style={{ textAlign: 'center', fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
                        Choose the perfect plan for your LinkedIn growth needs with no hidden fees.
                    </p>
                    
                    {/* Pricing Comparison Quick View */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px 24px', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Starter</div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}><span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', marginRight: '4px' }}>$19</span>$9<span style={{ fontSize: '14px', fontWeight: '400' }}>/mo</span></div>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.15), rgba(105, 63, 233, 0.05))', border: '2px solid #693fe9', borderRadius: '12px', padding: '16px 24px', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#a78bfa', marginBottom: '4px' }}>Professional</div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#a78bfa' }}><span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', marginRight: '4px' }}>$59</span>$29<span style={{ fontSize: '14px', fontWeight: '400' }}>/mo</span></div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px 24px', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Agency</div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}><span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', marginRight: '4px' }}>$79</span>$39<span style={{ fontSize: '14px', fontWeight: '400' }}>/mo</span></div>
                        </div>
                    </div>
                    
                    {/* Lifetime Deal Link */}
                    <p style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>
                        Also available: <Link href="/lifetime-deal" style={{ color: '#f59e0b', textDecoration: 'underline', fontWeight: '600' }}>Lifetime deals starting at $69 (limited time)</Link>
                    </p>
                    
                    {/* Pricing Update Note */}
                    <div style={{ maxWidth: '600px', margin: '0 auto 40px', padding: '16px 24px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.05))', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', textAlign: 'center' }}>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: '1.6' }}>
                            <strong style={{ color: '#f59e0b' }}>Lock in your price today:</strong> As we grow and add more features, prices will increase. Sign up now to secure your current rate forever — you'll never pay more, guaranteed.
                        </p>
                    </div>
                    
                    {/* COMMENTED OUT: Yearly toggle - keeping monthly only
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                        <span style={{ fontSize: '14px', color: billingCycle === 'monthly' ? 'white' : 'rgba(255,255,255,0.5)', fontWeight: billingCycle === 'monthly' ? '600' : '400' }}>Monthly</span>
                        <button 
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            style={{ 
                                width: '56px', 
                                height: '28px', 
                                borderRadius: '14px', 
                                border: 'none', 
                                background: billingCycle === 'yearly' ? 'linear-gradient(135deg, #693fe9, #8b5cf6)' : 'rgba(255,255,255,0.2)', 
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <span style={{ 
                                position: 'absolute', 
                                top: '3px', 
                                left: billingCycle === 'yearly' ? '31px' : '3px', 
                                width: '22px', 
                                height: '22px', 
                                borderRadius: '50%', 
                                background: 'white',
                                transition: 'left 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}></span>
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: billingCycle === 'yearly' ? 'white' : 'rgba(255,255,255,0.5)', fontWeight: billingCycle === 'yearly' ? '600' : '400' }}>Yearly</span>
                            {billingCycle === 'yearly' && (
                                <span style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>
                                    Save up to 30%
                                </span>
                            )}
                        </div>
                    </div>
                    */}
                    
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.5)' }}>Loading plans...</div>
                        </div>
                    ) : (
                        <MonthlyPlans
                            plans={plans}
                            billingCycle={billingCycle}
                            formatNumber={formatNumber}
                            getYearlyDiscount={getYearlyDiscount}
                        />
                    )}

                    <div className="trust-badges" style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '40px', flexWrap: 'wrap' }}>
                        {['30-Day Money-Back', 'Cancel Anytime', 'Secure Payment'].map((badge, i) => (
                            <div key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <IconCheck size={14} color="#10b981" /> {badge}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <LifetimeDeals
                lifetimeDeals={lifetimeDeals}
                loading={loading}
                formatNumber={formatNumber}
                soldLifetimeSpots={soldLifetimeSpots}
                totalLifetimeSpots={totalLifetimeSpots}
            />

            {/* FAQ - Dark Theme - 10+ Questions */}

            {/* FAQ - Dark Theme - 10+ Questions */}
            <section id="faq" className="section-padding" style={{ background: '#111111', padding: '80px 60px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <h2 className="section-title" style={{ fontSize: '38px', fontWeight: '700', marginBottom: '16px' }}>
                            Frequently Asked<br/>
                            <span style={{ color: '#693fe9' }}>Questions</span>
                        </h2>
                    </div>
                    <div>
                        {[
                            { q: 'Is my LinkedIn password required?', a: 'No. Kommentify works completely through the browser extension. No login sharing needed. Your credentials stay private.' },
                            { q: 'Is automation safe for my account?', a: 'Yes — Kommentify uses human-like delays, scrolling, interval variations, and randomized timing to mimic natural behavior. We have preset limits based on your account age to keep you safe.' },
                            { q: 'Do I need to keep my laptop open?', a: 'Yes, the browser must be open for the extension to work. Consider using a VPS for 24/7 operation if you want continuous automation.' },
                            { q: 'Does it violate LinkedIn rules?', a: 'Kommentify mimics normal human behavior, making it extremely safe when used within our recommended limits. We designed it to be undetectable.' },
                            { q: 'Can I set my own limits?', a: 'Yes — you can customize every limit manually or choose from 6 safe presets based on your account age (New, Semi-new, Average, Mid-aged, Old, Very old).' },
                            { q: 'What is the manual import feature?', a: 'Upload your own list of target profiles (up to 500/1000/unlimited depending on plan). For each profile, Kommentify opens it, reads their posts, likes, comments, follows, and builds real relationships automatically.' },
                            { q: 'Will it work on any LinkedIn account?', a: 'Yes — new, average, or old accounts all work. We have customized limits for each account age to ensure safety.' },
                            { q: 'Can I cancel anytime?', a: 'Yes — no lock-in contracts. Cancel your subscription anytime from your dashboard. No questions asked.' },
                            { q: 'Do you offer refunds?', a: 'Yes, you can request a full refund within 30 days of purchase if you\'re not satisfied.' },
                            { q: 'Does it work on Mac/Windows?', a: 'Yes — Kommentify works on all Chromium-based browsers (Chrome, Edge, Brave, etc.) on both Mac and Windows.' },
                            { q: 'Why are lifetime deals limited?', a: 'To protect our future revenue and reward early supporters. Once 200 licenses are sold, the lifetime deal will never return.' },
                            { q: 'Will I get future updates with lifetime?', a: 'Yes — lifetime users get all future improvements, new features, and updates forever.' },
                        ].map((faq, i) => (
                            <div key={i} style={{ marginBottom: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    style={{
                                        width: '100%',
                                        padding: '16px 20px',
                                        background: 'transparent',
                                        border: 'none',
                                        textAlign: 'left',
                                        fontSize: '15px',
                                        fontWeight: '500',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    {faq.q}
                                    <span style={{ fontSize: '18px', color: '#693fe9', transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                                </button>
                                {openFaq === i && (
                                    <div style={{ padding: '0 20px 16px', fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Book Appointment Section */}
            <section id="book-appointment" className="section-padding" style={{ background: '#111111', padding: '80px 60px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 className="section-title" style={{ fontSize: '38px', fontWeight: '700', marginBottom: '16px' }}>
                            Book a<br/>
                            <span style={{ color: '#693fe9' }}>15-Minute Call</span>
                        </h2>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
                            Schedule a quick call with our team to discuss your needs
                        </p>
                        <a href="https://cal.com/ar-webcrafts/15min" target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #693fe9, #5835c7)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginBottom: '32px'
                        }}>
                            📅 Open Booking Calendar
                        </a>
                    </div>
                    
                    {/* Cal.com Inline Embed */}
                    <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                        <div style={{ width: '100%', height: '600px', overflow: 'auto' }} id="my-cal-inline-15min"></div>
                    </div>
                </div>
            </section>

            {/* Final CTA - Dark Theme */}
            <section className="section-padding" style={{ background: '#0a0a0a', padding: '80px 60px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h2 className="section-title" style={{ fontSize: '38px', fontWeight: '700', marginBottom: '20px' }}>
                        Ready to Scale Your<br/>
                        <span style={{ color: '#693fe9' }}>LinkedIn Growth?</span>
                    </h2>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px', lineHeight: '1.7' }}>
                        Your consistency, your personal brand, your network — automated.<br/>
                        <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Install Kommentify. Change your LinkedIn forever.</strong>
                    </p>
                    <div className="cta-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
                        <a href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei" target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '16px 32px',
                            background: 'white',
                            color: '#0a0a0a',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>
                            Add To Chrome <span>→</span>
                        </a>
                        <Link href="/lifetime-deal" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '16px 32px',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>
                            <IconFire size={16} color="white" /> Grab Lifetime Deal
                        </Link>
                    </div>
                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                        Already have an account? <Link href="/login" style={{ color: '#693fe9', textDecoration: 'underline' }}>Sign In</Link>
                    </div>
                </div>
            </section>


            {/* WhatsApp Chat Button */}
            <WhatsAppButton />
            
            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 900px) {
                    .hero-grid {
                        grid-template-columns: 1fr !important;
                        gap: 40px !important;
                        text-align: center !important;
                    }
                    .hero-grid > div:first-child {
                        text-align: center !important;
                    }
                    .hero-title {
                        font-size: 36px !important;
                    }
                    .hero-subtitle {
                        font-size: 15px !important;
                    }
                    .cta-buttons {
                        justify-content: center !important;
                    }
                    .trust-badges {
                        justify-content: center !important;
                    }
                    .grid-2-col {
                        grid-template-columns: 1fr !important;
                    }
                    .grid-3-col {
                        grid-template-columns: 1fr !important;
                    }
                    .section-padding {
                        padding: 40px 20px !important;
                    }
                    .feature-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .footer-content {
                        flex-direction: column !important;
                        text-align: center !important;
                    }
                    .footer-links {
                        justify-content: center !important;
                    }
                    .how-it-works-section {
                        padding: 60px 20px !important;
                    }
                    .how-it-works-container {
                        grid-template-columns: 1fr !important;
                        gap: 40px !important;
                    }
                    .how-it-works-step {
                        margin-top: 20px !important;
                    }
                    .lifetime-deal-section {
                        padding: 60px 20px !important;
                    }
                    .lifetime-deal-title {
                        font-size: 32px !important;
                    }
                    .lifetime-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 600px) {
                    .hero-title {
                        font-size: 28px !important;
                        letter-spacing: -1px !important;
                    }
                    .hero-subtitle {
                        font-size: 14px !important;
                    }
                    .extension-preview {
                        max-width: 100% !important;
                    }
                }
            `}</style>

            <Footer />
        </div>
    );
}
