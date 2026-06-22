'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export type TutorialStep = {
  id: string;
  title: string;
  body: string;
  // CSS selector for the element to spotlight. null = full-screen card (no spotlight).
  target: string | null;
  // Where to position the popover relative to the target.
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  // Route the user must be on for this step to be relevant.
  route?: string;
  // User must perform this action before Next unlocks.
  // 'click'    — click the target element
  // 'navigate' — navigate to targetRoute (detected via pathname change)
  // 'type'     — type into an <input> or <textarea> inside target
  // 'auto'     — advance automatically after 1.5 s (no forced interaction)
  // null       — Next button always available
  action: 'click' | 'navigate' | 'type' | 'auto' | null;
  // Route the user must navigate TO (used with action='navigate').
  targetRoute?: string;
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Philosopher OS',
    body: "You have 20 AI agents ready to run your business — finding leads, sending outreach, tracking finances, and more. This tour takes 2 minutes. Let's go.",
    target: null,
    placement: 'center',
    action: null,
  },
  {
    id: 'sidebar-agents',
    title: 'Your AI Council',
    body: 'These are your Philosopher agents — each one owns a domain: leads, finance, outreach, strategy. Click "Akademia" in the sidebar to meet them.',
    target: '[data-tutorial="sidebar-agents"]',
    placement: 'right',
    action: 'navigate',
    targetRoute: '/agents',
  },
  {
    id: 'agents-chat',
    title: 'Talk to Plato',
    body: 'Click on Plato and ask him anything — try "What can you do?" or "Find me 5 plumbers in Cape Town". Type a message and hit Send.',
    target: '[data-tutorial="chat-input"]',
    placement: 'top',
    route: '/agents',
    action: 'type',
  },
  {
    id: 'sidebar-leads',
    title: 'Your Lead Database',
    body: "Every business you discover gets saved here. Navigate to Xenoi (Leads) — it's your CRM.",
    target: '[data-tutorial="sidebar-leads"]',
    placement: 'right',
    action: 'navigate',
    targetRoute: '/leads',
  },
  {
    id: 'sidebar-campaigns',
    title: 'Run Outreach Campaigns',
    body: 'Once you have leads, launch WhatsApp or email drip campaigns from here. Navigate to Campaigns.',
    target: '[data-tutorial="sidebar-campaigns"]',
    placement: 'right',
    action: 'navigate',
    targetRoute: '/campaigns',
  },
  {
    id: 'sidebar-connections',
    title: 'Connect Your Tools',
    body: 'WhatsApp, email, Facebook — connect them here so your agents can actually send messages. Navigate to Integrations.',
    target: '[data-tutorial="sidebar-connections"]',
    placement: 'right',
    action: 'navigate',
    targetRoute: '/connections',
  },
  {
    id: 'sidebar-mission',
    title: 'Mission Control',
    body: 'The Strategeion is your command centre. Launch full AI-driven missions: find 500 leads, qualify them, run outreach — all in one click.',
    target: '[data-tutorial="sidebar-mission"]',
    placement: 'right',
    action: 'navigate',
    targetRoute: '/mission',
  },
  {
    id: 'done',
    title: "You're ready",
    body: 'The council is assembled. Ask Plato to start a lead gen mission and watch your agents work. Welcome to Philosopher OS.',
    target: null,
    placement: 'center',
    action: 'auto',
  },
];

type TutorialCtx = {
  active: boolean;
  step: number;
  currentStep: TutorialStep;
  total: number;
  unlocked: boolean; // Next button enabled?
  start: () => void;
  next: () => void;
  skip: () => void;
  unlock: () => void; // called when user completes the forced action
};

const Ctx = createContext<TutorialCtx | null>(null);

export function useTutorial() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTutorial must be used inside TutorialProvider');
  return ctx;
}

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  const currentStep = TUTORIAL_STEPS[step];

  // Auto-start tutorial for new users (no tutorial_done flag).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const done = localStorage.getItem('tutorial_done');
    if (!done) {
      // Small delay so layout renders before we measure element positions.
      const t = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  // Detect navigation for action='navigate' steps.
  useEffect(() => {
    if (!active) return;
    if (currentStep.action === 'navigate' && currentStep.targetRoute) {
      if (pathname === currentStep.targetRoute) {
        setUnlocked(true);
      }
    }
  }, [pathname, active, currentStep]);

  // Auto-advance for action='auto'.
  useEffect(() => {
    if (!active) return;
    if (currentStep.action === 'auto') {
      const t = setTimeout(() => {
        complete();
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [active, step]);

  // Reset unlock when step changes.
  useEffect(() => {
    const s = TUTORIAL_STEPS[step];
    // Steps with no forced action start as unlocked.
    setUnlocked(!s.action || s.action === 'auto');
  }, [step]);

  const next = useCallback(() => {
    if (!unlocked) return;
    if (step >= TUTORIAL_STEPS.length - 1) {
      complete();
    } else {
      setStep(s => s + 1);
    }
  }, [step, unlocked]);

  const complete = useCallback(() => {
    setActive(false);
    localStorage.setItem('tutorial_done', '1');
  }, []);

  const skip = useCallback(() => complete(), [complete]);

  const start = useCallback(() => {
    setStep(0);
    setActive(true);
    localStorage.removeItem('tutorial_done');
  }, []);

  const unlock = useCallback(() => setUnlocked(true), []);

  return (
    <Ctx.Provider value={{ active, step, currentStep, total: TUTORIAL_STEPS.length, unlocked, start, next, skip, unlock }}>
      {children}
    </Ctx.Provider>
  );
}
