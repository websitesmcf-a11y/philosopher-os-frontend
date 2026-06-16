'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, ArrowLeft, Save, Loader2, BellOff, BellRing, Send, AlertTriangle, CheckCircle, XCircle, MessageCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'philosopher_notification_settings';
const WHATSAPP_STORAGE_KEY = 'philosopher_whatsapp_notification_number';

type PermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  campaignUpdates: boolean;
  dailyBriefing: boolean;
  desktopNotifications: boolean;
  whatsappNotifications: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  taskReminders: true,
  campaignUpdates: true,
  dailyBriefing: false,
  desktopNotifications: false,
  whatsappNotifications: false,
};

const SETTINGS_META: { key: keyof NotificationSettings; label: string; description: string }[] = [
  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email (requires SMTP integration)' },
  { key: 'whatsappNotifications', label: 'WhatsApp Notifications', description: 'Send notifications to your WhatsApp number' },
  { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive push notifications in your browser' },
  { key: 'taskReminders', label: 'Task Reminders', description: 'Get reminded about upcoming and overdue tasks' },
  { key: 'campaignUpdates', label: 'Campaign Updates', description: 'Receive updates about campaign progress and results' },
  { key: 'dailyBriefing', label: 'Daily Briefing', description: 'Get a daily summary every morning' },
  { key: 'desktopNotifications', label: 'Desktop Notifications', description: 'Show browser notifications when tasks complete' },
];

function loadSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

function persistSettings(settings: NotificationSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage full or unavailable
  }
}

function getPermissionStatus(): PermissionStatus {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission as PermissionStatus;
}

async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (typeof Notification === 'undefined') return 'unsupported';
  const result = await Notification.requestPermission();
  return result as PermissionStatus;
}

