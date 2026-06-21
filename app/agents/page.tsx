'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { listAgentStatus } from '@/lib/api-client';
import { PHILOSOPHERS, type PhilosopherKey } from '@/lib/design-tokens';
import { AgentCard } from '@/components/ui/agent-card';
import { PageHeader } from '@/components/ui/page-header';
import {
  Brain, Bot, BookOpen, Shield, Search, BarChart3,
  Gavel, Swords, Wrench, Compass,
} from 'lucide-react';

const ICON_MAP: Record<string, typeof Brain> = {
  Brain, Bot, BookOpen, Shield, Search, BarChart3,
  Gavel, Swords, Wrench, Compass,
};

const CAPABILITIES: Record<PhilosopherKey, string[]> = {
  plato: ['Define ICP', 'Brand Strategy', 'Campaign Vision', 'Roadmap', 'Positioning'],
  socrates: ['Pressure Test', 'Find Assumptions', 'Validate Readiness', 'Decision Checklist'],
  aristotle: ['Workflow Design', 'Campaign Structure', 'Lead Classification', 'SOP Creation'],
  athena: ['Target Selection', 'Risk Assessment', 'Competitive Angle', 'Channel Strategy'],
  heraclitus: ['Failure Review', 'Bottleneck Detection', 'Sequence Optimization', 'Iteration'],
  pythagoras: ['Conversion Rate', 'ROI Calculation', 'Cost Per Lead', 'Revenue Forecast'],
  solon: ['Define Rules', 'Credit Safety', 'Approval Workflow', 'Data Privacy'],
  leonidas: ['Daily Mission', 'Outreach Block', 'Call List', 'Focus Mode'],
  archimedes: ['Debug Workflow', 'Automation', 'Integration Flow', 'Recovery Logic'],
  odysseus: ['Mission Plan', 'Multi-Agent Flow', 'Progress Track', 'Recovery Path'],
};

export default function PhilosophersPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['agent-status'],
    queryFn: listAgentStatus,
    refetchInterval: 15_000,
  });

  const agentStatuses = data?.agents ?? [];
  const getStatus = (name: string) => {
    const found = agentStatuses.find((a: { name: string; status: string }) => a.name.toLowerCase() === name.toLowerCase());
    return found?.status || 'offline';
  };

  return (
    <div className="page-content page-bg-oracle">
      <PageHeader
        title="Philosopher Council"
        description="10 specialized strategic intelligence agents — they think, plan, judge, structure, and govern"
        icon={Brain}
        iconColor="#123C69"
      />

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
        gap: 28,
      }}>
        {(Object.entries(PHILOSOPHERS) as [PhilosopherKey, typeof PHILOSOPHERS[PhilosopherKey]][]).map(([key, agent]) => {
          const iconName = agent.icon as string;
          const Icon = ICON_MAP[iconName] || Brain;
          const status = getStatus(agent.name);
          const agentStatus = status === 'online' ? 'active' : 'idle' as const;

          return (
            <AgentCard
              key={key}
              name={agent.name}
              role={agent.role}
              icon={Icon}
              gradient={agent.gradient}
              color={agent.color}
              description={`${agent.name} is the council's ${agent.role.toLowerCase()}. Full CRM context, memory-aware, autonomously routes to specialists.`}
              capabilities={CAPABILITIES[key]}
              status={agentStatus}
              onChat={() => router.push(`/chat?agent=${key}`)}
              onView={() => router.push(`/agents/${key.toLowerCase()}`)}
              variant="philosopher"
            />
          );
        })}
      </div>
    </div>
  );
}
