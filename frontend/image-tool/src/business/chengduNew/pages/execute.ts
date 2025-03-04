import { IAction, IPageHandler } from '../type';
import { useInjectBSEditor } from '../context';
import pageModes from '../config/mode';
import useDataFlow from '../hook/useDataFlow';
import { OPType } from 'image-editor';
import * as api from '../api/common';
import useCommon from '../hook/useCommon';
import useUI from '../hook/useUI';
import * as Button from '../config/btn';
import { t } from '@/lang';

/**
 *
 * 数据流直接标注
 */

export function execute(): IPageHandler {
  const editor = useInjectBSEditor();
  const { taskClose } = useCommon();
  const { canEdit } = useUI();
  const { bsState, state } = editor;

  const { loadClasses, loadRecord, loadModels, loadDateSetClassification } = useDataFlow();

  // datasetId=30093&dataId=352734&type=readOnly

  async function init() {
    if (!bsState.query.recordId) {
      editor.showMsg('error', 'Invalid Query');
      return;
    }

    editor.setMode(pageModes.execute);
    editor.showLoading(true);
    try {
      await loadRecord();
      await Promise.all([
        // 加载dataset Classification
        loadDateSetClassification(),
        // 加载class
        loadClasses(),
        // 加载模型信息
        loadModels(),
      ]);

      await editor.loadManager.loadSceneData(0);
      // if (state.isSeriesFrame) {
      //   await editor.loadManager.loadSceneData(0);
      // } else {
      //   const sceneFrames = editor.dataManager.getFramesBySceneId();
      //   if (sceneFrames.length === 0) return;
      //   editor.setFrames(sceneFrames);
      //   await editor.loadFrame(0, false, true);
      // }
    } catch (error: any) {
      editor.handleErr(error, 'Load Error');
    }

    editor.showLoading(false);

    if (bsState.query.type === 'modelRun') {
      editor.dataManager.pollDataModelResult();
    }
  }
  async function onClose() {
    if (state.modeConfig.op !== OPType.EDIT || state.modeConfig.name === 'preview') {
      state.frames.forEach((frame) => {
        frame.needSave = false;
      });
      closeTab();
      return;
    }
    // TODO
    if (bsState.isTaskFlow) {
      // editor.dispatchEvent({ type: Event.FLOW_ACTION, data: 'close' as IAction });
      await taskClose();
      return;
    }

    let status = '';
    if (editor.needSave() && canEdit()) {
      status = await editor
        .showModal('confirm', {
          title: t('image.titleSaveChange'),
          data: {
            subContent: t('image.msgSaveChange'),
            buttons: [Button.ButtonSave, Button.ButtonDiscard, Button.ButtonCancel],
          },
        })
        .then(
          async (action) => action,
          async (error) => 'cancel',
        );
    }

    if (status === Button.ButtonSave.action) {
      await editor.saveDataFlow();
    } else if (status === Button.ButtonDiscard.action) {
      // clear save status
      editor.state.frames.forEach((e) => {
        e.needSave = false;
      });
    } else if (status === Button.ButtonCancel.action) {
      return;
    }

    if (editor.state.modeConfig.name !== 'view') {
      await api.unlockRecord(editor.bsState.recordId);
    }

    closeTab();

    function closeTab() {
      const win = window.open('about:blank', '_self');
      win && win.close();
    }
  }
  function onAction(action: IAction) {
    switch (action) {
      case 'save':
        editor.save();
        break;
      case 'close':
        onClose();
        break;
    }
  }

  return {
    init,
    onAction,
  };
}
