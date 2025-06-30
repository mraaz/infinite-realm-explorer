
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  getOptimizedImageUrl, 
  generateResponsiveSrcSet, 
  generateSizesAttribute,
  trackImagePerformance,
  createLazyLoadObserver
} from '@/utils/imageOptimization';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  webp?: boolean;
  responsive?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  priority = false,
  quality = 85,
  sizes,
  className,
  loading = 'lazy',
  webp = true,
  responsive = true,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const startTime = useRef<number>(performance.now());

  useEffect(() => {
    if (!priority || loading === 'eager') return;

    const observer = createLazyLoadObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    trackImagePerformance(src, startTime.current);
  };

  const handleError = () => {
    setError(true);
  };

  const optimizedSrc = getOptimizedImageUrl(src, { quality, format: webp ? 'webp' : 'jpeg' });
  const responsiveSrcSet = responsive ? generateResponsiveSrcSet(src) : undefined;
  const responsiveSizes = sizes || (responsive ? generateSizesAttribute() : undefined);

  // For lazy loading with intersection observer
  const shouldUseLazyLoading = loading === 'lazy' && !priority;

  if (webp && responsive) {
    return (
      <picture className={cn('block', className)}>
        <source
          srcSet={generateResponsiveSrcSet(src)}
          sizes={responsiveSizes}
          type="image/webp"
        />
        <img
          ref={imgRef}
          src={shouldUseLazyLoading ? undefined : optimizedSrc}
          data-src={shouldUseLazyLoading ? optimizedSrc : undefined}
          srcSet={!shouldUseLazyLoading ? responsiveSrcSet : undefined}
          sizes={!shouldUseLazyLoading ? responsiveSizes : undefined}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            error && 'opacity-50'
          )}
          {...props}
        />
      </picture>
    );
  }

  return (
    <img
      ref={imgRef}
      src={shouldUseLazyLoading ? undefined : optimizedSrc}
      data-src={shouldUseLazyLoading ? optimizedSrc : undefined}
      srcSet={!shouldUseLazyLoading ? responsiveSrcSet : undefined}
      sizes={!shouldUseLazyLoading ? responsiveSizes : undefined}
      alt={alt}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        error && 'opacity-50',
        className
      )}
      {...props}
    />
  );
};
