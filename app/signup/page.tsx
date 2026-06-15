'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { PALETTE } from '@/lib/design-tokens';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams?.get('invite');
  const inviteRole = searchParams?.get('role');

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<{ role: string; email?: string } | null>(null);

  // Validate invite token on mount
  useEffect(() => {
    if (inviteToken) {
      fetch(`${API_BASE}/auth/invite/${inviteToken}`)
        .then(r => r.json())
        .then(data => {
          if (data.valid) {
            setInviteInfo({ role: data.role, email: data.email });
            if (data.email) setEmail(data.email);
          }
        })
        .catch(() => {});
    }
  }, [inviteToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Sign up (with optional invite token)
      const body: any = { email, password, name: displayName || undefined };
      if (inviteToken) body.invite_token = inviteToken;
      if (inviteRole) body.invite_role = inviteRole;

      const signupRes = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!signupRes.ok) {
        const err = await signupRes.json().catch(() => ({ detail: 'Signup failed' }));
        throw new Error(err.detail || 'Signup failed');
      }

      // Step 2: Auto-login
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        const err = await loginRes.json().catch(() => ({ detail: 'Auto-login failed' }));
        throw new Error(err.detail || 'Auto-login failed');
      }

      const data = await loginRes.json();
      localStorage.setItem('auth_token', data.access_token);
      if (data.user?.name) localStorage.setItem('user_name', data.user.name);

      toast.success('Account created successfully!');
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
            Create Account
          </h1>
          {inviteInfo && (
            <div style={{
              marginTop: 16, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(201,162,77,0.1)', border: '1px solid rgba(201,162,77,0.2)',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
            }}>
              <CheckCircle size={16} color="#C9A24D" />
              <span>You've been invited as <strong style={{ textTransform: 'capitalize' }}>{inviteInfo.role}</strong></span>
            </div>
          )}
          <p style={{
            fontSize: 13, color: 'var(--foreground-secondary)',
            marginTop: 8,
            fontFamily: 'var(--font-body)',
          }}>
            Join the Council of Philosophers
          </p>
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
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your display name"
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
              placeholder="Enter your password (min 6 characters)"
              required
              minLength={6}
            />
          </div>
          <div>
            <label style={{
              fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6,
              color: 'var(--foreground-secondary)',
              fontFamily: 'var(--font-label)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              minLength={6}
            />
          </div>
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
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating account...</>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Link to Login */}
        <p style={{
          textAlign: 'center', marginTop: 24,
          fontSize: 12, color: 'var(--muted)',
        }}>
          Already have an account?{' '}
          <Link
            href="/login"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: PALETTE.accent, fontWeight: 600, fontSize: 12,
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
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
