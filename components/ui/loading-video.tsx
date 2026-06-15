'use client';
import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingVideoProps {
  videoSrc: string;
  message: string;
  visible: boolean;
  onFinished?: () => void;
}

export default function LoadingVideo({ videoSrc, message, visible, onFinished }: LoadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (visible && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15,23,34,0.85)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: 320, height: 240, borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        position: 'relative',
      }}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onEnded={() => onFinished?.()}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          padding: '40px 16px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Loader2 size={18} className="spin" />
            <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>{message}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
