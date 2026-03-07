'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MonthlyPlans from '../components/MonthlyPlans';
import LifetimeDeals from '../components/LifetimeDeals';

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [lifetimeDeals, setLifetimeDeals] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [hasToken, setHasToken] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [soldLifetimeSpots] = useState(217);
  const totalLifetimeSpots = 500;

  // Helper functions
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getYearlyDiscount = (planIndex: number) => {
    const discounts = [0.20, 0.25, 0.30];
    return discounts[planIndex] || 0.20;
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setHasToken(true);
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
          const filteredPlans = data.plans.filter((p: any) => p.price > 0 && !p.isLifetime && !p.isDefaultFreePlan);
          const lifetimePlans = data.lifetimeDeals || [];
          setPlans(filteredPlans);
          setLifetimeDeals(lifetimePlans);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (plan: any, isLifetime: boolean = false) => {
    if (plan.price === 0) return;
    
    setCheckoutLoading(plan.id);
    
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billingPeriod: isLifetime ? 'lifetime' : 'monthly',
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.url) {
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
          
          {/* Dashboard Button for logged-in users */}
          {(user || hasToken) && (
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #693fe9 0%, #8b5cf6 100%)',
                borderRadius: '50px',
                border: 'none',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(105,63,233,0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(105,63,233,0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(105,63,233,0.4)';
              }}
            >
              <span style={{ fontSize: '16px' }}>🚀</span>
              <span>Go to Dashboard</span>
            </button>
          )}
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

        {/* Use MonthlyPlans Component */}
        <MonthlyPlans
          plans={plans}
          billingCycle={billingCycle}
          formatNumber={formatNumber}
          getYearlyDiscount={getYearlyDiscount}
        />

        {/* Use LifetimeDeals Component */}
        <LifetimeDeals
          lifetimeDeals={lifetimeDeals}
          loading={loading}
          formatNumber={formatNumber}
          soldLifetimeSpots={soldLifetimeSpots}
          totalLifetimeSpots={totalLifetimeSpots}
        />

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
