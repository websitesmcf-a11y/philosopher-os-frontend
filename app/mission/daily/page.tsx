'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { getDashboardMetrics, listTasks, chatWithAgent } from '@/lib/api-client';
import { Swords, Users, CheckSquare, Send, Loader2, Bot, X } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export default function DailyCommandPage() {
  const [generating, setGenerating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics,
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => listTasks({ page: 1 }),
  });

  const totalLeads = metrics?.total_leads ?? 0;
  const tasksDue = tasksData?.items?.filter((t: any) => t.status === 'pending' || t.status === 'in_progress').length ?? 0;
  const activeCampaigns = metrics?.active_campaigns ?? 0;
  const hasData = totalLeads > 0 || tasksDue > 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateBriefing = async () => {
    setGenerating(true);
    setChatOpen(true);
    setMessages([
      {
        role: 'agent',
        content: "**Leonidas** — Operations Commander\n\nSalutations. I'm preparing your daily briefing. One moment while I gather intelligence on your current operations, leads, tasks, and campaign statuses.",
        timestamp: new Date(),
      },
    ]);

    // Gather real metrics
    const contextMsg = `Generate a daily briefing based on this data:
- Total leads: ${totalLeads}
- Pending tasks: ${tasksDue}
- Active campaigns: ${activeCampaigns}
- Revenue today: R${metrics?.revenue_today ?? 0}

Provide a concise morning briefing with:
1. Current state of operations
2. Top 3 priorities for today
3. Any urgent items that need attention
4. Recommended actions for the day

Keep it direct and actionable. This is a command briefing, not a discussion.`;

    try {
      const response = await chatWithAgent(contextMsg, 'leonidas');
      setMessages(prev => [...prev, {
        role: 'agent',
        content: response.reply || "Briefing generated. Open the chat to discuss further.",
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: "**Leonidas** — Operations Commander\n\nApologies — I encountered a connection issue. Your briefing is partially prepared based on the dashboard data visible above. The full AI-generated briefing requires the backend LLM service to be connected. The numbers on this page are live from your database.",
        timestamp: new Date(),
      }]);
    }
    setGenerating(false);
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
    setSending(true);
    try {
      const response = await chatWithAgent(userMsg, 'leonidas');
      setMessages(prev => [...prev, {
        role: 'agent',
        content: response.reply || "Acknowledged. Standing by for further orders.",
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: "**Leonidas** — Operations Commander\n\nCommunication relay disrupted. The AI council is unreachable at the moment, but your command has been noted. Once the connection is restored, I'll act on it immediately.",
        timestamp: new Date(),
      }]);
    }
    setSending(false);
  };

  return (
    <div className="page-content page-bg-command" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Daily Command"
        description="Your daily mission briefing and execution plan"
        icon={Swords}
        iconColor="#8B2020"
        actions={
          <button className="btn btn-primary" onClick={generateBriefing} disabled={generating}>
            {generating ? <Loader2 size={16} /> : <Swords size={16} />}
            {generating ? 'Generating...' : "Generate Today's Briefing"}
          </button>
        }
      />

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12, marginBottom: 16,
      }}>
        <StatCard label="Total Leads" value={totalLeads} icon={Users} color="#8B2020" />
        <StatCard label="Pending Tasks" value={tasksDue} icon={CheckSquare} color="#123C69" />
        <StatCard label="Active Campaigns" value={activeCampaigns} icon={Swords} color="#6F7D4F" />
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {!chatOpen ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border)', borderRadius: 8,
            background: 'rgba(139, 32, 32, 0.02)',
          }}>
            <Swords size={48} color="#8B2020" style={{ opacity: 0.2, marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px', fontFamily: 'var(--font-heading)' }}>Command Centre</h3>
            <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', textAlign: 'center', maxWidth: 400, lineHeight: 1.5, margin: 0 }}>
              Click <strong>"Generate Today's Briefing"</strong> to get your daily operations plan from Leonidas.
              Or just start typing below to give a direct order.
            </p>
            <div style={{
              marginTop: 20, padding: '8px 16px',
              background: 'rgba(139, 32, 32, 0.06)', borderRadius: 20,
              fontSize: 12, color: '#8B2020', fontWeight: 500,
            }}>
              🗡️ Leonidas — Operations Commander
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
            border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden',
          }}>
            {/* Chat header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              background: 'rgba(139, 32, 32, 0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bot size={16} color="#8B2020" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Leonidas — Operations Commander</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setChatOpen(false)} style={{ padding: 4 }}>
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: 16,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface-inset)',
                  color: msg.role === 'user' ? '#fff' : 'var(--foreground)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              ))}
              {sending && (
                <div style={{ alignSelf: 'flex-start', padding: '10px 14px', color: 'var(--muted)', fontSize: 13 }}>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Thinking...
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{
              display: 'flex', gap: 8, padding: '10px 16px',
              borderTop: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Give a command to Leonidas..."
                style={{ flex: 1 }}
                disabled={sending}
              />
              <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={sending || !input.trim()}>
                {sending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info row */}
      <div style={{
        marginTop: 12, padding: '10px 16px',
        background: 'rgba(139, 32, 32, 0.04)',
        border: '1px solid rgba(139, 32, 32, 0.1)', borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 12, color: 'var(--foreground-secondary)',
      }}>
        <Swords size={14} color="#8B2020" />
        <span>The stats above are live from your database. Click "Generate Today's Briefing" for an AI-powered operations plan from Leonidas.</span>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
