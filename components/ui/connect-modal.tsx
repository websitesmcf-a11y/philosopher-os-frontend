'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Image from 'next/image';
import { X, Loader2, Plug, Lock, AlertTriangle, MessageCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
// Derive the backend host for the agent WebSocket URL (strip /api/v1 suffix)
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, '');

type FieldKind = 'secret' | 'config';

interface ModalField {
  name: string;          // payload key sent to the backend
  label: string;
  kind: FieldKind;       // routed into `secrets` or `config`
  type?: 'text' | 'password' | 'email' | 'number';
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

interface ProviderSpec {
  image: string;                 // card art under /assets/...
  // Backend provider name in the connections PROVIDERS registry, or null when
  // the provider isn't backed by the API (stored locally only).
  backendProvider: string | null;
  instructions: { code?: boolean; text: string }[];
  fields: ModalField[];
  // Extra note rendered under the instructions (e.g. WhatsApp QR step).
  note?: string;
}

const CARD_BASE = '/assets/philosopher-os/integration-cards';

// Specialized, per-provider setup. UI provider keys (from page.tsx) map here.
export const PROVIDER_SPECS: Record<string, ProviderSpec> = {
  whatsapp: {
    image: `${CARD_BASE}/integration-whatsapp.jpg`,
    backendProvider: 'whatsapp',
    instructions: [
      { text: 'Open a terminal and run:' },
      { code: true, text: 'cd apps/wa-bot && npm start' },
      { text: 'A QR code will appear in the bot window.' },
      { text: 'On your phone, open WhatsApp → Settings → Linked Devices → Link a Device.' },
      { text: 'Scan the QR code, then save below to link this dashboard to the bridge.' },
    ],
    fields: [
      { name: 'bot_url', label: 'Bot URL', kind: 'config', type: 'text', defaultValue: 'http://localhost:8088', required: true },
    ],
  },
  smtp: {
    image: `${CARD_BASE}/integration-email.jpg`,
    backendProvider: 'email',
    instructions: [
      { text: 'Use an app password, not your normal login password.' },
      { text: 'Gmail: create one at myaccount.google.com/apppasswords' },
      { text: 'Outlook: account.microsoft.com/security' },
      { text: 'SMTP host/port are auto-detected for common providers — only fill them for a custom domain.' },
    ],
    fields: [
      { name: 'email_address', label: 'Email address', kind: 'config', type: 'email', placeholder: 'you@gmail.com', required: true },
      { name: 'app_password', label: 'App password', kind: 'secret', type: 'password', required: true },
      { name: 'smtp_host', label: 'SMTP host (optional)', kind: 'config', type: 'text', placeholder: 'smtp.gmail.com' },
      { name: 'smtp_port', label: 'SMTP port', kind: 'config', type: 'number', defaultValue: '587' },
    ],
  },
  'google-calendar': {
    image: `${CARD_BASE}/integration-google-calendar.jpg`,
    backendProvider: 'google_calendar',
    instructions: [
      { text: 'Go to console.cloud.google.com → APIs & Services → Credentials.' },
      { text: 'Create an OAuth client ID (type: Web application).' },
      { text: 'Enable the Google Calendar API for the project.' },
      { text: 'Add this authorized redirect URI:' },
      { code: true, text: 'http://localhost:8000/api/v1/connections/google_calendar/callback' },
      { text: 'Save the client ID and secret below, then click Authorize with Google to finish.' },
    ],
    fields: [
      { name: 'client_id', label: 'Client ID', kind: 'config', type: 'text', required: true },
      { name: 'client_secret', label: 'Client secret', kind: 'secret', type: 'password', required: true },
    ],
    note: 'After saving, an "Authorize with Google" link appears on the card to complete the OAuth consent flow.',
  },
  'google-maps': {
    image: `${CARD_BASE}/integration-maps.jpg`,
    backendProvider: null, // not in the backend registry — stored locally
    instructions: [
      { text: 'Go to console.cloud.google.com → APIs & Services.' },
      { text: 'Enable the Places API (and Maps if you need geocoding).' },
      { text: 'Create an API key under Credentials and restrict it to the Places API.' },
      { text: 'Paste the key below.' },
    ],
    fields: [
      { name: 'api_key', label: 'API key', kind: 'secret', type: 'password', required: true },
    ],
    note: 'Stored locally in this browser — the backend does not yet manage Google Maps credentials.',
  },
  instagram: {
    image: `${CARD_BASE}/integration-instagram.jpg`,
    backendProvider: 'instagram',
    instructions: [
      { text: 'Create a Facebook App at developers.facebook.com.' },
      { text: 'Connect an Instagram Business account linked to a Facebook Page.' },
      { text: 'Generate a long-lived access token with the instagram_basic and instagram_content_publish permissions.' },
      { text: 'Find the Instagram Business account ID via the Graph API Explorer.' },
    ],
    fields: [
      { name: 'access_token', label: 'Access token', kind: 'secret', type: 'password', required: true },
      { name: 'account_id', label: 'Instagram account ID', kind: 'config', type: 'text', required: true },
    ],
  },
  facebook: {
    image: `${CARD_BASE}/integration-facebook.jpg`,
    backendProvider: 'facebook',
    instructions: [
      { text: 'Create a Facebook App at developers.facebook.com.' },
      { text: 'Generate a Page Access Token with the pages_manage_posts permission.' },
      { text: 'Copy the numeric Page ID from your Page settings.' },
    ],
    fields: [
      { name: 'page_access_token', label: 'Page access token', kind: 'secret', type: 'password', required: true },
      { name: 'page_id', label: 'Page ID', kind: 'config', type: 'text', required: true },
    ],
  },
  'browser-harness': {
    image: `${CARD_BASE}/integration-browser.jpg`,
    backendProvider: 'browser_harness',
    instructions: [
      { text: 'Step 1 — Install the browser-harness CLI from the hermes-agent repo:' },
      { code: true, text: 'git clone https://github.com/websitesmcf-a11y/hermes-agent.git\ncd hermes-agent\npython -m pip install -e ./browser-harness\n# Verify: browser-harness --version' },
      { text: 'Step 2 — Download the Philosopher OS harness agent:' },
      { code: true, text: 'curl -o philosopher-harness.py https://web-production-a93f0.up.railway.app/api/v1/browser-harness/agent-script' },
      { text: 'Step 3 — Save below to generate a token, then run the command that appears:' },
      { text: 'Step 4 (optional) — Make it auto-start on PC boot:' },
      { code: true, text: 'python philosopher-harness.py --install --url https://web-production-a93f0.up.railway.app --token YOUR_TOKEN' },
    ],
    fields: [
      { name: 'token', label: 'Token (auto-generated on save)', kind: 'secret', type: 'password' },
    ],
    note: 'The agent auto-launches Chrome if needed and reconnects instantly on network blips. Use --install for boot persistence. Keep the terminal open in foreground mode.',
  },
  obsidian: {
    image: `${CARD_BASE}/integration-vault.jpg`,
    backendProvider: 'obsidian',
    instructions: [
      { text: 'Enter the absolute path to your Obsidian vault folder.' },
      { text: 'Example: C:\\Users\\you\\Documents\\MyVault' },
      { text: 'Files are written under a "Socrates AI/" subfolder inside the vault.' },
    ],
    fields: [
      { name: 'vault_path', label: 'Vault path', kind: 'config', type: 'text', placeholder: 'C:\\Users\\you\\Documents\\MyVault', required: true },
    ],
  },
  'web-scraper': {
    image: `${CARD_BASE}/integration-browser.jpg`,
    backendProvider: null,
    instructions: [
      { text: 'The web scraper collects public business data when Google Maps is insufficient.' },
      { text: 'Optionally set a request rate limit (seconds between requests) and a custom user agent.' },
      { text: 'Leave blank to use safe defaults.' },
    ],
    fields: [
      { name: 'rate_limit_seconds', label: 'Rate limit (seconds)', kind: 'config', type: 'number', defaultValue: '2' },
      { name: 'user_agent', label: 'User agent (optional)', kind: 'config', type: 'text', placeholder: 'Mozilla/5.0 ...' },
    ],
    note: 'Stored locally in this browser — the backend does not yet manage scraper settings.',
  },
  finance: {
    image: `${CARD_BASE}/integration-database.jpg`,
    backendProvider: null,
    instructions: [
      { text: 'Connect a payment/finance provider to track invoices and transactions.' },
      { text: 'Paste your provider API key below.' },
    ],
    fields: [
      { name: 'api_key', label: 'API key', kind: 'secret', type: 'password', required: true },
    ],
    note: 'Stored locally in this browser — the backend does not yet manage finance credentials.',
  },
};

interface ConnectModalProps {
  open: boolean;
  uiProvider: string;
  title: string;
  onClose: () => void;
  // Called after a successful save so the page can refetch live status.
  onConnected: (uiProvider: string) => void;
}

export function ConnectModal({ open, uiProvider, title, onClose, onConnected }: ConnectModalProps) {
  const spec = PROVIDER_SPECS[uiProvider];
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWhatsAppTutorial, setShowWhatsAppTutorial] = useState(uiProvider === 'whatsapp');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [postConnect, setPostConnect] = useState<{ token: string; runCommand: string } | null>(null);

