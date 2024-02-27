/**
 *
 */
import Editor from '../common/Editor';
import { IClassificationAttr, IContour, IObject, IObjectBasicInfo, ISaveFormat } from '../types';
import {
  AnnotateObject,
  IFrame,
  utils as EditorUtils,
  IAttrOption,
  ToolType,
  Rect,
  Vector2,
  IPolygonInnerConfig,
  Polygon,
  SourceType,
} from 'image-editor';
import { checkPoints, empty, fixed, validNumber } from './common';
import { classificationToSave } from './class';

function objToArray(obj: Record<string, any> = {}, attrMap: Map<string, any>) {
  const data = [] as any[];
  Object.keys(obj).forEach((key) => {
    const objAttr = obj[key];
    const attr = attrMap.get(key);
    if (empty(objAttr.value) || !attr) return;
    const option = attr?.options?.find((e: IAttrOption) => e.name == objAttr.value) as IAttrOption;
    const hasChild = option?.attributes && option.attributes.length > 0;
    data.push({
      id: key,
      pid: attr.parent,
      name: attr.name || '',
      value: objAttr.value,
      alias: attr.alias || '',
      isLeaf: !hasChild,
      type: attr?.type,
    });
  });
  return data;
}
function updateObjectVersion(obj: AnnotateObject) {
  if (!obj.updateTime || !obj.lastTime) return;
  let version = (validNumber(obj.version) ? obj.version : 0) as number;
  if (obj.updateTime > obj.lastTime) {
    version++;
  }
  obj.lastTime = obj.updateTime;
  obj.version = version;
}
function getContourData(object: AnnotateObject) {
  const returnContour: IContour = {};
  const pos = object.position();
  switch (object.toolType) {
    case ToolType.BOUNDING_BOX:
      const rect = object as Rect;
      returnContour.points = checkPoints(EditorUtils.getRotatedRectPoints(rect));
      returnContour.area = fixed(rect.getArea(), 0) || 0;
      let r = object.rotation() || 0;
      r = r < 0 ? 360 + r : r;
      returnContour.rotation = fixed(r, 1);
      break;
    case ToolType.KEY_POINT:
      returnContour.points = [{ ...pos }];
      break;
    case ToolType.POLYGON:
    case ToolType.POLYLINE:
      const objectPoints = checkPoints(object.attrs.points);
      returnContour.points = EditorUtils.getShapeRealPoint(object, objectPoints);
      const objectInnerPoints = object.attrs.innerPoints as IPolygonInnerConfig[];
      if (objectInnerPoints) {
        const innerPoints = [] as { points: Vector2[] }[];
        objectInnerPoints.forEach((inner) => {
          let _points = checkPoints(inner.points);
          _points = EditorUtils.getShapeRealPoint(object, _points);
          innerPoints.push({ points: _points });
        });
        returnContour.interior = innerPoints;
      }
      if (object instanceof Polygon) returnContour.area = fixed(object.getArea(), 0) || 0;
      break;
  }
  return returnContour;
}

export function convertAnnotate2Object(editor: Editor, annotates: AnnotateObject[]) {
  const objects = [] as IObject[];

  annotates.forEach((obj: any) => {
    const userData = editor.getUserData(obj);
    const classConfig = editor.getClassType(userData.classId || '');

    // updateVersion
    updateObjectVersion(obj);

    const newInfo: IObject = {
      backId: userData.backId,
      classId: classConfig?.id || '',
      classValues: objToArray(editor.getValidAttrs(userData) || {}, editor.attrMap),
      contour: getContourData(obj),
      id: obj.uuid,
      meta: {
        classType: userData.classType || '',
        color: classConfig?.color || '',
      },
      sourceId: userData.sourceId || editor.state.defaultSourceId,
      sourceType: userData.sourceType || SourceType.DATA_FLOW,
      trackId: userData.trackId,
      trackName: userData.trackName,
      type: obj.toolType,
    };
    objects.push(newInfo);
  });
  return objects;
}
export function getDataFlowSaveData(editor: Editor, frames?: IFrame[]) {
  if (!frames) frames = editor.state.frames;
  const dataMap: Record<string, ISaveFormat> = {};
  frames.forEach((frame) => {
    const id = String(frame.id);
    const objectInfos: IObjectBasicInfo[] = [];

    // result object
    const arr = editor.state.annotateModeList;
    arr.forEach((type) => {
      const annitates = editor.dataManager.getFrameObject(frame.id, type) || [];
      const objects = convertAnnotate2Object(editor, annitates);
      objects.forEach((e) => {
        objectInfos.push({
          classAttributes: e,
          classId: +e.classId,
          frontId: e.id,
          id: e.backId,
          sourceId: +e.sourceId,
          sourceType: e.sourceType,
        });
      });
    });
    const dataAnnotations: any[] = [];
    frame.classifications.forEach((classification) => {
      let values = classificationToSave(classification);
      dataAnnotations.push({
        classificationId: classification.id,
        classificationAttributes: {
          id: classification.id,
          values: values,
        },
      });
    });
    dataMap[id] = {
      dataAnnotations: dataAnnotations,
      dataId: id,
      objects: objectInfos,
    };
  });
  const saveDatas = Object.values(dataMap);

  return { saveDatas };
}
