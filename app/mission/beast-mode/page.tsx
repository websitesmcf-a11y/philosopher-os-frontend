'use client';

import { useState, useEffect } from 'react';
import { Zap, Shield, FileText, Play, Square, AlertTriangle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { usePageTitle } from '@/lib/use-page-title';
import { planBeastMission, chatWithAgent } from '@/lib/api-client';
import { ShiningText } from '@/components/ui/shining-text';
import { Loader, TextDotsLoader } from '@/components/ui/loader';
import { SmokeBackground } from '@/components/ui/smoke-background';

const BEAST_LEVELS = [
  {
    id: 'dry_run', label: 'Level 1 — Dry Run', icon: FileText, color: '#6F7D4F', desc: 'Simulate the mission.',
    danger: 'SAFE', dangerColor: '#16A34A',
    warning: 'Simulates the mission. Shows you the plan. No messages sent, no data changed, nothing leaves your computer.',
  },
  {
    id: 'assisted', label: 'Level 2 — Assisted Flow', icon: Shield, color: '#123C69', desc: 'Agents prepare work.',
    danger: 'LOW RISK', dangerColor: '#2563EB',
    warning: 'Agents prepare all the work but pause for your approval before any external action (sending a message, changing data).',
  },
  {
    id: 'approved', label: 'Level 3 — Approved Execution', icon: Play, color: '#C9A24D', desc: 'Agents execute approved actions.',
    danger: 'MEDIUM RISK', dangerColor: '#D97706',
    warning: 'Agents execute approved actions automatically within rate limits. Can send real messages and modify CRM data.',
  },
  {
    id: 'full', label: 'Level 4 — Full Beast Mode', icon: Zap, color: '#8B2020', desc: 'Full autonomous execution.',
    danger: 'HIGH RISK', dangerColor: '#DC2626',
    warning: 'Fully autonomous. Agents send real messages, modify data, spend money on APIs, and act without asking. Only use with all integrations connected and after testing on lower levels.',
  },
];

const PHILOSOPHERS = ['plato', 'socrates', 'aristotle', 'leonidas', 'athena', 'heraclitus', 'pythagoras', 'solon', 'archimedes', 'odysseus'];
const GODS = ['iapetus', 'astraeus', 'erebos', 'phantasos', 'stilbon'];
const ALL_AGENTS = [...PHILOSOPHERS, ...GODS];

// Keyword -> agent suggestion rules. Returns philosophers and gods separately.
const PHILOSOPHER_RULES: { keywords: string[]; agents: string[] }[] = [
  { keywords: ['strategy', 'strategize', 'plan', 'planning', 'decide', 'decision', 'direction'], agents: ['plato', 'socrates'] },
  { keywords: ['research', 'find', 'discover', 'investigate', 'learn', 'explore'], agents: ['heraclitus'] },
  { keywords: ['analyze', 'analyse', 'data', 'metrics', 'trends', 'statistics'], agents: ['pythagoras'] },
  { keywords: ['outreach', 'message', 'send', 'whatsapp', 'email', 'contact', 'communicate'], agents: ['odysseus'] },
  { keywords: ['manage', 'organize', 'coordinate', 'operations', 'run'], agents: ['leonidas', 'athena'] },
  { keywords: ['write', 'creative', 'copy', 'content', 'personalize'], agents: ['phantasos'] },
  { keywords: ['finance', 'money', 'budget', 'invoice', 'revenue'], agents: ['solon'] },
  { keywords: ['build', 'develop', 'code', 'technical', 'infrastructure'], agents: ['archimedes'] },
  { keywords: ['knowledge', 'memory', 'organize', 'categorize'], agents: ['aristotle'] },
];

const GOD_RULES: { keywords: string[]; agents: string[] }[] = [
  { keywords: ['leads', 'business', 'businesses', 'companies'], agents: ['iapetus'] },
  { keywords: ['trend', 'pattern', 'insight', 'discover'], agents: ['astraeus'] },
  { keywords: ['clean', 'duplicate', 'duplicates', 'audit', 'fix', 'repair', 'purge'], agents: ['erebos'] },
  { keywords: ['creative', 'write', 'personalize', 'imagine', 'vision'], agents: ['phantasos'] },
  { keywords: ['send', 'outreach', 'message', 'broadcast', 'campaign'], agents: ['stilbon'] },
];

function suggestAgents(text: string): { philosophers: string[]; gods: string[] } {
  const lower = text.toLowerCase();
  const philosophers: string[] = [];
  const gods: string[] = [];

  for (const rule of PHILOSOPHER_RULES) {
    if (rule.keywords.some(k => new RegExp(`\\b${k}\\b`).test(lower))) {
      for (const a of rule.agents) if (!philosophers.includes(a)) philosophers.push(a);
    }
  }
  for (const rule of GOD_RULES) {
    if (rule.keywords.some(k => new RegExp(`\\b${k}\\b`).test(lower))) {
      for (const a of rule.agents) if (!gods.includes(a)) gods.push(a);
    }
  }
  return { philosophers, gods };
}

export default function BeastModePage() {
  usePageTitle('Beast Mode');
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState('dry_run');
  const [objective, setObjective] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['iapetus', 'astraeus', 'stilbon']);
  const [suggestedPhilosophers, setSuggestedPhilosophers] = useState<string[]>([]);
  const [suggestedGods, setSuggestedGods] = useState<string[]>([]);
  const [autoSuggested, setAutoSuggested] = useState(false);
  const [missionRunning, setMissionRunning] = useState(false);
  const [missionActive, setMissionActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [checkpoints, setCheckpoints] = useState<{label:string;status:'pending'|'running'|'done'|'error';detail?:string}[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setLoadProgress(p => Math.min(p + 2, 100)), 100);
    const t = setTimeout(() => setLoading(false), 5000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  const toggleAgent = (agent: string) => { setAutoSuggested(false); setSelectedAgents(prev => prev.includes(agent) ? prev.filter(a => a !== agent) : [...prev, agent]); };

  // Apply keyword-based agent suggestions for the current objective.
  const applySuggestions = (text: string) => {
    const suggested = suggestAgents(text);
    const allPhilosophers = suggested.philosophers;
    const allGods = suggested.gods;
    const combined = [...allPhilosophers, ...allGods];
    if (combined.length > 0) {
      setSelectedAgents(combined);
      setSuggestedPhilosophers(allPhilosophers);
      setSuggestedGods(allGods);
      setAutoSuggested(true);
    }
  };

  // Debounced auto-suggest as the user types the objective.
  useEffect(() => {
    if (!objective.trim()) return;
    const t = setTimeout(() => applySuggestions(objective), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective]);

  const handleStart = async () => {
    if (!objective) return;
    const totalAgents = selectedLevel !== 'dry_run' ? selectedAgents.length : 0;
    const cps = [
      { label: 'Initializing', status: 'running' as const },
      { label: 'Planning mission', status: 'pending' as const },
      ...Array.from({ length: totalAgents }, (_, i) => ({ label: `Agent ${i+1}/${totalAgents}: ${selectedAgents[i]}`, status: 'pending' as const })),
      { label: 'Mission Complete', status: 'pending' as const },
    ];
    setCheckpoints(cps); setProgress(0); setLogs([]); setMissionRunning(true); setMissionActive(true);
    addLog(`🚀 Beast Mode ${selectedLevel.toUpperCase()} initialized`); addLog(`Objective: ${objective}`);
    await new Promise(r => setTimeout(r, 500));
    setCheckpoints(p => { const n = [...p]; n[0] = {...n[0], status: 'done'}; return n; }); setProgress(5);
    setCheckpoints(p => { const n = [...p]; n[1] = {...n[1], status: 'running'}; return n; }); addLog(`⏳ Planning mission...`); setProgress(10);
    try {
      const plan = await planBeastMission(objective, selectedAgents, selectedLevel);
      setCheckpoints(p => { const n = [...p]; n[1] = {...n[1], status: 'done'}; return n; }); addLog(`✅ Mission plan created`); setProgress(20);
      if (selectedLevel !== 'dry_run' && selectedAgents.length > 0) {
        let completed = 0, failed = 0;
        for (let i = 0; i < selectedAgents.length; i++) {
          const agent = selectedAgents[i], cpIdx = 2 + i;
          setCheckpoints(p => { const n = [...p]; n[cpIdx] = {...n[cpIdx], status: 'running'}; return n; });
          addLog(`⏳ Agent ${i+1}/${selectedAgents.length}: ${agent} running...`); setProgress(20 + Math.floor((i / selectedAgents.length) * 70));
          try {
            const response = await chatWithAgent(objective, agent, undefined);
            setCheckpoints(p => { const n = [...p]; n[cpIdx] = {...n[cpIdx], status: 'done', detail: response.reply?.slice(0,80)}; return n; });
            addLog(`✅ Agent ${i+1}/${selectedAgents.length}: ${agent} — ${(response.reply||'').slice(0,150)}`); completed++;
          } catch (err: any) {
            setCheckpoints(p => { const n = [...p]; n[cpIdx] = {...n[cpIdx], status: 'error', detail: err?.message}; return n; });
            addLog(`❌ Agent ${i+1}/${selectedAgents.length}: ${agent} — ${err?.detail || err?.message || 'Error'}`); failed++;
          }
        }
        addLog(`🏁 Mission complete — ${completed} succeeded, ${failed} failed`);
      } else addLog(`⚠ Dry run — no external actions taken.`);
      setProgress(100); setCheckpoints(p => { const n = [...p]; n[n.length-1] = {...n[n.length-1], status: 'done'}; return n; });
    } catch (err: any) { addLog(`❌ Mission failed: ${err?.detail || err?.message}`); }
    finally { setMissionRunning(false); }
  };

  const splashOpacity = loading ? 1 : 0;

  // Smoke background for Beast Mode (visible behind all views)
  const beastColor = BEAST_LEVELS.find(l => l.id === selectedLevel)?.color || '#8B2020';

  // Loading splash
  if (loading) return (
    <div className="min-h-screen w-full relative bg-white" style={{ position: 'fixed', inset: 0, zIndex: 9999, opacity: splashOpacity, transition: 'opacity 0.8s ease-out' }}>
      <div className="absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(circle at center, #FFF991 0%, transparent 70%)', opacity: 0.6, mixBlendMode: 'multiply' }} />
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: 'linear-gradient(to right, #e7e5e4 1px, transparent 1px), linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)',
        backgroundSize: '40px 40px', maskImage: 'repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)',
        WebkitMaskImage: 'repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)',
        maskComposite: 'intersect', WebkitMaskComposite: 'source-in',
      }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <ShiningText text="Beast Mode" className="text-5xl font-bold mb-8" />
        <div style={{ width: 400, maxWidth: '80vw' }}>
          <div style={{ width: '100%', height: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ width: `${loadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #C9A24D, #16A34A)', borderRadius: 2, transition: 'width 0.15s linear' }} />
          </div>
        </div>
        <TextDotsLoader text="Initializing" size="lg" />
      </div>
    </div>
  );

  // Mission active full-screen view
  if (missionActive) {
    const pct = Math.max(progress, Math.round((checkpoints.filter(c => c.status==='done'||c.status==='error').length / Math.max(checkpoints.length,1)) * 100));
    return (
      <div className="min-h-screen w-full relative bg-white" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(circle at center, #FFF991 0%, transparent 70%)', opacity: 0.4, mixBlendMode: 'multiply' }} />
        <div className="absolute inset-0 z-0" style={{
          backgroundImage: 'linear-gradient(to right, #e7e5e4 1px, transparent 1px), linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)',
          backgroundSize: '40px 40px', maskImage: 'repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)',
          WebkitMaskImage: 'repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)',
          maskComposite: 'intersect', WebkitMaskComposite: 'source-in',
        }} />
        <div style={{ position: 'relative', zIndex: 1, height: '100vh', display: 'flex', flexDirection: 'column', padding: 32, maxWidth: 800, margin: '0 auto' }}>
          <ShiningText text={`⚡ Beast Mode ${selectedLevel.toUpperCase()}`} className="text-2xl font-bold text-center mb-2" />
          <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', textAlign: 'center', marginBottom: 16 }}>{objective.slice(0, 80)}</p>
          <div style={{ width: '100%', height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: `${Math.min(pct,100)}%`, height: '100%', background: 'linear-gradient(90deg, #C9A24D, #16A34A)', borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginBottom: 16 }}>{pct}% complete</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {checkpoints.map((cp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 6, background: cp.status === 'running' ? 'rgba(201,162,77,0.08)' : 'transparent' }}>
                {cp.status === 'pending' && <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border)' }} />}
                {cp.status === 'running' && <Loader variant="pulse-dot" size="sm" />}
                {cp.status === 'done' && <CheckCircle2 size={16} color="#16A34A" />}
                {cp.status === 'error' && <AlertTriangle size={16} color="#ef4444" />}
                <span style={{ fontSize: 13, color: cp.status === 'done' ? '#16A34A' : cp.status === 'error' ? '#ef4444' : 'var(--foreground)', fontWeight: cp.status === 'running' ? 600 : 400 }}>{cp.label}</span>
                {cp.detail && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{cp.detail}</span>}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.02)', borderRadius: 8, padding: 12, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8, border: '1px solid var(--border)' }}>
            {logs.length === 0 ? <div style={{ color: 'var(--muted)', textAlign: 'center', paddingTop: 40 }}>Waiting for output...</div>
            : logs.map((log,i) => <div key={i} style={{ color: log.includes('❌')?'#ef4444':log.includes('⚠')?'#B8860B':log.includes('✅')||log.includes('🏁')?'#16A34A':log.includes('🚀')?'#C9A24D':'var(--foreground)' }}>{log}</div>)}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
            {missionRunning ? <button className="btn" onClick={() => { setMissionRunning(false); setMissionActive(false); }} style={{ padding:'10px 24px', border:'1px solid #ef4444', color:'#ef4444', background:'rgba(239,68,68,0.1)', fontWeight:600 }}><Square size={16} /> Stop</button>
            : <button className="btn" onClick={() => setMissionActive(false)} style={{ padding:'10px 24px', border:'1px solid var(--border)', fontWeight:600 }}>Back to Controls</button>}
          </div>
        </div>
      </div>
    );
  }

  // Normal form view
  return (
    <div className="min-h-screen w-full relative" style={{ padding: 32, background: '#0a0e12' }}>
      <SmokeBackground smokeColor={beastColor} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
        <ShiningText text="Beast Mode" className="text-4xl font-bold mb-2" />
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginBottom: 24 }}>Multi-agent mission orchestration</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Beast Level</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {BEAST_LEVELS.map(l => {
                const Icon = l.icon; const sel = selectedLevel === l.id;
                return (<button key={l.id} onClick={() => setSelectedLevel(l.id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', border:`1px solid ${sel ? l.color : 'rgba(255,255,255,0.15)'}`, borderRadius:6, cursor:'pointer', width:'100%', textAlign:'left', background:sel ? `${l.color}25` : 'rgba(255,255,255,0.03)' }}>
                  <div style={{ width:36, height:36, borderRadius:6, background:`${l.color}25`, display:'flex', alignItems:'center', justifyContent:'center' }}><Icon size={18} color={l.color} /></div>
                  <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{l.label}</div><div style={{ fontSize:12, color:sel ? '#fff' : 'rgba(255,255,255,0.6)' }}>{l.desc}</div></div>
                  <span style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, padding:'3px 8px', borderRadius:999, color:l.dangerColor, background:`${l.dangerColor}14`, border:`1px solid ${l.dangerColor}33`, whiteSpace:'nowrap' }}>{l.danger}</span>
                </button>);
              })}
            </div>
            {(() => {
              const lvl = BEAST_LEVELS.find(l => l.id === selectedLevel)!;
              return (
                <div style={{ display:'flex', gap:10, padding:'12px 14px', marginBottom:20, borderRadius:8, background:`${lvl.dangerColor}0D`, border:`1px solid ${lvl.dangerColor}40` }}>
                  <AlertTriangle size={18} color={lvl.dangerColor} style={{ flexShrink:0, marginTop:1 }} />
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, letterSpacing:0.5, color:lvl.dangerColor, marginBottom:4 }}>{lvl.danger}</div>
                    <div style={{ fontSize:13, lineHeight:1.5, color:'#fff' }}>{lvl.warning}</div>
                  </div>
                </div>
              );
            })()}
            <textarea value={objective} onChange={e => setObjective(e.target.value)} onBlur={e => applySuggestions(e.target.value)} placeholder="E.g., Find 50 plumbers with phone numbers and emails" style={{ width:'100%', minHeight:80, marginBottom:16, resize:'vertical', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:12, fontSize:14, background:'rgba(255,255,255,0.05)', color:'#fff' }} />
            {autoSuggested && (
              <div style={{ display:'flex', flexDirection:'column', gap:4, fontSize:12, color:'#C9A24D', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <Sparkles size={14} /> Suggested based on your goal
                </div>
                {suggestedPhilosophers.length > 0 && (
                  <div style={{ fontSize:11, color:'var(--muted)' }}>
                    Philosophers: {suggestedPhilosophers.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
                  </div>
                )}
                {suggestedGods.length > 0 && (
                  <div style={{ fontSize:11, color:'var(--muted)' }}>
                    Gods: {suggestedGods.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
                  </div>
                )}
              </div>
            )}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:0.5, color:'rgba(255,255,255,0.4)', marginBottom:6 }}>PHILOSOPHERS (Strategy &amp; Planning)</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:14 }}>
                {PHILOSOPHERS.map(a => (<button key={a} onClick={() => toggleAgent(a)} style={{ padding:'4px 10px', fontSize:12, border:`1px solid ${selectedAgents.includes(a) ? '#C9A24D' : 'rgba(255,255,255,0.15)'}`, borderRadius:4, cursor:'pointer', background:selectedAgents.includes(a) ? 'rgba(201,162,77,0.15)' : 'rgba(255,255,255,0.05)', color:selectedAgents.includes(a) ? '#C9A24D' : 'rgba(255,255,255,0.7)' }}>{a}</button>))}
              </div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:0.5, color:'rgba(255,255,255,0.4)', marginBottom:6 }}>GODS &amp; TITANS (Execution)</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {GODS.map(a => (<button key={a} onClick={() => toggleAgent(a)} style={{ padding:'4px 10px', fontSize:12, border:`1px solid ${selectedAgents.includes(a) ? '#C9A24D' : 'rgba(255,255,255,0.15)'}`, borderRadius:4, cursor:'pointer', background:selectedAgents.includes(a) ? 'rgba(201,162,77,0.15)' : 'rgba(255,255,255,0.05)', color:selectedAgents.includes(a) ? '#C9A24D' : 'rgba(255,255,255,0.7)' }}>{a}</button>))}
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleStart} disabled={!objective || missionRunning} style={{ padding:'12px 24px', fontSize:15, fontWeight:600 }}><Play size={18} /> {selectedLevel === 'dry_run' ? 'Run Dry Run' : 'Start Mission'}</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', color:'rgba(255,255,255,0.5)', fontSize:14 }}>
            <Zap size={48} style={{ opacity:0.3, marginBottom:16, color:'#C9A24D' }} />
            <p style={{ color:'rgba(255,255,255,0.6)' }}>Configure your mission and click <strong style={{ color:'#fff' }}>Run</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
