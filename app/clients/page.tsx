'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listClients, listLeads, createClient, updateLead, formatCurrency, type ClientStatus } from '@/lib/api-client';
import { Search, Plus, MoreHorizontal, X, Loader2, Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { usePageTitle } from '@/lib/use-page-title';

const CONTRACT_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Paused', value: 'paused' },
  { label: 'Lost', value: 'lost' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function ClientsPage() {
  usePageTitle('Clients');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<{
    id: string; name: string; email?: string; phone?: string;
    company?: string; industry?: string;
  } | null>(null);
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formIndustry, setFormIndustry] = useState('');
  const [formStatus, setFormStatus] = useState('active');
  const [formMrr, setFormMrr] = useState('');

  const queryClient = useQueryClient();

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => listClients({ page: 1, page_size: 50 }),
  });

  const { data: leadsData } = useQuery({
    queryKey: ['leads', 'convert-picker', leadSearch],
    queryFn: () => listLeads({
      page: 1,
      page_size: 50,
      search: leadSearch || undefined,
    }),
    enabled: dialogOpen,
  });

  const leads = leadsData?.items ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['clients'] });

  const createMut = useMutation({
    mutationFn: async (values: {
      name: string; email?: string; phone?: string;
      company?: string; industry?: string; contract_status: string;
      mrr: number; leadId?: string;
    }) => {
      const client = await createClient({
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        company: values.company || undefined,
        industry: values.industry || undefined,
        contract_status: values.contract_status as ClientStatus,
        mrr: values.mrr,
      });
      if (values.leadId) {
        await updateLead(values.leadId, {
          status: 'converted' as never,
          converted_at: new Date().toISOString(),
        });
      }
      return client;
    },
    onSuccess: () => {
      toast.success('Client created');
      closeDialog();
      invalidate();
    },
    onError: (e: Error) => toast.error(`Failed to create client: ${e.message}`),
  });

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('');
    setFormIndustry('');
    setFormStatus('active');
    setFormMrr('');
    setSelectedLead(null);
    setLeadSearch('');
  };

  const selectLead = (lead: typeof selectedLead) => {
    setSelectedLead(lead);
    if (lead) {
      setFormName(lead.name || '');
      setFormEmail(lead.email || '');
      setFormPhone(lead.phone || '');
      setFormCompany(lead.company || '');
      setFormIndustry(lead.industry || '');
    }
    setShowLeadDropdown(false);
    setLeadSearch('');
  };

  const openDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    await createMut.mutateAsync({
      name: formName.trim(),
      email: formEmail.trim() || undefined,
      phone: formPhone.trim() || undefined,
      company: formCompany.trim() || undefined,
      industry: formIndustry.trim() || undefined,
      contract_status: formStatus,
      mrr: parseFloat(formMrr) || 0,
      leadId: selectedLead?.id,
    });
  };

  const clients = clientsData?.items ?? [];
  const filtered = search
    ? clients.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
      )
    : clients;

  return (
    <div className="page-content page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Clients</h1>
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
            Active client accounts and contracts
          </p>
        </div>
        <button className="btn btn-primary" onClick={openDialog}>
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* ─── Add Client Modal ─── */}
      {dialogOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)',
        }} onClick={closeDialog}>
          <div className="card" style={{
            width: '100%', maxWidth: 520, padding: 0, overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Add Client</h2>
              <button className="btn btn-ghost" onClick={closeDialog} style={{ padding: '4px 8px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Lead Picker */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4, color: 'var(--foreground-secondary)' }}>
                    Convert from Lead{' '}
                    <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    {selectedLead ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6,
                        background: 'var(--surface)',
                      }}>
                        <Check size={16} style={{ color: '#22c55e' }} />
                        <span style={{ flex: 1, fontSize: 14 }}>
                          {selectedLead.name}
                          {selectedLead.company ? ` — ${selectedLead.company}` : ''}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => selectLead(null)}
                          style={{ padding: '2px 6px' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          value={leadSearch}
                          onChange={e => { setLeadSearch(e.target.value); setShowLeadDropdown(true); }}
                          onFocus={() => setShowLeadDropdown(true)}
                          placeholder="Search leads..."
                          style={{ paddingRight: 32 }}
                        />
                        <ChevronDown size={16} style={{
                          position: 'absolute', right: 10, top: '50%',
                          transform: 'translateY(-50%)', color: 'var(--muted)',
                          pointerEvents: 'none',
                        }} />
                      </>
                    )}

                    {showLeadDropdown && !selectedLead && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                        maxHeight: 200, overflowY: 'auto',
                        border: '1px solid var(--border)', borderRadius: 6,
                        background: 'var(--surface)', marginTop: 4,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}>
                        {leads.length === 0 && (
                          <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--muted)' }}>
                            No leads found
                          </div>
                        )}
                        {leads.map(lead => (
                          <button
                            key={lead.id}
                            type="button"
                            onClick={() => selectLead({
                              id: lead.id, name: lead.name,
                              email: lead.email, phone: lead.phone,
                              company: lead.company, industry: lead.industry,
                            })}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              padding: '8px 12px', border: 'none',
                              borderBottom: '1px solid var(--border)',
                              background: 'transparent', cursor: 'pointer', fontSize: 14,
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <div style={{ fontWeight: 500 }}>{lead.name}</div>
                            {(lead.company || lead.email) && (
                              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                                {lead.company}{lead.company && lead.email ? ' · ' : ''}{lead.email}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  color: 'var(--muted)', fontSize: 12,
                }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  Or enter details manually
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                {/* Name */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4, color: 'var(--foreground-secondary)' }}>
                    Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Client name"
                    required
                  />
                </div>

                {/* Email + Phone row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4, color: 'var(--foreground-secondary)' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      placeholder="name@company.com"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4, color: 'var(--foreground-secondary)' }}>
                      Phone
                    </label>
                    <input
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      placeholder="+27 ..."
                    />
                  </div>
                </div>

                {/* Company + Industry row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4, color: 'var(--foreground-secondary)' }}>
                      Company
                    </label>
                    <input
                      value={formCompany}
                      onChange={e => setFormCompany(e.target.value)}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4, color: 'var(--foreground-secondary)' }}>
                      Industry
                    </label>
                    <input
                      value={formIndustry}
                      onChange={e => setFormIndustry(e.target.value)}
                      placeholder="e.g. plumbing, dental"
                    />
                  </div>
                </div>

                {/* Status + MRR row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4, color: 'var(--foreground-secondary)' }}>
                      Contract Status
                    </label>
                    <select value={formStatus} onChange={e => setFormStatus(e.target.value)}>
                      {CONTRACT_STATUS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4, color: 'var(--foreground-secondary)' }}>
                      MRR (ZAR)
                    </label>
                    <input
                      type="number"
                      value={formMrr}
                      onChange={e => setFormMrr(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" onClick={closeDialog}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMut.isPending}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {createMut.isPending && <Loader2 size={14} className="spin" />}
                  {createMut.isPending
                    ? 'Creating...'
                    : selectedLead
                      ? 'Convert Lead to Client'
                      : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Search Bar ─── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients..."
            style={{ paddingLeft: 34, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)' }}
          />
        </div>
      </div>

      {/* ─── Clients Table ─── */}
      <div className="etched-surface" style={{ overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Contract</th>
              <th>MRR</th>
              <th>LTV</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading...</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No clients found</td></tr>
            )}
            {filtered.map(client => (
              <tr key={client.id}>
                <td style={{ fontWeight: 500 }}>{client.name}</td>
                <td>{client.company || '—'}</td>
                <td style={{ color: 'var(--foreground-secondary)' }}>{client.email || '—'}</td>
                <td>
                  <span className="badge" style={{
                    background: client.contract_status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.1)',
                    color: client.contract_status === 'active' ? '#22c55e' : 'var(--muted)',
                  }}>
                    {client.contract_status}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(client.mrr)}</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(client.lifetime_value)}</td>
                <td style={{ fontSize: 13, color: 'var(--muted)' }}>{client.created_at ? new Date(client.created_at).toLocaleDateString() : '—'}</td>
                <td>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px' }}>
                    <MoreHorizontal size={16} />
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
