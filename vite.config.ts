import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: true,
    force: true,
    proxy: {
      // Proxy API requests to the backend server (development only)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // Remove the rewrite - we want to keep the /api prefix
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Build configuration for production
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
        },
      },
    },
  },
  // Environment variable handling
  define: {
    __DEV__: mode === 'development',
  },
}));
