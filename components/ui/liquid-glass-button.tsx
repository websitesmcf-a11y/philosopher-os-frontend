'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────────────
   LiquidButton — glass-distortion CTA (uses an SVG displacement filter).
   ──────────────────────────────────────────────────────────────────────── */

const liquidButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium cursor-pointer transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none active:translate-y-px relative overflow-hidden [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'text-[var(--foreground)]',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-12 px-8',
        xl: 'h-14 px-10 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function GlassFilter() {
  return (
    <svg className="hidden" aria-hidden>
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidButtonVariants> {
  asChild?: boolean;
}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(liquidButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span
          aria-hidden
          className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(28,28,25,0.12),0_0_0_1px_var(--border)]"
        />
        <span
          aria-hidden
          className="absolute inset-0 isolate -z-10 overflow-hidden"
          style={{ backdropFilter: 'url("#container-glass")' }}
        />
        <span className="pointer-events-none relative z-10 inline-flex items-center gap-2">
          {children}
        </span>
        <GlassFilter />
      </Comp>
    );
  },
);
LiquidButton.displayName = 'LiquidButton';

/* ────────────────────────────────────────────────────────────────────────
   MetalButton — machined-metal CTA. The "gold" variant is the primary
   call-to-action finish in the museum-grade design system.
   ──────────────────────────────────────────────────────────────────────── */

const metalVariants = {
  default: {
    outer: 'linear-gradient(180deg, #B8B5AE 0%, #6E6B64 100%)',
    inner: 'linear-gradient(180deg, #F5F2ED 0%, #D8D5CE 65%, #C8C5BE 100%)',
    text: '#1C1C19',
    shadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -2px 3px rgba(28,28,25,0.18)',
  },
  gold: {
    outer: 'linear-gradient(180deg, #D4AF37 0%, #735C00 100%)',
    inner: 'linear-gradient(180deg, #E9C349 0%, #D4AF37 60%, #B8962E 100%)',
    text: '#241A00',
    shadow: 'inset 0 1px 0 rgba(255,236,170,0.7), inset 0 -2px 3px rgba(85,67,0,0.35)',
  },
  bronze: {
    outer: 'linear-gradient(180deg, #C08552 0%, #773310 100%)',
    inner: 'linear-gradient(180deg, #D89B6A 0%, #B5743F 60%, #9A5E2E 100%)',
    text: '#360F00',
    shadow: 'inset 0 1px 0 rgba(255,219,205,0.6), inset 0 -2px 3px rgba(55,15,0,0.35)',
  },
  primary: {
    outer: 'linear-gradient(180deg, #4D4635 0%, #1C1C19 100%)',
    inner: 'linear-gradient(180deg, #4A4A44 0%, #31302D 60%, #25241F 100%)',
    text: '#F3F0EB',
    shadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -2px 3px rgba(0,0,0,0.45)',
  },
} as const;

export interface MetalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof metalVariants;
}

const MetalButton = React.forwardRef<HTMLButtonElement, MetalButtonProps>(
  ({ className, variant = 'gold', children, disabled, ...props }, ref) => {
    const [pressed, setPressed] = React.useState(false);
    const finish = metalVariants[variant] ?? metalVariants.gold;

    return (
      <button
        ref={ref}
        disabled={disabled}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        className={cn(
          'inline-flex cursor-pointer items-center justify-center rounded-none p-[1px] text-sm font-medium outline-none transition-transform duration-100 disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        style={{
          background: finish.outer,
          transform: pressed ? 'translateY(1px)' : undefined,
        }}
        {...props}
      >
        <span
          className="inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 transition-shadow duration-100"
          style={{
            background: finish.inner,
            color: finish.text,
            boxShadow: pressed
              ? 'inset 0 2px 4px rgba(28,28,25,0.35)'
              : finish.shadow,
            letterSpacing: '0.02em',
          }}
        >
          {children}
        </span>
      </button>
    );
  },
);
MetalButton.displayName = 'MetalButton';

export { LiquidButton, MetalButton };
