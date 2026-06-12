'use client';

import { useQuery } from '@tanstack/react-query';
import { Brain, Bot, BookOpen, Shield, Search, BarChart3, Wallet, ShieldCheck, Wrench, MessageSquare, Activity, RefreshCw } from 'lucide-react';
import { listAgentStatus, getDashboardMetrics, getActivity } from '@/lib/api-client';
import { PHILOSOPHERS } from '@/lib/design-tokens';
import { usePageTitle } from '@/lib/use-page-title';
import type { PhilosopherKey } from '@/lib/design-tokens';

const ICON_MAP = {
  Brain, Bot, BookOpen, Shield, Search, BarChart3, Wallet, ShieldCheck, Wrench, MessageSquare,
} as const;

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  online: { color: '#22c55e', label: 'Active' },
  idle: { color: '#f59e0b', label: 'Idle' },
  offline: { color: '#94a3b8', label: 'Offline' },
  error: { color: '#ef4444', label: 'Error' },
};

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="skeleton" style={{ width: 40, height: 40, marginBottom: 12 }} />
      <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 6 }} />
      <div className="skeleton" style={{ width: '40%', height: 11 }} />
      <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
        <div className="skeleton" style={{ width: 50, height: 12 }} />
        <div className="skeleton" style={{ width: 40, height: 12 }} />
      </div>
    </div>
  );
}

export default function MissionControlPage() {
  usePageTitle('Mission Control');

  const { data: agentStatus, isLoading: agentsLoading, error: agentsError } = useQuery({
    queryKey: ['agent-status'],
    queryFn: listAgentStatus,
    refetchInterval: 10_000,
  });

  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics,
    refetchInterval: 30_000,
  });

  const { data: activity } = useQuery({
    queryKey: ['activity'],
    queryFn: () => getActivity(10),
    refetchInterval: 15_000,
  });

  const agentEntries = Object.entries(PHILOSOPHERS);
  const statusMap = new Map(
    (agentStatus?.agents ?? []).map(a => [a.name.toLowerCase(), a])
  );

  const onlineCount = (agentStatus?.agents ?? []).filter(
    a => a.status === 'online'
  ).length;
  const totalAgents = agentEntries.length;
  const allNominal = !agentsLoading && !agentsError && onlineCount > 0;
  const degraded = !agentsLoading && !agentsError && !allNominal && (agentStatus?.agents ?? []).length > 0;

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Mission Control
            </h1>
            {!agentsLoading && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 600,
                color: allNominal ? '#22c55e' : degraded ? '#f59e0b' : '#94a3b8',
              }}>
                <span className="live-dot" style={{
                  width: 7, height: 7,
                  background: allNominal ? '#22c55e' : degraded ? '#f59e0b' : '#94a3b8',
                }} />
                {allNominal ? 'All systems nominal' : degraded ? 'Partially degraded' : 'Offline'}
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
            Real-time agent council status and system health
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--foreground-secondary)' }}>
          <RefreshCw size={13} />
          Auto-refreshes every 10s
        </div>
      </div>

      {/* Error state */}
      {agentsError && (
        <div className="etched-surface" style={{ padding: 40, textAlign: 'center', marginBottom: 24 }}>
          <p style={{ color: '#ef4444', fontSize: 14 }}>
            Failed to load agent statuses. Please try again later.
          </p>
        </div>
      )}

      {/* Council Overview Grid */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px', paddingLeft: 4, fontFamily: 'var(--font-heading)' }}>
          Philosopher Council
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {agentsLoading
            ? agentEntries.map(([key]) => <SkeletonCard key={key} />)
            : agentEntries.map(([key, philosopher]) => {
                const agentKey = key as PhilosopherKey;
                const statusData = statusMap.get(agentKey);
                const status = statusData?.status || 'offline';
                const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG.offline;
                const Icon = ICON_MAP[philosopher.icon as keyof typeof ICON_MAP] || Bot;
                const completed = statusData?.tasks_completed ?? 0;
                const failed = statusData?.tasks_failed ?? 0;
                const total = completed + failed;
                const failRatio = total > 0 ? failed / total : 0;

                return (
                  <div key={agentKey} className="etched-surface" style={{
                    padding: 20,
                    borderLeft: `3px solid ${philosopher.color}`,
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div aria-hidden style={{
                      position: 'absolute', inset: 0, pointerEvents: 'none',
                      background: philosopher.gradient, opacity: 0.03,
                    }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          background: `${philosopher.color}15`,
                        }}>
                          <Icon size={18} color={philosopher.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{philosopher.name}</div>
                          <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 1 }}>{philosopher.role}</div>
                        </div>
                      </div>
                      <span className="badge" style={{
                        background: `${statusConf.color}15`,
                        color: statusConf.color, fontSize: 10, padding: '2px 7px',
                      }}>
                        <span className="dot" style={{
                          width: 5, height: 5, background: statusConf.color,
                          animation: status === 'online' ? 'glowPulse 2s infinite' : undefined,
                          borderRadius: 0,
                        }} />
                        {statusConf.label}
                      </span>
                    </div>

                    {/* Task bar */}
                    {total > 0 && (
                      <div style={{ position: 'relative', marginTop: 10 }}>
                        <div style={{
                          height: 4, background: 'var(--border)',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${(completed / total) * 100}%`,
                            background: failRatio > 0.2 ? '#f59e0b' : '#22c55e',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          fontSize: 11, color: 'var(--muted)', marginTop: 6,
                        }}>
                          <span>{completed} completed</span>
                          <span>{failed} failed</span>
                        </div>
                      </div>
                    )}
                    {total === 0 && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>
                        No tasks yet
                      </div>
                    )}
                  </div>
                );
              })
          }
        </div>
      </div>

      {/* Bottom row: activity + health */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Activity */}
        <div className="etched-surface" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={15} /> Recent Activity
          </h3>
          {!activity && (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Loading activity...</p>
          )}
          {activity && activity.items.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>No activity yet</p>
          )}
          {activity && activity.items.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activity.items.slice(0, 8).map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: 13, paddingBottom: 8,
                  borderBottom: i < 7 ? '1px solid var(--border-light)' : 'none',
                }}>
                  <span style={{ color: 'var(--foreground-secondary)' }}>{item.text}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0, marginLeft: 12 }}>
                    {new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="etched-surface" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={15} /> System Health
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 14, background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Total Agents</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{totalAgents}</div>
            </div>
            <div style={{ padding: 14, background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Active Now</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: '#22c55e' }}>{onlineCount}</div>
            </div>
            <div style={{ padding: 14, background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Actions Today</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
                {metrics?.agent_actions_today ?? '-'}
              </div>
            </div>
            <div style={{ padding: 14, background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Health Status</div>
              <div style={{
                fontSize: 14, fontWeight: 600, marginTop: 4,
                color: allNominal ? '#22c55e' : '#94a3b8',
              }}>
                {allNominal ? 'Healthy' : agentsLoading ? 'Checking...' : degraded ? 'Degraded' : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
