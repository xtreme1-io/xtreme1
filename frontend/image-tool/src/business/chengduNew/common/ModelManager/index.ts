import {
  ToolModelEnum,
  Event,
  utils as EditorUtils,
  AnnotateObject,
  IFrame,
  ModelManager as BaseModelManager,
  LoadStatus,
  DataTypeEnum,
  Const,
  ModelTypeEnum,
  IModel,
} from 'image-editor';
import Editor from '../Editor';
import { IObject, SourceType } from '../../type';
import * as utils from '../../utils';
import * as api from '../../api';
import { t } from '@/lang';

// 模型结果数据
interface IModelData {
  objects?: IObject[];
  segmentFileUrl?: string;
  segmentFileSize?: number;
  segments?: IObject[];
  modelId: number;
}

export default class ModelManager extends BaseModelManager {
  declare editor: Editor;
  modelMap: Map<string, IModelData> = new Map();

  constructor(editor: Editor) {
    super(editor);
    this.editor = editor;
  }
  // segment anything model(加载智能分割npy文件)
  loadedSAMFile(frame: IFrame, model: IModel) {
    if (model.type === ModelTypeEnum.SEMANTIC_SEGMENTATION && model.isInteractive) {
      const nowFrame = this.editor.getCurrentFrame();
      if (frame.id === nowFrame.id) this.editor.emit(Event.MODEL_LOAD_SAM);
    }
  }
  async runSAM() {
    // 智能分割模型
    const { bsState } = this.editor;
    const frame = this.editor.getCurrentFrame();
    if (frame.model && frame.model.state === LoadStatus.LOADING) return;
    const model = this.editor.getModelsByType(ModelTypeEnum.SEMANTIC_SEGMENTATION, true)[0];
    if (!model) throw `runSAM error: the SAM model undefined`;
    const config = {
      datasetId: bsState.datasetId,
      dataIds: [+frame.id],
      modelId: +model.id,
      modelVersion: model?.version,
      dataType: DataTypeEnum.SINGLE_DATA,
      resultFilterParam: {},
    };
    let modelRunTm = 0;
    const startTm = Date.now();
    frame.model = {
      recordId: '',
      id: model.id,
      version: model.version,
      state: LoadStatus.LOADING,
    };
    try {
      const result = await api.runModel(config);
      if (!result.data) throw new Error('Model Run Error');
      frame.model.recordId = result.data;
    } catch (error: any) {
      frame.model = undefined;
      this.editor.showMsg('error', error.message || 'Model Run Error');
    }
    await this.editor.dataManager.pollDataModelResult();
    modelRunTm = Date.now() - startTm;
    const data = {
      modelConfig: { code: model.code, model: model.name },
      time: modelRunTm,
      classes: [],
    };
    this.editor.emit(Event.MODEL_RUN, data);
  }

  async addModelData(modelType: ModelTypeEnum, mode?: ToolModelEnum) {
    const frame = this.editor.getCurrentFrame();
    if (!frame || !frame.model) return;
    const { state } = this.editor;
    const data = this.getModelResult(modelType, frame);
    if (!data) return;
    mode = mode || state.imageToolMode;
    const subTitle =
      mode === ToolModelEnum.INSTANCE ? t('image.addResultConfirm') : t('image.warn-addModel');
    const ok = await this.editor
      .showConfirm({
        title: t('image.Warning'),
        subTitle,
        okText: t('image.confirm'),
        cancelText: t('image.cancel'),
        okDanger: true,
      })
      .then(
        () => true,
        () => false,
      )
      .catch(() => false);
    if (!ok) return;
    if (mode === ToolModelEnum.INSTANCE) {
      await this.addInstanceResult(data);
    } else if (mode === ToolModelEnum.SEGMENTATION) {
      this.editor.showLoading(true);
      await this.addSegmentResult(data);
      this.editor.showLoading(false);
    }
    frame.model = undefined;
    frame.needSave = true;
    this.removeModelResult(frame.id);
    this.editor.emit(Event.MODEL_RESULT_ADD);
  }

  async addInstanceResult(data: IModelData) {
    const { objects, segmentFileUrl } = data;
    if (!objects) {
      const errTips = segmentFileUrl
        ? '检测到有分割模型结果,若想要添加分割模型结果, 请先切换到分割模式'
        : '无模型结果数据';
      this.editor.handleErr(errTips);
      return;
    }
    const annotates = utils.convertObject2Annotate({ objects }, this.editor);
    annotates.forEach((e) => {
      this.editor.initIDInfo(e);
    });
    this.editor.cmdManager.withGroup(() => {
      if (this.editor.state.isSeriesFrame) {
        this.editor.cmdManager.execute('add-track', this.editor.createTrackObj(annotates));
      }
      this.editor.cmdManager.execute('add-object', annotates);
    });
  }
  async addSegmentResult(data: IModelData) {
    const { objects, segmentFileUrl, segments } = data;
    if (!segments || segments.length == 0 || !segmentFileUrl) {
      const errTips = objects
        ? '检测到有实例模型结果, 若想要添加实例模型结果, 请先切换到实例模式'
        : '无模型结果数据';
      this.editor.handleErr(errTips);
      return;
    }
    const segmentObjs = await EditorUtils.image2Mask(segmentFileUrl);
    segments.forEach((e) => {
      const contour = segmentObjs[String(e.no)];
      e.contour = contour;
    });
    const source = { sourceId: this.editor.bsState.currentSource, sourceType: SourceType.MODEL };
    const annotates = utils.segments2Annotate(segments, this.editor, source);
    annotates.forEach((e) => {
      this.editor.initIDInfo(e);
      e.userData.resultStatus = Const.Predicted;
    });
    let clearMask: AnnotateObject[] = [];
    const seg_root = this.editor.dataManager.getFrameRoot('', ToolModelEnum.SEGMENTATION);
    clearMask = seg_root.allObjects.filter(
      (obj) => obj.userData.sourceId === this.editor.bsState.currentSource,
    );
    this.editor.cmdManager.withGroup(() => {
      this.editor.cmdManager.execute('delete-object', clearMask);
      if (this.editor.state.isSeriesFrame) {
        this.editor.cmdManager.execute('add-track', this.editor.createTrackObj(annotates));
      }
      this.editor.cmdManager.execute('add-object', annotates);
    });
  }
}
