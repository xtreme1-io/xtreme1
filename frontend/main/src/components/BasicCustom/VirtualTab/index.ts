import { withInstall } from '/@/utils';
import virtual from './index.vue';
import { virtualTabEnum } from './typing';

export { virtualTabEnum };
export const VirtualTab = withInstall(virtual);
