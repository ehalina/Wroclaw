import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Maximize2, Minimize2, RotateCcw, BookOpen, Map, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Geomarker } from './Geomarker';
// import { NavigationArrows } from './NavigationArrows'; // DISABLED
import { LanguageSelector } from './LanguageSelector';
import { QuestBook } from './QuestBook';
import { ParallaxBackground } from './ParallaxBackground';
import { OptimizedImage, useImagePreloader } from './OptimizedImage';
import { locations, getLocationById, type Location } from '@/data/locations';
import { useAudio } from '@/hooks/useAudio';
import { cn } from '@/lib/utils';

interface PanoramaViewerProps {
  locationId: string;
  onLocationChange: (locationId: string) => void;
  onMapOpen?: () => void;
  className?: string;
}

interface Transform {
  scale: number;
  translateX: number;
  translateY: number;
}

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
  locationId,
  onLocationChange,
  onMapOpen,
  className
}) => {
  const [transform, setTransform] = useState<Transform>({ scale: 1, translateX: 0, translateY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isQuestOpen, setIsQuestOpen] = useState(false);

  // Audio hook
  const audio = useAudio({
    autoPlay: true,
    loop: true,
    volume: 0.7,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<number>();
  const parallaxLayersRef = useRef<HTMLDivElement[]>([]);

  const location = getLocationById(locationId);
  const { preloadImages } = useImagePreloader();

  // Build panorama image path by location id
  const buildPanoramaPath = useCallback((id: string): string => {
    if (id.startsWith('tumski')) {
      return `/images/panoramas/tumski_${id.replace('tumski', '').padStart(2, '0')}.jpg`;
    }
    if (id.startsWith('dwor')) {
      return `/images/panoramas/dwor_${id.replace('dwor', '').padStart(2, '0')}.jpg`;
    }
    if (id.startsWith('ogrod')) {
      return `/images/panoramas/ogrod_${id.replace('ogrod', '').padStart(2, '0')}.jpg`;
    }
    return `/images/panoramas/tumski_01.jpg`;
  }, []);

  // Get panorama image path (memoized to avoid recalculation on every render)
  const imagePath = useMemo(() => {
    const path = buildPanoramaPath(locationId);
    console.log('🖼️ Загружаем панораму:', { id: locationId, path });
    return path;
  }, [locationId, buildPanoramaPath]);

  // Mouse tracking for parallax effects
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || isDragging) return;

    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    setMousePosition({ x, y });
  }, [isDragging]);

  // Handle mouse/touch events for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.translateX, y: e.clientY - transform.translateY });
  }, [transform]);

  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const newTranslateX = e.clientX - dragStart.x;
    const newTranslateY = e.clientY - dragStart.y;

    setTransform(prev => ({
      ...prev,
      translateX: newTranslateX,
      translateY: newTranslateY
    }));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - transform.translateX, y: touch.clientY - transform.translateY });
  }, [transform]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const newTranslateX = touch.clientX - dragStart.x;
    const newTranslateY = touch.clientY - dragStart.y;

    setTransform(prev => ({
      ...prev,
      translateX: newTranslateX,
      translateY: newTranslateY
    }));
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom functionality
  const handleZoom = useCallback((delta: number, clientX?: number, clientY?: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = clientX || rect.width / 2;
    const centerY = clientY || rect.height / 2;

    setTransform(prev => {
      const newScale = Math.max(0.5, Math.min(3, prev.scale + delta));
      const scaleRatio = newScale / prev.scale;

      return {
        scale: newScale,
        translateX: centerX - (centerX - prev.translateX) * scaleRatio,
        translateY: centerY - (centerY - prev.translateY) * scaleRatio,
      };
    });
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta, e.clientX, e.clientY);
  }, [handleZoom]);

  // Reset view
  const resetView = useCallback(() => {
    setTransform({ scale: 1, translateX: 0, translateY: 0 });
  }, []);

  // Fullscreen functionality
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e as unknown as React.MouseEvent);
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalTouchMove = (e: TouchEvent) => handleTouchMove(e);
    const handleGlobalTouchEnd = () => handleTouchEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('touchmove', handleGlobalTouchMove);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Reset transform when location changes
  useEffect(() => {
    setIsTransitioning(true);
    resetView();

    console.log('📍 Переход к локации:', locationId, imagePath);

    // Add transition delay for smooth location change
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 800); // Увеличиваем время для плавного перехода

    return () => clearTimeout(timer);
  }, [locationId, resetView, imagePath]);

  // Update audio track when location changes
  useEffect(() => {
    if (location?.audioTrack) {
      console.log('🎵 Смена локации:', locationId, '→ аудиотрек:', location.audioTrack);
      audio.changeTrack(location.audioTrack as keyof typeof import('@/data/locations').audioTracks);
    }
  }, [locationId, location?.audioTrack, audio]);

  // Parallax effect for UI elements
  useEffect(() => {
    parallaxLayersRef.current.forEach((layer, index) => {
      if (layer) {
        const depth = (index + 1) * 0.1;
        const x = mousePosition.x * depth * 10;
        const y = mousePosition.y * depth * 10;
        layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    });
  }, [mousePosition]);

  // Get connected locations for navigation
  const connectedLocations = locations.filter(loc =>
    location.nextLocations?.includes(loc.id)
  );

  // Preload nearby images for better performance
  useEffect(() => {
    const nearbyImagePaths = connectedLocations.map(loc => buildPanoramaPath(loc.id));
    preloadImages(nearbyImagePaths);
  }, [connectedLocations, preloadImages, buildPanoramaPath]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-black cursor-grab active:cursor-grabbing parallax-container",
        isFullscreen && "fixed inset-0 z-50",
        isTransitioning && "animate-fade-in-up",
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseMove={handleMouseMove}
    >


      {/* Main panorama image with parallax */}
      <div
        className="w-full h-full transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
          transformOrigin: '0 0'
        }}
      >
        <ParallaxBackground
          key={locationId} // Принудительный перезапуск при смене локации
          imageUrl={imagePath}
          alt={`Panorama of ${location.name}`}
          intensity={0.3}
          direction="both"
          speed={1.5}
          enabled={!isDragging}
          overlay={false}
          layers={2}
          zoomEffect={true}
          zoomDuration={10000}
          zoomAmount={0.1}
          className="w-full h-full"
        >
          {/* Geomarkers positioned relative to image */}
          {connectedLocations.map(connectedLocation => (
            <Geomarker
              key={connectedLocation.id}
              location={connectedLocation}
              onClick={() => onLocationChange(connectedLocation.id)}
              style={{
                position: 'absolute',
                left: `${connectedLocation.coordinates[0]}%`,
                top: `${connectedLocation.coordinates[1]}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </ParallaxBackground>
      </div>

      {/* Control Panel */}
      <div
        ref={el => parallaxLayersRef.current[0] = el!}
        className="absolute top-4 right-4 flex flex-col gap-2 z-20 animate-slide-in-right animate-delay-300"
      >
        <div className="animate-bounce-in animate-delay-500">
          <LanguageSelector variant="compact" />
        </div>
        <Button
          onClick={toggleFullscreen}
          variant="ghost"
          size="icon"
          className="glass w-10 h-10 hover:bg-white/20 hover-lift hover-glow animate-bounce-in animate-delay-700"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button
          onClick={resetView}
          variant="ghost"
          size="icon"
          className="glass w-10 h-10 hover:bg-white/20 hover-lift hover-glow animate-bounce-in animate-delay-1000"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Music Player */}
      <div
        ref={el => parallaxLayersRef.current[1] = el!}
        className="absolute bottom-4 left-4 z-20 animate-slide-in-left animate-delay-500"
      >
        <div className="animate-breathe-subtle">
          <div
            className="relative hover-glow"
            style={{
              transform: `translate3d(${mousePosition.x * 2}px, ${mousePosition.y * 2}px, 0)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div className="floating-panel p-4 min-w-[240px]">
              <div className="flex items-center gap-3 mb-3">
                {/* Track Name */}
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {location?.audioTrack === 'kostel' ? 'Соборная атмосфера' :
                     location?.audioTrack === 'birds' ? 'Садовые звуки' :
                     location?.audioTrack === 'hang' ? 'Мистическая музыка' :
                     'Городская атмосфера'}
                  </div>
                </div>

                {/* Mute Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={audio.toggleMute}
                  className="w-8 h-8 rounded-full hover:bg-primary/20"
                >
                  {audio.isMuted ? (
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
                  value={[audio.isMuted ? 0 : audio.volume]}
                  onValueChange={(newVolume) => {
                    const vol = newVolume[0];
                    audio.setVolume(vol);
                    if (vol === 0) {
                      audio.toggleMute();
                    } else if (audio.isMuted) {
                      audio.toggleMute();
                    }
                  }}
                  max={1}
                  step={0.05}
                  className="flex-1"
                />
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        ref={el => parallaxLayersRef.current[2] = el!}
        className="absolute bottom-4 right-4 z-20 animate-slide-in-right animate-delay-700 flex flex-col gap-3"
      >
        {/* Map Button */}
        <Button
          onClick={onMapOpen}
          className="relative w-12 h-12 rounded-full bg-primary hover:bg-primary-glow shadow-golden hover:shadow-glow transition-all duration-300 transform hover:scale-105 active:scale-95 animate-bounce-in animate-delay-600"
          title="Открыть карту"
        >
          <Map className="w-6 h-6 text-background" />
          
          {/* Subtle pulse effect */}
          <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></div>
        </Button>

        {/* Quest Button */}
        <Button
          onClick={() => setIsQuestOpen(true)}
          className="relative w-12 h-12 rounded-full bg-primary hover:bg-primary-glow shadow-golden hover:shadow-glow transition-all duration-300 transform hover:scale-105 active:scale-95 animate-bounce-in animate-delay-700"
          title="Открыть квесты"
        >
          <BookOpen className="w-6 h-6 text-background" />
          
          {/* Subtle pulse effect */}
          <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></div>
        </Button>
      </div>

      {/* Navigation Arrows - DISABLED */}
      {/* <NavigationArrows
        currentLocationId={locationId}
        onLocationChange={onLocationChange}
        availableLocations={connectedLocations}
      /> */}

      {/* Location Title */}
      <div
        ref={el => parallaxLayersRef.current[3] = el!}
        className="absolute top-4 left-4 z-20 animate-slide-in-left animate-delay-200"
      >
        <div className="glass px-4 py-2 rounded-lg hover-lift">
          <h1 className="text-white font-medieval text-lg">{location.name}</h1>
        </div>
      </div>

      {/* Quest Book */}
      <QuestBook
        isOpen={isQuestOpen}
        onClose={() => setIsQuestOpen(false)}
        currentLocationId={locationId}
      />
    </div>
  );
};