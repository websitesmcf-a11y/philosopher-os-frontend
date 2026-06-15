# Philosopher OS — Visual Asset Map

> 123 assets extracted from 9 zip files, organized into 9 directories.
> All paths relative to `/public/assets/philosopher-os/`.

---

## 1. Agent Portraits (16 files)
`/agent-portraits/`

| File | Where Used |
|------|-----------|
| `plato-portrait.jpg` | Chat header, agent selector sidebar, philosopher cards, mission timeline |
| `socrates-portrait.jpg` | Chat header, agent selector sidebar, philosopher cards |
| `aristotle-portrait.jpg` | Chat header, agent selector sidebar, philosopher cards |
| `leonidas-portrait.jpg` | Chat header, agent selector sidebar, philosopher cards, Daily Command |
| `athena-portrait.jpg` | Chat header, agent selector sidebar, philosopher cards |
| `heraclitus-portrait.jpg` | Chat header, agent selector sidebar, philosopher cards |
| `pythagoras-portrait.jpg` | Chat header, agent selector sidebar, philosopher cards |
| `solon-portrait.jpg` | Chat header, agent selector sidebar, philosopher cards |
| `archimedes-portrait.jpg` | Chat header, agent selector sidebar, philosopher cards |
| `odysseus-portrait.jpg` | Chat header, agent selector sidebar, philosopher cards, Daily Command |
| `iapetus-portrait.jpg` | Gods page cards, Beast Mode panel, mission execution states |
| `astraeus-portrait.jpg` | Gods page cards, intelligence panel |
| `erebos-portrait.jpg` | Gods page cards, CRM Cleanup page |
| `phantasos-portrait.jpg` | Gods page cards, Outreach Builder |
| `stilbon-portrait.jpg` | Gods page cards, Outreach Builder |
| `hermes-portrait.jpg` | Background job status, agent logs |

**Used in:** `components/agent-chat.tsx` (AgentPortrait component), agent selector sidebar, chat headers

---

## 2. Page Backgrounds (24 files)
`/page-backgrounds/`

| File | Where Used |
|------|-----------|
| `dashboard-bg.jpg` | `/` Dashboard page background (opacity 0.04) |
| `overview-bg.jpg` | `/overview` CEO Dashboard background |
| `login-bg.jpg` | `/login` Login page background |
| `analytics-bg.jpg` | `/analytics` Analytics page background |
| `knowledge-bg.jpg` | `/knowledge` Knowledge Base background |
| `leads-bg.jpg` | `/leads` Leads page background |
| `finance-bg.jpg` | `/finance` Finance page background |
| `finance-bg-alt.jpg` | Finance page alternative |
| `campaigns-bg.jpg` | `/campaigns` Campaigns page background |
| `calendar-bg.jpg` | `/calendar` Schedule page background |
| `settings-bg.jpg` | `/settings` Settings page background |
| `connections-bg.jpg` | `/connections` Integrations page background |
| `cleanup-bg.jpg` | `/tools/cleanup` CRM Cleanup background |
| `admin-bg.jpg` | `/tools/agent-logs` Agent logs background |
| `beast-mode-bg.jpg` | Beast Mode panel background |
| `campaign-live-bg.jpg` | Running campaign page background |
| `clients-bg.jpg` | `/clients` Clients page background |
| `outreach-bg.jpg` | Outreach Builder background |
| `team-bg.jpg` | Settings → Team page background |
| `chat-bg.jpg` | `/chat` Chat page background |
| `tasks-bg.jpg` | `/tasks` Tasks page background |
| `agents-bg.jpg` | `/agents` Philosopher Council background |
| `mission-bg.jpg` | `/mission` Mission Control background |
| `outreach-sequence-bg.jpg` | Campaign sequence builder background |

**Used in:** `components/background-wrapper.tsx` → `components/ui/page-background.tsx` — low-opacity backgrounds (0.04) applied via CSS `Image` component with `z-index: 0`.

---

## 3. Empty States (12 files)
`/empty-states/`

