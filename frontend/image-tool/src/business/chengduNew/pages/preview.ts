import { IAction, IPageHandler } from '../type';
import { useInjectBSEditor } from '../context';
import modes from '../config/mode';
import useDataFlow from '../hook/useDataFlow';
import { IFrame, ShapeRoot, ToolModelEnum } from 'image-editor';
import * as api from '../api';
import { t } from '@/lang';

export function preview(): IPageHandler {
  const editor = useInjectBSEditor();
  const { bsState } = editor;
  const { loadModels } = useDataFlow();

  async function init() {
    const { bsState } = editor;
    if (!bsState.query.datasetId || !bsState.query.dataIds) {
      editor.showMsg('error', t('image.invalid-query'));
      return;
    }

    overrideBusiness();

    // 设置模式
    editor.setMode(modes.preview);

    editor.showLoading(true);
    try {
      await loadData();
      await Promise.all([
        loadClass(),
        loadClassifications(),
        // 加载模型信息
        loadModels(),
      ]);

      // 加载第一帧data
      await editor.loadFrame(0, false, true);
    } catch (error: any) {
      editor.handleErr(error, t('image.load-error'));
    }

    editor.showLoading(false);
  }

  function overrideBusiness() {
    editor.loadManager.loadFrameData = async function () {
      await this.loadResource();
      await this.loadFrameSource();
    };
  }

  async function loadClass() {
    const classMap: any = {};
    const classIds = bsState.query.classIds || [];
    if (classIds.length === 0) return;

    classIds.forEach((id: any) => {
      classMap[id] = true;
    });

    let classTypes = await api.getDataflowClass(bsState.datasetId);
    classTypes = classTypes.filter((e) => classMap[e.id]);
    editor.setClassTypes(classTypes);
  }

  async function loadClassifications() {
    const classMap: any = {};

    const classificationIds = bsState.query.classificationIds || [];
    if (classificationIds.length === 0) return;

    classificationIds.forEach((id: any) => {
      classMap[id] = true;
    });

    let classifications = await api.getDataflowClassification(bsState.datasetId);
    classifications = classifications.filter((e) => classMap[e.id]);
    editor.bsState.classifications = classifications;
  }

  async function loadData() {
    const { query } = editor.bsState;
    // 连续帧
    if (query.dataType === 'SCENE') {
      editor.state.isSeriesFrame = true;
    }
    createFrames();
    // initShaperoot()
    editor.state.frames.forEach((frame) => {
      let type = ToolModelEnum.INSTANCE;
      const root_ins = new ShapeRoot({ frame, type });
      type = ToolModelEnum.SEGMENTATION;
      const root_seg = new ShapeRoot({ frame, type });
      editor.dataManager.setFrameRoot(frame.id, [root_ins, root_seg]);
    });
  }

  function createFrames() {
    const { query } = editor.bsState;

    const dataIds = query.dataIds || [];
    const frames = dataIds.map((id: any) => {
      return {
        id: id,
        loadState: '',
        classifications: [],
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
