/**
 * Philosopher OS — Centralized Visual Asset Registry
 *
 * Every image/video used across the app is referenced from here.
 * Paths are relative to /public/assets/philosopher-os/.
 * Lazy-loading and fallback handling should be done at the component level.
 */

const ASSET_BASE = '/assets/philosopher-os';

// ─── Agent & God Portraits ─────────────────────────────────────────
export const PORTRAITS: Record<string, string> = {
  plato:      `${ASSET_BASE}/agent-portraits/plato-portrait.jpg`,
  socrates:   `${ASSET_BASE}/agent-portraits/socrates-portrait.jpg`,
  aristotle:  `${ASSET_BASE}/agent-portraits/aristotle-portrait.jpg`,
  leonidas:   `${ASSET_BASE}/agent-portraits/leonidas-portrait.jpg`,
  athena:     `${ASSET_BASE}/agent-portraits/athena-portrait.jpg`,
  heraclitus: `${ASSET_BASE}/agent-portraits/heraclitus-portrait.jpg`,
  pythagoras: `${ASSET_BASE}/agent-portraits/pythagoras-portrait.jpg`,
  solon:      `${ASSET_BASE}/agent-portraits/solon-portrait.jpg`,
  archimedes: `${ASSET_BASE}/agent-portraits/archimedes-portrait.jpg`,
  odysseus:   `${ASSET_BASE}/agent-portraits/odysseus-portrait.jpg`,
  iapetus:    `${ASSET_BASE}/agent-portraits/iapetus-portrait.jpg`,
  astraeus:   `${ASSET_BASE}/agent-portraits/astraeus-portrait.jpg`,
  erebos:     `${ASSET_BASE}/agent-portraits/erebos-portrait.jpg`,
  phantasos:  `${ASSET_BASE}/agent-portraits/phantasos-portrait.jpg`,
  stilbon:    `${ASSET_BASE}/agent-portraits/stilbon-portrait.jpg`,
  hermes:     `${ASSET_BASE}/agent-portraits/hermes-portrait.jpg`,
};

// ─── Page Backgrounds ──────────────────────────────────────────────
export const PAGE_BACKGROUNDS: Record<string, string> = {
  dashboard:    `${ASSET_BASE}/page-backgrounds/dashboard-bg.jpg`,
  overview:     `${ASSET_BASE}/page-backgrounds/overview-bg.jpg`,
  login:        `${ASSET_BASE}/page-backgrounds/login-bg.jpg`,
  analytics:    `${ASSET_BASE}/page-backgrounds/analytics-bg.jpg`,
  knowledge:    `${ASSET_BASE}/page-backgrounds/knowledge-bg.jpg`,
  leads:        `${ASSET_BASE}/page-backgrounds/leads-bg.jpg`,
  finance:      `${ASSET_BASE}/page-backgrounds/finance-bg.jpg`,
  campaigns:    `${ASSET_BASE}/page-backgrounds/campaigns-bg.jpg`,
  calendar:     `${ASSET_BASE}/page-backgrounds/calendar-bg.jpg`,
  settings:     `${ASSET_BASE}/page-backgrounds/settings-bg.jpg`,
  connections:  `${ASSET_BASE}/page-backgrounds/connections-bg.jpg`,
  cleanup:      `${ASSET_BASE}/page-backgrounds/cleanup-bg.jpg`,
  'beast-mode': `${ASSET_BASE}/page-backgrounds/beast-mode-bg.jpg`,
  clients:      `${ASSET_BASE}/page-backgrounds/clients-bg.jpg`,
  outreach:     `${ASSET_BASE}/page-backgrounds/outreach-bg.jpg`,
  team:         `${ASSET_BASE}/page-backgrounds/team-bg.jpg`,
  chat:         `${ASSET_BASE}/page-backgrounds/chat-bg.jpg`,
  tasks:        `${ASSET_BASE}/page-backgrounds/tasks-bg.jpg`,
  agents:       `${ASSET_BASE}/page-backgrounds/agents-bg.jpg`,
  mission:      `${ASSET_BASE}/page-backgrounds/mission-bg.jpg`,
};

