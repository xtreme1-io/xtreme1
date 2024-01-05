import { LoadStatus } from 'image-editor';
import { IObject } from '../types';

export enum Api {
  API = '/api',
  DATA = '/api/data',
  ANNOTATION = '/api/annotate',
}
/** Model Result */
export interface IModelResult {
  recordId: string;
  id: string;
  version: string;
  state?: LoadStatus;
}
/** dataflow annotations request */
export interface DataflowAnnotationParamsReq {
  dataIds: Array<string | number>;
}
/** dataflow annotations response */
export interface DataflowAnnotationParamsRsp {
  classificationValues: any[];
  dataId: string;
  objects: IObject[];
}
export interface IFileConfig {
  deviceName: string;
  name: string;
  size: number;
  url: string;
}
