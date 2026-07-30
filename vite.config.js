// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    cors: true,
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  build: {
    lib: {
      entry: 'src/fuel-prices-card.ts',
      name: 'FuelPricesCard',
      fileName: 'fuel-prices-card',
      formats: ['es']
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      },
      external: []
    }
  }
});