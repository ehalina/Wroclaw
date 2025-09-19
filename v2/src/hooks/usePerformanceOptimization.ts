import { useEffect, useRef, useCallback } from 'react';

interface PerformanceOptions {
  enableRAF?: boolean;
  enableThrottling?: boolean;
  throttleDelay?: number;
  enableMemoryCleanup?: boolean;
}

/**
 * Хук для оптимизации производительности компонентов
 */
export const usePerformanceOptimization = (options: PerformanceOptions = {}) => {
  const {
    enableRAF = true,
    enableThrottling = true,
    throttleDelay = 16, // ~60fps
    enableMemoryCleanup = true,
  } = options;

  const rafRef = useRef<number>();
  const throttleRef = useRef<number>();
  const cleanupFunctions = useRef<Array<() => void>>([]);

  // Throttle function для оптимизации частых вызовов
  const throttle = useCallback((func: Function, delay: number) => {
    return (...args: any[]) => {
      if (throttleRef.current) return;
      
      throttleRef.current = window.setTimeout(() => {
        func(...args);
        throttleRef.current = undefined;
      }, delay);
    };
  }, []);

  // RAF wrapper для анимаций
  const requestAnimationFrameOptimized = useCallback((callback: FrameRequestCallback) => {
    if (!enableRAF) {
      return setTimeout(callback, 16);
    }
    
    return requestAnimationFrame(callback);
  }, [enableRAF]);

  // Memory cleanup
  const addCleanupFunction = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enableMemoryCleanup) {
        cleanupFunctions.current.forEach(cleanup => cleanup());
        cleanupFunctions.current = [];
      }
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, [enableMemoryCleanup]);

  return {
    throttle: (func: Function) => throttle(func, throttleDelay),
    requestAnimationFrame: requestAnimationFrameOptimized,
    addCleanupFunction,
  };
};

/**
 * Хук для оптимизации изображений
 */
export const useImageOptimization = () => {
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const loadingPromises = useRef<Map<string, Promise<HTMLImageElement>>>(new Map());

  const preloadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    // Возвращаем кэшированное изображение если есть
    if (imageCache.current.has(src)) {
      return Promise.resolve(imageCache.current.get(src)!);
    }

    // Возвращаем существующий промис если загрузка уже идет
    if (loadingPromises.current.has(src)) {
      return loadingPromises.current.get(src)!;
    }

    // Создаем новый промис загрузки
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        imageCache.current.set(src, img);
        loadingPromises.current.delete(src);
        resolve(img);
      };
      
      img.onerror = () => {
        loadingPromises.current.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });

    loadingPromises.current.set(src, promise);
    return promise;
  }, []);

  const preloadImages = useCallback(async (srcs: string[]): Promise<HTMLImageElement[]> => {
    const promises = srcs.map(src => preloadImage(src).catch(console.warn));
    const results = await Promise.allSettled(promises);
    return results
      .filter((result): result is PromiseFulfilledResult<HTMLImageElement> => result.status === 'fulfilled')
      .map(result => result.value);
  }, [preloadImage]);

  const clearCache = useCallback(() => {
    imageCache.current.clear();
    loadingPromises.current.clear();
  }, []);

  return {
    preloadImage,
    preloadImages,
    clearCache,
    cacheSize: imageCache.current.size,
  };
};

/**
 * Хук для оптимизации анимаций
 */
export const useAnimationOptimization = () => {
  const animationRefs = useRef<Set<number>>(new Set());

  const animate = useCallback((callback: FrameRequestCallback) => {
    const rafId = requestAnimationFrame((time) => {
      animationRefs.current.delete(rafId);
      callback(time);
    });
    
    animationRefs.current.add(rafId);
    return rafId;
  }, []);

  const cancelAnimation = useCallback((rafId: number) => {
    cancelAnimationFrame(rafId);
    animationRefs.current.delete(rafId);
  }, []);

  const cancelAllAnimations = useCallback(() => {
    animationRefs.current.forEach(rafId => cancelAnimationFrame(rafId));
    animationRefs.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAllAnimations();
    };
  }, [cancelAllAnimations]);

  return {
    animate,
    cancelAnimation,
    cancelAllAnimations,
  };
};

/**
 * Хук для мониторинга производительности
 */
export const usePerformanceMonitor = () => {
  const metrics = useRef({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });

  const measureRender = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      metrics.current.renderCount++;
      metrics.current.lastRenderTime = renderTime;
      metrics.current.averageRenderTime = 
        (metrics.current.averageRenderTime * (metrics.current.renderCount - 1) + renderTime) / metrics.current.renderCount;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          averageRenderTime: `${metrics.current.averageRenderTime.toFixed(2)}ms`,
          renderCount: metrics.current.renderCount,
        });
      }
    };
  }, []);

  const getMetrics = useCallback(() => metrics.current, []);

  return {
    measureRender,
    getMetrics,
  };
};
