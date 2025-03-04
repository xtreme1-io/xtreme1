import ShapeTool, { ToolEvent } from './ShapeTool';
import LineTool from './LineTool';
import RectTool from './RectTool';
import PolygonTool from './PolygonTool';
import CubicCurveTool from './CubicCurveTool';
import SplineCurveTool from './SplineCurveTool';
import KeyPointTool from './KeyPointTool';
import SkeletonTool from './SkeletonTool';
import CuboidTool from './CuboidTool';
import BrushTool from './MaskTool/BrushTool';
import MaskPolyTool from './MaskTool/MaskPolyTool';
import CircleTool from './CircleTool';
import EllipseTool from './EllipseTool';
import MaskFillTool from './MaskTool/MaskFillTool';

export {
  ShapeTool,
  LineTool,
  RectTool,
  PolygonTool,
  KeyPointTool,
  CubicCurveTool,
  SplineCurveTool,
  SkeletonTool,
  CuboidTool,
  BrushTool,
  MaskPolyTool,
  CircleTool,
  EllipseTool,
  MaskFillTool,
};

export type ShapeToolCtr = new (...args: any) => ShapeTool;

export const toolMap = {
  line: LineTool,
  rect: RectTool,
  'shape-circle': CircleTool,
  ellipse: EllipseTool,
  polygon: PolygonTool,
  'key-point': KeyPointTool,
  'cubic-curve': CubicCurveTool,
  'spline-curve': SplineCurveTool,
  skeleton: SkeletonTool,
  cuboid: CuboidTool,
  // 分割的绘图工具
  brush: BrushTool,
  'mask-polygon': MaskPolyTool,
  'mask-fill': MaskFillTool,
};

export const allTools = toolMap as Record<string, ShapeToolCtr>;

export type IToolName = keyof typeof toolMap;
export type { ToolEvent };
