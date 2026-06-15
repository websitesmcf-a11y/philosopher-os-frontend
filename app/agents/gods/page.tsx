'use client';

import { useRouter } from 'next/navigation';
import { GODS, type GodKey } from '@/lib/design-tokens';
import { AgentCard } from '@/components/ui/agent-card';
import { PageHeader } from '@/components/ui/page-header';
import { Zap, Eye, Trash2, PenLine, Send } from 'lucide-react';

const ICON_MAP: Record<string, typeof Zap> = {
  Zap, Eye, Trash2, PenLine, Send,
};

const GOD_DESCRIPTIONS: Record<GodKey, string> = {
  iapetus: 'Supreme execution agent. Coordinates all agents, launches approved campaigns, runs bulk lead collection and enrichment, recovers failed missions, and saves results to CRM.',
  astraeus: 'Market intelligence and dashboard brain. Scans CRM for opportunities, detects hot leads and campaign trends, recommends best times to contact, and generates executive summaries.',
  erebos: 'Data integrity and risk recovery specialist. Detects duplicate leads, cleans CRM data, identifies broken campaigns, audits data integrity, and quarantines bad data.',
  phantasos: 'Creative outreach and personalization engine. Generates personalized WhatsApp messages, emails, cold call scripts, follow-up sequences, and analyzes websites for personalization.',
  stilbon: 'Fast messenger and communication operator. Sends WhatsApp messages, emails, schedules follow-ups, syncs inboxes, detects replies, and updates lead status from replies.',
};

const GOD_CAPABILITIES: Record<GodKey, string[]> = {
  iapetus: ['Full Lead Gen', 'Bulk Collection', 'Bulk Enrichment', 'Mission Logs', 'Recover Failed', 'Mission Report'],
  astraeus: ['CRM Scan', 'Hot Leads', 'Trend Detection', 'Market Analysis', 'Executive Summary', 'Next Best Action'],
  erebos: ['Find Duplicates', 'Clean Data', 'Dead Leads', 'Broken Campaigns', 'Audit Integrity', 'Quarantine Bad Data'],
  phantasos: ['WhatsApp Message', 'Email Generate', 'Call Script', 'Follow-up Sequence', 'A/B Variants', 'Objection Replies'],
  stilbon: ['Send WhatsApp', 'Send Email', 'Schedule Message', 'Detect Replies', 'Update Status', 'Stop if Replied'],
};

export default function GodsPage() {
  const router = useRouter();

  return (
    <div className="page-content">
      <PageHeader
        title="Gods & Titans"
        description="Powerful execution agents — they execute, automate, collect, contact, recover, and operate systems"
        icon={Zap}
        iconColor="#C9A24D"
      />

      <div style={{ marginBottom: 24 }}>
        <div className="card" style={{
          padding: '16px 20px',
          background: `linear-gradient(135deg, rgba(201,162,77,0.08), rgba(18,60,105,0.06))`,
          borderLeft: '3px solid var(--gold)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Zap size={20} color="var(--gold)" />
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', margin: 0 }}>
            <strong style={{ color: 'var(--foreground)' }}>Gods & Titans</strong> execute missions at scale.
            They require proper integrations to be connected. If an integration is missing, they will clearly state what is needed and create a setup task.
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
        gap: 28,
      }}>
        {(Object.entries(GODS) as [GodKey, typeof GODS[GodKey]][]).map(([key, god]) => {
          const iconName = god.icon as string;
          const Icon = ICON_MAP[iconName] || Zap;

          return (
            <AgentCard
              key={key}
              name={god.name}
              role={god.role}
              icon={Icon}
              gradient={god.gradient}
              color={god.color}
              description={GOD_DESCRIPTIONS[key]}
              capabilities={GOD_CAPABILITIES[key]}
              status="active"
              onChat={() => router.push(`/chat?agent=${key}`)}
              onView={() => router.push(`/agents/${key.toLowerCase()}`)}
              variant="god"
            />
          );
        })}
      </div>
    </div>
  );
}
