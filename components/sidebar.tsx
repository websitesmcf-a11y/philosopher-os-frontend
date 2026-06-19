'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, Fragment } from 'react';
import { useSidebar } from '@/lib/sidebar-context';
import {
  LayoutDashboard, Users, Building2, MessageSquare, Megaphone,
  Wallet, BarChart3, Bot, Calendar, CheckSquare, BookOpen,
  Settings, LogOut, LogIn, User, PanelLeftClose, Menu, Plug, Brain, Radio,
  Zap, Shield, Target, Send, Sparkles, Monitor, Globe, Database,
  ScanEye, Swords, NotebookPen, Timer, ChevronDown, ScrollText, Layers,
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { PHILOSOPHERS, PALETTE } from '@/lib/design-tokens';
import { PORTRAITS, TEXTURES, getPortrait } from '@/lib/philosopher-assets';

const navItems = [
  {
    section: 'Main',
    items: [
      { href: '/', label: 'Dashboard', icon: Monitor },
      { href: '/mission', label: 'Mission Control', icon: Radio },
    ],
  },
  {
    section: 'Intelligence',
    items: [
      { href: '/agents', label: 'Philosophers', icon: Brain },
      { href: '/agents/gods', label: 'Gods & Titans', icon: Zap },
      { href: '/mission/daily', label: 'Daily Command', icon: Swords },
    ],
  },
  {
    section: 'CRM',
    items: [
      { href: '/leads', label: 'Leads', icon: Users },
      { href: '/lead-lists', label: 'Lead Lists', icon: Layers },
      { href: '/clients', label: 'Clients', icon: Building2 },
      { href: '/conversations', label: 'Conversations', icon: MessageSquare },
      { href: '/campaigns', label: 'Campaigns', icon: Target },
    ],
  },
  {
    section: 'Operations',
    items: [
      { href: '/tasks', label: 'Tasks', icon: CheckSquare },
      { href: '/calendar', label: 'Schedule', icon: Calendar },
      { href: '/finance', label: 'Finance', icon: Wallet },
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    section: 'System',
    items: [
      { href: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
      { href: '/connections', label: 'Integrations', icon: Plug },
      { href: '/tools/cleanup', label: 'CRM Cleanup', icon: ScanEye },
      { href: '/tools/agent-logs', label: 'Agent Run Logs', icon: ScrollText },
      { href: '/hermes', label: 'Hermes Jobs', icon: Timer },
    ],
  },
  {
    section: 'Beast Mode',
    items: [
      { href: '/mission/beast-mode', label: 'Beast Mode', icon: Zap },
      { href: '/mission/outreach', label: 'Outreach Builder', icon: Send },
    ],
  },
];

const SIDEBAR_BG = '#0F1722';
const SIDEBAR_FG = 'rgba(255,255,255,0.70)';
const SIDEBAR_FG_ACTIVE = '#FFFFFF';
const SIDEBAR_ACCENT = PALETTE.accent;
const SIDEBAR_GOLD = PALETTE.gold;
const SIDEBAR_SECTION_COLOR = 'rgba(255,255,255,0.35)';
const SIDEBAR_BORDER = 'rgba(255,255,255,0.06)';
const SIDEBAR_HOVER = 'rgba(255,255,255,0.05)';
const SIDEBAR_ACTIVE_BG = 'rgba(18, 60, 105, 0.25)';
const SIDEBAR_ACTIVE_GRADIENT = 'linear-gradient(90deg, rgba(18, 60, 105, 0.35) 0%, rgba(18, 60, 105, 0.08) 100%)';
const SIDEBAR_ACTIVE_GODS_GRADIENT = 'linear-gradient(90deg, rgba(201, 162, 77, 0.2) 0%, rgba(201, 162, 77, 0.05) 100%)';

function NavItem({ href, label, icon: Icon, collapsed, active, portraits }: {
  href: string; label: string; icon: typeof Brain; collapsed: boolean; active: boolean; portraits?: string[];
}) {
  const content = (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, height: 40,
        padding: '0 16px',
        fontSize: 14, fontWeight: active ? 600 : 400,
        color: active ? SIDEBAR_FG_ACTIVE : SIDEBAR_FG,
        background: active
          ? (label === 'Gods & Titans' ? SIDEBAR_ACTIVE_GODS_GRADIENT : SIDEBAR_ACTIVE_GRADIENT)
          : 'transparent',
        borderLeft: active ? `3px solid ${label === 'Gods & Titans' ? SIDEBAR_GOLD : SIDEBAR_ACCENT}` : '3px solid transparent',
        borderRadius: active ? '0 6px 6px 0' : undefined,
        transition: 'all 0.2s ease',
        marginBottom: 1,
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = SIDEBAR_HOVER;
          e.currentTarget.style.borderLeftColor = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.borderLeftWidth = '1px';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderLeftColor = 'transparent';
          e.currentTarget.style.borderLeftWidth = '3px';
        }
      }}
      >
        {portraits && portraits.length > 0 && !collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {portraits.slice(0, 3).map((src, i) => (
              <div
                key={i}
                style={{
                  width: 22, height: 22, borderRadius: '50%',
                  marginLeft: i > 0 ? -6 : 0,
                  border: `2px solid ${SIDEBAR_BG}`,
                  overflow: 'hidden',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 3 - i,
                }}
              >
                <Image
                  src={src}
                  alt=""
                  width={22}
                  height={22}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
            ))}
          </div>
        ) : (
          <Icon size={18} strokeWidth={active ? 2.5 : 1.5} color={active ? (label === 'Gods & Titans' ? SIDEBAR_GOLD : undefined) : undefined} />
        )}
        <span className="nav-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        {active && (
          <div style={{
            marginLeft: 'auto',
            width: 4, height: 4, borderRadius: '50%',
            background: label === 'Gods & Titans' ? SIDEBAR_GOLD : SIDEBAR_ACCENT,
          }} />
        )}
      </div>
    </Link>
  );

  if (!collapsed) return content;

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            sideOffset={8}
            style={{
              background: '#1E293B',
              color: '#FFFFFF',
              padding: '6px 12px',
              fontSize: 13, fontWeight: 500,
              border: `1px solid ${SIDEBAR_BORDER}`,
              borderRadius: 4,
              zIndex: 100,
            }}
          >
            {label}
            <Tooltip.Arrow style={{ fill: '#1E293B' }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggleCollapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
    const stored = localStorage.getItem('user_name');
    if (stored) setUserName(stored);
    const avatarStored = localStorage.getItem('user_avatar');
    if (avatarStored) setUserAvatar(avatarStored);
  }, [pathname]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
    setIsAuthenticated(false);
    router.push('/login');
  };

  const handleLogin = () => { router.push('/login'); };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 50,
          display: 'none', padding: 8,
          background: SIDEBAR_BG, border: `1px solid ${SIDEBAR_BORDER}`,
          borderRadius: 4, color: '#FFFFFF', cursor: 'pointer',
        }}
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 39,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
      )}

      <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          borderBottom: `1px solid ${SIDEBAR_BORDER}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36,
            background: `linear-gradient(135deg, ${SIDEBAR_ACCENT}, ${SIDEBAR_GOLD})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: '#FFFFFF',
            borderRadius: 6, flexShrink: 0,
            fontFamily: 'var(--font-heading)',
          }}>
            Φ
          </div>
          <div className="logo-text" style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
              Philosopher
            </div>
            <div style={{ fontSize: 11, color: SIDEBAR_GOLD, fontWeight: 500, fontFamily: 'var(--font-label)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Operating System
            </div>
          </div>
          <button
            onClick={toggleCollapsed}
            style={{
              marginLeft: 'auto', padding: '4px', background: 'none', border: 'none',
              color: SIDEBAR_FG, cursor: 'pointer', flexShrink: 0,
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '12px 0',
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
        }}>
          {navItems.map((group, groupIdx) => {
            // Build portrait thumbnails for agent-related sections
            let portraits: string[] | undefined;
            if (group.section === 'Intelligence') {
              // Philosophers item gets philosopher portraits
              portraits = Object.keys(PHILOSOPHERS).slice(0, 4).map(k => getPortrait(k)).filter(Boolean) as string[];
            }

            return (
              <div key={group.section} style={{ marginBottom: 20 }}>
                <div className="section-label" style={{
                  fontSize: 10, fontWeight: 600,
                  color: SIDEBAR_SECTION_COLOR,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  padding: '0 20px', marginBottom: 6, whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-label)',
                }}>
                  {group.section}
                </div>
                {group.items.map((item, itemIdx) => {
                  // Determine portrait set per item
                  let itemPortraits: string[] | undefined;
                  if (item.label === 'Philosophers') {
                    itemPortraits = Object.keys(PHILOSOPHERS).slice(0, 4).map(k => getPortrait(k)).filter(Boolean) as string[];
                  } else if (item.label === 'Gods & Titans') {
                    itemPortraits = Object.keys(PHILOSOPHERS).slice(0, 4).map(k => {
                      const k2 = k === 'plato' ? 'iapetus' : k === 'socrates' ? 'astraeus' : k === 'aristotle' ? 'erebos' : k === 'athena' ? 'phantasos' : null;
                      return k2 ? getPortrait(k2) : undefined;
                    }).filter(Boolean) as string[];
                  }

                  return (
                    <Fragment key={item.href}>
                      <NavItem
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        collapsed={collapsed}
                        active={isActive(item.href)}
                        portraits={itemPortraits}
                      />
                    </Fragment>
                  );
                })}
                {/* Gold divider after Intelligence and CRM sections */}
                {(group.section === 'Intelligence' || group.section === 'CRM') && (
                  <div style={{
                    margin: '16px 20px',
                    height: 1,
                    background: `linear-gradient(90deg, ${SIDEBAR_GOLD}33, transparent)`,
                    border: 'none',
                  }} />
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer: Credits + User */}
        <div style={{
          padding: '12px 12px',
          borderTop: `1px solid ${SIDEBAR_BORDER}`,
        }}>
          {/* Credit display */}
          <div className="sidebar-footer-text" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 8px', marginBottom: 8,
            background: SIDEBAR_HOVER,
            borderRadius: 4,
          }}>
            <Sparkles size={14} color={SIDEBAR_GOLD} />
            <span style={{ fontSize: 12, color: SIDEBAR_FG, fontWeight: 500 }}>
              Credits: <span style={{ color: SIDEBAR_GOLD }}>—</span>
            </span>
          </div>

          {/* User area */}
          {isAuthenticated && userName && (
            <div className="sidebar-user-area" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px',
              borderRadius: 4,
              background: SIDEBAR_HOVER,
              marginBottom: 4,
            }}>
              {userAvatar ? (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  <Image
                    src={userAvatar}
                    alt={userName}
                    width={28}
                    height={28}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </div>
              ) : (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${SIDEBAR_ACCENT}, ${SIDEBAR_GOLD})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#FFFFFF',
                  flexShrink: 0,
                }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="nav-label" style={{
                fontSize: 13, color: '#FFFFFF', fontWeight: 500,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {userName}
              </span>
            </div>
          )}

          {/* Settings + Login/Logout */}
          <NavItem href="/settings" label="Settings" icon={Settings} collapsed={collapsed} active={isActive('/settings')} />
          <button onClick={isAuthenticated ? handleLogout : handleLogin} style={{
            display: 'flex', alignItems: 'center', gap: 10, height: 40, width: '100%',
            padding: '0 16px', fontSize: 14, color: SIDEBAR_FG,
            background: 'none', border: 'none', cursor: 'pointer',
            textAlign: 'left' as const,
          }}>
            {isAuthenticated ? <LogOut size={18} /> : <LogIn size={18} />}
            <span className="nav-label">{isAuthenticated ? 'Logout' : 'Login'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
