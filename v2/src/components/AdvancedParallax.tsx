import React, { ReactNode, useRef, useEffect } from 'react';
import { useParallax } from '@/hooks/useParallax';
import { cn } from '@/lib/utils';

interface AdvancedParallaxProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
  speed?: number;
  enabled?: boolean;
  depth?: number;
  layers?: Array<{
    intensity: number;
    speed: number;
    direction: 'horizontal' | 'vertical' | 'both';
    offset?: { x: number; y: number };
  }>;
}

export const AdvancedParallax: React.FC<AdvancedParallaxProps> = ({
  children,
  className,
  intensity = 0.3,
  direction = 'both',
  speed = 1,
  enabled = true,
  depth = 3,
  layers = []
}) => {
  const { containerRef, getTransform, isHovering } = useParallax({
    intensity,
    direction,
    speed,
    enabled
  });

  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Apply parallax to each layer
  useEffect(() => {
    if (!enabled || !isHovering) return;

    layerRefs.current.forEach((layer, index) => {
      if (!layer) return;

      const layerConfig = layers[index] || {
        intensity: intensity * (index + 1) / depth,
        speed: speed * (index + 1) / depth,
        direction,
        offset: { x: 0, y: 0 }
      };

      const baseTransform = getTransform(index);
      const layerTransform = {
        x: baseTransform.x * layerConfig.intensity + (layerConfig.offset?.x || 0),
        y: baseTransform.y * layerConfig.intensity + (layerConfig.offset?.y || 0)
      };

      layer.style.transform = `translate3d(${layerTransform.x}px, ${layerTransform.y}px, 0)`;
    });
  }, [enabled, isHovering, getTransform, intensity, speed, direction, depth, layers]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden",
        "parallax-optimized",
        className
      )}
    >
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          ref={el => layerRefs.current[index] = el}
          className="absolute inset-0 w-full h-full"
          style={{
            zIndex: depth - index,
            transition: enabled && isHovering ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: enabled ? 'transform' : 'auto'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
