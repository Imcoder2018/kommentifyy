'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [lifetimeDeals, setLifetimeDeals] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in and get their info
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('/api/auth/validate', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
          }
        })
        .catch(() => {});
    }

    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Filter out free plan and separate lifetime deals
          const filteredPlans = data.plans.filter((p: any) => p.price > 0 && !p.isLifetime && !p.isDefaultFreePlan);
          const lifetimePlans = data.lifetimeDeals || [];
          setPlans(filteredPlans);
          setLifetimeDeals(lifetimePlans);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const getDisplayPrice = (plan: any) => {
    if (billingPeriod === 'yearly' && plan.yearlyPrice) {
      return plan.yearlyPrice;
    }
    return plan.price;
  };

  const handleCheckout = async (plan: any, isLifetime: boolean = false) => {
    if (plan.price === 0) return;
    
    setCheckoutLoading(plan.id);
    
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billingPeriod: isLifetime ? 'lifetime' : billingPeriod,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
      } else {
        alert(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }}>⚡</div>
          <div style={{ fontSize: '18px', opacity: 0.8 }}>Loading plans...</div>
        </div>
      </div>
    );
  }

  // Determine popular plan (middle plan or Growth)
  const popularPlanIndex = plans.length > 1 ? 1 : 0;

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(105,63,233,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(100px)' }}></div>

      <div className="plans-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        {/* Header with Extension CTA */}
        <div className="plans-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo32x32-2.png" alt="Kommentify" style={{ width: '48px', height: '48px' }} />
            <span style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>Kommentify</span>
          </div>
          
          {/* Extension CTA Banner */}
          <a 
            className="chrome-cta"
            href="https://chromewebstore.google.com/detail/kommentify-linkedin-auto/laeckkpjacbodjglcnenggpdpehkacei"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50px',
              textDecoration: 'none',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
              animation: 'pulse-glow 2s ease-in-out infinite',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🧩</span>
              <span>Add to Chrome - It&apos;s Free!</span>
              <span className="required-badge" style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: '4px 10px', 
                borderRadius: '12px', 
                fontSize: '11px',
                fontWeight: '700'
              }}>Required</span>
            </span>
          </a>
        </div>

        <div className="plans-title" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            Supercharge Your LinkedIn Growth
          </h1>
          <p className="plans-subtitle" style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Choose the perfect plan to automate your LinkedIn engagement and grow your network 10x faster
          </p>
        </div>

        {/* MONTHLY/YEARLY PLANS - HIDDEN FOR LIFETIME DEALS ONLY - Set to false to hide, true to show */}
        {false && (
          <>
            {/* Billing Toggle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
              <div style={{ 
                display: 'flex', 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '50px', 
                padding: '6px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  style={{
                    padding: '14px 32px',
                    borderRadius: '44px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    background: billingPeriod === 'monthly' ? 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)' : 'transparent',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    boxShadow: billingPeriod === 'monthly' ? '0 4px 15px rgba(105,63,233,0.4)' : 'none'
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  style={{
                    padding: '14px 32px',
                    borderRadius: '44px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    background: billingPeriod === 'yearly' ? 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)' : 'transparent',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: billingPeriod === 'yearly' ? '0 4px 15px rgba(105,63,233,0.4)' : 'none'
                  }}
                >
                  Yearly
                  <span style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                    color: 'white', 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>SAVE 20%</span>
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`, 
              gap: '24px',
              maxWidth: '1100px',
              margin: '0 auto 80px auto'
            }}>
              {plans.map((plan, index) => {
                const isPopular = index === popularPlanIndex;
                const displayPrice = getDisplayPrice(plan);
                
                return (
                  <div key={plan.id} style={{
                    background: isPopular 
                      ? 'linear-gradient(135deg, rgba(105,63,233,0.2) 0%, rgba(139,92,246,0.1) 100%)'
                      : 'rgba(255,255,255,0.03)',
                    padding: isPopular ? '32px' : '28px',
                    borderRadius: '24px',
                    border: isPopular ? '2px solid #693fe9' : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    backdropFilter: 'blur(10px)',
                    transform: isPopular ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isPopular ? '0 20px 60px rgba(105,63,233,0.3)' : '0 4px 20px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}>
                    {/* Popular Badge */}
                    {isPopular && (
                      <div style={{
                        position: 'absolute',
                        top: '-14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        padding: '6px 20px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '0 4px 15px rgba(245,158,11,0.4)'
                      }}>
                        🔥 Most Popular
                      </div>
                    )}

                    {/* Plan Name */}
                    <h2 style={{ 
                      fontSize: '24px', 
                      fontWeight: '700', 
                      color: 'white', 
                      marginBottom: '8px',
                      marginTop: isPopular ? '10px' : '0'
                    }}>
                      {plan.name}
                    </h2>

                    {/* Price */}
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '48px', fontWeight: '800', color: 'white' }}>
                        ${displayPrice}
                      </span>
                      <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>
                        /{billingPeriod === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>

                    {/* Money-Back Guarantee Badge */}
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '24px',
                      textAlign: 'center',
                      boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
                    }}>
                      🛡️ 30-Day Money-Back Guarantee
                    </div>

                    {/* Yearly Savings */}
                    {billingPeriod === 'yearly' && plan.yearlyPrice && (
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#10b981', 
                        fontWeight: '600', 
                        marginBottom: '20px',
                        textAlign: 'center'
                      }}>
                        💰 Save ${((plan.price * 12) - plan.yearlyPrice).toFixed(0)} per year
                      </div>
                    )}

                    {/* Limits Section */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        color: 'rgba(255,255,255,0.5)', 
                        textTransform: 'uppercase', 
                        letterSpacing: '1px',
                        marginBottom: '12px'
                      }}>
                        Monthly Limits
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {[
                          { icon: '❤️', label: 'Likes', value: plan.limits?.monthlyLikes || 0 },
                          { icon: '📤', label: 'Shares', value: plan.limits?.monthlyShares || 0 },
                          { icon: '👥', label: 'Follows', value: plan.limits?.monthlyFollows || 0 },
                          { icon: '🔗', label: 'Connects', value: plan.limits?.monthlyConnections || 0 },
                          { icon: '📥', label: 'Imports', value: plan.monthlyImportCredits || 0 },
                          { icon: '🤖', label: 'AI Posts', value: plan.limits?.aiPostsPerMonth || 0 },
                          { icon: '💭', label: 'AI Comments', value: plan.limits?.aiCommentsPerMonth || 0 },
                          { icon: '💡', label: 'AI Topics', value: plan.limits?.aiTopicLinesPerMonth || 0 },
                        ].map((item, i) => (
                          <div key={i} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.8)',
                            padding: '6px 0'
                          }}>
                            <span>{item.icon}</span>
                            <span style={{ fontWeight: '600', color: 'white' }}>{item.value.toLocaleString()}</span>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div style={{ flex: 1, marginBottom: '24px' }}>
                      <div style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        color: 'rgba(255,255,255,0.5)', 
                        textTransform: 'uppercase', 
                        letterSpacing: '1px',
                        marginBottom: '12px'
                      }}>
                        Features Included
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { name: 'Basic Automation', included: plan.features?.autoLike },
                          { name: 'AI Comments', included: plan.features?.autoComment },
                          { name: 'Auto Follow', included: plan.features?.autoFollow },
                          { name: 'AI Content', included: plan.features?.aiContent },
                          { name: 'Post Scheduling', included: plan.features?.scheduling },
                          { name: 'Advanced Analytics', included: plan.features?.analytics },
                        ].filter(f => f.included).map((feature, i) => (
                          <div key={i} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            fontSize: '14px',
                            color: '#10b981'
                          }}>
                            <span>✓</span>
                            <span style={{ color: 'rgba(255,255,255,0.9)' }}>{feature.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleCheckout(plan)}
                      disabled={checkoutLoading === plan.id}
                      style={{
                        width: '100%',
                        padding: '16px 24px',
                        background: isPopular 
                          ? 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)'
                          : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: isPopular ? 'none' : '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '14px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: isPopular ? '0 4px 20px rgba(105,63,233,0.4)' : 'none',
                        opacity: checkoutLoading === plan.id ? 0.7 : 1
                      }}
                    >
                      {checkoutLoading === plan.id ? 'Processing...' : 'Select Plan'}
                    </button>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '12px' }}>
                      30-Day Money-Back Guarantee • Cancel anytime
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Lifetime Deals Section */}
        {lifetimeDeals.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: '700',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(245,158,11,0.3)'
              }}>
                🎉 LIMITED TIME OFFER
              </div>
              <h2 style={{ 
                fontSize: '40px', 
                fontWeight: '800', 
                color: 'white',
                marginBottom: '12px'
              }}>
                Lifetime Deals
              </h2>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto' }}>
                One-time payment, lifetime access. Never worry about subscriptions again!
              </p>
            </div>
            
            <div className="plans-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${Math.min(lifetimeDeals.length, 3)}, 1fr)`, 
              gap: '24px',
              maxWidth: '1100px',
              margin: '0 auto'
            }}>
              {lifetimeDeals.map((plan) => (
                <div className="plan-card" key={plan.id} style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.05) 100%)',
                  padding: '32px',
                  borderRadius: '24px',
                  border: '2px solid #f59e0b',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 40px rgba(245,158,11,0.2)',
                  overflow: 'hidden'
                }}>
                  {/* Lifetime Ribbon */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '-35px',
                    transform: 'rotate(45deg)',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    padding: '8px 50px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '1px'
                  }}>
                    LIFETIME
                  </div>

                  <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
                    {plan.name}
                  </h2>

                  <div style={{ marginBottom: '16px' }}>
                    <span className="plan-price" style={{ fontSize: '48px', fontWeight: '800', color: 'white' }}>
                      ${plan.price}
                    </span>
                    <span style={{ 
                      fontSize: '16px', 
                      color: 'rgba(255,255,255,0.5)', 
                      textDecoration: 'line-through',
                      marginLeft: '12px'
                    }}>
                      ${plan.price * 12}
                    </span>
                    <div style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '600', marginTop: '4px' }}>
                      One-time payment • Forever access
                    </div>
                  </div>

                  {/* Lifetime Limits */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      fontSize: '13px', 
                      fontWeight: '600', 
                      color: 'rgba(255,255,255,0.5)', 
                      textTransform: 'uppercase', 
                      letterSpacing: '1px',
                      marginBottom: '12px'
                    }}>
                      Monthly Limits
                    </div>
                    <div className="limits-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[
                        { icon: '❤️', label: 'Likes', value: plan.limits?.monthlyLikes || 0 },
                        { icon: '📤', label: 'Shares', value: plan.limits?.monthlyShares || 0 },
                        { icon: '👥', label: 'Follows', value: plan.limits?.monthlyFollows || 0 },
                        { icon: '🔗', label: 'Connects', value: plan.limits?.monthlyConnections || 0 },
                        { icon: '📥', label: 'Imports', value: plan.monthlyImportCredits || 0 },
                        { icon: '🤖', label: 'AI Posts', value: plan.limits?.aiPostsPerMonth || 0 },
                        { icon: '💭', label: 'AI Comments', value: plan.limits?.aiCommentsPerMonth || 0 },
                        { icon: '💡', label: 'AI Topics', value: plan.limits?.aiTopicLinesPerMonth || 0 },
                      ].map((item, i) => (
                        <div key={i} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.8)',
                          padding: '6px 0'
                        }}>
                          <span>{item.icon}</span>
                          <span style={{ fontWeight: '600', color: 'white' }}>{item.value.toLocaleString()}</span>
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lifetime Features */}
                  <div style={{ flex: 1, marginBottom: '24px' }}>
                    <div style={{ 
                      fontSize: '13px', 
                      fontWeight: '600', 
                      color: 'rgba(255,255,255,0.5)', 
                      textTransform: 'uppercase', 
                      letterSpacing: '1px',
                      marginBottom: '12px'
                    }}>
                      Features Included
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { name: 'Basic Automation', included: plan.features?.autoLike },
                        { name: 'AI Comments', included: plan.features?.autoComment },
                        { name: 'Auto Follow', included: plan.features?.autoFollow },
                        { name: 'AI Content', included: plan.features?.aiContent },
                        { name: 'Post Scheduling', included: plan.features?.scheduling },
                        { name: 'Advanced Analytics', included: plan.features?.analytics },
                      ].filter(f => f.included).map((feature, i) => (
                        <div key={i} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontSize: '14px',
                          color: '#f59e0b'
                        }}>
                          <span>✓</span>
                          <span style={{ color: 'rgba(255,255,255,0.9)' }}>{feature.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lifetime CTA */}
                  <button
                    onClick={() => handleCheckout(plan, true)}
                    disabled={checkoutLoading === plan.id}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
                      opacity: checkoutLoading === plan.id ? 0.7 : 1
                    }}
                  >
                    {checkoutLoading === plan.id ? 'Processing...' : '🚀 Get Lifetime Access Now'}
                  </button>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '12px' }}>
                    No subscriptions • Pay once, use forever
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust Section */}
        <div className="trust-section" style={{ 
          marginTop: '80px', 
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h3 className="section-heading" style={{ fontSize: '24px', color: 'white', marginBottom: '30px', fontWeight: '700' }}>
            Trusted by LinkedIn Professionals Worldwide
          </h3>
          <div className="trust-stats" style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '36px', fontWeight: '800', color: '#693fe9' }}>500+</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Active Users</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '36px', fontWeight: '800', color: '#693fe9' }}>5000+</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Engagements/Day</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '36px', fontWeight: '800', color: '#693fe9' }}>4.9★</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>User Rating</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '36px', fontWeight: '800', color: '#693fe9' }}>24/7</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Support</div>
            </div>
          </div>
        </div>

        {/* FAQ Teaser */}
        <div style={{ textAlign: 'center', marginTop: '60px', paddingBottom: '40px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            Have questions? Contact us at <a href="mailto:support@kommentify.com" style={{ color: '#693fe9', textDecoration: 'none' }}>support@kommentify.com</a>
          </p>
        </div>
      </div>

      {/* CSS Animation & Responsive Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(16,185,129,0.4); transform: scale(1); }
          50% { box-shadow: 0 4px 30px rgba(16,185,129,0.6), 0 0 40px rgba(16,185,129,0.3); transform: scale(1.02); }
        }
        
        /* Tablet */
        @media (max-width: 1024px) {
          .plans-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        /* Mobile */
        @media (max-width: 768px) {
          .plans-container {
            padding: 30px 16px !important;
          }
          .plans-header {
            flex-direction: column !important;
            text-align: center !important;
          }
          .plans-title h1 {
            font-size: 32px !important;
          }
          .plans-subtitle {
            font-size: 16px !important;
          }
          .plans-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .plan-card {
            padding: 24px !important;
          }
          .plan-price {
            font-size: 36px !important;
          }
          .trust-section {
            padding: 24px !important;
          }
          .trust-stats {
            gap: 30px !important;
          }
          .stat-number {
            font-size: 28px !important;
          }
          .chrome-cta {
            padding: 10px 16px !important;
            font-size: 12px !important;
          }
          .chrome-cta .required-badge {
            display: none !important;
          }
          .section-heading {
            font-size: 28px !important;
          }
        }
        
        /* Small Mobile */
        @media (max-width: 480px) {
          .plans-container {
            padding: 20px 12px !important;
          }
          .plans-title h1 {
            font-size: 26px !important;
          }
          .plan-card {
            padding: 20px !important;
          }
          .plan-price {
            font-size: 32px !important;
          }
          .limits-grid {
            grid-template-columns: 1fr !important;
          }
          .trust-stats {
            flex-direction: column !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
