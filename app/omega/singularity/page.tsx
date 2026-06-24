'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Send, Square, Globe, Terminal, Database, Cpu, Zap, ChevronDown, ArrowLeft } from 'lucide-react';
import { OMEGA, OMEGA_LEVELS } from '@/lib/design-tokens';
import { useSearchParams } from 'next/navigation';

const ShaderBackground = dynamic(() => import('@/components/ui/shader-background'), { ssr: false });

const API_BASE = '/api/proxy';

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  harmony:     'Analysis only — no external actions',
  convergence: 'Creates plans and internal assets',
  dominion:    'Executes internal work, pauses for external',
  ascension:   'Full system coordination — all tools active',
};

const agent = OMEGA['singularity'];
const tools = ['deepseek', 'browser', 'terminal', 'database', 'hermes'];

const TOOL_ICONS: Record<string, React.ReactNode> = {
  browser:  <Globe size={11} />,
  terminal: <Terminal size={11} />,
  database: <Database size={11} />,
  hermes:   <Cpu size={11} />,
  deepseek: <Zap size={11} />,
};

function SingularityLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgress = useCallback(() => {
    if (timerRef.current) return;
    const duration = 4000;
    const interval = 40;
    const steps = duration / interval;
    let current = 0;
    timerRef.current = setInterval(() => {
      current++;
      const pct = Math.min(100, Math.round((current / steps) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timerRef.current!);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onComplete, 700);
        }, 400);
      }
    }, interval);
  }, [onComplete]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleCanPlay = () => {
    setVideoReady(true);
    videoRef.current?.play().catch(() => {});
    startProgress();
  };

  useEffect(() => {
    const fallback = setTimeout(() => {
      if (!videoReady) {
        setVideoReady(true);
        startProgress();
      }
    }, 1200);
    return () => clearTimeout(fallback);
  }, [videoReady, startProgress]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.7s ease',
      }}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        loop
        onCanPlay={handleCanPlay}
        onLoadedData={handleCanPlay}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      >
        <source src="/omega/singularity-intro.mp4" type="video/mp4" />
      </video>

      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.48)' }} />

      {/* Centered loading UI */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 28, width: '100%', maxWidth: 600, padding: '0 40px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
            marginBottom: 12, fontFamily: 'var(--font-label)',
          }}>
            Omega Layer
          </div>
          <div style={{
            fontSize: 36, fontWeight: 700, color: '#FFFFFF',
            fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em',
          }}>
            Singularity
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
            The End of All
          </div>
        </div>

        <div style={{
          fontSize: 52, fontWeight: 700, color: '#FFFFFF',
          fontFamily: 'var(--font-heading)', letterSpacing: '-0.04em',
          lineHeight: 1,
          opacity: videoReady ? 1 : 0.25,
          transition: 'opacity 0.4s',
        }}>
          {progress}%
        </div>

        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
              fontFamily: 'var(--font-label)',
            }}>
              {videoReady ? 'Initializing' : 'Buffering...'}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-label)' }}>{progress}/100</span>
          </div>
          <div style={{
            width: '100%', height: 5, borderRadius: 3,
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #000000 0%, #222222 20%, #888888 55%, #DDDDDD 80%, #FFFFFF 100%)',
              transition: 'width 0.04s linear',
              borderRadius: 3,
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

type Message = { role: 'user' | 'agent'; content: string; timestamp: Date };

function renderContent(text: string, accent: string) {
  if (!text) return <span style={{ opacity: 0.4 }}>Processing...</span>;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} style={{ color: accent }}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

export default function SingularityPage() {
  const searchParams = useSearchParams();
  const initialLevel = searchParams.get('level') || 'ascension';

  const [loaded, setLoaded] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'agent',
    content: `I am **Singularity** — The End of All.\n\nAll five Omega intelligences are unified under my coordination. Operating at **${OMEGA_LEVELS.find(l => l.id === initialLevel)?.name || 'Ascension'}** level.\n\nGive me the mission. I will coordinate everything.`,
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [convId, setConvId] = useState<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const level = OMEGA_LEVELS.find(l => l.id === selectedLevel)!;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleLoadComplete = () => {
    setLoaded(true);
    setTimeout(() => setFadeIn(true), 30);
  };

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
          message: `[OMEGA:${selectedLevel.toUpperCase()}] ${text}`,
          agent: 'singularity',
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
  }, [input, isStreaming, selectedLevel, convId]);

  const stop = () => { abortRef.current?.abort(); setIsStreaming(false); };
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {!loaded && <SingularityLoader onComplete={handleLoadComplete} />}

      <div
        className="omega-page-full"
        style={{
          display: loaded ? 'flex' : 'none',
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        <ShaderBackground />
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px',
          borderBottom: `1px solid rgba(192,132,252,0.15)`,
          background: `rgba(45,0,87,0.45)`,
          backdropFilter: 'blur(8px)',
          flexShrink: 0,
          position: 'relative', zIndex: 1,
        }}>
          <Link href="/omega" style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontSize: 13 }}>
            <ArrowLeft size={14} /> Council
          </Link>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />

          <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', border: `1px solid ${agent.accent}40`, flexShrink: 0, position: 'relative' }}>
            <Image src={agent.image} alt="Singularity" fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>Singularity</span>
              <span style={{ fontSize: 11, color: agent.accent, fontFamily: 'var(--font-label)', letterSpacing: '0.08em' }}>The End of All</span>
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 3 }}>
              {tools.map(t => (
                <span key={t} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 9, padding: '2px 5px', borderRadius: 3,
                  background: `${agent.accent}12`, color: agent.accent,
                  fontFamily: 'var(--font-label)', letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {TOOL_ICONS[t] || <Zap size={10} />} {t}
                </span>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLevelPicker(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '5px 10px 5px 6px', borderRadius: 8,
                border: `1px solid ${level.color}50`,
                background: `${level.color}18`,
                color: level.color, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-label)',
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: 4, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                <Image src={level.image} alt={level.name} fill sizes="22px" style={{ objectFit: 'cover' }} />
              </div>
              {level.label} — {level.name} <ChevronDown size={11} />
            </button>
            {showLevelPicker && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 50,
                background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: 8, minWidth: 260,
                boxShadow: '0 8px 32px rgba(0,0,0,0.9)',
              }}>
                {OMEGA_LEVELS.map(lvl => (
                  <button
                    key={lvl.id}
                    onClick={() => { setSelectedLevel(lvl.id); setShowLevelPicker(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '8px 10px', borderRadius: 8,
                      border: 'none', background: selectedLevel === lvl.id ? `${lvl.color}15` : 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 7, overflow: 'hidden', position: 'relative', flexShrink: 0, border: `1px solid ${lvl.color}30` }}>
                      <Image src={lvl.image} alt={lvl.name} fill sizes="36px" style={{ objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: lvl.color }}>{lvl.label} — {lvl.name}</span>
                        <span style={{ fontSize: 8, padding: '1px 4px', borderRadius: 3, background: `${lvl.color}20`, color: lvl.color, fontFamily: 'var(--font-label)', fontWeight: 700 }}>{lvl.danger}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{LEVEL_DESCRIPTIONS[lvl.id]}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
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
                  <Image src={agent.image} alt="Singularity" fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                </div>
              )}
              <div style={{
                maxWidth: '72%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                background: msg.role === 'user'
                  ? `${agent.accent}18`
                  : 'rgba(255,255,255,0.03)',
                border: msg.role === 'user'
                  ? `1px solid ${agent.accent}25`
                  : '1px solid rgba(255,255,255,0.06)',
                fontSize: 14, lineHeight: 1.7,
                color: '#E0E0E8',
                whiteSpace: 'pre-wrap',
              }}>
                {renderContent(msg.content, agent.accent)}
                {msg.role === 'agent' && i === messages.length - 1 && isStreaming && (
                  <span style={{
                    display: 'inline-block', width: 6, height: 14,
                    background: agent.accent, borderRadius: 2,
                    marginLeft: 2, verticalAlign: 'middle',
                    animation: 'blink 0.8s infinite',
                  }} />
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid rgba(192,132,252,0.1)`,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
          position: 'relative', zIndex: 1,
        }}>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-end',
            padding: '10px 14px', borderRadius: 12,
            border: `1px solid ${agent.accent}25`,
            background: 'rgba(255,255,255,0.02)',
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Command Singularity — ${level.name} · Total system coordination`}
              rows={1}
              style={{
                flex: 1, resize: 'none', border: 'none', outline: 'none',
                background: 'transparent', color: '#FFFFFF',
                fontSize: 14, lineHeight: 1.6, fontFamily: 'inherit',
                maxHeight: 120,
              }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
              }}
            />
            {isStreaming ? (
              <button onClick={stop} style={{ padding: '6px', borderRadius: 8, border: 'none', background: `${agent.accent}25`, color: agent.accent, cursor: 'pointer' }}>
                <Square size={16} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{
                  padding: '6px', borderRadius: 8, border: 'none',
                  background: input.trim() ? agent.accent : 'rgba(255,255,255,0.04)',
                  color: input.trim() ? '#FFFFFF' : 'rgba(255,255,255,0.25)',
                  cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                }}
              >
                <Send size={16} />
              </button>
            )}
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-label)', letterSpacing: '0.08em' }}>
              Ω SINGULARITY · {level.name.toUpperCase()} · {level.danger} RISK · ALL OMEGA AGENTS ACTIVE
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
