import modes from '../config/mode';
import * as THREE from 'three';
import { IPageHandler, IAction } from '../type';
import useTool from '../hook/useTool';
import { useInjectTool } from '../state';

export function dev(): IPageHandler {
    let tool = useInjectTool();
    let editor = tool.editor;
    let { loadInfo } = useTool();

    async function init() {
        let { query } = tool.state;
        if (!query.recordId) {
            editor.showMsg('error', 'Invalid Query');
            return;
        }
        loadInfo();
    }

    function onAction(action: IAction) {}

    return {
        init,
        onAction,
    };
}
