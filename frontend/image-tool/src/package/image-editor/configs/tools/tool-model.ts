import { Editor, IToolItemConfig } from '../..';
import { ToolName } from '../../types/enum';
import ModelConfig from 'image-ui/components/Tools/components/ModelConfig.vue';

const hasMsg = (editor: Editor) => {
  return false;
  // const list = editor
  //   .getModelsByType(ModelTypeEnum.DETECTION)
  //   .filter((e) => e.code !== ModelCodeEnum.IMAGE_SAM_EMBEDDING);
  // const result = list.find((e) => editor.modelManager.hasModelResult(e.code));
  // if (result) return true;
  // return false;
};
/**
 * model
 */
export const modelTool: IToolItemConfig = {
  action: ToolName.model,
  name: 'Smart Tool',
  hotkey: 'E',
  title: 'modelTips',
  hasMsg,
  extra: () => ModelConfig,
  extraClass: true,
  getIcon: (editor?: Editor) => {
    const icon = ToolName.model;
    return icon;
    // if (!editor) return icon;
    // const frame = editor.getCurrentFrame();
    // if (!frame || !frame.model) return icon;
    // const isLoading = frame.model.state === LoadStatus.LOADING;
    // const codes: any[] = [ModelCodeEnum.COCO_80];
    // return isLoading && codes.includes(frame.model.code) ? 'loading' : icon;
  },
  isDisplay: function (editor: Editor) {
    return true;
    // return (
    //   editor.state.modeConfig.ui[UIType.model] &&
    //   editor.getModelsByType(ModelTypeEnum.DETECTION, AnnotateModeEnum.INSTANCE).length > 0
    // );
  },
  isActive: function () {
    return false;
  },
};