function showBrowserNotification(title: string, options?: NotificationOptions) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      icon: '/favicon.ico',
      ...options,
    });
  } catch {
    // Notification failed silently
  }
}

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
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

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('default');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const router = useRouter();

  // Track tab visibility for summary notifications
  const [wasAgentRunning, setWasAgentRunning] = useState(false);
  const [tabHiddenTime, setTabHiddenTime] = useState<number | null>(null);

  useEffect(() => {
    const saved = loadSettings();
    setSettings(saved);
    setPermissionStatus(getPermissionStatus());
    try {
      const storedNum = localStorage.getItem(WHATSAPP_STORAGE_KEY);
      if (storedNum) setWhatsappNumber(storedNum);
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    // Tab visibility detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabHiddenTime(Date.now());
      } else {
        // User returned to tab
        if (tabHiddenTime) {
          const hiddenDuration = Date.now() - tabHiddenTime;
          if (hiddenDuration > 60000 && wasAgentRunning && settings.desktopNotifications && Notification.permission === 'granted') {
            showBrowserNotification('Philosopher OS', {
              body: `You were away for ${Math.round(hiddenDuration / 60000)}m. Check your task status for updates.`,
            });
          }
        }
        setTabHiddenTime(null);
        setWasAgentRunning(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [tabHiddenTime, wasAgentRunning, settings.desktopNotifications]);

  const updateSetting = useCallback((key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      // Persist immediately
      persistSettings(next);
      return next;
    });
  }, []);

  const handleDesktopToggle = async (enabled: boolean) => {
    if (enabled) {
      let status = getPermissionStatus();

      // If not already granted, request permission
      if (status !== 'granted') {
        status = await requestNotificationPermission();
        setPermissionStatus(status);
      }

      if (status === 'granted') {
        updateSetting('desktopNotifications', true);
        // Force show a test notification with a small delay so the browser registers the user gesture
        setTimeout(() => {
          try {
            const notif = new Notification('🔔 Philosopher OS', {
              body: 'Desktop notifications are WORKING! You\'ll get alerts here.',
            });
            setTimeout(() => notif.close(), 6000);
            toast.success('✅ Desktop notifications enabled — popup should appear!');
          } catch (e) {
            toast.error('Desktop notification failed — your browser may block popups');
          }
        }, 500);
      } else if (status === 'denied') {
        toast.error('❌ Permission denied. Unlock it: Browser URL bar → site info → Notifications → Allow');
        updateSetting('desktopNotifications', false);
      } else {
        toast.info('Click "Allow" when the browser prompts you, then toggle again.');
        updateSetting('desktopNotifications', false);
      }
    } else {
      updateSetting('desktopNotifications', false);
      toast.success('Desktop notifications disabled');
    }
  };

  const handleSendTestNotification = async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://jet-obligate-desktop.ngrok-free.dev/api/v1';
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
    const results: string[] = [];
    const failed: string[] = [];

    // ── Desktop test ─────────────────────────────────────
    if (settings.desktopNotifications) {
      const perm = Notification.permission;
      if (perm === 'granted') {
        try {
          const notif = new Notification('🔔 Philosopher OS', {
            body: 'Desktop notifications are WORKING!',
          });
          setTimeout(() => notif.close(), 5000);
          results.push('✅ Desktop: Notification sent to OS');
        } catch (e) {
          failed.push('Desktop: Browser rejected the notification');
          results.push('❌ Desktop: Browser blocked it');
        }
      } else if (perm === 'denied') {
        failed.push('Desktop: Permission was DENIED by your browser');
        results.push('❌ Desktop: Denied in browser settings');
      } else {
        // 'default' — never asked
        const newPerm = await Notification.requestPermission();
        if (newPerm === 'granted') {
          try {
            new Notification('🔔 Philosopher OS', { body: 'Desktop notifications are WORKING!' });
            results.push('✅ Desktop: Permission granted + sent!');
          } catch {
            results.push('❌ Desktop: Granted but failed to show');
          }
        } else {
          failed.push('Desktop: You clicked Block or dismissed the prompt');
          results.push('❌ Desktop: You denied the browser prompt');
        }
      }
    } else {
      results.push('⏭️ Desktop: Toggle is OFF');
    }

    // ── WhatsApp test via backend ────────────────────────
    if (settings.whatsappNotifications) {
      try {
        const res = await fetch(`${API_BASE}/notifications/test`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ channel: 'whatsapp' }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.status === 'sent') {
          results.push('✅ WhatsApp: Backend confirmed sent');
        } else {
          const msg = data.detail || 'Unknown error';
          failed.push(`WhatsApp: ${msg}`);
          results.push(`❌ WhatsApp: ${msg}`);
        }
      } catch {
        failed.push('WhatsApp: Cannot reach backend');
        results.push('❌ WhatsApp: Backend unreachable');
      }
    } else {
      results.push('⏭️ WhatsApp: Toggle is OFF');
    }

    // ── Email test via backend ───────────────────────────
    if (settings.emailNotifications) {
      try {
        const res = await fetch(`${API_BASE}/notifications/test`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ channel: 'email' }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.status === 'sent') {
          results.push('✅ Email: Backend confirmed sent');
        } else {
          const msg = data.detail || 'Failed';
          failed.push(`Email: ${msg}`);
          results.push(`❌ Email: ${msg}`);
        }
      } catch {
        failed.push('Email: Backend unreachable');
        results.push('❌ Email: Backend unreachable');
      }
    } else {
      results.push('⏭️ Email: Toggle is OFF');
    }

    // ── Show HONEST results ──────────────────────────────
    const allOk = failed.length === 0;
    if (allOk) {
      toast.success(results.join('\n'), { duration: 8000 });
    } else {
      toast.error(results.join('\n'), { duration: 10000 });
    }
  };

  const handleSave = () => {
    setSaving(true);
    try {
      persistSettings(settings);
      if (whatsappNumber) localStorage.setItem(WHATSAPP_STORAGE_KEY, whatsappNumber);
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const permissionIcon = () => {
    switch (permissionStatus) {
      case 'granted': return <CheckCircle size={14} color="var(--success)" />;
      case 'denied': return <XCircle size={14} color="var(--error)" />;
      case 'unsupported': return <AlertTriangle size={14} color="var(--warning)" />;
      default: return <Bell size={14} color="var(--muted)" />;
    }
  };

  const permissionLabel = () => {
    switch (permissionStatus) {
      case 'granted': return 'Granted - Notifications are active';
      case 'denied': return 'Denied - Update browser site settings to re-enable';
      case 'unsupported': return 'Not supported by this browser';
      default: return 'Not requested - Enable desktop notifications above';
    }
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

  const isDesktopGranted = permissionStatus === 'granted';

  return (
    <div className="page-content fade-in">
      <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Settings
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Notifications</h1>
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
          Email, push, and in-app notification preferences
        </p>
      </div>

      <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Notification Toggles */}
        <div className="card" style={{ padding: 8 }}>
          {SETTINGS_META.map((item, index) => (
            <div key={item.key}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 16px',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{item.description}</div>
                </div>
                <Toggle
                  checked={settings[item.key]}
                  onChange={v => {
                    if (item.key === 'desktopNotifications') {
                      handleDesktopToggle(v);
                    } else {
                      updateSetting(item.key, v);
                    }
                  }}
                  id={`toggle-${item.key}`}
                />
              </div>
              {index < SETTINGS_META.length - 1 && (
                <div style={{ height: '0.5px', background: 'var(--border-light)', margin: '0 16px' }} />
              )}
            </div>
          ))}
        </div>

        {/* WhatsApp Number Config */}
        {settings.whatsappNotifications && (
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageCircle size={16} color="#25D366" /> WhatsApp Notification Number
            </h2>
            <p style={{ fontSize: 12, color: 'var(--foreground-secondary)', marginBottom: 10 }}>
              Enter the phone number where you want to receive WhatsApp notifications (with country code, e.g. +27612345678)
            </p>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              placeholder="+27612345678"
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
              Requires WhatsApp integration to be connected in Integrations page
            </p>
          </div>
        )}

        {/* Email Setup Link */}
        {settings.emailNotifications && (
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={16} /> Email Notifications Setup
            </h2>
            <p style={{ fontSize: 12, color: 'var(--foreground-secondary)', marginBottom: 12 }}>
              Email notifications require SMTP to be configured. Connect your email in Integrations first.
            </p>
            <button
              onClick={() => router.push('/connections')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Mail size={14} /> Configure Email Integration
            </button>
          </div>
        )}

        {/* Permission Status */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, fontFamily: 'var(--font-heading)' }}>Browser Notification Status</h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 6,
            background: permissionStatus === 'granted' ? 'rgba(34,197,94,0.08)' :
                         permissionStatus === 'denied' ? 'rgba(239,68,68,0.08)' :
                         'var(--surface)',
            border: `1px solid ${
              permissionStatus === 'granted' ? 'rgba(34,197,94,0.2)' :
              permissionStatus === 'denied' ? 'rgba(239,68,68,0.2)' :
              'var(--border-light)'
            }`,
          }}>
            {permissionIcon()}
            <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{permissionLabel()}</span>
          </div>

          {permissionStatus === 'denied' && (
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
              Notifications are blocked by your browser. To re-enable, go to your browser site settings
              (look for the lock/info icon in the address bar) and allow notifications for this site.
            </p>
          )}

          {permissionStatus === 'granted' && (
            <button
              onClick={handleSendTestNotification}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12 }}
            >
              <Send size={14} />
              Send Test Notification
            </button>
          )}
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {saving ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 12 }}>
            {isDesktopGranted ? (
              <><BellRing size={14} /> Desktop alerts active</>
            ) : settings.desktopNotifications ? (
              <><BellOff size={14} /> Permission required</>
            ) : null}
          </div>
        </div>
      </div>

      {/* Notification Types Explainer */}
      <div className="card" style={{ padding: 24, maxWidth: 560 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={16} color="var(--accent)" />
          How Notifications Work
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              icon: '🖥️',
              label: 'Desktop Notifications',
              channel: 'Browser Notification API',
              setup: 'Toggle "Desktop Notifications" ON → your browser will ask for permission → click Allow. You\'ll get popup notifications for task completions, campaign updates, and reminders when the browser is open (even in another tab).',
              limit: 'Only works while your browser is running. Must grant permission per browser.',
            },
            {
              icon: '📧',
              label: 'Email Notifications',
              channel: 'SMTP Email (Resend)',
              setup: 'Go to Integrations → connect Email with an app password. Then enable "Email Notifications" here. Emails are sent for daily briefings, task reminders, and campaign summaries.',
              limit: 'Requires SMTP integration to be configured. Check your spam folder for first emails.',
            },
            {
              icon: '💬',
              label: 'WhatsApp Notifications',
              channel: 'wa-bot (Baileys / WhatsApp Web)',
              setup: 'Go to Integrations → connect WhatsApp by scanning the QR code. Then enter your phone number below and toggle "WhatsApp Notifications" ON. You\'ll get alerts for campaign completions, 2FA codes, and system updates directly on your phone.',
              limit: 'Requires WhatsApp to be connected. Session may expire every 2-4 weeks (re-scan QR code to reconnect).',
            },
            {
              icon: '📋',
              label: 'Task Reminders',
              channel: 'In-app + Notification API',
              setup: 'When you create a task with a due date, the system tracks it. If a task is overdue, you\'ll get a reminder. Works with whichever channels you have enabled above.',
              limit: 'Checks every 20 seconds via the scheduler. Only fires for tasks assigned to you or unassigned.',
            },
            {
              icon: '📊',
              label: 'Daily Briefing',
              channel: 'Email + WhatsApp',
              setup: 'When enabled, Plato (CEO agent) generates a morning briefing with key metrics, hot leads, pending tasks, and campaign stats. Delivered via your enabled channels.',
              limit: 'Generated once per day on first login. Requires at least one delivery channel to be connected.',
            },
            {
              icon: '🔐',
              label: '2FA Codes',
              channel: 'WhatsApp only',
              setup: 'When 2FA is enabled in Security settings, every login attempt sends a 6-digit verification code to your WhatsApp. You must enter this code to complete login.',
              limit: 'Requires WhatsApp to be connected. Codes expire after 5 minutes.',
            },
          ].map((item, i) => (
            <div key={i} style={{
              padding: 14, borderRadius: 8,
              border: '1px solid var(--border-light)',
              background: 'var(--surface)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>{item.label}</span>
                    <span style={{
                      fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600,
                      padding: '1px 6px', borderRadius: 3,
                      background: 'var(--accent-subtle)', color: 'var(--accent)',
                      letterSpacing: '0.02em',
                    }}>
                      {item.channel}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--foreground-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                    {item.setup}
                  </p>
                  <div style={{
                    marginTop: 6, fontSize: 11, color: 'var(--muted)',
                    display: 'flex', alignItems: 'flex-start', gap: 4,
                  }}>
                    <span style={{ fontWeight: 600, flexShrink: 0 }}>Note:</span>
                    <span>{item.limit}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
