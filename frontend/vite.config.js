import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  appType: 'spa',
  plugins: [react()],
  server: {
    port: 5173,
    // Optional: proxy API during dev if you prefer same-origin calls
    // proxy: { '/api': { target: 'https://localhost:7288', secure: false } },
  },
});
