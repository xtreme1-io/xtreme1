import { useAppProviderContext } from '/@/components/Application';
import { computed, unref } from 'vue';

export function useAppInject() {
  const values = useAppProviderContext();

  return {
    oldGetIsMobile: computed(() => unref(values.isMobile)),
    getIsMobile: computed(() => unref(false)),
  };
}
