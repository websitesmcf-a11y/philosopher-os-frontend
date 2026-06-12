'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useModeStore, getModeIcon, type PhilosopherKey } from '@/lib/mode-store';

/**
 * Philosopher mode selector. Switching modes is a full behavioral override:
 * accent color, layout density, and motion all change via ModeProvider,
 * and the chat agent follows the active mode.
 */
export function ModePicker() {
  const currentMode = useModeStore(s => s.currentMode);
  const config = useModeStore(s => s.config);
  const availableModes = useModeStore(s => s.availableModes);
  const setMode = useModeStore(s => s.setMode);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Avoid hydration mismatch from the persisted store
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!mounted) return null;

  const CurrentIcon = getModeIcon(currentMode);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="stone-hover"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', cursor: 'pointer',
          border: '1px solid var(--border)', background: 'var(--surface)',
          color: 'var(--foreground)',
        }}
      >
        <span style={{
          width: 8, height: 8, background: config.accentColor, flexShrink: 0,
        }} />
        <CurrentIcon size={14} className="shrink-0" />
        <span style={{
          fontSize: 11, fontFamily: 'var(--font-label)', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {config.name}
        </span>
        <ChevronDown size={12} style={{
          transition: 'transform 150ms var(--ease-out)',
          transform: open ? 'rotate(180deg)' : 'none',
          color: 'var(--muted)',
        }} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Philosopher mode"
          className="slide-up"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 60,
            width: 340, maxHeight: 'min(560px, 70vh)', overflowY: 'auto',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-museum)',
          }}
        >
          <div style={{
            padding: '10px 14px', borderBottom: '0.5px solid var(--border)',
            fontSize: 10, fontFamily: 'var(--font-label)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'var(--muted)',
          }}>
            The Council — choose a mode
          </div>
          {availableModes.map(mode => {
            const Icon = getModeIcon(mode.mode as PhilosopherKey);
            const isActive = mode.mode === currentMode;
            return (
              <button
                key={mode.mode}
                role="option"
                aria-selected={isActive}
                onClick={() => { setMode(mode.mode); setOpen(false); }}
                className="stone-hover"
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%',
                  padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                  background: isActive ? `${mode.accentColor}0d` : 'transparent',
                  border: 'none',
                  borderLeft: isActive ? `3px solid ${mode.accentColor}` : '3px solid transparent',
                  borderBottom: '0.5px solid var(--border-light)',
                }}
              >
                <div style={{
                  width: 32, height: 32, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${mode.accentColor}15`,
                  color: mode.accentColor,
                }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: 15, fontWeight: 500, color: 'var(--foreground)',
                      fontFamily: 'var(--font-heading)',
                    }}>
                      {mode.name}
                    </span>
                    {isActive && <Check size={13} style={{ color: mode.accentColor }} />}
                  </div>
                  <div style={{
                    fontSize: 12, color: 'var(--foreground-secondary)',
                    lineHeight: 1.45, marginTop: 2,
                  }}>
                    {mode.description}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <span style={{
                      fontSize: 9.5, fontFamily: 'var(--font-mono)', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      padding: '1px 6px', border: '1px solid var(--border)',
                      color: 'var(--muted)',
                    }}>
                      {mode.layoutDensity}
                    </span>
                    <span style={{
                      fontSize: 9.5, fontFamily: 'var(--font-mono)', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      padding: '1px 6px', border: '1px solid var(--border)',
                      color: 'var(--muted)',
                    }}>
                      {mode.motionEnabled ? 'motion' : 'still'}
                    </span>
                    <span style={{
                      fontSize: 9.5, fontFamily: 'var(--font-mono)', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      padding: '1px 6px', border: '1px solid var(--border)',
                      color: 'var(--muted)',
                    }}>
                      {mode.infoHierarchy}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
