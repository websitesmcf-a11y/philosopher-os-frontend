'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', padding: 40, textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56,
        background: 'rgba(139,32,32,0.08)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <AlertTriangle size={28} color="var(--error)" />
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Something went wrong</h1>
      <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', margin: '0 0 24px', maxWidth: 400 }}>
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button className="btn btn-primary" onClick={reset} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <RefreshCw size={16} />
        Try Again
      </button>
    </div>
  );
}
