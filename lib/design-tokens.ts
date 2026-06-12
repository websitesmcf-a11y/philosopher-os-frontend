/** Centralized philosopher identity tokens — bone/gold palette. */
export const PHILOSOPHERS = {
  plato:      { name: 'Plato',      color: '#735C00', gradient: 'linear-gradient(135deg, #735C00, #D4AF37)',   icon: 'Brain',         role: 'Vision & Strategic Direction' },
  socrates:   { name: 'Socrates',   color: '#944925', gradient: 'linear-gradient(135deg, #944925, #FE9E72)',   icon: 'Bot',           role: 'Questioning & Assumption Testing' },
  aristotle:  { name: 'Aristotle',  color: '#4A6741', gradient: 'linear-gradient(135deg, #4A6741, #6B8F5E)',   icon: 'BookOpen',      role: 'Structure, Logic & Systems' },
  athena:     { name: 'Athena',     color: '#2B5F5F', gradient: 'linear-gradient(135deg, #2B5F5F, #3D8A8A)',   icon: 'Shield',        role: 'Strategy & Calculated Advantage' },
  heraclitus: { name: 'Heraclitus', color: '#7A543B', gradient: 'linear-gradient(135deg, #7A543B, #A67B5E)',   icon: 'Search',        role: 'Change, Adaptation & Iteration' },
  pythagoras: { name: 'Pythagoras', color: '#4A4A7A', gradient: 'linear-gradient(135deg, #4A4A7A, #6B6BA5)',   icon: 'BarChart3',     role: 'Numbers, Metrics & Patterns' },
  solon:      { name: 'Solon',      color: '#5B6B3A', gradient: 'linear-gradient(135deg, #5B6B3A, #7A8F52)',   icon: 'Wallet',        role: 'Governance, Rules & Ethics' },
  leonidas:   { name: 'Leonidas',   color: '#8B2020', gradient: 'linear-gradient(135deg, #8B2020, #C0392B)',   icon: 'ShieldCheck',   role: 'Discipline, Execution & Action' },
  archimedes: { name: 'Archimedes', color: '#3B5E7A', gradient: 'linear-gradient(135deg, #3B5E7A, #5282A5)',   icon: 'Wrench',        role: 'Engineering, Building & Solving' },
  odysseus:   { name: 'Odysseus',   color: '#6B3B6B', gradient: 'linear-gradient(135deg, #6B3B6B, #8F528F)',   icon: 'MessageSquare', role: 'Navigation & Multi-Step Missions' },
} as const;

export type PhilosopherKey = keyof typeof PHILOSOPHERS;
