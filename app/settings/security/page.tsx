'use client';

import { useState, useEffect } from 'react';
import { Shield, ArrowLeft, Loader2, Smartphone, Key, Clock, LogIn, XCircle, CheckCircle, AlertTriangle, Info, Laptop, Monitor } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const TWOFA_STORAGE_KEY = 'philosopher_2fa_enabled';

interface LoginEvent {
  timestamp: string;
  ip: string;
  device: string;
  status: 'success' | 'failed';
}

interface ActiveSession {
  id: string;
  label: string;
  device: string;
  os: string;
  browser: string;
  current: boolean;
  lastActive: string;
}

const DUMMY_LOGIN_HISTORY: LoginEvent[] = [
  { timestamp: '2026-06-14 10:30', ip: '192.168.1.100', device: 'Chrome on Windows', status: 'success' },
  { timestamp: '2026-06-13 22:15', ip: '192.168.1.100', device: 'Chrome on Windows', status: 'success' },
  { timestamp: '2026-06-13 14:05', ip: '10.0.0.45', device: 'Safari on iOS', status: 'success' },
  { timestamp: '2026-06-12 09:30', ip: '203.0.113.50', device: 'Firefox on macOS', status: 'failed' },
  { timestamp: '2026-06-11 18:45', ip: '192.168.1.100', device: 'Chrome on Windows', status: 'success' },
];

const DUMMY_SESSIONS: ActiveSession[] = [
  {
    id: 'current-session',
    label: 'Current browser',
    device: 'Desktop',
    os: 'Windows 10',
    browser: 'Chrome 149',
    current: true,
    lastActive: 'Now',
  },
  {
    id: 'session-mobile',
    label: 'Mobile session',
    device: 'iPhone 15',
    os: 'iOS 19',
    browser: 'Safari',
    current: false,
    lastActive: '2 hours ago',
  },
];

const PASSWORD_REQUIREMENTS = [
  'At least 6 characters long',
  'Can include letters, numbers, and symbols',
  'Should not be a commonly used password',
  'Should not be the same as your email address',
  'Recommended: mix of uppercase, lowercase, numbers, and symbols',
];

function ToggleSwitch({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        width: 44,
        height: 24,
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        background: checked ? 'var(--accent)' : 'var(--border)',
        transition: 'background 0.2s ease',
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}
      />
    </button>
  );
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://jet-obligate-desktop.ngrok-free.dev/api/v1';

