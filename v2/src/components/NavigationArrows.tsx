import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, MoveUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationArrowsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onUp?: () => void;
  onStraight?: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
  showUp?: boolean;
  showStraight?: boolean;
  className?: string;
}

export const NavigationArrows: React.FC<NavigationArrowsProps> = ({
  onPrevious,
  onNext,
  onUp,
  onStraight,
  showPrevious = false,
  showNext = false,
  showUp = false,
  showStraight = false,
  className,
}) => {
  const playStepSound = () => {
    const audio = new Audio('/audio/step.wav');
    audio.volume = 0.4;
    audio.play().catch(() => {
      // Ignore audio play errors
    });
  };

  const handleNavigation = (callback?: () => void) => {
    if (callback) {
      playStepSound();
      callback();
    }
  };

  if (!showPrevious && !showNext && !showUp && !showStraight) {
    return null;
  }

  return (
    <div className={cn('fixed inset-0 pointer-events-none z-30', className)}>
      {/* Previous Arrow - Left */}
      {showPrevious && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-auto">
          <Button
            onClick={() => handleNavigation(onPrevious)}
            className="nav-arrow w-12 h-12 group hover:scale-105"
            aria-label="Предыдущая локация"
          >
            <ArrowLeft className="w-6 h-6 group-hover:animate-pulse" />
          </Button>
        </div>
      )}

      {/* Next Arrow - Right */}
      {showNext && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-auto">
          <Button
            onClick={() => handleNavigation(onNext)}
            className="nav-arrow w-12 h-12 group hover:scale-105"
            aria-label="Следующая локация"
          >
            <ArrowRight className="w-6 h-6 group-hover:animate-pulse" />
          </Button>
        </div>
      )}

      {/* Up Arrow - Top */}
      {showUp && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <Button
            onClick={() => handleNavigation(onUp)}
            className="nav-arrow w-12 h-12 group hover:scale-105"
            aria-label="Вернуться к карте"
          >
            <ArrowUp className="w-6 h-6 group-hover:animate-pulse" />
          </Button>
        </div>
      )}

      {/* Straight Arrow - Bottom */}
      {showStraight && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <Button
            onClick={() => handleNavigation(onStraight)}
            className="nav-arrow w-12 h-12 group hover:scale-105"
            aria-label="Войти в локацию"
          >
            <MoveUp className="w-6 h-6 group-hover:animate-pulse" />
          </Button>
        </div>
      )}

      {/* Mobile-friendly corner indicators */}
      <div className="md:hidden absolute inset-4 pointer-events-none">
        {/* Top corners for up navigation */}
        {showUp && (
          <>
            <div className="absolute top-0 left-0 w-16 h-16 pointer-events-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-br-3xl">
                <ArrowUp className="w-6 h-6 text-primary/60 absolute top-2 left-2" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-auto">
              <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-3xl">
                <ArrowUp className="w-6 h-6 text-primary/60 absolute top-2 right-2" />
              </div>
            </div>
          </>
        )}

        {/* Side corners for left/right navigation */}
        {showPrevious && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-24 pointer-events-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-r-3xl">
              <ArrowLeft className="w-5 h-5 text-primary/60 absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        )}

        {showNext && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-24 pointer-events-auto">
            <div className="absolute inset-0 bg-gradient-to-l from-primary/20 to-transparent rounded-l-3xl">
              <ArrowRight className="w-5 h-5 text-primary/60 absolute right-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};