import { provide, inject } from 'vue';
import { Editor } from '../../../image-editor';

interface IContext {
  editor: Editor;
  state: IFrameLineState;
}
const context = Symbol('frame-line');

export interface IFrameLineState {
  playSpeed: number;
  playStart: number;
  play: boolean;
  animation: number;
}

export function useProvideFrame(data: IContext) {
  provide(context, data);
}

export function useInjectFrame() {
  return inject(context) as IContext;
}
