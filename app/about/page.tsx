'use client';

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white' }}>
      <Header showBanner={false} />

      {/* Main Content */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px' }}>
        <h1 style={{ 
          fontSize: '42px', 
          fontWeight: '700', 
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #693fe9, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          About Kommentify
        </h1>

        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '40px' }}>
          We&apos;re on a mission to help professionals grow their LinkedIn presence effortlessly through the power of AI.
        </p>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '20px', color: '#693fe9' }}>Our Story</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '20px' }}>
            Kommentify was born from a simple observation: professionals spend countless hours on LinkedIn trying to build their network and engage with their audience, often with limited results. We believed there had to be a better way.
          </p>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '20px' }}>
            In 2024, we launched Kommentify as an AI-powered LinkedIn automation tool designed to help busy professionals, entrepreneurs, and businesses grow their presence without sacrificing their time or authenticity.
          </p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '20px', color: '#693fe9' }}>What We Do</h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {[
              { title: '🤖 AI-Powered Comments', desc: 'Generate intelligent, context-aware comments that sound natural and drive engagement.' },
              { title: '🔗 Smart Networking', desc: 'Automatically connect with relevant professionals to expand your network.' },
              { title: '📝 Post Scheduling', desc: 'Plan and schedule your LinkedIn content in advance for optimal timing.' },
              { title: '📊 Analytics', desc: 'Track your growth and engagement with detailed analytics and insights.' }
            ].map((item, i) => (
              <div key={i} style={{ 
                background: 'rgba(105, 63, 233, 0.1)', 
                padding: '20px', 
                borderRadius: '12px',
                border: '1px solid rgba(105, 63, 233, 0.3)'
              }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '20px', color: '#693fe9' }}>Our Values</h2>
          <ul style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', paddingLeft: '20px' }}>
            <li><strong>Authenticity:</strong> We help you engage genuinely, not spam.</li>
            <li><strong>Efficiency:</strong> Save hours every week while growing your presence.</li>
            <li><strong>Privacy:</strong> Your data is yours. We never sell or share it.</li>
            <li><strong>Innovation:</strong> Constantly improving with cutting-edge AI technology.</li>
          </ul>
        </section>

        <section style={{ 
          background: 'linear-gradient(135deg, rgba(105, 63, 233, 0.2), rgba(168, 85, 247, 0.2))',
          padding: '40px',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '15px' }}>Ready to Grow?</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '25px' }}>
            Join thousands of professionals who are already using Kommentify to grow their LinkedIn presence.
          </p>
          <Link href="/signup" style={{ 
            display: 'inline-block',
            background: 'linear-gradient(135deg, #693fe9, #5835c7)',
            color: 'white',
            padding: '14px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            Get Started Free
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
