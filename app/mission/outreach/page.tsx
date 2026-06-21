'use client';

import { useState, useRef } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Bot, Upload, FileText, Clock, MessageSquare, Mail,
  Settings, Play, Square, Loader2, CheckCircle2, AlertTriangle,
  Info, Zap, Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePageTitle } from '@/lib/use-page-title';

/* ─── Config types ────────────────────────────────── */
interface AutoReplyConfig {
  contextFileContent: string;
  contextFileName: string;
  replySpeed: 'instant' | 'fast' | 'balanced' | 'thoughtful';
  channels: {
    whatsapp: boolean;
    email: boolean;
  };
  tone: 'professional' | 'friendly' | 'formal' | 'casual';
  maxDailyReplies: number;
  followUpAfterDays: number;
  autoFollowUp: boolean;
}

const DEFAULT_CONFIG: AutoReplyConfig = {
  contextFileContent: '',
  contextFileName: '',
  replySpeed: 'balanced',
  channels: { whatsapp: true, email: true },
  tone: 'professional',
  maxDailyReplies: 50,
  followUpAfterDays: 3,
  autoFollowUp: true,
};

const MIN_CONTEXT_WORDS = 500;

const SPEED_OPTIONS = [
  { value: 'instant', label: 'Instant', desc: 'Reply within seconds — uses quick templates', color: '#22c55e' },
  { value: 'fast', label: 'Fast', desc: 'Reply within 1-2 minutes — AI generates response quickly', color: '#3b82f6' },
  { value: 'balanced', label: 'Balanced', desc: 'Reply within 3-5 minutes — considers context', color: '#f59e0b' },
  { value: 'thoughtful', label: 'Thoughtful', desc: 'Reply within 5-10 minutes — deep context analysis', color: '#8b5cf6' },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', desc: 'Formal business language' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm and approachable' },
  { value: 'formal', label: 'Formal', desc: 'Very formal, like legal correspondence' },
  { value: 'casual', label: 'Casual', desc: 'Relaxed, conversational tone' },
];

