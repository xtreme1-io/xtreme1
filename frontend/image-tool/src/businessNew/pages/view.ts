import { IPageHandler } from '../types';
import { useInjectBSEditor } from '../context';
import useDataFlow from '../hook/useDataflow';
import pageModes from '../configs/mode';
import { IFrame, MsgType } from 'image-editor';

export function view(): IPageHandler {
  const editor = useInjectBSEditor();
  const { state, bsState } = editor;
  const { loadClasses, loadDateSetClassification, loadDataFromFrameSeries } = useDataFlow();

  async function init() {
    let { query } = bsState;
    if (!query.datasetId || !query.dataId) {
      editor.showMsg(MsgType.error, 'Invalid Query');
      return;
    }
    editor.setMode(pageModes.view);

    editor.showLoading(true);
    try {
      await Promise.all([loadClasses(), loadDateSetClassification(), loadDataInfo()]);
      await editor.loadManager.loadSceneData(0);
    } catch (error: any) {
      editor.handleErr(error, 'Load Error');
    }
    editor.showLoading(false);
  }

  async function loadDataInfo() {
    let { query } = bsState;

    let dataId = query.dataId;
    if (query.dataType === 'frame') {
      state.isSeriesFrame = true;
      await loadDataFromFrameSeries(dataId);
    } else {
      createSingleData();
    }
  }

  function createSingleData() {
    let { query } = bsState;

    let dataId = query.dataId;
    let data: IFrame = {
      id: dataId,
      datasetId: query.datasetId,
      teamId: '',
      pointsUrl: '',
      queryTime: '',
      loadState: '',
      needSave: false,
      classifications: [],
    };
    editor.dataManager.setSceneDataByFrames([data]);
  }
  function onAction() {}

  return { init, onAction };
}
