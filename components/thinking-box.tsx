'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Terminal } from 'lucide-react';

export interface ThinkingStep {
  tool: string;
  input: string;
  output?: string;
  duration?: number;
  timestamp: Date;
}

interface ThinkingBoxProps {
  steps: ThinkingStep[];
  isStreaming: boolean;
}

export function ThinkingBox({ steps, isStreaming }: ThinkingBoxProps) {
  const [expanded, setExpanded] = useState(false);

  if (steps.length === 0 && !isStreaming) return null;

  return (
    <div style={{
      borderTop: '0.5px solid var(--border)',
      background: 'var(--surface)',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, fontFamily: 'var(--font-mono)',
          color: 'var(--foreground-secondary)',
        }}
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <Terminal size={12} />
        {isStreaming ? 'Agent is thinking...' : `Reasoning (${steps.length} steps)`}
        {isStreaming && (
          <span style={{ display: 'inline-flex', gap: 2, marginLeft: 4 }}>
            <span style={{ animation: 'platoBounce 1.4s infinite', animationDelay: '0s' }}>.</span>
            <span style={{ animation: 'platoBounce 1.4s infinite', animationDelay: '0.2s' }}>.</span>
            <span style={{ animation: 'platoBounce 1.4s infinite', animationDelay: '0.4s' }}>.</span>
          </span>
        )}
      </button>

      {expanded && steps.length > 0 && (
        <div style={{ padding: '4px 16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              padding: '6px 10px',
              background: 'var(--surface-inset)',
              border: '0.5px solid var(--border)',
              fontSize: 12, fontFamily: 'var(--font-mono)',
              color: 'var(--foreground-secondary)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{step.tool}</span>
                {step.duration && <span style={{ color: 'var(--muted)' }}>{step.duration}ms</span>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {step.input.length > 120 ? step.input.slice(0, 120) + '...' : step.input}
              </div>
              {step.output && (
                <div style={{ fontSize: 11, color: 'var(--foreground-secondary)', marginTop: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  → {step.output.length > 120 ? step.output.slice(0, 120) + '...' : step.output}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes platoBounce {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
