
import { useEffect } from 'react';

interface PreloadImageOptions {
  priority?: boolean;
  webp?: boolean;
}

export const useImagePreload = (
  sources: string | string[],
  options: PreloadImageOptions = {}
) => {
  useEffect(() => {
    const { priority = false, webp = true } = options;
    const imageSources = Array.isArray(sources) ? sources : [sources];

    imageSources.forEach((src) => {
      // Preload WebP version if supported
      if (webp && 'createImageBitmap' in window) {
        const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
        const webpLink = document.createElement('link');
        webpLink.rel = 'preload';
        webpLink.as = 'image';
        webpLink.href = webpSrc;
        webpLink.type = 'image/webp';
        if (priority) {
          webpLink.setAttribute('fetchpriority', 'high');
        }
        document.head.appendChild(webpLink);
      }

      // Preload original format as fallback
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      if (priority) {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);
    });

    // Cleanup function to remove preload links when component unmounts
    return () => {
      const preloadLinks = document.querySelectorAll(
        `link[rel="preload"][as="image"]`
      );
      preloadLinks.forEach((link) => {
        if (imageSources.some(src => 
          link.getAttribute('href')?.includes(src) ||
          link.getAttribute('href')?.includes(src.replace(/\.(png|jpg|jpeg)$/i, '.webp'))
        )) {
          link.remove();
        }
      });
    };
  }, [sources, options.priority, options.webp]);
};

// Utility function to check WebP support
export const checkWebPSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};
