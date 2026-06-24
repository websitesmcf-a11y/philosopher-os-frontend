'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Brain, Bot, BookOpen, Shield, Search, BarChart3, Wallet, ShieldCheck, Wrench, MessageSquare } from 'lucide-react';
import type { ComponentType } from 'react';

export type PhilosopherKey = 'plato' | 'socrates' | 'aristotle' | 'leonidas'
  | 'athena' | 'heraclitus' | 'pythagoras' | 'solon' | 'archimedes' | 'odysseus';

export type LayoutDensity = 'spacious' | 'normal' | 'dense';
export type InfoHierarchy = 'vision' | 'details' | 'metrics' | 'actions';

export interface ModeConfig {
  mode: PhilosopherKey;
  name: string;
  layoutDensity: LayoutDensity;
  motionEnabled: boolean;
  infoHierarchy: InfoHierarchy;
  tone: string;
  accentColor: string;
  description: string;
}

export interface ModeState {
  currentMode: PhilosopherKey;
  config: ModeConfig;
  availableModes: ModeConfig[];
  setMode: (mode: PhilosopherKey) => void;
}

export const MODE_PROFILES: Record<PhilosopherKey, ModeConfig> = {
  plato: {
    mode: 'plato', name: 'Plato',
    layoutDensity: 'spacious', motionEnabled: true, infoHierarchy: 'vision',
    tone: 'philosophical', accentColor: '#735C00',
    description: 'Vision, ideals, long-term direction & brand philosophy',
  },
  socrates: {
    mode: 'socrates', name: 'Socrates',
    layoutDensity: 'normal', motionEnabled: false, infoHierarchy: 'details',
    tone: 'questioning', accentColor: '#944925',
    description: 'Questioning, interrogation & assumption testing',
  },
  aristotle: {
    mode: 'aristotle', name: 'Aristotle',
    layoutDensity: 'normal', motionEnabled: false, infoHierarchy: 'details',
    tone: 'structured', accentColor: '#4A6741',
    description: 'Structure, logic, categorisation & systems',
  },
  leonidas: {
    mode: 'leonidas', name: 'Leonidas',
    layoutDensity: 'dense', motionEnabled: true, infoHierarchy: 'actions',
    tone: 'commanding', accentColor: '#8B2020',
    description: 'Discipline, execution, direct action & intensity',
  },
  athena: {
    mode: 'athena', name: 'Athena',
    layoutDensity: 'normal', motionEnabled: true, infoHierarchy: 'vision',
    tone: 'strategic', accentColor: '#2B5F5F',
    description: 'Strategy, wisdom, calculated advantage & tactical judgment',
  },
  heraclitus: {
    mode: 'heraclitus', name: 'Heraclitus',
    layoutDensity: 'normal', motionEnabled: true, infoHierarchy: 'details',
    tone: 'reflective', accentColor: '#7A543B',
    description: 'Change, adaptation, iteration & transformation',
  },
  pythagoras: {
    mode: 'pythagoras', name: 'Pythagoras',
    layoutDensity: 'dense', motionEnabled: false, infoHierarchy: 'metrics',
    tone: 'precise', accentColor: '#4A4A7A',
    description: 'Numbers, patterns, metrics & performance tracking',
  },
  solon: {
    mode: 'solon', name: 'Solon',
    layoutDensity: 'normal', motionEnabled: false, infoHierarchy: 'details',
    tone: 'authoritative', accentColor: '#5B6B3A',
    description: 'Governance, rules, contracts & accountability',
  },
  archimedes: {
    mode: 'archimedes', name: 'Archimedes',
    layoutDensity: 'dense', motionEnabled: false, infoHierarchy: 'actions',
    tone: 'technical', accentColor: '#3B5E7A',
    description: 'Engineering, building, solving & mechanisms',
  },
  odysseus: {
    mode: 'odysseus', name: 'Odysseus',
    layoutDensity: 'normal', motionEnabled: true, infoHierarchy: 'actions',
    tone: 'motivational', accentColor: '#6B3B6B',
    description: 'Navigation, resourcefulness & multi-step missions',
  },
};

/** Lucide icon component map for each mode. */
const MODE_ICONS: Record<PhilosopherKey, ComponentType<{ size?: number; className?: string }>> = {
  plato: Brain, socrates: Bot, aristotle: BookOpen, leonidas: ShieldCheck,
  athena: Shield, heraclitus: Search, pythagoras: BarChart3, solon: Wallet,
  archimedes: Wrench, odysseus: MessageSquare,
};

export function getModeIcon(mode: PhilosopherKey) {
  return MODE_ICONS[mode] || Brain;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      currentMode: 'plato',
      config: MODE_PROFILES.plato,
      availableModes: Object.values(MODE_PROFILES),
      setMode: (mode) => {
        const profile = MODE_PROFILES[mode];
        if (!profile) return; // God/Titan agents are not philosopher modes — ignore
        set({ currentMode: mode, config: profile });
      },
    }),
    { name: 'philosopher-mode' }
  )
);

export const useModeConfig = () => useModeStore(s => s.config);
export const useAccentColor = () => useModeStore(s => s.config.accentColor);
export const useLayoutDensity = () => useModeStore(s => s.config.layoutDensity);
export const useMotionEnabled = () => useModeStore(s => s.config.motionEnabled);
export const useInfoHierarchy = () => useModeStore(s => s.config.infoHierarchy);
