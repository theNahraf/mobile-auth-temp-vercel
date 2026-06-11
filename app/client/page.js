'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { getGreeting, openWhatsApp, formatDate } from '@/lib/utils';
import { getBroadcasts, getAppSettings, getRecentUserLeads, getServices } from '@/lib/firestore';

export default function ClientDashboard() {
  const { userProfile } = useAuth();
  const [broadcasts, setBroadcasts] = useState([]);
  const [myLeads, setMyLeads] = useState([]);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [broadcastData, settingsData, leadsData, servicesData] = await Promise.all([
          getBroadcasts(20).catch(() => []), // Fetch more to filter down
          getAppSettings().catch(() => null),
          userProfile ? getRecentUserLeads(userProfile.uid, 5).catch(() => []) : Promise.resolve([]),
          getServices().catch(() => [])
        ]);
        
        // Filter broadcasts targeted at this user or everyone
        const visibleBroadcasts = broadcastData.filter(b => {
          return !b.targetUids || b.targetUids.length === 0 || (userProfile && b.targetUids.includes(userProfile.uid));
        }).slice(0, 5);
        
        setBroadcasts(visibleBroadcasts);
        setSettings(settingsData);
        setMyLeads(leadsData || []);
        setServices(servicesData.filter(s => s.isVisible !== false).sort((a,b) => a.order - b.order));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userProfile]);

  const greeting = getGreeting();
  const firstName = userProfile?.name?.split(' ')[0] || 'there';
  const whatsappNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';

  const openAdminWebsite = async () => {
    const url = 'https://www.aakashaggregators.com/';
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url });
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="container">
      {/* Greeting */}
      <div className="section animate-fade-in">
        <h1 className="greeting-text">{greeting}, {firstName} 👋</h1>
        <p className="greeting-sub" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Welcome to Aakash Aggregators</p>
      </div>

      {/* Broadcast Banner */}
      {broadcasts.length > 0 && (
        <div className="section animate-fade-in-up delay-1">
          <Link href="/client/notifications" style={{ textDecoration: 'none' }}>
            <div className="broadcast-banner">
              <span className="broadcast-icon" style={{ fontSize: '1.5rem' }}>📣</span>
              <div className="broadcast-content" style={{ flex: 1 }}>
                <div className="broadcast-title" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{broadcasts[0].title}</div>
                <div className="broadcast-preview" style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '0.15rem' }}>
                  {broadcasts[0].body?.substring(0, 80)}...
                </div>
              </div>
              <span style={{ fontSize: '1.25rem', opacity: 0.7 }}>→</span>
            </div>
          </Link>
        </div>
      )}

      {/* Your Recent Enquiries */}
      {myLeads.length > 0 && (
        <div className="section animate-fade-in-up delay-1">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 className="section-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Your Recent Enquiries</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myLeads.map((lead) => {
              const svcName = services.find(s => s.id === lead.service)?.name || lead.service;
              return (
                <div key={lead.id} className="card" style={{ padding: '1rem' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {svcName}
                    </div>
                    <div className={`status-badge status-${lead.status.replace('_', '-')}`}>
                      {lead.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="body-sm text-secondary" style={{ fontSize: '0.8rem' }}>
                    {lead.subService}
                  </div>
                  <div className="body-xs text-tertiary" style={{ marginTop: '0.5rem', fontSize: '0.72rem' }}>
                    Submitted on {formatDate(lead.createdAt?.toDate())}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Service Cards */}
      <div className="section animate-fade-in-up delay-2">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Our Services</h2>
          <Link href="/client/services" className="section-link" style={{ fontSize: '0.8rem', fontWeight: 600 }}>View All</Link>
        </div>
        <div className="service-scroll">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/client/services/${service.id}`}
              className="service-card"
              style={{ textDecoration: 'none' }}
            >
              <span className="service-card-icon" style={{ fontSize: '1.5rem' }}>{service.icon}</span>
              <span className="service-card-name" style={{ fontSize: '0.72rem', fontWeight: 500 }}>{service.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Market Info Widget */}
      <div className="section animate-fade-in-up delay-3">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Market Overview</h2>
          <span className="body-xs text-tertiary" style={{ fontSize: '0.68rem' }}>Data refreshed daily</span>
        </div>
        <div className="market-widget">
          <div className="market-item" style={{ textAlign: 'center', flex: 1 }}>
            <div className="market-label">SENSEX</div>
            <div className="market-value" style={{ fontSize: '1rem' }}>79,243.18</div>
            <div className="market-change market-up">▲ +0.45%</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
          <div className="market-item" style={{ textAlign: 'center', flex: 1 }}>
            <div className="market-label">NIFTY 50</div>
            <div className="market-value" style={{ fontSize: '1rem' }}>24,032.45</div>
            <div className="market-change market-up">▲ +0.38%</div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="section animate-fade-in-up delay-4">
        <div className="about-section" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border)' }}>
          <h2 className="heading-sm" style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>About Aakash Aggregators</h2>
          <p className="body-md text-secondary" style={{ lineHeight: '1.7', fontSize: '0.85rem' }}>
            {settings?.aboutUsText ||
              'Aakash Aggregators is a NISM Certified Mutual Fund Advisory firm led by Mr. Vaneet Bansal, serving 1400+ satisfied clients across Delhi and India with over 10 years of experience in financial services.'}
          </p>
          <div className="nism-badge" style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 600, marginTop: '0.75rem' }}>
            ✅ NISM Certified | Reg. No.: NISM-202400188719
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-accent btn-sm"
              onClick={() => openWhatsApp(whatsappNumber, "Hi, I'd like to speak with a financial advisor from Aakash Aggregators.")}
            >
              💬 Talk to an Expert
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={openAdminWebsite}
              style={{ fontSize: '0.8rem' }}
            >
              🌐 Visit Website
            </button>
          </div>
        </div>
      </div>

      {/* SEBI Disclaimer */}
      <div className="disclaimer-footer animate-fade-in-up delay-5" style={{ marginBottom: '1rem', borderRadius: 'var(--radius-sm)' }}>
        <p>
          {settings?.sebiDisclaimer ||
            'Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing. Past performance is not indicative of future results. Aakash Aggregators (ARN: [ARN Number]) is a registered AMFI Mutual Fund Distributor. NISM Reg. No.: NISM-202400188719. This app is for informational purposes only and does not constitute financial advice.'}
        </p>
      </div>
    </div>
  );
}
