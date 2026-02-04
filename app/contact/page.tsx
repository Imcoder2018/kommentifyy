'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open mailto link
    const mailtoLink = `mailto:support@kommentify.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`;
    window.open(mailtoLink);
    setSubmitted(true);
  };

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
          Contact Us
        </h1>

        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '40px' }}>
          Have questions or need help? We&apos;re here for you. Reach out and we&apos;ll get back to you as soon as possible.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Contact Info */}
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '25px', color: '#693fe9' }}>Get in Touch</h2>
            
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                <span style={{ fontSize: '24px' }}>📧</span>
                <div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Email</div>
                  <a href="mailto:support@kommentify.com" style={{ color: 'white', textDecoration: 'none' }}>
                    support@kommentify.com
                  </a>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                <span style={{ fontSize: '24px' }}>💬</span>
                <div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>WhatsApp</div>
                  <a href="https://wa.me/13072784862" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>
                    +13072784862
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>🌐</span>
                <div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Website</div>
                  <span style={{ color: 'white' }}>kommentify.com</span>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(105, 63, 233, 0.1)', 
              padding: '20px', 
              borderRadius: '12px',
              border: '1px solid rgba(105, 63, 233, 0.3)'
            }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>⚡ Quick Response</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                We typically respond within 24 hours. For urgent matters, reach out via WhatsApp.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '25px', color: '#693fe9' }}>Send a Message</h2>
            
            {submitted ? (
              <div style={{ 
                background: 'rgba(34, 197, 94, 0.1)', 
                padding: '30px', 
                borderRadius: '12px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '15px' }}>✅</span>
                <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Message Sent!</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                  We&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
                <textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #693fe9, #5835c7)',
                    color: 'white',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
