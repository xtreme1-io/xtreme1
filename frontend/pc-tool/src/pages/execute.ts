import { IAction, IPageHandler } from '../type';
import { useInjectEditor } from '../state';
import modes from '../config/mode';
import useTool from '../hook/useTool';
// import BSError from '../common/BSError';

export function execute(): IPageHandler {
    let editor = useInjectEditor();

    let { loadClasses, loadRecord, loadUserInfo,loadDataSetInfo, loadModels, loadDateSetClassification } =
        useTool();

    // datasetId=30093&dataId=352734&type=readOnly

    async function init() {
        let { state, bsState } = editor;
        if (!bsState.query.recordId) {
            editor.showMsg('error', editor.lang('invalid-query'));
            return;
        }

        // 设置模式
        editor.setMode(modes.execute);

        editor.showLoading(true);
        try {
            // 更加流水号加载数据列表
            await loadRecord();
            await loadUserInfo();
            await loadDataSetInfo();
            await Promise.all([
                // 加载dataset Classification
                loadDateSetClassification(),
                // 加载class
                loadClasses(),
                // 加载模型信息
                loadModels(),
            ]);

            // 连续帧 需要加载所有的数据
            // if (state.isSeriesFrame) {
            //     await editor.loadManager.loadAllObjects();
            //     await editor.loadManager.loadAllClassification();
            // }

            // 加载第一帧data
            await editor.loadFrame(0, false);
        } catch (error: any) {
            editor.handleErr(error, editor.lang('load-error'));
        }

        editor.showLoading(false);

        if (bsState.query.type === 'modelRun') {
            // editor.dataManager.pollDataModelResult();
        }
    }

    function onAction(action: IAction) {
        switch (action) {
            case 'save':
                editor.saveObject();
                break;
        }
    }

    return {
        init,
        onAction,
    };
}
