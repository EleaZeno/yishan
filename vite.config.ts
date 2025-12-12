import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      rollupOptions: {
        // Externalize deps so they are loaded via importmap (CDN) instead of bundled
        external: ['react', 'react-dom', 'react-dom/client', 'lucide-react', 'recharts', 'clsx'],
      }
    }
  };
});