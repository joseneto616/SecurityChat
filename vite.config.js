import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import inject from '@rollup/plugin-inject';


export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Adicione este alias para usar buffer no navegador
      buffer: 'buffer',
      process: 'process/browser', // Polifill para process
    },
  },
  server: {
    proxy: {
      '/user': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/user/, '/user')
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis', // Define global como globalThis
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        inject({
          global: ['globalThis'], // Injeta global como globalThis
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
  },
});