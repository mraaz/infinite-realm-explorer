
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { compression } from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      compressionOptions: {
        level: 6, // Good balance of compression ratio vs build time
      },
      threshold: 1024, // Only compress files larger than 1KB
      filter: /\.(js|mjs|json|css|html|svg)$/i,
      deleteOriginFile: false, // Keep original files for fallback
    }),
    // Optional: Also generate gzip for broader compatibility
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
}));
