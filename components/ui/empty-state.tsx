'use client';
import React from 'react';
import Image from 'next/image';
import { getEmptyState } from '@/lib/philosopher-assets';
import type { LucideIcon } from 'lucide-react';

interface ActionConfig {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
}

interface Props {
  pageKey?: string;
  title: string;
  description?: string;
  action?: React.ReactNode | ActionConfig;
  className?: string;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({ pageKey, title, description, action, className, icon: Icon }: Props) {
  const imgSrc = getEmptyState(pageKey);

  const renderAction = () => {
    if (!action) return null;
    if (React.isValidElement(action)) return action;
    const cfg = action as ActionConfig;
    if (cfg.label && cfg.onClick) {
      const ActionIcon = cfg.icon;
      return (
        <button className="btn btn-primary" onClick={cfg.onClick}>
          {ActionIcon && <ActionIcon size={16} />}
          {cfg.label}
        </button>
      );
    }
    return null;
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
        gap: 16,
      }}
    >
      {imgSrc && (
        <Image
          src={imgSrc}
          alt=""
          width={240}
          height={180}
          style={{
            objectFit: 'contain',
            opacity: 0.5,
            borderRadius: 8,
          }}
          priority={false}
        />
      )}
      {Icon && <Icon size={48} style={{ opacity: 0.3, color: 'var(--muted)' }} />}
      <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: 'var(--foreground)' }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', maxWidth: 400, margin: 0 }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 8 }}>{renderAction()}</div>}
    </div>
  );
}
