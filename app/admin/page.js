'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { subscribeToUserCount, subscribeToLeadCount, subscribeToNewLeads, getBroadcasts } from '@/lib/firestore';
import { timeAgo, SERVICE_CATEGORIES } from '@/lib/utils';

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [newLeads, setNewLeads] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribers = [];
    async function init() {
      try {
        try { unsubscribers.push(subscribeToUserCount((count) => setTotalUsers(count))); } catch(e) {}
        try { unsubscribers.push(subscribeToLeadCount((count) => setTotalLeads(count))); } catch(e) {}
        try { unsubscribers.push(subscribeToNewLeads((leads) => setNewLeads(leads))); } catch(e) {}
        try { const b = await getBroadcasts(10); setBroadcasts(b); } catch(e) {}
      } catch (err) {
        console.error('Admin dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
    return () => unsubscribers.forEach(unsub => { if (typeof unsub === 'function') unsub(); });
  }, []);

  const stats = [
    { icon: '👥', value: totalUsers, label: 'Total Users', color: '#1A237E' },
    { icon: '📋', value: newLeads.length, label: 'New Leads', color: '#C62828' },
    { icon: '📊', value: totalLeads, label: 'Total Leads', color: '#2E7D32' },
    { icon: '📣', value: broadcasts.length, label: 'Broadcasts', color: '#FF8F00' },
  ];

  const getServiceIcon = (serviceName) => {
    const s = SERVICE_CATEGORIES.find(c => c.id === serviceName || c.name.toLowerCase() === serviceName?.toLowerCase());
    return s?.icon || '📋';
  };

  return (
    <div>
      {/* Welcome */}
      <div className="section animate-fade-in">
        <h1 className="heading-lg">Welcome back, Admin 👋</h1>
        <p className="body-md text-secondary">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid-4 section animate-fade-in-up delay-1">
        {stats.map((stat, i) => (
          <div key={i} className="stats-card">
            <div className="stats-icon" style={{ background: `${stat.color}15` }}>
              <span>{stat.icon}</span>
            </div>
            <div className="stats-info">
              <div className="stats-value mono">{loading ? '-' : stat.value}</div>
              <div className="stats-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="section animate-fade-in-up delay-2">
        <div className="section-header">
          <h2 className="section-title">Recent Leads</h2>
          <Link href="/admin/leads" className="section-link">View All →</Link>
        </div>

        {newLeads.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No leads yet</div>
              <div className="empty-state-desc">New leads will appear here when clients submit enquiries</div>
            </div>
          </div>
        ) : (
          <div className="flex-col gap-sm">
            {newLeads.map((lead) => (
              <Link key={lead.id} href={`/admin/leads/${lead.id}`} style={{ textDecoration: 'none' }}>
                <div className="lead-card">
                  <div className="avatar avatar-md avatar-initials">
                    {lead.name?.charAt(0) || '?'}
                  </div>
                  <div className="lead-card-info">
                    <div className="lead-card-name">{lead.name}</div>
                    <div className="lead-card-detail">
                      {getServiceIcon(lead.service)} {lead.service} • {lead.city || 'N/A'}
                    </div>
                    <div className="lead-card-meta">
                      <span className="body-xs text-tertiary">{timeAgo(lead.createdAt)}</span>
                      <span className={`status-badge status-${lead.status}`}>
                        {lead.status === 'new' ? 'New' : lead.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="section animate-fade-in-up delay-3">
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>Quick Actions</h2>
        <div className="grid-3">
          <Link href="/admin/leads" style={{ textDecoration: 'none' }}>
            <div className="card card-interactive" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📋</div>
              <div className="heading-sm">View All Leads</div>
              <div className="body-sm text-secondary mt-1">Manage and track all enquiries</div>
            </div>
          </Link>
          <Link href="/admin/broadcast" style={{ textDecoration: 'none' }}>
            <div className="card card-interactive" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📣</div>
              <div className="heading-sm">Send Broadcast</div>
              <div className="body-sm text-secondary mt-1">Announce to all clients</div>
            </div>
          </Link>
          <Link href="/admin/settings" style={{ textDecoration: 'none' }}>
            <div className="card card-interactive" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚙️</div>
              <div className="heading-sm">App Settings</div>
              <div className="body-sm text-secondary mt-1">Configure your app</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
