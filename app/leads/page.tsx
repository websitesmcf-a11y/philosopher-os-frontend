'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listLeads, createLead, deleteLead, type LeadStatus } from '@/lib/api-client';
import { Search, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { usePageTitle } from '@/lib/use-page-title';
import { CreateDialog } from '@/components/create-dialog';

const STATUS_LABEL: Record<string, string> = {
  new: 'New', contacted: 'Contacted', qualified: 'Qualified',
  proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
};

const STATUS_COLOR: Record<string, string> = {
  new: 'var(--accent)', contacted: '#3b82f6', qualified: '#f59e0b',
  proposal: 'var(--accent-olive)', negotiation: '#ef4444', won: '#22c55e', lost: '#94a3b8',
};

export default function LeadsPage() {
  usePageTitle('Leads');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['leads', statusFilter, search],
    queryFn: () => listLeads({ page: 1, page_size: 50, ...(statusFilter !== 'all' ? { status: statusFilter } : {}) }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['leads'] });

  const createMut = useMutation({
    mutationFn: (values: Record<string, string>) => createLead({
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      company: values.company || undefined,
      industry: values.industry || undefined,
      source: values.source || 'manual',
    }),
    onSuccess: () => {
      toast.success('Lead added');
      setDialogOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(`Failed to add lead: ${e.message}`),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => { toast.success('Lead deleted'); invalidate(); },
    onError: (e: Error) => toast.error(`Failed to delete lead: ${e.message}`),
  });

  const leads = data?.items ?? [];
  const filtered = search
    ? leads.filter(l => l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()) || l.company?.toLowerCase().includes(search.toLowerCase()))
    : leads;

  return (
    <div className="page-content page-enter">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Leads</h1>
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
            Manage and track incoming leads
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setDialogOpen(true)}>
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <CreateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Add Lead"
        submitting={createMut.isPending}
        onSubmit={async values => { await createMut.mutateAsync(values); }}
        fields={[
          { name: 'name', label: 'Name', type: 'text', placeholder: 'Full name', required: true },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'name@company.com' },
          { name: 'phone', label: 'Phone', type: 'text', placeholder: '+27 ...' },
          { name: 'company', label: 'Company', type: 'text' },
          { name: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g. plumbing, dental' },
          {
            name: 'source', label: 'Source', type: 'select', defaultValue: 'manual',
            options: [
              { label: 'Manual', value: 'manual' }, { label: 'Referral', value: 'referral' },
              { label: 'Website', value: 'website' }, { label: 'WhatsApp', value: 'whatsapp' },
              { label: 'Email', value: 'email' }, { label: 'Social', value: 'social' },
            ],
          },
        ]}
      />

      {/* Filters bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            style={{ paddingLeft: 34, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as LeadStatus | 'all')}
          style={{ width: 'auto', paddingRight: 28 }}
        >
          <option value="all">All Status</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="etched-surface" style={{ overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Status</th>
              <th>Score</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading...</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No leads found</td></tr>
            )}
            {filtered.map(lead => (
              <tr key={lead.id}>
                <td style={{ fontWeight: 500 }}>{lead.name || '—'}</td>
                <td>{lead.company || '—'}</td>
                <td style={{ color: 'var(--foreground-secondary)' }}>{lead.email || '—'}</td>
                <td>
                  <span className="badge" style={{
                    background: `${STATUS_COLOR[lead.status]}15`,
                    color: STATUS_COLOR[lead.status],
                  }}>
                    {STATUS_LABEL[lead.status] || lead.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 50, height: 4, background: 'var(--border)' }}>
                      <div style={{ width: `${Math.min(lead.score, 100)}%`, height: '100%', background: lead.score > 80 ? '#22c55e' : lead.score > 50 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{lead.score}</span>
                  </div>
                </td>
                <td style={{ fontSize: 13, color: 'var(--muted)' }}>{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '—'}</td>
                <td>
                  <button
                    className="btn btn-ghost" style={{ padding: '4px 8px' }} title="Delete lead"
                    disabled={deleteMut.isPending}
                    onClick={() => { if (confirm(`Delete lead "${lead.name}"?`)) deleteMut.mutate(lead.id); }}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
