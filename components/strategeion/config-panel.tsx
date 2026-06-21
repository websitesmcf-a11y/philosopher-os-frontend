'use client';

import { X, Settings2, Plus, Sparkles } from 'lucide-react';
import type { StrategeionNode } from './types';

interface ConfigPanelProps {
  node: StrategeionNode | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, data: Record<string, unknown>) => void;
}

const suggestions: Record<string, Array<{ name: string; initial: string; reason: string; color: string }>> = {
  trigger: [
    { name: 'Plato',      initial: 'Pl', reason: 'Strategic outreach planning',                  color: '#123C69' },
    { name: 'Pythagoras', initial: 'Py', reason: 'Lead scoring & data analysis',                 color: '#4A4A7A' },
    { name: 'Stilbon',    initial: 'St', reason: 'Fast WhatsApp follow-up',                      color: '#6F7D4F' },
  ],
  philosopher: [
    { name: 'Pythagoras', initial: 'Py', reason: 'Numerically score this lead',                  color: '#4A4A7A' },
    { name: 'Stilbon',    initial: 'St', reason: 'Fast WhatsApp follow-up',                      color: '#C9A24D' },
    { name: 'Odysseus',   initial: 'Od', reason: 'Multi-step outreach planning',                 color: '#6B3B6B' },
  ],
  god: [
    { name: 'Iapetus',    initial: 'Ia', reason: 'Execute this as a workflow',                   color: '#123C69' },
    { name: 'Stilbon',    initial: 'St', reason: 'Send messages immediately',                    color: '#6F7D4F' },
  ],
  omega: [
    { name: 'Genesis',    initial: 'Ge', reason: 'Create the automation system',                 color: '#6B21A8' },
    { name: 'Overmind',   initial: 'Ov', reason: 'Scale & conquer this task',                    color: '#92400E' },
  ],
  action: [
    { name: 'Time Delay', initial: '⏱', reason: 'Pause before next action',                      color: '#4A4A5A' },
    { name: 'Update Lead',initial: 'UL', reason: 'Log the result in CRM',                        color: '#6F7D4F' },
  ],
  logic: [
    { name: 'Loop',       initial: '↻',  reason: 'Repeat this branch',                            color: '#4A4A5A' },
    { name: 'Send Email', initial: '✉',  reason: 'Send notification on condition',               color: '#6F7D4F' },
  ],
};

const toolsByCategory: Record<string, string[]> = {
  philosopher: ['Read Leads', 'Write Tasks', 'Web Search', 'CRM Access'],
  god: ['Read All', 'Write Any', 'Execute Workflows', 'Supabase Access'],
  omega: ['System Read', 'All Tools', 'Memory Access', 'Agent Spawn'],
  trigger: ['Event Listen', 'Webhook Receive'],
  action: ['API Call', 'CRM Write'],
  logic: ['Condition Eval', 'Timer'],
};

