'use client';
import Image from 'next/image';
import { getPageBackground, TEXTURES } from '@/lib/philosopher-assets';

interface Props {
  pageKey: string;
  children: React.ReactNode;
  className?: string;
}

export default function PageBackground({ pageKey, children, className }: Props) {
  const bgSrc = getPageBackground(pageKey);

  return (
    <div className={className} style={{ position: 'relative', minHeight: '100%' }}>
      {/* Subtle page background — very low opacity so content stays readable */}
      {bgSrc && (
        <Image
          src={bgSrc}
          alt=""
          fill
          priority={false}
          style={{
            objectFit: 'cover',
            opacity: 0.15,
            zIndex: 0,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      )}
      {/* Texture overlay for depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${TEXTURES['ivory-marble']})`,
          backgroundSize: 'cover',
          opacity: 0.06,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
