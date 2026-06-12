'use client';

import { Key, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ApiKeysSettingsPage() {
  return (
    <div className="page-content fade-in">
      <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Settings
      </Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>API Keys</h1>
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
            Manage API keys and integrations
          </p>
        </div>
        <button className="btn btn-primary"><Plus size={16} /> Generate Key</button>
      </div>
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <Key size={32} color="var(--muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
        <p style={{ color: 'var(--muted)' }}>API key management coming soon</p>
      </div>
    </div>
  );
}
