import { FlowAction, IPageHandler } from '../types';
import { useInjectBSEditor } from '../context';
import pageModes from '../configs/mode';
import { AnnotateObject, MsgType } from 'image-editor';
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
      await focusObject();
    } catch (error: any) {
      editor.handleErr(error, 'Load Error');
    }
    editor.showLoading(false);

    if (bsState.query.type === 'modelRun') {
      editor.dataManager.pollDataModelResult();
    }
  }
  async function focusObject() {
    let objectId = editor.bsState.query.focus;
    if (objectId) {
      let findObject: AnnotateObject | undefined;
      const frame = editor.state.frames.find((frame) => {
        const objects = editor.dataManager.getFrameObject(frame.id);
        findObject = objects?.find((o) => o.uuid == objectId);
        return !!findObject;
      });
      if (frame && findObject) {
        await editor.loadFrame(editor.getFrameIndex(frame.id));
        editor.selectByTrackId(findObject.userData.trackId);
      }
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
