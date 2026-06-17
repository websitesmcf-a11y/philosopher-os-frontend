'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { getLeadList, deleteLeadList, removeLeadFromList, listLeads, addLeadsToList, listCampaigns, reserveLeadList, lockLeadList, unlockLeadList } from '@/lib/api-client';
import { useState } from 'react';
import { usePageTitle } from '@/lib/use-page-title';
import { Layers, ArrowLeft, Trash2, Plus, X, Loader2, Search, Check, Lock, Unlock, ChevronDown, Users } from 'lucide-react';
import Link from 'next/link';

const STATUS_LABEL: Record<string, string> = {
  new: 'New', contacted: 'Contacted', qualified: 'Qualified',
  proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
};

const STATUS_COLOR: Record<string, string> = {
  new: 'var(--accent)', contacted: '#3b82f6', qualified: '#f59e0b',
  proposal: 'var(--accent-olive)', negotiation: '#ef4444', won: '#22c55e', lost: '#94a3b8',
};

export default function LeadListDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showAddLeads, setShowAddLeads] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [showAssignCampaign, setShowAssignCampaign] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const { data: listData, isLoading } = useQuery({
    queryKey: ['lead-list', id],
    queryFn: () => getLeadList(id),
    enabled: !!id,
  });

  const { data: allLeadsData } = useQuery({
    queryKey: ['leads', 'picker', leadSearch],
    queryFn: () => listLeads({ page: 1, page_size: 100, search: leadSearch || undefined }),
    enabled: showAddLeads,
  });

  const { data: campaignsData } = useQuery({
    queryKey: ['campaigns', 'assign'],
    queryFn: () => listCampaigns(),
    enabled: showAssignCampaign,
  });

  const allLeads = allLeadsData?.items ?? [];
  const campaigns = campaignsData?.items ?? [];
  const leads = listData?.leads ?? [];
  const listName = listData?.name ?? 'Loading...';
  const leadCount = listData?.lead_count ?? leads.length;

  usePageTitle(`Lead List: ${listName}`);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['lead-list', id] });
    queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
  };

  const deleteMut = useMutation({
    mutationFn: () => deleteLeadList(id),
    onSuccess: () => { toast.success('List deleted'); router.push('/lead-lists'); },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  const removeLeadMut = useMutation({
    mutationFn: (leadId: string) => removeLeadFromList(id, leadId),
    onSuccess: () => { toast.success('Lead removed from list'); invalidate(); },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  const addLeadsMut = useMutation({
    mutationFn: () => addLeadsToList(id, Array.from(selectedLeadIds)),
    onSuccess: (result) => {
      toast.success(`${result.added} lead(s) added to list`);
      setShowAddLeads(false);
      setSelectedLeadIds(new Set());
      setLeadSearch('');
      invalidate();
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  const reserveMut = useMutation({
    mutationFn: () => {
      if (!selectedCampaignId) throw new Error('Select a campaign');
      return reserveLeadList(id, selectedCampaignId);
    },
    onSuccess: (result) => {
      toast.success(`✅ ${result.reserved} lead(s) reserved for campaign — these leads are now locked from the general pool`);
      setShowAssignCampaign(false);
      setSelectedCampaignId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  const lockMut = useMutation({
    mutationFn: () => lockLeadList(id),
    onSuccess: (result) => { toast.success(result.message); invalidate(); },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  const unlockMut = useMutation({
    mutationFn: () => unlockLeadList(id),
    onSuccess: (result) => { toast.success(result.message); invalidate(); },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  const toggleLead = (leadId: string) => {
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId); else next.add(leadId);
      return next;
    });
  };

  const filteredAvailableLeads = allLeads.filter(l => {
    if (!leadSearch.trim()) return true;
    const q = leadSearch.toLowerCase();
    return l.name?.toLowerCase().includes(q) || l.phone?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q);
  }).filter(l => !leads.some(existing => existing.id === l.id));

  if (isLoading) {
    return (
      <div className="page-content page-enter">
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Loader2 size={28} color="var(--muted)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-content page-enter">
      {/* Back link */}
      <Link href="/lead-lists" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Lead Lists
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Layers size={20} color="#6F7D4F" />
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {listName}
              {listData?.locked && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Lock size={10} /> LOCKED
                </span>
              )}
            </h1>
          </div>
          {listData?.description && (
            <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', marginTop: 4 }}>{listData.description}</p>
          )}
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            <Users size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {leadCount} lead{leadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm" onClick={() => setShowAddLeads(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Plus size={14} /> Add Leads
          </button>
          <button className="btn btn-sm btn-primary" onClick={() => setShowAssignCampaign(true)}
            disabled={leads.length === 0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Lock size={14} /> Assign to Campaign
          </button>
          <button className="btn btn-sm" onClick={() => listData?.locked ? unlockMut.mutate() : lockMut.mutate()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, borderColor: listData?.locked ? '#ef4444' : undefined, color: listData?.locked ? '#ef4444' : undefined }}>
            {listData?.locked ? <><Unlock size={14} /> Unlock</> : <><Lock size={14} /> Lock</>}
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => { if (confirm('Delete this entire list?')) deleteMut.mutate(); }}
            style={{ color: '#ef4444' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Reservation info */}
      {leads.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 14px', borderRadius: 6, background: 'rgba(111,125,79,0.06)', border: '1px solid rgba(111,125,79,0.15)', fontSize: 12, color: 'var(--foreground-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={14} color="#6F7D4F" />
          Lead lists can be <strong>reserved</strong> by a campaign. Once reserved, these leads are locked from the general lead pool and only the campaign can use them.
        </div>
      )}

      {/* Leads table */}
      <div className="etched-surface" style={{ overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Email</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                <Layers size={24} style={{ marginBottom: 8, opacity: 0.4 }} />
                <div>No leads in this list yet</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Click "Add Leads" to populate this list</div>
              </td></tr>
            ) : (
              leads.map(lead => (
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
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--muted)' }}
                      onClick={() => { if (confirm(`Remove "${lead.name}" from this list?`)) removeLeadMut.mutate(lead.id); }}
                      title="Remove from list">
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Leads Modal */}
      {showAddLeads && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAddLeads(false)}>
          <div className="card" style={{ padding: 28, maxWidth: 480, width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Add Leads to List</h2>
              <button className="btn btn-ghost" onClick={() => setShowAddLeads(false)} style={{ padding: '4px 8px' }}><X size={18} /></button>
            </div>

            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--muted)' }} />
              <input placeholder="Search available leads..." value={leadSearch} onChange={e => setLeadSearch(e.target.value)} style={{ paddingLeft: 32, width: '100%' }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 12 }}>
              {filteredAvailableLeads.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  {allLeads.length === 0 ? 'No leads found in the general pool.' : 'All leads are already in this list.'}
                </div>
              ) : (
                filteredAvailableLeads.map(lead => (
                  <label key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}>
                    <input type="checkbox" checked={selectedLeadIds.has(lead.id)} onChange={() => toggleLead(lead.id)} style={{ width: 'auto' }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.name || 'Unnamed'}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{lead.phone || lead.email || lead.company || 'No contact'}</div>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{selectedLeadIds.size} selected</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm" onClick={() => setShowAddLeads(false)}>Cancel</button>
                <button className="btn btn-sm btn-primary" disabled={selectedLeadIds.size === 0 || addLeadsMut.isPending} onClick={() => addLeadsMut.mutate()}>
                  {addLeadsMut.isPending ? <><Loader2 size={12} className="spin" /> Adding...</> : `Add ${selectedLeadIds.size} Lead(s)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign to Campaign Modal */}
      {showAssignCampaign && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAssignCampaign(false)}>
          <div className="card" style={{ padding: 28, maxWidth: 440, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
              <Lock size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} color="#6F7D4F" />
              Reserve List for Campaign
            </h2>
            <p style={{ fontSize: 12, color: 'var(--foreground-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              This will reserve all <strong>{leadCount} lead(s)</strong> in this list for the selected campaign.
              These leads will be <strong>locked</strong> from the general lead pool — only the campaign can see them.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Select Campaign</label>
              <select value={selectedCampaignId || ''} onChange={e => setSelectedCampaignId(e.target.value)} style={{ width: '100%' }}>
                <option value="">Choose a campaign...</option>
                {campaigns.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.channel})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" onClick={() => setShowAssignCampaign(false)}>Cancel</button>
              <button className="btn btn-sm btn-primary" disabled={!selectedCampaignId || reserveMut.isPending} onClick={() => reserveMut.mutate()}>
                {reserveMut.isPending ? <><Loader2 size={12} className="spin" /> Reserving...</> : <><Lock size={12} /> Reserve & Lock Leads</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
