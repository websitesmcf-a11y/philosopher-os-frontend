'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listCampaigns, createCampaign, launchCampaign, pauseCampaign, deleteCampaign } from '@/lib/api-client';
import { Plus, Play, Pause, Trash2 } from 'lucide-react';
import { usePageTitle } from '@/lib/use-page-title';
import { CreateDialog } from '@/components/create-dialog';
import { CampaignOrbit } from '@/components/campaign-orbit';

const STATUS_COLOR: Record<string, string> = {
  draft: '#94a3b8', active: '#22c55e', paused: '#f59e0b',
  completed: 'var(--accent)', cancelled: '#ef4444',
};

export default function CampaignsPage() {
  usePageTitle('Campaigns');
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => listCampaigns({ page: 1, page_size: 50 }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['campaigns'] });

  const createMut = useMutation({
    mutationFn: (values: Record<string, string>) => createCampaign({
      name: values.name,
      channel: values.channel,
      industry: values.industry || undefined,
      message_template: values.message_template,
      target_count: values.target_count ? Number(values.target_count) : 0,
    }),
    onSuccess: () => {
      toast.success('Campaign created as draft');
      setDialogOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(`Failed to create campaign: ${e.message}`),
  });

  const launchMut = useMutation({
    mutationFn: (id: string) => launchCampaign(id),
    onSuccess: () => { toast.success('Campaign launched'); invalidate(); },
    // 409 from the API means the channel integration is not connected
    onError: (e: Error) => toast.error(e.message),
  });

  const pauseMut = useMutation({
    mutationFn: (id: string) => pauseCampaign(id),
    onSuccess: () => { toast.success('Campaign paused'); invalidate(); },
    onError: (e: Error) => toast.error(`Failed to pause: ${e.message}`),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => { toast.success('Campaign deleted'); invalidate(); },
    onError: (e: Error) => toast.error(`Failed to delete: ${e.message}`),
  });

  const campaigns = data?.items ?? [];

  return (
    <div className="page-content page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Campaigns</h1>
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
            Outreach and marketing campaigns
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setDialogOpen(true)}>
          <Plus size={16} /> New Campaign
        </button>
      </div>

      <CreateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="New Campaign"
        submitting={createMut.isPending}
        onSubmit={async values => { await createMut.mutateAsync(values); }}
        fields={[
          { name: 'name', label: 'Name', type: 'text', placeholder: 'Campaign name', required: true },
          {
            name: 'channel', label: 'Channel', type: 'select', required: true,
            options: [
              { label: 'WhatsApp', value: 'whatsapp' },
              { label: 'Email', value: 'email' },
              { label: 'Facebook', value: 'facebook' },
              { label: 'Instagram', value: 'instagram' },
            ],
          },
          { name: 'industry', label: 'Target industry', type: 'text', placeholder: 'e.g. plumbing, dental' },
          { name: 'message_template', label: 'Message template', type: 'textarea', placeholder: 'Hi {{name}}, ...', required: true },
          { name: 'target_count', label: 'Target count', type: 'number', placeholder: '0' },
        ]}
      />

      {/* Every campaign appears as a node in the orbital view — click one to inspect */}
      {!isLoading && <CampaignOrbit campaigns={campaigns} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {isLoading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="etched-surface" style={{ padding: 20, height: 160 }}>
            <div style={{ width: '70%', height: 16, background: 'var(--border)', marginBottom: 12 }} />
            <div style={{ width: '40%', height: 12, background: 'var(--border)', marginBottom: 8 }} />
            <div style={{ width: '60%', height: 12, background: 'var(--border)' }} />
          </div>
        ))}
        {!isLoading && campaigns.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
            No campaigns yet — create one with &ldquo;New Campaign&rdquo;
          </div>
        )}
        {campaigns.map(campaign => (
          <div key={campaign.id} className="etched-surface" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>{campaign.name}</h3>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 0', textTransform: 'capitalize' }}>
                  {campaign.channel}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(campaign.status === 'draft' || campaign.status === 'paused') && (
                  <button
                    className="btn btn-ghost" style={{ padding: '4px 8px' }} title="Launch"
                    disabled={launchMut.isPending}
                    onClick={() => launchMut.mutate(campaign.id)}
                  >
                    <Play size={14} />
                  </button>
                )}
                {campaign.status === 'active' && (
                  <button
                    className="btn btn-ghost" style={{ padding: '4px 8px' }} title="Pause"
                    disabled={pauseMut.isPending}
                    onClick={() => pauseMut.mutate(campaign.id)}
                  >
                    <Pause size={14} />
                  </button>
                )}
                <button
                  className="btn btn-ghost" style={{ padding: '4px 8px' }} title="Delete"
                  disabled={deleteMut.isPending}
                  onClick={() => { if (confirm(`Delete campaign "${campaign.name}"?`)) deleteMut.mutate(campaign.id); }}
                >
                  <Trash2 size={14} color="#ef4444" />
                </button>
              </div>
            </div>
            <span className="badge" style={{
              background: `${STATUS_COLOR[campaign.status]}15`,
              color: STATUS_COLOR[campaign.status],
              marginBottom: 12,
            }}>
              {campaign.status}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Sent</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{campaign.sent_count.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Replies</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{campaign.reply_count}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Conversions</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{campaign.conversion_count}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Target</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{campaign.target_count.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
