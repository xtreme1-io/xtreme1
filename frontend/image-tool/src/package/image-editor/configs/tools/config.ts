import { IToolItemConfig } from '../..';
import { AnnotateModeEnum, ToolName } from '../../types/enum';
import { editTool, rectTool, polygonTool, lineTool, keyPointTool, modelTool } from './index';

interface IToolMode {
  fixed: IToolItemConfig[];
  model: IToolItemConfig[];
  tools: IToolItemConfig[];
}

export const toolMap: Record<ToolName, IToolItemConfig> = {
  [ToolName.default]: editTool,
  [ToolName.edit]: editTool,
  [ToolName.rect]: rectTool,
  [ToolName.polygon]: polygonTool,
  [ToolName.polyline]: lineTool,
  [ToolName['key-point']]: keyPointTool,
  [ToolName.model]: modelTool,
};

// fixed tools
const tools_fixed: IToolItemConfig[] = [toolMap[ToolName.edit]];
// instance
const tools_graph: IToolItemConfig[] = [
  toolMap[ToolName.rect],
  toolMap[ToolName.polygon],
  toolMap[ToolName.polyline],
  // toolMap[ToolName['key-point']],
];
// segment
const tools_segment: IToolItemConfig[] = [];
// model
const tools_model: IToolItemConfig[] = [toolMap[ToolName.model]];
// segment model
const tools_model_seg: IToolItemConfig[] = [];
// instance tools
export const tools_instance: IToolMode = {
  fixed: tools_fixed,
  model: tools_model,
  tools: tools_graph,
};
// segment tools
export const tools_segmentation: IToolMode = {
  fixed: tools_fixed,
  model: tools_model_seg,
  tools: tools_segment,
};
export const tools = {
  [AnnotateModeEnum.INSTANCE]: tools_instance,
  [AnnotateModeEnum.SEGMENTATION]: tools_segmentation,
};
