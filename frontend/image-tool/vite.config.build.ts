import { mergeConfig } from 'vite';
import baseConfig from './vite.config';

// https://vitejs.dev/config/
export default mergeConfig(baseConfig, {
    base: '/tool/image/',
    build: {
        outDir: '../dist/image-tool',
    },
});
