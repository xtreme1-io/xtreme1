/**
 * 保存时的一些必要的数据处理
 */
import { IFrame, IValidity, ToolModelEnum, ToolType, utils as EditorUtils } from 'image-editor';
import Editor from '../common/Editor';
import { ISegmentInfo, ISourceData } from '../type';
import * as utils from '../utils';
import { ClassBsUtils } from '@basicai/tool-components';
function formatId(fId: string, sId: string) {
  return `${fId}##${sId}`;
}

// 数据流保存
export function getDataFlowSaveData(editor: Editor, frames?: IFrame[]) {
  if (!frames) frames = editor.state.frames;
  const dataMap: Record<string, utils.IBasicAIFormat> = {};
  const segmentInfos: ISegmentInfo[] = [];
  frames.forEach((frame) => {
    const sources = editor.dataManager.getSources(frame) || [];
    if (sources.length === 0) throw 'err';
    sources.forEach((source) => {
      const segmentationMap: Record<string, any> = {};
      const id = formatId(frame.id, source.sourceId);
      if (!dataMap[id]) {
        dataMap[id] = utils.getBasicAIFormat({
          dataId: +frame.id,
          sourceType: source.sourceType,
          sourceId: +source.sourceId,
          validity: IValidity.VALID,
          classifications: [],
          objects: [],
          segments: [],
          segmentations: [],
          // 临时参数
          segmentationMap: segmentationMap,
          segmentObjectsMap: {},
          haveSegmentObjects: false,
        });
      }
    });
    // result object
    const arr = editor.state.ToolModeList;
    arr.forEach((type) => {
      const annitates = editor.dataManager.getFrameObject(frame.id, type) || [];
      const objects = utils.convertAnnotate2Object(annitates, editor);
      let segmentNo = EditorUtils.SEGMENT_NO;
      objects.forEach((e) => {
        const id = formatId(frame.id, e.sourceId || '-1');
        const saveSourceData = dataMap[id];
        if (!saveSourceData) return;
        if (type === ToolModelEnum.SEGMENTATION) {
          if (e.type === ToolType.MASK) e.no = segmentNo++;
          saveSourceData.segments.push(e);
          if (!e.deviceName) return;
          if (!saveSourceData.segmentObjectsMap[e.deviceName]) {
            saveSourceData.segmentObjectsMap[e.deviceName] = [];
          }
          saveSourceData.segmentObjectsMap[e.deviceName].push(e);
          saveSourceData.haveSegmentObjects = true;
        } else {
          saveSourceData.objects.push(e);
        }
      });
    });

    // save classification
    const allSourceData = editor.dataManager.getAllSourceData(frame);
    if (allSourceData) {
      Object.keys(allSourceData).forEach((key) => {
        const sourceData = (allSourceData as any)[key] as ISourceData;
        const id = formatId(frame.id, sourceData.id);
        const saveSourceData = dataMap[id];
        if (!saveSourceData) return;

        const classificationValues = composeClassificition(sourceData);

        saveSourceData.validity = sourceData.validity;
        saveSourceData.classifications = classificationValues;
      });
    }
  });

  const saveDatas = Object.values(dataMap);
  // segmentInfos
  saveDatas.forEach((sourceData: any) => {
    if (sourceData.haveSegmentObjects) {
      const segObjsMap = sourceData.segmentObjectsMap;
      Object.keys(segObjsMap).forEach((deviceName) => {
        const objs = segObjsMap[deviceName];
        if (objs.length > 0) {
          segmentInfos.push({
            uploadSource: 'DATA_FLOW_SEGMENT_RESULT',
            datasetId: editor.bsState.datasetId,
            dataId: sourceData.dataId,
            sourceId: sourceData.sourceId,
            fileName: `${formatId(sourceData.dataId, sourceData.sourceId)}.png`,
            deviceName,
            objects: objs,
            sourceData,
          });
          // sourceData.segmentations.push();
        }
      });
    }
    delete sourceData.segmentationMap;
    delete sourceData.segmentObjectsMap;
    delete sourceData.haveSegmentObjects;
  });

  return {
    saveDatas,
    segmentInfos,
  };
}

