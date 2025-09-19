import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { audioTracks } from '@/data/locations';
import { cn } from '@/lib/utils';

type AudioTrack = keyof typeof audioTracks;

interface MusicPlayerProps {
  currentTrack?: AudioTrack;
  autoPlay?: boolean;
  onTrackChange?: (track: AudioTrack) => void;
  className?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack = 'town',
  autoPlay = false,
  onTrackChange,
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout>();

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('tumski-music-settings', JSON.stringify({
      volume,
      isMuted,
      isPlaying,
    }));
  };

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tumski-music-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setVolume(settings.volume || 0.7);
        setIsMuted(settings.isMuted || false);
        if (autoPlay && settings.isPlaying) {
          setIsPlaying(true);
        }
      } catch (e) {
        console.warn('Failed to load music settings:', e);
      }
    }
  }, [autoPlay]);

  // Update audio element when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const audio = audioRef.current;
      const trackUrl = audioTracks[currentTrack];
      
      if (audio.src !== trackUrl) {
        setIsLoading(true);
        audio.src = trackUrl;
        audio.load();
        
        // Fade in new track
        if (isPlaying) {
          audio.volume = 0;
          audio.play().then(() => {
            fadeIn();
          }).catch(console.warn);
        }
      }
    }
  }, [currentTrack, isPlaying]);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      // Loop the current track
      audio.currentTime = 0;
      audio.play().catch(console.warn);
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    saveSettings();
  }, [volume, isMuted]);

  // Fade in effect
  const fadeIn = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const targetVolume = isMuted ? 0 : volume;
    const fadeSteps = 20;
    const fadeInterval = 50; // ms
    let currentStep = 0;

    const fadeTimer = setInterval(() => {
      if (currentStep >= fadeSteps) {
        clearInterval(fadeTimer);
        audio.volume = targetVolume;
        return;
      }

      audio.volume = (targetVolume * currentStep) / fadeSteps;
      currentStep++;
    }, fadeInterval);
  };

  // Fade out effect
  const fadeOut = (callback?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;

    const startVolume = audio.volume;
    const fadeSteps = 15;
    const fadeInterval = 30; // ms
    let currentStep = 0;

    const fadeTimer = setInterval(() => {
      if (currentStep >= fadeSteps) {
        clearInterval(fadeTimer);
        audio.volume = 0;
        callback?.();
        return;
      }

      audio.volume = startVolume * (1 - currentStep / fadeSteps);
      currentStep++;
    }, fadeInterval);
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        fadeOut(() => {
          audio.pause();
          setIsPlaying(false);
        });
      } else {
        audio.volume = 0;
        await audio.play();
        setIsPlaying(true);
        fadeIn();
      }
      saveSettings();
    } catch (error) {
      console.warn('Audio play failed:', error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTrackName = (track: AudioTrack): string => {
    const names: Record<AudioTrack, string> = {
      town: 'Городская атмосфера',
      kostel: 'Церковные песнопения',
      birds: 'Звуки природы',
      hang: 'Мистическая мелодия',
      quest: 'Музыка приключений',
    };
    return names[track] || track;
  };

  return (
    <div className={cn('relative group', className)}>
      <audio
        ref={audioRef}
        loop
        preload="auto"
      />

      {/* Compact Player */}
      <div 
        className={cn(
          'floating-panel p-3 transition-all duration-300 cursor-pointer',
          isExpanded && 'rounded-b-none'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            disabled={isLoading}
            className="w-8 h-8 rounded-full hover:bg-primary/20"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground truncate">
              {getTrackName(currentTrack)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="w-8 h-8 rounded-full hover:bg-primary/20"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mt-2">
          <div className="w-full bg-muted/30 rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-100"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 floating-panel rounded-t-none border-t-0 p-4 animate-scale-in">
          <div className="space-y-4">
            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <VolumeX className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Track Info */}
            <div className="text-center">
              <div className="text-sm font-medium text-foreground">
                {getTrackName(currentTrack)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Фоновая музыка для атмосферы
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};