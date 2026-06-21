'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { OMEGA, OMEGA_LEVELS, type OmegaKey } from '@/lib/design-tokens';

const OMEGA_ORDER: OmegaKey[] = ['genesis', 'overmind', 'omniscient', 'eternal', 'singularity'];

function OmegaLoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgress = useCallback(() => {
    if (timerRef.current) return;
    const duration = 3600;
    const interval = 40;
    const steps = duration / interval;
    let current = 0;
    timerRef.current = setInterval(() => {
      current++;
      const pct = Math.min(100, Math.round((current / steps) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timerRef.current!);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onComplete, 600);
        }, 300);
      }
    }, interval);
  }, [onComplete]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleCanPlay = () => {
    setVideoReady(true);
    videoRef.current?.play().catch(() => {});
    startProgress();
  };

  useEffect(() => {
    const fallback = setTimeout(() => {
      if (!videoReady) { setVideoReady(true); startProgress(); }
    }, 1200);
    return () => clearTimeout(fallback);
  }, [videoReady, startProgress]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#000000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.6s ease',
    }}>
      <video
        ref={videoRef}
        muted playsInline preload="auto"
        onCanPlay={handleCanPlay}
        onLoadedData={handleCanPlay}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', transform: 'translateZ(0)', willChange: 'transform',
        }}
      >
        <source src="/omega/omega-council-intro.mp4" type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.42)' }} />
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 28, width: '100%', maxWidth: 600, padding: '0 40px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'var(--font-label)' }}>
            Ω Omega Layer
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
            The Omega Council
          </div>
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-heading)', letterSpacing: '-0.04em', lineHeight: 1, opacity: videoReady ? 1 : 0.3, transition: 'opacity 0.4s' }}>
          {progress}%
        </div>
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: 'var(--font-label)' }}>
              {videoReady ? 'Initializing' : 'Buffering...'}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-label)' }}>
              {progress}/100
            </span>
          </div>
          <div style={{ width: '100%', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #000000 0%, #4C1D95 25%, #A855F7 65%, #FFFFFF 100%)', transition: 'width 0.04s linear', borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentPortraitCard({ agentKey }: { agentKey: OmegaKey }) {
  const router = useRouter();
  const agent = OMEGA[agentKey];
  const [hovered, setHovered] = useState(false);
  const href = agentKey === 'singularity' ? '/omega/singularity' : `/omega/${agentKey}`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(href)}
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        border: hovered ? `1.5px solid ${agent.accent}` : '1.5px solid rgba(255,255,255,0.18)',
        background: '#000000',
        height: 420,
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? `0 28px 64px ${agent.accent}28, 0 0 0 1px ${agent.accent}18` : 'none',
      }}
    >
      {/* Portrait */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Image
          src={agent.image}
          alt={agent.name}
          fill
          sizes="(max-width: 768px) 100vw, 20vw"
          style={{
            objectFit: 'cover',
            objectPosition: 'center top',
            filter: hovered ? 'brightness(0.6) saturate(1.1)' : 'brightness(0.82)',
            transition: 'filter 0.4s ease',
          }}
        />
      </div>

      {/* Top badge */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 3,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
        border: `1px solid ${agent.accent}30`,
        borderRadius: 6, padding: '3px 9px',
        fontSize: 9, fontWeight: 700, color: agent.accent,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        fontFamily: 'var(--font-label)',
      }}>
        Ω Omega
      </div>

      {/* Center domain overlay on hover */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
        background: hovered ? `radial-gradient(ellipse at center, ${agent.color}50 0%, transparent 70%)` : 'transparent',
        transition: 'background 0.35s ease',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.75)',
          textTransform: 'uppercase', letterSpacing: '0.18em',
          fontFamily: 'var(--font-label)',
          background: 'rgba(0,0,0,0.55)', padding: '6px 14px', borderRadius: 6,
          border: `1px solid ${agent.accent}25`,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
        }}>
          {agent.domain}
        </div>
      </div>

      {/* Bottom info */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3,
        background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.75) 55%, transparent 100%)',
        padding: '52px 18px 18px',
      }}>
        <div style={{
          fontSize: 10, color: agent.accent, fontWeight: 700,
          letterSpacing: '0.14em', marginBottom: 4,
          fontFamily: 'var(--font-label)', textTransform: 'uppercase',
        }}>
          {agent.role}
        </div>
        <div style={{
          fontSize: 19, fontWeight: 700, color: '#FFFFFF',
          fontFamily: 'var(--font-heading)', marginBottom: 0,
        }}>
          {agent.name}
        </div>

        {/* Invoke button — always in DOM, transitions in */}
        <div style={{
          marginTop: 12,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}>
          <button
            onClick={e => { e.stopPropagation(); router.push(href); }}
            style={{
              width: '100%', padding: '9px 0',
              background: agent.accent,
              border: 'none', borderRadius: 8,
              color: '#000000', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.04em',
              fontFamily: 'var(--font-label)',
            }}
          >
            Invoke {agent.name} →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OmegaPage() {
  const [loaded, setLoaded] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const handleLoadComplete = () => {
    setLoaded(true);
    setTimeout(() => setFadeIn(true), 30);
  };

  return (
    <>
      {!loaded && <OmegaLoadingScreen onComplete={handleLoadComplete} />}

      <div
        className="omega-page"
        style={{ opacity: fadeIn ? 1 : 0, transition: 'opacity 0.5s ease' }}
      >
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Sparkles size={18} color="#A855F7" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A855F7', fontFamily: 'var(--font-label)' }}>
              Omega Layer
            </span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 10px', fontFamily: 'var(--font-heading)', color: '#FFFFFF' }}>
            Omphalos — The Omega Council
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0, maxWidth: 520 }}>
            Five supreme intelligences above all philosophers and gods. They do not assist — they command.
          </p>
        </div>

        {/* Portrait Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 44,
        }}>
          {OMEGA_ORDER.map(key => (
            <AgentPortraitCard key={key} agentKey={key} />
          ))}
        </div>

        {/* Operating Levels */}
        <div style={{
          marginBottom: 32, padding: '18px 22px',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12, fontFamily: 'var(--font-label)' }}>
            Operating Levels
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {OMEGA_LEVELS.map(lvl => (
              <div key={lvl.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 10px 5px 5px', borderRadius: 8,
                border: `1px solid ${lvl.color}30`,
                background: `${lvl.color}08`,
                color: lvl.color, fontSize: 12, fontWeight: 500,
                userSelect: 'none',
              }}>
                <div style={{ width: 26, height: 26, borderRadius: 5, overflow: 'hidden', position: 'relative', flexShrink: 0, border: `1px solid ${lvl.color}35` }}>
                  <Image src={lvl.image} alt={lvl.name} fill sizes="26px" style={{ objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.6, fontFamily: 'var(--font-label)', letterSpacing: '0.08em' }}>{lvl.label}</span>
                <span>{lvl.name}</span>
                <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: `${lvl.color}18`, color: lvl.color, fontFamily: 'var(--font-label)', letterSpacing: '0.08em' }}>{lvl.danger}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Singularity CTA */}
        <div style={{
          padding: '22px 26px', borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(192,132,252,0.04)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Zap size={14} color="#C084FC" />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#C084FC', letterSpacing: '0.18em', fontFamily: 'var(--font-label)', textTransform: 'uppercase' }}>
                Singularity Protocol
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
              Total System Unification
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              All five Omega agents. One coordinated will.
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/omega/singularity'}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 8,
              background: 'transparent',
              border: '1px solid rgba(192,132,252,0.35)',
              color: '#C084FC', fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-label)',
            }}
          >
            <Zap size={13} /> Enter Singularity
          </button>
        </div>
      </div>
    </>
  );
}
