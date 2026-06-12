# SOCRATES AI — Enterprise Architecture Document

## 1. SYSTEM OVERVIEW

**Socrates AI** is an AI-native Agency Operating System designed to run a modern AI agency with minimal human intervention. It consists of an AI Philosopher Council — a hierarchical system of specialized AI agents sharing a unified memory, database, and execution infrastructure.

### Core Philosophy
One memory. Many specialists. One objective.

---

## 2. DIRECTORY STRUCTURE

```
socrates-ai/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/               # Auth routes (login, signup, magic-link)
│   │   │   ├── (dashboard)/          # Main dashboard layout
│   │   │   │   ├── overview/         # CEO dashboard
│   │   │   │   ├── crm/              # Client management
│   │   │   │   ├── leads/            # Lead pipeline
│   │   │   │   ├── finance/          # MRR, invoices, expenses
│   │   │   │   ├── campaigns/        # Outreach campaigns
│   │   │   │   ├── agents/           # AI agent management
│   │   │   │   ├── analytics/        # Deep analytics
│   │   │   │   ├── knowledge/        # Knowledge base
│   │   │   │   ├── calendar/         # Calendar & scheduling
│   │   │   │   ├── settings/         # System settings
│   │   │   │   └── chat/             # AI council chat interface
│   │   │   ├── api/                  # Next.js API routes (BFF layer)
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui primitives
│   │   │   ├── layout/               # Shell, sidebar, navbar
│   │   │   ├── dashboard/            # Dashboard widgets
│   │   │   ├── crm/                  # CRM components
│   │   │   ├── finance/             # Finance components
│   │   │   ├── agents/              # Agent UI components
│   │   │   ├── chat/                # Chat interface
│   │   │   ├── analytics/           # Charts & metrics
│   │   │   ├── calendar/            # Calendar components
│   │   │   ├── campaigns/           # Campaign components
│   │   │   └── shared/              # Shared components
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/
│   │   │   ├── supabase/            # Supabase client
│   │   │   ├── api/                 # API client (typed)
│   │   │   ├── ai/                  # AI client (LLM calls)
│   │   │   ├── realtime/            # Realtime subscriptions
│   │   │   └── utils/               # Utility functions
│   │   ├── store/                    # State management (zustand)
│   │   ├── types/                    # TypeScript types
│   │   ├── styles/                   # Global styles
│   │   ├── public/                   # Static assets
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── api/                          # FastAPI backend
│       ├── app/
│       │   ├── main.py              # App entry, middleware, CORS
│       │   ├── config.py            # Settings (pydantic-settings)
│       │   ├── database/
│       │   │   ├── __init__.py
│       │   │   ├── session.py       # DB connection pool
│       │   │   ├── migrations/      # Alembic migrations
│       │   │   └── models/          # SQLAlchemy models
│       │   ├── routers/
│       │   │   ├── auth.py          # Authentication endpoints
│       │   │   ├── users.py         # User management
│       │   │   ├── leads.py         # Lead CRUD
│       │   │   ├── clients.py       # Client management
│       │   │   ├── campaigns.py     # Campaign management
│       │   │   ├── messages.py      # Message history
│       │   │   ├── agents.py        # Agent orchestration
│       │   │   ├── finance.py       # Finance endpoints
│       │   │   ├── analytics.py     # Analytics & metrics
│       │   │   ├── knowledge.py     # Knowledge base
│       │   │   ├── calendar.py      # Calendar events
│       │   │   ├── tasks.py         # Task management
│       │   │   ├── webhooks.py      # Webhook receivers
│       │   │   ├── chat.py          # AI council chat
│       │   │   └── health.py        # Health checks
│       │   ├── services/
│       │   │   ├── auth_service.py
│       │   │   ├── lead_service.py
│       │   │   ├── campaign_service.py
│       │   │   ├── message_service.py
│       │   │   ├── finance_service.py
│       │   │   ├── analytics_service.py
│       │   │   ├── calendar_service.py
│       │   │   ├── task_service.py
│       │   │   ├── webhook_service.py
│       │   │   └── notification_service.py
│       │   ├── agents/              # AI Agent implementations
│       │   │   ├── base.py          # Base agent class
│       │   │   ├── council.py       # Council orchestrator
│       │   │   ├── plato.py         # CEO agent
│       │   │   ├── socrates.py      # Strategy agent
│       │   │   ├── aristotle.py     # Knowledge agent
│       │   │   ├── leonidas.py      # Operations agent
│       │   │   ├── athena.py        # Executive assistant
│       │   │   ├── heraclitus.py    # Research agent
│       │   │   ├── pythagoras.py    # Analytics agent
│       │   │   ├── solon.py         # Finance agent
│       │   │   ├── archimedes.py    # Engineering agent
│       │   │   └── odysseus.py      # Outreach agent
│       │   ├── memory/
│       │   │   ├── __init__.py
│       │   │   ├── vector_store.py  # pgvector operations
│       │   │   ├── embeddings.py    # Embedding generation
│       │   │   ├── retrieval.py     # Semantic retrieval
│       │   │   ├── hybrid.py        # Hybrid search (vector + keyword)
│       │   │   ├── summarizer.py    # Conversation summarization
│       │   │   └── cache.py         # Memory cache layer
│       │   ├── workers/
│       │   │   ├── celery_app.py    # Celery configuration
│       │   │   ├── outreach.py      # Outreach worker
│       │   │   ├── memory_index.py  # Memory indexing worker
│       │   │   ├── analytics.py     # Analytics computation worker
│       │   │   ├── email.py         # Email dispatch worker
│       │   │   ├── whatsapp.py      # WhatsApp worker
│       │   │   ├── research.py      # Research worker
│       │   │   ├── report_gen.py    # Report generation
│       │   │   └── cleanup.py       # Cleanup tasks
│       │   ├── integrations/
│       │   │   ├── whatsapp/
│       │   │   │   ├── client.py    # WhatsApp Web client
│       │   │   │   ├── handler.py   # Message handler
│       │   │   │   └── templates.py # Message templates
│       │   │   ├── email/
│       │   │   │   ├── resend.py    # Resend client
│       │   │   │   └── templates.py # Email templates
│       │   │   ├── social/
│       │   │   │   ├── facebook.py  # Facebook API
│       │   │   │   ├── instagram.py # Instagram API
│       │   │   │   └── linkedin.py  # LinkedIn API
│       │   │   ├── hermes/
│       │   │   │   └── client.py    # Hermes Agent client
│       │   │   ├── browser/
│       │   │   │   └── harness.py   # Browser Harness client
│       │   │   ├── calendar/
│       │   │   │   └── google.py    # Google Calendar
│       │   │   ├── storage/
│       │   │   │   ├── supabase.py  # Supabase Storage
│       │   │   │   └── r2.py        # Cloudflare R2
│       │   │   └── n8n/
│       │   │       └── client.py    # n8n workflow trigger
│       │   ├── automation/
│       │   │   ├── scheduler.py     # Task scheduler
│       │   │   ├── workflows.py     # Workflow definitions
│       │   │   ├── rules.py         # Business rules engine
│       │   │   └── triggers.py      # Event triggers
│       │   ├── core/
│       │   │   ├── security.py      # Auth, encryption, rate limiting
│       │   │   ├── audit.py         # Audit logging
│       │   │   ├── logging.py       # Structured logging
│       │   │   ├── pagination.py    # Pagination utilities
│       │   │   ├── errors.py        # Error handling
│       │   │   └── cache.py         # Redis caching layer
│       │   └── schemas/             # Pydantic schemas
│       │       ├── lead.py
│       │       ├── client.py
│       │       ├── campaign.py
│       │       ├── message.py
│       │       ├── finance.py
│       │       ├── agent.py
│       │       ├── analytics.py
│       │       ├── memory.py
│       │       ├── task.py
│       │       ├── calendar.py
│       │       └── auth.py
│       ├── tests/
│       │   ├── unit/
│       │   ├── integration/
│       │   ├── e2e/
│       │   └── fixtures/
│       ├── alembic/
│       ├── Dockerfile
│       ├── requirements.txt
│       └── pyproject.toml
│
├── packages/
│   ├── shared-types/                # Shared TypeScript types
│   │   └── src/
│   │       ├── lead.ts
│   │       ├── client.ts
│   │       ├── campaign.ts
│   │       ├── finance.ts
│   │       ├── agent.ts
│   │       ├── memory.ts
│   │       └── index.ts
│   └── sdk/                         # Typed SDK for API clients
│       └── src/
│           ├── client.ts
│           ├── resources/
│           └── index.ts
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   ├── web.Dockerfile
│   ├── api.Dockerfile
│   ├── worker.Dockerfile
│   └── nginx/
│       └── nginx.conf
│
├── infra/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── ansible/
│       ├── playbook.yml
│       └── roles/
│
├── scripts/
│   ├── setup.sh
│   ├── seed.sh
│   ├── backup.sh
│   └── deploy.sh
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       ├── lint.yml
│       ├── test.yml
│       └── deploy.yml
│
├── .env.example
├── .env.local
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## 3. DATABASE SCHEMA

### Tables (Supabase PostgreSQL + pgvector)

```sql
-- ============================================
-- CORE ENTITIES
-- ============================================

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'member'
                CHECK (role IN ('owner','admin','manager','member','agent')),
  preferences   JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE org_members (
  org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member',
  permissions   TEXT[] DEFAULT '{}',
  joined_at     TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

-- ============================================
-- CRM
-- ============================================

CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,
  company         TEXT,
  industry        TEXT,
  source          TEXT,
  status          TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new','contacted','qualified','proposal','negotiation','won','lost')),
  score           INTEGER DEFAULT 0,
  tags            TEXT[] DEFAULT '{}',
  notes           TEXT,
  assigned_to     UUID REFERENCES users(id),
  custom_fields   JSONB DEFAULT '{}',
  first_contacted_at TIMESTAMPTZ,
  last_contacted_at  TIMESTAMPTZ,
  converted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_org ON leads(org_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(score DESC);

CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id         UUID REFERENCES leads(id),
  name            TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,
  company         TEXT,
  industry        TEXT,
  contract_status TEXT DEFAULT 'active'
                  CHECK (contract_status IN ('active','suspended','cancelled')),
  mrr             NUMERIC(10,2) DEFAULT 0,
  lifetime_value  NUMERIC(10,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- MESSAGES & COMMUNICATIONS
-- ============================================

CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id         UUID REFERENCES leads(id),
  client_id       UUID REFERENCES clients(id),
  channel         TEXT NOT NULL CHECK (channel IN ('whatsapp','email','sms','facebook','instagram','web','api')),
  status          TEXT DEFAULT 'active',
  metadata        JSONB DEFAULT '{}',
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type     TEXT NOT NULL CHECK (sender_type IN ('user','lead','client','agent','system')),
  sender_id       TEXT,
  direction       TEXT NOT NULL CHECK (direction IN ('in','out')),
  body            TEXT NOT NULL,
  media_url       TEXT[],
  metadata        JSONB DEFAULT '{}',
  embedding       VECTOR(1536),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_conv ON messages(conversation_id);
CREATE INDEX idx_messages_embedding ON messages USING ivfflat (embedding vector_cosine_ops);

-- ============================================
-- FINANCE
-- ============================================

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES clients(id),
  invoice_number  TEXT NOT NULL,
  amount          NUMERIC(10,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  status          TEXT DEFAULT 'draft'
                  CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  due_date        DATE,
  paid_at         TIMESTAMPTZ,
  lines           JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, invoice_number)
);

CREATE TABLE expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  category        TEXT NOT NULL,
  amount          NUMERIC(10,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  description     TEXT,
  receipt_url     TEXT,
  incurred_at     DATE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE revenue_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES clients(id),
  invoice_id      UUID REFERENCES invoices(id),
  amount          NUMERIC(10,2) NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('one_time','monthly','annual')),
  period_start    DATE,
  period_end      DATE,
  recorded_at     TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CAMPAIGNS & OUTREACH
-- ============================================

CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  channel         TEXT NOT NULL CHECK (channel IN ('whatsapp','email','facebook','instagram','linkedin','sms')),
  industry        TEXT,
  message_template TEXT NOT NULL,
  status          TEXT DEFAULT 'draft'
                  CHECK (status IN ('draft','active','paused','completed','cancelled')),
  schedule_config JSONB DEFAULT '{}',
  target_count    INTEGER DEFAULT 0,
  sent_count      INTEGER DEFAULT 0,
  reply_count     INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE campaign_leads (
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id         UUID REFERENCES leads(id) ON DELETE CASCADE,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','sent','delivered','replied','bounced','opted_out')),
  sent_at         TIMESTAMPTZ,
  replied_at      TIMESTAMPTZ,
  PRIMARY KEY (campaign_id, lead_id)
);

-- ============================================
-- AI AGENTS & MEMORY
-- ============================================

CREATE TABLE agent_memory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  agent_name      TEXT NOT NULL,
  memory_type     TEXT NOT NULL CHECK (memory_type IN ('conversation','insight','fact','preference','decision','summary')),
  content         TEXT NOT NULL,
  metadata        JSONB DEFAULT '{}',
  embedding       VECTOR(1536),
  importance      FLOAT DEFAULT 0.5,
  accessed_at     TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_agent_memory_org ON agent_memory(org_id);
CREATE INDEX idx_agent_memory_agent ON agent_memory(agent_name);
CREATE INDEX idx_agent_memory_embedding ON agent_memory USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE knowledge_base (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  category        TEXT,
  tags            TEXT[] DEFAULT '{}',
  embedding       VECTOR(1536),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_knowledge_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops);

-- ============================================
-- TASKS & SCHEDULING
-- ============================================

CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  assignee_id     UUID REFERENCES users(id),
  assigned_agent  TEXT,
  priority        TEXT DEFAULT 'medium'
                  CHECK (priority IN ('critical','high','medium','low')),
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','in_progress','completed','cancelled')),
  due_date        TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  related_to_type TEXT,
  related_to_id   UUID,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CALENDAR
-- ============================================

CREATE TABLE calendar_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  event_type      TEXT NOT NULL CHECK (event_type IN ('meeting','call','task','reminder','booking')),
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ NOT NULL,
  attendees       JSONB DEFAULT '[]',
  location        TEXT,
  meeting_link    TEXT,
  status          TEXT DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled','confirmed','cancelled','completed')),
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AUTOMATION & WORKFLOWS
-- ============================================

CREATE TABLE automation_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  trigger_event   TEXT NOT NULL,
  conditions      JSONB DEFAULT '{}',
  actions         JSONB NOT NULL,
  enabled         BOOLEAN DEFAULT true,
  last_run_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE scheduled_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  job_type        TEXT NOT NULL,
  payload         JSONB NOT NULL,
  scheduled_for   TIMESTAMPTZ NOT NULL,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','running','completed','failed','cancelled')),
  result          JSONB,
  error           TEXT,
  retry_count     INTEGER DEFAULT 0,
  max_retries     INTEGER DEFAULT 3,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AUDIT & LOGGING
-- ============================================

CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id),
  user_id         UUID REFERENCES users(id),
  action          TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  resource_id     TEXT,
  details         JSONB DEFAULT '{}',
  ip_address      INET,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_org ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  data            JSONB DEFAULT '{}',
  read            BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;
```

---

## 4. AUTHENTICATION SYSTEM

### Clerk Integration
- Clerk handles: Google OAuth, password login, magic links, session management
- Webhook endpoint receives Clerk events (user.created, user.updated, session.created)
- Backend validates Clerk JWTs via jwks endpoint
- Row Level Security (RLS) in Supabase uses Clerk user IDs

### Session Flow
```
User → Clerk Login → JWT → Next.js Middleware (protects routes)
                      ↓
                  FastAPI Backend
                      ↓
              Verify JWT via Clerk JWKS
                      ↓
              Set org context & permissions
                      ↓
              Supabase RLS (org-scoped)
```

### Permission Model
```
Role: owner      → Full access, billing, team management
Role: admin      → Full access, team management
Role: manager    → CRUD on leads, clients, campaigns, view finance
Role: member     → CRUD on own leads, view assigned data
Role: agent      → AI agent system account
```

---

## 5. BACKEND ARCHITECTURE

### FastAPI Application

**Layers:**
1. **Routers** — HTTP endpoints, request validation (Pydantic)
2. **Services** — Business logic layer
3. **Database** — Supabase PostgreSQL (async via asyncpg + SQLAlchemy async)
4. **Agents** — AI agent implementations
5. **Workers** — Celery async task processing
6. **Integrations** — External API clients

### API Structure

```
Base URL: /api/v1

Auth:
  POST   /auth/login                 Password login
  POST   /auth/magic-link            Send magic link
  POST   /auth/verify                Verify token
  GET    /auth/me                    Current user
  POST   /auth/logout

Leads:
  GET    /leads                      List leads (paginated, filterable)
  POST   /leads                      Create lead
  GET    /leads/:id                  Get lead
  PATCH  /leads/:id                  Update lead
  DELETE /leads/:id                  Delete lead
  POST   /leads/:id/assign           Assign lead
  POST   /leads/import               Bulk import

Clients:
  GET    /clients                    List clients
  POST   /clients                    Create client
  GET    /clients/:id                Get client
  PATCH  /clients/:id                Update client
  GET    /clients/:id/invoices       Client invoices

Campaigns:
  GET    /campaigns                  List campaigns
  POST   /campaigns                  Create campaign
  GET    /campaigns/:id              Get campaign
  PATCH  /campaigns/:id              Update campaign
  POST   /campaigns/:id/launch       Launch campaign
  POST   /campaigns/:id/pause        Pause campaign
  GET    /campaigns/:id/stats        Campaign statistics

Messages:
  GET    /conversations              List conversations
  GET    /conversations/:id          Get conversation with messages
  POST   /conversations/:id/send     Send message
  POST   /messages/template          Render message template

Finance:
  GET    /finance/mrr                MRR breakdown
  GET    /finance/revenue            Revenue timeline
  GET    /finance/expenses           Expense list
  POST   /finance/invoices           Create invoice
  GET    /finance/invoices           List invoices
  PATCH  /finance/invoices/:id       Update invoice
  GET    /finance/cashflow           Cashflow forecast

AI Agents:
  POST   /agents/chat                Chat with AI council
  GET    /agents/:name/memory        Get agent memory
  POST   /agents/:name/memory        Add agent memory
  GET    /agents/status              All agent statuses
  POST   /agents/plato/briefing      Request morning briefing

Knowledge:
  GET    /knowledge                  Search knowledge base
  POST   /knowledge                  Add knowledge entry
  DELETE /knowledge/:id              Delete entry
  POST   /knowledge/search           Semantic search

Analytics:
  GET    /analytics/dashboard        Dashboard metrics
  GET    /analytics/leads            Lead analytics
  GET    /analytics/campaigns        Campaign performance
  GET    /analytics/agents           Agent performance
  GET    /analytics/predictions      AI predictions

Calendar:
  GET    /calendar/events            List events (date range)
  POST   /calendar/events            Create event
  PATCH  /calendar/events/:id        Update event
  DELETE /calendar/events/:id        Delete event
  POST   /calendar/events/:id/book   Book appointment

Tasks:
  GET    /tasks                      List tasks
  POST   /tasks                      Create task
  PATCH  /tasks/:id                  Update task
  POST   /tasks/:id/complete         Complete task

Automation:
  GET    /automation/rules           List rules
  POST   /automation/rules           Create rule
  PATCH  /automation/rules/:id       Update rule
  POST   /automation/rules/:id/test  Test rule
  GET    /automation/jobs            Scheduled jobs

Webhooks:
  POST   /webhooks/clerk             Clerk events
  POST   /webhooks/whatsapp          WhatsApp status callbacks
  POST   /webhooks/email             Email delivery status

Health:
  GET    /health                     Basic health
  GET    /health/detailed            Full system health
  GET    /health/readiness           Readiness probe
  GET    /health/liveness            Liveness probe
```

---

## 6. AI COUNCIL ARCHITECTURE

### Agent Base Class

```python
class BaseAgent:
    name: str
    system_prompt: str
    tools: list[Tool]
    memory: MemorySystem
    
    async def think(self, context: Context) -> Thought:
        """Process input, retrieve memory, reason, decide action"""
    
    async def act(self, thought: Thought) -> ActionResult:
        """Execute decided action"""
    
    async def reflect(self, action: ActionResult) -> None:
        """Store memory about what happened"""
    
    async def delegate(self, task: Task, target_agent: str) -> Any:
        """Delegate to another agent"""
```

### Council Orchestrator

```python
class CouncilOrchestrator:
    agents: dict[str, BaseAgent]
    memory: SharedMemory
    router: IntentRouter
    
    async def process(self, user_input: str, context: dict) -> Response:
        # 1. Route intent to primary agent
        primary = await self.router.route(user_input)
        
        # 2. Gather context from shared memory
        memory_context = await self.memory.retrieve(user_input)
        
        # 3. Primary agent processes with full context
        result = await primary.think(Context(user_input, memory_context))
        
        # 4. Auto-delegate subtasks to specialists
        if result.requires_delegation:
            for subtask in result.subtasks:
                specialist = self.agents[subtask.agent]
                await specialist.run(subtask)
        
        # 5. Collect results, update memory
        summary = await self._synthesize(result)
        await self.memory.store(user_input, summary)
        
        return summary
```

### Agent Hierarchy

```
User Input
    │
    ▼
PLATO (CEO) ──────────────────────────────────────
    │           │           │           │          │
    ▼           ▼           ▼           ▼          ▼
SOCRATES   ARISTOTLE   ODYSSEUS   ATHENA    PYTHAGORAS
(Strategy) (Memory)   (Outreach) (Calendar) (Analytics)
    │           │           │           │          │
    ▼           ▼           ▼           ▼          ▼
HERACLITUS  LEONIDAS    ARCHIMEDES   SOLON
(Research) (Ops)       (Engineering) (Finance)
    │
    ▼
HERMES AGENT  │  BROWSER HARNESS  │  RUFLOW
(autonomous)     (web interaction)    (workflows)
```

### Agent Personalities & Prompts

**Plato (CEO)**
Strategic leader. Makes decisions. Delegates work. Produces briefings. Always thinks long-term. Calm, authoritative, wise.

**Socrates (Strategy)**
Questions everything. Challenges assumptions. Finds logical flaws. Prevents bad decisions. Annoyingly correct.

**Aristotle (Knowledge)**
Memory keeper. Organizes information. Retrieves context. Maintains truth. Patient, methodical, precise.

**Leonidas (Operations)**
Runs the system. Monitors health. Enforces discipline. Restarts services. No-nonsense, efficient, reliable.

**Athena (Executive Assistant)**
Calendar, scheduling, tasks, reminders. Keeps the human organized. Warm, efficient, proactive.

**Heraclitus (Research)**
Constantly learning. Finds opportunities. Monitors markets. Reports changes. Curious, perceptive, insightful.

**Pythagoras (Analytics)**
Numbers, metrics, forecasts, statistics. Mathematical precision. Cold, factual, predictive.

**Solon (Finance)**
Money, invoices, cashflow, budgeting. Financial wisdom. Conservative, prudent, exact.

**Archimedes (Engineering)**
Infrastructure, APIs, deployment, debugging. Technical excellence. Precise, inventive, thorough.

**Odysseus (Outreach)**
Communication across all channels. Persuasive, persistent, adaptive. Never gives up on a lead.

---

## 7. MEMORY SYSTEM

### Architecture

```
                    ┌──────────────────┐
                    │  User Input      │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Embedding Gen   │
                    │  (text-embedding │
                    │   -3-small)      │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
     │ Vector Search │ │Keyword   │ │ Hybrid      │
     │ (pgvector)    │ │Search    │ │ Reranker    │
     │ cosine sim    │ │(tsvector)│ │             │
     └────────┬──────┘ └────┬─────┘ └──────┬──────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Context Window  │
                    │  Builder         │
                    │  (rank + trim)   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Agent Processes │
                    │  with Context    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Store Result    │
                    │  + Embedding     │
                    └──────────────────┘
```

### Memory Types

| Type | Retention | Use Case |
|------|-----------|----------|
| Working | Session | Current conversation context |
| Short-term | 24h | Recent interactions, pending tasks |
| Long-term | Indefinite | Client preferences, business facts |
| Episodic | 90 days | Specific conversations, events |
| Semantic | Indefinite | Knowledge, SOPs, learned patterns |

### Embedding Pipeline

```
Message/Content
    → Chunk (512 tokens, 128 overlap)
    → Generate embedding (text-embedding-3-small, 1536d)
    → Store in pgvector
    → Async: update metadata index
    → Async: update summary if important (threshold > 0.7)
```

### Retrieval Strategy

1. **Semantic Search** — Cosine similarity on pgvector (top-20)
2. **Keyword Search** — PostgreSQL tsvector (top-10)
3. **Hybrid Rerank** — Combine scores, rerank by recency + importance
4. **Context Injection** — Top-5 results injected into agent system prompt
5. **Cache** — Redis cache for frequent queries (TTL: 5 min)

---

## 8. QUEUE & WORKER SYSTEM

### Celery Architecture

```
                    ┌──────────────┐
                    │  FastAPI App │
                    │  (Producer)  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Redis      │
                    │  (Broker)    │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
  ┌───────▼──────┐ ┌──────▼───────┐ ┌──────▼───────┐
  │ Outreach      │ │ Memory       │ │ Analytics    │
  │ Worker        │ │ Index Worker │ │ Worker       │
  │ (4 concurrency│ │ (2 concur.)  │ │ (2 concur.)  │
  └───────┬───────┘ └──────┬───────┘ └──────┬───────┘
          │                │                │
  ┌───────▼───────┐ ┌──────▼───────┐ ┌──────▼───────┐
  │ Email Worker  │ │ Research     │ │ Report Gen   │
  │               │ │ Worker       │ │ Worker       │
  └───────────────┘ └──────────────┘ └──────────────┘
```

### Queue Definitions

```python
# Priority queues
QUEUES = {
    "critical":   {"routing_key": "critical", "priority": 0},  # System health
    "high":       {"routing_key": "high",     "priority": 1},  # User-facing tasks
    "default":    {"routing_key": "default",  "priority": 2},  # Standard processing
    "low":        {"routing_key": "low",      "priority": 3},  # Background indexing
    "batch":      {"routing_key": "batch",    "priority": 4},  # Bulk operations
}
```

### Worker Tasks

```
Outreach Queue:
  - send_whatsapp_message(lead_id, template)
  - send_email(lead_id, template, variables)
  - send_social_message(channel, lead_id, content)
  - execute_campaign_drip(campaign_id)
  - follow_up_lead(lead_id, days_since_last)
  - enrich_lead(lead_id, source)

Memory Queue:
  - index_message_embedding(message_id)
  - index_knowledge_entry(entry_id)
  - consolidate_memory(org_id, period)
  - prune_stale_memories(org_id)
  - summarize_conversation(conversation_id)

Analytics Queue:
  - compute_daily_metrics(org_id, date)
  - compute_mrr(org_id, period)
  - refresh_dashboard_cache(org_id)
  - generate_weekly_report(org_id)
  - compute_lead_scores(org_id)

Research Queue:
  - research_industry(industry_name)
  - find_leads(industry, location)
  - analyze_competitor(company_name)
  - monitor_news(keywords)

Email Queue:
  - send_transactional(template, to, data)
  - send_campaign_batch(campaign_id, batch)
  - handle_bounce(notification)
  - send_invoice(invoice_id)

Report Queue:
  - generate_client_report(client_id)
  - generate_monthly_summary(org_id)
  - generate_campaign_report(campaign_id)
```

---

## 9. FRONTEND ARCHITECTURE

### Component Tree

```
<App>
  <Providers>
    <QueryClient>
    <SupabaseProvider>
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <DashboardShell>
          <Sidebar />
          <TopBar />
          <MainContent>
            <RouteRenderer />
          </MainContent>
          <CommandPalette />      ⌘K quick access
          <NotificationCenter />
          <AIOverlay />            Floating AI chat
        </DashboardShell>
      </Router>
    </AuthProvider>
  </Providers>
</App>
```

### Key Design System

**Design Token:**
- Background: `#fafafa` (light) / `#0a0a0a` (dark)
- Surface: White / `#141414` with subtle glass effect
- Accent: `#6366f1` (indigo) — single elegant accent
- Text: `#18181b` / `#fafafa`
- Radius: `12px` cards, `8px` inputs, `9999px` pills
- Shadows: soft, layered, `box-shadow: 0 1px 3px rgba(0,0,0,0.04)`
- Typography: Inter (body), Plus Jakarta Sans (headings)

**Layout:**
- Collapsible sidebar (240px → 64px)
- Fixed top bar with search, notifications, user menu
- Main content area with max-width containers
- Floating AI chat bubble (bottom-right)
- Command palette (⌘K) for everything

### State Management

```typescript
// Zustand stores
interface AuthStore {
  user: User | null;
  org: Organization | null;
  session: Session | null;
  setAuth: (auth: Auth) => void;
  logout: () => void;
}

interface UIStore {
  sidebar: 'expanded' | 'collapsed';
  theme: 'light' | 'dark';
  commandPalette: boolean;
  aiChat: boolean;
  notifications: Notification[];
}

interface DashboardStore {
  metrics: DashboardMetrics;
  isLoading: boolean;
  refresh: () => Promise<void>;
}
```

### Route Design

```
/                           → Redirect to /dashboard
/login                      → Auth page
/signup                     → Auth page
/magic-link                 → Magic link handler

/dashboard                  → CEO dashboard (Plato's view)
/dashboard/crm              → CRM & client list
/dashboard/leads            → Lead pipeline
/dashboard/leads/:id        → Lead detail
/dashboard/clients          → Client list
/dashboard/clients/:id      → Client detail

/dashboard/campaigns        → Campaign list
/dashboard/campaigns/:id    → Campaign detail
/dashboard/campaigns/new    → New campaign wizard

/dashboard/finance          → Finance overview
/dashboard/finance/invoices → Invoices
/dashboard/finance/expenses → Expenses

/dashboard/conversations    → All conversations
/dashboard/conversations/:id → Conversation thread

/dashboard/analytics        → Deep analytics
/dashboard/agents           → AI agent management
/dashboard/knowledge        → Knowledge base
/dashboard/calendar         → Calendar & scheduling
/dashboard/tasks            → Task board
/dashboard/settings         → Organization settings
/dashboard/settings/team    → Team management
/dashboard/settings/integrations → Integrations

/chat                       → Full AI council chat
```

---

## 10. AUTOMATION SYSTEM

### Rule Engine

```python
# Example automation rules
RULES = {
    "new_lead_assignment": {
        "trigger": "lead.created",
        "conditions": {"status": "new", "source": "website"},
        "actions": [
            {"type": "assign_agent", "agent": "odysseus"},
            {"type": "schedule", "delay": "1h", "action": "send_welcome"},
            {"type": "enrich", "source": "hermes"},
        ]
    },
    "lead_reply_detected": {
        "trigger": "message.incoming",
        "conditions": {"lead.status": "sent", "direction": "in"},
        "actions": [
            {"type": "notify", "channel": "push"},
            {"type": "update_lead", "status": "replied"},
            {"type": "schedule", "delay": "5m", "action": "generate_reply"},
        ]
    },
    "invoice_overdue": {
        "trigger": "schedule.daily",
        "conditions": {"invoice.status": "overdue"},
        "actions": [
            {"type": "send_reminder", "channel": "email"},
            {"type": "send_reminder", "channel": "whatsapp"},
            {"type": "create_task", "assignee": "solon"},
        ]
    }
}
```

### Scheduled Automations

```
Daily 06:00 → Morning briefing (Plato)
Daily 08:00 → Lead enrichment batch
Daily 09:00 → Follow-up scan (Odysseus)
Daily 12:00 → Mid-day check-in
Daily 18:00 → Daily metrics compute (Pythagoras)
Daily 20:00 → Evening summary (Plato)
Daily 22:00 → Memory consolidation (Aristotle)
Weekly Mon → Weekly report generation
Weekly Fri → Campaign performance review
Monthly 1st → MRR calculation & billing
Monthly 1st → Client report generation
```

---

## 11. INTEGRATION LAYER

### WhatsApp Integration (Existing wa_bot.js)

```
wa_bot.js (whatsapp-web.js)
    → Inbound message → Webhook → FastAPI /webhooks/whatsapp
    → FastAPI process → Store in Supabase messages table
    → Trigger AI agent if needed
    → Queue reply if auto-reply enabled
    → Outbound: Worker reads pending_replies → sends via WhatsApp
```

### Hermes Agent Integration

```
FastAPI → Hermes Agent API
    → Long-running research
    → Complex automation
    → Multi-step tasks
    → Returns results asynchronously via webhook
```

### Browser Harness Integration

```
FastAPI → Browser Harness
    → Web scraping & lead research
    → Form automation
    → Portal login & data extraction
    → Competitor analysis
    → Returns structured data
```

### n8n Integration

```
n8n (self-hosted)
    → Workflow visual editor
    → Webhook triggers from platform
    → 400+ integrations
    → Runs in Docker alongside platform
    → Triggered by FastAPI or scheduled
```

---

## 12. DEPLOYMENT & INFRASTRUCTURE

### Coolify Deployment

```
Coolify (self-hosted on Hetzner VPS)
├── Service: socrates-web
│   ├── Build: Docker (node:22-alpine)
│   ├── Port: 3000
│   ├── Env: NEXT_PUBLIC_SUPABASE_URL, CLERK_*, etc.
│   └── Proxy: Coolify reverse proxy
│
├── Service: socrates-api
│   ├── Build: Docker (python:3.14-slim)
│   ├── Port: 8000
│   ├── Workers: 4 (uvicorn)
│   └── Health: /health/readiness, /health/liveness
│
├── Service: socrates-worker
│   ├── Build: Docker (python:3.14-slim)
│   ├── Command: celery worker
│   └── Concurrency: 4-8 depending on workload
│
├── Service: socrates-beat
│   ├── Build: Docker (python:3.14-slim)
│   └── Command: celery beat
│
├── Service: redis
│   ├── Image: redis:7-alpine
│   └── Volumes: redis-data
│
├── Service: n8n
│   ├── Image: n8nio/n8n
│   ├── Port: 5678
│   └── Volumes: n8n-data
│
├── Service: postgres (optional, use Supabase instead)
│
└── Service: coolify-db (Coolify's own DB)
```

### Docker Compose

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: docker/web.Dockerfile
    ports:
      - "3000:3000"
    env_file: .env
    depends_on: [api]
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/api/health"]

  api:
    build:
      context: .
      dockerfile: docker/api.Dockerfile
    ports:
      - "8000:8000"
    env_file: .env
    depends_on: [redis]
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

  worker:
    build:
      context: .
      dockerfile: docker/worker.Dockerfile
    env_file: .env
    depends_on: [redis, api]
    command: celery -A app.workers.celery_app worker --loglevel=info --concurrency=4

  beat:
    build:
      context: .
      dockerfile: docker/worker.Dockerfile
    env_file: .env
    depends_on: [redis]
    command: celery -A app.workers.celery_app beat --loglevel=info

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    env_file: .env
    volumes:
      - n8n-data:/home/node/.n8n

volumes:
  redis-data:
  n8n-data:
```

### Monitoring Stack

```
Sentry → Error tracking (all services)
Better Stack → Uptime monitoring, logging
Prometheus → Metrics collection
Grafana → Dashboard visualization
    - API request rate, latency, errors
    - Worker queue depth, processing time
    - Database connection pool, query performance
    - Redis memory, hit rate
    - AI agent call volume, latency, token usage
```

---

## 13. SECURITY ARCHITECTURE

### Layers

1. **Network**: Cloudflare WAF, DDoS protection, SSL termination
2. **Authentication**: Clerk JWT validation on every request
3. **Authorization**: Role-based middleware + RLS in Supabase
4. **Input**: Pydantic validation, SQL injection protection via parameterized queries
5. **Output**: Response sanitization, no sensitive data leakage
6. **Rate Limiting**: Redis-based, per-user/IP/endpoint
7. **Encryption**: AES-256 for sensitive fields at rest, TLS for transit
8. **Audit**: Every action logged with user, resource, timestamp

### Rate Limiting

```python
# Rate limit tiers
TIERS = {
    "authenticated": {"requests": 100, "window": 60},    # 100 req/min
    "unauthenticated": {"requests": 10, "window": 60},   # 10 req/min
    "webhook": {"requests": 200, "window": 60},          # 200 req/min
    "ai_chat": {"requests": 30, "window": 60},           # 30 req/min
    "export": {"requests": 5, "window": 60},             # 5 req/min
}
```

---

## 14. MONITORING & OBSERVABILITY

### Logging Structure

```json
{
  "timestamp": "2026-06-10T10:00:00Z",
  "level": "info",
  "service": "socrates-api",
  "request_id": "req_abc123",
  "user_id": "user_xyz",
  "org_id": "org_123",
  "action": "lead.create",
  "duration_ms": 45,
  "status_code": 201,
  "error": null,
  "metadata": {
    "lead_id": "lead_abc",
    "source": "web_form"
  }
}
```

### Key Metrics

```
API:
  - request_rate (per endpoint, per user)
  - p50/p95/p99 latency (per endpoint)
  - error_rate (per endpoint)
  - active_users

Workers:
  - queue_depth (per queue)
  - processing_time (per task type)
  - success_rate (per task type)
  - retry_count (per task)

Database:
  - connection_pool_usage
  - query_latency_p95
  - active_connections
  - cache_hit_ratio

AI:
  - token_usage (per agent, per day)
  - call_latency (per provider)
  - cost_per_agent (per day)
  - error_rate (timeouts, refusals)

Infrastructure:
  - CPU (per service)
  - RAM (per service)
  - Disk
  - Network
```

---

## 15. SCALING STRATEGY

### Current Scale (10-100 clients)
- Single Coolify instance on Hetzner VPS (4 vCPU, 8GB RAM)
- Supabase Free/Pro tier
- Redis single instance
- Everything on one Docker host

### Mid Scale (100-10,000 clients)
- Multiple Coolify instances
- Supabase Scale tier
- Redis Cluster (3 nodes)
- Separate worker hosts
- CDN for static assets (Cloudflare)
- Read replicas for analytics queries

### Enterprise Scale (10,000-100,000+ clients)
- Kubernetes on Hetzner
- Supabase Enterprise / dedicated PostgreSQL
- Redis Cluster (6+ nodes)
- Horizontal pod autoscaling
- Separate AI inference cluster
- Multi-region deployment
- Database read replicas + sharding
- CDN + edge compute (Cloudflare Workers)

### Breaking Points & Mitigations

| Component | Break Point | Mitigation |
|-----------|------------|------------|
| PostgreSQL (single) | 10M+ leads | Read replicas, sharding, partitioning |
| Redis (single) | 10K+ queue depth | Redis Cluster |
| Celery (single worker) | 100K+ tasks/day | Multiple workers, separate queues |
| pgvector | 1M+ vectors | IVF index with appropriate lists, partitioning by org |
| LLM API | $5K+/month | Caching, smaller models for simple tasks, batching |
| Next.js | 10K+ concurrent | Edge runtime, ISR, CDN caching |

---

## 16. ENVIRONMENT VARIABLES

```env
# === Supabase ===
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# === Clerk Auth ===
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# === Redis ===
REDIS_URL=redis://localhost:6379

# === Celery ===
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# === OpenAI / LLM ===
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# === Resend (Email) ===
RESEND_API_KEY=

# === WhatsApp ===
WHATSAPP_SESSION_PATH=./.wwebjs_auth

# === Sentry ===
SENTRY_DSN=
SENTRY_ENVIRONMENT=development

# === PostHog ===
NEXT_PUBLIC_POSTHOG_KEY=
POSTHOG_HOST=

# === Cloudflare R2 ===
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# === Coolify ===
COOLIFY_API_TOKEN=
COOLIFY_PROJECT_ID=

# === Hermes Agent ===
HERMES_API_URL=
HERMES_API_KEY=

# === Browser Harness ===
BROWSER_HARNESS_URL=
BROWSER_HARNESS_API_KEY=

# === n8n ===
N8N_URL=http://localhost:5678
N8N_API_KEY=

# === App Config ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_URL=http://localhost:8000
JWT_SECRET=
ENCRYPTION_KEY=
```

---

## 17. TASK EXECUTION PLAN

### Phase 1: Architecture & Planning (NOW)
- ✅ Architecture document complete
- Set up folder structure
- Initialize dependencies
- Configure development environment

### Phase 2: Backend Foundation (Day 1-3)
- Set up FastAPI project with all routers
- Configure database models & migrations
- Implement authentication middleware
- Build CRUD services (leads, clients, campaigns)
- Set up Celery & Redis
- Deploy to Coolify

### Phase 3: Frontend Foundation (Day 3-6)
- Set up Next.js with shadcn/ui
- Build design system (tokens, components)
- Create dashboard shell (sidebar, topbar)
- Build auth pages (login, signup)
- Implement CRM views
- Implement lead pipeline
- Real-time subscriptions

### Phase 4: AI Council (Day 6-10)
- Implement base agent class
- Build council orchestrator
- Implement Plato (CEO)
- Implement Socrates (Strategy)
- Implement Aristotle (Memory)
- Implement all other agents
- Set up memory system (pgvector)
- Integrate with LLM providers

### Phase 5: Outreach & Automation (Day 10-13)
- Connect WhatsApp bot to platform
- Build campaign engine
- Implement drip sequences
- Set up automation rules
- Configure scheduled jobs
- Integrate email (Resend)

### Phase 6: Analytics & Finance (Day 13-15)
- Build finance module (MRR, invoices)
- Implement analytics engine
- Create dashboard widgets
- Set up reporting
- Build predictions

### Phase 7: Integrations (Day 15-17)
- Connect Hermes Agent
- Connect Browser Harness
- Set up n8n
- Social media integrations
- Calendar integration

### Phase 8: Testing & Hardening (Day 17-20)
- Unit tests
- Integration tests
- Security audit
- Performance testing
- Load testing
- Bug fixes

### Phase 9: Deployment & Production (Day 20-22)
- Final deployment
- Monitoring setup
- Backup configuration
- Documentation
- Production verification
```

---

## 18. PRODUCTION FOLDER SETUP

We should begin by setting up the actual backend project structure. Let me know when you're ready to start **Phase 2: Backend Foundation**, and I'll begin implementing the FastAPI backend with database models, authentication, and core services.

**Note:** To keep everything clean, I'll rename `mcf-dashboard` to `socrates-ai` as our project root, since it's already a Next.js project with Supabase configured.
