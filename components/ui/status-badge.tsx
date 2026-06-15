'use client';

const STATUS_PALETTE: Record<string, { bg: string; fg: string; border: string }> = {
  // Lead statuses
  new:           { bg: 'var(--accent-subtle)', fg: 'var(--accent)', border: 'rgba(18,60,105,0.2)' },
  enriched:      { bg: 'var(--accent-subtle)', fg: 'var(--accent-bright)', border: 'rgba(18,60,105,0.2)' },
  contacted:     { bg: '#EBF5FF', fg: '#1E40AF', border: 'rgba(30,64,175,0.2)' },
  replied:       { bg: '#EFF6FF', fg: '#2563EB', border: 'rgba(37,99,235,0.2)' },
  meeting_booked:{ bg: '#F0F9FF', fg: '#0369A1', border: 'rgba(3,105,161,0.2)' },
  proposal_sent: { bg: '#FEFCE8', fg: '#A16207', border: 'rgba(161,98,7,0.2)' },
  won:           { bg: '#F0FDF4', fg: '#166534', border: 'rgba(22,101,52,0.2)' },
  lost:          { bg: '#FEF2F2', fg: '#991B1B', border: 'rgba(153,27,27,0.2)' },
  ghosted:       { bg: '#F9FAFB', fg: '#6B7280', border: 'rgba(107,114,128,0.2)' },
  follow_up_needed: { bg: '#FFFBEB', fg: '#92400E', border: 'rgba(146,64,14,0.2)' },
  invalid:       { bg: '#FEF2F2', fg: '#991B1B', border: 'rgba(153,27,27,0.2)' },
  // Campaign statuses
  draft:      { bg: 'var(--surface-inset)', fg: 'var(--foreground-secondary)', border: 'var(--border)' },
  ready:      { bg: '#EFF6FF', fg: '#1D4ED8', border: 'rgba(29,78,216,0.2)' },
  testing:    { bg: 'var(--purple-light)', fg: 'var(--purple)', border: 'rgba(123,94,167,0.2)' },
  running:    { bg: '#F0FDF4', fg: '#166534', border: 'rgba(22,101,52,0.2)' },
  active:     { bg: '#F0FDF4', fg: '#166534', border: 'rgba(22,101,52,0.2)' },
  paused:     { bg: '#FFFBEB', fg: '#92400E', border: 'rgba(146,64,14,0.2)' },
  completed:  { bg: '#F0FDF4', fg: '#166534', border: 'rgba(22,101,52,0.2)' },
  failed:     { bg: '#FEF2F2', fg: '#991B1B', border: 'rgba(153,27,27,0.2)' },
  cancelled:  { bg: '#F9FAFB', fg: '#6B7280', border: 'rgba(107,114,128,0.2)' },
  // Client statuses
  pending:    { bg: 'var(--accent-subtle)', fg: 'var(--accent)', border: 'rgba(18,60,105,0.2)' },
  // Task statuses
  todo:        { bg: 'var(--surface-inset)', fg: 'var(--foreground-secondary)', border: 'var(--border)' },
  in_progress: { bg: '#EFF6FF', fg: '#1D4ED8', border: 'rgba(29,78,216,0.2)' },
  scheduled:   { bg: '#EFF6FF', fg: '#1D4ED8', border: 'rgba(29,78,216,0.2)' },
  urgent:      { bg: '#FEF2F2', fg: '#991B1B', border: 'rgba(153,27,27,0.2)' },
  // Finance
  income:   { bg: '#F0FDF4', fg: '#166534', border: 'rgba(22,101,52,0.2)' },
  expense:  { bg: '#FEF2F2', fg: '#991B1B', border: 'rgba(153,27,27,0.2)' },
  paid:     { bg: '#F0FDF4', fg: '#166534', border: 'rgba(22,101,52,0.2)' },
  overdue:  { bg: '#FEF2F2', fg: '#991B1B', border: 'rgba(153,27,27,0.2)' },
  unpaid:   { bg: '#FFFBEB', fg: '#92400E', border: 'rgba(146,64,14,0.2)' },
  // Integration
  connected: { bg: '#F0FDF4', fg: '#166534', border: 'rgba(22,101,52,0.2)' },
  disconnected: { bg: '#F9FAFB', fg: '#6B7280', border: 'rgba(107,114,128,0.2)' },
  error:     { bg: '#FEF2F2', fg: '#991B1B', border: 'rgba(153,27,27,0.2)' },
  // Generic
  warning:   { bg: '#FFFBEB', fg: '#92400E', border: 'rgba(146,64,14,0.2)' },
  success:   { bg: '#F0FDF4', fg: '#166534', border: 'rgba(22,101,52,0.2)' },
  info:      { bg: '#EFF6FF', fg: '#1D4ED8', border: 'rgba(29,78,216,0.2)' },
};

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function statusColor(status: string): string {
  return STATUS_PALETTE[status]?.fg || 'var(--foreground-secondary)';
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const palette = STATUS_PALETTE[status] || STATUS_PALETTE['draft'];
  const display = label || status.replace(/_/g, ' ');

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '2px 10px',
      fontSize: 11, fontWeight: 600,
      fontFamily: 'var(--font-mono)',
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      background: palette.bg,
      color: palette.fg,
      border: `1px solid ${palette.border}`,
      borderRadius: 'var(--radius)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: palette.fg,
        flexShrink: 0,
      }} />
      {display}
    </span>
  );
}
