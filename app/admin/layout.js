'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Link from 'next/link';

const navItems = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/leads', icon: '📋', label: 'Leads' },
  { href: '/admin/services', icon: '💼', label: 'Services' },
  { href: '/admin/broadcast', icon: '📣', label: 'Broadcast' },
  { href: '/admin/users', icon: '👥', label: 'Users' },
  { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
];

export default function AdminLayout({ children }) {
  const { user, userProfile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && userProfile && userProfile.role !== 'admin') {
      router.push('/client');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary-light)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!user || !userProfile || userProfile.role !== 'admin') return null;

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <nav className={`nav-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="nav-logo">
          <h2>💰 Aakash Aggregators</h2>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Admin Panel</span>
        </div>
        <div className="flex-col" style={{ flex: 1, gap: '0.25rem' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <button
            className="nav-item"
            onClick={async () => {
              await signOut();
              router.push('/login');
            }}
            style={{ width: '100%', border: 'none', background: 'transparent' }}
          >
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="admin-content">
        {/* Header */}
        <header className="header-admin header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <span className="header-title">
              {navItems.find(item => item.href === pathname)?.label || 'Admin'}
            </span>
          </div>
          <div className="header-right">
            <ThemeToggle />
            <div className="avatar avatar-sm avatar-initials" style={{ fontSize: '0.7rem' }}>
              {userProfile?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '1.5rem' }}>
          {children}
        </main>
      </div>
    </>
  );
}
