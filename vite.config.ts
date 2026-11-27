import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createApiApp } from './apiRouter.js';

function restroAiSyncPlugin(apiKey?: string, groqApiKey?: string): Plugin {
  return {
    name: 'restro-ai-sync-plugin',
    configureServer(server) {
      server.middlewares.use(
        '/api',
        createApiApp({
          geminiApiKey: apiKey,
          groqApiKey,
          rootDir: __dirname,
        })
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true,
    },
    plugins: [react(), restroAiSyncPlugin(env.GEMINI_API_KEY, env.GROQ_API_KEY)],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
