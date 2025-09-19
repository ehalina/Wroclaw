import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface MusicPlayerProps {
  autoPlay?: boolean;
  className?: string;
  mousePosition?: { x: number; y: number };
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  autoPlay = true,
  className,
  mousePosition = { x: 0, y: 0 },
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout>();

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tumski-music-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setVolume(settings.volume || 0.7);
        setIsMuted(settings.isMuted || false);
      } catch (e) {
        console.warn('Failed to load settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('tumski-music-settings', JSON.stringify({ volume, isMuted }));
  }, [volume, isMuted]);

  // Initialize and start music
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.src = '/audio/town.mp3';
      audio.volume = isMuted ? 0 : volume;
      audio.load();

      if (autoPlay) {
        audio.play().catch(() => {
          // Autoplay blocked, will start on user interaction
        });
      }
    }
  }, []);


  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);


  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (vol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  // Calculate parallax transform
  const parallaxTransform = `translate3d(${mousePosition.x * 2}px, ${mousePosition.y * 2}px, 0)`;

  return (
    <div
      className={cn('relative', className)}
      style={{
        transform: parallaxTransform,
        transition: 'transform 0.1s ease-out'
      }}
    >
      <audio
        ref={audioRef}
        loop
        preload="auto"
      />

      {/* Simplified Player */}
      <div className="floating-panel p-4 min-w-[240px]">
        <div className="flex items-center gap-3 mb-3">
          {/* Track Name */}
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">
              Городская атмосфера
            </div>
          </div>

          {/* Mute Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="w-8 h-8 rounded-full hover:bg-primary/20"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <VolumeX className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.05}
            className="flex-1"
          />
          <Volume2 className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};