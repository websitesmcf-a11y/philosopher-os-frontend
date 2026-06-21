'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTutorial, TUTORIAL_STEPS } from '@/lib/tutorial-context';
import { X, ArrowRight, ChevronRight } from 'lucide-react';

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 12; // spotlight padding around target

function useTargetRect(selector: string | null, step: number) {
  const [rect, setRect] = useState<Rect | null>(null);

  const measure = useCallback(() => {
    if (!selector) { setRect(null); return; }
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [selector]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure, step]);

  return rect;
}

function Spotlight({ rect }: { rect: Rect }) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const t = rect.top - PAD;
  const l = rect.left - PAD;
  const w = rect.width + PAD * 2;
  const h = rect.height + PAD * 2;

  return (
    <>
      {/* top */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: vw, height: Math.max(0, t), background: 'rgba(0,0,0,0.72)', zIndex: 9998 }} />
      {/* bottom */}
      <div style={{ position: 'fixed', top: t + h, left: 0, width: vw, height: Math.max(0, vh - t - h), background: 'rgba(0,0,0,0.72)', zIndex: 9998 }} />
      {/* left */}
      <div style={{ position: 'fixed', top: t, left: 0, width: Math.max(0, l), height: h, background: 'rgba(0,0,0,0.72)', zIndex: 9998 }} />
      {/* right */}
      <div style={{ position: 'fixed', top: t, left: l + w, width: Math.max(0, vw - l - w), height: h, background: 'rgba(0,0,0,0.72)', zIndex: 9998 }} />
      {/* glow ring */}
      <div style={{
        position: 'fixed', top: t, left: l, width: w, height: h,
        border: '2px solid #E8C96A',
        borderRadius: 10,
        boxShadow: '0 0 0 1px rgba(232,201,106,0.3), 0 0 24px rgba(232,201,106,0.4)',
        zIndex: 9999,
        pointerEvents: 'none',
      }} />
    </>
  );
}

function Arrow({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 10) return null;

  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;

  return (
    <svg
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 10000, pointerEvents: 'none' }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#E8C96A" />
        </marker>
      </defs>
      <path
        d={`M ${from.x} ${from.y} Q ${mx + (dy * 0.3)} ${my - (dx * 0.3)} ${to.x} ${to.y}`}
        fill="none"
        stroke="#E8C96A"
        strokeWidth="2"
        strokeDasharray="6 4"
        markerEnd="url(#arrowhead)"
        opacity="0.85"
      />
    </svg>
  );
}