| File | Where Used |
|------|-----------|
| `empty-tasks.jpg` | Tasks page when no tasks exist |
| `empty-finance.jpg` | Finance page when no data |
| `empty-agents.jpg` | Agents page when no agents configured |
| `empty-campaigns.jpg` | Campaigns page when no campaigns |
| `empty-chat.jpg` | Chat page when no conversation history |
| `empty-clients.jpg` | Clients page when no clients |
| `empty-calendar.jpg` | Calendar page when no events |
| `empty-conversations.jpg` | Conversations page when no messages |
| `empty-leads.jpg` | Leads page when no leads (240×180, 0.5 opacity) |
| `empty-inbox.jpg` | Inbox empty state |
| `empty-knowledge.jpg` | Knowledge Base empty state |
| `empty-connections.jpg` | Integrations page no connections |

**Used in:** `components/ui/empty-state.tsx` — shown when `data?.items?.length === 0` in queries.

---

## 4. Integration Cards (14 files)
`/integration-cards/`

| File | Where Used |
|------|-----------|
| `integration-whatsapp.jpg` | WhatsApp connection card |
| `integration-facebook.jpg` | Facebook connection card |
| `integration-instagram.jpg` | Instagram connection card |
| `integration-google-calendar.jpg` | Google Calendar connection card |
| `integration-email.jpg` | Email/SMTP connection card |
| `integration-qr.jpg` | QR code pairing illustration |
| `integration-browser.jpg` | Browser harness connection card |
| `integration-database.jpg` | Database integration card |
| `integration-maps.jpg` | Google Maps/Places integration card |
| `integration-multi-agent.jpg` | Multi-agent workflow card |
| `integration-messaging-cloud.jpg` | Messaging cloud card |
| `integration-vault.jpg` | Credential vault/secure storage card |
| `integration-ai-model.jpg` | AI/LLM provider card |
| `integration-engine.jpg` | Backend engine card |

**Used in:** Connections/Integrations page (`/connections`), missing-connection prompts. Selectable via `INTEGRATION_CARDS` map in `lib/philosopher-assets.ts`.

---

## 5. Mission Illustrations (10 files)
`/mission-illustrations/`

| File | Where Used |
|------|-----------|
| `mission-astraeus-intel.jpg` | Intelligence mission panel |
| `mission-erebos-cleanup.jpg` | CRM Cleanup mission card |
| `mission-leonidas-command.jpg` | Daily Command mission |
| `mission-divine-agent.jpg` | Agent execution panel |
| `mission-launch.jpg` | Campaign launch screen |
| `mission-pipeline.jpg` | Sales pipeline visualization |
| `mission-sequence.jpg` | Outreach sequence builder |
| `mission-council.jpg` | Philosopher Council group shot |
| `mission-messaging.jpg` | Message sending visualization |
| `mission-network.jpg` | Lead network visualization |

**Used in:** Mission Control (`/mission`), campaign setup, onboarding, Beast Mode panels.

---

## 6. Textures & Overlays (11 files)
`/textures-overlays/`

| File | Where Used |
|------|-----------|
| `texture-ivory-marble.jpg` | Global overlay texture (opacity 0.02) |
| `texture-gold-faint.jpg` | Subtle gold overlay for premium sections |
| `texture-blue-faint.jpg` | Blue overlay for analytics pages |
| `texture-purple-soft.jpg` | Purple overlay for intelligence panels |
| `texture-charcoal-1.jpg` | Dark overlay for Beast Mode |
| `texture-charcoal-2.jpg` | Dark overlay variant |
| `texture-starmap.jpg` | Celestial overlay for gods/titans |
| `texture-warm-stone.jpg` | Warm overlay for CRM pages |
| `texture-gold-divider.jpg` | Section divider accent |
| `texture-gold-glow.jpg` | Glow effect overlay |
| `texture-beige-stone.jpg` | Beige overlay for neutral areas |

**Used in:** `components/ui/page-background.tsx` — applied as a subtle `background-image` overlay at `opacity: 0.02` over page backgrounds.

---

## 7. Loading States (16 files)
`/loading-states/`

