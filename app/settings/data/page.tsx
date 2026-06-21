'use client';

import { useState, useEffect } from 'react';
import {
  Database, ArrowLeft, Download, Clock, AlertTriangle,
  Trash2, HardDrive, Upload, Zap, Loader2, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const STORAGE_KEY_RETENTION = 'philosopher_data_retention';

type RetentionPeriod = '3months' | '6months' | '1year' | '2years' | 'forever';

const RETENTION_OPTIONS: { value: RetentionPeriod; label: string }[] = [
  { value: '3months', label: '3 months' },
  { value: '6months', label: '6 months' },
  { value: '1year', label: '1 year' },
  { value: '2years', label: '2 years' },
  { value: 'forever', label: 'Forever' },
];

const RETENTION_DEFAULT: RetentionPeriod = '1year';

function loadRetention(): RetentionPeriod {
  if (typeof window === 'undefined') return RETENTION_DEFAULT;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_RETENTION);
    if (stored && RETENTION_OPTIONS.some(o => o.value === stored)) {
      return stored as RetentionPeriod;
    }
  } catch {
    // ignore
  }
  return RETENTION_DEFAULT;
}

function persistRetention(value: RetentionPeriod) {
  try {
    localStorage.setItem(STORAGE_KEY_RETENTION, value);
  } catch {
    // storage full
  }
}

interface ConfirmState {
  type: 'clear-leads' | 'clear-conversations' | 'reset-everything';
  step: number;
}

