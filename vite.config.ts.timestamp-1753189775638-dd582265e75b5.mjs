// vite.config.ts
import { defineConfig } from "file:///C:/Users/Raaz/Documents/GitHub/infinite-realm-explorer/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Raaz/Documents/GitHub/infinite-realm-explorer/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/Raaz/Documents/GitHub/infinite-realm-explorer/node_modules/lovable-tagger/dist/index.js";
import compression from "file:///C:/Users/Raaz/Documents/GitHub/infinite-realm-explorer/node_modules/vite-plugin-compression/dist/index.mjs";
import { visualizer } from "file:///C:/Users/Raaz/Documents/GitHub/infinite-realm-explorer/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import viteImagemin from "file:///C:/Users/Raaz/Documents/GitHub/infinite-realm-explorer/node_modules/vite-plugin-imagemin/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\Raaz\\Documents\\GitHub\\infinite-realm-explorer";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Image optimization - only in production builds
    mode === "production" && viteImagemin({
      // PNG optimization
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4
      },
      // JPEG optimization
      mozjpeg: {
        quality: 85,
        progressive: true
      },
      // SVG optimization
      svgo: {
        plugins: [
          { name: "removeViewBox", active: false },
          { name: "removeEmptyAttrs", active: false }
        ]
      },
      // WebP conversion for better compression
      webp: {
        quality: 85
      }
    }),
    // Bundle analyzer - generates stats.html in dist folder
    visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true
    }),
    // Brotli compression
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
      compressionOptions: {
        level: 6
      },
      threshold: 1024,
      filter: /\.(js|mjs|json|css|html|svg)$/i,
      deleteOriginFile: false
    }),
    // Gzip compression for broader compatibility
    compression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024,
      filter: /\.(js|mjs|json|css|html|svg)$/i,
      deleteOriginFile: false
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    // Enable tree shaking
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log"],
        unused: true,
        dead_code: true
      },
      mangle: {
        safari10: true
      }
    },
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // Vendor chunk for React and core libraries
          vendor: ["react", "react-dom", "react-router-dom"],
          // UI library chunk
          ui: [
            "@radix-ui/react-slot",
            "@radix-ui/react-dialog",
            "@radix-ui/react-toast",
            "@radix-ui/react-progress",
            "@radix-ui/react-slider",
            "class-variance-authority",
            "clsx",
            "tailwind-merge"
          ],
          // Query and state management
          query: ["@tanstack/react-query", "zustand"],
          // Charts (heavy library)
          charts: ["recharts"]
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split("/").pop()?.replace(/\.[^/.]+$/, "") || "chunk" : "chunk";
          return `js/${facadeModuleId}-[hash].js`;
        },
        // Optimize asset naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") ?? [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext ?? "")) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext ?? "")) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1e3,
    // Optimize asset handling
    assetsInlineLimit: 4096
    // Inline assets smaller than 4kb as base64
  },
  // Optimize asset serving in development
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg", "**/*.webp"]
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxSYWF6XFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcaW5maW5pdGUtcmVhbG0tZXhwbG9yZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFJhYXpcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFxpbmZpbml0ZS1yZWFsbS1leHBsb3JlclxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvUmFhei9Eb2N1bWVudHMvR2l0SHViL2luZmluaXRlLXJlYWxtLWV4cGxvcmVyL3ZpdGUuY29uZmlnLnRzXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xyXG5pbXBvcnQgY29tcHJlc3Npb24gZnJvbSBcInZpdGUtcGx1Z2luLWNvbXByZXNzaW9uXCI7XHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XHJcbmltcG9ydCB2aXRlSW1hZ2VtaW4gZnJvbSBcInZpdGUtcGx1Z2luLWltYWdlbWluXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gICAgLy8gSW1hZ2Ugb3B0aW1pemF0aW9uIC0gb25seSBpbiBwcm9kdWN0aW9uIGJ1aWxkc1xyXG4gICAgbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nICYmIHZpdGVJbWFnZW1pbih7XHJcbiAgICAgIC8vIFBORyBvcHRpbWl6YXRpb25cclxuICAgICAgcG5ncXVhbnQ6IHtcclxuICAgICAgICBxdWFsaXR5OiBbMC44LCAwLjldLFxyXG4gICAgICAgIHNwZWVkOiA0LFxyXG4gICAgICB9LFxyXG4gICAgICAvLyBKUEVHIG9wdGltaXphdGlvblxyXG4gICAgICBtb3pqcGVnOiB7XHJcbiAgICAgICAgcXVhbGl0eTogODUsXHJcbiAgICAgICAgcHJvZ3Jlc3NpdmU6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIFNWRyBvcHRpbWl6YXRpb25cclxuICAgICAgc3Znbzoge1xyXG4gICAgICAgIHBsdWdpbnM6IFtcclxuICAgICAgICAgIHsgbmFtZTogJ3JlbW92ZVZpZXdCb3gnLCBhY3RpdmU6IGZhbHNlIH0sXHJcbiAgICAgICAgICB7IG5hbWU6ICdyZW1vdmVFbXB0eUF0dHJzJywgYWN0aXZlOiBmYWxzZSB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIFdlYlAgY29udmVyc2lvbiBmb3IgYmV0dGVyIGNvbXByZXNzaW9uXHJcbiAgICAgIHdlYnA6IHtcclxuICAgICAgICBxdWFsaXR5OiA4NSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gICAgLy8gQnVuZGxlIGFuYWx5emVyIC0gZ2VuZXJhdGVzIHN0YXRzLmh0bWwgaW4gZGlzdCBmb2xkZXJcclxuICAgIHZpc3VhbGl6ZXIoe1xyXG4gICAgICBmaWxlbmFtZTogJ2Rpc3Qvc3RhdHMuaHRtbCcsXHJcbiAgICAgIG9wZW46IGZhbHNlLFxyXG4gICAgICBnemlwU2l6ZTogdHJ1ZSxcclxuICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcclxuICAgIH0pLFxyXG4gICAgLy8gQnJvdGxpIGNvbXByZXNzaW9uXHJcbiAgICBjb21wcmVzc2lvbih7XHJcbiAgICAgIGFsZ29yaXRobTogJ2Jyb3RsaUNvbXByZXNzJyxcclxuICAgICAgZXh0OiAnLmJyJyxcclxuICAgICAgY29tcHJlc3Npb25PcHRpb25zOiB7XHJcbiAgICAgICAgbGV2ZWw6IDYsXHJcbiAgICAgIH0sXHJcbiAgICAgIHRocmVzaG9sZDogMTAyNCxcclxuICAgICAgZmlsdGVyOiAvXFwuKGpzfG1qc3xqc29ufGNzc3xodG1sfHN2ZykkL2ksXHJcbiAgICAgIGRlbGV0ZU9yaWdpbkZpbGU6IGZhbHNlLFxyXG4gICAgfSksXHJcbiAgICAvLyBHemlwIGNvbXByZXNzaW9uIGZvciBicm9hZGVyIGNvbXBhdGliaWxpdHlcclxuICAgIGNvbXByZXNzaW9uKHtcclxuICAgICAgYWxnb3JpdGhtOiAnZ3ppcCcsXHJcbiAgICAgIGV4dDogJy5neicsXHJcbiAgICAgIHRocmVzaG9sZDogMTAyNCxcclxuICAgICAgZmlsdGVyOiAvXFwuKGpzfG1qc3xqc29ufGNzc3xodG1sfHN2ZykkL2ksXHJcbiAgICAgIGRlbGV0ZU9yaWdpbkZpbGU6IGZhbHNlLFxyXG4gICAgfSksXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIC8vIEVuYWJsZSB0cmVlIHNoYWtpbmdcclxuICAgIG1pbmlmeTogJ3RlcnNlcicsXHJcbiAgICB0ZXJzZXJPcHRpb25zOiB7XHJcbiAgICAgIGNvbXByZXNzOiB7XHJcbiAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLFxyXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXHJcbiAgICAgICAgcHVyZV9mdW5jczogWydjb25zb2xlLmxvZyddLFxyXG4gICAgICAgIHVudXNlZDogdHJ1ZSxcclxuICAgICAgICBkZWFkX2NvZGU6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIG1hbmdsZToge1xyXG4gICAgICAgIHNhZmFyaTEwOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgLy8gTWFudWFsIGNodW5raW5nIGZvciBiZXR0ZXIgY2FjaGluZ1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgLy8gVmVuZG9yIGNodW5rIGZvciBSZWFjdCBhbmQgY29yZSBsaWJyYXJpZXNcclxuICAgICAgICAgIHZlbmRvcjogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxyXG4gICAgICAgICAgLy8gVUkgbGlicmFyeSBjaHVua1xyXG4gICAgICAgICAgdWk6IFtcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1zbG90JyxcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1kaWFsb2cnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXRvYXN0JyxcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1wcm9ncmVzcycsXHJcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3Qtc2xpZGVyJyxcclxuICAgICAgICAgICAgJ2NsYXNzLXZhcmlhbmNlLWF1dGhvcml0eScsXHJcbiAgICAgICAgICAgICdjbHN4JyxcclxuICAgICAgICAgICAgJ3RhaWx3aW5kLW1lcmdlJ1xyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIC8vIFF1ZXJ5IGFuZCBzdGF0ZSBtYW5hZ2VtZW50XHJcbiAgICAgICAgICBxdWVyeTogWydAdGFuc3RhY2svcmVhY3QtcXVlcnknLCAnenVzdGFuZCddLFxyXG4gICAgICAgICAgLy8gQ2hhcnRzIChoZWF2eSBsaWJyYXJ5KVxyXG4gICAgICAgICAgY2hhcnRzOiBbJ3JlY2hhcnRzJ10sXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyBPcHRpbWl6ZSBjaHVuayBuYW1pbmdcclxuICAgICAgICBjaHVua0ZpbGVOYW1lczogKGNodW5rSW5mbykgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZmFjYWRlTW9kdWxlSWQgPSBjaHVua0luZm8uZmFjYWRlTW9kdWxlSWRcclxuICAgICAgICAgICAgPyBjaHVua0luZm8uZmFjYWRlTW9kdWxlSWQuc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSB8fCAnY2h1bmsnXHJcbiAgICAgICAgICAgIDogJ2NodW5rJztcclxuICAgICAgICAgIHJldHVybiBganMvJHtmYWNhZGVNb2R1bGVJZH0tW2hhc2hdLmpzYDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIE9wdGltaXplIGFzc2V0IG5hbWluZyBmb3IgYmV0dGVyIGNhY2hpbmdcclxuICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbykgPT4ge1xyXG4gICAgICAgICAgY29uc3QgaW5mbyA9IGFzc2V0SW5mby5uYW1lPy5zcGxpdCgnLicpID8/IFtdO1xyXG4gICAgICAgICAgY29uc3QgZXh0ID0gaW5mb1tpbmZvLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgaWYgKC9wbmd8anBlP2d8c3ZnfGdpZnx0aWZmfGJtcHxpY28vaS50ZXN0KGV4dCA/PyAnJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGBpbWFnZXMvW25hbWVdLVtoYXNoXVtleHRuYW1lXWA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoL2Nzcy9pLnRlc3QoZXh0ID8/ICcnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYGNzcy9bbmFtZV0tW2hhc2hdW2V4dG5hbWVdYDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBgYXNzZXRzL1tuYW1lXS1baGFzaF1bZXh0bmFtZV1gO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgLy8gSW5jcmVhc2UgY2h1bmsgc2l6ZSB3YXJuaW5nIGxpbWl0XHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXHJcbiAgICAvLyBPcHRpbWl6ZSBhc3NldCBoYW5kbGluZ1xyXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDQwOTYsIC8vIElubGluZSBhc3NldHMgc21hbGxlciB0aGFuIDRrYiBhcyBiYXNlNjRcclxuICB9LFxyXG4gIC8vIE9wdGltaXplIGFzc2V0IHNlcnZpbmcgaW4gZGV2ZWxvcG1lbnRcclxuICBhc3NldHNJbmNsdWRlOiBbJyoqLyoucG5nJywgJyoqLyouanBnJywgJyoqLyouanBlZycsICcqKi8qLmdpZicsICcqKi8qLnN2ZycsICcqKi8qLndlYnAnXSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUNoQyxPQUFPLGlCQUFpQjtBQUN4QixTQUFTLGtCQUFrQjtBQUMzQixPQUFPLGtCQUFrQjtBQVB6QixJQUFNLG1DQUFtQztBQVV6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQTtBQUFBLElBRTFDLFNBQVMsZ0JBQWdCLGFBQWE7QUFBQTtBQUFBLE1BRXBDLFVBQVU7QUFBQSxRQUNSLFNBQVMsQ0FBQyxLQUFLLEdBQUc7QUFBQSxRQUNsQixPQUFPO0FBQUEsTUFDVDtBQUFBO0FBQUEsTUFFQSxTQUFTO0FBQUEsUUFD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