| File | Where Used |
|------|-----------|
| `loading-scan-line.jpg` | Generic loading animation fallback |
| `loading-gold-route.jpg` | Route/pathfinding loading |
| `loading-command-center.jpg` | Agent thinking/loading |
| `loading-strategic-map.jpg` | Strategy loading |
| `loading-cosmic-signal.jpg` | Research/intel loading |
| `loading-fast-messages.jpg` | Message sending loading |
| `loading-message-scrolls.jpg` | Chat/conversation loading |
| `loading-marble-flow.jpg` | Data processing loading |
| `loading-gears.jpg` | Engineering/building loading |
| `loading-approval-seals.jpg` | Approval/review loading |
| `loading-golden-ratio.jpg` | Analytics loading |
| `loading-workflow-blocks.jpg` | Workflow execution loading |
| `loading-marble-blocks.jpg` | Organization loading |
| `loading-task-blocks.jpg` | Task execution loading |
| `loading-statue-glow.mp4` | Agent loading animation (video) |
| `loading-rings-bust.mp4` | Divine agent loading (video) |

**Used in:** `components/ui/loading-state.tsx` — displayed when agents are processing, data is fetching, or missions are running.

---

## 8. Video Assets (10 files)
`/video-assets/`

| File | Where Used |
|------|-----------|
| `video-beast-mode.mp4` | Beast Mode activation + loop |
| `video-campaign-launch.mp4` | Campaign launch animation |
| `video-lead-collection.mp4` | Lead collection visualization |
| `video-outreach-sending.mp4` | Outreach message sending |
| `video-qr-pairing.mp4` | QR code pairing animation |
| `video-crm-cleanup.mp4` | CRM cleanup visualization |
| `video-daily-command.mp4` | Daily Command briefing |
| `video-schedule-auto.mp4` | Schedule automation |
| `video-integration-connect.mp4` | Integration connection animation |
| `video-calendar-rotate.mp4` | Calendar rotation visualization |

**Used in:** `components/ui/video-with-fallback.tsx` — lazy-loaded with static image fallback if video fails. Used on Beast Mode, campaign launch, lead collection, outreach, QR pairing, CRM cleanup, daily command, schedule automation, and integration pages.

---

## 9. Decorative UI (10 files)
`/decorative-ui/`

| File | Where Used |
|------|-----------|
| `decor-approval-seal.jpg` | Approval/confirmation UI element |
| `decor-warning-shield.jpg` | Warning/alert shield |
| `decor-cloud-automation.jpg` | Cloud/automation decorative element |
| `decor-blue-orb.jpg` | Blue accent orb |
| `decor-ivory-orb.jpg` | Ivory accent orb |
| `decor-module-block.jpg` | Module/feature block |
| `decor-premium-block.jpg` | Premium feature callout |
| `decor-secure-vault.jpg` | Security/credential vault icon |
| `decor-gold-divider-1.jpg` | Gold section divider |
| `decor-gold-divider-2.jpg` | Gold section divider variant |

**Used in:** Settings credential vault, premium feature callouts, section dividers, alert panels, approval workflows.

---

## Integration Points Created

| File | Purpose |
|------|---------|
| `lib/philosopher-assets.ts` | Centralized asset registry with all paths + lookup helpers |
| `components/ui/agent-portrait.tsx` | Reusable agent portrait with fallback (letter + color) |
| `components/ui/page-background.tsx` | Low-opacity page background + texture overlay wrapper |
| `components/ui/empty-state.tsx` | Empty state with page-specific illustration + action button |
| `components/ui/loading-state.tsx` | Loading animation with video + fallback image |
| `components/ui/video-with-fallback.tsx` | Lazy-loaded video with poster/fallback image |
| `components/background-wrapper.tsx` | Path-based page background router |
| `components/providers.tsx` | Integrated BackgroundWrapper into layout shell |
| `components/agent-chat.tsx` | Agent portraits in chat header + sidebar selectors |
| `app/leads/page.tsx` | Empty state with leads illustration when no data |

## Design Principles Applied

1. **Low opacity backgrounds** (0.04) — content remains readable
2. **Texture overlay** (0.02) — subtle depth, never distracting
3. **Lazy-loading** — non-priority images via `priority={false}`
4. **Fallbacks** — portrait shows initial letter on error; video falls back to static image
5. **No text in images** — all UI labels are real HTML text
6. **No fake data** — images only show when real data exists
7. **Responsive** — all images use `object-fit: cover/contain`
