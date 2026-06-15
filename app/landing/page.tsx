'use client';

import Link from 'next/link';
import { PALETTE } from '@/lib/design-tokens';
import { Brain, Zap, Users, Target, Shield, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: PALETTE.background }}>
      {/* Hero */}
      <header style={{
        padding: '24px 48px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${PALETTE.accent}, ${PALETTE.gold})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: '#FFFFFF',
            fontFamily: 'var(--font-heading)',
          }}>Φ</div>
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)', color: PALETTE.foreground }}>
            Philosopher OS
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login"><button className="btn btn-sm">Sign In</button></Link>
          <Link href="/login?mode=signup"><button className="btn btn-sm btn-primary">Get Started</button></Link>
        </div>
      </header>

      <section style={{
        textAlign: 'center', padding: '100px 24px 80px',
        maxWidth: 720, margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 14px', borderRadius: 20,
          background: PALETTE.gold + '12',
          border: `1px solid ${PALETTE.gold}30`,
          marginBottom: 24, fontSize: 13, color: PALETTE.gold, fontWeight: 600,
        }}>
          <Sparkles size={14} /> AI-Powered CRM
        </div>
        <h1 style={{
          fontSize: 56, fontWeight: 500, lineHeight: 1.15,
          fontFamily: 'var(--font-heading)',
          marginBottom: 20,
          background: `linear-gradient(135deg, ${PALETTE.foreground}, ${PALETTE.accent})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Your Agency,<br />Run by Philosophers
        </h1>
        <p style={{
          fontSize: 18, color: 'var(--foreground-secondary)',
          maxWidth: 540, margin: '0 auto 36px',
          lineHeight: 1.6,
        }}>
          An AI-powered CRM where Greek philosophers strategize and Greek gods execute.
          Manage leads, campaigns, clients, and finance — all through intelligent agents.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/login?mode=signup">
            <button className="btn btn-primary btn-lg">
              Start Free <ArrowRight size={18} />
            </button>
          </Link>
          <Link href="/login">
            <button className="btn btn-lg">View Demo</button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{
        maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
      }}>
        {[
          { icon: Brain, title: 'Philosopher Council', desc: '10 specialized AI agents that think, plan, judge, and govern your agency operations.', color: PALETTE.accent },
          { icon: Zap, title: 'God Execution Agents', desc: '5 powerful titan agents that execute missions at scale — lead gen, outreach, cleanup, and more.', color: PALETTE.gold },
          { icon: Users, title: 'CRM That Works', desc: 'Full lead management, client tracking, campaign orchestration, and pipeline management.', color: '#6F7D4F' },
          { icon: Target, title: 'Campaign Automation', desc: 'Launch multi-step outreach campaigns with AI-personalized messages across channels.', color: '#8B2020' },
          { icon: Shield, title: 'Data Integrity', desc: 'Built-in cleanup, deduplication, and validation — no fake data, no broken statuses.', color: '#171A21' },
          { icon: Sparkles, title: 'Honest & Real', desc: 'No fake revenue, no fake leads, no fake analytics. What you see is what you have.', color: '#7B5EA7' },
        ].map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} style={{
              padding: 28,
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 12,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: f.color + '12',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Icon size={22} color={f.color} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-heading)', marginBottom: 8 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          );
        })}
      </section>

      {/* CTA */}
      <section style={{
        textAlign: 'center', padding: '80px 24px',
        background: `linear-gradient(135deg, ${PALETTE.accent}08, ${PALETTE.gold}08)`,
      }}>
        <h2 style={{
          fontSize: 36, fontWeight: 500, fontFamily: 'var(--font-heading)',
          marginBottom: 12, color: PALETTE.foreground,
        }}>
          Ready to Let Philosophers Run Your Agency?
        </h2>
        <p style={{
          fontSize: 16, color: 'var(--foreground-secondary)',
          marginBottom: 28,
        }}>
          Start with zero data, real agents, and honest defaults.
        </p>
        <Link href="/login?mode=signup">
          <button className="btn btn-primary btn-lg">
            Get Started Free <ArrowRight size={18} />
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px', textAlign: 'center',
        fontSize: 13, color: 'var(--muted)',
        borderTop: '1px solid var(--border)',
      }}>
        Philosopher OS — Built with real agents, not fake demos.
      </footer>
    </div>
  );
}
