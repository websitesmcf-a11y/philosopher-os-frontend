'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { usePageTitle } from '@/lib/use-page-title';
import { PageHeader } from '@/components/ui/page-header';
import { ScanEye, Search, GitMerge, Shield, RefreshCw, Loader2 } from 'lucide-react';
import {
  findDuplicateLeads,
  mergeDuplicateLeads,
  auditDataQuality,
  fixCampaignStatuses,
  type DuplicatesResult,
  type MergeResult,
  type AuditResult,
  type FixCampaignsResult,
} from '@/lib/api-client';

// ── Types ────────────────────────────────────────────

type CardResult =
  | { kind: 'duplicates'; data: DuplicatesResult }
  | { kind: 'merge'; data: MergeResult }
  | { kind: 'audit'; data: AuditResult }
  | { kind: 'campaigns'; data: FixCampaignsResult };

interface CardState {
  loading: boolean;
  result: CardResult | null;
  error: string | null;
}

interface ActionCard {
  id: CardResult['kind'];
  title: string;
  description: string;
  icon: typeof Search;
  color: string;
  run: () => Promise<CardResult>;
}

// ── Constants ────────────────────────────────────────

const CARDS: ActionCard[] = [
  {
    id: 'duplicates',
    title: 'Find Duplicate Leads',
    description: 'Scan the CRM for duplicate leads matched by phone number or name + company',
    icon: Search,
    color: '#3b82f6',
    run: async () => ({ kind: 'duplicates', data: await findDuplicateLeads() }),
  },
  {
    id: 'merge',
    title: 'Merge Duplicates',
    description: 'Merge duplicate leads — keeps the most complete record, removes the rest',
    icon: GitMerge,
    color: '#8b5cf6',
    run: async () => ({ kind: 'merge', data: await mergeDuplicateLeads() }),
  },
  {
    id: 'audit',
    title: 'Audit Data Quality',
    description: 'Real data-quality audit: missing fields, contactless leads, and a health score',
    icon: Shield,
    color: '#22c55e',
    run: async () => ({ kind: 'audit', data: await auditDataQuality() }),
  },
  {
    id: 'campaigns',
    title: 'Clean Campaign Statuses',
    description: 'Find and fix campaigns stuck in inconsistent states (zombie active / stale drafts)',
    icon: RefreshCw,
    color: '#f59e0b',
    run: async () => ({ kind: 'campaigns', data: await fixCampaignStatuses() }),
  },
];

// ── Result renderers ─────────────────────────────────

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
      <span style={{ color: 'var(--foreground-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: color || 'var(--foreground)' }}>{value}</span>
    </div>
  );
}

