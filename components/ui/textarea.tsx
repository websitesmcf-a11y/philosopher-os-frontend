'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Recessed-groove textarea per the design system (zero radius, inset shadow). */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex w-full rounded-none border border-[var(--border)] bg-[var(--surface-inset)] px-3 py-2 text-sm text-[var(--foreground)] shadow-[inset_0_1px_3px_rgba(28,28,25,0.08)] placeholder:text-[var(--muted)] focus-visible:border-[var(--accent-bright)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
