import { Editor, IToolItemConfig, UIType } from '../..';
import { LoadStatus, ToolName } from '../../types/enum';
import ModelConfig from 'image-ui/components/Tools/components/ModelConfig.vue';

const hasMsg = (editor: Editor) => {
  // return false;
};
/**
 * model
 */
export const modelTool: IToolItemConfig = {
  action: ToolName.model,
  name: 'model',
  hotkey: '',
  title: 'model',
  hasMsg: (editor: Editor) => {
    const frame = editor.getCurrentFrame();
    return frame?.model?.state === LoadStatus.COMPLETE;
  },
  extra: () => ModelConfig,
  extraClass: true,
  getIcon: (editor: Editor) => {
    const icon = ToolName.model;
    const frame = editor.getCurrentFrame();
    return frame?.model?.state === LoadStatus.LOADING ? 'loading' : icon;
    // if (!editor) return icon;
    // const frame = editor.getCurrentFrame();
    // if (!frame || !frame.model) return icon;
    // const isLoading = frame.model.state === LoadStatus.LOADING;
    // const codes: any[] = [ModelCodeEnum.COCO_80];
    // return isLoading && codes.includes(frame.model.code) ? 'loading' : icon;
  },
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.model];
    // return (
    //   editor.state.modeConfig.ui[UIType.model] &&
    //   editor.getModelsByType(ModelTypeEnum.DETECTION, AnnotateModeEnum.INSTANCE).length > 0
    // );
  },
  isActive: function (editor: Editor) {
    const frame = editor.getCurrentFrame();
    return frame?.model?.state === LoadStatus.LOADING;
  },
};