// 任务流数据保存
export function getTaskSaveData(editor: Editor, frames?: IFrame[]) {
  if (!frames) frames = editor.state.frames;
  const dataMap: Record<string, utils.IBasicAIFormat> = {};
  const segmentInfos: ISegmentInfo[] = [];
  frames.forEach((frame) => {
    const sourceData = editor.dataManager.getSourceData(frame, '-1');
    if (!sourceData) return;
    const segmentationMap: Record<string, any> = {};
    const saveSourceData = utils.getBasicAIFormat({
      dataId: +frame.id,
      sourceId: +editor.bsState.taskId,
      sourceType: 'TASK',
      validity: sourceData.validity || IValidity.VALID,
      classifications: [],
      objects: [],
      segments: [],
      segmentations: [],
      // 临时参数
      segmentationMap: segmentationMap,
      segmentObjectsMap: {},
      haveSegmentObjects: false,
    });
    // save objects
    const arr = editor.state.ToolModeList;
    arr.forEach((type) => {
      const annitates = editor.dataManager.getFrameObject(frame.id, type) || [];
      const objects = utils.convertAnnotate2Object(annitates, editor);
      let segmentNo = EditorUtils.SEGMENT_NO;
      objects.forEach((e) => {
        if (type === ToolModelEnum.SEGMENTATION) {
          if (e.type === ToolType.MASK) e.no = segmentNo++;
          saveSourceData.segments.push(e);
          if (!e.deviceName) return;
          if (!saveSourceData.segmentObjectsMap[e.deviceName]) {
            saveSourceData.segmentObjectsMap[e.deviceName] = [];
          }
          saveSourceData.segmentObjectsMap[e.deviceName].push(e);
          saveSourceData.haveSegmentObjects = true;
        } else {
          saveSourceData.objects.push(e);
        }
      });
    });
    // save classification
    const classificationValues = composeClassificition(sourceData);
    saveSourceData.classifications = classificationValues;

    dataMap[formatId(frame.id, '-1')] = saveSourceData;
  });

  const saveDatas = Object.values(dataMap);
  // segmentInfos
  saveDatas.forEach((sourceData: any) => {
    if (sourceData.haveSegmentObjects) {
      const segObjsMap = sourceData.segmentObjectsMap;
      Object.keys(segObjsMap).forEach((deviceName) => {
        const objs = segObjsMap[deviceName];
        if (objs.length > 0) {
          segmentInfos.push({
            uploadSource: 'TASK_FLOW_SEGMENT_RESULT',
            datasetId: editor.bsState.datasetId,
            dataId: sourceData.dataId,
            taskId: editor.bsState.taskId,
            sourceId: sourceData.sourceId,
            fileName: `${formatId(sourceData.dataId, sourceData.sourceId)}.png`,
            deviceName,
            objects: objs,
            sourceData,
          });
          // sourceData.segmentations.push();
        }
      });
    }
    delete sourceData.segmentationMap;
    delete sourceData.segmentObjectsMap;
    delete sourceData.haveSegmentObjects;
  });

  return {
    saveDatas,
    segmentInfos,
  };
}
// 保存时同步classification数据
export function composeClassificition(sourceData: ISourceData) {
  const list = [] as any[];
  if (!sourceData) return list;
  sourceData.classifications.forEach((classification) => {
    const values = ClassBsUtils.convertAttrToBackend(classification.attrs);
    if (values.length === 0) return;

    const oldData = sourceData.oldClassifications
      ? sourceData.oldClassifications[classification.id]
      : undefined;

    values.forEach((val) => {
      if (!sourceData.needCompose) {
        val.attributeVersion = oldData?.valueMap[val.id]?.attributeVersion || 1;
      }
    });

    const classificationVersion = sourceData.needCompose
      ? classification.classificationVersion
      : oldData?.classificationVersion || 1;

    list.push({
      classificationId: Number(classification.id) || classification.id,
      classificationVersion,
      values: values,
    });
  });
  return list;
}
