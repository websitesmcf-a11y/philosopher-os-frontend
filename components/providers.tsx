'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { Bell } from 'lucide-react';
import Sidebar from './sidebar';
import { ModeProvider } from './mode-provider';
import { ModePicker } from './mode-picker';
import { ErrorBoundary } from './error-boundary';
import { SidebarProvider, useSidebar } from '@/lib/sidebar-context';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];
const TITLE_MAP: Record<string, string> = {
  '/': 'Plato',
  '/mission': 'Mission Control',
  '/overview': 'Overview',
  '/leads': 'Leads',
  '/clients': 'Clients',
  '/conversations': 'Conversations',
  '/campaigns': 'Campaigns',
  '/knowledge': 'Knowledge',
  '/finance': 'Finance',
  '/analytics': 'Analytics',
  '/tasks': 'Tasks',
  '/calendar': 'Calendar',
  '/agents': 'AI Agents',
  '/chat': 'Agent Chat',
  '/connections': 'Connections',
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
    if (!token && !isPublic) {
      router.replace('/login');
    } else {
      setAuthenticated(!!token);
    }
    setChecked(true);
  }, [pathname, router]);

  if (!checked) return null;
  return <>{children}</>;
}

function TopBar({ pathname }: { pathname: string }) {
  const title = TITLE_MAP[pathname] || 'Socrates AI';

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
          {title}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ModePicker />
        <button className="btn btn-ghost" style={{ padding: 8 }} title="Notifications">
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

  return (
    <div style={{ display: 'flex' }}>
      {!isPublic && <Sidebar />}
      <main className={mainAreaClass} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {!isPublic && <TopBar pathname={pathname} />}
        <div className="page-enter" key={pathname} style={isPublic ? { flex: 1, maxWidth: 'none', padding: 0 } : { flex: 1 }}>
          {children}
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
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthGuard>
          <ModeProvider>
            <SidebarProvider>
              <LayoutShell>
                {children}
              </LayoutShell>
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
          },
        }}
      />
    </QueryClientProvider>
  );
}
