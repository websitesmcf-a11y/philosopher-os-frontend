'use client';

import { useQuery } from '@tanstack/react-query';
import { getMRR, getInvoices, getCashflow, formatCurrency } from '@/lib/api-client';
import { Wallet, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, BarChart3, MoreHorizontal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePageTitle } from '@/lib/use-page-title';

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div style={{
      height: 220, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      <BarChart3 size={28} color="var(--muted)" style={{ opacity: 0.4 }} />
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>{message}</p>
    </div>
  );
}

export default function FinancePage() {
  const { data: mrr, isLoading: mrrLoading, error: mrrError } = useQuery({ queryKey: ['mrr'], queryFn: () => getMRR('monthly') });
  const { data: invoices, isLoading: invLoading, error: invError } = useQuery({ queryKey: ['invoices'], queryFn: () => getInvoices({ page: 1, page_size: 20 }) });
  const { data: cashflow, isLoading: cfLoading, error: cfError } = useQuery({ queryKey: ['cashflow'], queryFn: getCashflow });

  const hasError = mrrError || invError || cfError;
  const isLoading = mrrLoading || invLoading || cfLoading;

  const invoiceList = invoices?.items ?? [];

  const mrrData = mrr ? [
    { name: 'New Business', value: mrr.new_business },
    { name: 'Expansion', value: mrr.expansion },
    { name: 'Churn', value: -mrr.churn },
    { name: 'Contraction', value: -mrr.contraction },
  ] : [];

  return (
    <div className="page-content page-enter">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Finance</h1>
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
          Revenue, MRR breakdown, and invoicing
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        {hasError && (
          <div className="etched-surface" style={{ padding: 16, gridColumn: '1 / -1' }}>
            <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>Failed to load some financial data.</p>
          </div>
        )}
        {isLoading ? (
          <>
            <div className="etched-surface" style={{ padding: 16, height: 85 }}>
              <div style={{ width: '60%', height: 12, background: 'var(--border)', marginBottom: 12 }} />
              <div style={{ width: '40%', height: 22, background: 'var(--border)' }} />
            </div>
            <div className="etched-surface" style={{ padding: 16, height: 85 }}>
              <div style={{ width: '50%', height: 12, background: 'var(--border)', marginBottom: 12 }} />
              <div style={{ width: '40%', height: 22, background: 'var(--border)' }} />
            </div>
          </>
        ) : (
          <>
            <div className="etched-surface" style={{ padding: 16 }}>
              <div className="stat-label" style={{ marginBottom: 8 }}>Monthly Recurring Revenue</div>
              <div className="stat-value" style={{ color: '#22c55e' }}>
                {mrr ? formatCurrency(mrr.total_mrr) : '—'}
              </div>
              {mrr && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 13 }}>
                  <TrendingUp size={14} color="#22c55e" />
                  <span style={{ color: '#22c55e' }}>{formatCurrency(mrr.net_new)} net new</span>
                </div>
              )}
            </div>
            <div className="etched-surface" style={{ padding: 16 }}>
              <div className="stat-label" style={{ marginBottom: 8 }}>Cashflow</div>
              <div className="stat-value" style={{ color: cashflow && cashflow.net_cashflow < 0 ? '#ef4444' : 'var(--foreground)' }}>
                {cashflow ? formatCurrency(cashflow.net_cashflow) : '—'}
              </div>
              {cashflow && (
                <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 13 }}>
                  <span style={{ color: '#22c55e' }}>+{formatCurrency(cashflow.total_revenue)}</span>
                  <span style={{ color: '#ef4444' }}>-{formatCurrency(cashflow.total_expenses)}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* MRR breakdown chart */}
        <div className="etched-surface" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: 'var(--foreground-secondary)', fontFamily: 'var(--font-heading)' }}>
            MRR Breakdown
          </h3>
          {!mrr ? (
            <ChartEmptyState message="No MRR data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mrrData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `R${v}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 13 }}
                  formatter={(v: unknown) => [formatCurrency(Number(v)), undefined]}
                />
                <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                  {mrrData.map((_, idx) => (
                    <rect key={idx} fill={mrrData[idx].value >= 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent invoices */}
        <div className="etched-surface" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: 'var(--foreground-secondary)', fontFamily: 'var(--font-heading)' }}>
            Recent Invoices
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {invLoading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                Loading invoices...
              </div>
            ) : invoiceList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <DollarSign size={24} color="var(--muted)" style={{ opacity: 0.4, marginBottom: 8 }} />
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                  No invoices yet — invoices will appear here as they are created
                </p>
              </div>
            ) : (
              invoiceList.slice(0, 5).map(inv => (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{inv.invoice_number}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'No due date'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{formatCurrency(inv.amount)}</div>
                    <span className="badge" style={{
                      background: inv.status === 'paid' ? 'rgba(34,197,94,0.1)' : inv.status === 'overdue' ? 'rgba(239,68,68,0.1)' : 'rgba(148,163,184,0.1)',
                      color: inv.status === 'paid' ? '#22c55e' : inv.status === 'overdue' ? '#ef4444' : 'var(--muted)',
                      fontSize: 10,
                    }}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