/* ─── Component ───────────────────────────────────── */
export default function AutoReplyBotPage() {
  usePageTitle('Auto Reply Bot');
  const [config, setConfig] = useState<AutoReplyConfig>(DEFAULT_CONFIG);
  const [botActive, setBotActive] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const updateConfig = (patch: Partial<AutoReplyConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  };

  const wordCount = config.contextFileContent
    ? config.contextFileContent.trim().split(/\s+/).length
    : 0;
  const hasEnoughContext = wordCount >= MIN_CONTEXT_WORDS;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      updateConfig({ contextFileContent: text, contextFileName: file.name });
      toast.success(`Loaded "${file.name}" (${text.trim().split(/\s+/).length} words)`);
    } catch {
      toast.error('Failed to read file');
    }
  };

  const handleActivate = () => {
    if (!hasEnoughContext) {
      toast.error(`Upload context with at least ${MIN_CONTEXT_WORDS} words before activating`);
      return;
    }
    if (!config.channels.whatsapp && !config.channels.email) {
      toast.error('Enable at least one channel (WhatsApp or Email)');
      return;
    }
    setBotActive(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Auto Reply Bot activated');
    }, 1500);
  };

  const handleDeactivate = () => {
    setBotActive(false);
    toast.success('Auto Reply Bot deactivated');
  };

  return (
    <div className="page-content page-bg-sentinel page-enter">
      <PageHeader
        title="Auto Reply Bot"
        description="AI-powered auto-responder for WhatsApp and email — replies intelligently to incoming messages and follows up on stale conversations"
        icon={Bot}
        iconColor="#6F7D4F"
        actions={
          <button
            className={`btn ${botActive ? 'btn-danger' : 'btn-primary'}`}
            onClick={botActive ? handleDeactivate : handleActivate}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {loading ? (
              <><Loader2 size={14} className="spin" /> {botActive ? 'Deactivating...' : 'Activating...'}</>
            ) : botActive ? (
              <><Square size={14} /> Deactivate Bot</>
            ) : (
              <><Play size={14} /> Activate Bot</>
            )}
          </button>
        }
      />

      {/* Status Banner */}
      {botActive && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
          padding: '12px 16px', borderRadius: 8,
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
          <div>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#166534' }}>Auto Reply Bot is Active</span>
            <span style={{ fontSize: 12, color: 'var(--foreground-secondary)', marginLeft: 8 }}>
              Monitoring {config.channels.whatsapp ? 'WhatsApp' : ''}{config.channels.whatsapp && config.channels.email ? ' & ' : ''}{config.channels.email ? 'Email' : ''} for incoming messages
            </span>
          </div>
        </div>
      )}

      {/* Bot not configured state */}
      {!botActive && !hasEnoughContext && (
        <div className="card" style={{ marginBottom: 20, padding: 16, borderLeft: '3px solid #f59e0b', background: 'rgba(245,158,11,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Info size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Context file required</div>
              <div style={{ fontSize: 12, color: 'var(--foreground-secondary)', lineHeight: 1.5 }}>
                Upload a context document with at least {MIN_CONTEXT_WORDS} words so the agents know how to reply.
                This can be your business info, FAQ, product details, brand voice guide, or any reference material.
              </div>
            </div>
          </div>
        </div>
      )}

      {!botActive && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>

          {/* Context Upload */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <FileText size={18} color="var(--accent)" />
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Context Document</h2>
              {config.contextFileName && (
                <span className="badge" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: 11 }}>
                  {wordCount} words
                </span>
              )}
            </div>

            {config.contextFileName ? (
              <div style={{
                padding: 14, borderRadius: 8,
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.15)',
                marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <FileText size={16} color="#22c55e" />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{config.contextFileName}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--foreground-secondary)' }}>
                  {wordCount} words{wordCount >= MIN_CONTEXT_WORDS ? ' ✅' : ` ❌ (need ${MIN_CONTEXT_WORDS - wordCount} more)`}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: 32, borderRadius: 8, cursor: 'pointer',
                  border: '2px dashed var(--border)',
                  textAlign: 'center', marginBottom: 12,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-subtle)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Upload size={24} color="var(--muted)" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Upload Context File</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>.txt, .md, .pdf, or .docx</div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf,.docx,.csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            {config.contextFileName && (
              <button className="btn btn-sm btn-ghost" onClick={() => { updateConfig({ contextFileContent: '', contextFileName: '' }); toast.success('Context removed'); }}>
                Remove File
              </button>
            )}
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, lineHeight: 1.4 }}>
              The context document is shared with all Philosopher agents so they understand your business,
              products, tone, and how to reply. Minimum {MIN_CONTEXT_WORDS} words required to activate.
            </p>
          </div>

          {/* Reply Settings */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Clock size={18} color="var(--accent)" />
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Reply Settings</h2>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Reply Speed</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {SPEED_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateConfig({ replySpeed: opt.value as AutoReplyConfig['replySpeed'] })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px',
                      border: `1px solid ${config.replySpeed === opt.value ? opt.color : 'var(--border)'}`,
                      borderRadius: 6,
                      background: config.replySpeed === opt.value ? `${opt.color}10` : 'transparent',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: opt.color, flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Reply Tone</label>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {TONE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateConfig({ tone: opt.value as AutoReplyConfig['tone'] })}
                    style={{
                      padding: '6px 12px', fontSize: 12, fontWeight: 600,
                      border: `1px solid ${config.tone === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 6,
                      background: config.tone === opt.value ? 'var(--accent-subtle)' : 'transparent',
                      cursor: 'pointer',
                      color: config.tone === opt.value ? 'var(--accent)' : 'var(--foreground-secondary)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Channels & Limits */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Globe size={18} color="var(--accent)" />
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Channels & Limits</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: 6 }}>
                <input
                  type="checkbox"
                  checked={config.channels.whatsapp}
                  onChange={e => updateConfig({ channels: { ...config.channels, whatsapp: e.target.checked } })}
                  style={{ width: 'auto' }}
                />
                <MessageSquare size={16} color="#25D366" />
                <span style={{ fontSize: 13, fontWeight: 500 }}>WhatsApp</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>Requires WhatsApp integration</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: 6 }}>
                <input
                  type="checkbox"
                  checked={config.channels.email}
                  onChange={e => updateConfig({ channels: { ...config.channels, email: e.target.checked } })}
                  style={{ width: 'auto' }}
                />
                <Mail size={16} color="#123C69" />
                <span style={{ fontSize: 13, fontWeight: 500 }}>Email</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>Requires SMTP integration</span>
              </label>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Max replies per day: {config.maxDailyReplies}
              </label>
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={config.maxDailyReplies}
                onChange={e => updateConfig({ maxDailyReplies: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.autoFollowUp}
                  onChange={e => updateConfig({ autoFollowUp: e.target.checked })}
                  style={{ width: 'auto' }}
                />
                <span style={{ fontSize: 13, fontWeight: 500 }}>Auto follow-up on stale conversations</span>
              </label>
              {config.autoFollowUp && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--foreground-secondary)' }}>
                  Follow up after {config.followUpAfterDays} day{config.followUpAfterDays > 1 ? 's' : ''} of no reply
                  <input
                    type="range"
                    min={1}
                    max={14}
                    value={config.followUpAfterDays}
                    onChange={e => updateConfig({ followUpAfterDays: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Bot View */}
      {botActive && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'rgba(34,197,94,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={24} color="#22c55e" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Auto Reply Bot — Running</div>
              <div style={{ fontSize: 12, color: 'var(--foreground-secondary)' }}>
                Context: {config.contextFileName} ({wordCount} words) · {config.replySpeed} speed · {config.tone} tone
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div className="etched-surface" style={{ padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e' }}>0</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Replies Today</div>
            </div>
            <div className="etched-surface" style={{ padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6' }}>0</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Follow-ups</div>
            </div>
            <div className="etched-surface" style={{ padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>0</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Awaiting</div>
            </div>
            <div className="etched-surface" style={{ padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#8b5cf6' }}>Active</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Status</div>
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
            All Philosopher agents are coordinating to reply intelligently. Check Agent Run Logs for detailed activity.
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
