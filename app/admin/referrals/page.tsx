'use client';

import { useEffect, useState } from 'react';

interface ReferralUser {
    id: string;
    name: string;
    email: string;
    referralCode: string;
    totalReferrals: number;
    totalPaidReferrals: number;
    totalRevenue: number;
    commission: number;
    referrals: Array<{
        id: string;
        name: string;
        email: string;
        joinedAt: string;
        hasPaid: boolean;
        totalPaid: number;
        planName: string;
    }>;
}

interface ReferralSettings {
    commissionPercentage: number;
    commissionFlat: number;
    usePercentage: boolean;
    minPayoutAmount: number;
    isActive: boolean;
}

interface ReferralData {
    settings: ReferralSettings;
    summary: {
        totalReferrers: number;
        totalSignupsFromReferrals: number;
        totalPaidFromReferrals: number;
        totalRevenueFromReferrals: number;
        totalCommissionOwed: number;
    };
    referrers: ReferralUser[];
}

export default function AdminReferralsPage() {
    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [settings, setSettings] = useState<ReferralSettings | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch('/api/admin/referrals', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setData(result);
                setSettings(result.settings);
            }
        } catch (error) {
            console.error('Failed to fetch referral data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async () => {
        if (!settings) return;
        setSaving(true);
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch('/api/admin/referrals', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            const result = await res.json();
            if (result.success) {
                setSettings(result.settings);
                alert('Settings updated successfully!');
                fetchReferralData();
            }
        } catch (error) {
            console.error('Failed to update settings:', error);
            alert('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎁</div>
                Loading referral data...
            </div>
        );
    }

    return (
        <div style={{ padding: '30px' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '10px', color: '#1a1a1a' }}>
                🎁 Referral Program Management
            </h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Track referrals, manage commission rates, and view earnings
            </p>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '12px', color: 'white' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{data?.summary.totalReferrers || 0}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>Active Referrers</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', padding: '20px', borderRadius: '12px', color: 'white' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{data?.summary.totalSignupsFromReferrals || 0}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>Total Signups</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '20px', borderRadius: '12px', color: 'white' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{data?.summary.totalPaidFromReferrals || 0}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>Paid Conversions</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '20px', borderRadius: '12px', color: 'white' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>${(data?.summary.totalRevenueFromReferrals || 0).toFixed(2)}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>Total Revenue</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', padding: '20px', borderRadius: '12px', color: 'white' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>${(data?.summary.totalCommissionOwed || 0).toFixed(2)}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>Commission Owed</div>
                </div>
            </div>

            {/* Settings Section */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#1a1a1a' }}>⚙️ Commission Settings</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#666' }}>
                            Commission Type
                        </label>
                        <select
                            value={settings?.usePercentage ? 'percentage' : 'flat'}
                            onChange={(e) => setSettings(prev => prev ? { ...prev, usePercentage: e.target.value === 'percentage' } : null)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        >
                            <option value="percentage">Percentage of Sale</option>
                            <option value="flat">Flat Amount per Referral</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#666' }}>
                            Commission Rate (%)
                        </label>
                        <input
                            type="number"
                            value={settings?.commissionPercentage || 0}
                            onChange={(e) => setSettings(prev => prev ? { ...prev, commissionPercentage: parseFloat(e.target.value) } : null)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#666' }}>
                            Flat Amount ($)
                        </label>
                        <input
                            type="number"
                            value={settings?.commissionFlat || 0}
                            onChange={(e) => setSettings(prev => prev ? { ...prev, commissionFlat: parseFloat(e.target.value) } : null)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#666' }}>
                            Min Payout ($)
                        </label>
                        <input
                            type="number"
                            value={settings?.minPayoutAmount || 0}
                            onChange={(e) => setSettings(prev => prev ? { ...prev, minPayoutAmount: parseFloat(e.target.value) } : null)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={settings?.isActive || false}
                            onChange={(e) => setSettings(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                        />
                        <span style={{ fontSize: '14px' }}>Referral Program Active</span>
                    </label>
                    <button
                        onClick={updateSettings}
                        disabled={saving}
                        style={{
                            padding: '10px 25px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            opacity: saving ? 0.7 : 1
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            {/* Referrers Table */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                    <h2 style={{ fontSize: '18px', color: '#1a1a1a', margin: 0 }}>👥 Referrers & Their Referrals</h2>
                </div>
                
                {data?.referrers && data.referrers.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '15px', textAlign: 'left', fontSize: '13px', color: '#666' }}>Referrer</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontSize: '13px', color: '#666' }}>Code</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontSize: '13px', color: '#666' }}>Signups</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontSize: '13px', color: '#666' }}>Paid</th>
                                <th style={{ padding: '15px', textAlign: 'right', fontSize: '13px', color: '#666' }}>Revenue</th>
                                <th style={{ padding: '15px', textAlign: 'right', fontSize: '13px', color: '#666' }}>Commission</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontSize: '13px', color: '#666' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.referrers.map((user) => (
                                <>
                                    <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ fontWeight: '600', color: '#1a1a1a' }}>{user.name || 'Anonymous'}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <code style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                                {user.referralCode}
                                            </code>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#667eea' }}>
                                            {user.totalReferrals}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#10b981' }}>
                                            {user.totalPaidReferrals}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                                            ${user.totalRevenue.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#f59e0b' }}>
                                            ${user.commission.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: expandedUser === user.id ? '#667eea' : '#f0f0f0',
                                                    color: expandedUser === user.id ? 'white' : '#666',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                {expandedUser === user.id ? '▲ Hide' : '▼ View'} Details
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedUser === user.id && (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '0 20px 20px 20px', background: '#f8f9fa' }}>
                                                <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', marginTop: '10px' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead>
                                                            <tr style={{ background: '#eee' }}>
                                                                <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px' }}>Name</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px' }}>Email</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px' }}>Joined</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px' }}>Plan</th>
                                                                <th style={{ padding: '10px', textAlign: 'right', fontSize: '12px' }}>Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {user.referrals.map((ref) => (
                                                                <tr key={ref.id} style={{ borderTop: '1px solid #eee' }}>
                                                                    <td style={{ padding: '10px', fontSize: '13px' }}>{ref.name || 'Anonymous'}</td>
                                                                    <td style={{ padding: '10px', fontSize: '13px' }}>{ref.email}</td>
                                                                    <td style={{ padding: '10px', fontSize: '13px' }}>{new Date(ref.joinedAt).toLocaleDateString()}</td>
                                                                    <td style={{ padding: '10px', fontSize: '13px' }}>{ref.planName}</td>
                                                                    <td style={{ padding: '10px', textAlign: 'right' }}>
                                                                        {ref.hasPaid ? (
                                                                            <span style={{ background: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                                                                                💰 Paid (${ref.totalPaid})
                                                                            </span>
                                                                        ) : (
                                                                            <span style={{ background: '#f0f0f0', padding: '4px 10px', borderRadius: '12px', fontSize: '11px' }}>
                                                                                Free User
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎁</div>
                        <div style={{ fontSize: '18px', marginBottom: '10px' }}>No referrals yet</div>
                        <div style={{ fontSize: '14px' }}>When users start referring others, they&apos;ll appear here</div>
                    </div>
                )}
            </div>
        </div>
    );
}
