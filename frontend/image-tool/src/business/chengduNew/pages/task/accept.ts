import { IAction, IPageHandler, TaskHistoryAuthEnum } from '../../type';
import { useInjectBSEditor } from '../../context';
import modes from '../../config/mode';
import useTaskFlow from '../../hook/useTaskFlow';
import useDataFlow from '../../hook/useDataFlow';
import useCommon from '../../hook/useCommon';
import Event from '../../config/event';
import { t } from '@/lang';
import { historyStore } from '../../stores';

/**
 *
 * 任务流验收
 */

export function taskAccept(): IPageHandler {
  const editor = useInjectBSEditor();
  const { bsState } = editor;

  const {
    getTaskInfo,
    acceptanceAccept,
    initNoStageFrames,
    getAllStageInfo,
    getTaskClassifications,
    getTaskClasses,
    acceptanceReject,
    loadTaskData,
    getSampleInfo,
  } = useTaskFlow();
  const { taskBack } = useCommon();
  const { loadModels } = useDataFlow();
  // let { getAnnotationList } = useComment();

  async function init() {
    if (!bsState.taskId) {
      editor.showMsg('error', t('image.invalid-query'));
      return;
    }

    // 设置模式
    historyStore().enable(true);
    editor.setMode(modes.taskAccept);

    editor.showLoading(true);
    try {
      await getTaskInfo();
      historyStore().setViewEnabled(
        editor.bsState.task.historyAccessPermissions.includes(TaskHistoryAuthEnum.INSPECTOR),
      );
      await initNoStageFrames();
      await getTaskClassifications();
      await getTaskClasses();
      // await getStageInfo();
      await Promise.all([getAllStageInfo(), loadModels()]);
    } catch (error: any) {
      editor.handleErr(error, t('image.load-error'));
    }
    await loadTaskData();
    await getSampleInfo();
    editor.showLoading(false);
    editor.on(Event.SCENE_CHANGE, getSampleInfo);
  }

  async function reject() {
    await acceptanceReject();
  }

  async function accept() {
    await acceptanceAccept();
  }

  function changeMode() {
    editor.setMode(modes.taskAcceptEdit);
    editor.updateUiAuth();
    editor.bsState.isModify = true;
  }

  function back() {
    try {
      taskBack(() => {
        editor.actionManager.stopCurrentAction();
        editor.setMode(modes.taskAccept);
        editor.updateUiAuth();
        editor.bsState.isModify = false;
      });
    } catch (error: any) {
      editor.handleErr(error);
    }
  }

  async function save() {
    try {
      await editor.save();
    } catch (error) {
      editor.handleErr(error as any);
    }
  }

  function onAction(action: IAction) {
    switch (action) {
      case 'reject':
        reject();
        break;
      case 'accept':
        accept();
        break;
      case 'modify':
        changeMode();
        break;
      case 'back':
        back();
        break;
      case 'save':
        save();
        break;
    }
  }

  return {
    init,
    onAction,
  };
}
