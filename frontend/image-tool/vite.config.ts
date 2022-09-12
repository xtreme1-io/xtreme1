import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
    server: {
        host: 'localhost-tool-image.alidev.beisai.com',
        open: true,
        port: 8000,
        proxy: {
            '/api': {
                changeOrigin: true,
                target: 'http://x1-community.alidev.beisai.com',
            },
        },
    },
    plugins: [vue()],
    alias: [
        // { find: 'pc-render', replacement: path.resolve(__dirname, './src/package/pc-render') },
        // { find: 'pc-editor', replacement: path.resolve(__dirname, './src/package/pc-editor') },
        { find: 'editor', replacement: path.resolve(__dirname, './src/editor') },
        { find: 'business', replacement: path.resolve(__dirname, './src/business/chengdu') },
        { find: /^editor/, replacement: path.resolve(__dirname, './src/editor') },
        { find: /^\/@\//, replacement: path.resolve(__dirname, './src/') + '/' },
    ],
});
