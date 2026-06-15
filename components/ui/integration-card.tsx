'use client';

import { type LucideIcon, CheckCircle2, AlertCircle, Unplug, ArrowRight, ExternalLink } from 'lucide-react';

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  status: 'connected' | 'disconnected' | 'error' | 'setup_required';
  provider: string;
  lastSync?: string;
  onConnect?: () => void;
  onConfigure?: () => void;
  onDisconnect?: () => void;
  features?: string[];
}

const STATUS_CONFIG = {
  connected: {
    label: 'Connected',
    icon: CheckCircle2,
    color: '#16A34A',
    bg: '#F0FDF4',
    border: 'rgba(22,101,52,0.2)',
  },
  disconnected: {
    label: 'Not Connected',
    icon: Unplug,
    color: '#6B7280',
    bg: 'var(--surface-inset)',
    border: 'var(--border)',
  },
  error: {
    label: 'Error',
    icon: AlertCircle,
    color: '#991B1B',
    bg: '#FEF2F2',
    border: 'rgba(153,27,27,0.2)',
  },
  setup_required: {
    label: 'Setup Required',
    icon: AlertCircle,
    color: '#92400E',
    bg: '#FFFBEB',
    border: 'rgba(146,64,14,0.2)',
  },
};

export function IntegrationCard({
  name,
  description,
  icon: Icon,
  status,
  provider,
  lastSync,
  onConnect,
  onConfigure,
  onDisconnect,
  features,
}: IntegrationCardProps) {
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  return (
    <div className="card" style={{
      padding: 24,
      display: 'flex', flexDirection: 'column', gap: 14,
      opacity: status === 'disconnected' ? 0.85 : 1,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: config.bg,
          border: `1px solid ${config.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={22} color={config.color} strokeWidth={1.5} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h4 style={{
              fontSize: 15, fontWeight: 600,
              color: 'var(--foreground)',
            }}>
              {name}
            </h4>
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            {provider}
          </span>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 10px',
          fontSize: 11, fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase',
          background: config.bg,
          color: config.color,
          border: `1px solid ${config.border}`,
          borderRadius: 4,
          whiteSpace: 'nowrap',
        }}>
          <StatusIcon size={12} />
          {config.label}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', lineHeight: 1.5 }}>
        {description}
      </p>

      {/* Features */}
      {features && features.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {features.map((f, i) => (
            <span key={i} style={{
              fontSize: 11, color: 'var(--foreground-secondary)',
              background: 'var(--surface-inset)', padding: '2px 8px', borderRadius: 4,
            }}>
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Last sync */}
      {lastSync && (
        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          Last synced: {lastSync}
        </div>
      )}

      {/* Action */}
      {status === 'disconnected' && onConnect && (
        <button onClick={onConnect} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
          Connect <ExternalLink size={14} />
        </button>
      )}
      {status === 'setup_required' && onConfigure && (
        <button onClick={onConfigure} className="btn btn-sm" style={{ alignSelf: 'flex-start' }}>
          Setup Instructions <ArrowRight size={14} />
        </button>
      )}
      {status === 'connected' && onDisconnect && (
        <button onClick={onDisconnect} className="btn btn-sm btn-danger" style={{ alignSelf: 'flex-start' }}>
          Disconnect
        </button>
      )}
      {status === 'error' && onConfigure && (
        <button onClick={onConfigure} className="btn btn-sm" style={{ alignSelf: 'flex-start' }}>
          Reconfigure <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
