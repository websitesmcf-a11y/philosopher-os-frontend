'use client';

import { useParams } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Send, Square, Globe, Terminal, Database, Cpu, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { OMEGA, type OmegaKey } from '@/lib/design-tokens';

const AuroraBorealisShader  = dynamic(() => import('@/components/ui/aurora-borealis-shader'),   { ssr: false });
const CelestialBloomShader  = dynamic(() => import('@/components/ui/celestial-bloom-shader'),   { ssr: false });
const FlowFieldBackground   = dynamic(() => import('@/components/ui/flow-field-background'),    { ssr: false });
const ElectricWavesBackground = dynamic(() => import('@/components/ui/colorful-wave-pattern-1'), { ssr: false });

function AgentBackground({ agentKey }: { agentKey: string }) {
  if (agentKey === 'genesis')    return <AuroraBorealisShader />;
  if (agentKey === 'overmind')   return <CelestialBloomShader />;
  if (agentKey === 'omniscient') return <FlowFieldBackground color="#8B5CF6" />;
  if (agentKey === 'eternal')    return <ElectricWavesBackground />;
  return null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-a93f0.up.railway.app/api/v1';

type Message = {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
};

const TOOL_ICONS: Record<string, React.ReactNode> = {
  browser:  <Globe size={11} />,
  terminal: <Terminal size={11} />,
  database: <Database size={11} />,
  hermes:   <Cpu size={11} />,
};

const AGENT_TOOLS: Record<string, string[]> = {
  genesis:     ['deepseek', 'terminal', 'database', 'hermes'],
  overmind:    ['deepseek', 'browser', 'database', 'hermes'],
  omniscient:  ['deepseek', 'database', 'browser', 'hermes'],
  eternal:     ['deepseek', 'hermes', 'database'],
  singularity: ['deepseek', 'browser', 'terminal', 'database', 'hermes'],
};

const OMEGA_AGENT_MODELS: Record<string, string> = {
  genesis:     'deepseek-v4-pro',
  overmind:    'deepseek-v4-pro',
  omniscient:  'deepseek-v4-pro',
  eternal:     'deepseek-v4-pro',
  singularity: 'deepseek-v4-pro',
};

const EFFORT_LABELS = ['Focused', 'Thorough', 'Maximum'] as const;
const EFFORT_COLORS = ['#38BDF8', '#FBBF24', '#F87171'] as const;

function greeting(name: string, role: string): string {
  return `I am **${name}** — ${role}.\n\nI am ready to serve. How may I assist you?`;
}

export default function OmegaAgentPage() {
  const params = useParams();
  const agentKey = (params.agent as string) as OmegaKey;

  const agent = OMEGA[agentKey];
  if (!agent) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Unknown Omega agent</div>
          <Link href="/omega" style={{ color: '#A855F7' }}>← Return to Omega Council</Link>
        </div>
      </div>
    );
  }

  const [effort, setEffort] = useState(1);
  const [hoverTool, setHoverTool] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'agent',
    content: greeting(agent.name, agent.role),
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [convId, setConvId] = useState<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const tools = AGENT_TOOLS[agentKey] || [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }]);
    setMessages(prev => [...prev, { role: 'agent', content: '', timestamp: new Date() }]);
    setIsStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const res = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: effort === 3 ? `[MAXIMUM EFFORT] ${text}` : effort === 2 ? `[THOROUGH] ${text}` : text,
          agent: agentKey,
          conversation_id: convId,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream body');
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.conversation_id) setConvId(evt.conversation_id);
            if (evt.type === 'token' && evt.content) {
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === 'agent') updated[updated.length - 1] = { ...last, content: last.content + evt.content };
                return updated;
              });
            } else if (evt.type === 'error') {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...updated[updated.length - 1], content: `Error: ${evt.content}` };
                return updated;
              });
            }
          } catch { /* skip */ }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: `I encountered an error: ${err.message}. Please try again.`,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, agentKey, effort, convId]);

  const stop = () => { abortRef.current?.abort(); setIsStreaming(false); };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  function renderContent(text: string) {
    if (!text) return <span style={{ opacity: 0.4 }}>Thinking...</span>;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i}>{p.slice(2, -2)}</strong>
        : <span key={i}>{p}</span>
    );
  }

  return (
    <div className="omega-page-full">
      <AgentBackground agentKey={agentKey} />
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px',
        borderBottom: `1px solid ${agent.accent}18`,
        background: `linear-gradient(90deg, ${agent.color}40, rgba(0,0,0,0.6))`,
        backdropFilter: 'blur(8px)',
        flexShrink: 0,
        position: 'relative', zIndex: 1,
      }}>
        <Link href="/omega" style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontSize: 13 }}>
          <ArrowLeft size={14} /> Omega
        </Link>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />

        {/* Portrait */}
        <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', border: `1px solid ${agent.accent}40`, flexShrink: 0, position: 'relative' }}>
          <Image src={agent.image} alt={agent.name} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>{agent.name}</span>
            <span style={{ fontSize: 11, color: agent.accent, fontFamily: 'var(--font-label)', letterSpacing: '0.08em' }}>{agent.role}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
            {tools.map(t => (
              <span
                key={t}
                onMouseEnter={() => setHoverTool(t)}
                onMouseLeave={() => setHoverTool(null)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 10, padding: '2px 6px', borderRadius: 4,
                  background: `${agent.accent}15`, color: agent.accent,
                  fontFamily: 'var(--font-label)', letterSpacing: '0.06em', textTransform: 'uppercase',
                  position: 'relative', cursor: 'default',
                }}
              >
                {TOOL_ICONS[t] || <Zap size={11} />} {t}
                {t === 'deepseek' && hoverTool === 'deepseek' && (
                  <span style={{
                    position: 'absolute', top: 'calc(100% + 5px)', left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 5, padding: '3px 7px', fontSize: 10,
                    color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-mono)',
                    whiteSpace: 'nowrap', zIndex: 100, pointerEvents: 'none',
                  }}>
                    {OMEGA_AGENT_MODELS[agentKey] || 'deepseek-v4-pro'}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Effort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 5px', background: 'rgba(255,255,255,0.05)', borderRadius: 9, border: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontSize: 8, fontFamily: 'var(--font-label)', color: 'rgba(255,255,255,0.3)', padding: '0 4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Effort</span>
          {[1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => setEffort(n)}
              title={EFFORT_LABELS[n - 1]}
              style={{
                width: 26, height: 24, borderRadius: 6, border: 'none',
                background: effort === n ? `${EFFORT_COLORS[n - 1]}28` : 'transparent',
                color: effort === n ? EFFORT_COLORS[n - 1] : 'rgba(255,255,255,0.3)',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                outline: effort === n ? `1px solid ${EFFORT_COLORS[n - 1]}50` : 'none',
                transition: 'all 0.15s',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', zIndex: 1 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            gap: 12, alignItems: 'flex-start',
          }}>
            {msg.role === 'agent' && (
              <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', border: `1px solid ${agent.accent}30`, flexShrink: 0, position: 'relative' }}>
                <Image src={agent.image} alt={agent.name} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
              </div>
            )}
            <div style={{
              maxWidth: '72%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
              background: msg.role === 'user'
                ? `${agent.accent}22`
                : 'rgba(255,255,255,0.04)',
              border: msg.role === 'user'
                ? `1px solid ${agent.accent}30`
                : '1px solid rgba(255,255,255,0.06)',
              fontSize: 14, lineHeight: 1.7,
              color: '#E8E8F0',
              whiteSpace: 'pre-wrap',
            }}>
              {renderContent(msg.content)}
              {msg.role === 'agent' && i === messages.length - 1 && isStreaming && (
                <span style={{ display: 'inline-block', width: 6, height: 14, background: agent.accent, borderRadius: 2, marginLeft: 2, verticalAlign: 'middle', animation: 'blink 0.8s infinite' }} />
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 24px',
        borderTop: `1px solid ${agent.accent}15`,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          padding: '10px 14px',
          borderRadius: 12,
          border: `1px solid ${agent.accent}30`,
          background: 'rgba(255,255,255,0.03)',
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Command ${agent.name} — Effort ${effort}: ${EFFORT_LABELS[effort - 1]}`}
            rows={1}
            style={{
              flex: 1, resize: 'none', border: 'none', outline: 'none',
              background: 'transparent', color: '#FFFFFF',
              fontSize: 14, lineHeight: 1.6,
              fontFamily: 'inherit',
              maxHeight: 120,
            }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
          {isStreaming ? (
            <button onClick={stop} style={{ padding: '6px', borderRadius: 8, border: 'none', background: `${agent.accent}30`, color: agent.accent, cursor: 'pointer' }}>
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              style={{
                padding: '6px', borderRadius: 8, border: 'none',
                background: input.trim() ? agent.accent : 'rgba(255,255,255,0.05)',
                color: input.trim() ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
              }}
            >
              <Send size={16} />
            </button>
          )}
        </div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-label)' }}>
            Ω {agent.name} · Effort {effort} — {EFFORT_LABELS[effort - 1]} · deepseek-v4-pro
          </span>
        </div>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}
