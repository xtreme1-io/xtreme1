import { useInjectBSEditor } from '../context';
import { IBsUIType } from '../config/ui';
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
    // return (
    //     state.modeConfig.op === OPType.VERIFY ||
    //     state.mode === OPType.ALL ||
    //     state.mode == OPType.TASK
    // );
    return true;
  }

  function canOperate() {
    return state.status === StatusType.Default;
  }
  function isShowAttrs() {
    // return state.showAttrs;
    return true;
  }
  function isShowSize() {
    // return state.showSize;
    return true;
  }

  function canComment() {
    // return (
    //     state.mode == OPType.TASK &&
    //     !editor.state.isModify &&
    //     (editor.state.stage == StageTypeEnum.REVIEW ||
    //         editor.state.stage == StageTypeEnum.ACCEPTANCE ||
    //         editor.state.stage == StageTypeEnum.VIEW)
    // );
    return true;
  }

  return {
    has,
    canEdit,
    canAnnotate,
    canOperate,
    isShowAttrs,
    isShowSize,
    // comment
    canComment,
  };
}
