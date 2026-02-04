'use client';

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RefundPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white' }}>
      <Header showBanner={false} />

      {/* Main Content */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px' }}>
        <h1 style={{ 
          fontSize: '42px', 
          fontWeight: '700', 
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #693fe9, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Refund Policy
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '40px' }}>
          Last Updated:January 13, 2026
        </p>

        <div style={{ 
          background: 'rgba(34, 197, 94, 0.1)', 
          padding: '20px', 
          borderRadius: '12px',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          marginBottom: '40px'
        }}>
          <strong>💯 100% Satisfaction Guarantee:</strong> We want you to be completely satisfied with Kommentify. If you&apos;re not happy, we&apos;ll make it right.
        </div>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>1. Money-Back Guarantee</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            We offer a 30-Day Money-Back Guarantee for new users. During this period, you can test all features.
          </p>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>2. Monthly Subscriptions</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '15px' }}>
            For monthly subscription plans:
          </p>
          <ul style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li><strong>30-Day Money-Back Guarantee:</strong> Request a full refund within 30 days of your first payment if you&apos;re not satisfied</li>
            <li>After 30 days, we do not offer refunds for the current billing cycle</li>
            <li>You can cancel anytime to prevent future charges</li>
            <li>Access continues until the end of your paid period</li>
          </ul>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>3. Annual Subscriptions</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '15px' }}>
            For annual subscription plans:
          </p>
          <ul style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li><strong>30-Day Money-Back Guarantee:</strong> Request a full refund within 30 days of payment</li>
            <li>After 30 days, pro-rata refunds may be available at our discretion</li>
            <li>Cancel anytime; access continues until the end of your annual period</li>
          </ul>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>4. Lifetime Deals</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '15px' }}>
            For lifetime deal purchases:
          </p>
          <ul style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li><strong>30-Day Money-Back Guarantee:</strong> Full refund within 30 days if not satisfied</li>
            <li>After 30 days, lifetime deals are non-refundable</li>
            <li>Lifetime access means as long as the service operates</li>
          </ul>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>5. Credit Purchases</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            Import credits and other one-time purchases are non-refundable once used. Unused credits may be refundable within 7 days of purchase at our discretion.
          </p>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>6. Exceptions</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '15px' }}>
            Refunds will NOT be provided if:
          </p>
          <ul style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li>Your account was terminated due to Terms of Service violations</li>
            <li>You&apos;ve requested multiple refunds previously (refund abuse)</li>
            <li>The service worked as described but you changed your mind after the guarantee period</li>
          </ul>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>7. How to Request a Refund</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '15px' }}>
            To request a refund:
          </p>
          <ol style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li>Email us at <a href="mailto:support@kommentify.com" style={{ color: '#693fe9' }}>support@kommentify.com</a></li>
            <li>Include your account email and reason for the refund</li>
            <li>We&apos;ll process your request within 3-5 business days</li>
            <li>Refunds are credited to the original payment method</li>
          </ol>
        </section>

        <section style={{ 
          background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.2), rgba(168, 85, 247, 0.2))',
          padding: '30px',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px' }}>Questions?</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
            If you have any questions about our refund policy, we&apos;re happy to help.
          </p>
          <Link href="/contact" style={{ 
            display: 'inline-block',
            background: 'linear-gradient(135deg, #693fe9, #5835c7)',
            color: 'white',
            padding: '12px 28px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            Contact Support
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
