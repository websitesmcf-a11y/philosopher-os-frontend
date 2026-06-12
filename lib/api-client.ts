/**
 * Socrates AI — Typed API client for the FastAPI backend.
 */
import { supabase } from './supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ─── Typed error hierarchy ──────────────────────────

export class ApiError extends Error {
  status: number;
  code: string;
  detail: string;

  constructor(status: number, detail: string, code = 'unknown') {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }

  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isValidationError() {
    return this.status === 422;
  }

  get isServerError() {
    return this.status >= 500;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, headers = {}, signal } = opts;

  let url = `${API_BASE}${path}`;
  if (params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) search.set(k, String(v));
    });
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  }

  // Auth token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const detail = errBody.detail || errBody.message || res.statusText || `API error ${res.status}`;
    const code = errBody.code || errBody.error || 'unknown';
    throw new ApiError(res.status, detail, code);
  }

  return res.json();
}

// ─── Types ───────────────────────────────────────────

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'meeting_booked' | 'proposal_sent' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'ghosted' | 'follow_up_needed';
export type ClientStatus = 'active' | 'pending' | 'completed' | 'paused' | 'lost' | 'cancelled';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Lead {
  id: string; org_id: string; name: string; phone?: string; email?: string;
  company?: string; industry?: string; source?: string; status: LeadStatus;
  score: number; tags: string[]; notes?: string; assigned_to?: string;
  first_contacted_at?: string; last_contacted_at?: string; converted_at?: string;
  created_at?: string; updated_at?: string;
}

export interface Client {
  id: string; org_id: string; lead_id?: string; name: string; phone?: string;
  email?: string; company?: string; industry?: string; contract_status: ClientStatus;
  mrr: number; lifetime_value: number; currency?: string; created_at?: string; updated_at?: string;
}

export interface Conversation {
  id: string; org_id: string; lead_id?: string; client_id?: string;
  channel: string; status: string; last_message_at?: string; created_at?: string;
}

export interface Campaign {
  id: string; org_id: string; name: string; channel: string; industry?: string;
  message_template: string; status: CampaignStatus; schedule_config: Record<string, unknown>;
  target_count: number; sent_count: number; reply_count: number; conversion_count: number;
  created_at?: string;
}

export interface Task {
  id: string; title: string; description?: string; priority: Priority;
  status: TaskStatus; assignee_id?: string; assigned_agent?: string;
  due_date?: string; completed_at?: string; created_at?: string;
}

export interface Invoice {
  id: string; invoice_number: string; client_id?: string; amount: number;
  currency: string; status: InvoiceStatus; due_date?: string; paid_at?: string;
  lines: Array<{ description: string; amount: number }>; created_at?: string;
}

export interface DashboardMetrics {
  total_leads: number; new_leads_today: number; active_campaigns: number;
  conversion_rate: number; total_clients: number; mrr: number;
  revenue_today: number; tasks_pending: number; messages_today: number;
  agent_actions_today: number;
}

export interface AgentStatus {
  name: string; role: string; status: string;
  tasks_completed: number; tasks_failed: number;
}

export interface ChatMessage {
  reply: string; agent: string; conversation_id: string; actions: Array<Record<string, unknown>>;
}

export interface CalendarEvent {
  id: string; title: string; description?: string; event_type: string;
  start_time: string; end_time?: string; status?: string;
  created_by?: string; created_at?: string;
}

export interface MRRBreakdown {
  total_mrr: number; new_business: number; expansion: number;
  churn: number; contraction: number; net_new: number; period: string;
}

// ─── Auth ────────────────────────────────────────────

export async function getCurrentUser() {
  return request<{ id: string; email: string; name: string; role: string }>('/auth/me');
}

// ─── Dashboard ───────────────────────────────────────

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return request('/analytics/dashboard');
}

export async function getLeadAnalytics(): Promise<Record<string, unknown>> {
  return request('/analytics/leads');
}

export async function getCampaignAnalytics(): Promise<Record<string, unknown>> {
  return request('/analytics/campaigns');
}

export interface TrendPoint {
  month: string; year: number; revenue: number; leads: number;
}

export interface WeeklyPoint {
  day: string; date: string; leads: number; conversions: number; revenue: number;
}

export interface ActivityEvent {
  type: 'lead' | 'invoice' | 'campaign' | 'task' | string;
  text: string;
  at: string;
}

export async function getTrends(months = 6): Promise<{ items: TrendPoint[] }> {
  return request('/analytics/trends', { params: { months } });
}

export async function getWeekly(): Promise<{ items: WeeklyPoint[] }> {
  return request('/analytics/weekly');
}

