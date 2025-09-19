import React, { useState, useEffect } from 'react';
import { InteractiveMap } from '@/components/InteractiveMap';
import { FloatingPanel } from '@/components/FloatingPanel';
import { MusicPlayer } from '@/components/MusicPlayer';
import { NavigationArrows } from '@/components/NavigationArrows';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LocationModal } from '@/components/LocationModal';
import useAppStore from '@/store/appStore';
import { getLocationById, getLocationContent, audioTracks } from '@/data/locations';
import tumskiPanorama from '@/assets/tumski-panorama.jpg';
import cathedralInterior from '@/assets/cathedral-interior.jpg';
import tumskiBridge from '@/assets/tumski-bridge.jpg';

const Index = () => {
  const {
    currentLocation,
    language,
    musicEnabled,
    currentTrack,
    isPlaying,
    isMapOpen,
    isMenuOpen,
    selectedLocationForModal,
    setCurrentLocation,
    setLanguage,
    toggleMusic,
    setCurrentTrack,
    setIsPlaying,
    setMapOpen,
    setMenuOpen,
    setSelectedLocationForModal,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);
  const [currentBgImage, setCurrentBgImage] = useState(tumskiPanorama);

  // Initialize PWA
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Handle PWA install prompt
    let deferredPrompt: any;
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Load saved language
    const savedLanguage = localStorage.getItem('tumski-language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    setIsLoading(false);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [setLanguage]);

  // Update background image and music based on current location
  useEffect(() => {
    const location = getLocationById(currentLocation);
    if (location) {
      // Set background image based on location
      switch (currentLocation) {
        case 'cathedral-john':
        case 'cathedral-cross':
          setCurrentBgImage(cathedralInterior);
          break;
        case 'tumski-bridge':
          setCurrentBgImage(tumskiBridge);
          break;
        default:
          setCurrentBgImage(tumskiPanorama);
      }

      // Set music track based on location
      if (location.audioTrack) {
        setCurrentTrack(location.audioTrack);
      }
    }
  }, [currentLocation, setCurrentTrack]);

  const handleLocationSelect = (locationId: string) => {
    setCurrentLocation(locationId);
    setMapOpen(false);
  };

  const handleGeomarkerClick = (locationId: string) => {
    const content = getLocationContent(locationId, language);
    if (content) {
      setSelectedLocationForModal(locationId);
    }
  };

  const handleNavigation = (direction: 'prev' | 'next' | 'up') => {
    const location = getLocationById(currentLocation);
    if (!location) return;

    if (direction === 'up') {
      setMapOpen(true);
      return;
    }

    if (location.nextLocations && location.nextLocations.length > 0) {
      const nextLocation = direction === 'next' 
        ? location.nextLocations[0] 
        : location.nextLocations[location.nextLocations.length - 1];
      setCurrentLocation(nextLocation);
    }
  };

  const currentLocationData = getLocationById(currentLocation);
  const selectedLocationContent = selectedLocationForModal 
    ? getLocationContent(selectedLocationForModal, language) 
    : null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-medieval text-primary">
            Загружаем виртуальную экскурсию...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen h-dvh overflow-hidden">
      {/* Background Panorama */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out"
        style={{ 
          backgroundImage: `url(${currentBgImage})`,
          backgroundPosition: 'center center',
        }}
      >
        {/* Overlay gradient for better UI visibility */}
        <div className="absolute inset-0 bg-gradient-mystic opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-overlay"></div>
      </div>

      {/* Interactive Map Overlay */}
      <div className="absolute inset-0">
        <InteractiveMap
          isOpen={isMapOpen}
          onClose={() => setMapOpen(false)}
          currentLocationId={currentLocation}
          onLocationSelect={handleLocationSelect}
          backgroundImage={currentBgImage}
        />
      </div>

      {/* Geomarkers for current view */}
      {!isMapOpen && currentLocationData && (
        <div className="absolute inset-0">
          {/* Add geomarkers based on current location */}
          {/* This would be populated based on the current panorama view */}
        </div>
      )}

      {/* Navigation Arrows */}
      <NavigationArrows
        showPrevious={currentLocationData?.nextLocations && currentLocationData.nextLocations.length > 1}
        showNext={currentLocationData?.nextLocations && currentLocationData.nextLocations.length > 0}
        showUp={currentLocation !== 'tumski'}
        onPrevious={() => handleNavigation('prev')}
        onNext={() => handleNavigation('next')}
        onUp={() => handleNavigation('up')}
      />

      {/* Music Player */}
      <div className="absolute top-4 right-4 z-30">
        <MusicPlayer
          currentTrack={currentTrack as keyof typeof audioTracks}
          autoPlay={musicEnabled}
        />
      </div>

      {/* Language Selector */}
      <div className="absolute top-4 left-4 z-30">
        <LanguageSelector
          currentLanguage={language}
          onLanguageChange={setLanguage}
          variant="compact"
        />
      </div>

      {/* Location Title */}
      {currentLocationData && !isMapOpen && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-medieval text-primary mb-4 drop-shadow-lg">
            {currentLocationData.name}
          </h1>
          <div className="glass rounded-lg px-6 py-3 max-w-md">
            <p className="text-foreground/90 text-sm md:text-base leading-relaxed">
              {getLocationContent(currentLocation, language)?.zones.zone1?.text.substring(0, 120)}...
            </p>
          </div>
        </div>
      )}

      {/* Floating Control Panel */}
      <FloatingPanel
        onMapToggle={() => setMapOpen(!isMapOpen)}
        onLanguageChange={() => {}} // Handled by language selector
        onMusicToggle={toggleMusic}
        onMenuToggle={() => setMenuOpen(!isMenuOpen)}
        onQuestToggle={() => {}} // TODO: Implement quest system
        isMusicPlaying={isPlaying}
      />

      {/* Location Modal */}
      {selectedLocationForModal && selectedLocationContent && (
        <LocationModal
          isOpen={true}
          onClose={() => setSelectedLocationForModal(null)}
          title={currentLocationData?.name || ''}
          content={selectedLocationContent}
        />
      )}

      {/* Loading indicator for PWA */}
      <div className="absolute bottom-2 left-2 z-10">
        <div className="text-xs text-muted-foreground/50">
          PWA Ready • Offline Support
        </div>
      </div>

      {/* Version info */}
      <div className="absolute bottom-2 right-2 z-10">
        <div className="text-xs text-muted-foreground/50">
          v1.0.0 • Tumski Island Virtual Tour
        </div>
      </div>
    </div>
  );
};

export default Index;