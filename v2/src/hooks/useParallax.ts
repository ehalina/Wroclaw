import { useState, useEffect, useCallback, useRef } from 'react';

interface ParallaxOptions {
  intensity?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
  speed?: number;
  enabled?: boolean;
}

interface MousePosition {
  x: number;
  y: number;
}

export const useParallax = (options: ParallaxOptions = {}) => {
  const {
    intensity = 0.5,
    direction = 'both',
    speed = 1,
    enabled = true
  } = options;

  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = ((e.clientX - centerX) / rect.width) * 2;
    const y = ((e.clientY - centerY) / rect.height) * 2;

    setMousePosition({ x, y });
  }, [enabled]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !containerRef.current || e.touches.length === 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const touch = e.touches[0];
    const x = ((touch.clientX - centerX) / rect.width) * 2;
    const y = ((touch.clientY - centerY) / rect.height) * 2;

    setMousePosition({ x, y });
  }, [enabled]);

  const handleTouchEnd = useCallback(() => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  }, []);

  // Smooth animation loop
  useEffect(() => {
    if (!enabled || !isHovering) return;

    const animate = () => {
      // Add subtle continuous movement even when mouse is still
      setMousePosition(prev => ({
        x: prev.x * 0.95, // Gradual decay
        y: prev.y * 0.95
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, isHovering]);

  // Event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleMouseMove, handleMouseEnter, handleMouseLeave, handleTouchMove, handleTouchEnd]);

  // Calculate transform values
  const getTransform = useCallback((layer: number = 0) => {
    if (!enabled || !isHovering) return { x: 0, y: 0 };

    const layerMultiplier = (layer + 1) * 0.1;
    const intensityMultiplier = intensity * speed * layerMultiplier;

    let x = 0;
    let y = 0;

    if (direction === 'horizontal' || direction === 'both') {
      x = mousePosition.x * intensityMultiplier * 50; // 50px max movement
    }

    if (direction === 'vertical' || direction === 'both') {
      y = mousePosition.y * intensityMultiplier * 50; // 50px max movement
    }

    return { x, y };
  }, [enabled, isHovering, mousePosition, intensity, speed, direction]);

  return {
    containerRef,
    mousePosition,
    isHovering,
    getTransform,
    enabled
  };
};