export default function ConfigPanel({ node, onClose, onUpdateNode }: ConfigPanelProps) {
  if (!node) return null;

  const { data } = node;
  const category = data.category || 'philosopher';
  const agentColor = data.agentColor || '#123C69';
  const agentName = data.agentName || data.label;
  const agentInitial = data.agentInitial || agentName.slice(0, 2);
  const roleMap: Record<string, string> = {
    trigger: 'Event Trigger',
    philosopher: 'Vision & Strategy',
    god: 'Domain Execution',
    omega: 'Ω-tier Capability',
    action: 'Integration Action',
    logic: 'Conditional Logic',
  };
  const tools = toolsByCategory[category] || ['CRM Read', 'API Call'];
  const nodeSuggestions = suggestions[category] || [];

  return (
    <div style={{
      width: 280,
      background: '#FCF8F0',
      borderLeft: '1px solid #DDD2BB',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '13px 16px 11px',
        borderBottom: '1px solid #E9E1CF',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Settings2 size={12} style={{ color: '#938C7A' }} />
          <span style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em',
            color: '#938C7A',
          }}>
            Configure Node
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 22, height: 22, borderRadius: '50%', border: 'none',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={12} style={{ color: '#938C7A' }} />
        </button>
      </div>

      {/* Agent Identity */}
      <div style={{
        padding: '18px 18px 14px',
        borderBottom: '1px solid #E9E1CF', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 58, height: 58, borderRadius: '50%',
            background: `linear-gradient(135deg,${agentColor},${agentColor}99)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            border: '2px solid rgba(201,162,77,0.4)',
            boxShadow: '0 0 18px rgba(201,162,77,0.12)',
            fontFamily: "'EB Garamond',Georgia,serif",
            fontSize: 22, color: 'white', fontWeight: 500,
            letterSpacing: '0.01em',
          }}>
            {agentInitial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'EB Garamond',Georgia,serif",
              fontSize: 20, color: '#171A21', lineHeight: 1.05,
              letterSpacing: '-0.01em',
            }}>
              {agentName}
            </div>
            <div style={{
              fontFamily: "'Hanken Grotesk',sans-serif",
              fontSize: 11, color: '#938C7A', marginTop: 2, marginBottom: 7,
            }}>
              {roleMap[category] || 'Node'}
            </div>
            <span style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em',
              padding: '2px 8px', borderRadius: 10,
              background: 'rgba(18,60,105,0.07)',
              color: '#123C69',
              border: '1px solid rgba(18,60,105,0.14)',
            }}>
              {category.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Config body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 17px' }}>
        {/* Instruction */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em',
            color: '#938C7A', marginBottom: 6,
          }}>
            Instruction
          </div>
          <textarea
            defaultValue={typeof data.config?.instruction === 'string' ? data.config.instruction : ''}
            onChange={(e) => onUpdateNode(node.id, { ...data, config: { ...data.config, instruction: e.target.value } })}
            placeholder="What should this node do?"
            style={{
              width: '100%', resize: 'none', height: 88,
              fontFamily: "'Hanken Grotesk',sans-serif",
              fontSize: 12, color: '#3D4047', lineHeight: 1.55,
              background: '#F6F0E3', border: '1px solid #DDD2BB',
              borderRadius: 8, padding: '9px 11px', outline: 'none',
            }}
          />
        </div>

        {/* Tools */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em',
            color: '#938C7A', marginBottom: 6,
          }}>
            Tools Access
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {tools.map(tool => (
              <span key={tool} style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em',
                padding: '3px 9px', borderRadius: 10,
                background: '#EFE8D8', color: '#3D4047',
                border: '1px solid #DDD2BB',
              }}>
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Gold divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg,transparent,rgba(201,162,77,0.5) 20%,rgba(201,162,77,0.5) 80%,transparent)',
          marginBottom: 13,
        }} />

        {/* Suggested Next */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
            <Sparkles size={12} style={{ color: '#C9A24D' }} />
            <span style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em',
              color: '#938C7A',
            }}>
              Suggested Next
            </span>
          </div>
          {nodeSuggestions.map(s => (
            <div
              key={s.name}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', background: '#F6F0E3',
                border: '1px solid #E9E1CF', borderRadius: 8,
                cursor: 'pointer', marginBottom: 5,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `linear-gradient(135deg,${s.color},${s.color}99)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                fontFamily: "'EB Garamond',Georgia,serif",
                fontSize: 11, color: 'white', fontWeight: 500,
              }}>
                {s.initial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Hanken Grotesk',sans-serif",
                  fontSize: 12, fontWeight: 500, color: '#171A21',
                }}>
                  {s.name}
                </div>
                <div style={{
                  fontFamily: "'Hanken Grotesk',sans-serif",
                  fontSize: 10, color: '#938C7A', marginTop: 1,
                }}>
                  {s.reason}
                </div>
              </div>
              <Plus size={12} style={{ color: '#938C7A', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div style={{
        padding: '11px 17px', borderTop: '1px solid #E9E1CF',
        flexShrink: 0, display: 'flex', gap: 7,
      }}>
        <button style={{
          flex: 1, padding: 8, borderRadius: 8,
          border: '1px solid #DDD2BB', background: 'transparent',
          fontFamily: "'Hanken Grotesk',sans-serif",
          fontSize: 12, color: '#3D4047', cursor: 'pointer',
        }}>
          Duplicate
        </button>
        <button style={{
          flex: 1, padding: 8, borderRadius: 8,
          border: 'none', background: '#8B2020',
          fontFamily: "'Hanken Grotesk',sans-serif",
          fontSize: 12, color: 'white', cursor: 'pointer',
        }}>
          Delete
        </button>
      </div>
    </div>
  );
}
