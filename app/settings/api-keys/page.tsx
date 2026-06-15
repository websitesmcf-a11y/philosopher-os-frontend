'use client';

import { useState, useEffect } from 'react';
import { Key, ArrowLeft, Plus, Copy, XCircle, Check, X, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const STORAGE_KEY = 'philosopher_api_keys';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  masked: string;
  created: string;
  lastUsed: string | null;
  status: 'active' | 'revoked';
  permissions: string[];
}

type Permission = 'read' | 'write' | 'admin';

const PERMISSION_LABELS: Record<Permission, string> = {
  read: 'Read',
  write: 'Write',
  admin: 'Admin',
};

function generateKey(): { key: string; masked: string } {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let random = '';
  for (let i = 0; i < 24; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const key = `sk-${random}`;
  const masked = `sk-...${random.slice(-4)}`;
  return { key, masked };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getSampleKeys(): ApiKey[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'sample-1',
      name: 'Development Key',
      key: 'sk-dev9f2x3k7m1p4q8r2t6v5w0',
      masked: 'sk-...v5w0',
      created: monthAgo,
      lastUsed: yesterday,
      status: 'active',
      permissions: ['read', 'write'],
    },
    {
      id: 'sample-2',
      name: 'Production Key',
      key: 'sk-prodm4k7a1b3c9d2e8f6g0h5j2',
      masked: 'sk-...h5j2',
      created: weekAgo,
      lastUsed: twoDaysAgo,
      status: 'active',
      permissions: ['read', 'write', 'admin'],
    },
  ];
}

function loadKeys(): ApiKey[] {
  if (typeof window === 'undefined') return getSampleKeys();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  // Seed sample keys
  const samples = getSampleKeys();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  } catch {
    // storage full
  }
  return samples;
}

function persistKeys(keys: ApiKey[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // storage full
  }
}

