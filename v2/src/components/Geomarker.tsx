import React, { useState } from 'react';
import { MapPin, Church, Trees, Home, Crown } from 'lucide-react';
import { Location, getLocationContent } from '@/data/locations';
import { cn } from '@/lib/utils';

interface GeomarkerProps {
  location: Location;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Geomarker: React.FC<GeomarkerProps> = ({
  location,
  isActive = false,
  onClick,
  className,
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    switch (location.type) {
      case 'cathedral':
        return Church;
      case 'ogrod':
        return Trees;
      case 'dwor':
        return Home;
      case 'main':
        return location.hasQuest ? Crown : MapPin;
      default:
        return MapPin;
    }
  };

  const getColor = () => {
    switch (location.type) {
      case 'cathedral':
        return 'text-accent-red';
      case 'ogrod':
        return 'text-accent-green';
      case 'dwor':
        return 'text-muted-foreground';
      case 'main':
        return location.hasQuest ? 'text-primary-glow' : 'text-primary';
      default:
        return 'text-primary';
    }
  };

  const getBgColor = () => {
    if (isActive) return 'bg-primary shadow-glow';
    
    switch (location.type) {
      case 'cathedral':
        return 'bg-accent-red/20 hover:bg-accent-red/30';
      case 'ogrod':
        return 'bg-accent-green/20 hover:bg-accent-green/30';
      case 'dwor':
        return 'bg-muted/20 hover:bg-muted/30';
      case 'main':
        return location.hasQuest 
          ? 'bg-primary-glow/20 hover:bg-primary-glow/30' 
          : 'bg-primary/20 hover:bg-primary/30';
      default:
        return 'bg-primary/20 hover:bg-primary/30';
    }
  };

  const Icon = getIcon();
  const content = getLocationContent(location.id);

  const playClickSound = () => {
    // Play book opening sound
    const audio = new Audio('/audio/opening-a-book.wav');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignore audio play errors (user hasn't interacted yet)
    });
  };

  const handleClick = () => {
    playClickSound();
    onClick();
  };

  return (
    <div
      style={style}
      className={cn('geomarker group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      // Добавляем стили для предотвращения смещения
      onMouseDown={(e) => e.preventDefault()} // Предотвращаем выделение
    >
      {/* Main marker */}
      <div
        className={cn(
          'relative w-8 h-8 rounded-full border-2 border-background transition-all duration-300 cursor-pointer',
          'flex items-center justify-center',
          getBgColor(),
          isActive && 'scale-125 animate-pulse-glow',
          'hover:scale-105' // Уменьшаем масштаб для более плавного эффекта
        )}
      >
        <Icon 
          className={cn(
            'w-4 h-4 transition-colors duration-300',
            isActive ? 'text-background' : getColor()
          )} 
        />
        
        {/* Quest indicator */}
        {location.hasQuest && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-glow rounded-full animate-pulse-glow">
            <div className="absolute inset-0 bg-primary-glow rounded-full animate-ping opacity-75"></div>
          </div>
        )}
      </div>

      {/* Hover tooltip */}
      {(isHovered || isActive) && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 animate-float-in">
          <div className="glass rounded-lg px-3 py-2 shadow-mystic min-w-max">
            <h4 className="text-sm font-medium text-foreground font-medieval">
              {location.name}
            </h4>
            {content && (
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {content.zones.zone1?.text.substring(0, 80)}...
              </p>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-background/70"></div>
          </div>
        </div>
      )}

      {/* Pulse rings for active state */}
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30"></div>
          <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></div>
        </>
      )}
    </div>
  );
};