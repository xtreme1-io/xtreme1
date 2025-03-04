import { IAction, IPageHandler } from '../../type';
import { useInjectBSEditor } from '../../context';
import modes from '../../config/mode';
import { BSError, IFrame } from 'image-editor';
import useTaskFlow from '../../hook/useTaskFlow';
import { t } from '@/lang';
import { historyStore } from '../../stores';

/**
 *
 * 任务流查看
 */

export function taskView(): IPageHandler {
  const editor = useInjectBSEditor();
  const { state } = editor;

  const { getTaskInfo, loadTaskData, getTaskClasses, getTaskClassifications } = useTaskFlow();

  async function init() {
    // 设置模式
    editor.setMode(modes.view);

    editor.showLoading(true);
    try {
      historyStore().setViewEnabled(true);
      await getTaskInfo();
      // await initNoStageFrames(true);
      await loadData();
      await Promise.all([getTaskClassifications(), getTaskClasses()]);
    } catch (error: any) {
      editor.handleErr(error, t('image.load-error'));
    }
    await loadTaskData();
    editor.showLoading(false);
  }

  async function loadData() {
    const { query } = editor.bsState;
    if (state.isSeriesFrame) {
      const itemIds = query.itemIds || [];
      if (itemIds.length === 0) throw new BSError('', t('image.no-data'));
      state.sceneIds = itemIds;
    } else {
      createFrames();
    }
  }

  function createFrames() {
    const { query } = editor.bsState;

    const itemIds = query.itemIds || [];
    const frames = itemIds.map((id: any) => {
      return {
        id: id,
        datasetId: '',
        pointsUrl: '',
        queryTime: '',
        loadState: '',
        needSave: false,
      } as IFrame;
    });

    editor.setFrames(frames);
  }

  function onAction(action: IAction) {}

  return {
    init,
    onAction,
  };
}
