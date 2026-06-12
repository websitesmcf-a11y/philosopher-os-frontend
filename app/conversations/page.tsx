'use client';

import { useQuery } from '@tanstack/react-query';
import { listConversations } from '@/lib/api-client';
import { MessageSquare, Search } from 'lucide-react';
import { useState } from 'react';
import { usePageTitle } from '@/lib/use-page-title';

const CHANNEL_ICONS: Record<string, string> = {
  whatsapp: '#4A6741', email: '#3B5E7A', web: '#735C00', sms: '#7A543B',
};

export default function ConversationsPage() {
  usePageTitle('Conversations');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => listConversations({ page: 1 }),
  });

  const conversations = data?.items ?? [];

  return (
    <div className="page-content page-enter">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Conversations</h1>
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
          All client and lead conversations across channels
        </p>
      </div>

      <div style={{ position: 'relative', maxWidth: 320, marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." style={{ paddingLeft: 34 }} />
      </div>

      <div className="etched-surface" style={{ overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Channel</th>
              <th>Status</th>
              <th>Last Message</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading...</td></tr>
            )}
            {!isLoading && conversations.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No conversations yet</td></tr>
            )}
            {conversations.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 8, height: 8,
                      background: CHANNEL_ICONS[c.channel] || 'var(--muted)',
                    }} />
                    <span style={{ textTransform: 'capitalize' }}>{c.channel}</span>
                  </div>
                </td>
                <td>
                  <span className="badge" style={{
                    background: c.status === 'active' ? 'rgba(74,103,65,0.1)' : 'var(--surface-inset)',
                    color: c.status === 'active' ? 'var(--success)' : 'var(--muted)',
                  }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {c.last_message_at ? new Date(c.last_message_at).toLocaleString() : '—'}
                </td>
                <td style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
