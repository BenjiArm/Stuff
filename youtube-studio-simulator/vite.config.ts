import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the production build can be opened from any static host or sub-folder.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
  },
});
