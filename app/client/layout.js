'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Link from 'next/link';

const navItems = [
  { href: '/client', icon: '🏠', label: 'Home' },
  { href: '/client/services', icon: '💼', label: 'Services' },
  { href: '/client/notifications', icon: '🔔', label: 'Alerts' },
  { href: '/client/profile', icon: '👤', label: 'Profile' },
];

export default function ClientLayout({ children }) {
  const { user, userProfile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && userProfile && userProfile.role === 'admin') {
      router.push('/admin');
    }
  }, [user, userProfile, loading, router]);

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

  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="client-content" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header with safe area */}
      <header className="header" style={{ paddingTop: `calc(0.75rem + env(safe-area-inset-top, 0))` }}>
        <div className="header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💰</span>
            <span className="header-title" style={{ fontSize: '1rem', fontWeight: 700 }}>Aakash Aggregators</span>
          </div>
        </div>
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ThemeToggle />
          <Link href="/client/notifications" className="notification-bell" style={{ fontSize: '1.25rem', padding: '0.25rem' }}>
            🔔
          </Link>
          <Link href="/client/profile" className="avatar avatar-sm avatar-initials" style={{ textDecoration: 'none', fontSize: '0.7rem' }}>
            {userProfile?.name ? getInitials(userProfile.name) : '?'}
          </Link>
        </div>
      </header>

      {/* Main Content with bottom padding for nav */}
      <main style={{ flex: 1, paddingTop: '0.75rem', paddingBottom: '5.5rem' }}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="nav-bottom">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="nav-item-icon" style={{ fontSize: '1.25rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
