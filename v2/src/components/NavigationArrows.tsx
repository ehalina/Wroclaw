import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationArrowsProps {
  currentLocationId: string;
  onLocationChange: (locationId: string) => void;
  availableLocations: Array<{ id: string; name: string }>;
  className?: string;
}

export const NavigationArrows: React.FC<NavigationArrowsProps> = ({
  currentLocationId,
  onLocationChange,
  availableLocations,
  className,
}) => {
  const playStepSound = () => {
    const audio = new Audio('/audio/step.wav');
    audio.volume = 0.4;
    audio.play().catch(() => {
      // Ignore audio errors in case user hasn't interacted with page yet
    });
  };

  const handleNavigation = (locationId: string) => {
    playStepSound();
    onLocationChange(locationId);
  };

  if (availableLocations.length === 0) {
    return null;
  }

  return (
    <div className={cn('fixed inset-0 pointer-events-none z-30', className)}>
      {/* Navigation arrows for available locations */}
      {availableLocations.slice(0, 2).map((location, index) => {
        const isLeft = index === 0;
        const isRight = index === 1;

        return (
          <div
            key={location.id}
            className={cn(
              "absolute top-1/2 transform -translate-y-1/2 pointer-events-auto",
              isLeft && "left-4",
              isRight && "right-4"
            )}
          >
            <Button
              onClick={() => handleNavigation(location.id)}
              className="nav-arrow w-12 h-12 group hover:scale-105 glass border-white/20"
              aria-label={`Navigate to ${location.name}`}
              title={location.name}
            >
              {isLeft && <ArrowLeft className="w-6 h-6 group-hover:animate-pulse" />}
              {isRight && <ArrowRight className="w-6 h-6 group-hover:animate-pulse" />}
            </Button>
          </div>
        );
      })}

      {/* More locations indicator */}
      {availableLocations.length > 2 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="glass border-white/20 rounded-lg px-3 py-1 text-sm text-white">
            +{availableLocations.length - 2} more locations
          </div>
        </div>
      )}

      {/* Mobile-friendly corner indicators */}
      <div className="md:hidden absolute inset-4 pointer-events-none">
        {availableLocations.slice(0, 2).map((location, index) => {
          const isLeft = index === 0;
          const isRight = index === 1;

          return (
            <div
              key={`mobile-${location.id}`}
              className={cn(
                "absolute top-1/2 transform -translate-y-1/2 w-12 h-24 pointer-events-auto",
                isLeft && "left-0",
                isRight && "right-0"
              )}
              onClick={() => handleNavigation(location.id)}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent",
                isLeft && "rounded-r-3xl",
                isRight && "rounded-l-3xl bg-gradient-to-l"
              )}>
                {isLeft && <ArrowLeft className="w-5 h-5 text-primary/60 absolute left-2 top-1/2 transform -translate-y-1/2" />}
                {isRight && <ArrowRight className="w-5 h-5 text-primary/60 absolute right-2 top-1/2 transform -translate-y-1/2" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};