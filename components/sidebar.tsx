'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSidebar } from '@/lib/sidebar-context';
import {
  LayoutDashboard, Users, Building2, MessageSquare, Megaphone,
  Wallet, BarChart3, Bot, Calendar, CheckSquare, BookOpen,
  Settings, MessageCircle, LogOut, LogIn, User, PanelLeftClose, PanelLeft, Menu, Plug, Brain, Radio,
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { PHILOSOPHERS } from '@/lib/design-tokens';

const navItems = [
  { section: 'Core', items: [
    { href: '/', label: 'Plato', icon: Brain },
    { href: '/mission', label: 'Mission Control', icon: Radio },
    { href: '/overview', label: 'Overview', icon: LayoutDashboard },
    { href: '/leads', label: 'Leads', icon: Users },
    { href: '/clients', label: 'Clients', icon: Building2 },
    { href: '/conversations', label: 'Conversations', icon: MessageSquare },
  ]},
  { section: 'Growth', items: [
    { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
    { href: '/knowledge', label: 'Knowledge', icon: BookOpen },
  ]},
  { section: 'Finance', items: [
    { href: '/finance', label: 'Finance', icon: Wallet },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  ]},
  { section: 'Productivity', items: [
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
  ]},
  { section: 'AI', items: [
    { href: '/agents', label: 'AI Agents', icon: Bot },
    { href: '/chat', label: 'Agent Chat', icon: MessageCircle },
    { href: '/connections', label: 'Connections', icon: Plug },
  ]},
];

function NavItem({ href, label, icon: Icon, collapsed, active }: {
  href: string; label: string; icon: typeof Brain; collapsed: boolean; active: boolean;
}) {
  const content = (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px',
        fontSize: 14, fontWeight: active ? 600 : 400,
        color: active ? 'var(--accent)' : 'var(--foreground-secondary)',
        background: active ? 'var(--accent-subtle)' : 'transparent',
        borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
        transition: 'all 0.15s ease',
        marginBottom: 1,
      }}>
        <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
        <span className="nav-label">{label}</span>
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
              background: 'var(--surface-elevated)', color: 'var(--foreground)',
              padding: '6px 10px',
              fontSize: 13, fontWeight: 500,
              border: '1px solid var(--border)',
              zIndex: 100,
            }}
          >
            {label}
            <Tooltip.Arrow style={{ fill: 'var(--surface-elevated)' }} />
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
    const stored = localStorage.getItem('user_name');
    if (stored) setUserName(stored);
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
    setIsAuthenticated(false);
    router.push('/login');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const sidebarClass = `sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' open' : ''}`;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="btn btn-ghost"
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 50,
          display: 'none', padding: '8px',
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
            background: 'rgba(0,0,0,0.4)',
          }}
        />
      )}

      <aside className={sidebarClass}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32,
                background: PHILOSOPHERS.plato.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 800, color: 'white',
                flexShrink: 0,
              }}>
                S
              </div>
              <div className="logo-text">
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>Socrates</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500 }}>AI Agency OS</div>
              </div>
            </Link>
            <button
              onClick={toggleCollapsed}
              className="btn btn-ghost"
              style={{ padding: '4px 6px', display: 'flex' }}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(group => (
            <div key={group.section} style={{ marginBottom: 16 }}>
              <div className="section-label" style={{
                fontSize: 10, fontWeight: 600, color: 'var(--muted)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                padding: '0 12px', marginBottom: 4, whiteSpace: 'nowrap',
              }}>
                {group.section}
              </div>
              {group.items.map(item => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  collapsed={collapsed}
                  active={pathname === item.href}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <NavItem href="/settings" label="Settings" icon={Settings} collapsed={collapsed} active={pathname === '/settings'} />

          {isAuthenticated && userName && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', fontSize: 13, color: 'var(--foreground-secondary)',
            }}>
              <User size={14} />
              <span className="nav-label" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</span>
            </div>
          )}

          <button onClick={isAuthenticated ? handleLogout : handleLogin} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '8px 12px',
            fontSize: 14, color: 'var(--foreground-secondary)',
            background: 'none', border: 'none', cursor: 'pointer',
            textAlign: 'left',
          }}>
            {isAuthenticated ? <LogOut size={16} /> : <LogIn size={16} />}
            <span className="nav-label">{isAuthenticated ? 'Logout' : 'Login'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
