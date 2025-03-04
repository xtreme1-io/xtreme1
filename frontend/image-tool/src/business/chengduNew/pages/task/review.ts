import { IAction, IPageHandler, StageEnum, TaskHistoryAuthEnum } from '../../type';
import { useInjectBSEditor } from '../../context';
import modes from '../../config/mode';
import useDataFlow from '../../hook/useDataFlow';
import useTaskFlow from '../../hook/useTaskFlow';
import useCommon from '../../hook/useCommon';
import { t } from '@/lang';
import { historyStore } from '../../stores';

/**
 *
 * 任务流审核
 */

export function taskReview(): IPageHandler {
  const editor = useInjectBSEditor();

  const {
    getTaskInfo,
    getStageInfo,
    initStageFrames,
    initClaimInfo,
    getPreStage,
    rejectData,
    submitData,
    suspendData,
    getTaskClasses,
    getTaskClassifications,
    getAllStageInfo,
    loadTaskData,
  } = useTaskFlow();
  const { loadModels } = useDataFlow();
  const { taskBack } = useCommon();

  async function init() {
    // 设置模式
    historyStore().enable(true);
    editor.setMode(modes.taskReview);
    // editor.setMode(modes.all);

    editor.showLoading(true);
    try {
      await getTaskInfo();
      historyStore().setViewEnabled(
        editor.bsState.task.historyAccessPermissions.includes(TaskHistoryAuthEnum.REVIEWER),
      );
      await initClaimInfo();
      await getStageInfo();
      await initStageFrames();
      await Promise.all([
        // 加载dataset Classification
        getPreStage(),

        getTaskClassifications(),
        getTaskClasses(),
        getAllStageInfo(),
        // 加载模型信息
        loadModels(),
      ]);
    } catch (error: any) {
      editor.handleErr(error, t('image.load-error'));
    }
    await loadTaskData();
    editor.showLoading(false);
  }

  async function reject(exit = false) {
    await rejectData(exit);
  }

  async function pass(exit = false) {
    await submitData({ exit, stage: StageEnum.ANNOTATION });
  }

  function changeMode() {
    editor.setMode(modes.taskReviewEdit);
    editor.updateUiAuth();
    editor.bsState.isModify = true;
  }

  async function back() {
    try {
      taskBack(() => {
        // editor.setMode(modes.taskReview);
        editor.actionManager.stopCurrentAction();
        editor.mainView.disableDraw();
        editor.mainView.disableEdit();
        editor.selectObject();
        editor.setMode(modes.taskReview);
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
      case 'pass':
        pass();
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
      case 'suspend':
        suspendData(StageEnum.REVIEW);
        break;
    }
  }

  return {
    init,
    onAction,
  };
}
