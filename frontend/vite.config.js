import react from 'react';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom'],
    },
  },
});