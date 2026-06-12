'use client';

import { useState, useRef, useEffect, useCallback, createElement } from 'react';
import { Bot, Brain, BookOpen, Shield, Search, BarChart3, Wallet, ShieldCheck, Wrench, MessageSquare, User, Radio, Plus } from 'lucide-react';
import { PHILOSOPHERS } from '@/lib/design-tokens';
import type { PhilosopherKey } from '@/lib/design-tokens';
import { useModeStore } from '@/lib/mode-store';
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from '@/components/ui/chat-input';

const ICON_MAP = { Brain, Bot, BookOpen, Shield, Search, BarChart3, Wallet, ShieldCheck, Wrench, MessageSquare } as const;

type Agent = {
  name: PhilosopherKey;
  icon: typeof Bot;
  color: string;
  role: string;
};

const AGENTS: Agent[] = Object.entries(PHILOSOPHERS).map(([key, p]) => ({
  name: key as PhilosopherKey,
  role: p.role,
  icon: ICON_MAP[p.icon as keyof typeof ICON_MAP],
  color: p.color,
}));

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
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamMode, setStreamMode] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
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
    setMode(agent.name);
  }, [isStreaming, setMode]);

  // Mode → agent: switching philosopher mode anywhere auto-switches the chat agent
  useEffect(() => {
    if (currentMode === selectedAgent.name) return;
    const agent = AGENTS.find(a => a.name === currentMode);
    if (agent) switchAgent(agent);
  }, [currentMode, selectedAgent.name, switchAgent]);

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

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');

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
        <button className="btn btn-ghost" onClick={newConversation} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <Plus size={14} /> New Conversation
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Agent selector sidebar */}
        <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {AGENTS.map(agent => {
            const Icon = agent.icon;
            const isActive = agent.name === selectedAgent.name;
            return (
              <button
                key={agent.name}
                onClick={() => switchAgent(agent)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                  border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: isActive ? 600 : 400, textAlign: 'left',
                  background: isActive ? `${agent.color}12` : 'transparent',
                  color: isActive ? agent.color : 'var(--foreground-secondary)',
                  transition: 'all 0.15s ease', width: '100%',
                }}
              >
                <Icon size={16} color={isActive ? agent.color : 'var(--muted)'} />
                <span style={{ textTransform: 'capitalize' }}>{agent.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main chat area */}
        <div className="etched-surface" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Agent header */}
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: `${selectedAgent.color}15`,
            }}>
              <selectedAgent.icon size={16} color={selectedAgent.color} />
            </div>
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
              <ChatInput
                className="flex-1"
                value={input}
                onChange={e => setInput(e.target.value)}
                onSubmit={sendMessage}
                loading={isStreaming}
                onStop={stopStream}
              >
                <ChatInputTextArea placeholder={`Message ${selectedAgent.name}...`} />
                <ChatInputSubmit disabled={isLoading && !isStreaming} />
              </ChatInput>
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
