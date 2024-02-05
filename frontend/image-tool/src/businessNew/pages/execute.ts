import { FlowAction, IPageHandler } from '../types';
import { useInjectBSEditor } from '../context';
import pageModes from '../configs/mode';
import { MsgType } from 'image-editor';
import useDataFlow from '../hook/useDataflow';
import useCommon from '../hook/useCommon';

export function execute(): IPageHandler {
  const editor = useInjectBSEditor();
  const { bsState } = editor;

  const { loadRecord, loadClasses, loadDateSetClassification, loadModels } = useDataFlow();
  const { onClose } = useCommon();

  async function init() {
    if (!bsState.query.recordId) {
      editor.showMsg(MsgType.error, 'Invalid Query');
      return;
    }
    editor.setMode(pageModes.execute);
    editor.showLoading(true);
    try {
      await loadRecord();
      await Promise.all([loadClasses(), loadDateSetClassification(), loadModels()]);
      await editor.loadManager.loadSceneData(0);
    } catch (error: any) {
      editor.handleErr(error, 'Load Error');
    }
    editor.showLoading(false);

    if (bsState.query.type === 'modelRun') {
      editor.dataManager.pollDataModelResult();
    }
  }

  function onAction(action: FlowAction) {
    console.log(action);
    switch (action) {
      case FlowAction.save:
        editor.save();
        break;
      case FlowAction.close:
        onClose();
        break;
    }
  }

  return { init, onAction };
}
