import { IAction, IPageHandler, IDataMeta } from '../type';
import { useInjectTool } from '../state';
import modes from '../config/mode';
import useTool from '../hook/useTool';
import BSError from '../common/BSError';

export function view(): IPageHandler {
    let tool = useInjectTool();

    let { loadClasses, loadDateSetClassification } = useTool();

    async function init() {
        let { query } = tool.state;
        if (!query.datasetId || !query.dataId) {
            tool.editor.showMsg('error', 'Invalid Query');
            return;
        }

        tool.editor.setMode(modes.view);

        tool.editor.showLoading(true);
        try {
            await Promise.all([loadDateSetClassification(), loadClasses(), loadDataInfo()]);
            await tool.loadData(0, false);
        } catch (error: any) {
            tool.handleErr(new BSError('', 'Load Error', error));
        }
        tool.editor.tool?.setMode('view');
        tool.editor.showLoading(false);
    }

    async function loadDataInfo() {
        let { query } = tool.state;

        let dataId = query.dataId;
        if (query.dataType === 'frame') {
            tool.state.isSeriesFrame = true;
            await loadDataFromFrameSeries(dataId);
        } else {
            createSingleData();
        }
    }

    function createSingleData() {
        let { query } = tool.state;

        let dataId = query.dataId;
        let data: IDataMeta = {
            dataId: dataId,
            datasetId: query.datasetId,
            teamId: '',
            pointsUrl: '',
            queryTime: '',
            loadState: '',
            needSave: false,
            classifications: [],
        };

        tool.state.dataList = [data];
    }

    function onAction(action: IAction) {}

    return {
        init,
        onAction,
    };
}
