'use client';

import { useState, useEffect } from 'react';
import { Download, CheckCircle, ArrowRight, Package, Settings, Puzzle, RefreshCw, Star, Bug, Zap } from 'lucide-react';

interface VersionInfo {
    version: string;
    features: string[];
    bug_fixes: string[];
    download_url: string;
    release_notes: string;
    created_at: string;
}

export default function ExtensionDownloadPage() {
    const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLatestVersion();
    }, []);

    const fetchLatestVersion = async () => {
        try {
            const response = await fetch('/api/extension/version');
            const data = await response.json();
            
            if (data.latestVersion) {
                setVersionInfo({
                    version: data.latestVersion,
                    features: data.features || [],
                    bug_fixes: data.bugFixes || [],
                    download_url: data.downloadUrl || '',
                    release_notes: data.releaseNotes || '',
                    created_at: data.releaseDate || new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Failed to fetch version:', error);
        } finally {
            setLoading(false);
        }
    };

    const CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei';

    const installationSteps = [
        {
            step: 1,
            title: 'Visit Chrome Web Store',
            description: 'Click the "Add to Chrome" button above to open the Chrome Web Store',
            icon: Download
        },
        {
            step: 2,
            title: 'Add Extension',
            description: 'Click "Add to Chrome" button on the Chrome Web Store page',
            icon: Package
        },
        {
            step: 3,
            title: 'Confirm Installation',
            description: 'Click "Add extension" in the popup to confirm the installation',
            icon: Puzzle
        },
        {
            step: 4,
            title: 'Pin to Toolbar',
            description: 'Click the puzzle icon in Chrome toolbar and pin Kommentify for easy access',
            icon: Settings
        },
        {
            step: 5,
            title: 'Done! Start Using',
            description: 'Click the Kommentify icon in your toolbar to start automating LinkedIn!',
            icon: CheckCircle
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #693fe9 0%, #5835c7 50%, #4a2db3 100%)' }}>
            {/* Header */}
            <header style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {/* <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>K</span>
                        </div>
                        <div>
                            <h1 style={{ fontWeight: '700', color: 'white', fontSize: '20px' }}>Kommentify</h1>
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>AI-Powered LinkedIn Growth Suite</p>
                        </div>
                    </div>
                    {versionInfo && (
                        <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            v{versionInfo.version}
                        </span>
                    )}
                </div> */}
            </header>

            <main className="max-w-6xl mx-auto px-4 py-12">
                {/* Download Section */}
                <section style={{ background: 'white', borderRadius: '24px', padding: '48px', marginBottom: '32px', boxShadow: '0 25px 80px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                    {/* Decorative elements */}
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.1), rgba(88, 53, 199, 0.05))', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.08), transparent)', borderRadius: '50%' }}></div>
                    
                    {/* Two Column Layout */}
                    <div className="download-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                        {/* Left Column - Title, Description & Download */}
                        <div>
                            <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.1), rgba(88, 53, 199, 0.05))', padding: '8px 20px', borderRadius: '20px', marginBottom: '16px' }}>
                                <span style={{ color: '#693fe9', fontWeight: '600', fontSize: '14px' }}>🚀 Latest Release</span>
                            </div>
                            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1a1a2e', marginBottom: '16px', lineHeight: '1.2' }}>Download Kommentify Extension</h2>
                            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', marginBottom: '24px' }}>
                                The most powerful LinkedIn automation tool. AI-powered comments, smart engagement, post scheduling, and network growth - all in one extension.
                            </p>
                            <a
                                href={CHROME_STORE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg, #693fe9, #5835c7)', color: 'white', padding: '16px 32px', borderRadius: '14px', fontWeight: '700', fontSize: '16px', textDecoration: 'none', boxShadow: '0 12px 40px rgba(105, 63, 233, 0.4)', transition: 'all 0.3s ease' }}
                            >
                                <Download className="w-6 h-6" />
                                🌐 Add to Chrome
                            </a>
                        </div>
                        
                        {/* Right Column - Release Notes */}
                        <div>
                            {versionInfo?.release_notes && (
                                <div style={{ background: 'linear-gradient(135deg, #f8f9ff, #f0f2ff)', borderRadius: '16px', padding: '28px', border: '2px solid rgba(105, 63, 233, 0.1)' }}>
                                    <h3 style={{ fontWeight: '700', color: '#693fe9', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>📋 Release Notes</h3>
                                    <p style={{ color: '#555', lineHeight: '1.7', fontSize: '14px' }}>{versionInfo.release_notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* What's New Section */}
                {(versionInfo?.features?.length || versionInfo?.bug_fixes?.length) ? (
                    <section style={{ background: 'white', borderRadius: '24px', padding: '40px', marginBottom: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '32px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <Star style={{ width: '28px', height: '28px', color: '#f59e0b' }} />
                            What&apos;s New in v{versionInfo?.version}
                        </h2>
                        
                        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                            {/* New Features */}
                            {versionInfo?.features?.length > 0 && (
                                <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fef9c3)', borderRadius: '16px', padding: '24px', border: '2px solid rgba(245, 158, 11, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                        <Star style={{ width: '22px', height: '22px', color: '#f59e0b' }} />
                                        <h3 style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '16px', margin: 0 }}>New Features</h3>
                                    </div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {versionInfo.features.map((feature, index) => (
                                            <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                                                <Zap style={{ width: '18px', height: '18px', color: '#693fe9', flexShrink: 0, marginTop: '2px' }} />
                                                <span style={{ color: '#4a5568', fontSize: '14px', lineHeight: '1.5' }}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Bug Fixes */}
                            {versionInfo?.bug_fixes?.length > 0 && (
                                <div style={{ background: 'linear-gradient(135deg, #d1fae5, #ecfdf5)', borderRadius: '16px', padding: '24px', border: '2px solid rgba(16, 185, 129, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                        <Bug style={{ width: '22px', height: '22px', color: '#10b981' }} />
                                        <h3 style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '16px', margin: 0 }}>Bug Fixes</h3>
                                    </div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {versionInfo.bug_fixes.map((fix, index) => (
                                            <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                                                <CheckCircle style={{ width: '18px', height: '18px', color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                                                <span style={{ color: '#4a5568', fontSize: '14px', lineHeight: '1.5' }}>{fix}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </section>
                ) : null}

                {/* Installation Guide */}
                <section style={{ background: 'white', borderRadius: '24px', padding: '48px', boxShadow: '0 25px 80px rgba(0,0,0,0.2)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1a1a2e', marginBottom: '8px' }}>Installation Guide</h2>
                        <p style={{ color: '#666', fontSize: '16px' }}>Follow these simple steps to install the extension</p>
                    </div>

                    <div className="install-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {installationSteps.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <div key={item.step} className="relative">
                                    <div style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)', borderRadius: '16px', padding: '28px', height: '100%', border: '2px solid rgba(105, 63, 233, 0.1)', transition: 'all 0.3s ease' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #693fe9, #5835c7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 4px 12px rgba(105, 63, 233, 0.3)' }}>
                                                {item.step}
                                            </div>
                                            <IconComponent style={{ width: '24px', height: '24px', color: '#693fe9' }} />
                                        </div>
                                        <h3 style={{ fontWeight: '700', color: '#1a1a2e', marginBottom: '8px', fontSize: '16px' }}>{item.title}</h3>
                                        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>{item.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Video Tutorial Link (Optional) */}
                    <div className="mt-8 text-center">
                        <div className="bg-purple-50 rounded-xl p-6 inline-block">
                            <RefreshCw className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-2">Already have the extension?</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Extensions installed from Chrome Web Store update automatically!
                            </p>
                            <p className="text-purple-600 text-sm font-medium">
                                Your extension will auto-update when new versions are released.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Support Section */}
                <section style={{ marginTop: '48px', textAlign: 'center', padding: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                        Need help? Contact us at{' '}
                        <a href="mailto:support@kommentify.com" style={{ color: 'white', fontWeight: '600', textDecoration: 'underline' }}>
                            support@kommentify.com
                        </a>
                    </p>
                    <div style={{ marginTop: '20px' }}>
                        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'white', textDecoration: 'none', fontWeight: '600', padding: '12px 24px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', transition: 'all 0.3s ease' }}>
                            ← Back to Homepage
                        </a>
                    </div>
                </section>
            </main>
            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 768px) {
                    .download-grid {
                        grid-template-columns: 1fr !important;
                        gap: 24px !important;
                    }
                    .features-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .install-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
