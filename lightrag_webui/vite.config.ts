import { defineConfig } from 'vite'
import path from 'path'
// import { webuiPrefix } from './src/lib/constants' // Not needed for Vercel
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// Helper to safely access env vars
function getEnvVar(key: string, defaultValue: any = undefined) {
  return process.env[key] !== undefined ? process.env[key] : defaultValue;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Manual chunking strategy
        manualChunks: {
          // Group React-related libraries into one chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Group graph visualization libraries into one chunk
          'graph-vendor': ['sigma', 'graphology', '@react-sigma/core'],
          // Group UI component libraries into one chunk
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          // Group utility libraries into one chunk
          'utils-vendor': ['axios', 'i18next', 'zustand', 'clsx', 'tailwind-merge'],
          // Separate feature modules
          'feature-graph': ['./src/features/GraphViewer'],
          'feature-documents': ['./src/features/DocumentManager'],
          'feature-retrieval': ['./src/features/RetrievalTesting'],

          // Mermaid-related modules
          'mermaid-vendor': ['mermaid'],

          // Markdown-related modules
          'markdown-vendor': [
            'react-markdown',
            'rehype-react',
            'remark-gfm',
            'remark-math',
            'react-syntax-highlighter'
          ]
        },
        // Ensure consistent chunk naming format
        chunkFileNames: 'assets/[name]-[hash].js',
        // Entry file naming format
        entryFileNames: 'assets/[name]-[hash].js',
        // Asset file naming format
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    proxy: (() => {
      // Try to get from import.meta.env, fallback to process.env
      const VITE_API_PROXY = getEnvVar('VITE_API_PROXY', 'false');
      const VITE_API_ENDPOINTS = getEnvVar('VITE_API_ENDPOINTS', '');
      const VITE_BACKEND_URL = getEnvVar('VITE_BACKEND_URL', 'http://localhost:9621');
      if (VITE_API_PROXY === 'true' && VITE_API_ENDPOINTS) {
        return Object.fromEntries(
          VITE_API_ENDPOINTS.split(',').map((endpoint: string) => [
            endpoint,
            {
              target: VITE_BACKEND_URL,
              changeOrigin: true,
              rewrite: endpoint === '/api'
                ? (path: string) => path.replace(/^\/api/, '')
                : endpoint === '/docs' || endpoint === '/openapi.json'
                  ? (path: string) => path
                  : undefined
            }
          ])
        );
      }
      return {};
    })()
  }
})
