import { IAction, IPageHandler, StageEnum, TaskHistoryAuthEnum } from '../../type';
import { useInjectBSEditor } from '../../context';
import pageModes from '../../config/mode';
import useTaskFlow from '../../hook/useTaskFlow';
import useDataFlow from '../../hook/useDataFlow';
import { historyStore } from '../../stores';

/**
 *
 * 任务流标注
 */
export function taskAnnotate(): IPageHandler {
  const editor = useInjectBSEditor();

  const {
    getTaskInfo,
    getStageInfo,
    initStageFrames,
    initClaimInfo,
    submitData,
    suspendData,
    getAllStageInfo,
    getTaskClassifications,
    getTaskClasses,
    loadTaskData,
  } = useTaskFlow();
  const { loadModels } = useDataFlow();

  async function init() {
    // editor.setMode(pageModes.all);
    historyStore().enable(true);
    editor.setMode(pageModes.taskAnnotate);

    editor.showLoading(true);
    try {
      await getTaskInfo();
      historyStore().setViewEnabled(
        editor.bsState.task.historyAccessPermissions.includes(TaskHistoryAuthEnum.ANNOTATOR),
      );
      await initClaimInfo();
      await initStageFrames();

      await Promise.all([
        getStageInfo(),
        getAllStageInfo(),
        getTaskClassifications(),
        getTaskClasses(),
        loadModels(),
      ]);

      initModelRun();
    } catch (error: any) {
      editor.handleErr(error, 'Load Error');
    }

    await loadTaskData();

    editor.showLoading(false);
  }

  function initModelRun() {
    const { bsState, state } = editor;
    if (bsState.query.modelRun) {
      state.frames.forEach((frame) => {
        const model: any = {
          recordId: bsState.query.modelRun,
          id: '',
          version: '',
          state: '',
        };
        frame.model = model;
      });
      editor.dataManager.pollDataModelResult();
    }
  }
  async function submit(exit = false) {
    await submitData({ exit, stage: StageEnum.ANNOTATION });
  }

  async function save() {
    await editor.save();
  }

  function onAction(action: IAction) {
    switch (action) {
      case 'save':
        save();
        break;
      case 'submit':
        submit();
        break;
      case 'suspend':
        suspendData(StageEnum.ANNOTATION);
        break;
    }
  }

  return {
    init,
    onAction,
  };
}
