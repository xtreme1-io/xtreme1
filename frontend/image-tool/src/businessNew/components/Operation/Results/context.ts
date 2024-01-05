import { inject, provide } from 'vue';
import { IContext } from './type';

const context = Symbol('instance-context');

export function useResultsInject() {
  return inject(context) as IContext;
}

export function useResultsProvide(value: IContext) {
  provide(context, value);
}
