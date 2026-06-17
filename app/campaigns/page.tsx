'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listCampaigns, createCampaign, launchCampaign, pauseCampaign, deleteCampaign, listLeadLists, addCampaignLeads } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Target, Plus, Search, Play, Pause, Trash2, Loader2, MessageSquare, Layers, Lock, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import LoadingVideo from '@/components/ui/loading-video';

export default function CampaignsPage() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [enterLoading, setEnterLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setLoadProgress(p => Math.min(p + 2, 100)), 100);
    const t = setTimeout(() => setEnterLoading(false), 5000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);
  const [showCustomCmd, setShowCustomCmd] = useState<string | null>(null);
  const [customCmd, setCustomCmd] = useState('');
  const [showLoading, setShowLoading] = useState<'create' | 'launch' | null>(null);
  const [form, setForm] = useState({
    name: '', channel: 'whatsapp', message_template: '', objective: '',
    leadListId: '', intervalMin: 20, intervalMax: 30, senderName: ''
  });
  const queryClient = useQueryClient();
  const router = useRouter();

  // Lead lists (used for campaign creation picker + table display)
  const { data: leadListsData } = useQuery({
    queryKey: ['lead-lists', 'for-campaigns'],
    queryFn: () => listLeadLists(),
  });
  const leadLists = leadListsData?.items ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => listCampaigns(),
  });

  const campaigns = Array.isArray(data) ? data : data?.items ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['campaigns'] });

  const launchMut = useMutation({
    mutationFn: (id: string) => launchCampaign(id),
    onSuccess: () => { toast.success('Campaign launched'); invalidate(); },
    onError: (e: any) => toast.error(e?.detail || 'Failed to launch campaign'),
  });

  const pauseMut = useMutation({
    mutationFn: (id: string) => pauseCampaign(id),
    onSuccess: () => { toast.success('Campaign paused'); invalidate(); },
    onError: (e: any) => toast.error(e?.detail || 'Failed to pause campaign'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => { toast.success('Campaign deleted'); invalidate(); },
    onError: (e: any) => toast.error(e?.detail || 'Failed to delete campaign'),
  });

  const handleCreate = useCallback(async () => {
    if (!form.name) { toast.error('Campaign name is required'); return; }
    if (!form.message_template) { toast.error('A message template is required — what will the campaign say?'); return; }
    if (!form.leadListId) { toast.error('Select a lead list for this campaign'); return; }
    if (!form.senderName) { toast.error('Enter your name — it replaces [Your Name] in the template.'); return; }
    const intervalMin = Math.min(form.intervalMin, form.intervalMax);
    const intervalMax = Math.max(form.intervalMin, form.intervalMax);
    setShowLoading('create');
    try {
      const campaign = await createCampaign({
        name: form.name,
        channel: form.channel,
        message_template: form.message_template,
        status: 'draft',
        schedule_config: {
          interval_min_minutes: intervalMin,
          interval_max_minutes: intervalMax,
          sender_name: form.senderName,
        },
        target_count: 0,
      } as any);
      toast.success(`Campaign "${form.name}" created!`);
      setShowCreate(false);
      setForm({ name: '', channel: 'whatsapp', message_template: '', objective: '', leadListId: '', intervalMin: 20, intervalMax: 30, senderName: '' });
      invalidate();
    } catch (e: any) {
      toast.error(e?.detail || 'Failed to create campaign');
    } finally {
      setShowLoading(null);
    }
  }, [form, queryClient]);

  const handleCustomCommand = useCallback(async () => {
    if (!showCustomCmd || !customCmd) return;
    // Send the custom command to the chat with Odysseus for campaign management
    router.push(`/chat?agent=odysseus&message=${encodeURIComponent(customCmd)}`);
    setShowCustomCmd(null);
    setCustomCmd('');
  }, [showCustomCmd, customCmd, router]);

  const splashOpacity = enterLoading ? 1 : 0;
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0F1722', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: splashOpacity, transition: 'opacity 0.8s ease-out', pointerEvents: enterLoading ? 'auto' : 'none' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', objectFit: 'cover', opacity: 0.2 }}>
          <source src="/assets/philosopher-os/page-animations/campaign-launch.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'relative', textAlign: 'center', width: 640, maxWidth: '90vw' }}>
          <div style={{ width: '100%', height: 14, background: 'rgba(255,255,255,0.08)', borderRadius: 7, overflow: 'hidden', marginBottom: 32, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)' }}>
            <div style={{ width: `${loadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #C9A24D, #16A34A)', borderRadius: 7, transition: 'width 0.15s linear', boxShadow: '0 0 12px rgba(201,162,77,0.3)' }} />
          </div>
          <p style={{ color: 'white', fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-heading)', margin: 0, letterSpacing: '-0.03em' }}>Loading Campaigns</p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 28, marginTop: 16, fontWeight: 300 }}>{loadProgress}%</p>
        </div>
      </div>
      <div className={`page-content ${enterLoading ? '' : 'fade-in'}`}>
      <PageHeader
        title="Campaigns"
        description="Create and manage outreach campaigns"
        icon={Target}
        iconColor="#C9A24D"
        actions={
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Campaign
          </button>
        }
      />

      <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--muted)' }} />
          <input placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCreate(false)}>
          <div className="card" style={{ padding: 32, maxWidth: 480, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20, fontFamily: 'var(--font-heading)' }}>New Campaign</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Campaign Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Plumbing Outreach Q3" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Channel *</label>
                <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="call">Call</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Message Template * <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(what will the campaign say?)</span>
                </label>
                <textarea
                  value={form.message_template}
                  onChange={e => setForm(f => ({ ...f, message_template: e.target.value }))}
                  placeholder="e.g., Hi {{name}}, I noticed your business could benefit from a new website. Would you be open to a quick chat?"
                  rows={4}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Lead List <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.4 }}>
                  Select a lead list to use for this campaign. When the campaign is launched,
                  leads in this list will be <strong>reserved and locked</strong> from the general lead pool.
                </p>
                <select
                  value={form.leadListId}
                  onChange={e => setForm(f => ({ ...f, leadListId: e.target.value }))}
                  style={{ width: '100%' }}
                >
                  <option value="">Choose a lead list...</option>
                  {leadLists.map((ll: any) => (
                    <option key={ll.id} value={ll.id}>
                      {ll.name} ({ll.lead_count || 0} leads)
                    </option>
                  ))}
                </select>
                <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Lock size={12} color="var(--muted)" />
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    Need to create a list first? <Link href="/lead-lists" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Go to Lead Lists</Link>
                  </span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Your Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>This replaces <code style={{ background: 'rgba(0,0,0,0.1)', padding: '1px 4px', borderRadius: 3 }}>[Your Name]</code> in your template.</p>
                <input value={form.senderName} onChange={e => setForm(f => ({ ...f, senderName: e.target.value }))} placeholder="e.g., Felet" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Send Interval <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(random delay between messages)</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="number" min={1} value={form.intervalMin} onChange={e => setForm(f => ({ ...f, intervalMin: Math.max(1, parseInt(e.target.value) || 1) }))}
                    style={{ width: 80 }} />
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>to</span>
                  <input type="number" min={1} value={form.intervalMax} onChange={e => setForm(f => ({ ...f, intervalMax: Math.max(1, parseInt(e.target.value) || 1) }))}
                    style={{ width: 80 }} />
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>minutes</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Each message is sent at a random time within this range — makes outreach feel human and avoids spam flags.</p>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Objective (optional)</label>
                <input value={form.objective} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} placeholder="e.g., Generate plumbing leads" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create Campaign</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Command Modal */}
      {showCustomCmd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCustomCmd(null)}>
          <div className="card" style={{ padding: 32, maxWidth: 520, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-heading)' }}>Campaign Command</h2>
            <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', marginBottom: 20 }}>
              Tell the campaign what to do in plain language. E.g. <em>"Send a message to one lead every 30-60 minutes with personalized website offers"</em>
            </p>
            <textarea
              value={customCmd}
              onChange={e => setCustomCmd(e.target.value)}
              placeholder="Describe what this campaign should do..."
              rows={5}
              style={{ width: '100%', resize: 'vertical', fontFamily: 'var(--font-body)' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowCustomCmd(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCustomCommand} disabled={!customCmd.trim()}>
                <MessageSquare size={14} /> Send to Campaign Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="card" style={{ padding: 24 }}>
          <div className="skeleton" style={{ width: '100%', height: 200 }} />
        </div>
      ) : campaigns.length === 0 && !isLoading ? (
        <div className="card">
          <EmptyState
            icon={Target}
            title="No campaigns launched yet"
            description="Create your first campaign to begin outreach and lead generation."
            action={{ label: 'Create Campaign', onClick: () => setShowCreate(true) }}
          />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Channel</th>
                <th>Lead List</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Replies</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c: any) => {
                const leadListId = c.lead_list_id || c.extra_data?.lead_list_id;
                const foundList = leadListId ? leadLists.find(ll => ll.id === leadListId) : null;
                return (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/campaigns/${c.id}`)} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ fontSize: 12, color: 'var(--foreground-secondary)' }}>{c.channel}</td>
                  <td>
                    {foundList ? (
                      <Link href={`/lead-lists/${foundList.id}`} style={{ textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(111,125,79,0.1)', color: '#6F7D4F', fontWeight: 500 }}>
                          <Layers size={11} /> {foundList.name}
                        </span>
                      </Link>
                    ) : leadListId ? (
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}><Lock size={11} /> Reserved</span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>—</span>
                    )}
                  </td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{c.sent_count ?? 0}</td>
                  <td>{c.reply_count ?? 0}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {c.status === 'draft' && (
                        <button className="btn btn-sm btn-primary" onClick={() => { setShowLoading('launch'); launchMut.mutate(c.id, { onSettled: () => setShowLoading(null) }); }}
                          disabled={launchMut.isPending} title="Launch campaign">
                          {launchMut.isPending ? <Loader2 size={12} /> : <Play size={12} />}
                        </button>
                      )}
                      {c.status === 'active' && (
                        <button className="btn btn-sm" onClick={() => pauseMut.mutate(c.id)}
                          disabled={pauseMut.isPending} title="Pause campaign">
                          {pauseMut.isPending ? <Loader2 size={12} /> : <Pause size={12} />}
                        </button>
                      )}
                      <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); router.push(`/campaigns/${c.id}`); }}
                        title="View campaign details">
                        <ChevronDown size={12} />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteMut.mutate(c.id); }}
                        disabled={deleteMut.isPending} title="Delete campaign">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      )}

    </div>
    </>
  );
}
