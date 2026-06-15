'use client';
import Image from 'next/image';
import { LOADING_VIDEOS, LOADING_IMAGES } from '@/lib/philosopher-assets';
import VideoWithFallback from '@/components/ui/video-with-fallback';

interface Props {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'statue-glow' | 'rings-bust' | 'scan-line' | 'gold-route' | 'cosmic-signal';
}

const SIZES = { sm: 80, md: 140, lg: 220 };

export default function LoadingState({ message, size = 'md', variant = 'statue-glow' }: Props) {
  const dim = SIZES[size];
  const videoSrc = LOADING_VIDEOS[variant];
  const fallbackImg = LOADING_IMAGES[variant] || LOADING_IMAGES['scan-line'];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 40,
      }}
    >
      <div
        style={{
          width: dim,
          height: dim,
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {videoSrc ? (
          <VideoWithFallback
            videoSrc={videoSrc}
            fallbackSrc={fallbackImg}
            style={{ width: dim, height: dim }}
          />
        ) : (
          <Image
            src={fallbackImg}
            alt="Loading..."
            fill
            style={{ objectFit: 'cover' }}
          />
        )}
      </div>
      {message && (
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', margin: 0 }}>
          {message}
        </p>
      )}
    </div>
  );
}
