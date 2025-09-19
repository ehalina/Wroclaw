import React, { useState } from 'react';
import { ParallaxBackground } from './ParallaxBackground';
import { Button } from '@/components/ui/button';

const demoImages = [
  '/images/panoramas/tumski_01.jpg',
  '/images/panoramas/tumski_02.jpg',
  '/images/panoramas/tumski_03.jpg',
  '/images/panoramas/dwor_01.jpg',
  '/images/panoramas/ogrod_01.jpg'
];

export const ParallaxDemo: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % demoImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + demoImages.length) % demoImages.length);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Автопереключение каждые 12 секунд
  React.useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      nextImage();
    }, 12000); // 12 секунд (10 на zoom + 2 на переход)

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <ParallaxBackground
        key={currentImageIndex} // Принудительный перезапуск
        imageUrl={demoImages[currentImageIndex]}
        alt={`Demo image ${currentImageIndex + 1}`}
        intensity={0.4}
        direction="both"
        speed={1.5}
        enabled={true}
        overlay={true}
        overlayOpacity={0.3}
        layers={3}
        zoomEffect={true}
        zoomDuration={10000}
        zoomAmount={0.1}
        className="w-full h-full"
      >
        {/* Контролы */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <Button onClick={prevImage} variant="secondary" size="sm">
            ← Предыдущая
          </Button>
          <Button onClick={nextImage} variant="secondary" size="sm">
            Следующая →
          </Button>
          <Button 
            onClick={toggleAutoPlay} 
            variant={isPlaying ? "destructive" : "default"} 
            size="sm"
          >
            {isPlaying ? "⏸️ Стоп" : "▶️ Авто"}
          </Button>
        </div>

        {/* Информация */}
        <div className="absolute bottom-4 left-4 z-20 glass p-4 rounded-lg">
          <h3 className="text-white font-bold mb-2">
            Демо параллакс эффекта
          </h3>
          <p className="text-white/80 text-sm">
            Изображение {currentImageIndex + 1} из {demoImages.length}
          </p>
          <p className="text-white/60 text-xs mt-1">
            При каждой смене изображение приближается на 10% за 10 секунд
          </p>
        </div>
      </ParallaxBackground>
    </div>
  );
};
