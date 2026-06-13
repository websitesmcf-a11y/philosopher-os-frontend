'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  getDashboardMetrics, getAgentBriefing, getConnections,
  listCampaigns, chatStream, listAgentConversations, getAgentConversationMessages,
} from '@/lib/api-client';
import {
  Brain, User, Users, Building2, Wallet, Megaphone,
  CheckSquare, MessageSquare, ArrowRight, Sparkles, Plug,
} from 'lucide-react';
import { usePageTitle } from '@/lib/use-page-title';
import { PHILOSOPHERS } from '@/lib/design-tokens';
import { AIInputWithFile } from '@/components/ui/ai-input-with-file';
import { composeMessageWithFile } from '@/lib/attach-file';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { ThinkingBox, type ThinkingStep } from '@/components/thinking-box';

type Message = {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
};

const CONV_STORAGE_KEY = 'agent_conversation_ids';
const PLATO = 'plato';
const PLATO_COLOR = PHILOSOPHERS.plato.color;

function loadPlatoConvId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return JSON.parse(localStorage.getItem(CONV_STORAGE_KEY) || '{}')[PLATO];
  } catch {
    return undefined;
  }
}

function savePlatoConvId(id: string) {
  try {
    const all = JSON.parse(localStorage.getItem(CONV_STORAGE_KEY) || '{}');
    all[PLATO] = id;
    localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

function renderLine(line: string, j: number) {
  if (line.startsWith('**') && line.endsWith('**')) {
    return <div key={j} style={{ fontWeight: 600, marginBottom: 4 }}>{line.slice(2, -2)}</div>;
  }
  if (line.startsWith('- ')) {
    return <div key={j} style={{ paddingLeft: 12, marginBottom: 2 }}>&bull; {line.slice(2)}</div>;
  }
  if (line.startsWith('#')) {
    return <div key={j} style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{line.replace(/^#+\s*/, '')}</div>;
  }
  return line ? <div key={j} style={{ marginBottom: 2 }}>{line}</div> : <div key={j} style={{ height: 8 }} />;
}

export default function PlatoPage() {
  usePageTitle('Plato');
  const [greeting, setGreeting] = useState('Welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const convIdRef = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: metrics } = useQuery({ queryKey: ['dashboard-metrics'], queryFn: getDashboardMetrics });
  const { data: briefing } = useQuery({ queryKey: ['plato-briefing'], queryFn: getAgentBriefing });
  const { data: connections } = useQuery({ queryKey: ['connections'], queryFn: getConnections });
  const { data: draftCampaigns } = useQuery({
    queryKey: ['campaigns', 'draft'],
    queryFn: () => listCampaigns({ status: 'draft', page: 1, page_size: 5 }),
  });

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 5 ? 'Good evening' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  // Load persisted Plato conversation
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let convId = loadPlatoConvId();
        if (!convId) {
          const convs = await listAgentConversations({ agent: PLATO, limit: 1 });
          convId = convs.items[0]?.id;
        }
        if (convId && !cancelled) {
          const history = await getAgentConversationMessages(convId);
          if (cancelled) return;
          convIdRef.current = convId;
          savePlatoConvId(convId);
          setMessages(history.items.map(m => ({
            role: m.role === 'assistant' ? 'agent' as const : 'user' as const,
            content: m.content,
            timestamp: m.created_at ? new Date(m.created_at) : new Date(),
          })));
        }
      } catch {
        // best-effort; empty conversation is fine
      } finally {
        if (!cancelled) setHistoryLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    setThinkingSteps([]);
    setMessages(prev => [
      ...prev,
      { role: 'user', content: trimmed, timestamp: new Date() },
      { role: 'agent', content: '', timestamp: new Date() },
    ]);
    setIsStreaming(true);
    abortRef.current = new AbortController();

    try {
      for await (const event of chatStream(trimmed, PLATO, convIdRef.current, abortRef.current.signal)) {
        if (event.conversation_id) {
          convIdRef.current = event.conversation_id;
          savePlatoConvId(event.conversation_id);
        }
        if (event.type === 'token' && event.content) {
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === 'agent') {
              updated[updated.length - 1] = { ...last, content: last.content + event.content! };
            }
            return updated;
          });
        } else if (event.type === 'tool_start' || event.type === 'tool') {
          setThinkingSteps(prev => [...prev, {
            tool: event.tool || 'tool',
            input: event.input || event.content || '',
            output: event.output,
            duration: event.duration_ms,
            timestamp: new Date(),
          }]);
        } else if (event.type === 'tool_end') {
          setThinkingSteps(prev => {
            if (prev.length === 0) {
              return [{
                tool: event.tool || 'tool',
                input: event.input || '',
                output: event.output || event.content,
                duration: event.duration_ms,
                timestamp: new Date(),
              }];
            }
            const updated = [...prev];
            // Attach the result to the most recent step for this tool
            for (let i = updated.length - 1; i >= 0; i--) {
              if (!event.tool || updated[i].tool === event.tool) {
                updated[i] = {
                  ...updated[i],
                  output: event.output || event.content || updated[i].output,
                  duration: event.duration_ms ?? updated[i].duration,
                };
                break;
              }
            }
            return updated;
          });
        } else if (event.type === 'error') {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'agent',
              content: `I ran into an error: ${event.content || 'unknown error'}. Please try again.`,
              timestamp: new Date(),
            };
            return updated;
          });
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'agent',
            content: `I ran into an error: ${err instanceof Error ? err.message : 'unable to reach the council'}. Please try again.`,
            timestamp: new Date(),
          };
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming]);

  const stopStream = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  // Live context strip — every value is real from the API
  const contextChips = metrics ? [
    { icon: Users, label: 'Leads', value: metrics.total_leads, href: '/leads' },
    { icon: Building2, label: 'Clients', value: metrics.total_clients, href: '/clients' },
    { icon: Wallet, label: 'MRR', value: metrics.mrr > 0 ? `R${(metrics.mrr).toLocaleString()}` : 'R0', href: '/finance' },
    { icon: Megaphone, label: 'Campaigns', value: metrics.active_campaigns, href: '/campaigns' },
    { icon: CheckSquare, label: 'Tasks', value: metrics.tasks_pending, href: '/tasks' },
    { icon: MessageSquare, label: 'Msgs today', value: metrics.messages_today, href: '/conversations' },
  ] : [];

  // Suggested actions — derived from real state only
  const actions: Array<{ label: string; href?: string; prompt?: string }> = [];
  if (metrics) {
    if (metrics.tasks_pending > 0) {
      actions.push({ label: `Review ${metrics.tasks_pending} pending task${metrics.tasks_pending === 1 ? '' : 's'}`, href: '/tasks' });
    }
    if (metrics.total_leads === 0) {
      actions.push({ label: 'Add your first lead', href: '/leads' });
    }
  }
  if ((draftCampaigns?.items?.length ?? 0) > 0) {
    actions.push({ label: `Launch draft campaign "${draftCampaigns!.items[0].name}"`, href: '/campaigns' });
  }
  const disconnected = (connections?.connections ?? []).filter(
    c => ['whatsapp', 'email'].includes(c.provider) && c.status !== 'connected'
  );
  for (const c of disconnected) {
    actions.push({ label: `Connect ${c.label}`, href: '/connections' });
  }

  const promptChips = [
    'What should I focus on today?',
    'Summarize my pipeline',
    'Any risks I should know about?',
  ];

  const briefingSummary = (briefing as { briefing?: { summary?: string } } | undefined)?.briefing?.summary;
  const showWelcome = historyLoaded && messages.length === 0;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px - 48px)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient layers — etched gold blueprint strokes over travertine */}
      <BackgroundPaths color={PLATO_COLOR} />
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 60% 40% at 50% -5%, ${PLATO_COLOR}14, transparent 70%)`,
      }} />

      <div className="page-content fade-in" style={{
        display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
        maxWidth: 860, width: '100%', margin: '0 auto', paddingBottom: 0,
        paddingTop: 0, position: 'relative',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '24px 0 14px' }}>
          <div style={{
            width: 44, height: 44, margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: PHILOSOPHERS.plato.gradient,
            boxShadow: 'var(--shadow-gallery)',
          }}>
            <Brain size={22} color="white" />
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 500, letterSpacing: 'var(--letter-spacing-heading)',
            margin: 0, fontFamily: 'var(--font-heading)',
          }}>
            {greeting}.
          </h1>
          {briefingSummary && (
            <p style={{
              fontSize: 13.5, color: 'var(--foreground-secondary)', margin: '6px auto 0',
              maxWidth: 560, lineHeight: 1.55,
            }}>
              {briefingSummary}
            </p>
          )}
        </div>

        {/* Live context strip — sharp-edged catalog chips */}
        {contextChips.length > 0 && (
          <div style={{
            display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12,
          }}>
            {contextChips.map(chip => (
              <Link key={chip.label} href={chip.href} style={{ textDecoration: 'none' }}>
                <div className="stone-hover" style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  fontSize: 11, color: 'var(--foreground-secondary)',
                  fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  <chip.icon size={12} color={PLATO_COLOR} />
                  <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{chip.value}</span>
                  <span>{chip.label}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Suggested actions — real state only */}
        {actions.length > 0 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            {actions.slice(0, 4).map(a => (
              <Link key={a.label} href={a.href!} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                  fontSize: 12.5, fontWeight: 500,
                  background: `${PLATO_COLOR}0d`, color: PLATO_COLOR, border: `1px solid ${PLATO_COLOR}25`,
                }}>
                  {a.label.startsWith('Connect') ? <Plug size={12} /> : <Sparkles size={12} />}
                  {a.label}
                  <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Conversation — etched slab */}
        <div className="etched-surface" style={{
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0,
          marginBottom: 16,
        }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {showWelcome && (
              <div style={{ textAlign: 'center', margin: 'auto', maxWidth: 420 }}>
                <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', lineHeight: 1.6 }}>
                  I&apos;m Plato — your chief of staff. I coordinate the Philosopher Council and
                  have live access to your leads, clients, campaigns, tasks, and finances.
                  Ask me anything about the business.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start', maxWidth: '85%',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                {msg.role === 'agent' && (
                  <div style={{
                    width: 28, height: 28, flexShrink: 0, marginTop: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${PLATO_COLOR}15`,
                  }}>
                    <Brain size={14} color={PLATO_COLOR} />
                  </div>
                )}
                {msg.role === 'user' && (
                  <div style={{
                    width: 28, height: 28, flexShrink: 0, marginTop: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--accent-subtle)',
                  }}>
                    <User size={14} color="var(--accent)" />
                  </div>
                )}
                <div style={{
                  padding: '10px 14px', fontSize: 14, lineHeight: 1.6,
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--background)',
                  color: msg.role === 'user' ? 'white' : 'var(--foreground)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                  boxShadow: msg.role === 'user' ? 'none' : 'var(--shadow-etched)',
                  minHeight: msg.content === '' ? 20 : undefined,
                }}>
                  {msg.content === '' && isStreaming ? (
                    <span style={{ display: 'flex', gap: 4 }}>
                      <span style={{ animation: 'platoBounce 1.4s infinite', animationDelay: '0s' }}>.</span>
                      <span style={{ animation: 'platoBounce 1.4s infinite', animationDelay: '0.2s' }}>.</span>
                      <span style={{ animation: 'platoBounce 1.4s infinite', animationDelay: '0.4s' }}>.</span>
                    </span>
                  ) : (
                    msg.content.split('\n').map(renderLine)
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Agent reasoning trace — collected from SSE tool events */}
          <ThinkingBox steps={thinkingSteps} isStreaming={isStreaming && thinkingSteps.length > 0} />

          {/* Prompt chips + input */}
          <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--border)' }}>
            {showWelcome && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {promptChips.map(p => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="stone-hover"
                    style={{
                      padding: '5px 10px', fontSize: 12, cursor: 'pointer',
                      border: '1px solid var(--border)', background: 'transparent',
                      color: 'var(--foreground-secondary)', boxShadow: 'none', width: 'auto',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <AIInputWithFile
                className="flex-1 py-0 sm:py-0 px-0 sm:px-0"
                placeholder="Ask Plato anything about your business..."
                accept=""
                maxFileSize={5}
                disabled={isStreaming}
                onSubmit={(message, file) => {
                  void composeMessageWithFile(message, file).then(text => { if (text) send(text); });
                }}
              />
              {isStreaming && (
                <button
                  onClick={stopStream}
                  title="Stop streaming"
                  style={{
                    padding: '8px 10px', border: '1px solid var(--border)',
                    background: 'var(--surface-inset)', color: 'var(--foreground)',
                    cursor: 'pointer', alignSelf: 'flex-end', height: 38, marginBottom: 8,
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <rect x="6" y="6" width="12" height="12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes platoBounce {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
