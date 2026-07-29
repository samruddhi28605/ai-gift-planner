import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import handler from './api/gift-planner';

dotenv.config();

function apiPlugin() {
  return {
    name: 'api-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/gift-planner', async (req: any, res: any) => {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          try {
            if (body) {
              req.body = JSON.parse(body);
            }
          } catch (e) {
            req.body = {};
          }
          return handler(req, res);
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
