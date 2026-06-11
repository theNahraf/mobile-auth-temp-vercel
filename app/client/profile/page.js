'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { updateUser, getLeads } from '@/lib/firestore';
import { formatDate, LEAD_STATUSES, openWhatsApp } from '@/lib/utils';

export default function ProfilePage() {
  const { user, userProfile, signOut, deleteAccount, setUserProfile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', mobile: '', city: '' });
  const [leads, setLeads] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setEditData({ name: userProfile.name || '', mobile: userProfile.mobile || '', city: userProfile.city || '' });
    }
  }, [userProfile]);

  useEffect(() => {
    if (user) {
      getLeads({ uid: user.uid }).then(data => setLeads(data.leads)).catch(() => {});
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(user.uid, editData);
      setUserProfile(prev => ({ ...prev, ...editData }));
      setEditing(false);
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try { await deleteAccount(); router.push('/login'); } catch (err) { console.error(err); }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const openAdminWebsite = async () => {
    const url = 'https://www.aakashaggregators.com/';
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url });
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Profile Card */}
      <div className="card animate-fade-in" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div className="avatar avatar-xl avatar-initials" style={{ margin: '0 auto 1rem', fontSize: '1.5rem', width: '4.5rem', height: '4.5rem' }}>
          {getInitials(userProfile?.name)}
        </div>
        <h2 className="heading-md" style={{ fontSize: '1.2rem' }}>{userProfile?.name || 'User'}</h2>
        <p className="body-sm text-secondary" style={{ fontSize: '0.85rem' }}>{userProfile?.email}</p>
        {userProfile?.mobile && <p className="body-sm text-secondary" style={{ fontSize: '0.85rem' }}>{userProfile.mobile}</p>}
        {userProfile?.city && <p className="body-xs text-tertiary mt-1">📍 {userProfile.city}</p>}
        <button className="btn btn-secondary btn-sm mt-2" onClick={() => setEditing(true)}>Edit Profile</button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2 style={{ fontSize: '1.1rem' }}>Edit Profile</h2><button className="modal-close" onClick={() => setEditing(false)}>✕</button></div>
            <div className="modal-body">
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>Name</label>
                <input className="input" value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} style={{ fontSize: '16px' }} />
              </div>
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>Mobile</label>
                <input className="input" value={editData.mobile} onChange={e => setEditData(p => ({ ...p, mobile: e.target.value }))} style={{ fontSize: '16px' }} />
              </div>
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>City</label>
                <input className="input" value={editData.city} onChange={e => setEditData(p => ({ ...p, city: e.target.value }))} style={{ fontSize: '16px' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} onClick={handleSave} disabled={saving}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* My Enquiries */}
      <div className="section animate-fade-in-up delay-1">
        <h2 className="section-title" style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 600 }}>📋 My Enquiries</h2>
        {leads.length === 0 ? (
          <div className="card"><div className="empty-state" style={{ padding: '1.5rem', minHeight: 'auto' }}><div className="empty-state-icon" style={{ fontSize: '2rem' }}>📋</div><div className="empty-state-title" style={{ fontSize: '0.95rem' }}>No enquiries yet</div><div className="empty-state-desc" style={{ fontSize: '0.82rem' }}>Submit an enquiry to get started</div></div></div>
        ) : (
          <div className="flex-col gap-sm">
            {leads.map(lead => (
              <div key={lead.id} className="card card-compact" style={{ padding: '1rem' }}>
                <div className="flex-between">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{lead.service}</div>
                    {lead.subService && <div className="body-xs text-secondary" style={{ fontSize: '0.78rem' }}>{lead.subService}</div>}
                    <div className="body-xs text-tertiary mt-1" style={{ fontSize: '0.72rem' }}>{formatDate(lead.createdAt)}</div>
                  </div>
                  <span className={`status-badge status-${lead.status}`} style={{ fontSize: '0.65rem' }}>
                    {lead.status === 'new' ? 'New' : lead.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help & Support */}
      <div className="section animate-fade-in-up delay-2">
        <h2 className="section-title" style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 600 }}>💬 Help & Support</h2>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-accent btn-sm" onClick={() => openWhatsApp(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999', 'Hi, I need help with my Aakash Aggregators account.')}>💬 WhatsApp</button>
            <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@aakashaggregators.com'}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>📧 Email</a>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={openAdminWebsite}
            style={{ justifyContent: 'flex-start', color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.8rem' }}
          >
            🌐 Visit www.aakashaggregators.com
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="section animate-fade-in-up delay-3">
        <h2 className="section-title" style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 600 }}>⚙️ Account</h2>
        <div className="card flex-col gap-sm">
          <a href="/privacy/" className="body-md" style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.9rem' }}>Privacy Policy →</a>
          <a href="/terms/" className="body-md" style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.9rem' }}>Terms of Service →</a>
          <div style={{ paddingTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>Delete Account</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowLogoutConfirm(true)}>Logout</button>
          </div>
        </div>
      </div>

      {/* App Version */}
      <div style={{ textAlign: 'center', padding: '1rem 0 0.5rem', color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>
        Aakash Aggregators v1.0.0
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal modal-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-body text-center" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h2 className="heading-md" style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Delete Account?</h2>
              <p className="body-sm text-secondary mb-3" style={{ fontSize: '0.85rem' }}>This action cannot be undone. All your data will be permanently deleted.</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete Forever</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal modal-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-body text-center" style={{ padding: '2rem' }}>
              <h2 className="heading-md" style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Log Out?</h2>
              <p className="body-sm text-secondary mb-3" style={{ fontSize: '0.85rem' }}>Are you sure you want to log out?</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleLogout}>Log Out</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
