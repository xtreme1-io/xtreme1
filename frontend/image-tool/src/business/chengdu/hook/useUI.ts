import { useInjectTool } from '../state';
import { OPType, StatusType } from 'editor';
import { IBsUIType } from '../config/ui';

export default function useUI() {
    let tool = useInjectTool();
    let editor = tool.editor;
    let state = editor.state;
    function has(name: IBsUIType | string) {
        return state.modeConfig.ui[name];
    }
    function canEdit() {
        return state.modeConfig.op === OPType.EXECUTE || state.mode === 'all';
    }
    function canAnnotate() {
        return state.modeConfig.op === OPType.VERIFY || state.mode === 'all';
    }

    function canOperate() {
        return state.status === StatusType.Default;
    }
    function isShowAttrs() {
        return state.showAttrs;
    }
    function isShowSize() {
        return state.showSize;
    }

    return {
        has,
        canEdit,
        canAnnotate,
        canOperate,
        isShowAttrs,
        isShowSize,
    };
}
