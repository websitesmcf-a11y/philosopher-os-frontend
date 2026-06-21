'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { listConversations } from '@/lib/api-client';
import { MessageSquare, Search, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { usePageTitle } from '@/lib/use-page-title';
import { PageHeader } from '@/components/ui/page-header';

const CHANNEL_ICONS: Record<string, string> = {
  whatsapp: '#4A6741', email: '#3B5E7A', web: '#735C00', sms: '#7A543B',
};

export default function ConversationsPage() {
  usePageTitle('Conversations');
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => listConversations({ page: 1 }),
  });

  const conversations = data?.items ?? [];

  return (
    <div className="page-content page-bg-herald page-enter">
      <PageHeader
        title="Conversations"
        description="All client and lead conversations across channels"
        icon={MessageSquare}
        iconColor="#123C69"
      />

      <div style={{ position: 'relative', maxWidth: 320, marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." style={{ paddingLeft: 34 }} />
      </div>

      <div className="etched-surface" style={{ overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Channel</th>
              <th>Agent</th>
              <th>Status</th>
              <th>Last Message</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading...</td></tr>
            )}
            {!isLoading && conversations.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No conversations yet</td></tr>
            )}
            {conversations.map(c => {
              const agentName = c.extra_metadata?.agent;
              const chatPath = c.channel === 'agent' && agentName
                ? `/chat?agent=${agentName}`
                : `/chat`;
              return (
                <tr key={c.id} onClick={() => router.push(chatPath)} style={{ cursor: 'pointer' }}
                    className="stone-hover">
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
                    {agentName ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '2px 10px', fontSize: 12, fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'capitalize',
                        background: 'rgba(201,162,77,0.1)',
                        color: '#C9A24D',
                        border: '1px solid rgba(201,162,77,0.2)',
                        borderRadius: 'var(--radius)',
                      }}>
                        {agentName}
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: c.status === 'active' ? 'rgba(74,103,65,0.1)' : 'var(--surface-inset)',
                      color: c.status === 'active' ? 'var(--success)' : 'var(--muted)',
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, maxWidth: 280 }}>
                    <div style={{
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      color: c.last_message ? 'var(--foreground)' : 'var(--muted)',
                    }}>
                      {c.last_message ? c.last_message.slice(0, 80) + (c.last_message.length > 80 ? '…' : '') : 'No messages'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      {c.last_message_at ? new Date(c.last_message_at).toLocaleString() : '—'}
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
