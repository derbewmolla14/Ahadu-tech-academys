import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import packageJson from './package.json';

const appVersion = process.env.npm_package_version || packageJson.version;
const buildDate = new Date().toISOString();

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_BUILD_DATE__: JSON.stringify(buildDate),
    'import.meta.env.VITE_UPDATE_MANIFEST_URL': JSON.stringify(process.env.VITE_UPDATE_MANIFEST_URL || ''),
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://127.0.0.1:5002',
        changeOrigin: true,
      },
    },
  },
});
