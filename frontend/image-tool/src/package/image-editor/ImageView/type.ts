import Konva from 'konva';
import { IUserData } from '../types';

export type { AnnotateObject, AnnotateClassName } from './shape';

export interface IObjectStatus {
  select?: boolean;
  hover?: boolean;
}

export type CacheName =
  | 'boundRect'
  | 'textPosition'
  | 'expandData'
  | 'curveLength'
  | 'area'
  | 'length';

export interface Vector2 {
  x: number;
  y: number;
  attr?: IUserData;
}

export interface ITransform {
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  width?: number;
  height?: number;
  points?: Vector2[];
  innerPoints?: IPolygonInnerConfig[];
}

export interface IRectOption {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ISideRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
export interface IPolygonInnerConfig {
  points: Vector2[];
}

export interface IShapeConfig extends Konva.ShapeConfig {
  points?: Vector2[];
  innerPoints?: IPolygonInnerConfig[];
  cursor?: string;
  skipStageScale?: boolean;
  skipStateStyle?: boolean;
  textPosIndex?: number;
  selectable?: boolean;
  // Skeleton point
  valid?: boolean;
  // fill
  fillColorRgba?: { r: number; g: number; b: number; a: number };
}
export interface ICircleConfig extends IShapeConfig {
  radius?: number;
  sizeAttenuation?: boolean;
  pointIndex?: number;
  pointType?: number;
}

export interface IStateMap {
  select?: boolean;
  hover?: boolean;
  edit?: boolean;
  [k: string]: any;
}

export interface IPolygonInnerConfig {
  points: Vector2[];
}

export interface IPolygonConfig extends IShapeConfig {
  innerPoints?: IPolygonInnerConfig[];
}

export type ICubicControl = [undefined, Vector2] | [Vector2, Vector2] | [Vector2, undefined];
