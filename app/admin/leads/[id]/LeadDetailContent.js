'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLead, updateLeadStatus, getUserEvents } from '@/lib/firestore';
import { formatDateTime, openWhatsApp, getWhatsAppLeadMessage, LEAD_STATUSES } from '@/lib/utils';
import Link from 'next/link';

export default function LeadDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    async function fetchLead() {
      try {
        if (!params.id) return;
        const leadData = await getLead(params.id);
        if (leadData) {
          setLead(leadData);
          setStatus(leadData.status || 'new');
          setAdminNotes(leadData.adminNotes || '');
          if (leadData.uid) {
            const userEvents = await getUserEvents(leadData.uid);
            setEvents(userEvents || []);
          }
        }
      } catch (err) {
        console.error('Error fetching lead:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLead();
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLeadStatus(params.id, status, adminNotes);
      setLead(prev => ({ ...prev, status, adminNotes }));
      alert('Lead updated successfully!');
    } catch (err) {
      console.error('Error saving lead:', err);
      alert('Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container flex-center" style={{ minHeight: '50vh' }}><div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} /></div>;
  }

  if (!lead) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">Lead Not Found</div>
          <div className="empty-state-desc">The requested lead does not exist.</div>
          <Link href="/admin/leads" className="btn btn-primary mt-3">Back to Leads</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex-between align-center animate-fade-in" style={{ marginBottom: '1.5rem' }}>
        <div className="flex-center" style={{ gap: '1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/admin/leads')}>← Back</button>
          <h1 className="heading-lg">Lead Details</h1>
        </div>
        <span className={`status-badge status-${status}`}>
          {status === 'new' ? 'New' : status === 'in_progress' ? 'In Progress' : 'Resolved'}
        </span>
      </div>

      <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Client Info */}
        <div className="flex-col gap-md">
          <div className="card animate-fade-in-up">
            <h2 className="heading-sm mb-3" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>Client Information</h2>

            <div className="flex-col gap-sm">
              <div>
                <div className="body-xs text-tertiary">Full Name</div>
                <div className="heading-sm">{lead.name}</div>
              </div>

              <div className="grid-2">
                <div>
                  <div className="body-xs text-tertiary">Mobile Number</div>
                  <a href={`tel:${lead.mobile}`} className="body-md text-primary" style={{ textDecoration: 'none', fontWeight: 500 }}>
                    {lead.mobile}
                  </a>
                </div>
                <div>
                  <div className="body-xs text-tertiary">Email Address</div>
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`} className="body-md text-primary" style={{ textDecoration: 'none' }}>
                      {lead.email}
                    </a>
                  ) : <span className="body-md text-secondary">N/A</span>}
                </div>
              </div>

              <div>
                <div className="body-xs text-tertiary">City / Locality</div>
                <div className="body-md">{lead.city || 'N/A'}</div>
              </div>

              <div>
                <div className="body-xs text-tertiary">Enquiry Date</div>
                <div className="body-md">{formatDateTime(lead.createdAt)}</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href={`tel:${lead.mobile}`} className="btn btn-secondary btn-full flex-1" style={{ textDecoration: 'none' }}>
                📞 Call
              </a>
              <button
                className="btn btn-accent btn-full flex-1"
                onClick={() => openWhatsApp(lead.mobile, getWhatsAppLeadMessage(lead.name, lead.service))}
              >
                💬 WhatsApp
              </button>
            </div>
          </div>

          <div className="card animate-fade-in-up delay-1">
            <h2 className="heading-sm mb-3" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>Enquiry Details</h2>

            <div className="flex-col gap-sm">
              <div>
                <div className="body-xs text-tertiary">Service of Interest</div>
                <div className="heading-sm text-primary">{lead.service}</div>
              </div>

              {lead.subService && (
                <div>
                  <div className="body-xs text-tertiary">Sub-Service / Type</div>
                  <div className="body-md">{lead.subService}</div>
                </div>
              )}

              <div>
                <div className="body-xs text-tertiary">Preferred Callback Time</div>
                <div className="body-md capitalize">{lead.callbackTime || 'Any time'}</div>
              </div>

              <div>
                <div className="body-xs text-tertiary">Message / Query</div>
                <div className="body-md p-3 mt-1" style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', minHeight: '60px' }}>
                  {lead.message || <span className="text-tertiary italic">No message provided.</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Notes */}
        <div className="flex-col gap-md">
          <div className="card animate-fade-in-up delay-2">
            <h2 className="heading-sm mb-3" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>Manage Lead</h2>

            <div className="input-group">
              <label>Lead Status</label>
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {LEAD_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="input-group mt-3">
              <label>Admin Notes (Internal)</label>
              <textarea
                className="textarea"
                rows={6}
                placeholder="Add notes about conversations, requirements, next steps..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            <button
              className={`btn btn-primary btn-full mt-2 ${saving ? 'btn-loading' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              Save Updates
            </button>
          </div>

          {events.length > 0 && (
            <div className="card animate-fade-in-up delay-3">
              <h2 className="heading-sm mb-3" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>Activity Timeline</h2>
              <div className="flex-col gap-sm">
                {events.map((evt, i) => (
                  <div key={evt.id} style={{ display: 'flex', gap: '1rem', paddingBottom: i !== events.length -1 ? '1rem' : 0, borderBottom: i !== events.length -1 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ fontSize: '1.25rem', opacity: 0.8 }}>
                      {evt.eventType === 'enquiry_submitted' ? '📝' : evt.eventType === 'service_view' ? '👁️' : '🔔'}
                    </div>
                    <div>
                      <div className="body-sm">{evt.eventType === 'service_view' ? `Viewed ${evt.serviceType}` : evt.eventType === 'enquiry_submitted' ? `Submitted enquiry for ${evt.serviceType}` : evt.eventType}</div>
                      <div className="body-xs text-tertiary">{formatDateTime(evt.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
