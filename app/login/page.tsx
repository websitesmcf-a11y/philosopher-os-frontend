'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { PALETTE } from '@/lib/design-tokens';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-a93f0.up.railway.app/api/v1';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      display: 'flex', minHeight: '100vh', position: 'relative',
      background: 'var(--ivory-1)',
    }}>
      {/* Left panel — brand hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 56px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Marble background image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/assets/philosopher-os/backgrounds/login-bg.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.55,
        }} />
        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(246,240,227,0.85) 0%, rgba(18,60,105,0.35) 100%)',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Image
            src="/assets/philosopher-os/logo/temple-emblem.svg"
            alt="Philosopher OS"
            width={48}
            height={48}
          />
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--navy)', letterSpacing: '0.02em', lineHeight: 1 }}>
              PHILOSOPHER OS
            </div>
            <div style={{ fontFamily: 'var(--font-label)', fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--gold)', marginTop: 4 }}>
              Ultimate AI CRM
            </div>
          </div>
        </div>

        {/* Hero copy */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: 52, fontWeight: 500,
            color: 'var(--navy)', lineHeight: 1.15, letterSpacing: '-0.01em',
            marginBottom: 20,
          }}>
            Think with<br />philosophers.
          </h1>
          <p style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 28, color: 'var(--gold)', lineHeight: 1.3,
            marginBottom: 32,
          }}>
            Execute with gods.
          </p>
          <p style={{ fontSize: 16, color: 'var(--ink-2)', maxWidth: 380, lineHeight: 1.7 }}>
            The ultimate AI-powered CRM for lead generation, outreach, campaigns, tasks, and business growth.
          </p>

          {/* Feature chips */}
          <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
            {['Strategic Minds', 'Execution Gods', 'Your Data, Private'].map((f) => (
              <div key={f} style={{
                padding: '8px 16px',
                background: 'rgba(18, 60, 105, 0.08)',
                border: '1px solid rgba(18, 60, 105, 0.15)',
                borderRadius: 'var(--radius-pill)',
                fontSize: 13, fontWeight: 500,
                color: 'var(--navy)',
                fontFamily: 'var(--font-body)',
              }}>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {['Enterprise Security', 'Your Data, Your Control', 'Built for Growth'].map((b) => (
            <div key={b} style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-label)', letterSpacing: '0.04em' }}>
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: 480, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px',
        background: 'var(--navy-deep)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Celestial glow */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-20%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,94,167,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,162,77,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 2 }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: 28,
            color: '#fff', fontWeight: 500, marginBottom: 6, lineHeight: 1.2,
          }}>
            Welcome back.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 32 }}>
            Sign in to continue to your command center.
          </p>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 0,
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            marginBottom: 28,
          }}>
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '10px 0',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600,
                  color: mode === m ? '#fff' : 'rgba(255,255,255,0.45)',
                  borderBottom: mode === m ? '2px solid var(--gold)' : '2px solid transparent',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-body)',
                  marginBottom: -1,
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch(`${API_BASE}/auth/google/url`);
                if (!res.ok) throw new Error('Google auth not configured');
                const data = await res.json();
                window.location.href = data.auth_url;
              } catch (err) {
                toast.error('Google sign-in not available — save Calendar credentials in Connections first');
              }
            }}
            style={{
              width: '100%', padding: '12px', marginBottom: 16,
              background: '#fff', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 'var(--radius)',
              fontSize: 14, fontWeight: 600, color: '#333',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'var(--font-body)',
              transition: 'opacity 0.2s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign in with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="rgba(255,255,255,0.35)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                required
                autoFocus
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '12px 14px 12px 42px',
                  fontSize: 14, width: '100%',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(201,162,77,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="rgba(255,255,255,0.35)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '12px 42px 12px 42px',
                  fontSize: 14, width: '100%',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(201,162,77,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 2 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', marginTop: 8,
                padding: '14px',
                background: 'linear-gradient(180deg, var(--navy-bright), var(--navy))',
                color: '#fff', border: '1px solid var(--navy)',
                borderRadius: 'var(--radius)',
                fontSize: 15, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 2px 12px rgba(18,60,105,0.4)',
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.02em',
                transition: 'opacity 0.2s',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> {mode === 'login' ? 'Signing in…' : 'Creating…'}</>
                : <>{mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'} <ArrowRight size={16} /></>
              }
            </button>

            {/* Forgot */}
            {mode === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-bright)', fontSize: 13, fontFamily: 'var(--font-body)' }}>
                  Forgot password?
                </button>
              </div>
            )}
          </form>

          {/* Trust note */}
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', marginTop: 28, textAlign: 'center', lineHeight: 1.6 }}>
            Your CRM data stays private to your account. We never share your data.
          </p>

          {/* Dev hint */}
          <div style={{
            marginTop: 16, padding: '10px 14px',
            background: 'rgba(201,162,77,0.10)',
            border: '1px solid rgba(201,162,77,0.25)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
              Dev: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>admin@socrates.ai</code> / <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>admin123</code>
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.30) !important; }
      `}</style>
    </div>
  );
}
