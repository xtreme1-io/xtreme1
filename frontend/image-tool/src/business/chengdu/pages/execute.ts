import { IAction, IPageHandler } from '../type';
import { useInjectTool } from '../state';
import modes from '../config/mode';
import useTool from '../hook/useTool';
import BSError from '../common/BSError';

export function execute(): IPageHandler {
    let tool = useInjectTool();

    let { loadClasses, loadRecord, loadModels, loadDateSetClassification } = useTool();

    // datasetId=30093&dataId=352734&type=readOnly

    async function init() {
        if (!tool.state.query.recordId) {
            tool.editor.showMsg('error', 'Invalid Query');
            return;
        }

        // 设置模式
        // -- 这里根据设置的模式，然后设置对应模式下的 action
        tool.editor.setMode(modes.execute);
        tool.editor.showLoading(true);
        try {
            await loadRecord();
            if (tool.state.dataList.length === 0) return;
            await Promise.all([loadDateSetClassification(), loadClasses(), loadModels()]);
            // 自动加载资源
            // tool.dataResource.load();
            await tool.loadData(0, false);
        } catch (error: any) {
            tool.handleErr(new BSError('', 'Load Error', error));
        }

        tool.editor.showLoading(false);
        tool.editor.tool?.setMode('edit');

        if (tool.state.query.type === 'modelRun') {
            tool.dataManager.pollDataModelResult();
        }
    }

    function onAction(action: IAction) {
        switch (action) {
            case 'save':
                tool.saveObject();
                break;
        }
    }

    return {
        init,
        onAction,
    };
}
