'use client';

import { useEffect, useState } from 'react';

export default function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingPlan
        ? `/api/admin/plans/${editingPlan.id}`
        : '/api/admin/plans';
      const method = editingPlan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        alert(editingPlan ? 'Plan updated!' : 'Plan created!');
        setShowModal(false);
        setEditingPlan(null);
        fetchPlans();
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan');
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        alert('Plan deleted!');
        fetchPlans();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', color: '#693fe9' }}>Plan Management</h1>
        <button
          onClick={() => { setEditingPlan(null); setShowModal(true); }}
          style={{
            padding: '12px 24px',
            background: '#693fe9',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          + Create Plan
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', color: '#693fe9', marginBottom: '20px' }}>Subscription Plans</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{
              background: plan.isLifetime ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : 'white',
              padding: '30px',
              borderRadius: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              border: plan.isLifetime ? '2px solid #f59e0b' : plan.isTrialPlan ? '2px solid #17a2b8' : plan.isDefaultFreePlan ? '2px solid #6c757d' : '2px solid #e8eaf6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ fontSize: '28px', color: '#693fe9', fontWeight: 'bold', margin: 0 }}>
                  {plan.name}
                </h3>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {plan.isLifetime && (
                    <span style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                      ⚡ LIFETIME
                    </span>
                  )}
                  {plan.isTrialPlan && (
                    <span style={{ background: '#17a2b8', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                      🎁 TRIAL ({plan.trialDurationDays} days)
                    </span>
                  )}
                  {plan.isDefaultFreePlan && (
                    <span style={{ background: '#6c757d', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                      DEFAULT FREE
                    </span>
                  )}
                </div>
              </div>
              
              {plan.isLifetime && plan.lifetimeMaxSpots > 0 && (
                <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span>🎫 {plan.lifetimeSoldSpots || 0} sold</span>
                    <span>{(plan.lifetimeMaxSpots || 0) - (plan.lifetimeSoldSpots || 0)} remaining</span>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ 
                      background: 'linear-gradient(90deg, #f59e0b, #ef4444)', 
                      height: '100%', 
                      width: `${((plan.lifetimeSoldSpots || 0) / (plan.lifetimeMaxSpots || 1)) * 100}%`,
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>
              )}
              
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '25px', color: '#5e72e4' }}>
                ${plan.price}
                <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>
                  {plan.isLifetime ? ' one-time' : '/monthly'}
                </span>
              </div>

              <div style={{ marginBottom: '20px', borderBottom: '1px solid #e8eaf6', paddingBottom: '15px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#693fe9', marginBottom: '12px' }}>Monthly Limits:</div>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: '2' }}>
                  <div>💬 {plan.monthlyComments || 0} Comments/month</div>
                  <div>❤️ {plan.monthlyLikes || 0} Likes/month</div>
                  <div>📤 {plan.monthlyShares || 0} Shares/month</div>
                  <div>👥 {plan.monthlyFollows || 0} Follows/month</div>
                  <div>🔗 {plan.monthlyConnections || 0} Connections/month</div>
                  <div>🤖 {plan.aiPostsPerMonth || 0} AI Posts/month</div>
                  <div>💭 {plan.aiCommentsPerMonth || 0} AI Comments/month</div>
                  <div>💡 {plan.aiTopicLinesPerMonth || 0} AI Topics/month</div>
                  <div>📥 {plan.monthlyImportCredits || 100} Import Credits/month</div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#693fe9', marginBottom: '12px' }}>Features:</div>
                <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
                  {(plan.features?.aiContent || plan.allowAiPostGeneration) && <div>✓ AI Post Generation</div>}
                  {(plan.features?.autoComment || plan.allowAiCommentGeneration) && <div>✓ AI Comment Generation</div>}
                  {(plan.features?.aiTopicLines || plan.allowAiTopicLines) && <div>✓ AI Topic Lines</div>}
                  {(plan.features?.autoFollow || plan.allowAutomation) && <div>✓ General Automation</div>}
                  {plan.allowAutomationScheduling && <div>✓ Automation Scheduling</div>}
                  {(plan.features?.autoLike || plan.allowNetworking) && <div>✓ Networking Features</div>}
                  {plan.allowNetworkScheduling && <div>✓ Network Scheduling</div>}
                  {(plan.features?.scheduling || plan.allowPostScheduling) && <div>✓ Post Scheduling</div>}
                  {(plan.features?.analytics || plan.allowCsvExport) && <div>✓ CSV Export</div>}
                  {plan.allowImportProfiles && <div>✓ Import Profiles Auto Engagement</div>}
                </div>
              </div>

              {plan.stripePaymentLink && (
                <div style={{ marginBottom: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#693fe9', marginBottom: '5px' }}>Payment: Stripe Link</div>
                  <div style={{ fontSize: '11px', color: '#666', wordBreak: 'break-all' }}>
                    {plan.stripePaymentLink}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  onClick={() => { setEditingPlan(plan); setShowModal(true); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#693fe9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <PlanModal
          plan={editingPlan}
          onClose={() => { setShowModal(false); setEditingPlan(null); }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function PlanModal({ plan, onClose, onSubmit }: any) {
  // Helper to get value with proper 0 handling (use ?? instead of ||)
  const getValue = (primary: any, secondary: any, defaultVal: any) => {
    if (primary !== undefined && primary !== null) return primary;
    if (secondary !== undefined && secondary !== null) return secondary;
    return defaultVal;
  };

  const [formData, setFormData] = useState(plan ? {
    // Handle both formatted API response and raw database structure
    // Use ?? to properly handle 0 values (|| treats 0 as falsy)
    name: plan.name || '',
    price: plan.price ?? 0,
    yearlyPrice: plan.yearlyPrice ?? 0,
    stripePaymentLink: plan.stripePaymentLink || plan.stripeLink || '',
    stripeYearlyPaymentLink: plan.stripeYearlyPaymentLink || '',
    stripePriceId: plan.stripePriceId || '',
    stripeYearlyPriceId: plan.stripeYearlyPriceId || '',
    isTrialPlan: plan.isTrialPlan || false,
    isDefaultFreePlan: plan.isDefaultFreePlan || false,
    isLifetime: plan.isLifetime || false,
    lifetimeMaxSpots: plan.lifetimeMaxSpots ?? 0,
    lifetimeSoldSpots: plan.lifetimeSoldSpots ?? 0,
    trialDurationDays: plan.trialDurationDays ?? 7,
    // Fix: Use getValue to properly handle 0 values
    monthlyComments: getValue(plan.limits?.monthlyComments, plan.monthlyComments, 1500),
    monthlyLikes: getValue(plan.limits?.monthlyLikes, plan.monthlyLikes, 3000),
    monthlyShares: getValue(plan.limits?.monthlyShares, plan.monthlyShares, 600),
    monthlyFollows: getValue(plan.limits?.monthlyFollows, plan.monthlyFollows, 1500),
    monthlyConnections: getValue(plan.limits?.monthlyConnections, plan.monthlyConnections, 900),
    aiPostsPerMonth: getValue(plan.limits?.aiPostsPerMonth, plan.aiPostsPerMonth, 300),
    aiCommentsPerMonth: getValue(plan.limits?.aiCommentsPerMonth, plan.aiCommentsPerMonth, 1500),
    aiTopicLinesPerMonth: getValue(plan.limits?.aiTopicLinesPerMonth, plan.aiTopicLinesPerMonth, 300),
    monthlyImportCredits: plan.monthlyImportCredits ?? 100,
    allowAiPostGeneration: plan.allowAiPostGeneration ?? true,
    allowAiCommentGeneration: plan.allowAiCommentGeneration ?? true,
    allowAiTopicLines: (plan as any).allowAiTopicLines ?? true,
    allowPostScheduling: plan.allowPostScheduling ?? true,
    allowAutomation: (plan as any).allowAutomation ?? true,
    allowAutomationScheduling: (plan as any).allowAutomationScheduling ?? true,
    allowNetworking: plan.allowNetworking ?? true,
    allowNetworkScheduling: (plan as any).allowNetworkScheduling ?? true,
    allowCsvExport: plan.allowCsvExport ?? true,
    allowImportProfiles: (plan as any).allowImportProfiles ?? true,
  } : {
    name: '',
    price: 0,
    yearlyPrice: 0,
    stripePaymentLink: '',
    stripeYearlyPaymentLink: '',
    stripePriceId: '',
    stripeYearlyPriceId: '',
    isTrialPlan: false,
    isDefaultFreePlan: false,
    isLifetime: false,
    lifetimeMaxSpots: 0,
    lifetimeSoldSpots: 0,
    trialDurationDays: 7,
    monthlyComments: 1500,
    monthlyLikes: 3000,
    monthlyShares: 600,
    monthlyFollows: 1500,
    monthlyConnections: 900,
    aiPostsPerMonth: 300,
    aiCommentsPerMonth: 1500,
    aiTopicLinesPerMonth: 300,
    monthlyImportCredits: 100,
    allowAiPostGeneration: true,
    allowAiCommentGeneration: true,
    allowAiTopicLines: true,
    allowPostScheduling: true,
    allowAutomation: true,
    allowAutomationScheduling: true,
    allowNetworking: true,
    allowNetworkScheduling: true,
    allowCsvExport: true,
    allowImportProfiles: true,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#693fe9' }}>
          {plan ? 'Edit Plan' : 'Create Plan'}
        </h2>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Plan Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Price ($)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value))}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
          />
        </div>

        {/* Plan Type Configuration */}
        <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#693fe9', marginBottom: '12px' }}>Plan Type Configuration</div>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isTrialPlan}
                onChange={(e) => {
                  handleChange('isTrialPlan', e.target.checked);
                  if (e.target.checked) handleChange('isDefaultFreePlan', false);
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px' }}>🎁 This is a Trial Plan (for new signups)</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isDefaultFreePlan}
                onChange={(e) => {
                  handleChange('isDefaultFreePlan', e.target.checked);
                  if (e.target.checked) handleChange('isTrialPlan', false);
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px' }}>📋 Default Free Plan (after trial expires)</span>
            </label>
          </div>
          
          {formData.isTrialPlan && (
            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Trial Duration (days)
              </label>
              <input
                type="number"
                value={formData.trialDurationDays}
                onChange={(e) => handleChange('trialDurationDays', parseInt(e.target.value))}
                min="1"
                max="365"
                style={{ width: '120px', padding: '8px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
              />
              <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                New users get this plan for {formData.trialDurationDays} days, then auto-switch to Free plan
              </span>
            </div>
          )}
        </div>

        {/* Lifetime Deal Configuration */}
        <div style={{ marginBottom: '20px', padding: '15px', background: formData.isLifetime ? '#fff3cd' : '#f8f9fa', borderRadius: '10px', border: formData.isLifetime ? '2px solid #f59e0b' : '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#693fe9', marginBottom: '12px' }}>🚀 Lifetime Deal Configuration</div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '15px' }}>
            <input
              type="checkbox"
              checked={formData.isLifetime}
              onChange={(e) => {
                handleChange('isLifetime', e.target.checked);
                if (e.target.checked) {
                  handleChange('isTrialPlan', false);
                  handleChange('isDefaultFreePlan', false);
                }
              }}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', fontWeight: formData.isLifetime ? '600' : '400' }}>⚡ This is a Lifetime Deal (one-time payment, forever access)</span>
          </label>
          
          {formData.isLifetime && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                  Max Spots Available
                </label>
                <input
                  type="number"
                  value={formData.lifetimeMaxSpots}
                  onChange={(e) => handleChange('lifetimeMaxSpots', parseInt(e.target.value))}
                  min="0"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                  placeholder="e.g., 100"
                />
                <span style={{ fontSize: '11px', color: '#666' }}>Total spots for this LTD tier</span>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                  Spots Sold
                </label>
                <input
                  type="number"
                  value={formData.lifetimeSoldSpots}
                  onChange={(e) => handleChange('lifetimeSoldSpots', parseInt(e.target.value))}
                  min="0"
                  max={formData.lifetimeMaxSpots}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                />
                <span style={{ fontSize: '11px', color: '#666' }}>
                  {formData.lifetimeMaxSpots - formData.lifetimeSoldSpots} spots remaining
                </span>
              </div>
            </div>
          )}
        </div>

        <h3 style={{ fontSize: '18px', color: '#693fe9', marginTop: '20px', marginBottom: '15px' }}>Stripe Configuration</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Monthly Stripe Payment Link</label>
            <input
              type="text"
              value={formData.stripePaymentLink || ''}
              onChange={(e) => handleChange('stripePaymentLink', e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
              placeholder="https://buy.stripe.com/..."
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Monthly Stripe Price ID</label>
            <input
              type="text"
              value={formData.stripePriceId || ''}
              onChange={(e) => handleChange('stripePriceId', e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
              placeholder="price_..."
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Yearly Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.yearlyPrice || 0}
              onChange={(e) => handleChange('yearlyPrice', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
              placeholder="0.00"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Yearly Stripe Payment Link</label>
            <input
              type="text"
              value={formData.stripeYearlyPaymentLink || ''}
              onChange={(e) => handleChange('stripeYearlyPaymentLink', e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
              placeholder="https://buy.stripe.com/..."
            />
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Yearly Stripe Price ID</label>
          <input
            type="text"
            value={formData.stripeYearlyPriceId || ''}
            onChange={(e) => handleChange('stripeYearlyPriceId', e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
            placeholder="price_..."
          />
          <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>Price IDs are used by Stripe webhooks to identify plans</p>
        </div>

        <h3 style={{ fontSize: '18px', color: '#693fe9', marginTop: '20px', marginBottom: '15px' }}>Plan Limits</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Monthly Comments</label>
            <input
              type="number"
              value={formData.monthlyComments}
              onChange={(e) => handleChange('monthlyComments', parseInt(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Monthly Likes</label>
            <input
              type="number"
              value={formData.monthlyLikes}
              onChange={(e) => handleChange('monthlyLikes', parseInt(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Monthly Shares</label>
            <input
              type="number"
              value={formData.monthlyShares}
              onChange={(e) => handleChange('monthlyShares', parseInt(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Monthly Follows</label>
            <input
              type="number"
              value={formData.monthlyFollows}
              onChange={(e) => handleChange('monthlyFollows', parseInt(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Monthly Connections</label>
            <input
              type="number"
              value={formData.monthlyConnections}
              onChange={(e) => handleChange('monthlyConnections', parseInt(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>AI Posts/Month</label>
            <input
              type="number"
              value={formData.aiPostsPerMonth}
              onChange={(e) => handleChange('aiPostsPerMonth', parseInt(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>AI Comments/Month</label>
            <input
              type="number"
              value={formData.aiCommentsPerMonth}
              onChange={(e) => handleChange('aiCommentsPerMonth', parseInt(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>AI Topic Lines/Month</label>
            <input
              type="number"
              value={formData.aiTopicLinesPerMonth}
              onChange={(e) => handleChange('aiTopicLinesPerMonth', parseInt(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Monthly Import Credits</label>
            <input
              type="number"
              value={formData.monthlyImportCredits}
              onChange={(e) => handleChange('monthlyImportCredits', parseInt(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0', fontSize: '14px' }}
              placeholder="100"
            />
          </div>
        </div>

        <h3 style={{ fontSize: '18px', color: '#693fe9', marginBottom: '15px' }}>Features</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.allowAiPostGeneration}
              onChange={(e) => handleChange('allowAiPostGeneration', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px' }}>AI Post Generation</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.allowAiCommentGeneration}
              onChange={(e) => handleChange('allowAiCommentGeneration', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px' }}>AI Comment Generation</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.allowAiTopicLines}
              onChange={(e) => handleChange('allowAiTopicLines', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px' }}>AI Topic Lines</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.allowAutomation}
              onChange={(e) => handleChange('allowAutomation', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px' }}>General Automation</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.allowAutomationScheduling}
              onChange={(e) => handleChange('allowAutomationScheduling', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px' }}>Automation Scheduling</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.allowNetworking}
              onChange={(e) => handleChange('allowNetworking', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px' }}>Networking Features</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.allowNetworkScheduling}
              onChange={(e) => handleChange('allowNetworkScheduling', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px' }}>Networking Scheduling</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.allowPostScheduling}
              onChange={(e) => handleChange('allowPostScheduling', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px' }}>Post Scheduling</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.allowCsvExport}
              onChange={(e) => handleChange('allowCsvExport', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px' }}>CSV Export</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.allowImportProfiles}
              onChange={(e) => handleChange('allowImportProfiles', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px' }}>Import Profiles Auto Engagement</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <button
            onClick={() => onSubmit(formData)}
            style={{
              flex: 1,
              padding: '12px',
              background: '#693fe9',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {plan ? 'Update' : 'Create'}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              background: '#ccc',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
