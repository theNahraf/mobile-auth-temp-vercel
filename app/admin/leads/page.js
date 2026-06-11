'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLeads } from '@/lib/firestore';
import { timeAgo, SERVICE_CATEGORIES } from '@/lib/utils';
import Link from 'next/link';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchLeads() {
      try {
        const data = await getLeads();
        setLeads(data.leads || []);
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const getServiceIcon = (serviceName) => {
    const s = SERVICE_CATEGORIES.find(c => c.id === serviceName || c.name.toLowerCase() === serviceName?.toLowerCase());
    return s?.icon || '📋';
  };

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter;
    const matchesSearch = searchTerm === '' || 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.mobile?.includes(searchTerm) || 
      lead.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container">
      <div className="flex-between align-center" style={{ marginBottom: '1.5rem' }}>
        <h1 className="heading-lg">Manage Leads</h1>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div className="flex-between align-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
          <div className="tabs" style={{ margin: 0 }}>
            {['all', 'new', 'in_progress', 'resolved'].map(status => (
              <button
                key={status}
                className={`tab-item ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'All Leads' : status === 'new' ? 'New' : status === 'in_progress' ? 'In Progress' : 'Resolved'}
              </button>
            ))}
          </div>
          <div className="search-bar" style={{ flex: '1', minWidth: '250px', maxWidth: '400px' }}>
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by name, mobile, city..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-col gap-sm">
          {[1,2,3,4,5].map(i => <div key={i} className="shimmer shimmer-card" style={{ height: '80px' }} />)}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No leads found</div>
            <div className="empty-state-desc">There are no leads matching your current filters.</div>
          </div>
        </div>
      ) : (
        <div className="flex-col gap-sm">
          {filteredLeads.map((lead) => (
            <Link key={lead.id} href={`/admin/leads/${lead.id}`} style={{ textDecoration: 'none' }}>
              <div className="lead-card card card-interactive animate-fade-in-up">
                <div className="avatar avatar-md avatar-initials">
                  {lead.name?.charAt(0) || '?'}
                </div>
                <div className="lead-card-info" style={{ flex: 1, marginLeft: '1rem' }}>
                  <div className="flex-between align-center">
                    <div className="lead-card-name heading-sm">{lead.name}</div>
                    <span className={`status-badge status-${lead.status}`}>
                      {lead.status === 'new' ? 'New' : lead.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                    </span>
                  </div>
                  <div className="lead-card-detail text-secondary mt-1">
                    {getServiceIcon(lead.service)} {lead.service} {lead.subService ? `• ${lead.subService}` : ''} • 📍 {lead.city || 'N/A'}
                  </div>
                  <div className="lead-card-meta flex-between mt-2">
                    <span className="body-xs text-tertiary">📞 {lead.mobile}</span>
                    <span className="body-xs text-tertiary">🕒 {timeAgo(lead.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
