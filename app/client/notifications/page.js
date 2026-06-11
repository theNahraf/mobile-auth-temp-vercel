'use client';

import { useState, useEffect } from 'react';
import { getBroadcasts } from '@/lib/firestore';
import { formatDateTime } from '@/lib/utils';

export default function NotificationsPage() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getBroadcasts(50);
        setBroadcasts(data);
      } catch (err) {
        console.error('Fetch broadcasts error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return (
    <div className="container">
      <h1 className="heading-lg animate-fade-in" style={{ marginBottom: '1.25rem', fontSize: '1.35rem' }}>🔔 Notifications</h1>

      {loading ? (
        <div className="flex-col gap-md">
          {[1,2,3].map(i => (
            <div key={i} className="shimmer shimmer-card" style={{ height: '80px' }} />
          ))}
        </div>
      ) : broadcasts.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ minHeight: '200px' }}>
            <div className="empty-state-icon" style={{ fontSize: '2.5rem' }}>📢</div>
            <div className="empty-state-title" style={{ fontSize: '1rem' }}>No notifications yet</div>
            <div className="empty-state-desc" style={{ fontSize: '0.85rem' }}>Check back later for updates and announcements</div>
          </div>
        </div>
      ) : (
        <div className="flex-col gap-sm">
          {broadcasts.map((broadcast) => (
            <div
              key={broadcast.id}
              className="card card-interactive animate-fade-in-up"
              onClick={() => setExpandedId(expandedId === broadcast.id ? null : broadcast.id)}
              style={{ cursor: 'pointer', padding: '1rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 className="heading-sm" style={{ marginBottom: '0.25rem', fontSize: '0.95rem' }}>{broadcast.title}</h3>
                  {expandedId !== broadcast.id && (
                    <p className="body-sm text-secondary" style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {broadcast.body?.substring(0, 100)}...
                    </p>
                  )}
                </div>
                <span className="body-xs text-tertiary" style={{ whiteSpace: 'nowrap', fontSize: '0.68rem', flexShrink: 0 }}>
                  {formatDateTime(broadcast.createdAt)}
                </span>
              </div>
              {expandedId === broadcast.id && (
                <div className="animate-fade-in" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <p className="body-md" style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '0.88rem' }}>{broadcast.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
