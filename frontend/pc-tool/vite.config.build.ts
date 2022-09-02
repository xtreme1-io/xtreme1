import { mergeConfig } from 'vite';
import baseConfig from './vite.config';
import path from 'path';

// https://vitejs.dev/config/
export default mergeConfig(baseConfig, {
    base: '/tool/pc/',
    build: {
        outDir: '../dist/pc-tool',
    },
});
