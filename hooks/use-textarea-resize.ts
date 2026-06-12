'use client';

import { useLayoutEffect, useRef } from 'react';
import type { ComponentProps } from 'react';

/** Auto-grows a textarea to fit its content, capped at 240px. */
export function useTextareaResize(
  value: ComponentProps<'textarea'>['value'],
  rows = 1,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textArea = textareaRef.current;
    if (!textArea) return;

    const computedStyle = window.getComputedStyle(textArea);
    const lineHeight = Number.parseFloat(computedStyle.lineHeight) || 20;
    const padding =
      Number.parseFloat(computedStyle.paddingTop) +
      Number.parseFloat(computedStyle.paddingBottom);
    const minHeight = lineHeight * rows + padding;

    textArea.style.height = '0px';
    const scrollHeight = Math.max(textArea.scrollHeight, minHeight);
    textArea.style.height = `${Math.min(scrollHeight, 240)}px`;
  }, [value, rows]);

  return textareaRef;
}
