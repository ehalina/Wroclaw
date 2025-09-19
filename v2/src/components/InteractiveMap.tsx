import React, { useState, useRef, useEffect } from 'react';
import { X, Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Geomarker } from './Geomarker';
import { locations } from '@/data/locations';

interface InteractiveMapProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocationId?: string;
  onLocationSelect: (locationId: string) => void;
  backgroundImage: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  isOpen,
  onClose,
  currentLocationId,
  onLocationSelect,
  backgroundImage,
}) => {
  const { t } = useTranslation();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Center map when opened
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, scale * delta));
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === mapRef.current || (e.target as Element).closest('.map-background')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const centerOnCurrentLocation = () => {
    if (currentLocationId) {
      const location = locations.find(loc => loc.id === currentLocationId);
      if (location) {
        // Center the map on the current location
        setPosition({ x: -location.coordinates[0] * 2, y: -location.coordinates[1] * 2 });
        setScale(1.5);
      }
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(3, prev * 1.2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.5, prev * 0.8));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in-up">
      <div className="relative w-full max-w-4xl h-full max-h-[80vh] mx-4">
        {/* Map Container */}
        <div 
          ref={mapRef}
          className="relative w-full h-full glass rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Background Image */}
          <div
            className="map-background absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transformOrigin: 'center center',
            }}
          >
            {/* Geomarkers */}
            {locations.map((location) => (
              <Geomarker
                key={location.id}
                location={location}
                isActive={location.id === currentLocationId}
                onClick={() => {
                  onLocationSelect(location.id);
                  // Небольшая задержка для визуальной обратной связи
                  setTimeout(() => {
                    onClose();
                  }, 300);
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${location.coordinates[0]}%`,
                  top: `${location.coordinates[1]}%`,
                }}
              />
            ))}
          </div>

          {/* Overlay gradient for better visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-background/10 pointer-events-none" />
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={onClose}
            className="glass border-0 hover:bg-primary/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={centerOnCurrentLocation}
            className="glass border-0 hover:bg-primary/20"
            disabled={!currentLocationId}
          >
            <Navigation className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomIn}
            className="glass border-0 hover:bg-primary/20"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomOut}
            className="glass border-0 hover:bg-primary/20"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 glass rounded-lg p-3">
          <h3 className="text-sm font-medium text-foreground mb-2">{t('map.legend')}</h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>{t('map.mainLocations')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent-red"></div>
              <span>{t('map.cathedrals')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent-green"></div>
              <span>{t('map.gardens')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
              <span>{t('map.courtyards')}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 glass rounded-lg p-3 max-w-xs">
          <p className="text-xs text-muted-foreground">
            {t('map.instructions')}
          </p>
        </div>
      </div>
    </div>
  );
};