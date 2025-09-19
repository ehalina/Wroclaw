import React, { ReactNode, useEffect, useState, memo } from 'react';
import { useParallax } from '@/hooks/useParallax';
import { OptimizedImage } from './OptimizedImage';
import { cn } from '@/lib/utils';

interface ParallaxBackgroundProps {
  children?: ReactNode;
  className?: string;
  imageUrl: string;
  alt?: string;
  intensity?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
  speed?: number;
  enabled?: boolean;
  overlay?: boolean;
  overlayOpacity?: number;
  layers?: number;
  zoomEffect?: boolean;
  zoomDuration?: number;
  zoomAmount?: number;
  key?: string | number; // Добавляем key для принудительного перезапуска
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = memo(({
  children,
  className,
  imageUrl,
  alt = 'Background image',
  intensity = 0.3,
  direction = 'both',
  speed = 1,
  enabled = true,
  overlay = true,
  overlayOpacity = 0.3,
  layers = 2, // Уменьшаем количество слоев для производительности
  zoomEffect = true,
  zoomDuration = 10000, // 10 секунд
  zoomAmount = 0.1 // 10%
}) => {
  const { containerRef, getTransform, isHovering } = useParallax({
    intensity,
    direction,
    speed,
    enabled
  });

  const [zoomScale, setZoomScale] = useState(1);
  const [isZooming, setIsZooming] = useState(true);

  // Эффект приближения - перезапускается при смене изображения
  useEffect(() => {
    if (!zoomEffect) return;

    // Сбрасываем состояние при смене изображения
    setZoomScale(1);
    setIsZooming(true);

    const startTime = Date.now();
    const startScale = 1;
    const endScale = 1 + zoomAmount;

    const animateZoom = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / zoomDuration, 1);
      
      // Плавная анимация с easing
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentScale = startScale + (endScale - startScale) * easeOutCubic;
      
      setZoomScale(currentScale);

      if (progress < 1) {
        requestAnimationFrame(animateZoom);
      } else {
        setIsZooming(false);
      }
    };

    // Небольшая задержка для плавного перехода
    const timer = setTimeout(() => {
      requestAnimationFrame(animateZoom);
    }, 100);

    return () => clearTimeout(timer);
  }, [imageUrl, zoomEffect, zoomDuration, zoomAmount]); // Добавляем imageUrl в зависимости

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden",
        className
      )}
    >
      {/* Parallax layers - фоновые слои с параллакс эффектом (оптимизировано) */}
      {Array.from({ length: layers }, (_, index) => {
        const transform = getTransform(index);
        const layerIntensity = (index + 1) / layers;
        const baseScale = 1 + (layerIntensity * 0.05); // Уменьшаем масштаб для производительности
        const finalScale = baseScale * zoomScale;
        
        return (
          <div
            key={index}
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${finalScale})`,
              transformOrigin: 'center center',
              transition: enabled && isHovering ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: enabled ? 'transform' : 'auto',
              zIndex: layers - index,
              contain: 'layout style paint' // Оптимизация рендеринга
            }}
          >
            <OptimizedImage
              src={imageUrl}
              alt={`${alt} - Layer ${index + 1}`}
              className="w-full h-full object-cover select-none pointer-events-none"
              priority={index === 0} // Только первый слой загружается с приоритетом
              quality={index === 0 ? 90 : 70} // Разное качество для разных слоев
              style={{
                filter: `blur(${index * 0.3}px) brightness(${1 - index * 0.05})`, // Уменьшаем эффекты
                opacity: 1 - (index * 0.05)
              }}
            />
          </div>
        );
      })}

      {/* Main background layer - основной фоновый слой с параллаксом (оптимизировано) */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translate3d(${getTransform(0).x * 0.5}px, ${getTransform(0).y * 0.5}px, 0) scale(${zoomScale})`,
          transformOrigin: 'center center',
          transition: enabled && isHovering ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: enabled ? 'transform' : 'auto',
          zIndex: layers + 1,
          contain: 'layout style paint' // Оптимизация рендеринга
        }}
      >
        <OptimizedImage
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover select-none pointer-events-none"
          priority={true} // Главное изображение загружается с приоритетом
          quality={95} // Высокое качество для основного изображения
        />
      </div>

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 bg-black pointer-events-none"
          style={{
            opacity: overlayOpacity,
            zIndex: layers + 2
          }}
        />
      )}

      {/* Content - контент поверх фона БЕЗ параллакса */}
      {children && (
        <div
          className="relative z-10 w-full h-full"
          style={{ 
            zIndex: layers + 3,
            // Контент остается статичным, не двигается с параллаксом
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
});

ParallaxBackground.displayName = 'ParallaxBackground';
