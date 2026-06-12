'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plug, CheckCircle2, XCircle, Loader2, RefreshCw, Trash2,
  MessageCircle, Share2, Camera, Mail, Sparkles, Bot, Cpu,
  Smartphone, WifiOff, Calendar, BookMarked,
} from 'lucide-react';
import { usePageTitle } from '@/lib/use-page-title';
import {
  getConnections, saveConnection, testConnection, deleteConnection,
  getWhatsAppStatus, getWhatsAppQr, getGoogleAuthUrl, googleCalendarSync,
  obsidianSync,
  type Connection,
} from '@/lib/api-client';

const PROVIDER_ICONS: Record<string, typeof Plug> = {
  whatsapp: MessageCircle,
  facebook: Share2,
  instagram: Camera,
  email: Mail,
  google_calendar: Calendar,
  obsidian: BookMarked,
  anthropic: Sparkles,
  openai: Bot,
  deepseek: Cpu,
};

function fieldLabel(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function StatusBadge({ status }: { status: Connection['status'] }) {
  if (status === 'connected') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
        <CheckCircle2 size={14} /> Connected
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#dc2626' }}>
        <XCircle size={14} /> Error
      </span>
    );
  }
  return (
    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>Not connected</span>
  );
}

const WA_STATUS_LABELS: Record<string, string> = {
  connected: 'Connected',
  connecting: 'Connecting…',
  waiting_for_scan: 'Waiting for scan',
  reconnecting: 'Reconnecting…',
  disconnected: 'No session — QR loading…',
  bridge_offline: 'Bridge offline',
};

/** Live WhatsApp link state: status pill + auto-refreshing login QR. */
function WhatsAppPanel() {
  const queryClient = useQueryClient();
  const { data: live } = useQuery({
    queryKey: ['whatsapp-live'],
    queryFn: getWhatsAppStatus,
    refetchInterval: 3000,
  });
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const qrAvailable = live?.qr_available ?? false;
  const connected = live?.connected ?? false;

  // Refresh the QR image while a scan is pending (Baileys rotates codes)
  useEffect(() => {
    if (!qrAvailable) { setQrUrl(null); return; }
    let cancelled = false;
    let current: string | null = null;
    const tick = async () => {
      const url = await getWhatsAppQr();
      if (cancelled) { if (url) URL.revokeObjectURL(url); return; }
      if (url) {
        if (current) URL.revokeObjectURL(current);
        current = url;
        setQrUrl(url);
      }
    };
    tick();
    const iv = setInterval(tick, 5000);
    return () => { cancelled = true; clearInterval(iv); if (current) URL.revokeObjectURL(current); };
  }, [qrAvailable]);

  // When the phone links, refresh the stored connection statuses
  useEffect(() => {
    if (connected) queryClient.invalidateQueries({ queryKey: ['connections'] });
  }, [connected, queryClient]);

  if (!live) return null;

  const label = WA_STATUS_LABELS[live.status] || live.status;
  const tone = connected ? '#16a34a' : live.status === 'bridge_offline' ? '#dc2626' : '#d97706';

  return (
    <div style={{ marginTop: 12, padding: 12, background: 'var(--background)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: tone }}>
        {connected ? <Smartphone size={14} /> : live.status === 'bridge_offline' ? <WifiOff size={14} /> : <Loader2 size={14} className="spin" />}
        {label}
        {connected && live.phone && <span style={{ fontWeight: 500, color: 'var(--foreground-secondary)' }}>+{live.phone}</span>}
      </div>
      {live.status === 'bridge_offline' && (
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '6px 0 0' }}>
          Start the bridge: <code>cd apps/wa-bot &amp;&amp; npm start</code> — the QR code will appear here automatically.
        </p>
      )}
      {!connected && qrUrl && (
        <div style={{ marginTop: 10, textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="WhatsApp login QR" width={220} height={220} style={{ background: 'white', padding: 8 }} />
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '8px 0 0' }}>
            WhatsApp → Settings → Linked Devices → Link a Device, then scan. The code refreshes automatically.
          </p>
        </div>
      )}
    </div>
  );
}

