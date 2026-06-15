'use client';

import { useQuery } from '@tanstack/react-query';
import { listAgentStatus, getDashboardMetrics } from '@/lib/api-client';
import { PHILOSOPHERS, GODS } from '@/lib/design-tokens';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import {
  Brain, Radio, Zap, Target, Users, Play, Clock, CheckCircle2,
  AlertCircle, Bot, Activity,
} from 'lucide-react';

type PhilosopherKey = keyof typeof PHILOSOPHERS;

const MISSION_TEMPLATES = [
  { id: 'lead-gen', title: 'Lead Generation', desc: 'Find, enrich, score, and save leads from Google Maps, CSV, or web.', icon: Users, color: '#123C69', agents: 'Socrates, Athena, Iapetus, Erebos', steps: 7 },
  { id: 'outreach', title: 'Outreach Campaign', desc: 'Contact leads with personalized messages across channels.', icon: Target, color: '#C9A24D', agents: 'Phantasos, Stilbon, Athena, Leonidas', steps: 7 },
  { id: 'pipeline', title: 'Sales Pipeline', desc: 'Turn interested leads into paying clients.', icon: Play, color: '#6F7D4F', agents: 'Athena, Leonidas, Pythagoras, Odysseus', steps: 7 },
  { id: 'cleanup', title: 'CRM Cleanup', desc: 'Fix messy CRM data, duplicates, and broken statuses.', icon: AlertCircle, color: '#8B2020', agents: 'Erebos, Aristotle, Archimedes', steps: 7 },
  { id: 'daily', title: 'Daily Command', desc: 'Get today\'s exact priorities and execution plan.', icon: Clock, color: '#7B5EA7', agents: 'Odysseus, Leonidas, Astraeus', steps: 6 },
  { id: 'intel', title: 'Market Intelligence', desc: 'Find the best industries, locations, and opportunities.', icon: Radio, color: '#3B5E7A', agents: 'Astraeus, Athena, Pythagoras, Plato', steps: 6 },
];

export default function MissionControlPage() {
  const { data: agentStatus, isLoading } = useQuery({
    queryKey: ['agent-status'],
    queryFn: listAgentStatus,
    refetchInterval: 10_000,
  });

  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics,
  });

  const agentStatuses = agentStatus?.agents ?? [];
  const onlineCount = agentStatuses.filter((a: { status: string }) => a.status === 'online').length;
  const totalAgents = 10 + 5; // 10 philosophers + 5 gods/titans

  return (
    <div className="page-content">
      <PageHeader
        title="Mission Control"
        description="Real-time council status, system health, and mission orchestration"
        icon={Radio}
        iconColor="#123C69"
      />

      {/* Health Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12, marginBottom: 28,
      }}>
        <StatCard label="Total Agents" value={totalAgents} icon={Bot} color="#123C69" />
        <StatCard label="Active Now" value={onlineCount} icon={Activity} color="#16A34A" />
        <StatCard label="Actions Today" value={metrics?.agent_actions_today ?? 0} icon={Zap} color="#C9A24D" />
        <StatCard label="Active Missions" value={0} icon={Target} color="#8B2020" />
      </div>

      {/* Philosopher Council */}
      <h2 style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-heading)', marginBottom: 12 }}>
        Philosopher Council
      </h2>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: 10, marginBottom: 32,
      }}>
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="skeleton" style={{ width: 32, height: 32 }} />
                  <div>
                    <div className="skeleton" style={{ width: 70, height: 12, marginBottom: 6 }} />
                    <div className="skeleton" style={{ width: 90, height: 10 }} />
                  </div>
                </div>
              </div>
            ))
          : (Object.keys(PHILOSOPHERS) as Array<keyof typeof PHILOSOPHERS>).map((key) => {
              const agent = PHILOSOPHERS[key];
              const status = agentStatuses.find((a: { name: string }) => a.name.toLowerCase() === key)?.status || 'offline';
              const dotColor = status === 'online' ? '#16A34A' : status === 'idle' ? '#B8860B' : '#94a3b8';

              return (
                <div key={key} className="card stone-hover" style={{
                  padding: '14px 16px',
                  borderLeft: `3px solid ${agent.color}`,
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: agent.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#FFFFFF',
                    flexShrink: 0, fontFamily: 'var(--font-heading)',
                  }}>
                    {agent.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{agent.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--foreground-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {agent.role}
                    </div>
                  </div>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: dotColor,
                    animation: status === 'online' ? 'glowPulse 2s infinite' : undefined,
                    flexShrink: 0,
                  }} />
                </div>
              );
            })
        }
      </div>

      {/* Gods & Titans */}
      <h2 style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-heading)', marginBottom: 12 }}>
        Gods & Titans
      </h2>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: 10, marginBottom: 32,
      }}>
        {Object.entries(GODS).map(([key, god]) => (
          <div key={key} className="card stone-hover" style={{
            padding: '14px 16px',
            borderLeft: `3px solid ${god.color}`,
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: god.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#FFFFFF',
              flexShrink: 0, fontFamily: 'var(--font-heading)',
            }}>
              {god.name.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{god.name}</div>
              <div style={{ fontSize: 10, color: 'var(--foreground-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {god.role}
              </div>
            </div>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#16A34A',
              flexShrink: 0,
            }} />
          </div>
        ))}
      </div>

      {/* Mission Templates */}
      <h2 style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-heading)', marginBottom: 12 }}>
        Mission Templates
      </h2>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 16,
      }}>
        {MISSION_TEMPLATES.map(m => {
          const IconComponent = m.icon;
          return (
            <div key={m.id} className="card stone-hover" style={{ padding: 20, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: `${m.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <IconComponent size={20} color={m.color} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--foreground-secondary)', marginTop: 2 }}>
                    {m.desc}
                  </p>
                </div>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 11, color: 'var(--muted)',
                paddingTop: 8, borderTop: '0.5px solid var(--border-light)',
              }}>
                <span>{m.agents}</span>
                <span>{m.steps} execution steps</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
