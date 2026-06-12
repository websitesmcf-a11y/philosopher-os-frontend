'use client';

import { useQuery } from '@tanstack/react-query';
import { listAgentStatus } from '@/lib/api-client';
import { Brain, Bot, BookOpen, Shield, Search, BarChart3, Wallet, ShieldCheck, Wrench, MessageSquare } from 'lucide-react';
import { usePageTitle } from '@/lib/use-page-title';
import { PHILOSOPHERS } from '@/lib/design-tokens';

const ICON_MAP = { Brain, Bot, BookOpen, Shield, Search, BarChart3, Wallet, ShieldCheck, Wrench, MessageSquare } as const;

const AGENTS = Object.entries(PHILOSOPHERS).map(([key, p]) => ({
  name: p.name,
  role: p.role,
  icon: ICON_MAP[p.icon as keyof typeof ICON_MAP],
  color: p.color,
  gradient: p.gradient,
}));

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  online: { color: '#22c55e', label: 'Active' },
  idle: { color: '#f59e0b', label: 'Idle' },
  offline: { color: '#94a3b8', label: 'Offline' },
  error: { color: '#ef4444', label: 'Error' },
};

function AgentSkeleton() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'var(--border)' }} />
          <div>
            <div style={{ width: 80, height: 14, background: 'var(--border)', marginBottom: 4 }} />
            <div style={{ width: 120, height: 11, background: 'var(--border)' }} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: 50, height: 12, background: 'var(--border)' }} />
        <div style={{ width: 40, height: 12, background: 'var(--border)' }} />
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['agent-status'],
    queryFn: listAgentStatus,
    refetchInterval: 15_000,
  });

  if (error) {
    return (
      <div className="page-content fade-in">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>AI Agents</h1>
        </div>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: '#ef4444' }}>Failed to load agent statuses. Please try again later.</p>
        </div>
      </div>
    );
  }

  const agentStatuses = data?.agents ?? [];

  const getStatus = (name: string) => {
    const found = agentStatuses.find(a => a.name.toLowerCase() === name.toLowerCase());
    return found?.status || 'offline';
  };

  const getTasksCompleted = (name: string) => {
    const found = agentStatuses.find(a => a.name.toLowerCase() === name.toLowerCase());
    return found?.tasks_completed ?? 0;
  };

  const getTasksFailed = (name: string) => {
    const found = agentStatuses.find(a => a.name.toLowerCase() === name.toLowerCase());
    return found?.tasks_failed ?? 0;
  };

  return (
    <div className="page-content fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>AI Agents</h1>
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
          The Philosopher Council — 10 specialized AI agents
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {isLoading
          ? AGENTS.map(agent => <AgentSkeleton key={agent.name} />)
          : AGENTS.map(agent => {
              const Icon = agent.icon;
              const status = getStatus(agent.name);
              const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG.offline;

              return (
                <div key={agent.name} className="etched-surface" style={{ padding: 20, borderLeft: `3px solid ${agent.color}`, position: 'relative', overflow: 'hidden' }}>
                  <div aria-hidden style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: `${agent.gradient}`, opacity: 0.04,
                  }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: `${agent.color}15`,
                      }}>
                        <Icon size={20} color={agent.color} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{agent.name}</h3>
                        <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>{agent.role}</p>
                      </div>
                    </div>
                    <span className="badge" style={{
                      background: `${statusConf.color}15`,
                      color: statusConf.color,
                      fontSize: 11,
                    }}>
                      <span className="dot" style={{
                        width: 6, height: 6, background: statusConf.color,
                        animation: status === 'online' ? 'glowPulse 2s infinite' : undefined,
                        borderRadius: 0,
                      }} />
                      {statusConf.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginTop: 8, position: 'relative' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>Completed</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#22c55e' }}>
                        {getTasksCompleted(agent.name)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>Failed</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: getTasksFailed(agent.name) > 0 ? '#ef4444' : 'var(--foreground)' }}>
                        {getTasksFailed(agent.name)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}
