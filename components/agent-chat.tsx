'use client';

import { useState, useRef, useEffect, useCallback, createElement } from 'react';
import { Bot, Brain, BookOpen, Shield, Search, BarChart3, Wallet, ShieldCheck, Wrench, MessageSquare, Gavel, Swords, Compass, User, Radio, Plus, History, X, MessageCircle } from 'lucide-react';
import { PHILOSOPHERS, GODS } from '@/lib/design-tokens';
import { useModeStore } from '@/lib/mode-store';
import { AIInputWithFile } from '@/components/ui/ai-input-with-file';
import AgentPortrait from '@/components/ui/agent-portrait';
import { AgentSelect } from '@/components/ui/agent-select';
import { listAgentConversations, getAgentConversationMessages } from '@/lib/api-client';

const ICON_MAP = { Brain, Bot, BookOpen, Shield, Search, BarChart3, Wallet, ShieldCheck, Wrench, MessageSquare, Gavel, Swords, Compass } as const;

type Agent = {
  name: string;
  icon: typeof Bot;
  color: string;
  role: string;
};

const AGENTS: Agent[] = [
  ...Object.entries(PHILOSOPHERS).map(([key, p]) => ({
    name: key,
    role: p.role,
    icon: ICON_MAP[p.icon as keyof typeof ICON_MAP] || Bot,
    color: p.color,
  })),
  ...Object.entries(GODS).map(([key, g]) => ({
    name: key,
    role: g.role,
    icon: Bot,
    color: g.color,
  })),
];

type Message = {
  role: 'user' | 'agent';
  content: string;
  agent?: string;
  timestamp: Date;
};

const CONV_STORAGE_KEY = 'agent_conversation_ids';

