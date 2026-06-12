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
    const root = document.documentElement;
    root.style.setProperty('--accent', config.accentColor);
    root.style.setProperty('--accent-subtle', hexToRgba(config.accentColor, 0.08));
    root.style.setProperty('--accent-light', hexToRgba(config.accentColor, 0.12));

    // Set the philosopher-specific CSS variable
    root.style.setProperty('--philosopher-current', config.accentColor);

    // Data attributes for CSS overrides
    root.setAttribute('data-mode', config.mode);
    root.setAttribute('data-density', config.layoutDensity);
    root.setAttribute('data-motion', String(config.motionEnabled));
  }, [config]);

  return <>{children}</>;
}
