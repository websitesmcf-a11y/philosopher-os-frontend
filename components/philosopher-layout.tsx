'use client';

import { usePathname } from 'next/navigation';
import { TEXTURES } from '@/lib/philosopher-assets';

interface Props {
  children: React.ReactNode;
}

/**
 * PhilosopherLayout — adds decorative visual elements to every page:
 * - Top gradient bar (accent -> gold -> accent)
 * - Subtle texture overlay as CSS background
 * - Corner decorations on main content areas
 * - Gold divider accents at section boundaries
 */
export function PhilosopherLayout({ children }: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* Top gradient bar */}
      <div className="top-gradient-bar" />

      {/* Texture overlay for the entire app */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url(${TEXTURES['ivory-marble']})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: 0.025,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Second subtle texture overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: `radial-gradient(ellipse at 30% 20%, rgba(201, 162, 77, 0.03) 0%, transparent 60%)`,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Corner decoration — top left of main area */}
      <div
        style={{
          position: 'fixed',
          top: 56, /* below topbar */
          left: 250, /* sidebar width */
          width: 40,
          height: 40,
          borderTop: '1px solid rgba(201, 162, 77, 0.08)',
          borderLeft: '1px solid rgba(201, 162, 77, 0.08)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Corner decoration — top right */}
      <div
        style={{
          position: 'fixed',
          top: 56,
          right: 0,
          width: 40,
          height: 40,
          borderTop: '1px solid rgba(201, 162, 77, 0.08)',
          borderRight: '1px solid rgba(201, 162, 77, 0.08)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        key={pathname}
        className="page-enter"
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100%',
        }}
      >
        {children}
      </div>
    </>
  );
}

export default PhilosopherLayout;
