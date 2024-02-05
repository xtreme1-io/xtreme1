import { useInjectBSEditor } from '../context';
import { IBsUIType } from '../configs/ui';
import { OPType, StatusType } from 'image-editor';

export default function useUI() {
  const editor = useInjectBSEditor();
  const state = editor.state;
  function has(name: IBsUIType | string) {
    return state.modeConfig.ui[name];
  }
  function canEdit() {
    return state.modeConfig.op === OPType.EDIT;
  }
  function canAnnotate() {
    return true;
  }

  function canOperate() {
    return state.status === StatusType.Default;
  }

  return {
    has,
    canEdit,
    canAnnotate,
    canOperate,
  };
}
