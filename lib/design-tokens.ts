/** Philosopher OS — Centralized agent identity tokens. */

export const PHILOSOPHERS = {
  plato:      { name: 'Plato',      color: '#123C69', gradient: 'linear-gradient(135deg, #123C69, #1A5088)',   icon: 'Brain',         role: 'Vision & Strategic Direction' },
  socrates:   { name: 'Socrates',   color: '#6F7D4F', gradient: 'linear-gradient(135deg, #6F7D4F, #8FA06A)',   icon: 'Bot',           role: 'Questioning & Assumption Testing' },
  aristotle:  { name: 'Aristotle',  color: '#5B6B3A', gradient: 'linear-gradient(135deg, #5B6B3A, #7A8F52)',   icon: 'BookOpen',      role: 'Structure, Logic & Systems' },
  athena:     { name: 'Athena',     color: '#2B5F6B', gradient: 'linear-gradient(135deg, #2B5F6B, #3D8A9A)',   icon: 'Shield',        role: 'Strategy & Calculated Advantage' },
  heraclitus: { name: 'Heraclitus', color: '#C9A24D', gradient: 'linear-gradient(135deg, #C9A24D, #D4B36A)',   icon: 'Search',        role: 'Change, Adaptation & Iteration' },
  pythagoras: { name: 'Pythagoras', color: '#4A4A7A', gradient: 'linear-gradient(135deg, #4A4A7A, #6B6BA5)',   icon: 'BarChart3',     role: 'Numbers, Metrics & Patterns' },
  solon:      { name: 'Solon',      color: '#3B6B5E', gradient: 'linear-gradient(135deg, #3B6B5E, #4D8E7D)',   icon: 'Gavel',         role: 'Governance, Rules & Ethics' },
  leonidas:   { name: 'Leonidas',   color: '#8B2020', gradient: 'linear-gradient(135deg, #8B2020, #C0392B)',   icon: 'Swords',        role: 'Discipline, Execution & Action' },
  archimedes: { name: 'Archimedes', color: '#3B5E7A', gradient: 'linear-gradient(135deg, #3B5E7A, #5282A5)',   icon: 'Wrench',        role: 'Engineering, Building & Solving' },
  odysseus:   { name: 'Odysseus',   color: '#6B3B6B', gradient: 'linear-gradient(135deg, #6B3B6B, #8F528F)',   icon: 'Compass',       role: 'Navigation & Multi-Step Missions' },
} as const;

export const GODS = {
  iapetus:    { name: 'Iapetus',    color: '#123C69', gradient: 'linear-gradient(135deg, #123C69, #1A5088)',   icon: 'Zap',           role: 'Master Workflow Executor', domain: 'Execution' },
  astraeus:   { name: 'Astraeus',   color: '#7B5EA7', gradient: 'linear-gradient(135deg, #7B5EA7, #9B7EC7)',   icon: 'Eye',           role: 'Intelligence & Opportunity Detection', domain: 'Signals' },
  erebos:     { name: 'Erebos',     color: '#171A21', gradient: 'linear-gradient(135deg, #171A21, #2D3240)',   icon: 'Trash2',        role: 'Data Cleanup & Risk Recovery', domain: 'Integrity' },
  phantasos:  { name: 'Phantasos',  color: '#C9A24D', gradient: 'linear-gradient(135deg, #C9A24D, #D4B36A)',   icon: 'PenLine',       role: 'Creative Outreach & Personalization', domain: 'Creative' },
  stilbon:    { name: 'Stilbon',    color: '#6F7D4F', gradient: 'linear-gradient(135deg, #6F7D4F, #8FA06A)',   icon: 'Send',          role: 'Speed Messenger & Communication', domain: 'Delivery' },
} as const;

export type PhilosopherKey = keyof typeof PHILOSOPHERS;
export type GodKey = keyof typeof GODS;
export type AgentKey = PhilosopherKey | GodKey;

/** Palette constants for UI use. */
export const PALETTE = {
  background: '#F7F2E8',
  foreground: '#171A21',
  accent: '#123C69',
  accentBright: '#1A5088',
  gold: '#C9A24D',
  goldBright: '#D4B36A',
  olive: '#6F7D4F',
  purple: '#7B5EA7',
  sidebar: '#0F1722',
  sidebarAccent: '#123C69',
} as const;
