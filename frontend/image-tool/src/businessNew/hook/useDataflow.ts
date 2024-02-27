import { useInjectBSEditor } from '../context';
import * as api from '../api';
import { BSError, Event } from 'image-editor';

export default function useDataFlow() {
  const editor = useInjectBSEditor();
  const { bsState, state } = editor;

  async function loadRecord() {
    try {
      const { recordId } = bsState;
      const { dataInfos, isSeriesFrame, seriesFrames } = await api.getInfoByRecordId(recordId);

      state.isSeriesFrame = isSeriesFrame;
      state.sceneIds = seriesFrames || [];
      bsState.datasetId = dataInfos[0].datasetId + '';

      editor.dataManager.setSceneDataByFrames(dataInfos);
    } catch (error) {
      throw error instanceof BSError
        ? error
        : new BSError('', editor.lang('load-record-error'), error);
    }
  }
  async function loadClasses() {
    try {
      const config = await api.getDataflowClass(bsState.datasetId);
      editor.setClassTypes(config);
    } catch (error) {
      throw error instanceof BSError
        ? error
        : new BSError('', editor.lang('load-class-error'), error);
    }
  }
  async function loadDateSetClassification() {
    try {
      const classifications = await api.getDataflowClassification(bsState.datasetId);
      bsState.classifications = classifications;
    } catch (error) {
      throw error instanceof BSError
        ? error
        : new BSError('', editor.lang('load-dataset-classification-error'), error);
    }
  }
  async function loadModels() {
    try {
      const models = await api.getModelList();
      state.models = models;
      editor.emit(Event.MODEL_LOADED);
    } catch (error) {
      throw error instanceof BSError
        ? error
        : new BSError('', editor.lang('load-model-error'), error);
    }
  }
  async function loadDataFromFrameSeries(frameSeriesId: string) {
    try {
      const { datasetId } = editor.bsState;
      const frames = await api.getFrameSeriesData(datasetId, frameSeriesId);
      if (frames.length === 0) throw new BSError('', 'load scene error');
      // state.frames = frames;
      state.sceneIds = [frameSeriesId];
      editor.dataManager.setSceneDataByFrames(frames);
    } catch (error) {
      throw error instanceof BSError ? error : new BSError('', 'load scene error', error);
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
