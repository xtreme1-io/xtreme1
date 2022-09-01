import { IAction, IPageHandler } from '../type';
import { IFrame } from 'pc-editor';
import { useInjectEditor } from '../state';
import modes from '../config/mode';
import useTool from '../hook/useTool';
import { BSError } from 'pc-editor';

export function view(): IPageHandler {
    let editor = useInjectEditor();
    let { state } = editor;

    let { loadClasses, loadDataFromFrameSeries, loadDateSetClassification, loadUserInfo } =
        useTool();

    // datasetId=30093&dataId=352722&type=readOnly
    // datasetId=30093&dataId=2370323&type=readOnly&dataType=frame
    // recordId=215768

    async function init() {
        let { query } = editor.bsState;
        if (!query.datasetId || !query.dataId) {
            editor.showMsg('error', editor.lang('invalid-query'));
            return;
        }

        // 设置模式
        editor.setMode(modes.view);

        editor.showLoading(true);
        try {
            // await loadUserInfo();
            await Promise.all([loadDateSetClassification(), loadClasses(), loadDataInfo()]);

            // 连续帧 需要加载所有的数据
            // if (state.isSeriesFrame) {
            //     await editor.loadManager.loadAllObjects();
            //     await editor.loadManager.loadAllClassification();
            // }

            await editor.loadFrame(0, false);
        } catch (error: any) {
            editor.handleErr(new BSError('', editor.lang('load-error'), error));
        }

        editor.showLoading(false);
    }

    async function loadDataInfo() {
        let { query } = editor.bsState;

        // let dataId = query.dataId;
        // if (query.dataType === 'frame') {
        //     // 连续帧
        //     editor.state.isSeriesFrame = true;
        //     await loadDataFromFrameSeries(dataId);
        // } else {
        // }
        createSingleData();
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
        };

        editor.state.frames = [data];
    }

    function onAction(action: IAction) {}

    return {
        init,
        onAction,
    };
}