function GoogleCalendarSyncButton() {
  const [syncing, setSyncing] = useState(false);

  return (
    <button
      className="btn btn-secondary"
      style={{ fontSize: 13, width: '100%' }}
      disabled={syncing}
      onClick={async () => {
        setSyncing(true);
        try {
          const res = await googleCalendarSync();
          toast.success(`Synced ${res.total} events (pulled ${res.pulled}, pushed ${res.pushed})`);
        } catch (e: any) {
          toast.error(`Sync failed: ${e.message}`);
        } finally {
          setSyncing(false);
        }
      }}
    >
      {syncing ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
      {' '}Sync Now
    </button>
  );
}

function ObsidianSyncButton() {
  const [syncing, setSyncing] = useState(false);

  return (
    <button
      className="btn btn-secondary"
      style={{ fontSize: 13, width: '100%' }}
      disabled={syncing}
      onClick={async () => {
        setSyncing(true);
        try {
          const res = await obsidianSync();
          toast.success(`Synced ${res.written} files to vault`);
        } catch (e: any) {
          toast.error(`Sync failed: ${e.message}`);
        } finally {
          setSyncing(false);
        }
      }}
    >
      {syncing ? <Loader2 size={14} className="spin" /> : <BookMarked size={14} />}
      {' '}Sync Now
    </button>
  );
}

function configStrings(config: Record<string, unknown>, fields: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    const v = config?.[f];
    if (typeof v === 'string') out[f] = v;
  }
  return out;
}