export async function getActivity(limit = 15): Promise<{ items: ActivityEvent[] }> {
  return request('/analytics/activity', { params: { limit } });
}

// ─── Leads ───────────────────────────────────────────

export async function listLeads(params?: {
  page?: number; page_size?: number; status?: string; source?: string;
  industry?: string; search?: string;
}): Promise<{ items: Lead[]; total: number; page: number; page_size: number }> {
  return request('/leads', { params: params as Record<string, string | number | undefined> });
}

export async function createLead(data: Partial<Lead>): Promise<Lead> {
  return request('/leads', { method: 'POST', body: data });
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
  return request(`/leads/${id}`, { method: 'PATCH', body: data });
}

export async function deleteLead(id: string): Promise<void> {
  return request(`/leads/${id}`, { method: 'DELETE' });
}

// ─── Clients ─────────────────────────────────────────

export async function listClients(params?: { page?: number; page_size?: number; status?: string }) {
  return request<{ items: Client[]; total: number }>('/clients', { params: params as Record<string, string | number | undefined> });
}

export async function createClient(data: Partial<Client>): Promise<Client> {
  return request('/clients', { method: 'POST', body: data });
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client> {
  return request(`/clients/${id}`, { method: 'PATCH', body: data });
}

// ─── Campaigns ───────────────────────────────────────

export async function listCampaigns(params?: { page?: number; page_size?: number; status?: string }) {
  return request<{ items: Campaign[]; total: number }>('/campaigns', { params: params as Record<string, string | number | undefined> });
}

export async function createCampaign(data: Partial<Campaign>): Promise<Campaign> {
  return request('/campaigns', { method: 'POST', body: data });
}

export async function launchCampaign(id: string): Promise<{ launched: boolean }> {
  return request(`/campaigns/${id}/launch`, { method: 'POST' });
}

export async function pauseCampaign(id: string): Promise<{ paused: boolean }> {
  return request(`/campaigns/${id}/pause`, { method: 'POST' });
}

export async function deleteCampaign(id: string): Promise<{ deleted: boolean }> {
  return request(`/campaigns/${id}`, { method: 'DELETE' });
}

// ─── Calendar ─────────────────────────────────────────

export async function listCalendarEvents(params?: { start?: string; end?: string }) {
  return request<{ items: CalendarEvent[]; total: number }>('/calendar/events', { params: params as Record<string, string | number | undefined> });
}

export async function createCalendarEvent(data: Partial<CalendarEvent>): Promise<CalendarEvent> {
  return request('/calendar/events', { method: 'POST', body: data });
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  return request(`/calendar/events/${id}`, { method: 'DELETE' });
}

// ─── Finance ─────────────────────────────────────────

export async function getMRR(period = 'monthly'): Promise<MRRBreakdown> {
  return request('/finance/mrr', { params: { period } });
}

export async function getInvoices(params?: { page?: number; page_size?: number }) {
  return request<{ items: Invoice[]; total: number }>('/finance/invoices', { params: params as Record<string, string | number | undefined> });
}

export async function getCashflow(): Promise<{ total_revenue: number; total_expenses: number; net_cashflow: number }> {
  return request('/finance/cashflow');
}

export function formatCurrency(amount: number): string {
  return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Conversations ───────────────────────────────────

export async function listConversations(params?: { page?: number; channel?: string }) {
  return request<{ items: Conversation[]; total: number }>('/conversations', { params: params as Record<string, string | number | undefined> });
}

// ─── Tasks ───────────────────────────────────────────

export async function listTasks(params?: { status?: string; priority?: string; page?: number }): Promise<{ items: Task[]; total: number }> {
  return request('/tasks', { params: params as Record<string, string | number | undefined> });
}

export async function createTask(data: Partial<Task>): Promise<Task> {
  return request('/tasks', { method: 'POST', body: data });
}

export async function completeTask(id: string): Promise<{ completed: boolean }> {
  return request(`/tasks/${id}/complete`, { method: 'POST' });
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  return request(`/tasks/${id}`, { method: 'PATCH', body: data });
}

export async function deleteTask(id: string): Promise<{ deleted: boolean }> {
  return request(`/tasks/${id}`, { method: 'DELETE' });
}

// ─── Chat / Agents ───────────────────────────────────

export async function chatWithAgent(message: string, agent = 'plato', conversationId?: string): Promise<ChatMessage> {
  return request('/chat', {
    method: 'POST',
    body: { message, agent, conversation_id: conversationId },
  });
}

export interface SSEEvent {
  type: 'meta' | 'token' | 'done' | 'error' | 'tool_start' | 'tool_end' | 'tool';
  content?: string;
  agent?: string;
  agent_role?: string;
  conversation_id?: string;
  /** Tool-use events (agent reasoning trace) */
  tool?: string;
  input?: string;
  output?: string;
  duration_ms?: number;
}

export async function* chatStream(
  message: string,
  agent = 'plato',
  conversationId?: string,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, agent, conversation_id: conversationId }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || err.message || `API error ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event: SSEEvent = JSON.parse(line.slice(6));
          yield event;
        } catch {
          // skip malformed JSON
        }
      }
    }
  }
}

export interface AgentConversation {
  id: string;
  agent: string;
  last_message: string;
  last_message_at: string | null;
  created_at: string | null;
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  agent: string | null;
  content: string;
  created_at: string | null;
}

export async function listAgentConversations(params?: { agent?: string; q?: string; limit?: number }) {
  return request<{ items: AgentConversation[]; total: number }>(
    '/chat/conversations', { params: params as Record<string, string | number | undefined> }
  );
}

export async function getAgentConversationMessages(conversationId: string) {
  return request<{ conversation_id: string; agent: string; items: AgentChatMessage[] }>(
    `/chat/conversations/${conversationId}/messages`
  );
}

export async function listAgentStatus(): Promise<{ agents: AgentStatus[] }> {
  return request('/agents/status');
}

export async function getAgentBriefing(): Promise<Record<string, unknown>> {
  return request('/agents/plato/briefing');
}

// ─── Knowledge ───────────────────────────────────────

export interface KnowledgeArticle {
  id: string; title: string; content: string; category?: string; tags: string[];
  created_at?: string;
}

export async function searchKnowledge(q?: string) {
  return request<{ items: KnowledgeArticle[]; total?: number }>(
    '/knowledge', { params: q ? { q } : undefined }
  );
}

export async function addKnowledge(data: { title: string; content: string; category?: string; tags?: string[] }): Promise<KnowledgeArticle> {
  return request('/knowledge', { method: 'POST', body: data });
}

export async function deleteKnowledge(id: string): Promise<{ deleted: boolean }> {
  return request(`/knowledge/${id}`, { method: 'DELETE' });
}

// ─── Supabase Realtime Hooks ─────────────────────────

export function subscribeToTable(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  callback: () => void
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channel = (supabase as any)
    .channel(`${table}-${Date.now()}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .on('postgres_changes' as any, { event, schema: 'public', table }, callback)
    .subscribe();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return () => { (supabase as any).removeChannel(channel); };
}

// --- Connections -------------------------------------

export interface Connection {
  provider: string;
  label: string;
  description: string;
  docs: string;
  secret_fields: string[];
  config_fields: string[];
  status: 'disconnected' | 'connected' | 'error';
  config: Record<string, unknown>;
  last_checked_at: string | null;
  last_error: string | null;
}

export type WhatsAppLiveStatus = {
  status: 'disconnected' | 'connecting' | 'waiting_for_scan' | 'connected' | 'reconnecting' | 'bridge_offline';
  connected: boolean;
  phone: string | null;
  qr_available: boolean;
};

export async function getGoogleAuthUrl(): Promise<{ auth_url: string; redirect_uri: string }> {
  return request('/connections/google_calendar/auth-url');
}

export async function googleCalendarSync(): Promise<{ pulled: number; pushed: number; total: number }> {
  return request('/connections/google_calendar/sync', { method: 'POST' });
}

export async function obsidianSync(): Promise<{ written: number }> {
  return request('/connections/obsidian/sync', { method: 'POST' });
}

export async function getWhatsAppStatus(): Promise<WhatsAppLiveStatus> {
  return request('/connections/whatsapp/status');
}

/** Fetch the current WhatsApp login QR as an object URL (null when unavailable). */
export async function getWhatsAppQr(): Promise<string | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const res = await fetch(`${API_BASE}/connections/whatsapp/qr?t=${Date.now()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return null;
  return URL.createObjectURL(await res.blob());
}

export async function getConnections(): Promise<{ connections: Connection[] }> {
  return request('/connections');
}

export async function saveConnection(
  provider: string,
  secrets: Record<string, string>,
  config: Record<string, string>
): Promise<{ provider: string; status: string; detail: string }> {
  return request(`/connections/${provider}`, { method: 'POST', body: { secrets, config } });
}

export async function testConnection(
  provider: string
): Promise<{ provider: string; status: string; detail: string }> {
  return request(`/connections/${provider}/test`, { method: 'POST' });
}

export async function deleteConnection(
  provider: string
): Promise<{ provider: string; status: string }> {
  return request(`/connections/${provider}`, { method: 'DELETE' });
}
