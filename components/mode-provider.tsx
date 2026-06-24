'use client';

import { useEffect } from 'react';
import { useModeStore } from '@/lib/mode-store';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const config = useModeStore(s => s.config);

  useEffect(() => {
    const accent = config?.accentColor || '#123C69';
    const root = document.documentElement;
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-subtle', hexToRgba(accent, 0.08));
    root.style.setProperty('--accent-light', hexToRgba(accent, 0.12));

    // Set the philosopher-specific CSS variable
    root.style.setProperty('--philosopher-current', accent);

    // Data attributes for CSS overrides
    root.setAttribute('data-mode', config?.mode || 'plato');
    root.setAttribute('data-density', config?.layoutDensity || 'normal');
    root.setAttribute('data-motion', String(config?.motionEnabled ?? true));
  }, [config]);

  return <>{children}</>;
}