export default function ApiKeysSettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Generate modal
  const [showGenerate, setShowGenerate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<Permission[]>(['read']);
  const [generatedKey, setGeneratedKey] = useState<ApiKey | null>(null);

  // Revoke confirmation
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Reveal key
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  useEffect(() => {
    setKeys(loadKeys());
    setLoaded(true);
  }, []);

  const handleGenerate = () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }
    if (newKeyPermissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    const { key, masked } = generateKey();
    const now = new Date().toISOString();
    const newKey: ApiKey = {
      id: `key-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: newKeyName.trim(),
      key,
      masked,
      created: now,
      lastUsed: null,
      status: 'active',
      permissions: [...newKeyPermissions],
    };

    const updated = [...keys, newKey];
    setKeys(updated);
    persistKeys(updated);
    setGeneratedKey(newKey);
    toast.success('API key generated successfully');
  };

  const handleCopyKey = async (keyStr: string) => {
    try {
      await navigator.clipboard.writeText(keyStr);
      toast.success('API key copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleRevoke = (id: string) => {
    const updated = keys.map(k =>
      k.id === id ? { ...k, status: 'revoked' as const } : k
    );
    setKeys(updated);
    persistKeys(updated);
    setRevokingId(null);
    toast.success('API key revoked');
  };

  const handleCloseGenerate = () => {
    setShowGenerate(false);
    setNewKeyName('');
    setNewKeyPermissions(['read']);
    setGeneratedKey(null);
  };

  const togglePermission = (perm: Permission) => {
    setNewKeyPermissions(prev =>
      prev.includes(perm)
        ? prev.filter(p => p !== perm)
        : [...prev, perm]
    );
  };

  const activeKeys = keys.filter(k => k.status === 'active');

  if (!loaded) {
    return (
      <div className="page-content fade-in">
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
    <div className="page-content fade-in">
      <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Settings
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>API Keys</h1>
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
            Manage API keys and integrations
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowGenerate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Generate New Key
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <Key size={32} color="var(--muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>No API keys</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
            Generate your first API key to integrate with Philosopher OS
          </p>
          <button className="btn btn-primary" onClick={() => setShowGenerate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Generate New Key
          </button>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Created</th>
                <th>Last Used</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{k.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {k.permissions.map(p => (
                        <span key={p} className="badge" style={{ fontSize: 10, padding: '1px 6px' }}>
                          {PERMISSION_LABELS[p as Permission]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <code style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--foreground-secondary)' }}>
                        {revealedKey === k.id ? k.key : k.masked}
                      </code>
                      <button
                        type="button"
                        onClick={() => setRevealedKey(revealedKey === k.id ? null : k.id)}
                        className="btn-ghost"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
                        title={revealedKey === k.id ? 'Hide key' : 'Show key'}
                      >
                        {revealedKey === k.id ? <EyeOff size={14} color="var(--muted)" /> : <Eye size={14} color="var(--muted)" />}
                      </button>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--foreground-secondary)' }}>{formatDate(k.created)}</td>
                  <td style={{ fontSize: 13, color: k.lastUsed ? 'var(--foreground-secondary)' : 'var(--muted)' }}>
                    {k.lastUsed ? formatDate(k.lastUsed) : 'Never'}
                  </td>
                  <td>
                    <span className="badge" style={{
                      borderColor: k.status === 'active' ? 'var(--success)' : 'var(--error)',
                      color: k.status === 'active' ? 'var(--success)' : 'var(--error)',
                    }}>
                      <span className="dot" style={{
                        background: k.status === 'active' ? 'var(--success)' : 'var(--error)',
                        animation: k.status === 'active' ? 'glowPulse 2s infinite' : 'none',
                      }} />
                      {k.status === 'active' ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleCopyKey(k.key)}
                        className="btn btn-ghost btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        title="Copy key"
                      >
                        <Copy size={13} /> Copy
                      </button>
                      {k.status === 'active' ? (
                        revokingId === k.id ? (
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: 'var(--error)', fontWeight: 500 }}>Revoke?</span>
                            <button
                              type="button"
                              onClick={() => handleRevoke(k.id)}
                              className="btn btn-danger btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <Check size={13} /> Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setRevokingId(null)}
                              className="btn btn-ghost btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <X size={13} /> No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRevokingId(k.id)}
                            className="btn btn-danger btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            title="Revoke key"
                          >
                            <XCircle size={13} /> Revoke
                          </button>
                        )
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
        {activeKeys.length} active key{activeKeys.length !== 1 ? 's' : ''} — {keys.length - activeKeys.length} revoked
      </p>

      {/* Generate Key Modal */}
      {showGenerate && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
          }}
          onClick={e => { if (e.target === e.currentTarget && !generatedKey) handleCloseGenerate(); }}
        >
          <div
            className="card"
            style={{
              width: 460, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto',
              padding: 0, animation: 'scaleIn 0.2s var(--ease-out)',
            }}
          >
            {generatedKey ? (
              /* Show generated key */
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--accent-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Key size={18} color="var(--accent)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Key Generated</h2>
                    <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Save this key — you won&apos;t see it again</p>
                  </div>
                </div>

                <div style={{
                  padding: 16,
                  background: 'var(--surface-inset)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  marginBottom: 20,
                  wordBreak: 'break-all',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your API Key</div>
                  <code style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--foreground)' }}>{generatedKey.key}</code>
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyKey(generatedKey.key)}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Copy size={16} /> Copy Key
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseGenerate}
                    className="btn btn-secondary"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Generate form */
              <>
                <div style={{ padding: 24, borderBottom: '0.5px solid var(--border-light)' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Generate New API Key</h2>
                </div>

                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={e => setNewKeyName(e.target.value)}
                      placeholder="e.g. Development Key"
                      style={{ width: '100%' }}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 10 }}>
                      Permissions
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(['read', 'write', 'admin'] as Permission[]).map(perm => {
                        const selected = newKeyPermissions.includes(perm);
                        return (
                          <label
                            key={perm}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 14px',
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
                              onChange={() => togglePermission(perm)}
                              style={{ width: 16, height: 16, cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
                                {PERMISSION_LABELS[perm]}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                                {perm === 'read' ? 'Read access to resources' :
                                 perm === 'write' ? 'Read and write access to resources' :
                                 'Full administrative access'}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '16px 24px', borderTop: '0.5px solid var(--border-light)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleCloseGenerate}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus size={16} /> Generate Key
                  </button>
                </div>
              </>
            )}
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
