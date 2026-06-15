'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listLeadLists, createLeadList, deleteLeadList, listLeads, addLeadsToList, type LeadList } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { usePageTitle } from '@/lib/use-page-title';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Layers, Plus, Trash2, Loader2, Search, Check, X, Users, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LeadListsPage() {
  usePageTitle('Lead Lists');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['lead-lists'],
    queryFn: () => listLeadLists(),
  });

  const lists = data?.items ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['lead-lists'] });

  const createMut = useMutation({
    mutationFn: () => createLeadList({ name: formName.trim(), description: formDesc.trim() || undefined }),
    onSuccess: (result) => {
      toast.success('Lead list created');
      setShowCreate(false);
      setFormName('');
      setFormDesc('');
      invalidate();
      router.push(`/lead-lists/${result.id}`);
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteLeadList(id),
    onSuccess: () => { toast.success('List deleted'); invalidate(); },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  return (
    <div className="page-content page-enter">
      <PageHeader
        title="Lead Lists"
        description="Organize leads into pools — assign to campaigns, lock from general access"
        icon={Layers}
        iconColor="#6F7D4F"
        actions={
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New List
          </button>
        }
      />

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowCreate(false)}>
          <div className="card" style={{ padding: 28, maxWidth: 420, width: '90%', }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, fontFamily: 'var(--font-heading)' }}>New Lead List</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>List Name *</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g., Plumbing Q3 Outreach" autoFocus />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Description (optional)</label>
                <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="What's this list for?" rows={2} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={!formName.trim() || createMut.isPending} onClick={() => createMut.mutate()}>
                {createMut.isPending ? <><Loader2 size={14} className="spin" /> Creating...</> : 'Create List'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 16px', background: 'rgba(111,125,79,0.06)', border: '1px solid rgba(111,125,79,0.15)', borderRadius: 8, fontSize: 13, color: 'var(--foreground-secondary)' }}>
        <Lock size={16} color="#6F7D4F" />
        <span>Leads in a list are <strong>reserved</strong> when assigned to a campaign — they are locked from the general lead pool and only visible to the campaign owner.</span>
      </div>

      {isLoading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <Loader2 size={24} color="var(--muted)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : lists.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Layers}
            title="No lead lists yet"
            description="Create a lead list to organize leads into pools. Campaigns can then reserve entire lists."
            action={{ label: 'Create Lead List', onClick: () => setShowCreate(true) }}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {lists.map(list => (
            <Link
              key={list.id}
              href={`/lead-lists/${list.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{ padding: 20, cursor: 'pointer', transition: 'all 0.15s ease', height: '100%', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(111,125,79,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Layers size={20} color="#6F7D4F" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--foreground)' }}>{list.name}</h3>
                    {list.description && (
                      <p style={{ fontSize: 12, color: 'var(--foreground-secondary)', marginTop: 4, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {list.description}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto', paddingTop: 12, borderTop: '0.5px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--foreground-secondary)' }}>
                    <Users size={14} />
                    <span style={{ fontWeight: 600 }}>{list.lead_count || 0}</span> leads
                  </div>
                  <ArrowRight size={14} color="var(--muted)" style={{ marginLeft: 'auto' }} />
                </div>
              </div>
            </Link>
          ))}
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
