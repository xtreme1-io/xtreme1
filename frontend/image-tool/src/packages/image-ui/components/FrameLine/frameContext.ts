import { provide, inject } from 'vue';
import { Editor } from '../../../image-editor';

interface IContext {
  editor: Editor;
  t: (name: string, args?: Record<string, any>) => string;
  state: IFrameLineState;
}
const context = Symbol('frame-line');

// 连续帧 数据
export interface IFrameLineState {
  // play
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
