'use client';

import { useState, useEffect } from 'react';
import { Zap, Shield, FileText, Play, Square, AlertTriangle, CheckCircle2, Loader2, Sparkles, X, ExternalLink, ArrowRight } from 'lucide-react';
import { usePageTitle } from '@/lib/use-page-title';
import { planBeastMission, executeBeastMission, getBeastMission, controlBeastMission, getBrowserHarnessStatus } from '@/lib/api-client';
import { ShiningText } from '@/components/ui/shining-text';
import { Loader, TextDotsLoader } from '@/components/ui/loader';
import { SmokeBackground } from '@/components/ui/smoke-background';

const BEAST_LEVELS = [
  {
    id: 'dry_run', label: 'Level 1 — Dry Run', icon: FileText, color: '#6F7D4F', desc: 'Simulate the mission.',
    danger: 'SAFE', dangerColor: '#16A34A',
    agentTier: 'all_preview',
    warning: 'Simulates the mission. Shows you the plan, agent suggestions, and what would happen. No messages sent, no data changed, nothing leaves your computer.',
    toolText: 'Planning only — no tool execution',
  },
  {
    id: 'assisted', label: 'Level 2 — Assisted Flow', icon: Shield, color: '#123C69', desc: 'Agents prepare work.',
    danger: 'LOW RISK', dangerColor: '#2563EB',
    agentTier: 'philosophers',
    warning: 'Philosopher agents (Plato, Socrates, Heraclitus, Pythagoras, Solon) prepare the work but pause for approval before any external action. Gods/Titans are locked at this level.',
    toolText: 'Reasoning + memory only — no web search',
  },
  {
    id: 'approved', label: 'Level 3 — Approved Execution', icon: Play, color: '#C9A24D', desc: 'Agents execute approved actions.',
    danger: 'MEDIUM RISK', dangerColor: '#D97706',
    agentTier: 'all_except_spending',
    warning: 'All 15 agents including Gods/Titans execute automatically. Browser/web search tools enabled. Can send real messages and modify CRM data. Spending is NOT allowed.',
    toolText: 'All tools except spending — web search, browser, find_businesses',
  },
  {
    id: 'full', label: 'Level 4 — Full Beast Mode', icon: Zap, color: '#8B2020', desc: 'Full autonomous execution.',
    danger: 'HIGH RISK', dangerColor: '#DC2626',
    agentTier: 'all',
    warning: 'Fully autonomous. All 15 agents + browser tools + spending capability. Agents can send real messages, modify data, spend money on APIs, and act without asking. Only use with all integrations connected and banking details configured.',
    toolText: 'Everything — including payment/spend tools',
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
  const [currentMissionId, setCurrentMissionId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [checkpoints, setCheckpoints] = useState<{label:string;status:'pending'|'running'|'done'|'error';detail?:string}[]>([]);
  const [harnessConnected, setHarnessConnected] = useState(false);
  const [harnessChecked, setHarnessChecked] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!loading && !localStorage.getItem('beast-mode-tutorial-seen')) {
      setShowTutorial(true);
    }
  }, [loading]);

  const dismissTutorial = () => {
    localStorage.setItem('beast-mode-tutorial-seen', '1');
    setShowTutorial(false);
  };

  useEffect(() => {
    const interval = setInterval(() => setLoadProgress(p => Math.min(p + 2, 100)), 100);
    const t = setTimeout(() => setLoading(false), 5000);
    // Check browser harness status
    getBrowserHarnessStatus().then(s => {
      setHarnessConnected(s.connected);
      setHarnessChecked(true);
    }).catch(() => setHarnessChecked(true));
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
      { label: 'Executing mission', status: 'pending' as const },
      ...(totalAgents > 0 ? Array.from({ length: totalAgents }, (_, i) => ({ label: `Agent ${i+1}/${totalAgents}: ${selectedAgents[i]}`, status: 'pending' as const })) : []),
      { label: 'Mission Complete', status: 'pending' as const },
    ];
    setCheckpoints(cps); setProgress(0); setLogs([]); setMissionRunning(true); setMissionActive(true);
    addLog(`🚀 Beast Mode ${selectedLevel.toUpperCase()} initialized`); addLog(`Objective: ${objective}`);
    if ((selectedLevel === 'approved' || selectedLevel === 'full') && !harnessConnected) {
      addLog(`⚠ Browser harness not connected — agents will use fallback sources (OpenStreetMap, web search) with limited data`);
    }
    await new Promise(r => setTimeout(r, 500));
    setCheckpoints(p => { const n = [...p]; n[0] = {...n[0], status: 'done'}; return n; }); setProgress(5);
    setCheckpoints(p => { const n = [...p]; n[1] = {...n[1], status: 'running'}; return n; }); addLog(`⏳ Planning mission...`); setProgress(10);
    try {
      const plan = await planBeastMission(objective, selectedAgents, selectedLevel);
      setCheckpoints(p => { const n = [...p]; n[1] = {...n[1], status: 'done'}; return n; }); addLog(`✅ Mission plan created`); setProgress(15);
      if (selectedLevel !== 'dry_run' && selectedAgents.length > 0) {
        setCheckpoints(p => { const n = [...p]; n[2] = {...n[2], status: 'running'}; return n; });
        addLog(`⏳ Starting agents on backend (async)...`); setProgress(20);
        try {
          // Start the mission — backend returns immediately with a mission_id
          const { mission_id, status } = await executeBeastMission(objective, selectedAgents, selectedLevel);
          setCurrentMissionId(mission_id);
          addLog(`📋 Mission ${mission_id} started (${status})`);
          // Poll for progress every 3 seconds
          const POLL_INTERVAL = 3000;
          const MAX_POLLS = 600;
          let completed = 0, failed = 0;
          const seenIndices = new Set<number>();
          const seenErrors = new Set<string>();
          for (let poll = 0; poll < MAX_POLLS; poll++) {
            await new Promise(r => setTimeout(r, POLL_INTERVAL));
            let mission: any;
            try { mission = await getBeastMission(mission_id); } catch { continue; }
            if (!mission || !mission.steps) continue;
            const steps = mission.steps || [];
            for (let i = 0; i < steps.length; i++) {
              if (seenIndices.has(i)) continue;
              const step = steps[i];
              const cpIdx = 3 + i;
              if (step.status === 'completed') {
                setCheckpoints(p => { const n = [...p]; n[cpIdx] = {...n[cpIdx], status: 'done', detail: (step.result||'').slice(0,80)}; return n; });
                addLog(`✅ Agent ${i+1}/${totalAgents}: ${step.agent} — ${(step.result||'').slice(0,200)}`); completed++;
                seenIndices.add(i);
              } else if (step.status === 'failed') {
                setCheckpoints(p => { const n = [...p]; n[cpIdx] = {...n[cpIdx], status: 'error', detail: step.error}; return n; });
                addLog(`❌ Agent ${i+1}/${totalAgents}: ${step.agent} — ${step.error || 'Failed'}`); failed++;
                seenIndices.add(i);
              }
            }
            if (mission.errors?.length) {
              for (const e of mission.errors) {
                if (seenErrors.has(e)) continue;
                seenErrors.add(e);
                addLog(`⚠ ${e}`);
              }
            }
            const doneCount = seenIndices.size;
            setProgress(20 + Math.round((doneCount / totalAgents) * 60));
            if (mission.status === 'completed' || mission.status === 'completed_with_errors' || mission.status === 'failed' || mission.status === 'cancelled') {
              addLog(`🏁 Mission complete — ${completed} succeeded, ${failed} failed`);
              if (mission.status === 'failed' || mission.status === 'completed_with_errors') {
                const errs = (mission.errors||[]).filter((e: string) => !seenErrors.has(e));
                if (errs.length) addLog(`⚠ ${errs.join('; ')}`);
              }
              break;
            }
          }
        } catch (err: any) {
          addLog(`❌ Execution failed: ${err?.detail || err?.message || 'Unknown error'}`);
        }
        setCheckpoints(p => { const n = [...p]; n[2] = {...n[2], status: 'done'}; return n; });
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

  // First-time tutorial overlay
  if (showTutorial) return (
    <div className="min-h-screen w-full relative" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0a0e12', overflowY: 'auto' }}>
      <div className="absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(circle at center, #FFF991 0%, transparent 70%)', opacity: 0.3, mixBlendMode: 'multiply' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <ShiningText text="🐉 Welcome to Beast Mode" className="text-3xl font-bold" />
          <button onClick={dismissTutorial} style={{ padding: 8, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.5)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Level overview */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16, letterSpacing: '0.03em' }}>Choose Your Beast Level</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BEAST_LEVELS.map(l => {
              const Icon = l.icon;
              return (
                <div key={l.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: `${l.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={l.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{l.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, color: l.dangerColor, background: `${l.dangerColor}14`, border: `1px solid ${l.dangerColor}33` }}>{l.danger}</span>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{l.warning}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browser harness requirement */}
        <div style={{ marginBottom: 28, padding: '18px 20px', borderRadius: 10, background: 'rgba(18,60,105,0.1)', border: '1px solid rgba(18,60,105,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <ExternalLink size={18} color="#3B82F6" />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#3B82F6' }}>Levels 3 &amp; 4 Need Browser Harness</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Web search, Google Maps scraping, and site browsing require the <strong>Browser Harness</strong> — a small agent you install on your computer that connects your local Chrome to Philosopher OS. Without it, agents fall back to OpenStreetMap and basic web search which have limited data.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(59,130,246,0.7)', marginTop: 8, marginBottom: 0 }}>
            → Set it up in <strong>Integrations → Browser Harness</strong>. It takes 2 minutes.
          </p>
        </div>

        {/* Payment requirement */}
        <div style={{ marginBottom: 32, padding: '18px 20px', borderRadius: 10, background: 'rgba(139,32,32,0.1)', border: '1px solid rgba(139,32,32,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Zap size={18} color="#ff6b6b" />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#ff6b6b' }}>Level 4 Spending Requires Stripe</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Level 4 can spend money on APIs and services autonomously. To enable real spending, connect a <strong>Stripe</strong> or other payment provider in Integrations. Without one, all spending is simulated — agents will plan expenses but nothing actually charges.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,107,107,0.7)', marginTop: 8, marginBottom: 0 }}>
            → No payment provider needed unless you want agents to spend real money.
          </p>
        </div>

        {/* Quick tip */}
        <div style={{ marginBottom: 32, padding: '16px 20px', borderRadius: 10, background: 'rgba(201,162,77,0.08)', border: '1px solid rgba(201,162,77,0.2)' }}>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            💡 <strong>Start with Dry Run</strong> to preview what the agents will do. Then work your way up. All agents are auto-suggested based on your objective — but you can always pick specific ones.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={dismissTutorial} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 36px', fontSize: 15, fontWeight: 700 }}>
            Got it, let's go <ArrowRight size={18} />
          </button>
        </div>
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
            {missionRunning ? <button className="btn" onClick={async () => {
              if (currentMissionId) {
                try { await controlBeastMission(currentMissionId, 'cancel'); } catch {}
              }
              setMissionRunning(false); setMissionActive(false);
            }} style={{ padding:'10px 24px', border:'1px solid #ef4444', color:'#ef4444', background:'rgba(239,68,68,0.1)', fontWeight:600 }}><Square size={16} /> Stop</button>
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
                {PHILOSOPHERS.map(a => {
                  const locked = selectedLevel === 'assisted' ? false : selectedLevel === 'dry_run' ? true : false;
                  return (<button key={a} onClick={() => !locked && toggleAgent(a)} style={{ padding:'4px 10px', fontSize:12, border:`1px solid ${selectedAgents.includes(a) ? '#C9A24D' : 'rgba(255,255,255,0.15)'}`, borderRadius:4, cursor:locked ? 'not-allowed' : 'pointer', background:selectedAgents.includes(a) ? 'rgba(201,162,77,0.15)' : 'rgba(255,255,255,0.05)', color:selectedAgents.includes(a) ? '#C9A24D' : 'rgba(255,255,255,0.7)', opacity: locked ? 0.4 : 1 }}>{a}{locked ? ' 🔒' : ''}</button>);
                })}
              </div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:0.5, color:'rgba(255,255,255,0.4)', marginBottom:6 }}>GODS &amp; TITANS (Execution)</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {GODS.map(a => {
                  const locked = selectedLevel === 'assisted' || selectedLevel === 'dry_run';
                  return (<button key={a} onClick={() => !locked && toggleAgent(a)} style={{ padding:'4px 10px', fontSize:12, border:`1px solid ${selectedAgents.includes(a) ? '#C9A24D' : 'rgba(255,255,255,0.15)'}`, borderRadius:4, cursor:locked ? 'not-allowed' : 'pointer', background:selectedAgents.includes(a) ? 'rgba(201,162,77,0.15)' : 'rgba(255,255,255,0.05)', color:selectedAgents.includes(a) ? '#C9A24D' : 'rgba(255,255,255,0.7)', opacity: locked ? 0.4 : 1 }}>{a}{locked ? ' 🔒' : ''}</button>);
                })}
              </div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:8 }}>
                {(() => {
                  const lvl = BEAST_LEVELS.find(l => l.id === selectedLevel);
                  if (!lvl) return '';
                  return <span>🔧 {lvl.toolText}</span>;
                })()}
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleStart} disabled={!objective || missionRunning} style={{ padding:'12px 24px', fontSize:15, fontWeight:600 }}><Play size={18} /> {selectedLevel === 'dry_run' ? 'Run Dry Run' : 'Start Mission'}</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
            {(() => {
              const lvl = BEAST_LEVELS.find(l => l.id === selectedLevel);
              if (!lvl) return null;
              return <>
                <div style={{ padding: 16, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={16} color={lvl.color} />
                    <span style={{ color: lvl.color }}>{lvl.label}</span>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>{lvl.warning}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    <div style={{ marginBottom: 4 }}>🔧 <strong>Tools:</strong> {lvl.toolText}</div>
                    <div style={{ marginBottom: 4 }}>🤖 <strong>Agents:</strong> {lvl.agentTier === 'all_preview' ? 'All agents previewed (none execute)' : lvl.agentTier === 'philosophers' ? '5 Philosophers (Plato, Socrates, Heraclitus, Pythagoras, Solon)' : lvl.agentTier === 'all_except_spending' ? 'All 15 agents — spending locked' : 'All 15 agents + spending enabled'}</div>
                    {(selectedLevel === 'approved' || selectedLevel === 'full') && harnessChecked && !harnessConnected && (
                      <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, background: 'rgba(201,162,77,0.15)', border: '1px solid rgba(201,162,77,0.3)', fontSize: 12, color: '#C9A24D' }}>
                        ⚠️ <strong>Browser Harness not connected.</strong> Agents will fall back to OpenStreetMap + web search which have limited contact data. Install the harness agent from Integrations to enable Google Maps scraping and full browsing.
                      </div>
                    )}
                    {(selectedLevel === 'approved' || selectedLevel === 'full') && harnessChecked && harnessConnected && (
                      <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', fontSize: 12, color: '#16A34A' }}>
                        ✅ <strong>Browser Harness connected.</strong> Agents can search Google Maps, browse the web, and access sites through your Chrome.
                      </div>
                    )}
                    {selectedLevel === 'full' && (
                      <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, background: 'rgba(139,32,32,0.15)', border: '1px solid rgba(139,32,32,0.3)', fontSize: 12, color: '#ff6b6b' }}>
                        ⚠️ Spending requires a connected payment provider (Stripe or similar) in Integrations. Without one, spending is simulated.
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ padding: 14, borderRadius: 8, background: 'rgba(201,162,77,0.06)', border: '1px solid rgba(201,162,77,0.15)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#C9A24D', marginBottom: 6 }}>💡 Tip</div>
                  <p style={{ fontSize: 12, lineHeight: 1.5, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                    Start with <strong>Dry Run</strong> to see the plan, then move up levels as you verify each step. God/Titan agents are unlocked at Level 3+ and can take autonomous actions.
                  </p>
                </div>
              </>;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
