'use client';

import { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { PHILOSOPHERS, GODS } from '@/lib/design-tokens';
import { PORTRAITS } from '@/lib/philosopher-assets';
import { ArrowLeft, MessageCircle } from 'lucide-react';

// ─── Agent Data ──────────────────────────────────────────────────────────────

const ALL_AGENTS = { ...PHILOSOPHERS, ...GODS } as const;
type AgentKey = keyof typeof ALL_AGENTS;

const DESCRIPTIONS: Record<string, string> = {
  plato:
    'Plato is the CEO of the Philosopher Council. He coordinates all specialists, defines strategy, and ensures every mission aligns with your business vision. When in doubt, start here.',
  socrates:
    'Socrates pressure-tests every assumption. Before you launch a campaign or make a strategic bet, run it past Socrates to find blind spots and hidden risks.',
  aristotle:
    'Aristotle is the knowledge keeper. He stores, structures, and retrieves your agency\'s information — from SOPs to market research — so no insight is ever lost.',
  athena:
    'Athena is your strategic edge. She analyzes competitive landscapes, identifies high-value targets, and calculates the optimal path to victory with precision and foresight.',
  heraclitus:
    'Heraclitus tracks the ever-changing flow of your business. He monitors market shifts, detects bottlenecks, and recommends iterative improvements to keep you ahead of change.',
  pythagoras:
    'Pythagoras brings clarity through numbers. He tracks every metric that matters — conversion rates, ROI, cost per lead — and surfaces patterns that drive better decisions.',
  solon:
    'Solon is the governance specialist. He ensures your operations stay within ethical and financial boundaries, managing credit safety, approval workflows, and data privacy.',
  leonidas:
    'Leonidas drives execution with discipline and intensity. He manages daily missions, outreach blocks, call lists, and keeps the team focused on what matters most.',
  archimedes:
    'Archimedes is the engineer behind the system. He debugs workflows, sets up integrations, designs automation logic, and ensures the technical foundation is rock solid.',
  odysseus:
    'Odysseus navigates complex, multi-step missions. He orchestrates agent workflows, tracks progress across stages, and finds recovery paths when things go off course.',
  iapetus:
    'Iapetus is the master workflow executor. He coordinates all agents, launches approved campaigns, runs bulk lead collection and enrichment, recovers failed missions, and saves results to CRM.',
  astraeus:
    'Astraeus is your market intelligence hub. He scans CRM for opportunities, detects hot leads and campaign trends, recommends best times to contact, and generates executive summaries.',
  erebos:
    'Erebos safeguards your data integrity. He detects duplicate leads, cleans CRM data, identifies broken campaigns, audits data integrity, and quarantines bad data before it spreads.',
  phantasos:
    'Phantasos is the creative engine. He generates personalized WhatsApp messages, emails, cold call scripts, follow-up sequences, and analyzes websites for deep personalization.',
  stilbon:
    'Stilbon is the speed messenger. He sends WhatsApp messages and emails, schedules follow-ups, syncs inboxes, detects replies, and updates lead status the moment a reply arrives.',
};

const CAPABILITIES: Record<string, string[]> = {
  plato: [
    'Vision & Strategy',
    'Brand Direction',
    'Campaign Vision',
    'Council Coordination',
    'Roadmap Planning',
    'Positioning',
  ],
  socrates: [
    'Pressure Test Ideas',
    'Find Assumptions',
    'Validate Readiness',
    'Decision Checklist',
    'Strategic Critique',
  ],
  aristotle: [
    'Knowledge Management',
    'Workflow Design',
    'Lead Classification',
    'SOP Creation',
    'Information Structuring',
  ],
  athena: [
    'Executive Assistance',
    'Target Selection',
    'Risk Assessment',
    'Competitive Analysis',
    'Channel Strategy',
    'Calendar Management',
  ],
  heraclitus: [
    'Web Research',
    'Market Intelligence',
    'Lead Discovery',
    'Competitor Analysis',
    'Trend Detection',
    'Industry Analysis',
  ],
  pythagoras: [
    'Analytics & Metrics',
    'Conversion Tracking',
    'ROI Calculation',
    'Revenue Forecasting',
    'Performance Reports',
  ],
  solon: [
    'Finance Management',
    'Invoice Tracking',
    'Budget Planning',
    'Revenue Analysis',
    'Cost Optimization',
  ],
  leonidas: [
    'Operations Management',
    'Daily Missions',
    'Task Execution',
    'Focus Mode',
    'Progress Tracking',
  ],
  archimedes: [
    'Technical Architecture',
    'System Debugging',
    'Integration Setup',
    'Automation Logic',
    'Infrastructure',
  ],
  odysseus: [
    'Outreach Campaigns',
    'Multi-Channel Messaging',
    'Follow-up Sequences',
    'Lead Engagement',
    'Social Posting',
  ],
  iapetus: [
    'Workflow Automation',
    'Lead Generation',
    'Bulk Operations',
    'Mission Recovery',
    'Process Orchestration',
  ],
  astraeus: [
    'Opportunity Detection',
    'Market Signals',
    'CRM Analysis',
    'Trend Identification',
    'Lead Scoring',
  ],
  erebos: [
    'Data Cleanup',
    'Duplicate Detection',
    'Data Integrity',
    'Audit Reporting',
    'Risk Assessment',
  ],
  phantasos: [
    'Creative Writing',
    'Message Personalization',
    'Follow-up Sequences',
    'A/B Variants',
    'Call Scripts',
  ],
  stilbon: [
    'Message Delivery',
    'WhatsApp Integration',
    'Scheduled Sending',
    'Reply Detection',
    'Rate-limited Outreach',
  ],
};

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  idle: { label: 'Idle', dot: '#6B7280', bg: 'rgba(107,114,128,0.15)', pulse: false },
  active: { label: 'Active', dot: '#16A34A', bg: 'rgba(22,101,52,0.15)', pulse: false },
  running: {
    label: 'Running',
    dot: '#16A34A',
    bg: 'rgba(22,101,52,0.15)',
    pulse: true,
  },
} as const;

