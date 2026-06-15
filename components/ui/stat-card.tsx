'use client';

import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  trend?: { direction: 'up' | 'down'; value: string };
  subtitle?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  subtitle,
}: StatCardProps) {
  const bgGradient = color
    ? `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`
    : 'var(--accent-subtle)';
  const borderColor = color ? `${color}20` : 'var(--border)';
  const glowColor = color || 'var(--accent)';

  return (
    <div
      className="card"
      style={{
        padding: '20px 24px',
        display: 'flex', flexDirection: 'column',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        border: `1px solid ${borderColor}`,
        borderBottom: `2px solid ${color || 'var(--border)'}`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 8px 24px ${glowColor}15`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Subtle top-right decorative gradient */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: color ? `${color}08` : 'transparent',
          pointerEvents: 'none',
        }}
      />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 1,
      }}>
        <span className="stat-label" style={{ fontSize: 11, letterSpacing: '0.05em' }}>
          {label}
        </span>
        {Icon && (
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: bgGradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${borderColor}`,
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Icon size={17} color={color || 'var(--accent)'} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, position: 'relative', zIndex: 1 }}>
        <span
          className="stat-value"
          style={{
            color: color || 'var(--foreground)',
            fontSize: Icon ? 30 : 26,
            letterSpacing: '-0.03em',
          }}
        >
          {value}
        </span>
      </div>

      {(trend || subtitle) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative', zIndex: 1 }}>
          {trend && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 12, fontWeight: 600,
              color: trend.direction === 'up' ? 'var(--success)' : 'var(--error)',
            }}>
              {trend.direction === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {trend.value}
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: 12, color: 'var(--foreground-secondary)' }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
