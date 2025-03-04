import { IAction, IPageHandler } from '../../type';
import { useInjectBSEditor } from '../../context';
import modes from '../../config/mode';
import useTaskFlow from '../../hook/useTaskFlow';
import { t } from '@/lang';
import { historyStore } from '../../stores';

/**
 *
 * 任务流质检
 */

export function taskQuality(): IPageHandler {
  const editor = useInjectBSEditor();
  const { bsState } = editor;

  const {
    getTaskInfo,
    reviseTask,
    initNoStageFrames,
    getAllStageInfo,
    getTaskClasses,
    getTaskClassifications,
    loadTaskData,
  } = useTaskFlow();

  // let { getAnnotationList } = useComment();
  async function init() {
    if (!bsState.taskId) {
      editor.showMsg('error', t('image.invalid-query'));
      return;
    }

    // 设置模式
    editor.setMode(modes.taskQuality);

    editor.showLoading(true);
    try {
      historyStore().setViewEnabled(true);
      await getTaskInfo();
      await initNoStageFrames(true);
      await Promise.all([
        getAllStageInfo(),
        // 加载dataset Classification
        getTaskClassifications(),
        getTaskClasses(),
      ]);
    } catch (error: any) {
      editor.handleErr(error, t('image.load-error'));
    }
    await loadTaskData();
    editor.showLoading(false);
  }

  function onAction(action: IAction, data?: any) {
    switch (action) {
      case 'revise':
        reviseTask(data);
        break;
    }
  }

  return {
    init,
    onAction,
  };
}
