'use client';

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '40px' }}>
          Last Updated: December 11, 2024
        </p>

        <div style={{ 
          background: 'rgba(105, 63, 233, 0.1)', 
          padding: '20px', 
          borderRadius: '12px',
          border: '1px solid rgba(105, 63, 233, 0.3)',
          marginBottom: '40px'
        }}>
          <strong>Summary:</strong> We respect your privacy. We collect minimal data necessary to provide our service, never sell your data, and give you full control over your information.
        </div>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>1. Introduction</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '15px' }}>
            Welcome to Kommentify (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Chrome extension and related services.
          </p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            By using Kommentify, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>2. Information We Collect</h2>
          
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>2.1 Information You Provide</h3>
          <ul style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li><strong>Account Information:</strong> Email address and name when you register</li>
            <li><strong>Settings & Preferences:</strong> Your automation settings, keywords, and preferences</li>
            <li><strong>Scheduled Content:</strong> Posts you schedule for publishing</li>
          </ul>

          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>2.2 Automatically Collected Information</h3>
          <ul style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li><strong>Usage Data:</strong> How you interact with the extension (features used, automation runs)</li>
            <li><strong>Analytics:</strong> Aggregated statistics about engagement and performance</li>
            <li><strong>Error Logs:</strong> Technical information when errors occur</li>
          </ul>

          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', marginTop: '20px' }}>2.3 Information We Do NOT Collect</h3>
          <ul style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li>Your LinkedIn password</li>
            <li>Private messages or conversations</li>
            <li>Personal contacts outside LinkedIn</li>
            <li>Financial or payment information (handled by payment processors)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>3. How We Use Your Information</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '15px' }}>
            We use the collected information to:
          </p>
          <ul style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li>Provide and maintain the extension functionality</li>
            <li>Process your automation requests</li>
            <li>Sync your settings across devices</li>
            <li>Send important service updates</li>
            <li>Improve our services based on usage patterns</li>
            <li>Provide customer support</li>
            <li>Prevent abuse and ensure security</li>
          </ul>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>4. Data Storage & Security</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '15px' }}>
            We implement industry-standard security measures:
          </p>
          <ul style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li>Data encryption in transit (HTTPS/TLS)</li>
            <li>Secure cloud infrastructure</li>
            <li>Regular security audits</li>
            <li>Limited employee access to user data</li>
          </ul>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginTop: '15px' }}>
            Most data is stored locally on your device using Chrome&apos;s storage API. Only essential data for sync and authentication is stored on our servers.
          </p>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>5. Third-Party Services</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '15px' }}>
            We use the following third-party services:
          </p>
          <ul style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li><strong>OpenAI:</strong> For AI-powered comment generation</li>
            <li><strong>Vercel:</strong> For hosting our backend services</li>
            <li><strong>Stripe:</strong> For handling payments (they have their own privacy policies)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>6. Your Rights</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '15px' }}>
            You have the right to:
          </p>
          <ul style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li><strong>Access:</strong> Request a copy of your data</li>
            <li><strong>Correction:</strong> Update inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Export:</strong> Download your data in a portable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
          </ul>
        </section>

        <section style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#693fe9' }}>7. Contact Us</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
            If you have questions about this Privacy Policy, contact us at:<br />
            <strong>Email:</strong> <a href="mailto:support@kommentify.com" style={{ color: '#693fe9' }}>support@kommentify.com</a><br />
            <strong>Website:</strong> <a href="https://kommentify.com" target="_blank" rel="noopener noreferrer" style={{ color: '#693fe9' }}>https://kommentify.com</a>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
