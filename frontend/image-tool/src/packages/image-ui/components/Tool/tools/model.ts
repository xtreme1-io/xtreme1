import { IItemConfig } from '../item';
import { Editor, UIType, LoadStatus, ModelTypeEnum, ToolName } from '../../../../image-editor';
import ModelEditorTip from '../components/modelConfig.vue';
import InteractiveSetting from '../components/InteractiveSetting.vue';

/**
 * 模型工具配置
 */
// 预识别工具
export const modelTool: IItemConfig = {
  action: ToolName.model,
  name: 'Smart Tool',
  hotkey: 'E',
  title: 'modelTips',
  hasMsg: (editor: Editor) => {
    return editor.modelManager.hasModelResult(ModelTypeEnum.OBJECT_DETECTION);
  },
  extra: () => ModelEditorTip,
  extraClass: true,
  getIcon: (editor?: Editor) => {
    const icon = ToolName.model;
    if (!editor) return icon;
    const frame = editor.getCurrentFrame();
    if (!frame || !frame.model) return icon;
    const isLoading = frame.model.state === LoadStatus.LOADING;
    const model = editor.getModelById(frame.model.id);
    const isThisModel =
      model && !model.isInteractive && model.type === ModelTypeEnum.OBJECT_DETECTION;
    return isLoading && isThisModel ? 'loading' : icon;
  },
  isDisplay: function (editor: Editor) {
    return (
      editor.state.modeConfig.ui[UIType.model] &&
      editor.getModelsByType(ModelTypeEnum.OBJECT_DETECTION).length > 0
    );
  },
  isActive: function () {
    return false;
  },
};

// 交互式识别工具
export const interactiveTool: IItemConfig = {
  action: ToolName.interactive,
  name: 'Interactive Tool',
  hotkey: 'R',
  title: 'interactiveTips',
  getIcon: () => ToolName.interactive,
  isDisplay: function (editor: Editor) {
    return (
      editor.state.modeConfig.ui[UIType.tool_interactive] &&
      editor.getModelsByType(ModelTypeEnum.OBJECT_DETECTION, true).length > 0
    );
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName.interactive;
  },
  extra: () => InteractiveSetting,
  extraClass: true,
};

// 分割模型

// 全景分割
export const panoramicTool: IItemConfig = {
  action: ToolName.panoramic,
  name: 'Panoramic Tool',
  hotkey: 'E',
  title: 'panoramicTips',
  hasMsg: (editor: Editor) => {
    return editor.modelManager.hasModelResult(ModelTypeEnum.SEMANTIC_SEGMENTATION);
  },
  getIcon: (editor?: Editor) => {
    const icon = ToolName.panoramic;
    if (!editor) return icon;
    const frame = editor.getCurrentFrame();
    if (!frame || !frame.model) return icon;
    const isLoading = frame.model.state === LoadStatus.LOADING;
    const model = editor.getModelById(frame.model.id);
    const isThisModel =
      model && !model.isInteractive && model.type === ModelTypeEnum.SEMANTIC_SEGMENTATION;
    return isLoading && isThisModel ? 'loading' : icon;
  },
  isDisplay: function (editor: Editor) {
    return (
      editor.state.modeConfig.ui[UIType.model_panoramic] &&
      editor.getModelsByType(ModelTypeEnum.SEMANTIC_SEGMENTATION).length > 0
    );
  },
  isActive: function (editor: Editor) {
    return false;
  },
  extra: () => ModelEditorTip,
  extraClass: true,
};
// 智能分割
export const intellectTool: IItemConfig = {
  action: ToolName.intellect,
  name: 'Intellect Tool',
  hotkey: 'R',
  title: 'intellectTips',
  getIcon: (editor?: Editor) => {
    const icon = ToolName.intellect;
    if (!editor) return icon;
    const frame = editor.getCurrentFrame();
    if (!frame || !frame.model) return icon;
    const isLoading = frame.model.state === LoadStatus.LOADING;
    const model = editor.getModelById(frame.model.id);
    const isThisModel = model?.isInteractive && model.type === ModelTypeEnum.SEMANTIC_SEGMENTATION;
    return isLoading && isThisModel ? 'loading' : icon;
  },
  isDisplay: function (editor: Editor) {
    return (
      editor.state.modeConfig.ui[UIType.tool_intellect] &&
      editor.getModelsByType(ModelTypeEnum.SEMANTIC_SEGMENTATION, true).length > 0
    );
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName.intellect;
  },
};
