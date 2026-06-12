'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogIn, Loader2 } from 'lucide-react';
import { WavesShader } from '@/components/ui/waves-shader';
import { MetalButton } from '@/components/ui/liquid-glass-button';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(err.detail || 'Login failed');
      }
      const data = await res.json();
      localStorage.setItem('auth_token', data.access_token);
      if (data.user?.name) localStorage.setItem('user_name', data.user.name);
      toast.success('Logged in successfully');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 24, position: 'relative', overflow: 'hidden',
      background: 'var(--background)',
    }}>
      {/* Ambient wave field — etched gold lines on travertine */}
      <WavesShader color="#D4AF37" opacity={0.22} speed={0.35} amplitude={0.8} />

      <div className="etched-surface" style={{
        width: '100%', maxWidth: 420, padding: 'var(--space-5) var(--space-4)',
        position: 'relative', boxShadow: 'var(--shadow-museum)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{
            width: 48, height: 48,
            background: 'linear-gradient(135deg, #735C00, #D4AF37)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 600, color: 'white',
            fontFamily: 'var(--font-heading)',
            margin: '0 auto 16px',
          }}>
            Φ
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 500, margin: 0,
            fontFamily: 'var(--font-heading)', letterSpacing: 'var(--letter-spacing-heading)',
          }}>
            Philosopher OS
          </h1>
          <p style={{
            fontSize: 12, color: 'var(--foreground-secondary)', marginTop: 6,
            fontFamily: 'var(--font-label)', textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            Sign in to the Council
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6,
              color: 'var(--foreground-secondary)', fontFamily: 'var(--font-label)',
              textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)',
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
              fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6,
              color: 'var(--foreground-secondary)', fontFamily: 'var(--font-label)',
              textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)',
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
          <MetalButton type="submit" variant="gold" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <LogIn size={16} />}
            {loading ? 'Signing in...' : 'Sign In'}
          </MetalButton>
        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