function ResultView({ result }: { result: CardResult }) {
  if (result.kind === 'duplicates') {
    const d = result.data;
    return (
      <div>
        <Stat label="Total leads" value={d.total_leads} />
        <Stat label="Duplicate groups" value={d.duplicate_groups} color="#3b82f6" />
        <Stat label="Redundant records" value={d.duplicate_records} color={d.duplicate_records ? '#ef4444' : '#22c55e'} />
        {d.groups.length === 0 ? (
          <div style={{ marginTop: 8, color: '#22c55e' }}>No duplicates found.</div>
        ) : (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {d.groups.slice(0, 10).map((g, i) => (
              <div key={i} style={{ paddingTop: 6, borderTop: '0.5px solid var(--border-light)' }}>
                <div style={{ fontWeight: 600, fontSize: 12 }}>
                  {g.count}× · {g.match_type === 'phone' ? `phone ${g.match_value}` : g.match_value}
                </div>
                {g.leads.map((l) => (
                  <div key={l.id} style={{ fontSize: 12, color: 'var(--foreground-secondary)' }}>
                    • {l.name}{l.company ? ` (${l.company})` : ''} — {l.status}
                  </div>
                ))}
              </div>
            ))}
            {d.groups.length > 10 && (
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>…and {d.groups.length - 10} more groups</div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (result.kind === 'merge') {
    const d = result.data;
    return (
      <div>
        <Stat label="Records merged" value={d.merged} color={d.merged ? '#8b5cf6' : '#22c55e'} />
        <Stat label="Groups merged" value={d.groups_merged} />
        <Stat label="Remaining leads" value={d.remaining_leads} />
        <div style={{ marginTop: 8, color: d.merged ? 'var(--foreground)' : '#22c55e' }}>
          {d.merged ? `Merged ${d.merged} duplicate record(s) into ${d.groups_merged} clean lead(s).` : 'Nothing to merge — CRM is clean.'}
        </div>
      </div>
    );
  }

  if (result.kind === 'audit') {
    const d = result.data;
    const scoreColor = d.health_score >= 80 ? '#22c55e' : d.health_score >= 50 ? '#f59e0b' : '#ef4444';
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: scoreColor }}>{d.health_score}</span>
          <span style={{ fontSize: 12, color: 'var(--foreground-secondary)' }}>/ 100 health score</span>
        </div>
        <Stat label="Total leads" value={d.total_leads} />
        <Stat label="Missing phone" value={d.missing_phone} color={d.missing_phone ? '#f59e0b' : undefined} />
        <Stat label="Missing email" value={d.missing_email} color={d.missing_email ? '#f59e0b' : undefined} />
        <Stat label="Missing company" value={d.missing_company} color={d.missing_company ? '#f59e0b' : undefined} />
        <Stat label="No contact method" value={d.no_contact_method} color={d.no_contact_method ? '#ef4444' : undefined} />
        <Stat label="Duplicate records" value={d.duplicate_records} color={d.duplicate_records ? '#ef4444' : undefined} />
        <Stat label="Leads with issues" value={d.leads_with_issues} />
      </div>
    );
  }

  // campaigns
  const d = result.data;
  return (
    <div>
      <Stat label="Total campaigns" value={d.total_campaigns} />
      <Stat label="Fixed" value={d.fixed} color={d.fixed ? '#f59e0b' : '#22c55e'} />
      {d.fixes.length === 0 ? (
        <div style={{ marginTop: 8, color: '#22c55e' }}>No stuck campaigns found.</div>
      ) : (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {d.fixes.map((f) => (
            <div key={f.id} style={{ fontSize: 12, paddingTop: 6, borderTop: '0.5px solid var(--border-light)' }}>
              <div style={{ fontWeight: 600 }}>{f.name}</div>
              <div style={{ color: 'var(--foreground-secondary)' }}>{f.from} → {f.to} · {f.reason}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Component ────────────────────────────────────────

export default function CrmCleanupPage() {
  usePageTitle('CRM Cleanup');

  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});

  const getState = (id: string): CardState =>
    cardStates[id] || { loading: false, result: null, error: null };

  const runAction = async (card: ActionCard) => {
    setCardStates(prev => ({ ...prev, [card.id]: { loading: true, result: null, error: null } }));
    try {
      const result = await card.run();
      setCardStates(prev => ({ ...prev, [card.id]: { loading: false, result, error: null } }));
      toast.success(`${card.title} completed`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setCardStates(prev => ({ ...prev, [card.id]: { loading: false, result: null, error: message } }));
      toast.error(`${card.title} failed: ${message}`);
    }
  };

  const clearAllResults = () => {
    setCardStates({});
    toast.success('All results cleared');
  };

  const hasAnyResult = Object.values(cardStates).some(s => s.result || s.error);

  return (
    <div className="page-content">
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>

      <PageHeader
        title="CRM Cleanup"
        description="Erebos data integrity scanner — find and fix CRM issues"
        icon={ScanEye}
        iconColor="#171A21"
        actions={
          hasAnyResult ? (
            <button className="btn btn-ghost btn-sm" onClick={clearAllResults}>
              Clear Results
            </button>
          ) : undefined
        }
      />

      {/* ── Action cards grid ──────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 16,
      }}>
        {CARDS.map(card => {
          const state = getState(card.id);
          const Icon = card.icon;

          return (
            <div key={card.id} className="card" style={{ padding: 24 }}>
              {/* Card header */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: `${card.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={20} color={card.color} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: 15, fontWeight: 600,
                    fontFamily: 'var(--font-heading)',
                    margin: 0,
                  }}>
                    {card.title}
                  </h3>
                  <p style={{
                    fontSize: 12, color: 'var(--foreground-secondary)',
                    marginTop: 2, lineHeight: 1.4,
                  }}>
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Run button */}
              <div style={{
                display: 'flex', justifyContent: 'flex-end',
                paddingTop: 12, borderTop: '0.5px solid var(--border-light)',
              }}>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => runAction(card)}
                  disabled={state.loading}
                  style={{ minWidth: 80, justifyContent: 'center' }}
                >
                  {state.loading ? (
                    <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Running</>
                  ) : (
                    <><Icon size={14} /> Run</>
                  )}
                </button>
              </div>

              {/* Loading indicator */}
              {state.loading && (
                <div style={{
                  marginTop: 12, padding: 12,
                  background: 'rgba(23,26,33,0.03)',
                  borderRadius: 6, fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: 'var(--muted)',
                }}>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Erebos is analyzing...
                </div>
              )}

              {/* Error result */}
              {!state.loading && state.error && (
                <div style={{
                  marginTop: 12, padding: 12,
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 6, fontSize: 13,
                  color: '#ef4444', lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}>
                  {state.error}
                </div>
              )}

              {/* Success result */}
              {!state.loading && state.result && (
                <div style={{
                  marginTop: 12, padding: 12,
                  background: 'rgba(34,197,94,0.05)',
                  border: '1px solid rgba(34,197,94,0.15)',
                  borderRadius: 6, fontSize: 13,
                  color: 'var(--foreground)', lineHeight: 1.5,
                  maxHeight: 280, overflowY: 'auto',
                }}>
                  <ResultView result={state.result} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Erebos info banner ─────────────────────── */}
      <div style={{
        marginTop: 24, padding: 16,
        background: 'rgba(23, 26, 33, 0.04)',
        border: '1px solid rgba(23, 26, 33, 0.1)',
        borderRadius: 8,
        display: 'flex', alignItems: 'flex-start', gap: 12,
        fontSize: 13, color: 'var(--foreground-secondary)',
      }}>
        <ScanEye size={18} color="#171A21" />
        <div>
          <strong style={{ display: 'block', marginBottom: 4, color: 'var(--foreground)' }}>
            Erebos — Data Integrity Guardian
          </strong>
          Erebos protects against fake success, cleans bad data, detects dead leads and broken campaigns,
          audits agent run integrity, and quarantines risky records. These actions query your live CRM
          directly — every number shown is real.
        </div>
      </div>
    </div>
  );
}
