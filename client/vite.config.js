// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        warn(warning)
      },
      output: {
        manualChunks: {
          mui: ['@mui/material', '@mui/icons-material'],
          framer: ['framer-motion'],
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  },
  css: {
    devSourcemap: true
  }
})