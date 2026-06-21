/** Strategeion — Type definitions for the visual automation builder */

import type { Node, Edge, NodeProps } from '@xyflow/react';

// ─── Node Data Types ──────────────────────────────────────

export type NodeCategory = 'trigger' | 'philosopher' | 'god' | 'omega' | 'action' | 'logic';

export interface StrategeionNodeData {
  [key: string]: unknown;
  label: string;
  category: NodeCategory;
  subtitle?: string;
  agentColor?: string;
  agentName?: string;
  agentInitial?: string;
  config?: Record<string, unknown>;
  status?: 'idle' | 'running' | 'completed' | 'error';
}

export type StrategeionNode = Node<StrategeionNodeData>;

export type StrategeionEdge = Edge;

// ─── Flow Types (matching backend) ─────────────────────────

export interface FlowListItem {
  id: string;
  name: string;
  description: string | null;
  status: string;
  version: number;
  run_count: number;
  last_run_at: string | null;
  last_run_status: string | null;
  created_at: string | null;
  updated_at: string | null;
  node_count: number;
}

export interface FlowDetail extends FlowListItem {
  data: {
    nodes: StrategeionNodeData[];
    edges: StrategeionEdge[];
  };
}

// ─── Palette Item Types ────────────────────────────────────

export interface PaletteItem {
  id: string;
  name: string;
  desc?: string;
  icon: string;
  category: NodeCategory;
  color: string;
}

export interface AgentPaletteItem {
  name: string;
  color: string;
  category: NodeCategory;
}

// ─── Template Types ─────────────────────────────────────────

export interface FlowTemplate {
  id: string;
  title: string;
  desc: string;
  color: string;
  agents: string;
  nodes: number;
  gradient: string;
}

// ─── Agent Lists (from design-tokens) ──────────────────────

export const AGENTS_PHILOSOPHER = [
  { name: 'Plato',      color: '#123C69' },
  { name: 'Socrates',   color: '#6F7D4F' },
  { name: 'Aristotle',  color: '#5B6B3A' },
  { name: 'Athena',     color: '#2B5F6B' },
  { name: 'Heraclitus', color: '#C9A24D' },
  { name: 'Pythagoras', color: '#4A4A7A' },
  { name: 'Solon',      color: '#3B6B5E' },
  { name: 'Leonidas',   color: '#8B2020' },
  { name: 'Archimedes', color: '#3B5E7A' },
  { name: 'Odysseus',   color: '#6B3B6B' },
] as const;

export const AGENTS_GODS = [
  { name: 'Iapetus',    color: '#123C69' },
  { name: 'Astraeus',   color: '#7B5EA7' },
  { name: 'Erebos',     color: '#171A21' },
  { name: 'Phantasos',  color: '#C9A24D' },
  { name: 'Stilbon',    color: '#6F7D4F' },
] as const;

export const AGENTS_OMEGA = [
  { name: 'Genesis',     color: '#6B21A8' },
  { name: 'Overmind',    color: '#92400E' },
  { name: 'Omniscient',  color: '#4C1D95' },
  { name: 'Eternal',     color: '#1E3A5F' },
  { name: 'Singularity', color: '#2D0057' },
] as const;

export const TRIGGERS = [
  { id: 'new-lead',      name: 'New Lead Added',    desc: 'Lead created in CRM',          icon: 'UserPlus' },
  { id: 'whatsapp-msg',  name: 'WhatsApp Message',  desc: 'Incoming message received',     icon: 'MessageCircle' },
  { id: 'email-received',name: 'Email Received',    desc: 'New email in inbox',            icon: 'Mail' },
  { id: 'calendar-event',name: 'Calendar Event',    desc: 'Event starts or ends',          icon: 'Calendar' },
  { id: 'scheduled',     name: 'Scheduled (Cron)',  desc: 'Time-based trigger',            icon: 'Clock' },
  { id: 'webhook',       name: 'Webhook',           desc: 'External HTTP request',         icon: 'Globe' },
  { id: 'manual',        name: 'Manual Run',        desc: 'Triggered by user action',      icon: 'Play' },
] as const;

export const ACTIONS = [
  { id: 'send-whatsapp',   name: 'Send WhatsApp',      icon: 'MessageCircle' },
  { id: 'send-email',      name: 'Send Email',         icon: 'Mail' },
  { id: 'post-facebook',   name: 'Post to Facebook',   icon: 'Share2' },
  { id: 'post-instagram',  name: 'Post to Instagram',  icon: 'Camera' },
  { id: 'update-lead',     name: 'Update Lead',        icon: 'Edit2' },
  { id: 'create-task',     name: 'Create Task',        icon: 'CheckSquare' },
  { id: 'notify-team',     name: 'Notify Team',        icon: 'Bell' },
] as const;

export const LOGIC_BLOCKS = [
  { id: 'if-else',      name: 'If / Else Condition', icon: 'GitBranch' },
  { id: 'time-delay',   name: 'Time Delay',           icon: 'Clock' },
  { id: 'wait-reply',   name: 'Wait for Reply',       icon: 'MessageSquare' },
  { id: 'loop',         name: 'Loop',                icon: 'Repeat' },
  { id: 'stop-flow',    name: 'Stop Flow',            icon: 'Octagon' },
] as const;

export const FLOW_TEMPLATES: FlowTemplate[] = [
  { id: 'lead-qual',  title: 'Lead Qualification Flow', desc: 'New lead → strategy review → score → WhatsApp', color: '#123C69', agents: 'Plato, Pythagoras, Stilbon', nodes: 4, gradient: 'linear-gradient(135deg,#0F1722,#1A5088)' },
  { id: 'outreach',   title: 'WhatsApp Outreach Campaign', desc: 'Scheduled outreach → messaging → follow-up', color: '#6F7D4F', agents: 'Stilbon, Odysseus, Leonidas', nodes: 4, gradient: 'linear-gradient(135deg,#3B5E2A,#6F7D4F)' },
  { id: 'daily-brief',title: 'Daily Intelligence Briefing', desc: 'Morning intel → analysis → team notify', color: '#C9A24D', agents: 'Astraeus, Omniscient, Plato', nodes: 4, gradient: 'linear-gradient(135deg,#7A5E2A,#C9A24D)' },
];
