'use client';
import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import AgentPortrait from '@/components/ui/agent-portrait';

export interface Agent {
  name: string;
  role: string;
  color: string;
  icon?: any;
}

interface AgentSelectProps {
  agents: Agent[];
  selected: Agent;
  onSelect: (agent: Agent) => void;
  className?: string;
}

export function AgentSelect({ agents, selected, onSelect, className }: AgentSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className={className} style={{ position: 'relative', zIndex: 50 }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', width: '100%',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        <AgentPortrait agentName={selected.name} size={28} />
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selected.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{selected.role}</div>
        </div>
        <ChevronDown size={16} color="var(--muted)" style={{
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          maxHeight: 360,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Search */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search agents..."
              style={{ width: '100%', paddingLeft: 28, fontSize: 13, border: 'none', outline: 'none', background: 'transparent' }}
            />
          </div>

          {/* Agent list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>No agents found</div>
            ) : (
              filtered.map(agent => {
                const isActive = agent.name === selected.name;
                return (
                  <button
                    key={agent.name}
                    onClick={() => { onSelect(agent); setOpen(false); setSearch(''); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '10px 14px', border: 'none', cursor: 'pointer',
                      fontSize: 13, textAlign: 'left',
                      background: isActive ? `${agent.color}10` : 'transparent',
                      color: isActive ? agent.color : 'var(--foreground)',
                    }}
                  >
                    <AgentPortrait agentName={agent.name} size={28} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{agent.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{agent.role}</div>
                    </div>
                    {isActive && <Check size={16} color={agent.color} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
