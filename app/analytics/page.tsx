'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics, getWeekly, formatCurrency } from '@/lib/api-client';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { usePageTitle } from '@/lib/use-page-title';

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div style={{
      height: 240, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      <BarChart3 size={28} color="var(--muted)" style={{ opacity: 0.4 }} />
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>{message}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  usePageTitle('Analytics');
  const { data: metrics, isLoading, error } = useQuery({ queryKey: ['dashboard-metrics'], queryFn: getDashboardMetrics });
  const { data: weekly, isLoading: weeklyLoading } = useQuery({ queryKey: ['weekly'], queryFn: getWeekly });

  const weeklyData = weekly?.items ?? [];
  const hasWeeklyLeads = weeklyData.some(d => d.leads > 0 || d.conversions > 0);
  const hasWeeklyRevenue = weeklyData.some(d => d.revenue > 0);

  if (error) {
    return (
      <div className="page-content page-enter">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Analytics</h1>
        </div>
        <div className="etched-surface" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: '#ef4444' }}>Failed to load analytics. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content page-enter">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Analytics</h1>
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
          Deep dive into performance metrics
        </p>
      </div>

      {/* Data source notice */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
        padding: '8px 14px', borderRadius: 6,
        background: 'rgba(18,60,105,0.04)', border: '1px solid var(--border-light)',
        fontSize: 12, color: 'var(--foreground-secondary)',
      }}>
        <BarChart3 size={14} color="var(--accent)" />
        All numbers are computed from real database rows — messages, campaigns, tasks, and agent activity in your org.
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="etched-surface" style={{ padding: 16, height: 70 }}>
                <div style={{ width: '50%', height: 12, background: 'var(--border)', marginBottom: 8 }} />
                <div style={{ width: '30%', height: 20, background: 'var(--border)' }} />
              </div>
            ))}
          </>
        ) : metrics ? (
          <>
            <div className="etched-surface" style={{ padding: 16 }}>
              <div className="stat-label">Conversion Rate</div>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>
                {`${(metrics.conversion_rate).toFixed(1)}%`}
              </div>
              <div className="stat-sublabel">Total leads: {metrics.total_leads}</div>
            </div>
            <div className="etched-surface" style={{ padding: 16 }}>
              <div className="stat-label">New Leads Today</div>
              <div className="stat-value" style={{ color: '#3b82f6' }}>
                {metrics.new_leads_today}
              </div>
            </div>
            <div className="etched-surface" style={{ padding: 16 }}>
              <div className="stat-label">Revenue Today</div>
              <div className="stat-value" style={{ color: '#22c55e' }}>
                {formatCurrency(metrics.revenue_today)}
              </div>
            </div>
            <div className="etched-surface" style={{ padding: 16 }}>
              <div className="stat-label">Messages Today</div>
              <div className="stat-value" style={{ color: '#f59e0b' }}>
                {metrics.messages_today}
              </div>
              <div className="stat-sublabel">Outbound only (excl. agent chat)</div>
            </div>
          </>
        ) : (
          <div className="etched-surface" style={{ padding: 16, gridColumn: '1 / -1', textAlign: 'center' }}>
            <div className="stat-value" style={{ color: 'var(--muted)' }}>No data</div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="etched-surface" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: 'var(--foreground-secondary)', fontFamily: 'var(--font-heading)' }}>
            Weekly Leads & Conversions
          </h3>
          {weeklyLoading ? (
            <ChartEmptyState message="Loading..." />
          ) : !hasWeeklyLeads ? (
            <ChartEmptyState message="No leads in the last 7 days" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 13 }} />
                <Bar dataKey="leads" fill="var(--accent)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="conversions" fill="#22c55e" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="etched-surface" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: 'var(--foreground-secondary)', fontFamily: 'var(--font-heading)' }}>
            Weekly Revenue
          </h3>
          {weeklyLoading ? (
            <ChartEmptyState message="Loading..." />
          ) : !hasWeeklyRevenue ? (
            <ChartEmptyState message="No revenue in the last 7 days" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="analyticsRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `R${v}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 13 }}
                  formatter={value => [formatCurrency(Number(value ?? 0)), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#analyticsRevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary grid */}
      <div className="etched-surface" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: 'var(--foreground-secondary)', fontFamily: 'var(--font-heading)' }}>
          Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <div className="stat-label" style={{ marginBottom: 4 }}>Agent Actions Today</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{metrics?.agent_actions_today ?? '—'}</div>
          </div>
          <div>
            <div className="stat-label" style={{ marginBottom: 4 }}>Active Campaigns</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{metrics?.active_campaigns ?? '—'}</div>
          </div>
          <div>
            <div className="stat-label" style={{ marginBottom: 4 }}>Pending Tasks</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{metrics?.tasks_pending ?? '—'}</div>
          </div>
          <div>
            <div className="stat-label" style={{ marginBottom: 4 }}>Total Clients</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{metrics?.total_clients ?? '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
