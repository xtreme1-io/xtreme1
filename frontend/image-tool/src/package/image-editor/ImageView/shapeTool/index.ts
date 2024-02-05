import ShapeTool, { ToolEvent } from './ShapeTool';
import RectTool from './RectTool';
import PolygonTool from './PolygonTool';
import PolylineTool from './PolylineTool';
import KeyPointTool from './KeyPointTool';

export { ShapeTool, RectTool, PolygonTool, PolylineTool, KeyPointTool };

export type ShapeToolCtr = new (...args: any) => ShapeTool;

export const toolMap = {
  rect: RectTool,
  polyline: PolylineTool,
  polygon: PolygonTool,
  'key-point': KeyPointTool,
};

export const allTools = toolMap as Record<string, ShapeToolCtr>;

export type IToolName = keyof typeof toolMap;
export type { ToolEvent };
