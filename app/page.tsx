'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '@/lib/api-client';
import { StatCard } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/ui/page-header';
import { PHILOSOPHERS, GODS } from '@/lib/design-tokens';
import { PORTRAITS, getPortrait } from '@/lib/philosopher-assets';
import {
  Brain, Users, Building2, Wallet, Target,
  MessageSquare, CheckSquare, Zap, Sparkles,
  ArrowRight, Monitor, Radio,
} from 'lucide-react';

const QUICK_ACTIONS = [
  { href: '/mission', label: 'Launch Mission', icon: Radio, color: '#123C69', desc: 'Start a lead gen or outreach mission' },
  { href: '/leads', label: 'Manage Leads', icon: Users, color: '#6F7D4F', desc: 'View and manage your leads' },
  { href: '/campaigns', label: 'New Campaign', icon: Target, color: '#C9A24D', desc: 'Create an outreach campaign' },
  { href: '/mission/daily', label: 'Daily Command', icon: Zap, color: '#8B2020', desc: 'See today\'s priorities' },
  { href: '/tasks', label: 'View Tasks', icon: CheckSquare, color: '#3B5E7A', desc: 'Manage your task list' },
  { href: '/finance', label: 'Log Finance', icon: Wallet, color: '#5B6B3A', desc: 'Record income or expense' },
];

const TOP_PHILOSOPHERS = Object.entries(PHILOSOPHERS).slice(0, 6);
const TOP_GODS = Object.entries(GODS).slice(0, 3);

export default function DashboardPage() {
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

  // Calculate a greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-content fade-in">
      {/* Welcome Banner */}
      <div className="welcome-banner fade-in-up" style={{ marginBottom: 32 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1>{greeting}, Commander</h1>
          <p>Welcome to Philosopher OS — your AI-powered CRM is ready.</p>
        </div>
        <div style={{
          position: 'absolute',
          bottom: 8, right: 24,
          display: 'flex', gap: 4,
          zIndex: 1,
        }}>
          {Object.keys(PHILOSOPHERS).slice(0, 5).map((k) => {
            const src = getPortrait(k);
            if (!src) return null;
            return (
              <Image
                key={k}
                src={src}
                alt=""
                width={28}
                height={28}
                style={{
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  objectFit: 'cover',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid stagger">
        <StatCard label="Total Leads" value={totalLeads} icon={Users} color="#123C69" />
        <StatCard label="Active Clients" value={activeClients} icon={Building2} color="#6F7D4F" />
        <StatCard label="Active Campaigns" value={activeCampaigns} icon={Target} color="#C9A24D" />
        <StatCard label="Revenue (ZAR)" value={`R${revenue.toLocaleString()}`} icon={Wallet} color="#3B6B5E" />
        <StatCard label="Pending Tasks" value={tasksPending} icon={CheckSquare} color="#3B5E7A" />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-header-glow">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="var(--gold)" />
            <h2 style={{
              fontSize: 18, fontWeight: 500, fontFamily: 'var(--font-heading)',
              color: 'var(--foreground)',
            }}>
              Quick Actions
            </h2>
          </div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}>
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
                <div className="card card-interactive" style={{
                  padding: 20, display: 'flex', gap: 14, alignItems: 'flex-start',
                  animationDelay: `${i * 0.05}s`,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: `linear-gradient(135deg, ${action.color}20, ${action.color}08)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    border: `1px solid ${action.color}15`,
                  }}>
                    <Icon size={20} color={action.color} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
                      {action.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--foreground-secondary)', marginTop: 2 }}>
                      {action.desc}
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--muted)" style={{ marginLeft: 'auto', marginTop: 4, flexShrink: 0 }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Agent Council */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: 24, marginBottom: 32,
      }}>
        {/* Philosophers */}
        <div>
          <div className="section-header">
            <Brain size={16} color="var(--accent)" />
            <h2>Philosopher Council</h2>
            <Link href="/agents" style={{
              marginLeft: 'auto',
              fontSize: 12, color: 'var(--accent)',
              textDecoration: 'none', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="card card-elevated" style={{ padding: 12, overflow: 'hidden' }}>
            {TOP_PHILOSOPHERS.map(([key, agent]) => {
              const portraitSrc = getPortrait(key);
              return (
                <Link key={key} href={`/chat?agent=${key}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 'var(--radius)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(23, 26, 33, 0.03)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {portraitSrc ? (
                      <div style={{
                        width: 38, height: 38, borderRadius: 8,
                        overflow: 'hidden', flexShrink: 0,
                        border: `2px solid ${agent.color}30`,
                      }}>
                        <Image
                          src={portraitSrc}
                          alt={agent.name}
                          width={38}
                          height={38}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        width: 38, height: 38, borderRadius: 8,
                        background: agent.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 700, color: '#FFFFFF',
                        flexShrink: 0, fontFamily: 'var(--font-heading)',
                      }}>
                        {agent.name.charAt(0)}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
                        {agent.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--foreground-secondary)' }}>
                        {agent.role}
                      </div>
                    </div>
                    <ArrowRight size={14} color="var(--muted)" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Gods */}
        <div>
          <div className="section-header">
            <Zap size={16} color="var(--gold)" />
            <h2>Gods & Titans</h2>
            <Link href="/agents/gods" style={{
              marginLeft: 'auto',
              fontSize: 12, color: 'var(--gold)',
              textDecoration: 'none', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="card card-elevated" style={{ padding: 12, overflow: 'hidden' }}>
            {TOP_GODS.map(([key, god]) => {
              const portraitSrc = getPortrait(key);
              return (
                <Link key={key} href={`/agents/gods`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 'var(--radius)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(201, 162, 77, 0.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {portraitSrc ? (
                      <div style={{
                        width: 38, height: 38, borderRadius: 8,
                        overflow: 'hidden', flexShrink: 0,
                        border: `2px solid ${god.color}30`,
                      }}>
                        <Image
                          src={portraitSrc}
                          alt={god.name}
                          width={38}
                          height={38}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        width: 38, height: 38, borderRadius: 8,
                        background: god.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 700, color: '#FFFFFF',
                        flexShrink: 0, fontFamily: 'var(--font-heading)',
                      }}>
                        {god.name.charAt(0)}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
                        {god.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--foreground-secondary)' }}>
                        {god.role}
                      </div>
                    </div>
                    <ArrowRight size={14} color="var(--muted)" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
