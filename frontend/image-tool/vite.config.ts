import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    // lintOnSave: false,
    server: {
        // host 127.0.0.1
        host: 'localhost-tool-image.alidev.beisai.com',
        // host: 'localhost-tool-image.alitest.beisai.com',
        // host: 'localhost-tool-image.test.basic.ai',
        // host: 'localhost-tool-image.dev.basic.ai',
        open: true,
        port: 8000,
        proxy: {
            '/api': {
                changeOrigin: true,
                target: 'http://x1-community.alidev.beisai.com',
                // target: 'https://app.alidev.beisai.com',
                // target: 'https://app.alitest.beisai.com',
                // target: 'https://app.test.basic.ai',
                // target: 'https://app.dev.basic.ai',
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
