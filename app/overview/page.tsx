'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getDashboardMetrics, getMRR, getTrends, getActivity,
  type ActivityEvent,
} from '@/lib/api-client';
import { formatCurrency } from '@/lib/api-client';
import {
  Activity, BarChart3, CheckCircle2, DollarSign, Megaphone,
  MessageSquare, Target, Users, Monitor,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { usePageTitle } from '@/lib/use-page-title';

const ACTIVITY_ICON: Record<string, { icon: typeof Users; color: string }> = {
  lead: { icon: Users, color: 'var(--accent)' },
  invoice: { icon: DollarSign, color: '#22c55e' },
  campaign: { icon: Megaphone, color: '#3b82f6' },
  task: { icon: CheckCircle2, color: 'var(--accent-olive)' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div style={{
      height: 200, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      <BarChart3 size={28} color="var(--muted)" style={{ opacity: 0.4 }} />
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>{message}</p>
    </div>
  );
}

export default function Dashboard() {
  usePageTitle('CEO Dashboard');
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics,
  });

  const { data: mrr, isLoading: mrrLoading } = useQuery({
    queryKey: ['mrr'],
    queryFn: () => getMRR('monthly'),
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['trends'],
    queryFn: () => getTrends(6),
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['activity'],
    queryFn: () => getActivity(10),
  });

  if (error) {
    return (
      <div className="page-content page-bg-command page-enter">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 500, margin: 0, fontFamily: 'var(--font-heading)' }}>CEO Dashboard</h1>
        </div>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: '#ef4444' }}>Failed to load dashboard data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const chartData = trends?.items ?? [];
  const hasRevenue = chartData.some(p => p.revenue > 0);
  const hasLeads = chartData.some(p => p.leads > 0);
  const activityItems: ActivityEvent[] = activity?.items ?? [];

  const statCards = [
    {
      label: 'Total Revenue',
      value: mrr ? formatCurrency(mrr.total_mrr) : '—',
      icon: DollarSign,
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.1)',
    },
    {
      label: 'Active Leads',
      value: metrics?.total_leads ?? '—',
      icon: Users,
      color: 'var(--accent)',
      bg: 'color-mix(in srgb, var(--accent) 10%, transparent)',
    },
    {
      label: 'Conversion Rate',
      value: metrics ? `${(metrics.conversion_rate).toFixed(1)}%` : '—',
      icon: Target,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
    },
    {
      label: 'Active Campaigns',
      value: metrics?.active_campaigns ?? '—',
      icon: Activity,
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.1)',
    },
    {
      label: 'Tasks Pending',
      value: metrics?.tasks_pending ?? '—',
      icon: MessageSquare,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.1)',
    },
    {
      label: 'Clients',
      value: metrics?.total_clients ?? '—',
      icon: Users,
      color: 'var(--accent-olive)',
      bg: 'color-mix(in srgb, var(--accent-olive) 10%, transparent)',
    },
  ];

  return (
    <div className="page-content page-bg-command page-enter">
      <PageHeader
        title="CEO Dashboard"
        description="Real-time overview of your agency operations"
        icon={Monitor}
        iconColor="#123C69"
      />

      {/* Stat cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        {isLoading || mrrLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="etched-surface" style={{ padding: 16, height: 90 }}>
                <div style={{ width: '60%', height: 14, background: 'var(--border)', marginBottom: 8 }} />
                <div style={{ width: '40%', height: 24, background: 'var(--border)' }} />
              </div>
            ))
          : statCards.map(card => (
              <div key={card.label} className="etched-surface" style={{ padding: 16, transition: 'transform 0.2s var(--ease-out)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="stat-label" style={{ fontFamily: 'var(--font-heading)' }}>{card.label}</span>
                  <div style={{
                    width: 32, height: 32, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', background: card.bg,
                  }}>
                    <card.icon size={16} color={card.color} />
                  </div>
                </div>
                <div className="stat-value">{card.value}</div>
              </div>
            ))
        }
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="etched-surface" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: 'var(--foreground-secondary)', fontFamily: 'var(--font-heading)' }}>
            Revenue Trend
          </h3>
          {trendsLoading ? (
            <ChartEmptyState message="Loading..." />
          ) : !hasRevenue ? (
            <ChartEmptyState message="No revenue recorded yet — it will appear here as invoices are paid" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    fontSize: 13,
                  }}
                  formatter={value => [`${formatCurrency(Number(value ?? 0))}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="etched-surface" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: 'var(--foreground-secondary)', fontFamily: 'var(--font-heading)' }}>
            Lead Growth
          </h3>
          {trendsLoading ? (
            <ChartEmptyState message="Loading..." />
          ) : !hasLeads ? (
            <ChartEmptyState message="No leads yet — add your first lead to see growth here" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="leads" fill="var(--accent)" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="etched-surface" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: 'var(--foreground-secondary)', fontFamily: 'var(--font-heading)' }}>
          Recent Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activityLoading && (
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Loading activity...</p>
          )}
          {!activityLoading && activityItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Activity size={24} color="var(--muted)" style={{ opacity: 0.4, marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                No activity yet — events will appear here as your business runs
              </p>
            </div>
          )}
          {activityItems.map((item, i) => {
            const { icon: Icon, color } = ACTIVITY_ICON[item.type] ?? { icon: Activity, color: '#94a3b8' };
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                <div style={{
                  width: 32, height: 32, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', background: `${color}10`,
                }}>
                  <Icon size={14} color={color} />
                </div>
                <span style={{ flex: 1, fontSize: 14 }}>{item.text}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{timeAgo(item.at)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
