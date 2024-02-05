import { IUIType, OPType, StatusType, AnnotateModeEnum } from '../../image-editor';
import { useInjectEditor } from '../context';

export default function useUI() {
  const editor = useInjectEditor();
  const state = editor.state;
  function has(name: IUIType | string) {
    return state.modeConfig.ui[name];
  }
  function canEdit() {
    return state.modeConfig.op === OPType.EDIT || state.modeConfig.name === 'all';
  }
  function canAnnotate() {
    return state.modeConfig.op === OPType.EDIT || state.modeConfig.name === 'all';
  }

  function canOperate() {
    return state.status !== StatusType.Create;
  }

  function isPlay() {
    return state.status === StatusType.Play;
  }
  function isCheck() {
    return false;
    // return state.config.showCheckView;
  }
  function showCopy() {
    return canEdit() && editor.state.annotateMode === AnnotateModeEnum.INSTANCE;
  }

  return {
    has,
    canEdit,
    canAnnotate,
    canOperate,
    isPlay,
    isCheck,
    showCopy,
  };
}
