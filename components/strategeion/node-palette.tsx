'use client';

import { useState, useCallback, type DragEvent } from 'react';
import {
  UserPlus, MessageCircle, Mail, Calendar, Clock, Globe, Play,
  Brain, Zap, Infinity,
  Send, Share2, Camera, Edit2, CheckSquare, Bell,
  GitBranch, MessageSquare, Repeat, Octagon,
  ChevronDown, ChevronRight, Blocks, Sparkles,
} from 'lucide-react';
import {
  TRIGGERS, ACTIONS, LOGIC_BLOCKS,
  AGENTS_PHILOSOPHER, AGENTS_GODS, AGENTS_OMEGA,
  type NodeCategory,
} from './types';

interface NodePaletteProps {
  onDragStart: (category: NodeCategory, label: string, data: Record<string, unknown>) => void;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  UserPlus, MessageCircle, Mail, Calendar, Clock, Globe, Play,
  Brain, Zap, Infinity, Send, Share2, Camera, Edit2, CheckSquare, Bell,
  GitBranch, MessageSquare, Repeat, Octagon, ChevronDown, ChevronRight,
};

function Icon({ name, size = 12 }: { name: string; size?: number }) {
  const IconCmp = iconMap[name];
  if (!IconCmp) return null;
  return <IconCmp size={size} />;
}

function Section({
  label, color, children, defaultOpen = true,
}: {
  label: string; color: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 16px', cursor: 'pointer', width: '100%',
          background: 'none', border: 'none',
        }}
      >
        <span style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize: 9, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color,
        }}>
          {label}
        </span>
        {open
          ? <ChevronDown size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
          : <ChevronRight size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
        }
      </button>
      {open && <div style={{ padding: '0 9px 9px' }}>{children}</div>}
    </div>
  );
}

function DraggableCard({
  icon, name, desc, category, label, color, onDragStart,
}: {
  icon?: string; name: string; desc?: string; category: NodeCategory;
  label?: string; color?: string; onDragStart: NodePaletteProps['onDragStart'];
}) {
  const handleDragStart = useCallback((e: DragEvent) => {
    e.dataTransfer.setData('application/strategeion-node', JSON.stringify({
      category, label: label || name, data: { name, color },
    }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(category, label || name, { name, color });
  }, [category, label, name, color, onDragStart]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{
        display: 'flex', alignItems: desc ? 'flex-start' : 'center', gap: 8,
        padding: '7px 8px', borderRadius: 6,
        background: 'rgba(255,255,255,0.04)',
        marginBottom: 2, cursor: 'grab',
        border: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {icon && (
        <span style={{ color, marginTop: desc ? 2 : 0, flexShrink: 0, display: 'flex' }}>
          <Icon name={icon} size={12} />
        </span>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: "'Hanken Grotesk',sans-serif",
          fontSize: 11, fontWeight: 500,
          color: 'rgba(255,255,255,0.82)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {name}
        </div>
        {desc && <div style={{
          fontFamily: "'Hanken Grotesk',sans-serif",
          fontSize: 10, color: 'rgba(255,255,255,0.32)',
          marginTop: 1,
        }}>{desc}</div>}
      </div>
    </div>
  );
}

function AgentGrid({
  agents, category, onDragStart,
}: {
  agents: readonly { readonly name: string; readonly color: string }[];
  category: NodeCategory;
  onDragStart: NodePaletteProps['onDragStart'];
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
      {agents.map(a => {
        const isOmega = category === 'omega';
        return (
          <div
            key={a.name}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/strategeion-node', JSON.stringify({
                category, label: a.name.toUpperCase(), data: { name: a.name, color: a.color },
              }));
              e.dataTransfer.effectAllowed = 'move';
              onDragStart(category, a.name.toUpperCase(), { name: a.name, color: a.color });
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 6px', borderRadius: 5, cursor: 'grab',
              background: isOmega ? 'rgba(44,0,80,0.22)' : 'rgba(255,255,255,0.03)',
            }}
          >
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: a.color, flexShrink: 0,
              ...(isOmega ? { boxShadow: `0 0 5px ${a.color}` } : {}),
            }} />
            <span style={{
              fontFamily: "'Hanken Grotesk',sans-serif",
              fontSize: 11,
              color: isOmega ? 'rgba(216,180,254,0.72)' : 'rgba(255,255,255,0.68)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {a.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <div style={{
      width: 260,
      background: '#0F1722',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px 9px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7,
      }}>
        <Blocks size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
        <span style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.35)',
        }}>
          Build Blocks
        </span>
      </div>

      {/* Scrollable sections */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* TRIGGERS */}
        <Section label="Triggers" color="#C9A24D">
          {TRIGGERS.map(t => (
            <DraggableCard
              key={t.id}
              icon={t.icon}
              name={t.name}
              desc={t.desc}
              category="trigger"
              color="#C9A24D"
              onDragStart={onDragStart}
            />
          ))}
        </Section>

        {/* AGENTS */}
        <Section label="Agents" color="#4A7AC8">
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.28)', padding: '5px 6px 3px' }}>
            Philosophers
          </div>
          <AgentGrid agents={AGENTS_PHILOSOPHER} category="philosopher" onDragStart={onDragStart} />

          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.28)', padding: '8px 6px 3px' }}>
            Gods &amp; Titans
          </div>
          <AgentGrid agents={AGENTS_GODS} category="god" onDragStart={onDragStart} />

          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(192,132,252,0.5)', padding: '8px 6px 3px' }}>
            Ω Omega
          </div>
          <AgentGrid agents={AGENTS_OMEGA} category="omega" onDragStart={onDragStart} />

          {/* Smart Sequence */}
          <div style={{
            marginTop: 10, padding: '10px 10px', borderRadius: 8,
            background: 'linear-gradient(135deg,#123C69 0%,#4C1D95 100%)',
            cursor: 'pointer',
            border: '1px solid rgba(201,162,77,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <Sparkles size={13} style={{ color: '#C9A24D' }} />
              <span style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.09em', color: 'white',
              }}>
                Smart Sequence
              </span>
            </div>
            <div style={{
              fontFamily: "'Hanken Grotesk',sans-serif",
              fontSize: 10, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4,
            }}>
              Describe what you want → AI picks the agents
            </div>
          </div>
        </Section>

        {/* ACTIONS */}
        <Section label="Actions" color="#6F7D4F" defaultOpen={false}>
          {ACTIONS.map(a => (
            <DraggableCard
              key={a.id}
              icon={a.icon}
              name={a.name}
              category="action"
              color="#6F7D4F"
              onDragStart={onDragStart}
            />
          ))}
        </Section>

        {/* LOGIC */}
        <Section label="Logic" color="#938C7A" defaultOpen={false}>
          {LOGIC_BLOCKS.map(l => (
            <DraggableCard
              key={l.id}
              icon={l.icon}
              name={l.name}
              category="logic"
              color="#938C7A"
              onDragStart={onDragStart}
            />
          ))}
        </Section>
      </div>
    </div>
  );
}
