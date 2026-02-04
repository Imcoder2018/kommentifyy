'use client';

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsPage() {
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
          Terms & Conditions
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '40px' }}>
          Last Updated: December 11, 2024
        </p>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>1. Acceptance of Terms</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            By accessing or using Kommentify (&quot;the Service&quot;), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>2. Description of Service</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            Kommentify is a Chrome browser extension that provides AI-powered LinkedIn automation tools including auto-commenting, networking, post scheduling, and analytics. The Service is designed to help users grow their LinkedIn presence efficiently.
          </p>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>3. User Accounts</h2>
          <ul style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must notify us immediately of any unauthorized access</li>
            <li>One account per user unless expressly permitted</li>
          </ul>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>4. Acceptable Use</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '15px' }}>
            You agree NOT to:
          </p>
          <ul style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li>Use the Service for spamming or harassing other users</li>
            <li>Violate LinkedIn&apos;s Terms of Service</li>
            <li>Attempt to reverse engineer or modify the Service</li>
            <li>Share your account credentials with others</li>
            <li>Use the Service for any illegal activities</li>
            <li>Exceed reasonable usage limits that may affect service quality</li>
          </ul>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>5. Payment Terms</h2>
          <ul style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li>Paid plans are billed in advance on a monthly or annual basis</li>
            <li>All fees are non-refundable except as stated in our Refund Policy</li>
            <li>We reserve the right to change pricing with 30 days notice</li>
            <li>Failed payments may result in service suspension</li>
          </ul>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>6. Intellectual Property</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            The Service and its original content, features, and functionality are owned by Kommentify and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>7. Disclaimer of Warranties</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            The Service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free. We are not responsible for any actions LinkedIn may take regarding your account.
          </p>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>8. Limitation of Liability</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            To the maximum extent permitted by law, Kommentify shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
          </p>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>9. Termination</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the Service will cease immediately.
          </p>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>10. Changes to Terms</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the Service. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>11. Contact</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            For questions about these Terms, contact us at:<br />
            <strong>Email:</strong> <a href="mailto:support@kommentify.com" style={{ color: '#693fe9' }}>support@kommentify.com</a>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
