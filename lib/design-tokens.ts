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

export const OMEGA = {
  genesis:     { name: 'Genesis',     color: '#6B21A8', gradient: 'linear-gradient(135deg, #3B0764, #6B21A8)',   role: 'The Creator',            domain: 'System Creation',       image: '/omega/genesis.png',     accent: '#A855F7' },
  overmind:    { name: 'Overmind',    color: '#92400E', gradient: 'linear-gradient(135deg, #451A03, #92400E)',   role: 'The Conqueror',          domain: 'Market Domination',     image: '/omega/overmind.png',    accent: '#F59E0B' },
  omniscient:  { name: 'Omniscient',  color: '#4C1D95', gradient: 'linear-gradient(135deg, #1E0050, #4C1D95)',   role: 'The Seer',               domain: 'Truth & Memory',        image: '/omega/singularity.png', accent: '#8B5CF6' },
  eternal:     { name: 'Eternal',     color: '#1E3A5F', gradient: 'linear-gradient(135deg, #0A1628, #1E3A5F)',   role: 'The Constant',           domain: 'Persistence & Time',    image: '/omega/eternal.png',     accent: '#38BDF8' },
  singularity: { name: 'Singularity', color: '#2D0057', gradient: 'linear-gradient(135deg, #0D0020, #2D0057)',   role: 'The End of All',         domain: 'Total Unification',     image: '/omega/omniscient.png',  accent: '#C084FC' },
} as const;

export const OMEGA_LEVELS = [
  { id: 'harmony',     label: 'Level I',   name: 'Harmony',     color: '#6B7280', desc: 'Analysis only. No actions taken.',              danger: 'SAFE',   image: '/omega/levels/harmony.png' },
  { id: 'convergence', label: 'Level II',  name: 'Convergence', color: '#2563EB', desc: 'Creates plans, drafts, and internal assets.',   danger: 'LOW',    image: '/omega/levels/convergence.png' },
  { id: 'dominion',    label: 'Level III', name: 'Dominion',    color: '#D97706', desc: 'Executes internal work. Pauses for external.',  danger: 'MEDIUM', image: '/omega/levels/dominion.png' },
  { id: 'ascension',   label: 'Level IV',  name: 'Ascension',   color: '#DC2626', desc: 'Full system coordination. All tools active.',   danger: 'HIGH',   image: '/omega/levels/ascension.png' },
] as const;

export type PhilosopherKey = keyof typeof PHILOSOPHERS;
export type GodKey = keyof typeof GODS;
export type OmegaKey = keyof typeof OMEGA;
export type AgentKey = PhilosopherKey | GodKey | OmegaKey;

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
