import { IPageHandler } from '../type';
import { useInjectBSEditor } from '../context';
import pageModes from '../config/mode';
import useDataFlow from '../hook/useDataFlow';
import { IFrame } from 'image-editor';

/**
 *
 * 数据流查看
 */
export function view(): IPageHandler {
  const editor = useInjectBSEditor();
  const { bsState } = editor;

  const { loadClasses, loadDateSetClassification, loadDataFromFrameSeries } = useDataFlow();

  async function init() {
    const { query } = bsState;
    if (!query.datasetId || !query.dataId) {
      editor.showMsg('error', 'Invalid Query');
      return;
    }

    editor.setMode(pageModes.view);
    editor.showLoading(true);
    try {
      await Promise.all([loadDateSetClassification(), loadClasses(), loadDataInfo()]);

      await editor.loadManager.loadSceneData(0);
    } catch (error: any) {
      editor.handleErr(error, 'Load Error');
    }
    editor.showLoading(false);
    // pageool.editor.tool?.setToolMode(ToolModeEnum.view);
  }

  async function loadDataInfo() {
    const { query } = bsState;

    const dataId = query.dataId;
    if (query.dataType === 'SCENE') {
      // 连续帧
      editor.state.isSeriesFrame = true;
      await loadDataFromFrameSeries(dataId);
    } else {
      createSingleData();
    }
  }
  function createSingleData() {
    const { query } = editor.bsState;

    const dataId = query.dataId;
    const data: IFrame = {
      id: dataId,
      datasetId: query.datasetId,
      loadState: '',
    };

    editor.dataManager.setSceneData([data]);
  }

  function onAction() {}

  return {
    init,
    onAction,
  };
}
