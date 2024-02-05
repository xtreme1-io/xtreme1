import { resolve } from 'path';
import { defineConfig, mergeConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
const fs = require('fs');

const localConfig = getLocalConfig();

function pathResolve(dir: string) {
  return resolve(__dirname, dir);
}
const config = defineConfig({
  server: {
    open: true,
    port: 3300,
    proxy: {
      '/api': {
        changeOrigin: true,
        target: 'http://localhost:8190',
      },
    },
  },
  plugins: [vue()],
  resolve: {
    alias: [
      { find: /^\/@\//, replacement: pathResolve('src/') + '/' },
      { find: '@', replacement: pathResolve('src/') + '/' },
      {
        find: /^image-editor/,
        replacement: '/src/package/image-editor',
      },
      {
        find: /^image-ui/,
        replacement: '/src/package/image-ui',
      },
    ],
  },
});

module.exports = mergeConfig(config, localConfig);

function getLocalConfig() {
  let file = pathResolve('./vite.config.local.js');
  let config = {};
  if (fs.existsSync(file)) {
    try {
      config = require(file);
    } catch (e) {}
  }
  return config;
}
