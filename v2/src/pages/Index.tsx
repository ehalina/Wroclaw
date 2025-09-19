import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ParallaxBackground } from '@/components/ParallaxBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const startTour = () => {
    navigate('/tour/tumski01');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background image with parallax */}
      <ParallaxBackground
        imageUrl="/images/panoramas/tumski_01.jpg"
        alt="Tumski Island Panorama"
        intensity={0.4}
        direction="both"
        speed={1.5}
        enabled={true}
        overlay={true}
        overlayOpacity={0.5}
        layers={3}
        zoomEffect={true}
        zoomDuration={10000}
        zoomAmount={0.1}
        className="absolute inset-0"
      />

      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector variant="compact" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl animate-fade-in-up animate-text-glow">
          Wrocław
        </h1>

        <h2 className="text-2xl md:text-4xl font-light mb-8 opacity-90 animate-fade-in-up animate-delay-200">
          Tumski Island Virtual Tour
        </h2>

        <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed opacity-80 animate-fade-in-up animate-delay-300">
          Embark on an interactive journey through the historic heart of Wrocław.
          Explore Tumski Island's ancient courtyards, magnificent cathedrals, and serene gardens.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-bounce-in animate-delay-500">
          <Button
            onClick={startTour}
            size="lg"
            className="px-8 py-4 text-lg bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-2xl hover-glow animate-shimmer"
          >
            Begin Virtual Tour
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/tour/tumski19')} // Cathedral
            className="px-8 py-4 text-lg border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover-lift"
          >
            Visit Cathedral
          </Button>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="glass border-white/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">🏰 Historic Sites</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-200">
                Explore 24 unique panoramic views of Tumski Island's most significant locations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="glass border-white/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">🎵 Immersive Audio</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-200">
                Experience contextual background music that changes based on your location.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="glass border-white/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">🌍 Multilingual</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-200">
                Available in 7 languages including Russian, English, German, and Polish.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* PWA Notice */}
        <div className="mt-12 text-sm opacity-60">
          <p>📱 Install this app on your device for the best experience</p>
        </div>
      </div>
    </div>
  );
};

export default Index;