import { inject, provide } from 'vue';
import { Image2DRenderProxy } from 'pc-render';

export const controlContext = Symbol('image-2d-proxy');

export function useProvideProxy(proxy: Image2DRenderProxy) {
    provide(controlContext, proxy);
}

export default function useInjectProxy() {
    return inject(controlContext) as Image2DRenderProxy;
}
