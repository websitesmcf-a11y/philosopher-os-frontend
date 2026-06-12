'use client';

import { useEffect } from 'react';

const BASE = 'Socrates AI';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : BASE;
  }, [title]);
}
