import { IAction, IPageHandler } from '../type';
import { IFrame } from 'pc-editor';
import { useInjectEditor } from '../state';
import modes from '../config/mode';
import useTool from '../hook/useTool';
import { BSError } from 'pc-editor';

export function view(): IPageHandler {
    let editor = useInjectEditor();
    let { state } = editor;

    let {
        loadClasses,
        loadDataSetInfo,
        loadDateSetClassification,
        loadUserInfo,
        loadDataFromFrameSeries,
    } = useTool();

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
            await loadUserInfo();
            await Promise.all([loadDateSetClassification(), loadClasses(), loadDataInfo()]);
            if (state.isSeriesFrame) {
                await editor.loadManager.loadAllObjects();
                // await editor.loadManager.loadAllClassification();
            }
            await editor.loadFrame(0, false);
        } catch (error: any) {
            editor.handleErr(new BSError('', editor.lang('load-error'), error));
        }
        editor.showLoading(false);
    }

    async function loadDataInfo() {
        const { query } = editor.bsState;

        const dataId = query.dataId;
        if (['frame', 'scene'].some((e) => new RegExp(e, 'i').test(query.dataType))) {
            // 连续帧
            editor.state.isSeriesFrame = true;
            editor.bsState.seriesFrameId = dataId;
            await loadDataFromFrameSeries(dataId);
        } else {
            createSingleData();
        }
    }

    function createSingleData() {
        let { query } = editor.bsState;

        let dataId = query.dataId;
        let data: IFrame = {
            id: dataId,
            datasetId: query.datasetId,
            teamId: '',
            pointsUrl: '',
            queryTime: '',
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
