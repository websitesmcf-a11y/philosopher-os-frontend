'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { Bell } from 'lucide-react';
import Sidebar from './sidebar';
import { ModeProvider } from './mode-provider';
import { ErrorBoundary } from './error-boundary';
import { SidebarProvider, useSidebar } from '@/lib/sidebar-context';
import BackgroundWrapper from './background-wrapper';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { PhilosopherLayout } from '@/components/philosopher-layout';

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
  const title = TITLE_MAP[pathname] || 'Philosopher OS';

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontSize: 15, fontWeight: 600,
          fontFamily: 'var(--font-heading)',
          color: 'var(--foreground)',
        }}>
          {title}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: 8 }}
          title="Notifications"
        >
          <Bell size={16} />
        </button>
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

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main
        className={mainAreaClass}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <TopBar pathname={pathname} />
        <div style={{ flex: 1 }}>
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
                <LayoutShell>{children}</LayoutShell>
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
