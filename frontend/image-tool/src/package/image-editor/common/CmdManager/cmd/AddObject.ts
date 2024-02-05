import CmdBase from '../CmdBase';
import type { ICmdOption } from './index';
import { AnnotateObject, IFrame } from '../../../types';
import Konva from 'konva';

export interface IAddObjectItem {
  group?: Konva.Group;
  objects: AnnotateObject | AnnotateObject[];
  frame?: IFrame;
}

export type IAddObjectOption = IAddObjectItem[] | AnnotateObject | AnnotateObject[];

export default class AddObject extends CmdBase<ICmdOption['add-object'], any> {
  name: string = 'add-object';
  redo(): void {
    const editor = this.editor;
    const frame = editor.getCurrentFrame();

    if (!Array.isArray(this.data) || !(this.data[0] as any).objects) {
      const objects = Array.isArray(this.data) ? this.data : [this.data];
      const data: IAddObjectItem[] = [{ objects: objects as AnnotateObject[] }];
      this.data = data;
    }

    const datas = this.data as IAddObjectItem[];

    datas.forEach((data) => {
      if (!data.frame) data.frame = frame;
      editor.dataManager.addAnnotates(data.objects, data.frame);
    });
  }
  undo(): void {
    const editor = this.editor;

    const datas = this.data as IAddObjectItem[];

    datas.forEach((data) => {
      editor.dataManager.removeAnnotates(data.objects, data.frame);
    });
  }
}
