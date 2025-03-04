import type { Component } from 'vue';
import { ToolModelEnum, ToolName, Editor } from '../../../image-editor';
import {
  editTool,
  rectTool,
  polygonTool,
  lineTool,
  keyPointTool,
  splineCurveTool,
  skeletonTool,
  groupTool,
  commentTool,
  modelTool,
  interactiveTool,
  segmentTool,
  brushTool,
  cuboidTool,
  maskPolygonTool,
  panoramicTool,
  intellectTool,
  circleTool,
  ellipseTool,
  maskFillTool,
  showPointsTool,
} from './tools';

interface IToolMode {
  fixed: IItemConfig[];
  model: IItemConfig[];
  tools: IItemConfig[];
}
export interface IItemConfig {
  action: ToolName;
  name: string;
  hotkey: number | string;
  title: string;
  order?: number;
  extraClass?: boolean;
  extra?: (editor: Editor) => Component | Component[];
  hasMsg?: (editor: Editor) => boolean;
  getIcon: (editor?: Editor) => ToolName | 'loading' | '';
  isDisplay: (editor: Editor) => boolean;
  isActive: (editor: Editor) => boolean;
}

export const toolMap: Record<ToolName, IItemConfig> = {
  [ToolName.default]: editTool,
  [ToolName.edit]: editTool,
  [ToolName.comment]: commentTool,
  [ToolName['show-points']]: showPointsTool,
  [ToolName.model]: modelTool,
  [ToolName.interactive]: interactiveTool,
  [ToolName.rect]: rectTool,
  [ToolName.ellipse]: ellipseTool,
  [ToolName['shape-circle']]: circleTool,
  [ToolName.polygon]: polygonTool,
  [ToolName.line]: lineTool,
  [ToolName['key-point']]: keyPointTool,
  [ToolName['spline-curve']]: splineCurveTool,
  [ToolName.skeleton]: skeletonTool,
  [ToolName.cuboid]: cuboidTool,
  [ToolName.group]: groupTool,
  [ToolName.segment]: segmentTool,
  [ToolName.brush]: brushTool,
  [ToolName['mask-polygon']]: maskPolygonTool,
  [ToolName['mask-fill']]: maskFillTool,
  [ToolName.panoramic]: panoramicTool,
  [ToolName.intellect]: intellectTool,
};

// 固定 tools
const tools_fixed: IItemConfig[] = [
  toolMap[ToolName.edit],
  toolMap[ToolName.comment],
  toolMap[ToolName['show-points']],
];
// 模型 tools
const tools_model: IItemConfig[] = [toolMap[ToolName.model], toolMap[ToolName.interactive]];
// 图形工具
const tools_graph: IItemConfig[] = [
  toolMap[ToolName.rect],
  toolMap[ToolName.polygon],
  toolMap[ToolName.line],
  toolMap[ToolName.ellipse],
  toolMap[ToolName['shape-circle']],
  toolMap[ToolName['spline-curve']],
  toolMap[ToolName['key-point']],
  toolMap[ToolName.skeleton],
  toolMap[ToolName.cuboid],
];
// 分割工具
const tools_segment: IItemConfig[] = [toolMap[ToolName.segment]];
// 分割模型 tools
const tools_model_seg: IItemConfig[] = [toolMap[ToolName.panoramic], toolMap[ToolName.intellect]];

// 实例模式下的tool
export const tools_instance: IToolMode = {
  fixed: tools_fixed,
  model: tools_model,
  tools: tools_graph,
};
// 分割模式下的tool
export const tools_segmentation: IToolMode = {
  fixed: tools_fixed,
  model: tools_model_seg,
  tools: tools_segment,
};
export const tools = {
  [ToolModelEnum.INSTANCE]: tools_instance,
  [ToolModelEnum.SEGMENTATION]: tools_segmentation,
};
