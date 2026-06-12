'use client';

import { MeshGradient, DotOrbit } from '@paper-design/shaders-react';
import { cn } from '@/lib/utils';

interface PaperShaderBackgroundProps {
  className?: string;
  /** Mesh colors — defaults to the bone/gold museum palette. */
  colors?: string[];
  /** 0–1: strength of organic distortion. */
  intensity?: number;
  /** Animation speed. */
  speed?: number;
  /** Layer an orbiting-dot field on top (catalog-dot texture). */
  withDots?: boolean;
}

/**
 * Ambient @paper-design/shaders-react background: a slow, warm mesh
 * gradient over the travertine canvas, optionally textured with orbiting
 * dots. Purely decorative — pointer-events disabled.
 */
export function PaperShaderBackground({
  className,
  colors = ['#FCF9F4', '#F5ECD0', '#EBE8E3', '#D4AF37'],
  intensity = 0.7,
  speed = 0.25,
  withDots = false,
}: PaperShaderBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={colors}
        distortion={intensity}
        swirl={intensity * 0.6}
        speed={speed}
      />
      {withDots && (
        <DotOrbit
          className="absolute inset-0 h-full w-full opacity-15"
          colors={['#735C00', '#D4AF37']}
          colorBack="#00000000"
          size={0.14}
          sizeRange={0.3}
          spreading={0.5}
          speed={speed * 2}
        />
      )}
    </div>
  );
}

export default PaperShaderBackground;
