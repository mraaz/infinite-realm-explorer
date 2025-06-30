
// Utility functions for image optimization and handling

interface ImageOptimizationConfig {
  quality: number;
  format: 'webp' | 'jpeg' | 'png';
  sizes: number[];
}

export const defaultImageConfig: ImageOptimizationConfig = {
  quality: 85,
  format: 'webp',
  sizes: [320, 640, 768, 1024, 1280, 1920],
};

// Generate optimized image URLs based on the source
export const getOptimizedImageUrl = (
  src: string,
  options: Partial<ImageOptimizationConfig> = {}
): string => {
  const config = { ...defaultImageConfig, ...options };
  
  // In production, return the optimized version
  if (import.meta.env.PROD) {
    const ext = src.split('.').pop()?.toLowerCase();
    const basePath = src.replace(/\.[^/.]+$/, '');
    
    // Return WebP version if requested and original is PNG/JPEG
    if (config.format === 'webp' && ['png', 'jpg', 'jpeg'].includes(ext || '')) {
      return `${basePath}.webp`;
    }
  }
  
  return src;
};

// Generate responsive image srcset
export const generateResponsiveSrcSet = (
  src: string,
  sizes: number[] = defaultImageConfig.sizes
): string => {
  return sizes
    .map(size => {
      const optimizedSrc = getOptimizedImageUrl(src);
      const ext = optimizedSrc.split('.').pop();
      const basePath = optimizedSrc.replace(/\.[^/.]+$/, '');
      return `${basePath}-${size}w.${ext} ${size}w`;
    })
    .join(', ');
};

// Generate sizes attribute for responsive images
export const generateSizesAttribute = (
  breakpoints: Record<string, string> = {}
): string => {
  const defaultBreakpoints = {
    '(max-width: 320px)': '280px',
    '(max-width: 640px)': '600px',
    '(max-width: 768px)': '728px',
    '(max-width: 1024px)': '984px',
    '(max-width: 1280px)': '1240px',
    ...breakpoints,
  };

  const sizesArray = Object.entries(defaultBreakpoints)
    .map(([media, size]) => `${media} ${size}`);
  
  sizesArray.push('100vw'); // Default fallback
  
  return sizesArray.join(', ');
};

// Lazy loading intersection observer setup
export const createLazyLoadObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Image performance metrics
export const trackImagePerformance = (src: string, startTime: number) => {
  const loadTime = performance.now() - startTime;
  
  // Log performance metrics in development
  if (import.meta.env.DEV) {
    console.log(`Image loaded: ${src} in ${loadTime.toFixed(2)}ms`);
  }
  
  // In production, you could send this to analytics
  if (import.meta.env.PROD && 'sendBeacon' in navigator) {
    // Example: send to analytics service
    // navigator.sendBeacon('/api/metrics', JSON.stringify({
    //   type: 'image-load',
    //   src,
    //   loadTime,
    //   timestamp: Date.now()
    // }));
  }
};
