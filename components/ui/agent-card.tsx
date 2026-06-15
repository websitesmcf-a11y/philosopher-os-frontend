'use client';

import Image from 'next/image';
import { type LucideIcon, ArrowRight, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PORTRAITS } from '@/lib/philosopher-assets';

interface AgentCardProps {
  name: string;
  role: string;
  icon: LucideIcon;
  gradient: string;
  color: string;
  description?: string;
  capabilities?: string[];
  status?: 'idle' | 'active' | 'running';
  onChat?: () => void;
  onView?: () => void;
  variant?: 'philosopher' | 'god';
}

export function AgentCard({
  name,
  role,
  icon: Icon,
  gradient,
  color,
  description,
  capabilities,
  status = 'idle',
  onChat,
  onView,
  variant = 'philosopher',
}: AgentCardProps) {
  const router = useRouter();

  // Default onView navigates to the agent detail page
  const handleView = onView ?? (() => router.push(`/agents/${name.toLowerCase()}`));

  const statusIndicator = {
    idle: { bg: 'rgba(107,114,128,0.2)', dot: '#6B7280' },
    active: { bg: 'rgba(22,101,52,0.2)', dot: '#16A34A' },
    running: { bg: 'rgba(22,101,52,0.15)', dot: '#16A34A' },
  };

  const s = statusIndicator[status];

  return (
    <div className="card card-interactive" style={{
      padding: 40,
      display: 'flex', flexDirection: 'column', gap: 24,
      minHeight: '35vh',
      transition: 'all 0.2s var(--ease-out)',
    }}>
      {/* Header — LARGE portrait + name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28 }}>
        <div style={{
          width: 120, height: 120, borderRadius: 16,
          background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden',
          boxShadow: `0 6px 30px ${color}35`,
        }}>
          {PORTRAITS[name.toLowerCase()] ? (
            <Image
              src={PORTRAITS[name.toLowerCase()]}
              alt={name}
              width={120}
              height={120}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          ) : (
            <Icon size={52} color="#FFFFFF" strokeWidth={1.5} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h3 style={{
              fontSize: 28, fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              color: 'var(--foreground)',
            }}>
              {name}
            </h3>
            <span style={{
              width: 12, height: 12, borderRadius: '50%',
              background: s.dot,
              boxShadow: status === 'running' ? `0 0 10px ${s.dot}` : undefined,
              animation: status === 'running' ? 'glowPulse 2s infinite' : undefined,
            }} />
          </div>
          <p style={{
            fontSize: 18, color: 'var(--foreground-secondary)',
            marginTop: 6, lineHeight: 1.5,
          }}>
            {role}
          </p>
        </div>
        <span style={{
          fontSize: 14, fontWeight: 700,
          fontFamily: 'var(--font-label)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color,
          background: `${color}18`,
          padding: '6px 18px',
          borderRadius: 8,
          whiteSpace: 'nowrap',
        }}>
          {variant === 'god' ? 'TITAN' : 'PHIL'}
        </span>
      </div>

      {/* Description — larger text */}
      {description && (
        <p style={{
          fontSize: 17, color: 'var(--foreground-secondary)',
          lineHeight: 1.8,
        }}>
          {description}
        </p>
      )}

      {/* Capabilities — larger pills */}
      {capabilities && capabilities.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {capabilities.slice(0, 8).map((cap, i) => (
            <span key={i} style={{
              fontSize: 14, fontWeight: 500, color: 'var(--foreground-secondary)',
              background: 'var(--surface-inset)',
              padding: '6px 16px', borderRadius: 8,
            }}>
              {cap}
            </span>
          ))}
        </div>
      )}

      {/* Actions — LARGE buttons */}
      <div style={{
        display: 'flex', gap: 16,
        marginTop: 'auto',
        paddingTop: 20,
        borderTop: '1px solid var(--border-light)',
      }}>
        {onChat && (
          <button onClick={onChat} className="btn" style={{
            flex: 1, justifyContent: 'center', gap: 10,
            padding: '16px 24px', fontSize: 17, fontWeight: 600,
          }}>
            <MessageCircle size={22} /> Chat
          </button>
        )}
        <button onClick={handleView} className="btn btn-primary" style={{
          flex: 1, justifyContent: 'center', gap: 10,
          padding: '16px 24px', fontSize: 17, fontWeight: 600,
        }}>
          View <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
}
