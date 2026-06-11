'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, updateUser } from '@/lib/firestore';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for inline editing notes
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers(100);
      setUsers(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = (user) => {
    if (expandedId === user.uid) {
      setExpandedId(null);
    } else {
      setExpandedId(user.uid);
      setAdminNotes(user.adminNotes || '');
    }
  };

  const togglePriority = async (userId, currentStatus) => {
    try {
      await updateUser(userId, { isPriorityClient: !currentStatus });
      setUsers(users.map(u => u.uid === userId ? { ...u, isPriorityClient: !currentStatus } : u));
      showToast(`Priority status ${!currentStatus ? 'added' : 'removed'}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    }
  };

  const saveNotes = async (userId) => {
    setSavingNotes(true);
    try {
      await updateUser(userId, { adminNotes });
      setUsers(users.map(u => u.uid === userId ? { ...u, adminNotes } : u));
      showToast('Notes saved successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save notes', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const filteredUsers = users.filter(u => 
    searchTerm === '' || 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mobile?.includes(searchTerm) ||
    u.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="flex-between align-center" style={{ marginBottom: '1.5rem' }}>
        <h1 className="heading-lg">Users Directory</h1>
        <div className="search-bar" style={{ width: '300px' }}>
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex-col gap-sm">
          {[1,2,3,4].map(i => <div key={i} className="shimmer shimmer-card" style={{ height: '70px' }} />)}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">No users found</div>
          <div className="empty-state-desc">Try adjusting your search terms.</div>
        </div>
      ) : (
        <div className="flex-col gap-sm">
          {filteredUsers.map((user, index) => (
            <div key={user.uid} className="card animate-fade-in-up" style={{ padding: '1rem', animationDelay: `${index * 0.05}s` }}>
              <div 
                className="flex-between align-center" 
                style={{ cursor: 'pointer' }} 
                onClick={() => handleExpand(user)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="avatar avatar-md avatar-initials">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}>
                      <h3 className="heading-sm m-0">{user.name || 'Unknown User'}</h3>
                      {user.isPriorityClient && <span title="Priority Client">⭐</span>}
                      {user.role === 'admin' && <span className="badge badge-info badge-sm">Admin</span>}
                    </div>
                    <div className="body-xs text-secondary mt-1">
                      {user.email || 'No email'} {user.mobile ? `• ${user.mobile}` : ''}
                    </div>
                  </div>
                </div>
                <span style={{ transform: expandedId === user.uid ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</span>
              </div>

              {/* Expanded Details */}
              {expandedId === user.uid && (
                <div className="animate-fade-in" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                  <div className="grid-3" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <div className="body-xs text-tertiary">City / Location</div>
                      <div className="body-sm">{user.city || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="body-xs text-tertiary">Registered On</div>
                      <div className="body-sm">{formatDate(user.createdAt)}</div>
                    </div>
                    <div>
                      <div className="body-xs text-tertiary">Client Status</div>
                      <button 
                        className={`btn btn-sm mt-1 ${user.isPriorityClient ? 'btn-accent' : 'btn-secondary'}`}
                        onClick={() => togglePriority(user.uid, user.isPriorityClient)}
                      >
                        {user.isPriorityClient ? '⭐ Priority Client' : 'Mark as Priority'}
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Admin Notes</label>
                    <div style={{ position: 'relative' }}>
                      <textarea 
                        className="textarea" 
                        rows={3} 
                        value={adminNotes} 
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Internal notes about this client..."
                      />
                      <button 
                        className={`btn btn-primary btn-sm ${savingNotes ? 'btn-loading' : ''}`}
                        style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem' }}
                        onClick={() => saveNotes(user.uid)}
                        disabled={savingNotes || adminNotes === user.adminNotes}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