// ─── Empty States ──────────────────────────────────────────────────
export const EMPTY_STATES: Record<string, string> = {
  tasks:          `${ASSET_BASE}/empty-states/empty-tasks.jpg`,
  finance:        `${ASSET_BASE}/empty-states/empty-finance.jpg`,
  agents:         `${ASSET_BASE}/empty-states/empty-agents.jpg`,
  campaigns:      `${ASSET_BASE}/empty-states/empty-campaigns.jpg`,
  chat:           `${ASSET_BASE}/empty-states/empty-chat.jpg`,
  clients:        `${ASSET_BASE}/empty-states/empty-clients.jpg`,
  calendar:       `${ASSET_BASE}/empty-states/empty-calendar.jpg`,
  conversations:  `${ASSET_BASE}/empty-states/empty-conversations.jpg`,
  leads:          `${ASSET_BASE}/empty-states/empty-leads.jpg`,
  inbox:          `${ASSET_BASE}/empty-states/empty-inbox.jpg`,
  knowledge:      `${ASSET_BASE}/empty-states/empty-knowledge.jpg`,
  connections:    `${ASSET_BASE}/empty-states/empty-connections.jpg`,
};

// ─── Integration Cards ─────────────────────────────────────────────
export const INTEGRATION_CARDS: Record<string, string> = {
  whatsapp:        `${ASSET_BASE}/integration-cards/integration-whatsapp.jpg`,
  facebook:        `${ASSET_BASE}/integration-cards/integration-facebook.jpg`,
  instagram:       `${ASSET_BASE}/integration-cards/integration-instagram.jpg`,
  'google-calendar': `${ASSET_BASE}/integration-cards/integration-google-calendar.jpg`,
  email:           `${ASSET_BASE}/integration-cards/integration-email.jpg`,
  qr:              `${ASSET_BASE}/integration-cards/integration-qr.jpg`,
  browser:         `${ASSET_BASE}/integration-cards/integration-browser.jpg`,
  database:        `${ASSET_BASE}/integration-cards/integration-database.jpg`,
  maps:            `${ASSET_BASE}/integration-cards/integration-maps.jpg`,
  'multi-agent':   `${ASSET_BASE}/integration-cards/integration-multi-agent.jpg`,
  'messaging-cloud': `${ASSET_BASE}/integration-cards/integration-messaging-cloud.jpg`,
  vault:           `${ASSET_BASE}/integration-cards/integration-vault.jpg`,
  'ai-model':      `${ASSET_BASE}/integration-cards/integration-ai-model.jpg`,
  engine:          `${ASSET_BASE}/integration-cards/integration-engine.jpg`,
};

// ─── Mission Illustrations ─────────────────────────────────────────
export const MISSION_ILLUSTRATIONS: Record<string, string> = {
  'astraeus-intel':  `${ASSET_BASE}/mission-illustrations/mission-astraeus-intel.jpg`,
  'erebos-cleanup':  `${ASSET_BASE}/mission-illustrations/mission-erebos-cleanup.jpg`,
  'leonidas-command': `${ASSET_BASE}/mission-illustrations/mission-leonidas-command.jpg`,
  'divine-agent':    `${ASSET_BASE}/mission-illustrations/mission-divine-agent.jpg`,
  launch:            `${ASSET_BASE}/mission-illustrations/mission-launch.jpg`,
  pipeline:          `${ASSET_BASE}/mission-illustrations/mission-pipeline.jpg`,
  sequence:          `${ASSET_BASE}/mission-illustrations/mission-sequence.jpg`,
  council:           `${ASSET_BASE}/mission-illustrations/mission-council.jpg`,
  messaging:         `${ASSET_BASE}/mission-illustrations/mission-messaging.jpg`,
  network:           `${ASSET_BASE}/mission-illustrations/mission-network.jpg`,
};

// ─── Textures & Overlays ───────────────────────────────────────────
export const TEXTURES: Record<string, string> = {
  'gold-faint':     `${ASSET_BASE}/textures-overlays/texture-gold-faint.jpg`,
  'blue-faint':     `${ASSET_BASE}/textures-overlays/texture-blue-faint.jpg`,
  'purple-soft':    `${ASSET_BASE}/textures-overlays/texture-purple-soft.jpg`,
  'charcoal-1':     `${ASSET_BASE}/textures-overlays/texture-charcoal-1.jpg`,
  'charcoal-2':     `${ASSET_BASE}/textures-overlays/texture-charcoal-2.jpg`,
  'ivory-marble':   `${ASSET_BASE}/textures-overlays/texture-ivory-marble.jpg`,
  starmap:          `${ASSET_BASE}/textures-overlays/texture-starmap.jpg`,
  'warm-stone':     `${ASSET_BASE}/textures-overlays/texture-warm-stone.jpg`,
  'gold-divider':   `${ASSET_BASE}/textures-overlays/texture-gold-divider.jpg`,
  'gold-glow':      `${ASSET_BASE}/textures-overlays/texture-gold-glow.jpg`,
  'beige-stone':    `${ASSET_BASE}/textures-overlays/texture-beige-stone.jpg`,
};

