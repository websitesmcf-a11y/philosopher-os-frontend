'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Sparkles, Send, Square, ChevronRight } from 'lucide-react';
import { OMEGA, OMEGA_LEVELS, type OmegaKey } from '@/lib/design-tokens';

const ShaderAnimation = dynamic(
  () => import('@/components/ui/shader-animation').then(m => ({ default: m.ShaderAnimation })),
  { ssr: false }
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-a93f0.up.railway.app/api/v1';

const OMEGA_AGENTS: OmegaKey[] = ['genesis', 'overmind', 'omniscient', 'eternal', 'singularity'];

const LEVEL_DETAIL = [
  {
    id: 'harmony',
    level: 'I',
    name: 'Harmony',
    color: '#6B7280',
    danger: 'SAFE',
    image: '/omega/levels/harmony.png',
    desc: 'All five Omega agents analyze your mission simultaneously. No actions taken. Pure intelligence gathering and synthesis.',
    agents: 'All 5 Omega agents in read-only mode',
    capabilities: ['Truth mapping (Omniscient)', 'Strategy simulation (Overmind)', 'System analysis (Genesis)', 'Rhythm assessment (Eternal)', 'Unified report (Singularity)'],
    gate: 'No approval required',
  },
  {
    id: 'convergence',
    level: 'II',
    name: 'Convergence',
    color: '#2563EB',
    danger: 'LOW',
    image: '/omega/levels/convergence.png',
    desc: 'Agents create internal plans, blueprints, memory cards, and drafts. Nothing is sent or deployed externally.',
    agents: 'All 5 Omega agents in planning mode',
    capabilities: ['Feature blueprints (Genesis)', 'Conquest plans (Overmind)', 'Memory compression (Omniscient)', 'Schedule design (Eternal)', 'Coordinated mission plan (Singularity)'],
    gate: 'Confirm mission scope before plans are created',
  },
  {
    id: 'dominion',
    level: 'III',
    name: 'Dominion',
    color: '#D97706',
    danger: 'MEDIUM',
    image: '/omega/levels/dominion.png',
    desc: 'Agents execute internal operations. Terminal, database, and Hermes jobs run. External actions pause for approval.',
    agents: 'Full internal execution — external gated',
    capabilities: ['Internal code analysis (Genesis)', 'CRM data operations (Omniscient)', 'Hermes job creation (Eternal)', 'Resource allocation (Overmind)', 'Cross-agent coordination (Singularity)'],
    gate: 'Each external action requires individual approval',
  },
  {
    id: 'ascension',
    level: 'IV',
    name: 'Ascension',
    color: '#DC2626',
    danger: 'HIGH',
    image: '/omega/levels/ascension.png',
    desc: 'Full system coordination. All tools active. All five agents working as one will. Use for extreme missions only.',
    agents: 'Total coordination — all tools active',
    capabilities: ['System creation (Genesis)', 'Market execution (Overmind)', 'Full truth access (Omniscient)', 'Persistent automation (Eternal)', 'Singularity total unification'],
    gate: 'Explicit approval required at every critical step',
  },
];

type MissionMessage = {
  role: 'user' | 'coordinator';
  agent?: OmegaKey;
  content: string;
  timestamp: Date;
};

function LevelCard({
  level, selected, onSelect,
}: {
  level: typeof LEVEL_DETAIL[0];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        padding: selected ? '16px' : '14px 16px',
        borderRadius: 12,
        border: selected ? `1.5px solid ${level.color}60` : '1.5px solid rgba(255,255,255,0.08)',
        background: selected ? `${level.color}12` : 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(6px)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        width: '100%',
      }}
    >
      {/* Header row: big icon when selected, small inline when not */}
      {selected ? (
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
            border: `1px solid ${level.color}40`,
            boxShadow: `0 0 20px ${level.color}30`,
            position: 'relative',
          }}>
            <Image src={level.image} alt={level.name} fill sizes="72px" style={{ objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: level.color, fontFamily: 'var(--font-label)', letterSpacing: '0.12em' }}>
                LEVEL {level.level} — {level.name.toUpperCase()}
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                background: `${level.color}22`, color: level.color,
                fontFamily: 'var(--font-label)', letterSpacing: '0.08em',
              }}>
                {level.danger}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
              {level.desc}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, overflow: 'hidden', flexShrink: 0, position: 'relative', border: `1px solid ${level.color}30` }}>
            <Image src={level.image} alt={level.name} fill sizes="28px" style={{ objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: level.color, fontFamily: 'var(--font-label)', letterSpacing: '0.12em' }}>
            LEVEL {level.level} — {level.name.toUpperCase()}
          </span>
          <span style={{
            marginLeft: 'auto',
            fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
            background: `${level.color}20`, color: level.color,
            fontFamily: 'var(--font-label)', letterSpacing: '0.08em',
          }}>
            {level.danger}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {level.capabilities.slice(0, selected ? 5 : 2).map((cap, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <ChevronRight size={11} color={level.color} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{cap}</span>
          </div>
        ))}
      </div>
      {selected && (
        <div style={{
          marginTop: 10, padding: '5px 10px', borderRadius: 6,
          background: `${level.color}12`, border: `1px solid ${level.color}25`,
          fontSize: 11, color: level.color, fontWeight: 600,
          fontFamily: 'var(--font-label)',
        }}>
          Gate: {level.gate}
        </div>
      )}
    </button>
  );
}

