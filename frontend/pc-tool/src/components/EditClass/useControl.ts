import { inject, provide } from 'vue';
import { IControl } from './type';

export const controlContext = Symbol('edit-class-control');

export function useProvideControl(control: IControl) {
    provide(controlContext, control);
}

export default function useInjectControl() {
    let defaultControl: IControl = {
        needUpdate: () => true,
        close: () => {},
        open: () => {},
    };
    let control = inject(controlContext) as IControl;
    return control || defaultControl;
}
