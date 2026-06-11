'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (userProfile) {
      if (userProfile.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/client');
      }
    }
  }, [user, userProfile, loading, router]);

  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="text-center animate-fade-in">
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          animation: 'pulse 2s infinite'
        }}>
          💰
        </div>
        <h1 className="heading-lg text-gradient" style={{ marginBottom: '0.5rem' }}>
          Aakash Aggregators
        </h1>
        <p className="body-md text-secondary">Your Trusted Financial Partner</p>
        <div style={{
          marginTop: '2rem',
          width: '40px',
          height: '40px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary-light)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '2rem auto 0'
        }} />
      </div>
    </div>
  );
}
