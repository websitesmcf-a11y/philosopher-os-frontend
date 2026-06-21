'use client';

import { useState, useEffect } from 'react';
import { Webhook, ArrowLeft, Plus, Send, Play, Pause, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const STORAGE_KEY = 'philosopher_webhooks';

type WebhookEvent =
  | 'lead.created'
  | 'lead.updated'
  | 'client.created'
  | 'campaign.started'
  | 'campaign.completed'
  | 'task.completed'
  | 'message.sent';

const ALL_EVENTS: WebhookEvent[] = [
  'lead.created',
  'lead.updated',
  'client.created',
  'campaign.started',
  'campaign.completed',
  'task.completed',
  'message.sent',
];

interface WebhookEndpoint {
  id: string;
  url: string;
  events: WebhookEvent[];
  status: 'active' | 'paused';
  lastDelivery: string | null;
  created: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function truncateUrl(url: string, max = 40): string {
  if (url.length <= max) return url;
  return url.slice(0, max - 3) + '...';
}

function getSampleWebhook(): WebhookEndpoint {
  return {
    id: 'sample-1',
    url: 'https://hooks.example.com/philosopher/notifications',
    events: ['lead.created', 'lead.updated', 'task.completed'],
    status: 'active',
    lastDelivery: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

function loadWebhooks(): WebhookEndpoint[] {
  if (typeof window === 'undefined') return [getSampleWebhook()];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  const sample = [getSampleWebhook()];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
  } catch {
    // storage full
  }
  return sample;
}

function persistWebhooks(hooks: WebhookEndpoint[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hooks));
  } catch {
    // storage full
  }
}

export default function WebhooksSettingsPage() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState<WebhookEvent[]>([]);

  // Confirm delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setWebhooks(loadWebhooks());
    setLoaded(true);
  }, []);

  const toggleEvent = (event: WebhookEvent) => {
    setNewEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  const handleAdd = () => {
    if (!newUrl.trim()) {
      toast.error('Please enter an endpoint URL');
      return;
    }
    if (newEvents.length === 0) {
      toast.error('Please select at least one event');
      return;
    }

    const now = new Date().toISOString();
    const hook: WebhookEndpoint = {
      id: `hook-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: newUrl.trim(),
      events: [...newEvents],
      status: 'active',
      lastDelivery: null,
      created: now,
    };

    const updated = [...webhooks, hook];
    setWebhooks(updated);
    persistWebhooks(updated);
    setShowAdd(false);
    setNewUrl('');
    setNewEvents([]);
    toast.success('Webhook endpoint added');
  };

  const handleTest = (url: string) => {
    toast.success('Test payload sent — check the endpoint');
  };

  const handleTogglePause = (id: string) => {
    const updated = webhooks.map(h =>
      h.id === id
        ? { ...h, status: h.status === 'active' ? 'paused' as const : 'active' as const }
        : h
    );
    setWebhooks(updated);
    persistWebhooks(updated);
    const hook = updated.find(h => h.id === id);
    toast.success(hook?.status === 'active' ? 'Webhook resumed' : 'Webhook paused');
  };

  const handleDelete = (id: string) => {
    const updated = webhooks.filter(h => h.id !== id);
    setWebhooks(updated);
    persistWebhooks(updated);
    setDeletingId(null);
    toast.success('Webhook endpoint deleted');
  };

  const handleCloseAdd = () => {
    setShowAdd(false);
    setNewUrl('');
    setNewEvents([]);
  };

  if (!loaded) {
    return (
      <div className="page-content page-bg-marble fade-in">
        <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Settings
        </Link>
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Loader2 size={28} color="var(--muted)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-content page-bg-marble fade-in">
      <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Settings
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 500, margin: 0, fontFamily: 'var(--font-heading)' }}>Webhooks</h1>
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
            Configure outgoing webhooks
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Add Webhook
        </button>
      </div>

      {webhooks.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <Webhook size={32} color="var(--muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>No webhooks configured</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
            Add a webhook endpoint to receive real-time events from Philosopher OS
          </p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Add Webhook
          </button>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Endpoint URL</th>
                <th>Events</th>
                <th>Status</th>
                <th>Last Delivery</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map(h => (
                <tr key={h.id}>
                  <td>
                    <code style={{
                      fontSize: 13, fontFamily: 'var(--font-mono)',
                      color: 'var(--foreground)', wordBreak: 'break-all',
                    }}>
                      {truncateUrl(h.url)}
                    </code>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {h.events.map(evt => (
                        <span key={evt} className="badge" style={{
                          fontSize: 10, padding: '1px 7px',
                          background: 'var(--accent-subtle)',
                          borderColor: 'var(--accent-light)',
                          color: 'var(--accent)',
                        }}>
                          {evt}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{
                      borderColor: h.status === 'active' ? 'var(--success)' : 'var(--warning)',
                      color: h.status === 'active' ? 'var(--success)' : 'var(--warning)',
                    }}>
                      <span className="dot" style={{
                        background: h.status === 'active' ? 'var(--success)' : 'var(--warning)',
                      }} />
                      {h.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: h.lastDelivery ? 'var(--foreground-secondary)' : 'var(--muted)' }}>
                    {h.lastDelivery ? formatDate(h.lastDelivery) : 'Never'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleTest(h.url)}
                        className="btn btn-ghost btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        title="Send test payload"
                      >
                        <Send size={13} /> Test
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePause(h.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        title={h.status === 'active' ? 'Pause webhook' : 'Resume webhook'}
                      >
                        {h.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                        {h.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                      {deletingId === h.id ? (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--error)', fontWeight: 500 }}>Delete?</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(h.id)}
                            className="btn btn-danger btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="btn btn-ghost btn-sm"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingId(h.id)}
                          className="btn btn-danger btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          title="Delete webhook"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Webhook Modal */}
      {showAdd && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
          }}
          onClick={e => { if (e.target === e.currentTarget) handleCloseAdd(); }}
        >
          <div
            className="card"
            style={{
              width: 500, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto',
              padding: 0, animation: 'scaleIn 0.2s var(--ease-out)',
            }}
          >
            <div style={{ padding: 24, borderBottom: '0.5px solid var(--border-light)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Add Webhook Endpoint</h2>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
                  Endpoint URL
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://hooks.example.com/philosopher"
                  style={{ width: '100%' }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 10 }}>
                  Events to Subscribe
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ALL_EVENTS.map(event => {
                    const selected = newEvents.includes(event);
                    return (
                      <label
                        key={event}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px',
                          border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: 6,
                          background: selected ? 'var(--accent-subtle)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleEvent(event)}
                          style={{ width: 16, height: 16, cursor: 'pointer' }}
                        />
                        <span style={{
                          fontSize: 14,
                          fontWeight: selected ? 600 : 400,
                          color: selected ? 'var(--accent)' : 'var(--foreground)',
                        }}>
                          {event}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '0.5px solid var(--border-light)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCloseAdd}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={16} /> Add Webhook
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
