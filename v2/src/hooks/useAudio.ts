import { useState, useEffect, useRef, useCallback } from 'react';
import { audioTracks } from '@/data/locations';

type AudioTrack = keyof typeof audioTracks;

interface UseAudioOptions {
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
  fadeDuration?: number;
}

interface UseAudioReturn {
  isPlaying: boolean;
  currentTrack: AudioTrack | null;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  play: (track?: AudioTrack) => Promise<void>;
  pause: () => void;
  stop: () => void;
  changeTrack: (track: AudioTrack) => Promise<void>;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seek: (time: number) => void;
}

export const useAudio = (options: UseAudioOptions = {}): UseAudioReturn => {
  const {
    autoPlay = false,
    loop = true,
    volume: initialVolume = 0.7,
    fadeDuration = 1000
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [volume, setVolumeState] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement>();
  const fadeIntervalRef = useRef<NodeJS.Timeout>();
  const animationFrameRef = useRef<number>();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('tumski-audio-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.volume !== undefined) setVolumeState(settings.volume);
        if (settings.isMuted !== undefined) setIsMuted(settings.isMuted);
      } catch (error) {
        console.warn('Failed to parse saved audio settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback(() => {
    const settings = { volume, isMuted };
    localStorage.setItem('tumski-audio-settings', JSON.stringify(settings));
  }, [volume, isMuted]);

  useEffect(() => {
    saveSettings();
  }, [volume, isMuted, saveSettings]);

  // Update audio time
  const updateTime = useCallback(() => {
    if (audioRef.current && isPlaying) {
      setCurrentTime(audioRef.current.currentTime);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  }, [isPlaying]);

  // Audio event handlers
  const handleLoadStart = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };
  const handleError = () => {
    setIsLoading(false);
    setIsPlaying(false);
    console.error('Audio failed to load');
  };

  // Fade audio volume
  const fadeAudio = useCallback((targetVolume: number, duration: number = fadeDuration): Promise<void> => {
    return new Promise((resolve) => {
      if (!audioRef.current) {
        resolve();
        return;
      }

      const startVolume = audioRef.current.volume;
      const volumeDiff = targetVolume - startVolume;
      const steps = duration / 50; // 50ms intervals
      const volumeStep = volumeDiff / steps;
      let currentStep = 0;

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        const newVolume = startVolume + (volumeStep * currentStep);

        if (audioRef.current) {
          audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
        }

        if (currentStep >= steps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
          }
          if (audioRef.current) {
            audioRef.current.volume = targetVolume;
          }
          resolve();
        }
      }, 50);
    });
  }, [fadeDuration]);

  // Create and setup audio element
  const createAudioElement = useCallback((track: AudioTrack) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.remove();
    }

    const audio = new Audio(audioTracks[track]);
    audio.loop = loop;
    audio.volume = isMuted ? 0 : volume;
    audio.preload = 'auto';

    // Add event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    audioRef.current = audio;
    return audio;
  }, [loop, volume, isMuted]);

  // Play audio
  const play = useCallback(async (track?: AudioTrack) => {
    const trackToPlay = track || currentTrack;
    if (!trackToPlay) return;

    try {
      let audio = audioRef.current;

      // Create new audio element if track changed or doesn't exist
      if (!audio || currentTrack !== trackToPlay) {
        audio = createAudioElement(trackToPlay);
        setCurrentTrack(trackToPlay);
      }

      // Fade in and play
      audio.volume = 0;
      await audio.play();
      setIsPlaying(true);

      if (!isMuted) {
        await fadeAudio(volume);
      }

      // Start time updates
      animationFrameRef.current = requestAnimationFrame(updateTime);
    } catch (error) {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
    }
  }, [currentTrack, createAudioElement, fadeAudio, isMuted, volume, updateTime]);

  // Pause audio
  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isPlaying]);

  // Stop audio
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, []);

  // Change track with crossfade
  const changeTrack = useCallback(async (track: AudioTrack) => {
    if (currentTrack === track) return;

    if (audioRef.current && isPlaying) {
      // Fade out current track
      await fadeAudio(0);
      stop();
    }

    // Play new track
    await play(track);
  }, [currentTrack, isPlaying, fadeAudio, stop, play]);

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);

    if (audioRef.current && !isMuted) {
      audioRef.current.volume = clampedVolume;
    }
  }, [isMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (audioRef.current) {
      audioRef.current.volume = newMutedState ? 0 : volume;
    }
  }, [isMuted, volume]);

  // Seek to specific time
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, time));
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Auto-play on mount if specified
  useEffect(() => {
    if (autoPlay && currentTrack) {
      play(currentTrack);
    }
  }, [autoPlay]); // Only run on mount

  return {
    isPlaying,
    currentTrack,
    volume,
    isMuted,
    isLoading,
    duration,
    currentTime,
    play,
    pause,
    stop,
    changeTrack,
    setVolume,
    toggleMute,
    seek,
  };
};