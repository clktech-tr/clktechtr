import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            '@tanstack/react-query'
          ],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-label'
          ],
          i18n: [
            'i18next',
            'react-i18next'
          ]
        }
      }
    }
  },
  optimizeDeps: {
    include: ['i18next', 'react-i18next', '@radix-ui/react-dialog', '@radix-ui/react-select']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, '../attached_assets'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  }
})
