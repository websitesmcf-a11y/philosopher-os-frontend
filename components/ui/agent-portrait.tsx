'use client';
import Image from 'next/image';
import { useState } from 'react';
import { getPortrait, PORTRAITS } from '@/lib/philosopher-assets';

interface Props {
  agentName: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

export default function AgentPortrait({ agentName, size = 40, className, priority = false }: Props) {
  const [error, setError] = useState(false);
  const src = getPortrait(agentName);

  // Fallback: show the first available portrait if the specific one fails
  const fallbackSrc = PORTRAITS.plato;

  if (!src || error) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'var(--accent-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.35,
          fontWeight: 600,
          color: 'var(--accent)',
          overflow: 'hidden',
        }}
      >
        {agentName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`${agentName} portrait`}
      width={size}
      height={size}
      priority={priority}
      className={className}
      onError={() => setError(true)}
      style={{ borderRadius: '50%', objectFit: 'cover' }}
    />
  );
}
