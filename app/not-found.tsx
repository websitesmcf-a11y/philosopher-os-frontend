'use client';

import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', padding: 40, textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56,
        background: 'var(--accent-subtle)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <Search size={28} color="var(--accent)" />
      </div>
      <h1 style={{ fontSize: 48, fontWeight: 800, margin: '0 0 4px', color: 'var(--accent)', letterSpacing: '-0.04em' }}>404</h1>
      <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Page not found</p>
      <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', margin: '0 0 24px' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <button className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Home size={16} />
          Back to Dashboard
        </button>
      </Link>
    </div>
  );
}
