'use client';

import { Camera, Mail, Megaphone, MessageCircle, ThumbsUp } from 'lucide-react';
import RadialOrbitalTimeline, { type TimelineItem } from '@/components/ui/radial-orbital-timeline';
import type { Campaign } from '@/lib/api-client';

const CHANNEL_ICON: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  email: Mail,
  facebook: ThumbsUp,
  instagram: Camera,
};

function statusOf(c: Campaign): TimelineItem['status'] {
  if (c.status === 'completed') return 'completed';
  if (c.status === 'active') return 'in-progress';
  return 'pending';
}

function energyOf(c: Campaign): number {
  if (c.target_count > 0) {
    return Math.min(100, Math.round((c.sent_count / c.target_count) * 100));
  }
  if (c.status === 'completed') return 100;
  if (c.status === 'active') return 50;
  return 15;
}

function dateOf(c: Campaign): string {
  if (!c.created_at) return '';
  try {
    return new Date(c.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

/** Every campaign becomes a node orbiting the center; same-channel campaigns
 *  are linked as related nodes. */
export function campaignsToTimeline(campaigns: Campaign[]): TimelineItem[] {
  return campaigns.map((c, i) => ({
    id: i + 1,
    title: c.name.length > 18 ? `${c.name.slice(0, 17)}…` : c.name,
    date: dateOf(c),
    content:
      `${c.channel} campaign — ${c.sent_count}/${c.target_count || '∞'} sent, ` +
      `${c.reply_count} replies, ${c.conversion_count} conversions.` +
      (c.industry ? ` Target: ${c.industry}.` : ''),
    category: c.channel,
    icon: CHANNEL_ICON[c.channel] ?? Megaphone,
    relatedIds: campaigns
      .map((other, j) => ({ other, id: j + 1 }))
      .filter(({ other, id }) => id !== i + 1 && other.channel === c.channel)
      .map(({ id }) => id),
    status: statusOf(c),
    energy: energyOf(c),
  }));
}

export function CampaignOrbit({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) return null;
  return (
    <div style={{ marginBottom: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
      <RadialOrbitalTimeline
        timelineData={campaignsToTimeline(campaigns)}
        className="h-[540px]"
      />
    </div>
  );
}
