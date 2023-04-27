import { useInjectEditor } from '../state';
import { OPType, StatusType } from 'pc-editor';
import { IBsUIType } from '../config/ui';

export default function useUI() {
    let editor = useInjectEditor();
    let state = editor.state;

    function canEdit() {
        return state.modeConfig.op === OPType.EXECUTE || state.modeConfig.name === 'all';
    }
    function canAnnotate() {
        return state.modeConfig.op === OPType.VERIFY || state.modeConfig.name === 'all';
    }

    function canOperate() {
        return state.status !== StatusType.Create;
    }

    function isPlay() {
        return state.status === StatusType.Play;
    }
    function isCheck() {
        return state.config.showCheckView;
    }

    function has(name: IBsUIType | string) {
        return state.modeConfig.ui[name];
    }

    return {
        canEdit,
        canAnnotate,
        canOperate,
        isPlay,
        isCheck,
        has,
    };
}
