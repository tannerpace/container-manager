import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for Electron compatibility
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
    cssMinify: 'esbuild', // Use esbuild for CSS minification (but configured to be less aggressive)
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          react: ['react', 'react-dom'],
          xterm: ['@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-web-links'],
          utils: ['axios', 'lucide-react']
        }
      }
    }
  },
  css: {
    devSourcemap: true,
    postcss: {
      plugins: []
    }
  },
  esbuild: {
    legalComments: 'none',
    minifyIdentifiers: false, // Disable identifier minification to preserve CSS variables
    minifySyntax: true,
    minifyWhitespace: true,
    target: 'es2020'
  }
})
