import { mergeConfig } from 'vite';
import baseConfig from './vite.config';

export default mergeConfig(baseConfig, {
  base: '/main/',
  build: {
    outDir: '../dist/main',
  },
});