type StatusType = keyof typeof STATUS_CONFIG;

// ─── Component ───────────────────────────────────────────────────────────────

export default function AgentDetailPage() {
  const router = useRouter();
  const params = useParams<{ name: string }>();
  const agentKey = params?.name?.toLowerCase() as AgentKey | undefined;

  const agent = useMemo(() => {
    if (!agentKey || !(agentKey in ALL_AGENTS)) return null;
    return ALL_AGENTS[agentKey];
  }, [agentKey]);

  const agentName = agent?.name ?? '';
  const agentColor = agent?.color ?? '#123C69';

  const videoSrc = agentKey
    ? `/assets/philosopher-os/agent-animations/${agentKey}-animation.mp4`
    : undefined;

  const portraitSrc = agentKey ? PORTRAITS[agentKey] : undefined;
  const description = agentKey ? DESCRIPTIONS[agentKey] : undefined;
  const capabilities = agentKey ? CAPABILITIES[agentKey] : undefined;

  // Determine status based on whether it's a philosopher or god
  const status: StatusType =
    agentKey && agentKey in GODS ? 'active' : 'idle';
  const statusCfg = STATUS_CONFIG[status];

  // ── Loading / Not found ─────────────────────────────────────────────
  if (!agent || !agentKey) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: '#0F1722',
          color: '#FFFFFF',
        }}
      >
        <p style={{ fontSize: 20, opacity: 0.7 }}>Agent not found</p>
        <button
          onClick={() => router.push('/agents')}
          className="btn btn-gold"
          style={{ padding: '12px 24px', fontSize: 15 }}
        >
          <ArrowLeft size={18} /> Back to Council
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'calc(100vh - 56px)',
        overflow: 'hidden',
        background: '#0F1722',
      }}
    >
      {/* ── Video Background ───────────────────────────────────────── */}
      {videoSrc && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            animation: 'agentDetailFadeIn 1.5s ease-out forwards',
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              // Hide video on error (fallback to solid background)
              (e.target as HTMLVideoElement).style.display = 'none';
            }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>

          {/* Dark gradient overlay — black at bottom, transparent at top */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom, rgba(15,23,34,0.3) 0%, rgba(15,23,34,0.6) 40%, rgba(15,23,34,0.95) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* ── Content (above video) ──────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 56px)',
          color: '#FFFFFF',
          animation: 'agentDetailFadeInUp 0.8s ease-out forwards',
        }}
      >
        {/* ── Top bar — Back button ──────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 32px',
          }}
        >
          <button
            onClick={() => router.push('/agents')}
            className="btn btn-ghost"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 15,
              fontWeight: 500,
              padding: '8px 16px',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            <ArrowLeft size={18} />
            Back to Council
          </button>

          {/* Agent type badge */}
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'var(--font-label)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: agentColor,
              background: `${agentColor}20`,
              padding: '6px 18px',
              borderRadius: 6,
              border: `1px solid ${agentColor}40`,
            }}
          >
            {agentKey in GODS ? 'TITAN' : 'PHILOSOPHER'}
          </span>
        </div>

        {/* ── Centered main content ───────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 32px 80px',
            textAlign: 'center',
          }}
        >
          {/* Portrait */}
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 20,
              background: agent.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: `0 8px 40px ${agentColor}50`,
              marginBottom: 28,
              animation: 'agentDetailFadeInUp 0.8s ease-out 0.1s both',
            }}
          >
            {portraitSrc ? (
              <Image
                src={portraitSrc}
                alt={agentName}
                width={160}
                height={160}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                priority
              />
            ) : (
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  color: '#FFFFFF',
                }}
              >
                {agentName.charAt(0)}
              </span>
            )}
          </div>

          {/* Name */}
          <h1
            style={{
              fontSize: 48,
              fontWeight: 600,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.02em',
              color: '#FFFFFF',
              marginBottom: 8,
              animation: 'agentDetailFadeInUp 0.8s ease-out 0.2s both',
            }}
          >
            {agentName}
          </h1>

          {/* Role subtitle */}
          <p
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 6,
              animation: 'agentDetailFadeInUp 0.8s ease-out 0.3s both',
            }}
          >
            {agent.role}
          </p>

          {/* Status indicator */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 16px',
              borderRadius: 20,
              background: statusCfg.bg,
              marginBottom: 32,
              animation: 'agentDetailFadeInUp 0.8s ease-out 0.35s both',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: statusCfg.dot,
                boxShadow: statusCfg.pulse
                  ? `0 0 10px ${statusCfg.dot}`
                  : undefined,
                animation: statusCfg.pulse
                  ? 'agentDetailGlowPulse 2s infinite'
                  : undefined,
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-label)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              {statusCfg.label}
            </span>
          </div>

          {/* Description */}
          {description && (
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.75)',
                maxWidth: 640,
                marginBottom: 36,
                animation: 'agentDetailFadeInUp 0.8s ease-out 0.4s both',
              }}
            >
              {description}
            </p>
          )}

          {/* Capabilities */}
          {capabilities && capabilities.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                justifyContent: 'center',
                maxWidth: 640,
                animation: 'agentDetailFadeInUp 0.8s ease-out 0.5s both',
              }}
            >
              {capabilities.map((cap, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.85)',
                    background: `${agentColor}30`,
                    border: `1px solid ${agentColor}50`,
                    padding: '8px 20px',
                    borderRadius: 8,
                    lineHeight: 1.4,
                  }}
                >
                  {cap}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom bar — Chat button ─────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '24px 32px 40px',
            animation: 'agentDetailFadeInUp 0.8s ease-out 0.6s both',
          }}
        >
          <button
            onClick={() => router.push(`/chat?agent=${agentKey}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 32px',
              fontSize: 17,
              fontWeight: 600,
              color: '#FFFFFF',
              background: agent.gradient,
              border: `1px solid ${agentColor}80`,
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s ease',
              boxShadow: `0 4px 20px ${agentColor}40`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 8px 30px ${agentColor}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 20px ${agentColor}40`;
            }}
          >
            <MessageCircle size={22} />
            Chat with {agentName}
          </button>
        </div>
      </div>

      {/* ── Keyframes for animations ─────────────────────────────────── */}
      <style jsx>{`
        @keyframes agentDetailFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes agentDetailFadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes agentDetailGlowPulse {
          0%,
          100% {
            box-shadow: 0 0 4px currentColor;
          }
          50% {
            box-shadow: 0 0 14px currentColor;
          }
        }
      `}</style>
    </div>
  );
}
