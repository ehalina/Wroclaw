import React, { ReactNode, useEffect, useState } from 'react';
import { useParallax } from '@/hooks/useParallax';
import { cn } from '@/lib/utils';

interface ImmersiveBackgroundProps {
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
  zoomEffect?: boolean;
  zoomDuration?: number;
  zoomAmount?: number;
  breathingEffect?: boolean;
  breathingSpeed?: number;
}

export const ImmersiveBackground: React.FC<ImmersiveBackgroundProps> = ({
  children,
  className,
  imageUrl,
  alt = 'Immersive background',
  intensity = 0.4,
  direction = 'both',
  speed = 1.2,
  enabled = true,
  overlay = true,
  overlayOpacity = 0.3,
  zoomEffect = true,
  zoomDuration = 10000,
  zoomAmount = 0.1,
  breathingEffect = true,
  breathingSpeed = 8000
}) => {
  const { containerRef, getTransform, isHovering } = useParallax({
    intensity,
    direction,
    speed,
    enabled
  });

  const [zoomScale, setZoomScale] = useState(1);
  const [breathingScale, setBreathingScale] = useState(1);
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

  // Эффект "дыхания" - легкое покачивание
  useEffect(() => {
    if (!breathingEffect || isZooming) return;

    const startTime = Date.now();
    const animateBreathing = () => {
      const elapsed = Date.now() - startTime;
      const cycle = (elapsed % breathingSpeed) / breathingSpeed;
      const breathing = 1 + Math.sin(cycle * Math.PI * 2) * 0.005; // Очень легкое покачивание
      
      setBreathingScale(breathing);

      requestAnimationFrame(animateBreathing);
    };

    requestAnimationFrame(animateBreathing);
  }, [breathingEffect, breathingSpeed, isZooming]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden",
        "parallax-optimized",
        className
      )}
    >
      {/* Основной фоновый слой с параллаксом и эффектами */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translate3d(${getTransform(0).x}px, ${getTransform(0).y}px, 0) scale(${zoomScale * breathingScale})`,
          transformOrigin: 'center center',
          transition: enabled && isHovering ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: enabled ? 'transform' : 'auto',
          zIndex: 1
        }}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
          loading="eager"
        />
      </div>

      {/* Дополнительный слой для глубины */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translate3d(${getTransform(1).x * 0.3}px, ${getTransform(1).y * 0.3}px, 0) scale(${zoomScale * breathingScale * 1.05})`,
          transformOrigin: 'center center',
          transition: enabled && isHovering ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: enabled ? 'transform' : 'auto',
          zIndex: 2,
          opacity: 0.3
        }}
      >
        <img
          src={imageUrl}
          alt={`${alt} - Depth layer`}
          className="w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
          loading="eager"
          style={{
            filter: 'blur(2px) brightness(0.8)'
          }}
        />
      </div>

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 bg-black pointer-events-none"
          style={{
            opacity: overlayOpacity,
            zIndex: 3
          }}
        />
      )}

      {/* Content - контент остается статичным */}
      {children && (
        <div
          className="relative z-10 w-full h-full"
          style={{ 
            zIndex: 10,
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
