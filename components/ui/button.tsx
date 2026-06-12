'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Monolithic, sharp-edged button per the museum-grade design system:
 * zero radius, 1px borders, ghost default, "sink" on press.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium cursor-pointer transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 outline-none active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--accent-bright)] text-[var(--foreground)] border border-[var(--accent)] hover:bg-[#C8A32E]',
        outline:
          'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[rgba(28,28,25,0.03)]',
        ghost:
          'border border-transparent bg-transparent text-[var(--foreground)] hover:bg-[rgba(28,28,25,0.03)]',
        secondary:
          'bg-[var(--surface-inset)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-variant)]',
        destructive:
          'bg-[var(--error)] text-white border border-[var(--error)] hover:opacity-90',
        link: 'border-none bg-transparent text-[var(--accent)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
