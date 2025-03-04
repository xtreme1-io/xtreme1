import { LogOpEnum } from '@basicai/tool-components';
import { SourceType } from '../../../type';
import { AttrTypeEnum, AnnotateObject, ToolType, IFrame } from 'image-editor';

export interface IItem {
  id: string;
  name: string;
  classType: string;
  classId: string;
  trackId: string;
  data: IItem[];
  icon: string;
  color: string;
  toolType: ToolType | ''; // todo
  hasObject?: boolean;
  frame?: IFrame;
  _log_op?: LogOpEnum;
  _deleted?: boolean;

  visible?: boolean;
  attrLabel?: any;
  sizeLabel?: string;
  infoLabel?: string;
  isModel?: boolean;
  trueValue?: boolean;
}
export type IItemAttrs = string[] | string[][];

// export interface IInstanceList {
//     isModel: boolean;
//     classType: string;
//     data: IItem[];
//     color: string;
//     // bgColor: string;
//     // 视图，在列表中显示，不在视图上显示
//     visible: boolean;
//     annotateType: string;
//     // 过滤，不在列表中显示，不在视图上显示
//     filterVisible: boolean;
// }

export interface IClass {
  key: string;
  id: string;
  name: string;
  alias: string;
  classType: string;
  isModel: boolean;
  data: IItem[];
  icon: string;
  color: string;
  visible?: boolean;
  // bgColor: string;
  // active: string[];
}

export interface IClassify {
  key: string;
  name: string;
  visible: boolean;
  data: IClass[];
  objectN: number;
  // active: string[];
  activeClass: string[];
  sourceId: string;
  sourceType: SourceType;
}

export interface ISourceObject {
  key: string;
  name: string;
  // visible: boolean;
  classData: IClass[];
  layerData: IItem[];
  layerActive: string[];
  objectN: number;
  // active: string[];
  activeClass: string[];
  sourceId: string;
  sourceType: SourceType;
}

export interface IState {
  // activeKey: string[];
  selectMap: Record<string, true>;
  objectN: number;
  list: IClass[];
  currentList: ISourceObject;
  sourceMap: Record<string, ISourceObject>;
  updateMap: Record<string, AnnotateObject>;
  trackMap: Record<string, IItem>;
  // filter
  // filterActive: string[];
  // flag
  updateListFlag: boolean;
  updateDataFlag: boolean;
  updateSelectFlag: boolean;
  updateStatisticFlag: boolean;
  //
  // objectMap: Record<string, AnnotateObject>;
  listMode: 'layer' | 'list';
}

export interface IAttrItem {
  id: string;
  type: AttrTypeEnum;
  name: string;
  options: { value: any; label: string }[];
  value: any;
}
export interface IFilterState {
  filterValue: FilterEnum[];
  allFilter: FilterEnum[];
  userFilter: FilterEnum[];
  modelFilter: FilterEnum[];
  lastNoClassList: any[];
  lastHasClassList: any[];
  allVisible: boolean;
}
export enum FilterEnum {
  class = 'Class',
  noClass = 'NoClass',
  predictedClass = 'PredictedClass',
  noPredictedClass = 'NoPredictedClass',
}

export interface IContext {
  // container: Ref<HTMLDivElement>;
  state: IState;
  onUpdateList: () => void;
  itemHandler: IHandler;
  classHandler: IHandler;
  groupHandler: IHandler;
  trackHandler: IHandler;
}

export interface IHandler {
  onAction: (action: IAction, ...args: any[]) => void;
}

export enum Event {
  SHOW_INSTANCE_MENU = 'show_instance_menu',
  HIDE_INSTANCE_MENU = 'hide_instance_menu',
}

export type IAction =
  | 'click'
  | 'toggleVisible'
  | 'annotation'
  | 'edit'
  | 'delete'
  | 'ungroup'
  | 'add';
