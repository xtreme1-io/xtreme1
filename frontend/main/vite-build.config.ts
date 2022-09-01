import { mergeConfig } from 'vite';
import baseConfig from './vite.config';

export default mergeConfig(baseConfig, {
  base: '/pc-tool/',
  build: {
    outDir: '../dist/main',
  },
});
