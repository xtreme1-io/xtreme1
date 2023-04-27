import { IAction, IPageHandler } from '../type';
import { IFrame } from 'pc-editor';
import { useInjectEditor } from '../state';
import modes from '../config/mode';
import useTool from '../hook/useTool';
import { BSError } from 'pc-editor';

export function view(): IPageHandler {
    let editor = useInjectEditor();
    let { state } = editor;

    let { loadClasses, loadDataSetInfo, loadDateSetClassification } = useTool();

    async function init() {
        let { query } = editor.bsState;
        if (!query.datasetId || !query.dataId) {
            editor.showMsg('error', editor.lang('invalid-query'));
            return;
        }

        // set mode
        editor.setMode(modes.view);

        editor.showLoading(true);
        try {
            await loadDataSetInfo();
            await Promise.all([loadDateSetClassification(), loadClasses(), loadDataInfo()]);
            await editor.loadFrame(0, false);
        } catch (error: any) {
            editor.handleErr(new BSError('', editor.lang('load-error'), error));
        }
        editor.showLoading(false);
    }

    async function loadDataInfo() {
        let { query } = editor.bsState;
        createSingleData();
    }

    function createSingleData() {
        let { query } = editor.bsState;

        let dataId = query.dataId;
        let data: IFrame = {
            id: dataId,
            datasetId: query.datasetId,
            teamId: '',
            loadState: '',
            needSave: false,
            classifications: [],
            dataStatus: 'VALID',
            annotationStatus: 'NOT_ANNOTATED',
            skipped: false,
        };

        editor.state.frames = [data];
    }

    function onAction(action: IAction) {}

    return {
        init,
        onAction,
    };
}
