
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import compression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";
import viteImagemin from "vite-plugin-imagemin";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // PWA Configuration
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Infinite Game Life',
        short_name: 'InfiniteLife',
        description: 'AI-powered application designed to help people visualize the long-term impact of their daily decisions',
        theme_color: '#16161a',
        background_color: '#16161a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['lifestyle', 'productivity', 'education'],
        icons: [
          {
            src: '/lovable-uploads/f3233eb2-372b-4870-b906-f27353494ceb.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/f3233eb2-372b-4870-b906-f27353494ceb.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/f3233eb2-372b-4870-b906-f27353494ceb.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Take Questionnaire',
            short_name: 'Questionnaire',
            description: 'Start the onboarding questionnaire',
            url: '/questionnaire',
            icons: [{ src: '/lovable-uploads/f3233eb2-372b-4870-b906-f27353494ceb.png', sizes: '96x96' }]
          },
          {
            name: 'View Profile',
            short_name: 'Profile',
            description: 'View your life dashboard',
            url: '/profile',
            icons: [{ src: '/lovable-uploads/f3233eb2-372b-4870-b906-f27353494ceb.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.execute-api\..*\.amazonaws\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    }),
    // Image optimization - only in production builds
    mode === 'production' && viteImagemin({
      // PNG optimization
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      // JPEG optimization
      mozjpeg: {
        quality: 85,
        progressive: true,
      },
      // SVG optimization
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false },
        ],
      },
      // WebP conversion for better compression
      webp: {
        quality: 85,
      },
    }),
    // Bundle analyzer - generates stats.html in dist folder
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      compressionOptions: {
        level: 6,
      },
      threshold: 1024,
      filter: /\.(js|mjs|json|css|html|svg)$/i,
      deleteOriginFile: false,
    }),
    // Gzip compression for broader compatibility
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      filter: /\.(js|mjs|json|css|html|svg)$/i,
      deleteOriginFile: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable tree shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
        unused: true,
        dead_code: true,
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // Vendor chunk for React and core libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI library chunk
          ui: [
            '@radix-ui/react-slot',
            '@radix-ui/react-dialog',
            '@radix-ui/react-toast',
            '@radix-ui/react-progress',
            '@radix-ui/react-slider',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ],
          // Query and state management
          query: ['@tanstack/react-query', 'zustand'],
          // Charts (heavy library)
          charts: ['recharts'],
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'chunk'
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        // Optimize asset naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') ?? [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext ?? '')) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext ?? '')) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb as base64
  },
  // Optimize asset serving in development
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
}));
