import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  // Filter out false values from plugins array
  const plugins = [
    react(),
  ];

  // Add PWA only in production
  // PWA plugin disabled due to vite-plugin-pwa dependency resolution issues
  // if (isProduction) {
  //   plugins.push(
  //     VitePWA({...})
  //   );
  // }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@restart/ui/esm/popper': path.resolve(__dirname, './src/shims/restartUiPopper.js'),
        '@restart/ui/esm/popper.js': path.resolve(__dirname, './src/shims/restartUiPopper.js'),
      },
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDevelopment,
      minify: isProduction ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            ui: ['framer-motion'],
            charts: ['chart.js', 'react-chartjs-2', 'recharts'],
            forms: ['formik', 'yup', 'react-hook-form'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      open: false,
      cors: true,
      strictPort: false,
      hmr: {
        host: 'localhost',
        protocol: 'ws',
        port: 5173,
        clientPort: 5173,
      },
    },
    preview: {
      port: 4173,
      host: '0.0.0.0',
      strictPort: false,
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/auth'],
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
  };
});
