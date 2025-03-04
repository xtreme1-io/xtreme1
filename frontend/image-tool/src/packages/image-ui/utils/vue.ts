import { onMounted, onBeforeUnmount } from 'vue';

interface IEmitter {
  on(type: string, listener: (...e: any[]) => void): void;
  off(type: string, listener: (...e: any[]) => void): void;
}

export function vueMsg(emitter: IEmitter, msg: string, listener: (...e: any[]) => void) {
  onMounted(() => {
    emitter.on(msg, listener);
  });
  onBeforeUnmount(() => {
    emitter.off(msg, listener);
  });
}
