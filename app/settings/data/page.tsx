'use client';

import { Database, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DataSettingsPage() {
  return (
    <div className="page-content fade-in">
      <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Settings
      </Link>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Data</h1>
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
          Data retention and export settings
        </p>
      </div>
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <Database size={32} color="var(--muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
        <p style={{ color: 'var(--muted)' }}>Data settings coming soon</p>
      </div>
    </div>
  );
}