  // Seed defaults each time the modal opens for a given provider.
  const fieldsKey = spec ? spec.fields.map(f => `${f.name}=${f.defaultValue ?? ''}`).join('|') : '';
  useEffect(() => {
    if (!open || !spec) return;
    const init: Record<string, string> = {};
    spec.fields.forEach(f => { init[f.name] = f.defaultValue || ''; });
    setValues(init);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, uiProvider, fieldsKey]);

  if (!open || !spec) return null;

  const setValue = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const secrets: Record<string, string> = {};
      const config: Record<string, string> = {};
      for (const field of spec.fields) {
        const raw = (values[field.name] ?? '').trim();
        if (!raw) continue;
        if (field.kind === 'secret') secrets[field.name] = raw;
        else config[field.name] = raw;
      }

      if (spec.backendProvider) {
        const resp = await fetch(`${API_BASE}/connections/${spec.backendProvider}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secrets, config }),
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          throw new Error(data?.detail || `Save failed (${resp.status})`);
        }
        if (data?.status && data.status !== 'connected') {
          // For browser-harness, "disconnected" is expected (token saved, no live WS)
          if (spec.backendProvider === 'browser_harness' && data.token) {
            setPostConnect({
              token: data.token,
              runCommand: `python philosopher-harness.py --url ${BACKEND_ORIGIN} --token ${data.token}`,
            });
            setSubmitting(false);
            return;
          }
          throw new Error(data.detail || 'Saved, but the connection is not active yet.');
        }
      } else {
        // No backend route — persist locally so the setting survives a reload.
        try {
          localStorage.setItem(`connection:${uiProvider}`, JSON.stringify({ secrets, config }));
        } catch {
          /* localStorage unavailable — non-fatal */
        }
      }

      onConnected(uiProvider);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10, 14, 24, 0.55)',
        padding: 20,
        animation: 'modalFadeIn 0.25s ease-out',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Connect ${title}`}
    >
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(4px); }
        }
        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 1px var(--accent-subtle), 0 18px 50px rgba(10,14,24,0.45); }
          50% { box-shadow: 0 0 0 2px var(--accent), 0 18px 50px rgba(10,14,24,0.5); }
        }
      `}</style>
      <div
        className="card"
        style={{
          width: '100%', maxWidth: 560, padding: 0, overflow: 'hidden',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          border: '2px solid var(--accent)',
          boxShadow: '0 0 0 2px var(--accent-subtle), 0 24px 80px rgba(10,14,24,0.5), 0 0 60px var(--accent-subtle)',
          animation: 'cardSlideUp 0.3s ease-out',
          borderRadius: 12,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Card art - taller, more impactful */}
        <div style={{ position: 'relative', width: '100%', height: 180, flexShrink: 0, background: 'var(--surface-inset)' }}>
          <Image
            src={spec.image}
            alt={`${title} integration`}
            fill
            sizes="560px"
            style={{ objectFit: 'cover' }}
            priority
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(10,14,24,0.15) 30%, rgba(10,14,24,0.75) 100%)',
          }} />
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute', top: 12, right: 12, padding: '6px',
              background: 'rgba(10,14,24,0.5)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(10,14,24,0.75)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10,14,24,0.5)'; }}
          >
            <X size={16} />
          </button>
          <div style={{
            position: 'absolute', left: 24, bottom: 16,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 6,
              padding: '3px 10px',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              borderRadius: 20,
              fontSize: 11, fontWeight: 600, color: '#fff',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              <Plug size={12} /> Integration
            </div>
            <h2 style={{
              margin: 0,
              fontSize: 22, fontWeight: 700, color: '#fff',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              {title}
            </h2>
          </div>
        </div>

        {/* WhatsApp Tutorial — shown first time for WhatsApp */}
        {showWhatsAppTutorial && (
          <div style={{ padding: 24, overflowY: 'auto' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
              fontSize: 13, fontWeight: 600, color: '#25D366',
            }}>
              <MessageCircle size={18} /> WhatsApp Setup Guide
            </div>
            <div style={{
              padding: 12, marginBottom: 16, borderRadius: 8,
              background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.15)',
              fontSize: 12, color: 'var(--foreground-secondary)', lineHeight: 1.5,
            }}>
              <strong>⚠️ One connection per user</strong><br/>
              Each user must connect their own WhatsApp. The admin's connection is separate.
            </div>

            {[
              {
                title: 'Install the WhatsApp Bridge',
                desc: 'Open PowerShell and run:',
                code: 'cd C:\\Users\\felet\\socrates-ai\\apps\\wa-bot\nnpm install',
              },
              {
                title: 'Start the Bridge',
                desc: 'Run this command (keep the window open):',
                code: 'npm start',
                note: 'You\'ll see a QR code appear in the terminal after a few seconds.',
              },
              {
                title: 'Scan the QR Code',
                desc: 'On your phone:',
                items: [
                  'Open WhatsApp (or WhatsApp Business)',
                  'Tap Menu (⋮) → Linked Devices',
                  'Tap "Link a Device"',
                  'Scan the QR code from the terminal',
                ],
              },
              {
                title: 'Done! 🎉',
                desc: 'Once scanned, your WhatsApp is connected. You can now:',
                items: [
                  'Send campaign messages through your number',
                  'Receive replies in the Conversations page',
                  'Use the Auto Reply Bot',
                ],
                note: 'The session may expire every 2-4 weeks. Just re-scan the QR code to reconnect.',
              },
            ].map((step, i) => (
              <div key={i} style={{
                display: tutorialStep === i ? 'block' : 'none',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                  fontSize: 14, fontWeight: 600,
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: '#25D366', color: '#fff', fontSize: 11,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{i + 1}</span>
                  {step.title}
                </div>
                <p style={{ fontSize: 12, color: 'var(--foreground-secondary)', marginBottom: 10 }}>{step.desc}</p>
                {(step as any).code && (
                  <pre style={{
                    padding: '10px 12px', borderRadius: 6,
                    background: '#0f172a', color: '#e2e8f0',
                    fontFamily: 'var(--font-mono)', fontSize: 12,
                    whiteSpace: 'pre-wrap', marginBottom: 10,
                  }}>{(step as any).code}</pre>
                )}
                {(step as any).items && (
                  <ol style={{ margin: '0 0 10px', paddingLeft: 20, fontSize: 12, lineHeight: 1.8 }}>
                    {(step as any).items.map((item: string, j: number) => (
                      <li key={j} style={{ color: 'var(--foreground-secondary)' }}>{item}</li>
                    ))}
                  </ol>
                )}
                {(step as any).note && (
                  <p style={{
                    fontSize: 11, color: 'var(--muted)', padding: '6px 10px',
                    background: 'rgba(37,211,102,0.04)', borderRadius: 4,
                  }}>{(step as any).note}</p>
                )}
              </div>
            ))}

            {/* Tutorial nav buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <button
                onClick={() => setTutorialStep(s => Math.max(0, s - 1))}
                disabled={tutorialStep === 0}
                className="btn btn-sm btn-ghost"
                style={{ opacity: tutorialStep === 0 ? 0.3 : 1 }}
              >
                ← Back
              </button>
              <button
                className={`btn btn-sm ${tutorialStep === 3 ? 'btn-primary' : ''}`}
                onClick={() => {
                  if (tutorialStep < 3) setTutorialStep(s => s + 1);
                  else setShowWhatsAppTutorial(false);
                }}
              >
                {tutorialStep === 3 ? 'I\'m Connected! →' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {/* Post-connect token display for Browser Harness */}
        {postConnect && (
          <div style={{ padding: 24 }}>
            <div style={{
              padding: 16, borderRadius: 10,
              background: 'rgba(18,60,105,0.06)', border: '1px solid rgba(18,60,105,0.2)',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#123C69', marginBottom: 4 }}>
                ✅ Token Generated
              </div>
              <div style={{ fontSize: 12, color: 'var(--foreground-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                Copy and run this command in your computer's terminal to connect your browser:
              </div>
              <pre style={{
                padding: '12px 14px', borderRadius: 8,
                background: '#0f172a', color: '#e2e8f0',
                fontFamily: 'var(--font-mono)', fontSize: 12,
                whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                marginBottom: 12, userSelect: 'all',
              }}>
                {postConnect.runCommand}
              </pre>
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                Keep the terminal window open. The agent auto-launches Chrome if needed and reconnects instantly on blips.
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, marginTop: 4 }}>
                For boot persistence: run <code style={{ background: '#0f172a', padding: '2px 4px', borderRadius: 3, color: '#e2e8f0' }}>python philosopher-harness.py --install --url {BACKEND_ORIGIN} --token YOUR_TOKEN</code>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => {
                setPostConnect(null);
                onConnected(uiProvider);
                onClose();
              }} style={{ padding: '8px 20px', fontSize: 13 }}>
                Done
              </button>
            </div>
          </div>
        )}

        {/* Regular connect form (hidden during WhatsApp tutorial or post-connect) */}
        {!showWhatsAppTutorial && !postConnect && (
        <form onSubmit={handleSubmit} style={{ padding: 24, overflowY: 'auto' }}>
          {/* Instructions with styled steps */}
          <div style={{
            marginBottom: 20,
            background: 'var(--surface-inset)',
            borderRadius: 10,
            padding: 16,
            border: '1px solid var(--border-light)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Setup Instructions
            </div>
            <ol style={{
              margin: 0, paddingLeft: 20,
              display: 'flex', flexDirection: 'column', gap: 10,
              fontSize: 13, color: 'var(--foreground-secondary)', lineHeight: 1.5,
            }}>
              {spec.instructions.map((step, i) => (
                <li key={i} style={{ listStyleType: step.code ? 'none' : 'decimal', marginLeft: step.code ? -20 : 0 }}>
                  {step.code ? (
                    <code style={{
                      display: 'block', padding: '10px 12px', borderRadius: 8,
                      background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)',
                      fontFamily: 'var(--font-mono)', fontSize: 12.5, color: '#e2e8f0',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                      marginTop: 4,
                    }}>
                      {step.text}
                    </code>
                  ) : step.text}
                </li>
              ))}
            </ol>
          </div>

          {spec.note && (
            <p style={{
              fontSize: 12, color: 'var(--muted)', marginBottom: 18,
              padding: '10px 12px', borderRadius: 8,
              background: 'rgba(201,162,77,0.08)', borderLeft: '3px solid #C9A24D',
              lineHeight: 1.5,
            }}>
              💡 {spec.note}
            </p>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Configuration
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {spec.fields.map(field => (
              <div key={field.name}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5, color: 'var(--foreground)' }}>
                  {field.label}{field.required && <span style={{ color: '#ef4444' }}> *</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={field.type || 'text'}
                    value={values[field.name] || ''}
                    onChange={e => setValue(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    autoComplete={field.kind === 'secret' ? 'off' : undefined}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: 14,
                      border: '2px solid var(--border)',
                      borderRadius: 8,
                      background: 'var(--surface)',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--accent)';
                      e.target.style.boxShadow = '0 0 0 3px var(--accent-subtle)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {field.kind === 'secret' && (
                    <Lock size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div style={{
              fontSize: 13, color: '#991B1B', marginTop: 16,
              padding: '10px 14px', borderRadius: 8,
              background: '#FEF2F2', border: '1px solid rgba(153,27,27,0.25)',
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Footer */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            marginTop: 24, paddingTop: 16,
            borderTop: '1px solid var(--border-light)',
          }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}
              style={{ padding: '8px 18px', fontSize: 13 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600 }}>
              {submitting ? (
                <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <Plug size={14} />
              )}
              {submitting ? 'Connecting...' : 'Save & Connect'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