function loadConvIds(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(CONV_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function greetingFor(agent: Agent): Message {
  return {
    role: 'agent',
    content: `Hello, I'm **${agent.name}** (${agent.role}). How can I help you?`,
    agent: agent.name,
    timestamp: new Date(),
  };
}

export default function AgentChat({ initialAgent = 'plato' }: { initialAgent?: string }) {
  const [selectedAgent, setSelectedAgent] = useState(
    AGENTS.find(a => a.name === initialAgent) || AGENTS[0]
  );
  const [histories, setHistories] = useState<Record<string, Message[]>>({});
  const [convIds, setConvIds] = useState<Record<string, string>>(loadConvIds);
  const [loadedAgents, setLoadedAgents] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [streamMode, setStreamMode] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const messages = histories[selectedAgent.name] ?? [greetingFor(selectedAgent)];

  const setAgentMessages = useCallback((agentName: string, updater: (prev: Message[]) => Message[]) => {
    setHistories(prev => {
      const current = prev[agentName] ?? [];
      return { ...prev, [agentName]: updater(current) };
    });
  }, []);

  const rememberConvId = useCallback((agentName: string, id: string) => {
    if (!id) return;
    setConvIds(prev => {
      if (prev[agentName] === id) return prev;
      const next = { ...prev, [agentName]: id };
      try { localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Load conversation history list
  const loadConversations = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await listAgentConversations({ limit: 50 });
      setConversations(data.items || []);
    } catch {
      // silent
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const resumeConversation = useCallback(async (convId: string, agentName: string) => {
    try {
      const history = await getAgentConversationMessages(convId);
      const agent = AGENTS.find(a => a.name === agentName) || AGENTS[0];
      setSelectedAgent(agent);
      rememberConvId(agentName, convId);
      if (history.items.length > 0) {
        setHistories(prev => ({
          ...prev,
          [agentName]: history.items.map((m: any) => ({
            role: m.role === 'assistant' ? 'agent' as const : 'user' as const,
            content: m.content,
            agent: m.agent || agentName,
            timestamp: m.created_at ? new Date(m.created_at) : new Date(),
          })),
        }));
      }
      setLoadedAgents(prev => ({ ...prev, [agentName]: true }));
      setShowHistory(false);
    } catch {
      // silent
    }
  }, [rememberConvId]);

  // Load persisted history when an agent is first viewed
  useEffect(() => {
    const agentName = selectedAgent.name;
    if (loadedAgents[agentName]) return;
    let cancelled = false;

    (async () => {
      try {
        const { listAgentConversations, getAgentConversationMessages } = await import('@/lib/api-client');
        let convId = convIds[agentName];
        if (!convId) {
          const convs = await listAgentConversations({ agent: agentName, limit: 1 });
          convId = convs.items[0]?.id;
        }
        if (convId && !cancelled) {
          const history = await getAgentConversationMessages(convId);
          if (cancelled) return;
          rememberConvId(agentName, convId);
          if (history.items.length > 0) {
            setHistories(prev => ({
              ...prev,
              [agentName]: history.items.map(m => ({
                role: m.role === 'assistant' ? 'agent' as const : 'user' as const,
                content: m.content,
                agent: m.agent || agentName,
                timestamp: m.created_at ? new Date(m.created_at) : new Date(),
              })),
            }));
          }
        }
      } catch {
        // history is best-effort; greeting remains
      } finally {
        if (!cancelled) setLoadedAgents(prev => ({ ...prev, [agentName]: true }));
      }
    })();

    return () => { cancelled = true; };
  }, [selectedAgent.name, convIds, loadedAgents, rememberConvId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const currentMode = useModeStore(s => s.currentMode);
  const setMode = useModeStore(s => s.setMode);

  const switchAgent = useCallback((agent: Agent) => {
    if (isStreaming) {
      abortRef.current?.abort();
      setIsStreaming(false);
      setIsLoading(false);
    }
    setSelectedAgent(agent);
    // Selecting an agent is a mode switch — keep the whole OS in that mode
    setMode(agent.name as any);
  }, [isStreaming, setMode]);

  // Mode → agent sync is disabled (ModePicker removed). Agent is selected
  // via URL param or the dropdown — never auto-override.

  const stopStream = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setIsLoading(false);
  };

  const newConversation = () => {
    if (isStreaming) abortRef.current?.abort();
    setIsStreaming(false);
    setIsLoading(false);
    const agentName = selectedAgent.name;
    setConvIds(prev => {
      const next = { ...prev };
      delete next[agentName];
      try { localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    setHistories(prev => ({ ...prev, [agentName]: [greetingFor(selectedAgent)] }));
  };

  const sendMessageLegacy = async (text: string) => {
    const agentName = selectedAgent.name;
    setAgentMessages(agentName, prev => [...prev, {
      role: 'agent', content: '', agent: agentName, timestamp: new Date(),
    }]);

    try {
      const { chatWithAgent } = await import('@/lib/api-client');
      const response = await chatWithAgent(text, agentName, convIds[agentName]);
      if (response.conversation_id) rememberConvId(agentName, response.conversation_id);

      setAgentMessages(agentName, prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'agent',
          content: response.reply,
          agent: response.agent || agentName,
          timestamp: new Date(),
        };
        return updated;
      });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setAgentMessages(agentName, prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'agent',
          content: `I apologize, but I encountered an error: ${err instanceof Error ? err.message : 'Unable to reach the agent'}. Please try again.`,
          agent: agentName,
          timestamp: new Date(),
        };
        return updated;
      });
    }
  };

  const sendMessageStream = async (text: string, signal: AbortSignal) => {
    const agentName = selectedAgent.name;
    setAgentMessages(agentName, prev => [...prev, {
      role: 'agent', content: '', agent: agentName, timestamp: new Date(),
    }]);

    try {
      const { chatStream } = await import('@/lib/api-client');

      for await (const event of chatStream(text, agentName, convIds[agentName], signal)) {
        if (event.conversation_id) rememberConvId(agentName, event.conversation_id);
        if (event.type === 'token' && event.content) {
          setAgentMessages(agentName, prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === 'agent') {
              updated[updated.length - 1] = { ...last, content: last.content + event.content! };
            }
            return updated;
          });
        } else if (event.type === 'error') {
          setAgentMessages(agentName, prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'agent',
              content: `I apologize, but I encountered an error: ${event.content || 'Unknown error'}. Please try again.`,
              agent: agentName,
              timestamp: new Date(),
            };
            return updated;
          });
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setAgentMessages(agentName, prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'agent',
          content: `I apologize, but I encountered an error: ${err instanceof Error ? err.message : 'Unable to reach the agent'}. Please try again.`,
          agent: agentName,
          timestamp: new Date(),
        };
        return updated;
      });
    }
  };

  const sendMessage = async (rawText: string, file?: File) => {
    if ((!rawText.trim() && !file) || isLoading) return;
    const { composeMessageWithFile } = await import('@/lib/attach-file');
    const text = await composeMessageWithFile(rawText, file);
    if (!text) return;

    const agentName = selectedAgent.name;
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    // Materialize the greeting if this is the first exchange so it doesn't vanish
    setHistories(prev => ({
      ...prev,
      [agentName]: [...(prev[agentName] ?? [greetingFor(selectedAgent)]), userMsg],
    }));
    setIsLoading(true);

    if (streamMode) {
      setIsStreaming(true);
      abortRef.current = new AbortController();
      try {
        await sendMessageStream(text, abortRef.current.signal);
      } finally {
        setIsStreaming(false);
      }
    } else {
      try {
        await sendMessageLegacy(text);
      } catch {
        // handled inside
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="page-content page-enter" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', paddingBottom: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Agent Chat</h1>
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
            Talk to any agent in the Philosopher Council — conversations are saved
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => { setShowHistory(true); loadConversations(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <History size={14} /> History
          </button>
          <button className="btn btn-ghost" onClick={newConversation} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      {/* Conversation History Panel */}
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setShowHistory(false)}>
          <div className="card" style={{ width: 380, maxWidth: '90vw', height: '100vh', overflowY: 'auto', borderRadius: 0, padding: 24 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)', margin: 0 }}>Conversation History</h2>
              <button className="btn btn-ghost" onClick={() => setShowHistory(false)} style={{ padding: 6 }}><X size={18} /></button>
            </div>
            {loadingHistory ? (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 40 }}>Loading...</p>
            ) : conversations.length === 0 ? (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 40 }}>No saved conversations yet. Start chatting and they'll appear here.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {conversations.map((conv: any) => {
                  const agentName = conv.agent || 'plato';
                  const agent = AGENTS.find(a => a.name === agentName);
                  return (
                    <button key={conv.id} onClick={() => resumeConversation(conv.id, agentName)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer',
                      width: '100%', textAlign: 'left', background: 'var(--surface)',
                    }}>
                      <AgentPortrait agentName={agentName} size={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{agentName}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conv.last_message?.slice(0, 60) || 'No messages'}
                        </div>
                      </div>
                      <MessageCircle size={16} color="var(--muted)" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Agent selector — searchable dropdown */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <AgentSelect
            agents={AGENTS as any}
            selected={selectedAgent as any}
            onSelect={switchAgent as any}
          />
        </div>

        {/* Main chat area */}
        <div className="etched-surface" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Agent header with portrait */}
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <AgentPortrait agentName={selectedAgent.name} size={36} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{selectedAgent.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{selectedAgent.role}</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', maxWidth: '85%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'agent' && msg.agent && (
                  <div style={{
                    width: 28, height: 28, flexShrink: 0, marginTop: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${(AGENTS.find(a => a.name === msg.agent)?.color || 'var(--accent)')}15`,
                  }}>
                    {createElement(AGENTS.find(a => a.name === msg.agent)?.icon || Bot, { size: 14, color: AGENTS.find(a => a.name === msg.agent)?.color || 'var(--accent)' })}
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
                  minHeight: msg.content === '' ? 20 : undefined,
                }}>
                  {msg.content === '' && isLoading ? (
                    <span style={{ display: 'flex', gap: 4 }}>
                      <span style={{ animation: 'bounce 1.4s infinite', animationDelay: '0s' }}>.</span>
                      <span style={{ animation: 'bounce 1.4s infinite', animationDelay: '0.2s' }}>.</span>
                      <span style={{ animation: 'bounce 1.4s infinite', animationDelay: '0.4s' }}>.</span>
                    </span>
                  ) : (
                    msg.content.split('\n').map((line, j) => {
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
                    })
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <button
                onClick={() => setStreamMode(!streamMode)}
                title={streamMode ? 'Streaming ON — tokens arrive live' : 'Streaming OFF — full response at once'}
                style={{
                  padding: '8px 10px', border: '1px solid var(--border)',
                  background: streamMode ? 'var(--accent)' : 'transparent',
                  color: streamMode ? 'white' : 'var(--foreground-secondary)',
                  cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
                  alignSelf: 'flex-end', height: 38,
                }}
              >
                <Radio size={14} />
                <span>Stream</span>
              </button>
              <AIInputWithFile
                className="flex-1 py-0 sm:py-0 px-0 sm:px-0"
                placeholder={`Message ${selectedAgent.name}...`}
                accept=""
                maxFileSize={5}
                disabled={isLoading && !isStreaming}
                onSubmit={(message, file) => { void sendMessage(message, file); }}
              />
              {isStreaming && (
                <button
                  onClick={stopStream}
                  title="Stop streaming"
                  style={{
                    padding: '8px 10px', border: '1px solid var(--border)',
                    background: 'var(--surface-inset)', color: 'var(--foreground)',
                    cursor: 'pointer', alignSelf: 'flex-end', height: 38,
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
        @keyframes bounce {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
