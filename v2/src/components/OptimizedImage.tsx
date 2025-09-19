import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

// Hook for image preloading
export const useImagePreloader = () => {
  const preloadedImages = useRef<Set<string>>(new Set());
  const loadingImages = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<void> => {
    if (preloadedImages.current.has(src)) {
      return Promise.resolve();
    }

    if (loadingImages.current.has(src)) {
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (preloadedImages.current.has(src)) {
            resolve();
          } else {
            setTimeout(checkLoaded, 50);
          }
        };
        checkLoaded();
      });
    }

    loadingImages.current.add(src);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        preloadedImages.current.add(src);
        loadingImages.current.delete(src);
        resolve();
      };
      img.onerror = () => {
        loadingImages.current.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(async (srcs: string[]): Promise<void> => {
    const promises = srcs.map(src => preloadImage(src).catch(console.warn));
    await Promise.all(promises);
  }, [preloadImage]);

  const isImageLoaded = useCallback((src: string): boolean => {
    return preloadedImages.current.has(src);
  }, []);

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
  };
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  style,
  priority = false,
  quality = 85,
  sizes = '100vw',
  onLoad,
  onError,
  placeholder = 'blur',
  blurDataURL,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const img = imgRef.current;
    if (!img) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1,
      }
    );

    observerRef.current.observe(img);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, isInView]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Generate optimized src with quality parameter
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    // For now, return original src
    // In production, you might want to use a service like Cloudinary or Next.js Image Optimization
    return originalSrc;
  }, []);

  const optimizedSrc = getOptimizedSrc(src);

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={style}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">🖼️</div>
            <div className="text-sm">Ошибка загрузки</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for preloading nearby images
export const useNearbyImagePreloader = (currentLocationId: string, locations: any[]) => {
  const { preloadImages } = useImagePreloader();

  useEffect(() => {
    // Find connected locations
    const currentLocation = locations.find(loc => loc.id === currentLocationId);
    if (!currentLocation?.nextLocations) return;

    // Build image paths for nearby locations
    const nearbyImagePaths = currentLocation.nextLocations.map((locationId: string) => {
      if (locationId.startsWith('tumski')) {
        return `/images/panoramas/tumski_${locationId.replace('tumski', '').padStart(2, '0')}.jpg`;
      }
      if (locationId.startsWith('dwor')) {
        return `/images/panoramas/dwor_${locationId.replace('dwor', '').padStart(2, '0')}.jpg`;
      }
      if (locationId.startsWith('ogrod')) {
        return `/images/panoramas/ogrud_${locationId.replace('ogrod', '').padStart(2, '0')}.jpg`;
      }
      return '';
    }).filter(Boolean);

    // Preload nearby images
    if (nearbyImagePaths.length > 0) {
      preloadImages(nearbyImagePaths);
    }
  }, [currentLocationId, locations, preloadImages]);
};