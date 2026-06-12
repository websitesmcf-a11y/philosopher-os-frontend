'use client';

import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SecuritySettingsPage() {
  return (
    <div className="page-content fade-in">
      <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Settings
      </Link>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Security</h1>
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
          Security policies and authentication
        </p>
      </div>
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <Shield size={32} color="var(--muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
        <p style={{ color: 'var(--muted)' }}>Security settings coming soon</p>
      </div>
    </div>
  );
}