function ConnectionCard({ conn }: { conn: Connection }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [config, setConfig] = useState<Record<string, string>>(configStrings(conn.config || {}, conn.config_fields));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['connections'] });

  const saveMut = useMutation({
    mutationFn: () => saveConnection(conn.provider, secrets, config),
    onSuccess: (res) => {
      if (res.status === 'connected') {
        toast.success(`${conn.label} connected — ${res.detail}`);
        setOpen(false);
        setSecrets({});
      } else {
        toast.error(`${conn.label}: ${res.detail}`);
      }
      invalidate();
    },
    onError: (e: Error) => toast.error(`Failed to save: ${e.message}`),
  });

  const testMut = useMutation({
    mutationFn: () => testConnection(conn.provider),
    onSuccess: (res) => {
      if (res.status === 'connected') toast.success(`${conn.label}: ${res.detail}`);
      else toast.error(`${conn.label}: ${res.detail}`);
      invalidate();
    },
    onError: (e: Error) => toast.error(`Test failed: ${e.message}`),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteConnection(conn.provider),
    onSuccess: () => {
      toast.success(`${conn.label} disconnected`);
      invalidate();
    },
    onError: (e: Error) => toast.error(`Failed to disconnect: ${e.message}`),
  });

  const Icon = PROVIDER_ICONS[conn.provider] || Plug;
  const busy = saveMut.isPending || testMut.isPending || deleteMut.isPending;

  return (
    <div className="etched-surface" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 38, height: 38, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--accent-subtle)', flexShrink: 0,
        }}>
          <Icon size={18} color="var(--accent)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{conn.label}</span>
            <StatusBadge status={conn.status} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{conn.description}</div>
          {conn.last_error && (
            <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{conn.last_error}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {conn.status !== 'disconnected' && (
            <>
              <button className="btn btn-ghost" onClick={() => testMut.mutate()} disabled={busy} title="Re-test connection" style={{ padding: 8 }}>
                {testMut.isPending ? <Loader2 size={15} className="spin" /> : <RefreshCw size={15} />}
              </button>
              <button className="btn btn-ghost" onClick={() => deleteMut.mutate()} disabled={busy} title="Disconnect" style={{ padding: 8, color: '#dc2626' }}>
                <Trash2 size={15} />
              </button>
            </>
          )}
          <button className="btn btn-primary" onClick={() => setOpen(!open)} disabled={busy} style={{ fontSize: 13 }}>
            {conn.status === 'connected' ? (conn.provider === 'email' ? 'Add inbox' : 'Update') : 'Connect'}
          </button>
        </div>
      </div>

      {conn.provider === 'whatsapp' && <WhatsAppPanel />}

      {conn.provider === 'google_calendar' && conn.status !== 'connected' && (conn.config as Record<string, string>)?.client_id && (
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button
            className="btn btn-primary"
            style={{ fontSize: 13, width: '100%' }}
            onClick={async () => {
              try {
                const { auth_url } = await getGoogleAuthUrl();
                window.open(auth_url, '_blank', 'width=600,height=700');
              } catch (e: any) {
                toast.error(`Failed to get auth URL: ${e.message}`);
              }
            }}
          >
            <Calendar size={14} /> Authorize with Google
          </button>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
            Opens a Google consent window. Grant access, then return here.
          </p>
        </div>
      )}

      {conn.provider === 'google_calendar' && conn.status === 'connected' && (
        <div style={{ marginTop: 12 }}>
          <GoogleCalendarSyncButton />
        </div>
      )}

      {conn.provider === 'obsidian' && conn.status === 'connected' && (
        <div style={{ marginTop: 12 }}>
          <ObsidianSyncButton />
        </div>
      )}

      {conn.provider === 'email' && Array.isArray(conn.config?.inboxes) && (conn.config.inboxes as string[]).length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {(conn.config.inboxes as string[]).map(addr => (
            <span key={addr} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px',
              fontSize: 12, border: '1px solid var(--border)',
              background: 'var(--background)', color: 'var(--foreground-secondary)',
            }}>
              <Mail size={11} />
              {addr}
              {conn.config.primary === addr && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)' }}>PRIMARY</span>}
            </span>
          ))}
        </div>
      )}

      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px' }}>{conn.docs}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {conn.secret_fields.map(field => (
              <div key={field}>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 3 }}>{fieldLabel(field)}</label>
                <input
                  type="password"
                  className="input"
                  placeholder={`Enter ${fieldLabel(field).toLowerCase()}`}
                  value={secrets[field] || ''}
                  onChange={e => setSecrets(s => ({ ...s, [field]: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>
            ))}
            {conn.config_fields.map(field => (
              <div key={field}>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 3 }}>{fieldLabel(field)}</label>
                <input
                  type="text"
                  className="input"
                  placeholder={`Enter ${fieldLabel(field).toLowerCase()}`}
                  value={config[field] || ''}
                  onChange={e => setConfig(c => ({ ...c, [field]: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" onClick={() => saveMut.mutate()} disabled={busy} style={{ fontSize: 13 }}>
              {saveMut.isPending ? <Loader2 size={14} className="spin" /> : 'Save & Test'}
            </button>
            <button className="btn btn-ghost" onClick={() => setOpen(false)} disabled={busy} style={{ fontSize: 13 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConnectionsPage() {
  usePageTitle('Connections');
  const { data, isLoading, error } = useQuery({
    queryKey: ['connections'],
    queryFn: getConnections,
  });

  const groups: Array<{ title: string; providers: string[] }> = [
    { title: 'Messaging & Social', providers: ['whatsapp', 'facebook', 'instagram', 'email'] },
    { title: 'Productivity', providers: ['google_calendar', 'obsidian'] },
    { title: 'AI Providers', providers: ['anthropic', 'deepseek', 'openai'] },
  ];

  return (
    <div className="page-content page-enter">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Connections</h1>
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
          Link external services so your AI agents can act on WhatsApp, Facebook, email, and more.
          Credentials are encrypted and tested live before saving.
        </p>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 14 }}>
          <Loader2 size={16} className="spin" /> Loading connections…
        </div>
      )}
      {error && (
        <div className="etched-surface" style={{ padding: 16, color: '#dc2626', fontSize: 14 }}>
          Could not load connections: {(error as Error).message}
        </div>
      )}

      {data && groups.map(group => {
        const items = data.connections.filter(c => group.providers.includes(c.provider));
        if (!items.length) return null;
        return (
          <div key={group.title} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', paddingLeft: 4, fontFamily: 'var(--font-heading)' }}>
              {group.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(conn => <ConnectionCard key={conn.provider} conn={conn} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
