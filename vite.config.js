import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    open: true
  },

  build: {
    target: 'es2020',
    minify: 'esbuild',
    // Using experimental advancedChunks (if you want to try the new syntax)
    experimental: {
      advancedChunks: [
        {
          name: 'vendor',
          test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/
        },
        {
          name: 'react-bootstrap',
          test: /[\\/]node_modules[\\/](react-bootstrap|bootstrap)[\\/]/
        },
        {
          name: 'ui',
          test: /[\\/]node_modules[\\/](aos|react-countup|react-intersection-observer|react-helmet-async)[\\/]/
        }
      ]
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false,
    cssCodeSplit: true,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-bootstrap'],
  },
})