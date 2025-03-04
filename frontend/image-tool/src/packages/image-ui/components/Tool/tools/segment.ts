import { IItemConfig, toolMap } from '../item';
import { Editor, ToolName, UIType } from '../../../../image-editor';
import MaskToolsVue from '../components/MaskTools.vue';

/**
 * 分割工具配置
 */
// 分割工具包含的工具
export const segmentToolActions: ToolName[] = [
  ToolName.brush,
  ToolName['mask-polygon'],
  ToolName['mask-fill'],
];
// 分割工具: 总体显示的虚拟工具, 实际交互/功能以实际选中的内部工具为准
export const segmentTool: IItemConfig = {
  action: ToolName.segment,
  name: 'Segmentation Tool',
  hotkey: 1,
  title: 'Segmentation',
  extraClass: true,
  extra: () => MaskToolsVue,
  getIcon: (editor?: Editor) => {
    return editor ? toolMap[editor.state.toolConfig.segmentTool].getIcon() : '';
  },
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_mask];
  },
  isActive: function (editor: Editor) {
    return segmentToolActions.includes(editor.state.activeTool);
  },
};

// 分割工具之一: 刷子工具
export const brushTool: IItemConfig = {
  action: ToolName.brush,
  name: 'Brush Tool',
  hotkey: '',
  title: 'brush tips',
  getIcon: () => ToolName.brush,
  isDisplay: function (editor: Editor) {
    return true;
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName.brush || state.toolConfig.segmentTool === ToolName.brush;
  },
};
// 分割工具之一: 多边形工具
export const maskPolygonTool: IItemConfig = {
  action: ToolName['mask-polygon'],
  name: 'Polygon Tool',
  hotkey: '',
  title: 'polygonTips',
  getIcon: () => ToolName['mask-polygon'],
  isDisplay: function (editor: Editor) {
    return true;
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return (
      state.activeTool === ToolName['mask-polygon'] ||
      state.toolConfig.segmentTool === ToolName['mask-polygon']
    );
  },
};
// 分割工具之一: 填充工具
export const maskFillTool: IItemConfig = {
  action: ToolName['mask-fill'],
  name: 'Fill Tool',
  hotkey: '',
  title: 'mask fill tips',
  getIcon: () => ToolName['mask-fill'],
  isDisplay: function (editor: Editor) {
    return true;
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return (
      state.activeTool === ToolName['mask-fill'] ||
      state.toolConfig.segmentTool === ToolName['mask-fill']
    );
  },
};