function Popover({
  step,
  rect,
  placement,
  title,
  body,
  unlocked,
  stepIndex,
  total,
  onNext,
  onSkip,
}: {
  step: number;
  rect: Rect | null;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  title: string;
  body: string;
  unlocked: boolean;
  stepIndex: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [arrowFrom, setArrowFrom] = useState<{ x: number; y: number } | null>(null);
  const [arrowTo, setArrowTo] = useState<{ x: number; y: number } | null>(null);

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080;

  useEffect(() => {
    if (!popRef.current) return;
    const pop = popRef.current.getBoundingClientRect();
    const pw = pop.width;
    const ph = pop.height;

    if (!rect || placement === 'center') {
      setPos({ top: (vh - ph) / 2, left: (vw - pw) / 2 });
      setArrowFrom(null);
      setArrowTo(null);
      return;
    }

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let top = 0, left = 0;

    if (placement === 'right') {
      top = Math.max(16, cy - ph / 2);
      left = rect.left + rect.width + PAD + 20;
    } else if (placement === 'left') {
      top = Math.max(16, cy - ph / 2);
      left = rect.left - pw - PAD - 20;
    } else if (placement === 'bottom') {
      top = rect.top + rect.height + PAD + 20;
      left = Math.max(16, Math.min(vw - pw - 16, cx - pw / 2));
    } else {
      top = rect.top - ph - PAD - 20;
      left = Math.max(16, Math.min(vw - pw - 16, cx - pw / 2));
    }

    // Clamp to viewport
    top = Math.max(16, Math.min(vh - ph - 16, top));
    left = Math.max(16, Math.min(vw - pw - 16, left));
    setPos({ top, left });

    // Arrow: from edge of popover → edge of spotlight
    const popCx = left + pw / 2;
    const popCy = top + ph / 2;
    if (placement === 'right') {
      setArrowFrom({ x: left, y: top + ph / 2 });
      setArrowTo({ x: rect.left - PAD - 2, y: cy });
    } else if (placement === 'left') {
      setArrowFrom({ x: left + pw, y: top + ph / 2 });
      setArrowTo({ x: rect.left + rect.width + PAD + 2, y: cy });
    } else if (placement === 'bottom') {
      setArrowFrom({ x: popCx, y: top });
      setArrowTo({ x: cx, y: rect.top + rect.height + PAD + 2 });
    } else {
      setArrowFrom({ x: popCx, y: top + ph });
      setArrowTo({ x: cx, y: rect.top - PAD - 2 });
    }
  }, [rect, placement, step, vw, vh]);

  const isLast = stepIndex === total - 1;

  return (
    <>
      {arrowFrom && arrowTo && <Arrow from={arrowFrom} to={arrowTo} />}
      <div
        ref={popRef}
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          width: 320,
          background: '#1A1A2E',
          border: '1px solid rgba(232,201,106,0.4)',
          borderRadius: 14,
          padding: '22px 22px 18px',
          zIndex: 10001,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          fontFamily: 'var(--font-sans, sans-serif)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#E8C96A', marginBottom: 4, fontWeight: 600 }}>
              Step {stepIndex + 1} of {total}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#F5F0E8', lineHeight: 1.25 }}>{title}</div>
          </div>
          <button onClick={onSkip} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'rgba(245,240,232,0.4)', flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((stepIndex + 1) / total) * 100}%`, background: 'linear-gradient(90deg, #E8C96A, #B8943A)', borderRadius: 2, transition: 'width 0.3s ease' }} />
        </div>

        {/* Body */}
        <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.8)', lineHeight: 1.6, margin: '0 0 18px' }}>{body}</p>

        {/* Unlock hint */}
        {!unlocked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(232,201,106,0.08)', borderRadius: 8, marginBottom: 14, border: '1px solid rgba(232,201,106,0.2)' }}>
            <ArrowRight size={13} color="#E8C96A" />
            <span style={{ fontSize: 12, color: '#E8C96A' }}>Complete the action above to continue</span>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={onSkip}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'rgba(245,240,232,0.35)', padding: 0 }}
          >
            Skip tour
          </button>
          <button
            onClick={onNext}
            disabled={!unlocked}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 8, border: 'none', cursor: unlocked ? 'pointer' : 'not-allowed',
              background: unlocked ? 'linear-gradient(135deg, #E8C96A, #B8943A)' : 'rgba(255,255,255,0.1)',
              color: unlocked ? '#1A1A2E' : 'rgba(255,255,255,0.3)',
              fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
            }}
          >
            {isLast ? 'Finish' : 'Next'}
            {!isLast && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </>
  );
}

export function TutorialOverlay() {
  const { active, step, currentStep, total, unlocked, next, skip, unlock } = useTutorial();
  const rect = useTargetRect(active ? currentStep.target : null, step);

  // Detect forced interactions.
  useEffect(() => {
    if (!active || unlocked) return;
    const sel = currentStep.target;
    if (!sel) return;

    if (currentStep.action === 'click') {
      const el = document.querySelector(sel);
      if (!el) return;
      const handler = () => unlock();
      el.addEventListener('click', handler);
      return () => el.removeEventListener('click', handler);
    }

    if (currentStep.action === 'type') {
      const input = document.querySelector(`${sel} input, ${sel} textarea, ${sel}`) as HTMLElement | null;
      if (!input) return;
      const handler = (e: Event) => {
        const v = (e.target as HTMLInputElement).value;
        if (v && v.trim().length > 2) unlock();
      };
      input.addEventListener('input', handler);
      return () => input.removeEventListener('input', handler);
    }
  }, [active, step, unlocked, currentStep, unlock]);

  if (!active) return null;

  return (
    <>
      {/* Full-screen dark overlay for center steps (no target) */}
      {!currentStep.target && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 9998 }} />
      )}

      {/* Spotlight for targeted steps */}
      {rect && <Spotlight rect={rect} />}

      {/* Popover */}
      <Popover
        step={step}
        rect={rect}
        placement={currentStep.placement}
        title={currentStep.title}
        body={currentStep.body}
        unlocked={unlocked}
        stepIndex={step}
        total={total}
        onNext={next}
        onSkip={skip}
      />
    </>
  );
}
