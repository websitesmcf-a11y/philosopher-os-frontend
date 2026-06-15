'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';

const STORAGE_KEY = 'philosopher_appearance_settings';

type ThemeMode = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';

interface AppearanceSettings {
  theme: ThemeMode;
  fontSize: FontSize;
  accentColor: string;
}

const DEFAULT_SETTINGS: AppearanceSettings = {
  theme: 'light',
  fontSize: 'medium',
  accentColor: '#123C69',
};

function loadSettings(): AppearanceSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // storage unavailable or corrupt
  }
  return DEFAULT_SETTINGS;
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  }
}

function applyAccentColor(color: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--accent', color);
  root.style.setProperty('--accent-subtle', `${color}12`);
  root.style.setProperty('--accent-light', `${color}30`);

  // Derive bright variant
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const bright = `#${Math.min(255, r + 20).toString(16).padStart(2, '0')}${Math.min(255, g + 20).toString(16).padStart(2, '0')}${Math.min(255, b + 20).toString(16).padStart(2, '0')}`;
  root.style.setProperty('--accent-bright', bright);
}

function applyFontSize(fontSize: FontSize) {
  const sizes: Record<FontSize, string> = {
    small: '14px',
    medium: '16px',
    large: '18px',
  };
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--font-base-size', sizes[fontSize]);
  }
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [ready, setReady] = useState(false);

  const initialize = useCallback(() => {
    const settings = loadSettings();
    applyTheme(settings.theme);
    applyAccentColor(settings.accentColor);
    applyFontSize(settings.fontSize);
    setReady(true);
  }, []);

  useEffect(() => {
    initialize();

    // Listen for system dark mode changes
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const settings = loadSettings();
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [initialize]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        initialize();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [initialize]);

  if (!ready) return <>{children}</>;

  return <>{children}</>;
}

export default ThemeProvider;
