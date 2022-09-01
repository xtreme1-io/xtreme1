import { mergeConfig } from 'vite';
import baseConfig from './vite.config';

export default mergeConfig(baseConfig, {
  build: {
    outDir: '../dist/main',
  },
});
