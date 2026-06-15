'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listLeads, createLead, deleteLead, listLeadLists, type LeadStatus } from '@/lib/api-client';
import { Search, Plus, Trash2, Layers, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePageTitle } from '@/lib/use-page-title';
import { CreateDialog } from '@/components/create-dialog';
import { EmptyState } from '@/components/ui/empty-state';

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
  const [listFilter, setListFilter] = useState<string>('available');
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['leads', statusFilter, search, listFilter],
    queryFn: () => listLeads({
      page: 1, page_size: 50,
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(listFilter === 'available' ? { list_id: 'null' } : listFilter !== 'all' ? { list_id: listFilter } : {}),
    }),
  });

  const { data: listsData } = useQuery({
    queryKey: ['lead-lists', 'filter'],
    queryFn: () => listLeadLists(),
  });
  const leadLists = listsData?.items ?? [];

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

      {/* Lead pool info banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        padding: '8px 14px', borderRadius: 6,
        background: 'rgba(111,125,79,0.05)', border: '1px solid rgba(111,125,79,0.12)',
        fontSize: 12, color: 'var(--foreground-secondary)',
      }}>
        <Layers size={14} color="#6F7D4F" />
        <span>
          Showing <strong>available</strong> leads — leads assigned to a campaign or list are hidden from this view.
          Change the filter to see them.
        </span>
      </div>

      {/* Filters bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
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
        <select
          value={listFilter}
          onChange={e => setListFilter(e.target.value)}
          style={{ width: 'auto', paddingRight: 28 }}
        >
          <option value="all">All Lists</option>
          <option value="available">🔓 Available (no list)</option>
          <option value="reserved">🔒 Reserved</option>
          {leadLists.map(ll => (
            <option key={ll.id} value={ll.id}>{ll.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="etched-surface" style={{ overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Email</th>
              <th>Status</th>
              <th>List</th>
              <th>Score</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading...</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 0 }}>
                <EmptyState
                  pageKey="leads"
                  title="No leads yet"
                  description="Add your first lead manually or run a lead generation mission to populate your CRM."
                  action={
                    <button className="btn btn-primary" onClick={() => setDialogOpen(true)}>
                      <Plus size={16} /> Add Lead
                    </button>
                  }
                />
              </td></tr>
            )}
            {filtered.map(lead => {
              // Try to find which list this lead belongs to
              const leadList = (lead as any).list_id ? leadLists.find(ll => ll.id === (lead as any).list_id) : null;
              const isReserved = !!(lead as any).list_id;
              return (
              <tr key={lead.id}>
                <td style={{ fontWeight: 500 }}>{lead.name || '—'}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{lead.phone || '—'}</td>
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
                  {leadList ? (
                    <Link href={`/lead-lists/${leadList.id}`} style={{ textDecoration: 'none' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(111,125,79,0.1)', color: '#6F7D4F', fontWeight: 500 }}>
                        <Layers size={11} /> {leadList.name}
                      </span>
                    </Link>
                  ) : isReserved ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)' }}>
                      <Lock size={11} /> Reserved
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>—</span>
                  )}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