export default function OperatingModesPage() {
  const [selectedLevel, setSelectedLevel] = useState('harmony');
  const [missionInput, setMissionInput] = useState('');
  const [messages, setMessages] = useState<MissionMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [convId, setConvId] = useState<string | undefined>();
  const [activeAgents, setActiveAgents] = useState<Set<OmegaKey>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const level = LEVEL_DETAIL.find(l => l.id === selectedLevel)!;
  const levelToken = OMEGA_LEVELS.find(l => l.id === selectedLevel)!;

  const runMission = useCallback(async () => {
    const text = missionInput.trim();
    if (!text || isRunning) return;
    setMissionInput('');

    setMessages(prev => [...prev, {
      role: 'user',
      content: text,
      timestamp: new Date(),
    }]);

    // Singularity coordinates all — send to singularity with all Omega agents context
    const missionPrompt = `[OMEGA:${selectedLevel.toUpperCase()}] [OPERATING_MODE:ALL_AGENTS]

Mission: ${text}

You are Singularity coordinating all 5 Omega agents:
- Genesis (The Creator): system creation and blueprints
- Overmind (The Conqueror): market strategy
- Omniscient (The Seer): truth and memory
- Eternal (The Constant): persistence and loops
- Singularity (The End of All): total coordination

Respond as if all agents have been briefed and are contributing. Level ${level.level} ${level.name}: ${level.desc}`;

    setIsRunning(true);
    // Animate agents as "active"
    const agentQueue: OmegaKey[] = ['omniscient', 'overmind', 'genesis', 'eternal', 'singularity'];
    agentQueue.forEach((ag, i) => {
      setTimeout(() => setActiveAgents(prev => new Set([...prev, ag])), i * 400);
    });

    setMessages(prev => [...prev, {
      role: 'coordinator',
      agent: 'singularity',
      content: '',
      timestamp: new Date(),
    }]);

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
          message: missionPrompt,
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
                if (last.role === 'coordinator') {
                  updated[updated.length - 1] = { ...last, content: last.content + evt.content };
                }
                return updated;
              });
              endRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
          } catch { /* skip */ }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev];
          if (updated[updated.length - 1].role === 'coordinator') {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: `Coordination error: ${err.message}`,
            };
          }
          return updated;
        });
      }
    } finally {
      setIsRunning(false);
      setActiveAgents(new Set());
    }
  }, [missionInput, isRunning, selectedLevel, convId, level]);

  const stop = () => { abortRef.current?.abort(); setIsRunning(false); setActiveAgents(new Set()); };

  return (
    <div className="omega-page-full">
      {/* Shader background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <ShaderAnimation />
      </div>

      {/* Page content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, padding: 32, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Sparkles size={18} color="#A855F7" />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A855F7', fontFamily: 'var(--font-label)' }}>
            Omega Operating Modes
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px', fontFamily: 'var(--font-heading)', color: 'var(--foreground)' }}>
          All Agents — One Mission
        </h1>
        <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', margin: 0, maxWidth: 480 }}>
          Coordinate all five Omega agents simultaneously. Select a level, define the mission, and deploy.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>
        {/* Left — Level selector */}
        <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--foreground-tertiary)', marginBottom: 4, fontFamily: 'var(--font-label)',
          }}>
            Select Level
          </div>
          {LEVEL_DETAIL.map(lvl => (
            <LevelCard
              key={lvl.id}
              level={lvl}
              selected={selectedLevel === lvl.id}
              onSelect={() => setSelectedLevel(lvl.id)}
            />
          ))}

          {/* Agent status */}
          <div style={{ marginTop: 8, padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10, fontFamily: 'var(--font-label)' }}>
              Agent Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {OMEGA_AGENTS.map(key => {
                const ag = OMEGA[key];
                const active = activeAgents.has(key);
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: active ? ag.accent : 'rgba(255,255,255,0.15)',
                      boxShadow: active ? `0 0 8px ${ag.accent}` : 'none',
                      transition: 'all 0.3s',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 12, color: active ? '#FFFFFF' : 'rgba(255,255,255,0.4)', fontWeight: active ? 600 : 400, transition: 'all 0.3s' }}>
                      {ag.name}
                    </span>
                    {active && (
                      <span style={{ fontSize: 9, color: ag.accent, fontFamily: 'var(--font-label)', marginLeft: 'auto' }}>ACTIVE</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right — Mission panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px 12px 0 0',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, opacity: 0.4 }}>
                <Sparkles size={32} color="#A855F7" />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>
                    Level {level.level} — {level.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                    {level.agents}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              if (msg.role === 'user') {
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      maxWidth: '75%', padding: '10px 14px',
                      borderRadius: '14px 14px 4px 14px',
                      background: 'rgba(168,85,247,0.15)',
                      border: '1px solid rgba(168,85,247,0.2)',
                      fontSize: 14, color: '#FFFFFF', lineHeight: 1.6,
                    }}>
                      {msg.content}
                    </div>
                  </div>
                );
              }

              const coordinator = msg.agent ? OMEGA[msg.agent] : null;
              return (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'linear-gradient(135deg, #2D0057, #6B21A8)',
                    border: `1px solid ${coordinator?.accent || '#A855F7'}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Sparkles size={14} color={coordinator?.accent || '#A855F7'} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#A855F7', fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'var(--font-label)', marginBottom: 4, textTransform: 'uppercase' }}>
                      Omega Council · {level.name} Mode
                    </div>
                    <div style={{
                      maxWidth: '90%', padding: '12px 16px',
                      borderRadius: '4px 14px 14px 14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      fontSize: 14, color: '#E0E0E8', lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content || (isRunning ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)' }}>
                          <span>Coordinating {activeAgents.size}/5 agents</span>
                          <span style={{ display: 'inline-block', width: 5, height: 12, background: '#A855F7', borderRadius: 2, animation: 'blink 0.8s infinite' }} />
                        </span>
                      ) : '...')}
                      {msg.content && isRunning && i === messages.length - 1 && (
                        <span style={{ display: 'inline-block', width: 5, height: 12, background: '#A855F7', borderRadius: 2, marginLeft: 2, verticalAlign: 'middle', animation: 'blink 0.8s infinite' }} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '14px 16px',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              display: 'flex', gap: 10, alignItems: 'flex-end',
              padding: '10px 14px', borderRadius: 10,
              border: `1px solid rgba(168,85,247,0.25)`,
              background: 'rgba(255,255,255,0.02)',
            }}>
              <textarea
                value={missionInput}
                onChange={e => setMissionInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runMission(); } }}
                placeholder={`Define mission for Level ${level.level} ${level.name} — all 5 Omega agents deploy`}
                rows={1}
                style={{
                  flex: 1, resize: 'none', border: 'none', outline: 'none',
                  background: 'transparent', color: '#FFFFFF',
                  fontSize: 14, lineHeight: 1.6, fontFamily: 'inherit',
                  maxHeight: 100,
                }}
                onInput={e => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
                }}
              />
              {isRunning ? (
                <button onClick={stop} style={{ padding: '6px', borderRadius: 8, border: 'none', background: 'rgba(168,85,247,0.2)', color: '#A855F7', cursor: 'pointer', flexShrink: 0 }}>
                  <Square size={16} fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={runMission}
                  disabled={!missionInput.trim()}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: missionInput.trim() ? '#6B21A8' : 'rgba(255,255,255,0.04)',
                    color: missionInput.trim() ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                    cursor: missionInput.trim() ? 'pointer' : 'not-allowed',
                    fontSize: 13, fontWeight: 600, flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Send size={14} /> Deploy
                </button>
              )}
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-label)', letterSpacing: '0.08em' }}>
                Ω OPERATING MODES · LEVEL {level.level} {level.name.toUpperCase()} · {level.danger} · 5 AGENTS
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
