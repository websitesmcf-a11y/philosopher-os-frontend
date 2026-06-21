'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { Bell, Search, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Sidebar from './sidebar';
import { ModeProvider } from './mode-provider';
import { ErrorBoundary } from './error-boundary';
import { SidebarProvider, useSidebar } from '@/lib/sidebar-context';
import BackgroundWrapper from './background-wrapper';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { PhilosopherLayout } from '@/components/philosopher-layout';
import { TutorialProvider } from '@/lib/tutorial-context';
import { TutorialOverlay } from '@/components/tutorial-overlay';

const PUBLIC_PATHS = ['/login', '/signup', '/register', '/forgot-password', '/landing', '/onboarding'];

const TITLE_MAP: Record<string, string> = {
  '/': 'Dashboard',
  '/mission': 'Mission Control',
  '/mission/daily': 'Daily Command',
  '/overview': 'Overview',
  '/leads': 'Leads',
  '/clients': 'Clients',
  '/conversations': 'Conversations',
  '/campaigns': 'Campaigns',
  '/knowledge': 'Knowledge Base',
  '/finance': 'Finance',
  '/analytics': 'Analytics',
  '/tasks': 'Tasks',
  '/calendar': 'Schedule',
  '/agents': 'Philosopher Council',
  '/agents/gods': 'Gods & Titans',
  '/chat': 'Agent Chat',
  '/connections': 'Integrations',
  '/tools/cleanup': 'CRM Cleanup',
  '/settings': 'Settings',
};

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const isPublic = PUBLIC_PATHS.includes(pathname);
    const isOnboarding = pathname === '/onboarding';

    if (!token && !isPublic && !isOnboarding) {
      router.replace('/login');
      setChecked(true);
      return;
    }

    setAuthenticated(!!token);

    // If returning from an action page during onboarding, go back to onboarding
    if (token && !isOnboarding && !isPublic && localStorage.getItem('philosopher_onboarding_return') === 'true' && !localStorage.getItem('philosopher_onboarding_complete')) {
      router.replace('/onboarding');
      setChecked(true);
      return;
    }

    // Redirect new users to onboarding (check on any non-public page, not just dashboard)
    if (token && !isPublic && !isOnboarding && !localStorage.getItem('philosopher_onboarding_complete')) {
      router.replace('/onboarding');
      setChecked(true);
      return;
    }

    setChecked(true);
  }, [pathname, router]);

  if (!checked) return null;
  return <>{children}</>;
}

function TopBar({ pathname }: { pathname: string }) {
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    setUserName(localStorage.getItem('user_name'));
    setUserAvatar(localStorage.getItem('user_avatar'));
  }, [pathname]);

  return (
    <header className="topbar">
      {/* Left: Active Philosopher pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 12px 5px 6px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--surface)',
          cursor: 'pointer',
        }}>
          <Image
            src="/assets/philosopher-os/agent-portraits/plato-portrait.jpg"
            alt="Plato"
            width={26}
            height={26}
            style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 20%', border: '2px solid var(--navy)' }}
          />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-label)', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Active Philosopher</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-1)' }}>Plato</div>
          </div>
          <ChevronDown size={14} color="var(--ink-3)" />
        </div>
      </div>

      {/* Right: Search, Bell, Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button className="btn btn-ghost btn-sm" style={{ padding: 8 }} title="Search">
          <Search size={17} color="var(--ink-2)" />
        </button>
        <button className="btn btn-ghost btn-sm" style={{ padding: 8, position: 'relative' }} title="Notifications">
          <Bell size={17} color="var(--ink-2)" />
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 14, height: 14, borderRadius: '50%',
            background: 'var(--purple)', color: '#fff',
            fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
          }}>3</span>
        </button>
        {userAvatar ? (
          <Image
            src={userAvatar}
            alt={userName || 'User'}
            width={34}
            height={34}
            style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }}
          />
        ) : (
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--navy), var(--gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff',
            border: '2px solid var(--gold)',
            fontFamily: 'var(--font-heading)',
            flexShrink: 0,
          }}>
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </div>
    </header>
  );
}

function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const { collapsed } = useSidebar();
  const mainAreaClass = isPublic
    ? ''
    : `main-area${collapsed ? ' expanded' : ''}`;

  if (isPublic) {
    return <PhilosopherLayout>{children}</PhilosopherLayout>;
  }

  const isOmega = pathname.startsWith('/omega');

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main
        className={mainAreaClass}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh',
          background: isOmega ? '#000000' : undefined,
        }}
      >
        <TopBar pathname={pathname} />
        <div style={{ flex: 1, background: isOmega ? '#000000' : undefined }}>
          <BackgroundWrapper>
            <PhilosopherLayout>{children}</PhilosopherLayout>
          </BackgroundWrapper>
        </div>
      </main>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthGuard>
            <ModeProvider>
              <SidebarProvider>
                <TutorialProvider>
                  <LayoutShell>{children}</LayoutShell>
                  <TutorialOverlay />
                </TutorialProvider>
              </SidebarProvider>
            </ModeProvider>
          </AuthGuard>
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