// ─── Loading States ────────────────────────────────────────────────
export const LOADING_IMAGES: Record<string, string> = {
  'scan-line':       `${ASSET_BASE}/loading-states/loading-scan-line.jpg`,
  'gold-route':      `${ASSET_BASE}/loading-states/loading-gold-route.jpg`,
  'command-center':  `${ASSET_BASE}/loading-states/loading-command-center.jpg`,
  'strategic-map':   `${ASSET_BASE}/loading-states/loading-strategic-map.jpg`,
  'cosmic-signal':   `${ASSET_BASE}/loading-states/loading-cosmic-signal.jpg`,
  'fast-messages':   `${ASSET_BASE}/loading-states/loading-fast-messages.jpg`,
  'message-scrolls': `${ASSET_BASE}/loading-states/loading-message-scrolls.jpg`,
  'marble-flow':     `${ASSET_BASE}/loading-states/loading-marble-flow.jpg`,
  gears:             `${ASSET_BASE}/loading-states/loading-gears.jpg`,
  'approval-seals':  `${ASSET_BASE}/loading-states/loading-approval-seals.jpg`,
  'golden-ratio':    `${ASSET_BASE}/loading-states/loading-golden-ratio.jpg`,
  'workflow-blocks': `${ASSET_BASE}/loading-states/loading-workflow-blocks.jpg`,
  'marble-blocks':   `${ASSET_BASE}/loading-states/loading-marble-blocks.jpg`,
  'task-blocks':     `${ASSET_BASE}/loading-states/loading-task-blocks.jpg`,
};

export const LOADING_VIDEOS: Record<string, string> = {
  'statue-glow': `${ASSET_BASE}/loading-states/loading-statue-glow.mp4`,
  'rings-bust':  `${ASSET_BASE}/loading-states/loading-rings-bust.mp4`,
};

// ─── Video Assets ──────────────────────────────────────────────────
export const VIDEOS: Record<string, string> = {
  'beast-mode':       `${ASSET_BASE}/video-assets/video-beast-mode.mp4`,
  'campaign-launch':  `${ASSET_BASE}/video-assets/video-campaign-launch.mp4`,
  'lead-collection':  `${ASSET_BASE}/video-assets/video-lead-collection.mp4`,
  'outreach-sending': `${ASSET_BASE}/video-assets/video-outreach-sending.mp4`,
  'qr-pairing':       `${ASSET_BASE}/video-assets/video-qr-pairing.mp4`,
  'crm-cleanup':      `${ASSET_BASE}/video-assets/video-crm-cleanup.mp4`,
  'daily-command':     `${ASSET_BASE}/video-assets/video-daily-command.mp4`,
  'schedule-auto':     `${ASSET_BASE}/video-assets/video-schedule-auto.mp4`,
  'integration-connect': `${ASSET_BASE}/video-assets/video-integration-connect.mp4`,
  'calendar-rotate':   `${ASSET_BASE}/video-assets/video-calendar-rotate.mp4`,
};

// ─── Decorative UI Elements ────────────────────────────────────────
export const DECORATIVE_UI: Record<string, string> = {
  'approval-seal':    `${ASSET_BASE}/decorative-ui/decor-approval-seal.jpg`,
  'warning-shield':   `${ASSET_BASE}/decorative-ui/decor-warning-shield.jpg`,
  'cloud-automation': `${ASSET_BASE}/decorative-ui/decor-cloud-automation.jpg`,
  'blue-orb':         `${ASSET_BASE}/decorative-ui/decor-blue-orb.jpg`,
  'ivory-orb':        `${ASSET_BASE}/decorative-ui/decor-ivory-orb.jpg`,
  'module-block':     `${ASSET_BASE}/decorative-ui/decor-module-block.jpg`,
  'premium-block':    `${ASSET_BASE}/decorative-ui/decor-premium-block.jpg`,
  'secure-vault':     `${ASSET_BASE}/decorative-ui/decor-secure-vault.jpg`,
  'gold-divider-1':   `${ASSET_BASE}/decorative-ui/decor-gold-divider-1.jpg`,
  'gold-divider-2':   `${ASSET_BASE}/decorative-ui/decor-gold-divider-2.jpg`,
};

// ─── Helper: get portrait by agent name ────────────────────────────
export function getPortrait(agentName: string): string | undefined {
  return PORTRAITS[agentName.toLowerCase()];
}

// ─── Helper: get empty state by page key ───────────────────────────
export function getEmptyState(pageKey?: string): string | undefined {
  return pageKey ? EMPTY_STATES[pageKey] : undefined;
}

// ─── Helper: get background by page key ────────────────────────────
export function getPageBackground(pageKey: string): string | undefined {
  return PAGE_BACKGROUNDS[pageKey];
}
