import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Remplacez par le nom de votre d�p�t
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
