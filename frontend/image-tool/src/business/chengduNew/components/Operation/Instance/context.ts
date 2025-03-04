import { inject, provide, Ref } from 'vue';
import { IContext } from './type';

const context = Symbol('instance-context');

export function useInject() {
    return inject(context) as IContext;
}

export function useProvide(value: IContext) {
    provide(context, value);
}
