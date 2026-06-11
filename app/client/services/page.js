'use client';

import Link from 'next/link';
import { SERVICE_CATEGORIES } from '@/lib/utils';

export default function ServicesPage() {
  return (
    <div className="container">
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>Our Services</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Comprehensive financial solutions for every need</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {SERVICE_CATEGORIES.map((service, index) => (
          <Link
            key={service.id}
            href={`/client/services/${service.id}`}
            className="card animate-fade-in-up"
            style={{
              textDecoration: 'none',
              borderTop: `3px solid ${service.color}`,
              animationDelay: `${index * 0.08}s`,
              animationFillMode: 'both',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{service.icon}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{service.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Tap to explore</div>
          </Link>
        ))}
      </div>

      <div className="disclaimer-footer" style={{ marginTop: '1.5rem', marginBottom: '1rem', borderRadius: 'var(--radius-sm)' }}>
        <p>Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing. Past performance is not indicative of future results. Aakash Aggregators (ARN: [ARN Number]) is a registered AMFI Mutual Fund Distributor. NISM Reg. No.: NISM-202400188719.</p>
      </div>
    </div>
  );
}
