'use client';

import { useState } from 'react';
import { Sparkles, X, Loader, ArrowRight, Lightbulb, Wand2 } from 'lucide-react';
import { generateSmartSequence } from '@/lib/api-client';
import type { Node, Edge } from '@xyflow/react';

interface SmartSequenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlowGenerated: (nodes: Node[], edges: Edge[], suggestion: string) => void;
}

const SUGGESTIONS = [
  'Qualify new leads — score them with Pythagoras, then WhatsApp the hot ones',
  'Daily morning briefing — Astraeus gathers intel, Plato summarises, notify the team',
  'Welcome new leads — send a WhatsApp intro, create a task for follow-up, add to CRM',
  'Weekly cleanup — Erebos checks for duplicates, Archimedes fixes data, notify on issues',
  'Outreach campaign — Stilbon sends batch WhatsApp messages, Odysseus tracks replies',
];

export default function SmartSequenceModal({ isOpen, onClose, onFlowGenerated }: SmartSequenceModalProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');

    try {
      const result = await generateSmartSequence(prompt.trim());

      const nodes: Node[] = (result.nodes || []).map((n: any) => ({
        ...n,
        type: 'strategeion',
        data: {
          label: n.data?.label || n.label || 'NODE',
          category: n.data?.category || n.type || 'trigger',
          subtitle: n.data?.subtitle || 'Smart-generated node',
          agentColor: n.data?.agentColor || '#1A5088',
          agentName: n.data?.agentName || n.data?.label || 'Node',
          agentInitial: n.data?.agentInitial || 'ND',
          config: n.data?.config || {},
          status: 'idle',
        },
      }));
      const edges: Edge[] = (result.edges || []).map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      }));

      onFlowGenerated(nodes, edges, result.suggestion || '');
      onClose();
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Failed to generate flow. Try a different description.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15,23,34,0.6)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: 480, maxWidth: '90vw',
        background: '#FCF8F0', borderRadius: 14,
        border: '1px solid #DDD2BB',
        boxShadow: '0 24px 64px rgba(18,60,105,0.2)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid #E9E1CF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg,#123C69,#4C1D95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={16} style={{ color: '#C9A24D' }} />
            </div>
            <div>
              <div style={{
                fontFamily: "'EB Garamond',Georgia,serif",
                fontSize: 18, color: '#171A21', lineHeight: 1.15,
              }}>
                Smart Sequence
              </div>
              <div style={{
                fontFamily: "'Hanken Grotesk',sans-serif",
                fontSize: 11, color: '#938C7A',
              }}>
                Describe what you want — AI builds the flow
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: '50%', border: 'none',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={14} style={{ color: '#938C7A' }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px' }}>
          {/* Input */}
          <div style={{ marginBottom: 14 }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the automation you want to build..."
              rows={3}
              style={{
                width: '100%', resize: 'none',
                fontFamily: "'Hanken Grotesk',sans-serif",
                fontSize: 13, color: '#3D4047', lineHeight: 1.55,
                background: '#F6F0E3', border: '1px solid #DDD2BB',
                borderRadius: 10, padding: '11px 13px', outline: 'none',
              }}
            />
          </div>

          {/* Suggestions */}
          <div style={{ marginBottom: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7,
            }}>
              <Lightbulb size={11} style={{ color: '#C9A24D' }} />
              <span style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#938C7A',
              }}>
                Suggestions
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(s)}
                  style={{
                    textAlign: 'left', padding: '7px 10px',
                    borderRadius: 6, border: '1px solid #E9E1CF',
                    background: prompt === s ? 'rgba(201,162,77,0.08)' : 'transparent',
                    cursor: 'pointer', fontSize: 11,
                    fontFamily: "'Hanken Grotesk',sans-serif",
                    color: prompt === s ? '#171A21' : '#6B6657',
                    lineHeight: 1.4,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '8px 10px', borderRadius: 6,
              background: 'rgba(139,32,32,0.07)',
              border: '1px solid rgba(139,32,32,0.2)',
              fontSize: 11, color: '#8B2020', marginBottom: 12,
              fontFamily: "'Hanken Grotesk',sans-serif",
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #E9E1CF',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: 8,
            border: '1px solid #DDD2BB', background: 'transparent',
            fontFamily: "'Hanken Grotesk',sans-serif",
            fontSize: 12, color: '#3D4047', cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: loading
                ? 'linear-gradient(135deg,#a8843a,#C9A24D)'
                : 'linear-gradient(135deg,#C9A24D,#D4B36A)',
              fontFamily: "'Hanken Grotesk',sans-serif",
              fontSize: 12, fontWeight: 600, color: '#0F1722',
              cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !prompt.trim() ? 0.6 : 1,
            }}
          >
            {loading ? (
              <Loader size={13} style={{ animation: 'runSpin 0.8s linear infinite' }} />
            ) : (
              <Wand2 size={13} />
            )}
            {loading ? 'Generating...' : 'Generate Flow'}
          </button>
        </div>
      </div>
    </div>
  );
}
