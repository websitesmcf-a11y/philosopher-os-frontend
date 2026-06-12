'use client';

import { Settings as SettingsIcon, User, Bell, Shield, Palette, Key, Database, Webhook } from 'lucide-react';
import { usePageTitle } from '@/lib/use-page-title';
import Link from 'next/link';

const settingsGroups = [
  {
    title: 'Account',
    items: [
      { label: 'Profile', desc: 'Your personal information and display name', icon: User, href: '/settings/profile' },
      { label: 'Notifications', desc: 'Email, push, and in-app notification preferences', icon: Bell, href: '/settings/notifications' },
      { label: 'Appearance', desc: 'Theme and display settings', icon: Palette, href: '/settings/appearance' },
    ],
  },
  {
    title: 'Organization',
    items: [
      { label: 'Team', desc: 'Manage team members and roles', icon: Shield, href: '/settings/team' },
      { label: 'API Keys', desc: 'Manage API keys and integrations', icon: Key, href: '/settings/api-keys' },
      { label: 'Webhooks', desc: 'Configure outgoing webhooks', icon: Webhook, href: '/settings/webhooks' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Data', desc: 'Data retention and export settings', icon: Database, href: '/settings/data' },
      { label: 'Security', desc: 'Security policies and authentication', icon: Shield, href: '/settings/security' },
    ],
  },
];

export default function SettingsPage() {
  usePageTitle('Settings');
  return (
    <div className="page-content fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
          Manage your account, organization, and system preferences
        </p>
      </div>

      {settingsGroups.map(group => (
        <div key={group.title} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', paddingLeft: 4, fontFamily: 'var(--font-heading)' }}>
            {group.title}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.items.map(item => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{
                    padding: 16, display: 'flex', alignItems: 'center', gap: 14,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}>
                    <div style={{
                      width: 38, height: 38, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: 'var(--accent-subtle)',
                    }}>
                      <Icon size={18} color="var(--accent)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{item.desc}</div>
                    </div>
                    <span style={{ color: 'var(--muted)', fontSize: 18 }}>&rarr;</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
