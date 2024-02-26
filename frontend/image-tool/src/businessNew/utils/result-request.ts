import { v4 as uuid } from 'uuid';
import {
  AnnotateObject,
  utils as EditorUtils,
  IPolygonInnerConfig,
  IUserData,
  KeyPoint,
  Line,
  Polygon,
  Rect,
  SourceType,
  ToolType,
} from 'image-editor';
import Editor from '../common/Editor';
import { IContour, IObjectInfo } from '../types';
import { checkPoints } from './common';

export function convertObject2Annotate(editor: Editor, objects: IObjectInfo[]) {
  const annotates = [] as AnnotateObject[];
  console.log(objects);
  objects.forEach((e: IObjectInfo) => {
    const obj = e.classAttributes;
    const contour = (obj.contour || {}) as IContour;
    const classConfig = editor.getClassType(obj.classId || '');

    const userData: IUserData = {
      ...obj?.meta,
      backId: obj.backId,
      classId: classConfig ? classConfig.id : '',
      classType: classConfig ? classConfig.name : '',
      attrs: arrayToObj(obj.classValues),
      modelClass: obj.modelClass,
      confidence: obj.modelConfidence,
      trackId: obj.trackId,
      trackName: obj.trackName,
      sourceId: obj.sourceId || String(e.sourceId) || editor.state.defaultSourceId,
      sourceType: obj.sourceType || e.sourceType || SourceType.DATA_FLOW,
      createdAt: obj.createdAt,
      createdBy: obj.createdBy,
      version: obj.version,
    };
    const points = checkPoints(contour.points || []);
    const interior = contour.interior || [];
    const pointsLen = points.length;
    const type = obj.type.toLocaleUpperCase();
    let annotate;
    switch (type) {
      case ToolType.RECTANGLE:
      case ToolType.BOUNDING_BOX:
        if (pointsLen >= 2) {
          const rectOption = EditorUtils.getRectFromPointsWithRotation(points);
          annotate = new Rect({ ...rectOption, points });
        }
        break;
      case ToolType.POLYGON:
        if (pointsLen >= 3) {
          const pointsOrder = EditorUtils.countPointsOrder(points);
          const innerPoints: IPolygonInnerConfig[] = [];
          interior.forEach((e: any) => {
            let filters = checkPoints(e.coordinate || e.points || []);
            if (filters.length >= 3) {
              if (EditorUtils.countPointsOrder(filters) === pointsOrder) filters.reverse();
              innerPoints.push({ points: filters });
            }
          });
          annotate = new Polygon({ points, innerPoints });
        }
        break;
      case ToolType.POLYLINE:
        if (pointsLen > 1) annotate = new Line({ points });
        break;
      case ToolType.KEY_POINT:
        if (pointsLen > 0) annotate = new KeyPoint({ ...points[0] });
        break;
    }
    if (!annotate) return;
    annotate.uuid = obj.id || uuid();
    annotate.userData = userData;
    annotates.push(annotate);
  });
  return annotates;
}
function arrayToObj(data: any[] = []) {
  const values = {} as Record<string, any>;
  if (!Array.isArray(data)) return values;

  data.forEach((e) => {
    if (Array.isArray(e)) return;
    values[e.id] = e;
  });
  return values;
}
