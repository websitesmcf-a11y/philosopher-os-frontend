'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { StrategeionNodeData, NodeCategory } from './types';

const getIcon = (category: NodeCategory) => {
  const iconMap: Record<string, string> = {
    trigger: 'TRIG', philosopher: 'PHL', god: 'GOD', omega: 'OMG', action: 'ACT', logic: 'LGC',
  };
  return iconMap[category] || 'NOD';
};

const categoryConfig: Record<string, { label: string; band: string; header: string }> = {
  trigger:     { label: 'TRIGGER', band: '#1A5088', header: 'linear-gradient(135deg,#111928,#1e3048)' },
  philosopher: { label: 'AGENT',   band: '#123C69', header: '#123C69' },
  god:         { label: 'AGENT',   band: '#7B5EA7', header: 'linear-gradient(135deg,#3a2f52,#7B5EA7)' },
  omega:       { label: 'OMEGA',   band: '#6B21A8', header: 'linear-gradient(135deg,#1a0030,#4C1D95)' },
  action:      { label: 'ACTION',  band: '#6F7D4F', header: 'linear-gradient(135deg,#506038,#6F7D4F)' },
  logic:       { label: 'LOGIC',   band: '#4A4A5A', header: 'linear-gradient(135deg,#2e2e3a,#4A4A5A)' },
};

function StrategeionBaseNode(props: NodeProps) {
  const data = props.data as StrategeionNodeData;
  const { selected } = props;

  const cfg = categoryConfig[data.category] || categoryConfig.trigger;
  const isOmega = data.category === 'omega';
  const isTrigger = data.category === 'trigger';
  const isPhilosopher = data.category === 'philosopher' || data.category === 'god';

  const label = data.label || 'NODE';
  const subtitle = data.subtitle || 'Configure this node';
  const agentColor = data.agentColor || '#123C69';
  const agentName = data.agentName || label;
  const agentInitial = data.agentInitial || label.slice(0, 2);

  return (
    <div
      style={{
        width: 220,
        border: selected
          ? '2px solid #C9A24D'
          : isOmega
            ? '1px solid rgba(192,132,252,0.35)'
            : '1px solid #DDD2BB',
        borderRadius: 10,
        boxShadow: selected
          ? '0 0 0 4px rgba(201,162,77,0.12),0 8px 28px rgba(18,60,105,0.18)'
          : isOmega
            ? '0 0 24px rgba(107,33,168,0.35)'
            : '0 2px 14px rgba(18,60,105,0.09)',
        background: 'transparent',
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      <div style={{
        borderRadius: selected ? 8 : 9,
        overflow: 'hidden',
        background: isOmega ? '#0D0020' : '#FDFAF4',
      }}>
        {/* Color band */}
        <div style={{ height: 4, background: cfg.band }} />

        {/* Header */}
        <div style={{
          background: cfg.header,
          padding: '7px 10px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}>
          <span style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 9, fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            width: 16, textAlign: 'center',
          }}>
            {getIcon(data.category)}
          </span>
          <span style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.4)',
            flexShrink: 0,
          }}>
            {cfg.label}
          </span>
          <span style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.95)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
          }}>
            {label}
          </span>
          {data.status === 'running' && (
            <div style={{
              width: 13, height: 13,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.15)',
              borderTopColor: '#C9A24D',
              flexShrink: 0,
              animation: 'runSpin 0.8s linear infinite',
            }} />
          )}
          {data.status === 'completed' && (
            <div style={{
              width: 14, height: 14,
              borderRadius: '50%',
              background: '#4A7A3E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '9px 12px 12px' }}>
          <div style={{
            fontFamily: "'Hanken Grotesk',sans-serif",
            fontSize: 11,
            color: isOmega ? '#9a7fb8' : '#938C7A',
            lineHeight: 1.4,
          }}>
            {subtitle}
          </div>
          {isPhilosopher && agentName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: agentColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                border: '1.5px solid rgba(201,162,77,0.4)',
                fontFamily: "'EB Garamond',Georgia,serif",
                fontSize: 11, color: 'white', fontWeight: 500,
              }}>
                {agentInitial}
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em',
                padding: '2px 7px', borderRadius: 10,
                background: 'rgba(18,60,105,0.07)',
                color: '#123C69',
                border: '1px solid rgba(18,60,105,0.15)',
              }}>
                {data.category === 'god' ? 'GOD' : 'PHIL'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Output port */}
      <div style={{
        position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
        width: 12, height: 12, borderRadius: '50%',
        background: isOmega ? '#C084FC' : '#C9A24D',
        border: `2px solid ${isOmega ? '#0D0020' : '#FDFAF4'}`,
        zIndex: 25,
        boxShadow: isOmega ? '0 0 8px rgba(192,132,252,0.8)' : '0 0 6px rgba(201,162,77,0.7)',
        cursor: 'crosshair',
      }}>
        <Handle type="source" position={Position.Right} style={{ opacity: 0, width: 12, height: 12, left: -4, top: -4 }} />
      </div>

      {/* Input port */}
      {!isTrigger && (
        <div style={{
          position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)',
          width: 12, height: 12, borderRadius: '50%',
          background: isOmega ? '#C084FC' : '#C9A24D',
          border: `2px solid ${isOmega ? '#0D0020' : '#FDFAF4'}`,
          zIndex: 25,
          boxShadow: isOmega ? '0 0 8px rgba(192,132,252,0.8)' : '0 0 6px rgba(201,162,77,0.7)',
          cursor: 'crosshair',
        }}>
          <Handle type="target" position={Position.Left} style={{ opacity: 0, width: 12, height: 12, left: -4, top: -4 }} />
        </div>
      )}
    </div>
  );
}

export const StrategeionNode = memo(StrategeionBaseNode);

export const nodeTypes = {
  strategeion: StrategeionNode,
};
