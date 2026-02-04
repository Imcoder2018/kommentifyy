'use client';

import { useState, useEffect } from 'react';
import { Upload, Trash2, Plus, Package, Star, Bug, Link, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface ExtensionVersion {
    id: string;
    version: string;
    features: string[];
    bug_fixes: string[];
    download_url: string;
    release_notes: string;
    is_active: boolean;
    created_at: string;
}

export default function ExtensionVersionsPage() {
    const [versions, setVersions] = useState<ExtensionVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form state
    const [newVersion, setNewVersion] = useState({
        version: '',
        features: '',
        bugFixes: '',
        downloadUrl: '',
        releaseNotes: ''
    });

    useEffect(() => {
        fetchVersions();
    }, []);

    const fetchVersions = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/admin/extension-versions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setVersions(data.versions || []);
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/admin/extension-versions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    version: newVersion.version,
                    features: newVersion.features.split('\n').filter(f => f.trim()),
                    bugFixes: newVersion.bugFixes.split('\n').filter(f => f.trim()),
                    downloadUrl: newVersion.downloadUrl,
                    releaseNotes: newVersion.releaseNotes
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Version created successfully!' });
                setNewVersion({ version: '', features: '', bugFixes: '', downloadUrl: '', releaseNotes: '' });
                setShowAddForm(false);
                fetchVersions();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to create version' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this version?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/admin/extension-versions?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Version deleted successfully!' });
                fetchVersions();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to delete version' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', background: 'white', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #693fe9, #5835c7)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(105, 63, 233, 0.3)' }}>
                        <Package style={{ width: '28px', height: '28px', color: 'white' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#693fe9', margin: 0 }}>Extension Versions</h1>
                        <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 0 0' }}>Manage extension updates and releases</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #693fe9, #5835c7)', color: 'white', padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 12px rgba(105, 63, 233, 0.3)' }}
                >
                    <Plus style={{ width: '20px', height: '20px' }} />
                    Add New Version
                </button>
            </div>

            {/* Message */}
            {message && (
                <div style={{
                    marginBottom: '20px',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: message.type === 'success' ? '#059669' : '#dc2626',
                    border: message.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca'
                }}>
                    {message.type === 'success' ? <CheckCircle style={{ width: '20px', height: '20px' }} /> : <AlertCircle style={{ width: '20px', height: '20px' }} />}
                    <span style={{ fontWeight: '500' }}>{message.text}</span>
                </div>
            )}

            {/* Add Version Form */}
            {showAddForm && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '2px solid rgba(105, 63, 233, 0.1)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#693fe9', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #693fe9, #5835c7)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package style={{ width: '20px', height: '20px', color: 'white' }} />
                        </div>
                        Add New Version
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Version Number *</label>
                                <input
                                    type="text"
                                    value={newVersion.version}
                                    onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
                                    placeholder="e.g., 1.4.0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Download URL *</label>
                                <input
                                    type="url"
                                    value={newVersion.downloadUrl}
                                    onChange={(e) => setNewVersion({ ...newVersion, downloadUrl: e.target.value })}
                                    placeholder="https://example.com/extension-v1.4.0.zip"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Star className="w-4 h-4 inline mr-1 text-yellow-500" />
                                New Features (one per line)
                            </label>
                            <textarea
                                value={newVersion.features}
                                onChange={(e) => setNewVersion({ ...newVersion, features: e.target.value })}
                                placeholder="AI-powered comment generation&#10;Scheduled post automation&#10;Network growth tools"
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Bug className="w-4 h-4 inline mr-1 text-green-500" />
                                Bug Fixes (one per line)
                            </label>
                            <textarea
                                value={newVersion.bugFixes}
                                onChange={(e) => setNewVersion({ ...newVersion, bugFixes: e.target.value })}
                                placeholder="Fixed comment delay issue&#10;Resolved login timeout bug&#10;Fixed duplicate connection requests"
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Release Notes</label>
                            <textarea
                                value={newVersion.releaseNotes}
                                onChange={(e) => setNewVersion({ ...newVersion, releaseNotes: e.target.value })}
                                placeholder="This release includes major improvements to the automation engine and fixes several reported issues."
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                {saving ? 'Saving...' : 'Save Version'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Versions List */}
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'linear-gradient(135deg, #693fe9, #5835c7)' }}>
                        <tr>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'white' }}>Version</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'white' }}>Features</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'white' }}>Bug Fixes</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'white' }}>Release Date</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'white' }}>Download</th>
                            <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: 'white' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {versions.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
                                    <Package style={{ width: '48px', height: '48px', margin: '0 auto 12px', opacity: 0.5 }} />
                                    <div>No versions found. Add your first version above.</div>
                                </td>
                            </tr>
                        ) : (
                            versions.map((version) => (
                                <tr key={version.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '14px 20px' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(105, 63, 233, 0.1)', color: '#693fe9', padding: '6px 14px', borderRadius: '20px', fontWeight: '600', fontSize: '13px' }}>
                                            v{version.version}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Star style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                                            <span style={{ fontSize: '13px', color: '#666' }}>{version.features?.length || 0} features</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Bug style={{ width: '16px', height: '16px', color: '#10b981' }} />
                                            <span style={{ fontSize: '13px', color: '#666' }}>{version.bug_fixes?.length || 0} fixes</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#666' }}>
                                        {new Date(version.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        {version.download_url ? (
                                            <a
                                                href={version.download_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#693fe9', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}
                                            >
                                                <Link style={{ width: '14px', height: '14px' }} />
                                                Download
                                            </a>
                                        ) : (
                                            <span style={{ color: '#999', fontSize: '13px' }}>No link</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleDelete(version.id)}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                                            title="Delete version"
                                        >
                                            <Trash2 style={{ width: '18px', height: '18px' }} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Download Page Link */}
            <div style={{ marginTop: '24px', background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.05), rgba(105, 63, 233, 0.02))', borderRadius: '16px', padding: '24px', border: '2px solid rgba(105, 63, 233, 0.15)' }}>
                <h3 style={{ fontWeight: '700', fontSize: '16px', color: '#693fe9', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link style={{ width: '20px', height: '20px', color: '#693fe9' }} />
                    Chrome Web Store Link
                </h3>
                <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>
                    Share this link with users to install the extension from Chrome Web Store:
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <code style={{ background: 'white', padding: '12px 16px', borderRadius: '10px', border: '2px solid rgba(105, 63, 233, 0.2)', color: '#693fe9', fontWeight: '500', flex: 1, fontSize: '13px' }}>
                        https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei
                    </code>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText('https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei');
                            setMessage({ type: 'success', text: 'Link copied to clipboard!' });
                        }}
                        style={{ background: 'linear-gradient(135deg, #693fe9, #5835c7)', color: 'white', padding: '12px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 12px rgba(105, 63, 233, 0.3)' }}
                    >
                        Copy Link
                    </button>
                </div>
            </div>
        </div>
    );
}
