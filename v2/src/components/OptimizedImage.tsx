import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean; // For above-the-fold images
  placeholder?: string; // Base64 or small placeholder image
  sizes?: string; // Responsive sizes
  quality?: number; // Image quality (for future WebP conversion)
  loading?: 'lazy' | 'eager';
  draggable?: boolean;
  style?: React.CSSProperties;
}

interface ImageState {
  loaded: boolean;
  error: boolean;
  inView: boolean;
  currentSrc: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  onLoad,
  onError,
  priority = false,
  placeholder,
  sizes,
  quality = 80,
  loading = 'lazy',
  draggable = false,
  style,
}) => {
  const [state, setState] = useState<ImageState>({
    loaded: false,
    error: false,
    inView: false,
    currentSrc: placeholder || '',
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Generate optimized image sources
  const getOptimizedSrc = useCallback((originalSrc: string, format?: 'webp' | 'avif') => {
    // For now, return original src. Later we can add WebP conversion logic
    if (format === 'webp') {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, `.webp`);
    }
    if (format === 'avif') {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, `.avif`);
    }
    return originalSrc;
  }, []);

  // Create responsive image sources
  const createSrcSet = useCallback((baseSrc: string) => {
    const sizes = [0.5, 1, 1.5, 2]; // Different pixel densities
    return sizes
      .map(scale => `${baseSrc} ${scale}x`)
      .join(', ');
  }, []);

  // Handle image loading
  const handleImageLoad = useCallback(() => {
    setState(prev => ({ ...prev, loaded: true, error: false }));
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleImageError = useCallback(() => {
    setState(prev => ({ ...prev, error: true, loaded: false }));
    onError?.();
  }, [onError]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setState(prev => ({ ...prev, inView: true, currentSrc: src }));
      return;
    }

    const currentImg = imgRef.current;
    if (!currentImg) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !state.inView) {
            setState(prev => ({
              ...prev,
              inView: true,
              currentSrc: src
            }));
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Load images 50px before they come into view
        threshold: 0.1
      }
    );

    observerRef.current.observe(currentImg);

    return () => {
      if (observerRef.current && currentImg) {
        observerRef.current.unobserve(currentImg);
      }
    };
  }, [src, priority, loading, state.inView]);

  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      if (sizes) link.setAttribute('imagesizes', sizes);
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src, sizes]);

  return (
    <div className={cn('relative overflow-hidden', className)} style={style}>
      {/* Placeholder or loading state */}
      {(!state.loaded && !state.error) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 animate-pulse">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {state.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white/60 text-sm">
          <div className="text-center">
            <div className="mb-2">⚠️</div>
            <div>Failed to load image</div>
          </div>
        </div>
      )}

      {/* Main image with modern format support */}
      <picture>
        {/* WebP format for supported browsers */}
        <source
          srcSet={state.inView ? getOptimizedSrc(src, 'webp') : undefined}
          type="image/webp"
          sizes={sizes}
        />

        {/* AVIF format for supported browsers */}
        <source
          srcSet={state.inView ? getOptimizedSrc(src, 'avif') : undefined}
          type="image/avif"
          sizes={sizes}
        />

        {/* Fallback to original format */}
        <img
          ref={imgRef}
          src={state.currentSrc || src}
          srcSet={state.inView ? createSrcSet(src) : undefined}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={loading}
          draggable={draggable}
          sizes={sizes}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            state.loaded ? 'opacity-100' : 'opacity-0',
            state.error && 'opacity-50'
          )}
          style={{
            imageRendering: quality < 50 ? 'pixelated' : 'auto',
          }}
        />
      </picture>

      {/* Loading shimmer effect */}
      {!state.loaded && !state.error && (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      )}
    </div>
  );
};

// Hook for image preloading
export const useImagePreloader = () => {
  const preloadedImages = useRef(new Set<string>());

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.current.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        preloadedImages.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(async (srcs: string[]) => {
    try {
      await Promise.all(srcs.map(preloadImage));
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }, [preloadImage]);

  return { preloadImage, preloadImages, preloadedImages: preloadedImages.current };
};

// Cache management
export const imageCache = {
  cache: new Map<string, HTMLImageElement>(),

  get(src: string): HTMLImageElement | null {
    return this.cache.get(src) || null;
  },

  set(src: string, img: HTMLImageElement): void {
    // Limit cache size to prevent memory issues
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(src, img);
  },

  preload(src: string): Promise<HTMLImageElement> {
    const cached = this.get(src);
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  },

  clear(): void {
    this.cache.clear();
  }
};