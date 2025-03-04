import { useInjectBSEditor } from '../context';
import * as api from '../api';
import { BSError, Event, ModelTypeEnum } from 'image-editor';
import { t } from '@/lang';

export default function useDataFlow() {
  const editor = useInjectBSEditor();
  const { bsState, state } = editor;

  async function loadClasses() {
    try {
      const config = await api.getDataflowClass(bsState.datasetId);
      editor.setClassTypes(config);
    } catch (error) {
      throw error instanceof BSError ? error : new BSError('', t('image.load-class-error'), error);
    }
  }

  async function loadModels() {
    try {
      const models = await api.getModelList();
      state.models = models;
      const interactiveModels = editor.getModelsByType(ModelTypeEnum.OBJECT_DETECTION, true);
      if (interactiveModels && interactiveModels.length > 0) {
        state.config.interactiveModel = interactiveModels[0].id;
      }
      const config: any = { datasetId: bsState.datasetId };
      await models.forEach(async (model) => {
        if (model.classes && model.classes.length > 0) {
          config.modelId = model.id;
          const res = await api.getModelMapClass(config);
          model.mapClass = res;
        }
      });
      editor.emit(Event.MODEL_LOADED);
    } catch (error) {
      console.log('model load error', error);
    }
  }

  async function loadDateSetClassification() {
    try {
      const classifications = await api.getDataflowClassification(bsState.datasetId);
      bsState.classifications = classifications;
    } catch (error) {
      throw error instanceof BSError
        ? error
        : new BSError('', t('image.load-dataset-classification-error'), error);
    }
  }

  async function loadRecord() {
    try {
      const { recordId } = bsState;
      const { datasetId, dataInfos, isSeriesFrame, seriesFrames } = await api.getInfoByRecordId(
        recordId,
      );

      state.isSeriesFrame = isSeriesFrame;
      state.sceneIds = seriesFrames || [];
      bsState.datasetId = datasetId + '';

      editor.dataManager.setSceneData(dataInfos);
    } catch (error) {
      throw error instanceof BSError ? error : new BSError('', t('image.load-record-error'), error);
    }
  }
  async function loadDataFromFrameSeries(frameSeriesId: string) {
    try {
      const { datasetId } = editor.bsState;
      const framesMap = await api.getFrameSeriesData(datasetId, frameSeriesId);
      const frames = framesMap[frameSeriesId];
      if (frames.length === 0) throw new BSError('', t('image.load-frame-series-error'));
      state.sceneIds = [frameSeriesId];
      editor.dataManager.setSceneData(frames);
    } catch (error) {
      throw error instanceof BSError
        ? error
        : new BSError('', t('image.load-frame-series-error'), error);
    }
  }

  return {
    loadModels,
    loadClasses,
    loadRecord,
    loadDateSetClassification,
    loadDataFromFrameSeries,
  };
}
