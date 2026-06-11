'use client';

import { useState, useEffect } from 'react';
import { createBroadcast, getBroadcasts, deleteBroadcast, getAllUsers } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function AdminBroadcastPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [broadcasts, setBroadcasts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState('all');
  const [selectedUids, setSelectedUids] = useState([]);

  useEffect(() => {
    fetchBroadcasts();
    fetchUsers();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const data = await getBroadcasts(50);
      setBroadcasts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch all clients to allow targeted selection
      // Note: If you have thousands of users, this should be paginated/searched
      const { users: fetchedUsers } = await getAllUsers(null, 500); 
      setUsers(fetchedUsers);
    } catch(err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      showToast('Title and body are required', 'warning');
      return;
    }
    if (targetType === 'selected' && selectedUids.length === 0) {
      showToast('Please select at least one user', 'warning');
      return;
    }
    
    setSending(true);
    try {
      await createBroadcast({
        title: title.trim(),
        body: body.trim(),
        targetCity: 'all',
        targetUids: targetType === 'all' ? [] : selectedUids,
        createdBy: user?.uid || 'admin'
      });
      showToast('Broadcast sent successfully!', 'success');
      setTitle('');
      setBody('');
      setTargetType('all');
      setSelectedUids([]);
      fetchBroadcasts();
    } catch (err) {
      console.error(err);
      showToast('Failed to send broadcast', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this broadcast?')) return;
    try {
      await deleteBroadcast(id);
      showToast('Broadcast deleted', 'success');
      setBroadcasts(broadcasts.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
      showToast('Failed to delete broadcast', 'error');
    }
  };

  const toggleUserSelection = (uid) => {
    setSelectedUids(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 className="heading-lg animate-fade-in" style={{ marginBottom: '1.5rem' }}>📢 Broadcasts</h1>

      {/* Compose Section */}
      <div className="card animate-fade-in-up" style={{ marginBottom: '2rem' }}>
        <h2 className="heading-sm" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
          Compose New Message
        </h2>
        
        <form onSubmit={handleSend} className="flex-col gap-sm">
          <div className="input-group">
            <div className="flex-between">
              <label>Title</label>
              <span className="body-xs text-tertiary">{title.length}/60</span>
            </div>
            <input 
              className="input" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Important Market Update"
              maxLength={60}
            />
          </div>
          
          <div className="input-group">
            <label>Message Body</label>
            <textarea 
              className="textarea" 
              rows={5} 
              value={body} 
              onChange={e => setBody(e.target.value)} 
              placeholder="Type your message here..."
            />
          </div>

          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label>Target Audience</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  checked={targetType === 'all'} 
                  onChange={() => setTargetType('all')} 
                />
                All Users
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  checked={targetType === 'selected'} 
                  onChange={() => setTargetType('selected')} 
                />
                Selected Users
              </label>
            </div>
          </div>

          {targetType === 'selected' && (
            <div className="input-group" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px' }}>
              <label style={{ marginBottom: '0.5rem', display: 'block' }}>Select Recipients ({selectedUids.length} selected)</label>
              {users.length === 0 ? (
                <div className="text-secondary body-sm">No clients found or still loading...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {users.map(u => (
                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedUids.includes(u.id)}
                        onChange={() => toggleUserSelection(u.id)}
                      />
                      <span>{u.name || 'Unknown User'} <span className="text-secondary">({u.mobile || u.email})</span></span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex-between align-center mt-2">
            <span className={`badge ${targetType === 'all' ? 'badge-info' : 'badge-warning'} badge-outline`}>
              Target: {targetType === 'all' ? 'All Users' : `${selectedUids.length} Users`}
            </span>
            <button 
              type="submit" 
              className={`btn btn-primary ${sending ? 'btn-loading' : ''}`}
              disabled={sending || !title.trim() || !body.trim() || (targetType === 'selected' && selectedUids.length === 0)}
            >
              Send Broadcast
            </button>
          </div>
        </form>
      </div>

      {/* Past Broadcasts */}
      <div className="animate-fade-in-up delay-1">
        <h2 className="heading-sm" style={{ marginBottom: '1rem' }}>Past Broadcasts</h2>
        
        {loading ? (
          <div className="flex-col gap-sm">
            {[1,2].map(i => <div key={i} className="shimmer shimmer-card" style={{ height: '100px' }} />)}
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">No broadcasts sent yet</div>
            <div className="empty-state-desc">Use the form above to send your first message to clients.</div>
          </div>
        ) : (
          <div className="flex-col gap-sm">
            {broadcasts.map(broadcast => (
              <div key={broadcast.id} className="card">
                <div className="flex-between align-center mb-2">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3 className="heading-sm">{broadcast.title}</h3>
                    {broadcast.targetUids && broadcast.targetUids.length > 0 && (
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Targeted ({broadcast.targetUids.length})</span>
                    )}
                  </div>
                  <div className="flex-center" style={{ gap: '1rem' }}>
                    <span className="body-xs text-tertiary">{formatDateTime(broadcast.createdAt)}</span>
                    <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDelete(broadcast.id)}>🗑️</button>
                  </div>
                </div>
                <p className="body-sm text-secondary" style={{ whiteSpace: 'pre-wrap' }}>{broadcast.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
