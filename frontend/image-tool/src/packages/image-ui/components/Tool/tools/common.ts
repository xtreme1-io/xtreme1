import { IItemConfig } from '../item';
import { Editor, UIType, ToolType, ToolName } from '../../../../image-editor';
import PolygonConfig from '../components/polygonConfig.vue';
import SkeSetting from '../components/SkeSetting.vue';
import PolylineConfig from '../components/polylineConfig.vue';
import ToolLine from '../components/ToolLine.vue';

/**
 * 常用工具配置
 */
// 编辑选中工具
export const editTool: IItemConfig = {
  action: ToolName.edit,
  name: 'Selection Tool',
  hotkey: 'Q',
  title: 'editTips',
  getIcon: () => ToolName.edit,
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.edit];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return !state.activeTool;
  },
};

// 矩形工具
export const rectTool: IItemConfig = {
  action: ToolName.rect,
  name: 'Rectangle Tool',
  hotkey: 1,
  title: 'rectTips',
  getIcon: () => ToolName.rect,
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_rect];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName.rect;
  },
};

// 多边形工具
export const polygonTool: IItemConfig = {
  action: ToolName.polygon,
  name: 'Polygon Tool',
  hotkey: 2,
  title: 'polygonTips',
  getIcon: () => ToolName.polygon,
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_polygon];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName.polygon;
  },
  extra: () => PolygonConfig,
  extraClass: true,
};

// 折线工具
export const lineTool: IItemConfig = {
  action: ToolName.line,
  name: 'Polyline Tool',
  hotkey: 3,
  title: 'lineTips',
  getIcon: () => ToolName.line,
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_line];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName.line;
  },
  extra: () => [PolylineConfig, ToolLine],
  extraClass: true,
};

// 关键点工具
export const keyPointTool: IItemConfig = {
  action: ToolName['key-point'],
  name: 'KeyPoint Tool',
  hotkey: 4,
  title: 'pointTips',
  getIcon: () => ToolName['key-point'],
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_keyPoint];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName['key-point'];
  },
};

// 曲线工具
export const splineCurveTool: IItemConfig = {
  action: ToolName['spline-curve'],
  name: 'SplineCurve Tool',
  hotkey: 5,
  title: 'curveTips',
  getIcon: () => ToolName['spline-curve'],
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_splineCurve];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName['spline-curve'];
  },
};

// 骨骼点工具
export const skeletonTool: IItemConfig = {
  action: ToolName.skeleton,
  name: 'Skeleton Tool',
  hotkey: 6,
  title: 'skeletonTips',
  getIcon: () => ToolName.skeleton,
  isDisplay: function (editor: Editor) {
    return (
      editor.state.modeConfig.ui[UIType.tool_skeleton] &&
      editor.getClassList(ToolType.SKELETON).length > 0
    );
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName.skeleton;
  },
  extraClass: true,
  extra: () => SkeSetting,
};

// 组
export const groupTool: IItemConfig = {
  action: ToolName.group,
  name: 'Group Tool',
  hotkey: 7,
  title: 'groupTips',
  getIcon: () => ToolName.group,
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_group];
  },
  isActive: function () {
    return false;
  },
};

// 伪3D框
export const cuboidTool: IItemConfig = {
  action: ToolName.cuboid,
  name: 'Cuboid Tool',
  hotkey: 8,
  title: 'cuboidTips',
  getIcon: () => ToolName.cuboid,
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_cuboid];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName.cuboid;
  },
};
// 圆工具
export const circleTool: IItemConfig = {
  action: ToolName['shape-circle'],
  name: 'Circle Tool',
  hotkey: 9,
  title: 'circleTips',
  getIcon: () => ToolName['shape-circle'],
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_circle];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName['shape-circle'];
  },
};
// 椭圆圆工具
export const ellipseTool: IItemConfig = {
  action: ToolName.ellipse,
  name: 'Ellipse Tool',
  hotkey: 9,
  title: 'ellipseTips',
  getIcon: () => ToolName.ellipse,
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_ellipse];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName.ellipse;
  },
};

// 展示/隐藏关键点
export const showPointsTool: IItemConfig = {
  action: ToolName['show-points'],
  name: 'show points',
  hotkey: '',
  title: 'show points',
  getIcon: () => ToolName['show-points'],
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.show_points];
  },
  isActive: function (editor: Editor) {
    return editor.state.config.showPoints;
  },
};
