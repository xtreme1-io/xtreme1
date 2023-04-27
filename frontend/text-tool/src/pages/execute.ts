import { IAction, IPageHandler } from '../type';
import { useInjectEditor } from '../state';
import modes from '../config/mode';
import useTool from '../hook/useTool';
import { Box } from 'pc-render';
// import BSError from '../common/BSError';

export function execute(): IPageHandler {
    let editor = useInjectEditor();

    let {
        loadClasses,
        loadRecord,
        loadDataSetInfo,
        loadModels,
        loadDateSetClassification,
    } = useTool();

    // datasetId=30093&dataId=352734&type=readOnly

    async function init() {
        let { state, bsState } = editor;
        if (!bsState.query.recordId) {
            editor.showMsg('error', editor.lang('invalid-query'));
            return;
        }

        // set mode
        editor.setMode(modes.execute);

        editor.showLoading(true);
        try {
            // get data list by record id
            await loadRecord();
            // await loadDataSetInfo();
            await Promise.all([
                // load  Classification / class /model
                loadDateSetClassification(),
                loadClasses(),
                // loadModels(),
            ]);
            // load first data
            await editor.loadFrame(0, false);
            focusObject();
        } catch (error: any) {
            editor.handleErr(error, editor.lang('load-error'));
        }

        editor.showLoading(false);
    }

    function focusObject() {
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
