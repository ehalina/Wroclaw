import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LocationContent } from '@/data/locations';
import { cn } from '@/lib/utils';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: LocationContent[string];
  className?: string;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  className,
}) => {
  const { t } = useTranslation();
  const [currentZone, setCurrentZone] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen || !content) return null;

  const zones = Object.values(content.zones);
  const currentZoneData = zones[currentZone];

  const handlePrevZone = () => {
    setCurrentZone(prev => Math.max(0, prev - 1));
  };

  const handleNextZone = () => {
    setCurrentZone(prev => Math.min(zones.length - 1, prev + 1));
  };

  const toggleAudio = () => {
    if (currentZoneData?.audioUrl) {
      // TODO: Implement audio playback
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in-up"
      onClick={handleBackdropClick}
    >
      <div 
        className={cn(
          'relative w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden',
          'glass rounded-xl shadow-mystic animate-scale-in',
          className
        )}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-border/20">
          <h2 className="text-2xl font-bold text-foreground font-medieval pr-12">
            {title}
          </h2>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-destructive/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar max-h-96 selectable">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {currentZoneData?.title}
              </h3>
              
              {currentZoneData?.audioUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAudio}
                  className="hover:bg-primary/20"
                >
                  {isPlayingAudio ? (
                    <VolumeX className="w-4 h-4 mr-2" />
                  ) : (
                    <Volume2 className="w-4 h-4 mr-2" />
                  )}
                  {isPlayingAudio ? 'Выключить' : 'Прослушать'}
                </Button>
              )}
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              {currentZoneData?.text}
            </p>
          </div>
        </div>

        {/* Navigation */}
        {zones.length > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-border/20">
            <Button
              variant="ghost"
              onClick={handlePrevZone}
              disabled={currentZone === 0}
              className="flex items-center gap-2 hover:bg-primary/20 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Назад
            </Button>

            <div className="flex items-center gap-2">
              {zones.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentZone(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    currentZone === index ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                  aria-label={`Перейти к зоне ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              onClick={handleNextZone}
              disabled={currentZone === zones.length - 1}
              className="flex items-center gap-2 hover:bg-primary/20 disabled:opacity-50"
            >
              Далее
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Zone counter */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
            {currentZone + 1} из {zones.length}
          </div>
        </div>
      </div>
    </div>
  );
};