'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '@/lib/api-client';
import { StatCard } from '@/components/ui/stat-card';
import { PHILOSOPHERS, GODS } from '@/lib/design-tokens';
import { getPortrait } from '@/lib/philosopher-assets';
import {
  Brain, Users, Building2, Wallet, Target, Landmark,
  CheckSquare, Zap, Sparkles, Send, Radio, BarChart3,
  MessageSquare, Cpu, ArrowRight,
} from 'lucide-react';

const TOP_PHILOSOPHERS = Object.entries(PHILOSOPHERS).slice(0, 10);
const TOP_GODS = Object.entries(GODS);

export default function DashboardPage() {
  const [askValue, setAskValue] = useState('');
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics,
    retry: 1,
  });

  const totalLeads = metrics?.total_leads ?? 0;
  const activeClients = metrics?.total_clients ?? 0;
  const activeCampaigns = metrics?.active_campaigns ?? 0;
  const revenue = metrics?.mrr ?? 0;
  const tasksPending = metrics?.tasks_pending ?? 0;

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const userName = typeof window !== 'undefined' ? localStorage.getItem('user_name') || 'Commander' : 'Commander';

  const kpis = [
    { label: 'Leads',            value: totalLeads,                         icon: Users,       color: '#123C69', sub: totalLeads === 0 ? 'No leads yet' : `${totalLeads} collected` },
    { label: 'Clients',          value: activeClients,                       icon: Building2,   color: '#6F7D4F', sub: activeClients === 0 ? 'No clients yet' : `${activeClients} active` },
    { label: 'Active Campaigns', value: activeCampaigns,                     icon: Target,      color: '#7B5EA7', sub: activeCampaigns === 0 ? 'No campaigns' : `${activeCampaigns} running` },
    { label: 'Revenue Logged',   value: `R${revenue.toLocaleString()}`,      icon: Wallet,      color: '#C9A24D', sub: revenue === 0 ? 'No revenue yet' : 'This month' },
    { label: 'Tasks Due',        value: tasksPending,                        icon: CheckSquare, color: '#8B2020', sub: tasksPending === 0 ? 'Nothing due' : `${tasksPending} pending` },
    { label: 'Agent Runs',       value: 0,                                   icon: Cpu,         color: '#2B5F6B', sub: 'No runs yet' },
  ];

  const MISSION_ACTIONS = [
    { label: 'Get 100 plumbers in Johannesburg', icon: '🔧' },
    { label: 'Analyse my business', icon: '📊' },
    { label: 'Create outreach messages', icon: '✉️' },
    { label: "Show today's priorities", icon: '⚡' },
  ];

  return (
    <div className="page-content page-bg-command fade-in">

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 500, fontFamily: 'var(--font-heading)', color: 'var(--ink-1)', letterSpacing: '-0.01em' }}>
            {timeGreeting}, {userName}. <span style={{ fontFamily: 'var(--font-body)' }}>👋</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', marginTop: 4 }}>Your CRM is ready. {activeCampaigns === 0 ? 'No live campaigns yet.' : `${activeCampaigns} campaign${activeCampaigns > 1 ? 's' : ''} running.`}</p>
        </div>
        <div style={{
          padding: '14px 20px', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-gold)',
          background: 'var(--gold-subtle)',
          maxWidth: 280,
        }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-1)', lineHeight: 1.5 }}>
            "Think with philosophers. Execute with gods."
          </span>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 24 }}>
        {kpis.map(k => (
          <StatCard key={k.label} label={k.label} value={k.value} icon={k.icon} color={k.color} subtitle={k.sub} />
        ))}
      </div>

      {/* ── Main 3-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr 0.9fr', gap: 18, marginBottom: 24 }}>

        {/* Strategic Minds */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Landmark size={18} color="var(--navy)" />
              <h3 style={{ fontSize: 17, fontFamily: 'var(--font-heading)', color: 'var(--ink-1)' }}>Strategic Minds</h3>
            </div>
            <Link href="/agents" style={{ fontSize: 12, color: 'var(--navy)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, rowGap: 18 }}>
            {TOP_PHILOSOPHERS.map(([key, agent]) => {
              const src = getPortrait(key);
              const isActive = key === 'plato';
              return (
                <Link key={key} href={`/chat?agent=${key}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    {src ? (
                      <Image
                        src={src} alt={agent.name} width={46} height={46}
                        style={{
                          borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 20%',
                          border: `2px solid ${isActive ? agent.color : 'var(--border-strong)'}`,
                          boxShadow: isActive ? `0 0 0 3px ${agent.color}22` : 'none',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 46, height: 46, borderRadius: '50%',
                        background: agent.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 700, color: '#fff',
                        fontFamily: 'var(--font-heading)',
                        border: `2px solid ${isActive ? agent.color : 'var(--border-strong)'}`,
                      }}>
                        {agent.name.charAt(0)}
                      </div>
                    )}
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 12, color: 'var(--ink-1)', textAlign: 'center' }}>{agent.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Execution Gods — dark celestial card */}
        <div className="card-dark" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="var(--gold-bright)" />
              <h3 style={{ fontSize: 17, fontFamily: 'var(--font-heading)', color: '#fff' }}>Execution Gods / Titans</h3>
            </div>
            <Link href="/agents/gods" style={{ fontSize: 12, color: 'var(--gold-bright)', textDecoration: 'none', fontWeight: 500 }}>
              Gods Hub →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TOP_GODS.map(([key, god]) => {
              const src = getPortrait(key);
              return (
                <Link key={key} href="/agents/gods" style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {src ? (
                      <Image
                        src={src} alt={god.name} width={42} height={42}
                        style={{ borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(201,162,77,0.4)', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{
                        width: 42, height: 42, borderRadius: 10,
                        background: god.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 700, color: '#fff',
                        border: '1px solid rgba(201,162,77,0.4)', flexShrink: 0,
                      }}>{god.name.charAt(0)}</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: '#fff' }}>{god.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--on-dark-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{god.role}</div>
                    </div>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3FB66B', flexShrink: 0 }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right column — Recent Activity + Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontFamily: 'var(--font-heading)', color: 'var(--ink-1)' }}>Recent Activity</h3>
              <span style={{ fontSize: 12, color: 'var(--navy)', cursor: 'pointer' }}>View all</span>
            </div>
            {[
              ['Welcome to Philosopher OS', 'Your CRM is ready.', 'Landmark'],
              ['Plato is ready', 'Strategic mode active.', 'Brain'],
              ['No campaigns yet', 'Create your first mission.', 'Target'],
            ].map(([title, sub], i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: i < 2 ? '0.5px solid var(--border-light)' : 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--navy-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BarChart3 size={14} color="var(--navy)" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-1)' }}>{title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 15, fontFamily: 'var(--font-heading)', color: 'var(--ink-1)', marginBottom: 12 }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Create Campaign', icon: Target,    color: '#7B5EA7', href: '/campaigns' },
                { label: 'Find Businesses', icon: Users,     color: '#123C69', href: '/leads' },
                { label: 'Add Lead',        icon: Users,     color: '#6F7D4F', href: '/leads' },
                { label: 'Import CSV',      icon: Brain,     color: '#C9A24D', href: '/leads' },
              ].map(q => {
                const Icon = q.icon;
                return (
                  <Link key={q.label} href={q.href} style={{ textDecoration: 'none' }}>
                    <div className="card-interactive" style={{
                      border: '1px solid var(--border)', borderRadius: 12,
                      padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 7, background: 'var(--surface)',
                    }}>
                      <Icon size={18} color={q.color} />
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-1)' }}>{q.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mission + Today's Snapshot row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
        {/* Mission Command Center */}
        <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 160, height: 160,
            background: 'radial-gradient(circle, rgba(18,60,105,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Radio size={18} color="var(--navy)" />
            <h3 style={{ fontSize: 17, fontFamily: 'var(--font-heading)', color: 'var(--ink-1)' }}>Mission Command Center</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16, lineHeight: 1.6 }}>
            Launch powerful missions using philosophers to plan and gods to execute.
          </p>
          <Link href="/mission" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Radio size={14} /> Go to Mission Guide
            </button>
          </Link>
        </div>

        {/* Today's Snapshot */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Zap size={18} color="var(--gold)" />
            <h3 style={{ fontSize: 17, fontFamily: 'var(--font-heading)', color: 'var(--ink-1)' }}>Today's Snapshot</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'No Leads Collected', value: totalLeads, icon: Users },
              { label: 'No Outreach Sent',   value: 0,          icon: Send },
              { label: 'No Meetings',         value: 0,          icon: MessageSquare },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <Icon size={20} color="var(--ink-4)" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, color: 'var(--ink-1)' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Ask Plato Bar ── */}
      <div style={{
        position: 'relative', borderRadius: 'var(--radius-lg)', padding: 2,
        background: 'linear-gradient(120deg, rgba(123,94,167,0.5), rgba(201,162,77,0.45), rgba(18,60,105,0.5))',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'var(--navy-deep)', borderRadius: 'calc(var(--radius-lg) - 2px)',
          padding: '14px 18px',
        }}>
          <Image
            src="/assets/philosopher-os/agent-portraits/plato-portrait.jpg"
            alt="Plato"
            width={40} height={40}
            style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 18%', flexShrink: 0 }}
          />
          <input
            value={askValue}
            onChange={e => setAskValue(e.target.value)}
            placeholder="Ask Plato anything, or command a mission…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: askValue ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize: 15, fontFamily: 'var(--font-body)',
              padding: 0,
            }}
          />
          <Link href="/mission">
            <button style={{
              width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(180deg, var(--navy-bright), var(--navy))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Send size={18} color="#fff" />
            </button>
          </Link>
        </div>
        {/* Quick mission chips */}
        <div style={{ padding: '10px 18px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {MISSION_ACTIONS.map(m => (
            <button
              key={m.label}
              onClick={() => setAskValue(m.label)}
              style={{
                padding: '6px 14px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 'var(--radius-pill)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 12, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
