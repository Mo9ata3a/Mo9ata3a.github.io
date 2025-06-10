import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Mo9ata3a.github.io/', // Remplacez par le nom de votre dépôt
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
