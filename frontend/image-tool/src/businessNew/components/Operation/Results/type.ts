import { IFrame, ToolType } from 'image-editor';

export interface IItem {
  key: string;
  id: string;
  name: string;
  classType: string;
  classId: string;
  toolType: ToolType | ''; // todo
  visible?: boolean;
  isModel?: boolean;
}
export interface IObjectItem extends IItem {
  trackId: string;
  trackName: string;
  frame?: IFrame;
  attrLabel?: any;
  sizeLabel?: string;
  infoLabel?: string;
  trueValue?: boolean;
}
export interface IClassItem extends IItem {
  data: IObjectItem[];
  alias?: string;
  color: string;
}
export interface IState {
  objectN: number;
  list: IClassItem[];
  updateListFlag: boolean;
  updateSelectFlag: boolean;
  selectMap: Record<string, true>;
  activeClass: string[];
}
export enum IAction {
  edit = 'edit',
  click = 'click',
  toggleVisible = 'toggleVisible',
  delete = 'delete',
}

export interface IHandler {
  onAction: (action: IAction, ...args: any[]) => void;
}
export interface IContext {
  resultState: IState;
  onUpdateList: () => void;
  itemHandler: IHandler;
  classHandler: IHandler;
}
