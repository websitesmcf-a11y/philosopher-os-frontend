'use client';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface Props {
  videoSrc: string;
  fallbackSrc?: string;
  posterSrc?: string;
  className?: string;
  style?: React.CSSProperties;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export default function VideoWithFallback({
  videoSrc,
  fallbackSrc,
  posterSrc,
  className,
  style,
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    setShowVideo(true);
  }, []);

  if (videoError || !showVideo) {
    return fallbackSrc ? (
      <Image
        src={fallbackSrc}
        alt=""
        fill
        style={{ objectFit: 'cover', ...style }}
        className={className}
      />
    ) : null;
  }

  return (
    <video
      ref={videoRef}
      className={className}
      style={{ objectFit: 'cover', ...style }}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      controls={controls}
      playsInline
      poster={posterSrc}
      onError={() => setVideoError(true)}
    >
      <source src={videoSrc} type="video/mp4" />
    </video>
  );
}
