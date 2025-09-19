import React, { useState, useEffect } from 'react';
import { Map, Globe, Music, Menu, Trophy, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingPanelProps {
  onMapToggle: () => void;
  onLanguageChange: () => void;
  onMusicToggle: () => void;
  onMenuToggle: () => void;
  onQuestToggle: () => void;
  isMusicPlaying: boolean;
  className?: string;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  onMapToggle,
  onLanguageChange,
  onMusicToggle,
  onMenuToggle,
  onQuestToggle,
  isMusicPlaying,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Auto-hide functionality
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
      setIsVisible(true);
    };

    const checkActivity = () => {
      if (Date.now() - lastActivity > 4000) { // 4 seconds
        setIsVisible(false);
      }
    };

    // Add event listeners for user activity
    const events = ['mousemove', 'touchstart', 'keydown', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Check activity every second
    const interval = setInterval(checkActivity, 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearInterval(interval);
    };
  }, [lastActivity]);

  const buttons = [
    {
      id: 'language',
      icon: Globe,
      label: 'Язык',
      onClick: onLanguageChange,
      position: 'left',
    },
    {
      id: 'music',
      icon: isMusicPlaying ? Volume2 : VolumeX,
      label: isMusicPlaying ? 'Выкл. звук' : 'Вкл. звук',
      onClick: onMusicToggle,
      position: 'left',
      isActive: isMusicPlaying,
    },
    {
      id: 'map',
      icon: Map,
      label: 'Карта',
      onClick: onMapToggle,
      position: 'center',
      isPrimary: true,
    },
    {
      id: 'quest',
      icon: Trophy,
      label: 'Квесты',
      onClick: onQuestToggle,
      position: 'right',
    },
    {
      id: 'menu',
      icon: Menu,
      label: 'Меню',
      onClick: onMenuToggle,
      position: 'right',
    },
  ];

  return (
    <div
      className={cn(
        'fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-500 ease-out',
        'pb-safe-area-inset-bottom px-4',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
        className
      )}
      style={{
        paddingBottom: `max(1rem, env(safe-area-inset-bottom))`,
      }}
    >
      <div className="floating-panel px-6 py-3 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-3">
          {buttons.map((button) => {
            const Icon = button.icon;
            
            if (button.isPrimary) {
              // Main FAB-style button
              return (
                <Button
                  key={button.id}
                  onClick={button.onClick}
                  className={cn(
                    'relative w-12 h-12 rounded-full bg-primary hover:bg-primary-glow',
                    'shadow-golden hover:shadow-glow transition-all duration-300',
                    'transform hover:scale-105 active:scale-95'
                  )}
                  aria-label={button.label}
                >
                  <Icon className="w-6 h-6 text-background" />
                  
                  {/* Subtle pulse effect */}
                  <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></div>
                </Button>
              );
            }

            // Regular buttons
            return (
              <Button
                key={button.id}
                onClick={button.onClick}
                variant="ghost"
                size="icon"
                className={cn(
                  'w-10 h-10 rounded-full transition-all duration-300',
                  'hover:bg-primary/20 hover:scale-105 active:scale-95',
                  button.isActive && 'bg-primary/20 text-primary'
                )}
                aria-label={button.label}
              >
                <Icon className="w-5 h-5" />
              </Button>
            );
          })}
        </div>

        {/* Hover labels */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="glass rounded-lg px-3 py-1">
            <p className="text-xs text-foreground whitespace-nowrap">
              Панель управления
            </p>
          </div>
        </div>
      </div>

      {/* Activity indicator */}
      <div
        className={cn(
          'absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary/30 rounded-full',
          'transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
};