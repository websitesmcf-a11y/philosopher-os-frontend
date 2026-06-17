'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { getCampaign, getCampaignLeads, launchCampaign, pauseCampaign, deleteCampaign, type CampaignLead } from '@/lib/api-client';
import { useState } from 'react';
import { usePageTitle } from '@/lib/use-page-title';
import { Target, ArrowLeft, Play, Pause, Trash2, Loader2, CheckCircle2, Clock, XCircle, Send, MessageSquare, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/status-badge';

const STATUS_LABEL: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: '#6B7280', icon: Clock },
  sent: { label: 'Sent', color: '#22c55e', icon: CheckCircle2 },
  failed: { label: 'Failed', color: '#ef4444', icon: XCircle },
  skipped: { label: 'Skipped', color: '#C9A24D', icon: XCircle },
};

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => getCampaign(id),
    enabled: !!id,
  });

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['campaign-leads', id, statusFilter],
    queryFn: () => getCampaignLeads(id, statusFilter || undefined),
    enabled: !!id,
  });

  const leads = leadsData?.items ?? [];

  usePageTitle(`Campaign: ${campaign?.name ?? 'Loading...'}`);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    queryClient.invalidateQueries({ queryKey: ['campaign-leads', id] });
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  };

  const launchMut = useMutation({
    mutationFn: () => launchCampaign(id),
    onSuccess: () => { toast.success('Campaign launched! Sending will start within a minute.'); invalidate(); },
    onError: (e: any) => toast.error(e?.detail || 'Failed to launch'),
  });

  const pauseMut = useMutation({
    mutationFn: () => pauseCampaign(id),
    onSuccess: () => { toast.success('Campaign paused'); invalidate(); },
    onError: (e: any) => toast.error(e?.detail || 'Failed to pause'),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteCampaign(id),
    onSuccess: () => { toast.success('Campaign deleted'); router.push('/campaigns'); },
    onError: (e: any) => toast.error(e?.detail || 'Failed to delete'),
  });

  if (isLoading) {
    return (
      <div className="page-content page-enter">
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Loader2 size={28} color="var(--muted)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="page-content page-enter">
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>Campaign not found</p>
          <Link href="/campaigns" style={{ fontSize: 13, color: 'var(--accent)' }}>Back to Campaigns</Link>
        </div>
      </div>
    );
  }

  const scheduleConfig = campaign.schedule_config || {};
  const intervalMin = scheduleConfig.interval_min_minutes as number || 40;
  const intervalMax = scheduleConfig.interval_max_minutes as number || 60;
  const senderName = scheduleConfig.sender_name as string || '';
  const stats = {
    total: leadsData?.total ?? 0,
    pending: leads.filter(l => l.status === 'pending').length,
    sent: leads.filter(l => l.status === 'sent').length,
    failed: leads.filter(l => l.status === 'failed').length,
    skipped: leads.filter(l => l.status === 'skipped').length,
    sentRate: leadsData?.total ? Math.round((leads.filter(l => l.status === 'sent').length / leadsData.total) * 100) : 0,
  };

  return (
    <div className="page-content page-enter">
      <Link href="/campaigns" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Campaigns
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Target size={22} color="#C9A24D" />
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>
              {campaign.name}
            </h1>
            <StatusBadge status={campaign.status} />
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--foreground-secondary)' }}>
            <span>Channel: <strong>{campaign.channel}</strong></span>
            <span>Delay: <strong>{intervalMin}–{intervalMax} min</strong></span>
            {senderName && <span>Sender: <strong>{senderName}</strong></span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {campaign.status === 'draft' && (
            <button className="btn btn-primary" onClick={() => launchMut.mutate()} disabled={launchMut.isPending} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              {launchMut.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={14} />} Launch Campaign
            </button>
          )}
          {campaign.status === 'active' && (
            <button className="btn" onClick={() => pauseMut.mutate()} disabled={pauseMut.isPending} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              {pauseMut.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Pause size={14} />} Pause
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => { if (confirm('Delete this campaign?')) deleteMut.mutate(); }} style={{ color: '#ef4444' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Message template preview */}
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: 0.5, marginBottom: 8 }}>MESSAGE TEMPLATE</div>
        <pre style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', color: 'var(--foreground)', margin: 0, maxHeight: 200, overflowY: 'auto' }}>{campaign.message_template}</pre>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>{stats.total}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Total Leads</div>
        </div>
        <div className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{stats.sent}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Sent</div>
        </div>
        <div className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#6B7280' }}>{stats.pending}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Pending</div>
        </div>
        <div className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{stats.failed}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Failed</div>
        </div>
        <div className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: stats.sentRate > 50 ? '#22c55e' : '#C9A24D' }}>{stats.sentRate}%</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Sent Rate</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['', 'pending', 'sent', 'failed', 'skipped'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '4px 12px', fontSize: 12, borderRadius: 999, border: `1px solid ${statusFilter === s ? 'var(--accent)' : 'var(--border)'}`, background: statusFilter === s ? 'rgba(201,162,77,0.12)' : 'transparent', color: statusFilter === s ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Leads table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {leadsLoading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} color="var(--muted)" /></div>
        ) : leads.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            <Send size={24} style={{ marginBottom: 8, opacity: 0.3 }} />
            <div>No leads in this campaign yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Assign a lead list when creating the campaign</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone / Email</th>
                <th>Status</th>
                <th>Sent At</th>
                <th>Replied</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => {
                const statusInfo = STATUS_LABEL[lead.status] || STATUS_LABEL.pending;
                const Icon = statusInfo.icon;
                return (
                  <tr key={lead.id}>
                    <td style={{ fontWeight: 500 }}>{lead.name || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--foreground-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {lead.phone || lead.email || '—'}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: statusInfo.color }}>
                        <Icon size={12} /> {statusInfo.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {lead.sent_at ? new Date(lead.sent_at).toLocaleString() : '—'}
                    </td>
                    <td>
                      {lead.replied_at ? (
                        <span style={{ color: '#22c55e', fontSize: 12 }}>✅ {new Date(lead.replied_at).toLocaleDateString()}</span>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
