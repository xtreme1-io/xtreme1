import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    // lintOnSave: false,
    server: {
        open: true,
        port: 8000,
        host: 'localhost-tool-pc.alidev.beisai.com',
        proxy: {
            '/api': {
                changeOrigin: true,
                target: 'https://x1-community.alidev.beisai.com/',
            },
        },
    },
    plugins: [vue()],
    alias: [
        { find: 'pc-render', replacement: path.resolve(__dirname, './src/packages/pc-render') },
        { find: 'pc-editor', replacement: path.resolve(__dirname, './src/packages/pc-editor') },
    ],
});
 