'use client';

import { useEffect, useRef, useState } from 'react';
import type { VideoInfo } from '@/lib/types';
import { Volume2, VolumeX } from 'lucide-react';

export function BackgroundAudio({ info }: { info: VideoInfo | null }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!info || !info.formats) {
      setAudioUrl(null);
      setIsPlaying(false);
      return;
    }

    // Find the best audio format that has a direct URL
    const audioFormats = info.formats.filter(f => f.directUrl && (f.type === 'audio' || f.acodec !== 'none'));
    if (audioFormats.length === 0) {
      setAudioUrl(null);
      setIsPlaying(false);
      return;
    }

    // Sort by quality to get a decent audio stream
    audioFormats.sort((a, b) => b.quality - a.quality);
    setAudioUrl(audioFormats[0].directUrl!);
  }, [info]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    audio.volume = 0;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setIsPlaying(true);
        // Fade in
        let vol = 0;
        const fadeInterval = setInterval(() => {
          if (vol < 0.3) {
            vol += 0.02;
            audio.volume = Math.min(vol, 0.3);
          } else {
            clearInterval(fadeInterval);
          }
        }, 200);
      }).catch(err => {
        console.warn("Autoplay prevented:", err);
        setIsPlaying(false);
      });
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audioUrl]);

  if (!audioUrl) return null;

  return (
    <>
      <audio ref={audioRef} src={audioUrl} loop autoPlay />
      
      {/* Small subtle indicator that audio is playing in the background */}
      <button 
        onClick={() => {
          if (audioRef.current) {
            if (!isPlaying) {
              audioRef.current.volume = 0.3;
              audioRef.current.muted = false;
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            } else {
              audioRef.current.muted = !audioRef.current.muted;
              // If muted, we pretend it's not playing for the icon, or we can use a different state.
              // For simplicity, just toggle muted.
            }
          }
        }}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium text-white/50 hover:text-white transition-colors"
      >
        {isPlaying ? (
           audioRef.current?.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-neon-cyan animate-pulse" />
        ) : (
           <>
             <VolumeX className="w-3 h-3" /> 
             Play Audio
           </>
        )}
        {isPlaying && "Background Audio"}
      </button>
    </>
  );
}
