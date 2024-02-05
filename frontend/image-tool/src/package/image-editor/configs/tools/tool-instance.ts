import { ToolName } from './../../types/enum';
import { Editor, IToolItemConfig, UIType } from '../..';

/**
 * tools
 */
// edit
export const editTool: IToolItemConfig = {
  action: ToolName.edit,
  name: 'Selection Tool',
  hotkey: 'Q',
  title: 'edit',
  getIcon: () => ToolName.edit,
  isDisplay: function (editor: Editor) {
    return true; // editor.state.modeConfig.ui[UIType.edit];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName.default;
  },
};
// rect
export const rectTool: IToolItemConfig = {
  action: ToolName.rect,
  name: 'Rectangle Tool',
  hotkey: 1,
  title: 'Bounding Box',
  getIcon: () => ToolName.rect,
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_rect];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName.rect;
  },
};
// polygon
export const polygonTool: IToolItemConfig = {
  action: ToolName.polygon,
  name: 'Polygon Tool',
  hotkey: 2,
  title: 'Polygon',
  getIcon: () => ToolName.polygon,
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_polygon];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName.polygon;
  },
};
// polyline
export const lineTool: IToolItemConfig = {
  action: ToolName.polyline,
  name: 'Polyline Tool',
  hotkey: 3,
  title: 'Polyline',
  getIcon: () => ToolName.polyline,
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_line];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName.polyline;
  },
};
// keypoint
export const keyPointTool: IToolItemConfig = {
  action: ToolName['key-point'],
  name: 'KeyPoint Tool',
  hotkey: 4,
  title: 'Key Point',
  getIcon: () => ToolName['key-point'],
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_keyPoint];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName['key-point'];
  },
};
