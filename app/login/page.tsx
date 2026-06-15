'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { LogIn, Loader2, Sparkles } from 'lucide-react';
import { PALETTE } from '@/lib/design-tokens';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(err.detail || 'Request failed');
      }
      const data = await res.json();
      localStorage.setItem('auth_token', data.access_token);
      if (data.user?.name) localStorage.setItem('user_name', data.user.name);
      toast.success(mode === 'login' ? 'Welcome back' : 'Account created');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 24, position: 'relative',
      background: PALETTE.background,
    }}>
      {/* Decorative background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 30% 20%, ${PALETTE.accent}08 0%, transparent 60%),
                     radial-gradient(circle at 70% 80%, ${PALETTE.gold}08 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 440,
        position: 'relative',
        background: '#FFFFFF',
        border: `1px solid var(--border)`,
        borderRadius: 12,
        padding: '48px 40px',
        boxShadow: '0 8px 30px rgba(23,26,33,0.08)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: `linear-gradient(135deg, ${PALETTE.accent}, ${PALETTE.gold})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: '#FFFFFF',
            fontFamily: 'var(--font-heading)',
            margin: '0 auto 20px',
          }}>
            Φ
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 500, margin: 0,
            fontFamily: 'var(--font-heading)',
            color: PALETTE.foreground,
          }}>
            Philosopher OS
          </h1>
          <p style={{
            fontSize: 13, color: 'var(--foreground-secondary)',
            marginTop: 8,
            fontFamily: 'var(--font-body)',
          }}>
            {mode === 'login' ? 'Sign in to the Council' : 'Create your workspace'}
          </p>
        </div>

        {/* Mode tabs */}
        <div style={{
          display: 'flex', borderRadius: 6,
          background: 'var(--surface-inset)',
          marginBottom: 28, padding: 4,
        }}>
          <button
            onClick={() => setMode('login')}
            style={{
              flex: 1, padding: '8px 16px', borderRadius: 4,
              border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
              fontFamily: 'var(--font-body)',
              background: mode === 'login' ? '#FFFFFF' : 'transparent',
              color: mode === 'login' ? PALETTE.accent : 'var(--foreground-secondary)',
              boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            style={{
              flex: 1, padding: '8px 16px', borderRadius: 4,
              border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
              fontFamily: 'var(--font-body)',
              background: mode === 'signup' ? '#FFFFFF' : 'transparent',
              color: mode === 'signup' ? PALETTE.accent : 'var(--foreground-secondary)',
              boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{
              fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6,
              color: 'var(--foreground-secondary)',
              fontFamily: 'var(--font-label)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@agency.com"
              required
              autoFocus
            />
          </div>
          <div>
            <label style={{
              fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6,
              color: 'var(--foreground-secondary)',
              fontFamily: 'var(--font-label)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label style={{
                fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6,
                color: 'var(--foreground-secondary)',
                fontFamily: 'var(--font-label)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Workspace Name
              </label>
              <input
                type="text"
                placeholder="My Agency"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{
              width: '100%', marginTop: 8,
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
            ) : (
              <><LogIn size={18} /> {mode === 'login' ? 'Sign In' : 'Create Account'}</>
            )}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: 24,
          fontSize: 12, color: 'var(--muted)',
        }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: PALETTE.accent, fontWeight: 600, fontSize: 12,
            }}
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
          {mode === 'login' && (
            <>
              {' '}or{' '}
              <Link
                href="/signup"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: PALETTE.accent, fontWeight: 600, fontSize: 12,
                  textDecoration: 'none',
                }}
              >
                Create Account
              </Link>
            </>
          )}
        </p>

        {/* Dev login hint */}
        <div style={{
          marginTop: 20, padding: '10px 14px',
          background: PALETTE.gold + '10',
          border: `1px solid ${PALETTE.gold}30`,
          borderRadius: 6,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Sparkles size={14} color={PALETTE.gold} />
          <span style={{ fontSize: 11, color: 'var(--foreground-secondary)' }}>
            Dev: use <code style={{
              background: 'rgba(0,0,0,0.05)', padding: '1px 5px',
              borderRadius: 3, fontSize: 11, fontWeight: 600,
            }}>admin@socrates.ai</code> / <code style={{
              background: 'rgba(0,0,0,0.05)', padding: '1px 5px',
              borderRadius: 3, fontSize: 11, fontWeight: 600,
            }}>admin123</code>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
