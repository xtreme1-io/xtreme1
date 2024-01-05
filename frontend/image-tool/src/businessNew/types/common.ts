import { SourceType, ToolType, Vector2 } from 'image-editor';

export interface IDoing {
  // flow
  saving: boolean;
  marking: boolean;
  skip: boolean;
  submitting: boolean;
  modify: boolean;
}
export interface IObjectBasicInfo {
  classAttributes: IObject;
  classId: number;
  frontId: string;
  id: string | number;
  sourceId: number;
  sourceType?: SourceType;
}
export interface IObjectInfo extends IObjectBasicInfo {
  dataId: number;
  datasetId: number;
  lockedBy: any;
  objectCount: number;
}
export interface IObject {
  backId: string | number;
  classId: string;
  classValues: any;
  contour: IContour; // { points: [], ... }
  id: string;
  meta: any; // other
  sourceId: string;
  sourceType?: SourceType;
  trackId?: string;
  trackName?: string;
  type: ToolType;

  modelConfidence?: number;
  modelClass?: string;
  version?: number;
  createdAt?: string;
  createdBy?: string | number;
}
export interface IDataAnnotations {
  classificationId: string;
  classificationAttributes: Record<string, any>;
}
export interface ISaveFormat {
  dataAnnotations: IDataAnnotations[];
  dataId: string | number;
  objects: IObjectBasicInfo[];
  [key: string]: any;
}
export interface ISaveResp {
  dataId: string | number;
  frontId: string;
  id: string | number;
}

export interface IContour {
  points?: Vector2[];
  interior?: { points: Vector2[] }[]; // only polygon
  rotation?: number; // only rect;
  area?: number; // closed figure: rect, polygon
}
