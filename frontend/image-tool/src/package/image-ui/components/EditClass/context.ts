import { AnnotateObject, IAttr, IClassType, ToolType } from '../../../image-editor';
import { provide, inject } from 'vue';

export const context = Symbol('edit-class');
export interface IAttrItem extends IAttr {
  value: any;
}
export interface IState {
  toolType: ToolType;
  classId: string;
  classType: string;
  classList: IClassType[];
  objects: AnnotateObject[];
  attrs: IAttrItem[];
  trackId: string[];
  pointsLimit: number;
  isMultiple: boolean;
  reset: () => void;
}

export function useProvide(state: IState) {
  provide(context, state);
}

export function useInject() {
  return inject(context) as IState;
}
