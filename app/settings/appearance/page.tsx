'use client';

import { useState, useEffect } from 'react';
import { Palette, ArrowLeft, Sun, Moon, Monitor, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

const STORAGE_KEY = 'philosopher_appearance_settings';

const ACCENT_COLORS = [
  { name: 'Navy', value: '#123C69' },
  { name: 'Olive', value: '#6F7D4F' },
  { name: 'Burgundy', value: '#8B2020' },
  { name: 'Gold', value: '#C9A24D' },
  { name: 'Forest', value: '#4A6741' },
] as const;

type ThemeMode = 'light' | 'dark' | 'system';

interface AppearanceSettings {
  theme: ThemeMode;
  accentColor: string;
}

const DEFAULT_SETTINGS: AppearanceSettings = {
  theme: 'light',
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
    // ignore
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
  // Derive sub-variants
  root.style.setProperty('--accent-subtle', `${color}12`);
  root.style.setProperty('--accent-light', `${color}30`);

  // Bright variant (slightly lightened)
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const bright = `#${Math.min(255, r + 20).toString(16).padStart(2, '0')}${Math.min(255, g + 20).toString(16).padStart(2, '0')}${Math.min(255, b + 20).toString(16).padStart(2, '0')}`;
  root.style.setProperty('--accent-bright', bright);
}

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function AppearanceSettingsPage() {
  const [loaded, setLoaded] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [accentColor, setAccentColor] = useState('#123C69');

  useEffect(() => {
    const saved = loadSettings();
    setTheme(saved.theme);
    setAccentColor(saved.accentColor);
    setLoaded(true);
    // Apply on mount
    applyTheme(saved.theme);
    applyAccentColor(saved.accentColor);
  }, []);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    persistSettings({ theme: newTheme, accentColor });
  };

  const handleAccentChange = (newColor: string) => {
    setAccentColor(newColor);
    applyAccentColor(newColor);
    persistSettings({ theme, accentColor: newColor });
  };

  const persistSettings = (settings: AppearanceSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // storage full or unavailable
    }
  };

  // Preview content reflects current settings
  const previewText = 'The quick brown fox jumps over the lazy dog.';

  if (!loaded) {
    return (
      <div className="page-content fade-in">
        <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Settings
        </Link>
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Loader2 size={28} color="var(--muted)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-content fade-in">
      <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Settings
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Appearance</h1>
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
          Theme and display settings
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>

        {/* Theme Selector */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, fontFamily: 'var(--font-heading)' }}>Theme</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {THEME_OPTIONS.map(option => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 8px',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 6,
                    background: isActive ? 'var(--accent-subtle)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {isActive && (
                    <span style={{ position: 'absolute', top: 6, right: 6 }}>
                      <Check size={14} color="var(--accent)" strokeWidth={3} />
                    </span>
                  )}
                  <Icon size={22} color={isActive ? 'var(--accent)' : 'var(--muted)'} strokeWidth={1.5} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: isActive ? 'var(--accent)' : 'var(--foreground-secondary)' }}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, fontFamily: 'var(--font-heading)' }}>Accent Color</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            {ACCENT_COLORS.map(color => {
              const isActive = accentColor === color.value;
              return (
                <button
                  key={color.value}
                  onClick={() => handleAccentChange(color.value)}
                  title={color.name}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    border: isActive ? '3px solid var(--foreground)' : '2px solid var(--border)',
                    background: color.value,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {isActive && (
                    <Check size={18} color="#fff" strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
            Changes apply immediately to the interface
          </p>
        </div>

        {/* Preview */}
        <div className="card" style={{ padding: 24, borderLeft: `3px solid ${accentColor}` }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, fontFamily: 'var(--font-heading)' }}>Preview</h2>
          <div
            style={{
              padding: 20,
              background: 'var(--surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 6,
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-heading)', color: 'var(--foreground)' }}>
              Sample Heading
            </h3>
            <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginBottom: 12, lineHeight: 1.6 }}>
              {previewText} {previewText.toLowerCase()}
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: accentColor,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 4,
                }}
              >
                Button
              </span>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  border: `1px solid var(--border)`,
                  fontSize: 12,
                  fontWeight: 500,
                  borderRadius: 4,
                  color: 'var(--foreground)',
                }}
              >
                Secondary
              </span>
              <span style={{ fontSize: 12, color: accentColor, fontWeight: 500 }}>Link</span>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="badge" style={{ borderColor: accentColor, color: accentColor }}>Badge</span>
              <span className="badge" style={{ background: accentColor, color: '#fff', borderColor: accentColor }}>Filled</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
