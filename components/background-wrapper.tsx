'use client';
import { usePathname } from 'next/navigation';
import PageBackground from '@/components/ui/page-background';

/** Maps URL paths to page background keys for philosopher-assets */
const pathToBgKey: Record<string, string> = {
  '/': 'dashboard',
  '/login': 'login',
  '/overview': 'overview',
  '/leads': 'leads',
  '/clients': 'clients',
  '/chat': 'chat',
  '/analytics': 'analytics',
  '/connections': 'connections',
  '/tasks': 'tasks',
  '/finance': 'finance',
  '/campaigns': 'campaigns',
  '/calendar': 'calendar',
  '/knowledge': 'knowledge',
  '/settings': 'settings',
  '/agents': 'agents',
  '/agents/gods': 'agents',
  '/mission': 'mission',
  '/mission/daily': 'mission',
  '/beast-mode': 'beast-mode',
  '/tools/cleanup': 'cleanup',
  '/tools/agent-logs': 'admin',
};

export default function BackgroundWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Omega pages: no background image or texture — pure black handled by PhilosopherLayout
  if (pathname.startsWith('/omega')) {
    return <>{children}</>;
  }

  const bgKey = pathToBgKey[pathname] || 'dashboard';
  return <PageBackground pageKey={bgKey}>{children}</PageBackground>;
}