export default function SecuritySettingsPage() {
  const [loaded, setLoaded] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [testCode, setTestCode] = useState('');
  const [pendingAction, setPendingAction] = useState<'enable' | 'test' | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    (async () => {
      // Check 2FA status from backend
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_BASE}/auth/2fa/status`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setTwoFactorEnabled(data.enabled);
        }
      } catch {}

      // Check WhatsApp connection
      try {
        const waRes = await fetch('http://localhost:8088/api/status');
        if (waRes.ok) {
          const waData = await waRes.json();
          setWhatsappConnected(waData.connected);
          setWhatsappPhone(waData.phone || '');
        }
      } catch {}

      setLoaded(true);
    })();
  }, []);

  const handleTwoFactorToggle = async (enabled: boolean) => {
    if (enabled) {
      // Check WhatsApp first
      if (!whatsappConnected) {
        toast.error('Cannot enable 2FA — WhatsApp is not connected. Go to Integrations first.');
        return;
      }
      // Send test code first
      setSendingTest(true);
      setPendingAction('enable');
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_BASE}/auth/2fa/test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (res.ok) {
          setTestCode(data.code);
          setShowCodeInput(true);
          toast.success(`Test code sent to your WhatsApp (${data.phone})`);
        } else {
          toast.error(data.detail || 'Failed to send test code');
          setPendingAction(null);
        }
      } catch {
        toast.error('Cannot reach server — make sure the backend is running');
        setPendingAction(null);
      }
      setSendingTest(false);
    } else {
      // Disable 2FA via backend
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_BASE}/auth/2fa/setup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ action: 'disable' }),
        });
        if (res.ok) {
          setTwoFactorEnabled(false);
          toast.success('Two-factor authentication disabled');
        } else {
          const data = await res.json();
          toast.error(data.detail || 'Failed to disable 2FA');
        }
      } catch {
        toast.error('Cannot reach server');
      }
    }
  };

  const handleConfirmTestCode = async () => {
    if (!testCode) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/auth/2fa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: 'enable',
          phone: whatsappPhone,
          test_code: testCode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTwoFactorEnabled(true);
        setShowCodeInput(false);
        toast.success("✅ 2FA enabled! You'll receive WhatsApp codes when logging in.");
      } else {
        toast.error(data.detail || 'Failed to enable 2FA');
      }
    } catch {
      toast.error('Cannot reach server');
    }
    setPendingAction(null);
  };

  const handleSendTestOnly = async () => {
    setSendingTest(true);
    setPendingAction('test');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/auth/2fa/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setTestCode(data.code);
        setShowCodeInput(true);
        toast.success(`Test code sent to your WhatsApp — check your phone!`);
      } else {
        toast.error(data.detail || 'Test failed');
      }
    } catch {
      toast.error('Cannot reach server');
    }
    setSendingTest(false);
    setPendingAction(null);
  };

  const handleRevokeSession = (sessionId: string) => {
    setRevokingSession(sessionId);
    // Simulate revocation
    setTimeout(() => {
      setRevokingSession(null);
      if (sessionId === 'current-session') {
        toast.error('Cannot revoke your current session');
      } else {
        toast.success('Session revoked successfully');
      }
    }, 800);
  };

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
    <div className="page-content page-enter">
      <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Settings
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Security</h1>
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
          Security policies and authentication
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>

        {/* ─── Active Sessions ─────────────── */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header" style={{ borderBottom: '0.5px solid var(--border-light)', paddingBottom: 12, marginBottom: 16 }}>
            <Monitor size={16} color="var(--accent)" />
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Current Sessions</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {DUMMY_SESSIONS.map(session => (
              <div
                key={session.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: session.current ? 'var(--accent-subtle)' : 'transparent',
                  border: `1px solid ${session.current ? 'var(--accent)' : 'var(--border-light)'}`,
                  borderRadius: 'var(--radius)',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 'var(--radius)',
                      background: session.current ? 'var(--accent-subtle)' : 'var(--surface-inset)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Laptop size={18} color={session.current ? 'var(--accent)' : 'var(--muted)'} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
                        {session.label}
                      </span>
                      {session.current && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            fontFamily: 'var(--font-mono)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--success)',
                            color: '#fff',
                          }}
                        >
                          Current
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                      {session.os} &middot; {session.browser}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      Active {session.lastActive}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={revokingSession === session.id}
                  className="btn btn-danger btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  {revokingSession === session.id ? (
                    <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <XCircle size={12} />
                  )}
                  {session.current ? 'Sign Out' : 'Revoke'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Two-Factor Authentication ───── */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius)',
                  background: 'var(--accent-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <Smartphone size={18} color="var(--accent)" />
              </div>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
                  Two-Factor Authentication
                </h2>
                <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', lineHeight: 1.5 }}>
                  Get a verification code on WhatsApp every time you log in.
                  Requires <strong>WhatsApp to be connected</strong> in Integrations.
                </p>

                {/* WhatsApp connection status */}
                <div style={{
                  marginTop: 8,
                  padding: '6px 12px',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  background: whatsappConnected ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  color: whatsappConnected ? '#166534' : '#991B1B',
                  border: `1px solid ${whatsappConnected ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  {whatsappConnected ? (
                    <><CheckCircle size={14} /> WhatsApp connected {whatsappPhone ? `(${whatsappPhone})` : ''}</>
                  ) : (
                    <><XCircle size={14} /> WhatsApp not connected</>
                  )}
                </div>

                {twoFactorEnabled && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius)',
                      background: 'rgba(74, 122, 62, 0.08)',
                      border: '1px solid rgba(74, 122, 62, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: 'var(--success)',
                    }}
                  >
                    <CheckCircle size={16} />
                    Two-factor authentication is active — you'll receive codes on WhatsApp
                  </div>
                )}

                {/* Test code confirmation dialog */}
                {showCodeInput && (
                  <div style={{
                    marginTop: 16,
                    padding: 16,
                    borderRadius: 8,
                    background: 'rgba(201,162,77,0.06)',
                    border: '1px solid rgba(201,162,77,0.2)',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--foreground)' }}>
                      📱 Check your WhatsApp — a test code was sent!
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--foreground-secondary)', marginBottom: 12 }}>
                      Enter the 6-digit code you received on WhatsApp to confirm 2FA is working:
                    </p>
                    {pendingAction === 'enable' ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Enter code from WhatsApp"
                          value={testCode}
                          onChange={e => setTestCode(e.target.value)}
                          style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 16, letterSpacing: 4, textAlign: 'center' }}
                          maxLength={6}
                        />
                        <button className="btn btn-primary btn-sm" onClick={handleConfirmTestCode}>
                          <CheckCircle size={14} /> Confirm
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        Code sent ✓ (testing only — 2FA not enabled yet)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <ToggleSwitch
                checked={twoFactorEnabled}
                onChange={handleTwoFactorToggle}
                id="toggle-2fa"
              />
              {whatsappConnected && !twoFactorEnabled && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleSendTestOnly}
                  disabled={sendingTest}
                  style={{ fontSize: 11, whiteSpace: 'nowrap' }}
                >
                  {sendingTest ? <Loader2 size={12} className="spin" /> : null}
                  Test WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Login History ──────────────── */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header" style={{ borderBottom: '0.5px solid var(--border-light)', paddingBottom: 12, marginBottom: 16 }}>
            <LogIn size={16} color="var(--accent)" />
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Login History</h2>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>IP Address</th>
                <th>Device</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_LOGIN_HISTORY.map((event, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={13} color="var(--muted)" />
                      <span>{event.timestamp}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{event.ip}</span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--foreground-secondary)' }}>
                    {event.device}
                  </td>
                  <td>
                    {event.status === 'success' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--success)' }}>
                        <CheckCircle size={13} />
                        Success
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--error)' }}>
                        <XCircle size={13} />
                        Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ─── Active API Sessions ────────── */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header" style={{ borderBottom: '0.5px solid var(--border-light)', paddingBottom: 12, marginBottom: 16 }}>
            <Key size={16} color="var(--accent)" />
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Active API Sessions</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                padding: '14px 16px',
                background: 'var(--surface-inset)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>Default API Key</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Created June 1, 2026</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>1,247</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>requests today</div>
                </div>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)' }}>
                <span>Rate limit: 1,000/hr</span>
                <span>Last used: 2 min ago</span>
                <span>Scopes: read, write</span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
              Manage all API keys in the{' '}
              <Link
                href="/settings/api-keys"
                style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}
              >
                API Keys settings
              </Link>
              .
            </p>
          </div>
        </div>

        {/* ─── Password Requirements ──────── */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header" style={{ borderBottom: '0.5px solid var(--border-light)', paddingBottom: 12, marginBottom: 16 }}>
            <Info size={16} color="var(--accent)" />
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Password Requirements</h2>
          </div>

          <div
            style={{
              padding: '14px 16px',
              background: 'rgba(18, 60, 105, 0.05)',
              border: '1px solid rgba(18, 60, 105, 0.12)',
              borderRadius: 'var(--radius)',
            }}
          >
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PASSWORD_REQUIREMENTS.map((req, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--foreground-secondary)', lineHeight: 1.5 }}>
                  <CheckCircle size={14} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 16 }}>
            <Link
              href="/settings/profile"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
            >
              <Key size={14} />
              Change Password
            </Link>
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
