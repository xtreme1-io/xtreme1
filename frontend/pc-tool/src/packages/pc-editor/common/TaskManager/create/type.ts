export enum ITaskEnum {
  Init = 'init',
  Create = 'create',
  ROAD_Z = 'road_z',
  ROAD = 'road',
  Reset = 'reset',
  Error = 'error',
}
export interface IMessage {
  msgId: string;
  type: ITaskEnum;
  data: any;
  frameId: string;
}
export interface IMsgHandler {
  resolve: ICallBack;
  reject: ICallBack;
  progress?: ICallBack;
}
export type ICallBack = (args?: any) => void;