export default function DataSettingsPage() {
  const [loaded, setLoaded] = useState(false);
  const [retention, setRetention] = useState<RetentionPeriod>(RETENTION_DEFAULT);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  useEffect(() => {
    setRetention(loadRetention());
    setLoaded(true);
  }, []);

  const handleRetentionChange = (value: string) => {
    const v = value as RetentionPeriod;
    setRetention(v);
    persistRetention(v);
    toast.success(`Data retention set to ${RETENTION_OPTIONS.find(o => o.value === v)?.label}`);
  };

  const handleExport = (type: 'leads' | 'clients' | 'all') => {
    const label = type === 'leads' ? 'Leads CSV' : type === 'clients' ? 'Clients CSV' : 'All Data JSON';
    toast.success(`Export started — your download will begin shortly`);
  };

  const handleClearAction = () => {
    if (!confirm) return;

    if (confirm.type === 'clear-leads') {
      if (confirm.step < 1) {
        setConfirm({ ...confirm, step: 1 });
        return;
      }
      toast.success('All leads have been cleared');
    } else if (confirm.type === 'clear-conversations') {
      if (confirm.step < 1) {
        setConfirm({ ...confirm, step: 1 });
        return;
      }
      toast.success('All conversations have been cleared');
    } else if (confirm.type === 'reset-everything') {
      if (confirm.step < 2) {
        setConfirm({ ...confirm, step: confirm.step + 1 });
        return;
      }
      // Third step needs user to type "RESET"
      // This is handled in the UI below
      toast.success('All data has been reset');
    }

    setConfirm(null);
  };

  // For triple-confirmation input
  const [resetTyped, setResetTyped] = useState('');

  const startConfirm = (type: ConfirmState['type']) => {
    setConfirm({ type, step: 0 });
    setResetTyped('');
  };

  const cancelConfirm = () => {
    setConfirm(null);
    setResetTyped('');
  };

  const handleConfirmReset = () => {
    if (resetTyped === 'RESET') {
      toast.success('All data has been reset');
      setConfirm(null);
      setResetTyped('');
    } else {
      toast.error('Type "RESET" to confirm');
    }
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

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, margin: 0, fontFamily: 'var(--font-heading)' }}>Data</h1>
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
          Data retention and export settings
        </p>
      </div>

      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Export Data */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Download size={18} color="var(--accent)" />
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Export Data</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
            Download your data in CSV or JSON format. Exports are generated asynchronously — you&apos;ll receive a notification when ready.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleExport('leads')}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={15} /> Export Leads (CSV)
            </button>
            <button
              type="button"
              onClick={() => handleExport('clients')}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={15} /> Export Clients (CSV)
            </button>
            <button
              type="button"
              onClick={() => handleExport('all')}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={15} /> Export All Data (JSON)
            </button>
          </div>
        </div>

        {/* Data Retention */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Clock size={18} color="var(--accent)" />
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Data Retention</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
            Automatically remove data older than the specified period. This applies to leads, conversations, and activity logs.
          </p>
          <div style={{ maxWidth: 280 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
              Keep data for
            </label>
            <select
              value={retention}
              onChange={e => handleRetentionChange(e.target.value)}
              style={{ width: '100%' }}
            >
              {RETENTION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <HardDrive size={18} color="var(--accent)" />
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Storage Usage</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--surface-inset)', borderRadius: 6 }}>
              <Database size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, color: 'var(--foreground)' }}>Database</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground-secondary)', fontFamily: 'var(--font-mono)' }}>12.4 MB</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--surface-inset)', borderRadius: 6 }}>
              <Upload size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, color: 'var(--foreground)' }}>Uploads</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground-secondary)', fontFamily: 'var(--font-mono)' }}>3.1 MB</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--surface-inset)', borderRadius: 6 }}>
              <Zap size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, color: 'var(--foreground)' }}>Cache</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground-secondary)', fontFamily: 'var(--font-mono)' }}>1.8 MB</span>
            </div>
            <div style={{
              marginTop: 8, height: 6, borderRadius: 3,
              background: 'var(--border)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '68%', height: '100%',
                background: 'var(--accent)',
                borderRadius: 3,
              }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              Total: 17.3 MB of 256 MB allocated
            </p>
          </div>
        </div>

        {/* Clear Data — Danger Zone */}
        <div className="card" style={{
          padding: 24,
          borderColor: 'var(--error)',
          borderWidth: 1,
          borderStyle: 'solid',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <AlertTriangle size={18} color="var(--error)" />
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--error)' }}>
              Danger Zone
            </h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
            These actions are irreversible. Please proceed with caution.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Clear All Leads */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'var(--surface-inset)',
              borderRadius: 6,
              gap: 16,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>Clear All Leads</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Remove all lead data from the system</div>
              </div>
              {confirm?.type === 'clear-leads' ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: 'var(--error)', fontWeight: 500, whiteSpace: 'nowrap' }}>Are you sure?</span>
                  <button
                    type="button"
                    onClick={handleClearAction}
                    className="btn btn-danger btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Trash2 size={13} /> Yes, Clear
                  </button>
                  <button
                    type="button"
                    onClick={cancelConfirm}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startConfirm('clear-leads')}
                  className="btn btn-danger btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
                >
                  <Trash2 size={13} /> Clear
                </button>
              )}
            </div>

            {/* Clear All Conversations */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'var(--surface-inset)',
              borderRadius: 6,
              gap: 16,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>Clear All Conversations</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Remove all conversation history</div>
              </div>
              {confirm?.type === 'clear-conversations' ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: 'var(--error)', fontWeight: 500, whiteSpace: 'nowrap' }}>Are you sure?</span>
                  <button
                    type="button"
                    onClick={handleClearAction}
                    className="btn btn-danger btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Trash2 size={13} /> Yes, Clear
                  </button>
                  <button
                    type="button"
                    onClick={cancelConfirm}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startConfirm('clear-conversations')}
                  className="btn btn-danger btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
                >
                  <Trash2 size={13} /> Clear
                </button>
              )}
            </div>

            {/* Reset Everything — Triple Confirm */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'rgba(139, 32, 32, 0.04)',
              border: '1px solid rgba(139, 32, 32, 0.15)',
              borderRadius: 6,
              gap: 16,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--error)' }}>Reset Everything</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Wipe all data and restore factory defaults</div>
              </div>
              {confirm?.type === 'reset-everything' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                  {confirm.step === 0 && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--error)', fontWeight: 500, whiteSpace: 'nowrap' }}>This will delete ALL data. Continue?</span>
                      <button
                        type="button"
                        onClick={handleClearAction}
                        className="btn btn-danger btn-sm"
                      >
                        Yes, Continue
                      </button>
                      <button
                        type="button"
                        onClick={cancelConfirm}
                        className="btn btn-ghost btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {confirm.step === 1 && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--error)', fontWeight: 500, whiteSpace: 'nowrap' }}>This is your last chance. Really reset?</span>
                      <button
                        type="button"
                        onClick={handleClearAction}
                        className="btn btn-danger btn-sm"
                      >
                        Yes, Reset
                      </button>
                      <button
                        type="button"
                        onClick={cancelConfirm}
                        className="btn btn-ghost btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {confirm.step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <span style={{ fontSize: 12, color: 'var(--error)', fontWeight: 500 }}>
                        Type <code style={{ fontWeight: 700 }}>RESET</code> to confirm
                      </span>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                          type="text"
                          value={resetTyped}
                          onChange={e => setResetTyped(e.target.value)}
                          placeholder="RESET"
                          style={{
                            width: 120, padding: '6px 10px', fontSize: 14,
                            fontFamily: 'var(--font-mono)',
                            textTransform: 'uppercase',
                          }}
                          onKeyDown={e => { if (e.key === 'Enter') handleConfirmReset(); }}
                        />
                        <button
                          type="button"
                          onClick={handleConfirmReset}
                          className="btn btn-danger btn-sm"
                          disabled={resetTyped !== 'RESET'}
                          style={resetTyped !== 'RESET' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          <Trash2 size={13} /> Confirm Reset
                        </button>
                        <button
                          type="button"
                          onClick={cancelConfirm}
                          className="btn btn-ghost btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startConfirm('reset-everything')}
                  className="btn btn-danger btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
                >
                  <Trash2 size={13} /> Reset
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
