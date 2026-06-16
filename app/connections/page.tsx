'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { IntegrationCard } from '@/components/ui/integration-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ConnectModal } from '@/components/ui/connect-modal';
import { toast } from 'sonner';
import {
  Plug, Database, MapPin, MessageCircle, Mail, Calendar,
  FileText, Globe, CreditCard, BookOpen
} from 'lucide-react';

const INTEGRATIONS = [
  {
    name: 'Supabase',
    description: 'Primary database — stores all CRM data, agent memory, and user accounts.',
    icon: Database,
    provider: 'supabase',
    status: 'connected' as const,
    lastSync: 'Just now',
    features: ['Database', 'Auth', 'RLS', 'Vector Storage'],
  },
  {
    name: 'Google Maps / Places',
    description: 'Lead discovery — search businesses by industry and location.',
    icon: MapPin,
    provider: 'google-maps',
    status: 'disconnected' as const,
    features: ['Place Search', 'Business Details', 'Reviews', 'Photos'],
  },
  {
    name: 'WhatsApp Business',
    description: 'Messaging — send and receive WhatsApp messages with leads and clients.',
    icon: MessageCircle,
    provider: 'whatsapp',
    status: 'disconnected' as const,
    features: ['Send Messages', 'Receive Replies', 'Templates', 'Media'],
  },
  {
    name: 'Email / SMTP',
    description: 'Email outreach and inbox sync for campaigns and conversations.',
    icon: Mail,
    provider: 'smtp',
    status: 'disconnected' as const,
    features: ['Send Email', 'Inbox Sync', 'Templates', 'Tracking'],
  },
  {
    name: 'Google Calendar',
    description: 'Two-way calendar sync for tasks, meetings, and schedules.',
    icon: Calendar,
    provider: 'google-calendar',
    status: 'disconnected' as const,
    features: ['Event Sync', 'Meetings', 'Reminders', 'Availability'],
  },
  {
    name: 'CSV Import / Export',
    description: 'Import leads from CSV files and export CRM data.',
    icon: FileText,
    provider: 'csv',
    status: 'connected' as const,
    features: ['Import Leads', 'Export Data', 'Mapping', 'Validation'],
  },
  {
    name: 'Obsidian',
    description: 'Markdown knowledge sync — export/import notes to Obsidian vaults.',
    icon: BookOpen,
    provider: 'obsidian',
    status: 'disconnected' as const,
    features: ['Markdown Export', 'Markdown Import', 'Vault Sync'],
  },
  {
    name: 'Web Scraper',
    description: 'Collect business data from websites when Google Maps is insufficient.',
    icon: Globe,
    provider: 'web-scraper',
    status: 'disconnected' as const,
    features: ['Website Scraping', 'Content Extraction', 'Rate Limited'],
  },
  {
    name: 'Instagram',
    description: 'Social media — post content, read messages, and engage with followers.',
    icon: MessageCircle,
    provider: 'instagram',
    status: 'disconnected' as const,
    features: ['Direct Messages', 'Comments', 'Content Posting', 'Analytics'],
  },
  {
    name: 'Facebook',
    description: 'Social media — manage pages, respond to messages and comments.',
    icon: MessageCircle,
    provider: 'facebook',
    status: 'disconnected' as const,
    features: ['Page Messaging', 'Comments', 'Posting', 'Page Insights'],
  },
  {
    name: 'Payment / Finance',
    description: 'Track payments, invoices, and financial transactions.',
    icon: CreditCard,
    provider: 'finance',
    status: 'disconnected' as const,
    features: ['Payments', 'Invoices', 'Reporting'],
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://jet-obligate-desktop.ngrok-free.dev/api/v1';

// Maps a backend connection provider name to the UI provider key in INTEGRATIONS.
const BACKEND_TO_UI: Record<string, string> = {
  email: 'smtp',
  google_calendar: 'google-calendar',
  whatsapp: 'whatsapp',
  facebook: 'facebook',
  instagram: 'instagram',
  obsidian: 'obsidian',
  'google-maps': 'google-maps',
  'web-scraper': 'web-scraper',
  csv: 'csv',
  finance: 'finance',
};

export default function ConnectionsPage() {
  const router = useRouter();
  const [liveStatuses, setLiveStatuses] = useState<Record<string, string>>({});
  const [modalProvider, setModalProvider] = useState<string | null>(null);

  // Fetch live statuses for integrations that can be checked in real-time.
  const fetchLive = async () => {
    const updates: Record<string, string> = {};
    try {
      // WhatsApp live check (reflects the bridge link state immediately).
      const wa = await fetch(`${API_BASE}/connections/whatsapp/status`).then(r => r.json());
      updates['whatsapp'] = wa.connected ? 'connected' : 'disconnected';
    } catch {}
    try {
      // Full registry status — marks any saved+connected provider.
      const data = await fetch(`${API_BASE}/connections`).then(r => r.json());
      for (const conn of data.connections || []) {
        const uiKey = BACKEND_TO_UI[conn.provider];
        if (uiKey) updates[uiKey] = conn.status;
      }
    } catch {}
    // Locally-stored providers (no backend route) count as connected once saved.
    if (typeof window !== 'undefined') {
      for (const p of ['google-maps', 'web-scraper', 'finance']) {
        if (localStorage.getItem(`connection:${p}`)) updates[p] = 'connected';
      }
    }
    setLiveStatuses(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 15000); // refresh every 15s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Merge live statuses with hardcoded ones
  const mergedIntegrations = INTEGRATIONS.map(i => ({
    ...i,
    status: (liveStatuses[i.provider] || i.status) as 'connected' | 'disconnected' | 'error' | 'setup_required',
  }));

  // Get current user name for display
  const currentUserName = typeof window !== 'undefined' ? localStorage.getItem('user_name') : null;

  // Track which integrations the CURRENT user connected vs someone else
  const [myIntegrations, setMyIntegrations] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('my_connections');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const connectedCount = mergedIntegrations.filter(i => i.status === 'connected').length;

  const handleConnect = (provider: string) => {
    // Finance has its own dedicated page; everything else opens a Connect modal.
    if (provider === 'finance') {
      router.push('/finance');
      return;
    }
    // WhatsApp shows setup tutorial first
    if (provider === 'whatsapp') {
      setModalProvider('whatsapp');
      return;
    }
    setModalProvider(provider);
  };

  const handleConfigure = (provider: string) => {
    handleConnect(provider);
  };

  // Called by the modal after a successful save: refetch live status and
  // optimistically mark the provider connected.
  const handleConnected = (provider: string) => {
    setLiveStatuses(prev => ({ ...prev, [provider]: 'connected' }));
    // Track that THIS user connected this integration
    setMyIntegrations(prev => {
      const next = { ...prev, [provider]: true };
      try { localStorage.setItem('my_connections', JSON.stringify(next)); } catch {}
      return next;
    });
    toast.success(`${provider} connected`);
    fetchLive();
  };

  const handleDisconnect = (provider: string) => {
    toast.success(`${provider} disconnected`);
  };

  const modalIntegration = modalProvider
    ? INTEGRATIONS.find(i => i.provider === modalProvider)
    : null;

  return (
    <div className="page-content">
      <PageHeader
        title="Integrations"
        description="Connect your tools to activate live agent workflows"
        icon={Plug}
        iconColor="#123C69"
      />

      <div className="card" style={{
        padding: '14px 20px', marginBottom: 28,
        background: 'rgba(18, 60, 105, 0.03)',
        borderLeft: '3px solid var(--accent)',
        display: 'flex', alignItems: 'center', gap: 12,
        fontSize: 13,
      }}>
        <Plug size={16} color="var(--accent)" />
        <span style={{ color: 'var(--foreground-secondary)' }}>
          <strong style={{ color: 'var(--foreground)' }}>Connected:</strong> {connectedCount} of {INTEGRATIONS.length} integrations
        </span>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 20,
      }}>
        {mergedIntegrations.map(integration => (
          <IntegrationCard
            key={integration.provider}
            name={integration.name}
            description={integration.description}
            icon={integration.icon}
            status={integration.status}
            provider={integration.provider}
            lastSync={integration.lastSync}
            features={integration.features}
            connectedBy={integration.status === 'connected' ? (myIntegrations[integration.provider] ? (currentUserName || 'You') : 'Admin') : undefined}
            onConnect={integration.status === 'disconnected' ? () => handleConnect(integration.provider) : undefined}
            onConfigure={integration.status === 'disconnected' ? () => handleConfigure(integration.provider) : undefined}
            onDisconnect={integration.status === 'connected' ? () => handleDisconnect(integration.provider) : undefined}
          />
        ))}
      </div>

      {modalIntegration && (
        <ConnectModal
          open={modalProvider !== null}
          uiProvider={modalIntegration.provider}
          title={modalIntegration.name}
          onClose={() => setModalProvider(null)}
          onConnected={handleConnected}
        />
      )}
    </div>
  );
}

