'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin-login');
      return;
    }
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin-login');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { href: '/admin', icon: '📊', label: 'Dashboard' },
    { href: '/admin/users', icon: '👥', label: 'Users' },
    { href: '/admin/plans', icon: '💎', label: 'Plans' },
    { href: '/admin/extension-versions', icon: '📦', label: 'Extensions' },
    { href: '/admin/referrals', icon: '🎁', label: 'Referrals' },
    { href: '/admin/email-sequences', icon: '📧', label: 'Email Sequences' },
    { href: '/admin/scraped-posts', icon: '📋', label: 'Scraped Posts' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: '#693fe9',
        zIndex: 1000,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 15px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }} className="mobile-header">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 12px',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ☰
        </button>
        <h2 style={{ color: 'white', fontSize: '18px', margin: 0 }}>Admin Panel</h2>
        <button 
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          �
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1001
          }}
          className="mobile-overlay"
        />
      )}

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
        {/* Sidebar */}
        <div style={{
          width: '250px',
          minWidth: '250px',
          background: '#693fe9',
          color: 'white',
          padding: '20px',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 1002,
          transition: 'transform 0.3s ease'
        }} className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <h2 style={{ marginBottom: '30px', fontSize: '24px' }}>Admin Panel</h2>
          <nav>
            {navItems.map((item) => (
              <a 
                key={item.href}
                href={item.href} 
                style={{
                  display: 'block',
                  padding: '12px 15px',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  background: pathname === item.href ? 'rgba(255,255,255,0.2)' : 'transparent',
                  transition: 'background 0.3s'
                }}
              >
                {item.icon} {item.label}
              </a>
            ))}
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                marginTop: '30px',
                padding: '12px 15px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                textAlign: 'left'
              }}
            >
              🚪 Logout
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: 'clamp(15px, 4vw, 30px)', paddingTop: '30px' }} className="admin-content">
          {children}
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-header {
            display: flex !important;
          }
          .admin-sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            bottom: 0;
            transform: translateX(-100%);
            padding-top: 80px !important;
          }
          .admin-sidebar.sidebar-open {
            transform: translateX(0);
          }
          .admin-content {
            padding-top: 80px !important;
          }
        }
        
        @media (max-width: 480px) {
          .admin-sidebar {
            width: 280px !important;
            min-width: 280px !important;
          }
        }
      `}</style>
    </>
  );
}
