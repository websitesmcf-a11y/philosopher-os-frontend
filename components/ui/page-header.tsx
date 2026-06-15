'use client';

import { type LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 32 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginBottom: 8, fontSize: 13,
        }}>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <span style={{ color: 'var(--muted)' }}>/</span>}
              {crumb.href ? (
                <a href={crumb.href} style={{
                  color: 'var(--foreground-secondary)',
                  textDecoration: 'none',
                }}>
                  {crumb.label}
                </a>
              ) : (
                <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {Icon && (
            <div style={{
              width: 40, height: 40, borderRadius: 8,
              background: iconColor ? `${iconColor}15` : 'var(--accent-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={22} color={iconColor || 'var(--accent)'} strokeWidth={1.5} />
            </div>
          )}
          <div>
            <h1 style={{
              fontSize: 24, fontWeight: 500,
              fontFamily: 'var(--font-heading)',
              color: 'var(--foreground)',
              lineHeight: 1.3,
            }}>
              {title}
            </h1>
            {description && (
              <p style={{
                fontSize: 14, color: 'var(--foreground-secondary)',
                marginTop: 2,
              }}>
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
