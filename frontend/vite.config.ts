import { defineConfig } from 'vite';
/// <reference types="node" />
import react from '@vitejs/plugin-react';


const isDocker = process.env.DOCKER === 'true' || !!process.env.COMPOSE_PROJECT_NAME;;
const backendUrl = isDocker ? 'http://backend:8000' : 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
});