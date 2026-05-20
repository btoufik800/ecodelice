import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite : http://localhost:5173
// API Node existante : http://localhost:3000 (server.js)
// Toutes les requêtes /api/* sont proxyfiées pour conserver les cookies de session.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Important : forward des cookies/sessions
        cookieDomainRewrite: 'localhost',
      },
    },
  },
});
