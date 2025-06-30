
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  webpSrc?: string;
  className?: string;
  lazy?: boolean;
  priority?: boolean;
  sizes?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  webpSrc,
  className,
  lazy = true,
  priority = false,
  sizes,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Generate WebP source if not provided
  const generatedWebpSrc = webpSrc || src.replace(/\.(png|jpg|jpeg)$/i, '.webp');

  return (
    <picture className={cn('block', className)}>
      {/* WebP source for modern browsers */}
      <source
        srcSet={generatedWebpSrc}
        type="image/webp"
        sizes={sizes}
      />
      
      {/* Fallback to original format */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : lazy ? 'lazy' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          !isLoaded && 'opacity-0',
          isLoaded && 'opacity-100',
          hasError && 'opacity-50'
        )}
        sizes={sizes}
        {...props}
      />
    </picture>
  );
};

// Utility function to generate srcset for responsive images
export const generateSrcSet = (baseSrc: string, widths: number[] = [320, 640, 768, 1024, 1280]) => {
  return widths
    .map(width => {
      const ext = baseSrc.split('.').pop();
      const base = baseSrc.replace(`.${ext}`, '');
      return `${base}-${width}w.${ext} ${width}w`;
    })
    .join(', ');
};

// Utility function to generate sizes attribute
export const generateSizes = (breakpoints: { [key: string]: string } = {}) => {
  const defaultBreakpoints = {
    '(max-width: 320px)': '320px',
    '(max-width: 640px)': '640px',
    '(max-width: 768px)': '768px',
    '(max-width: 1024px)': '1024px',
    ...breakpoints,
  };

  return Object.entries(defaultBreakpoints)
    .map(([media, size]) => `${media} ${size}`)
    .join(', ') + ', 100vw';
};
