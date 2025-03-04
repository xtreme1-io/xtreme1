import {
  IUserData,
  Rect,
  Polygon,
  Line,
  utils as EditorUtils,
  IPolygonInnerConfig,
  AnnotateObject,
  ToolType,
  Vector2,
  GroupObject,
  KeyPoint,
  CircleShape,
  SplineCurve,
  Skeleton,
  Circle,
  SkeletonEdge,
  MaskShape,
  Cuboid,
  Ellipse,
} from 'image-editor';
import Editor from '../common/Editor';
import { IFrameData, IObject } from '../type';
import { empty } from './common';
import { ClassUtils } from '@basicai/tool-components';
// import bugData from './bug.json';

interface IContour {
  points?: Vector2[]; // 非骨骼结果
  interior?: { points: Vector2[] }[]; // polygon
  area?: number; // 闭合图形: 矩形, 多边形, mask
  nodes?: ISkeNode[]; // skeleton
  lines?: ISkeLine[]; // skeleton
  pointN?: number; // skeleton valided points number
  // segment mask
  maskData?: any;
  box?: number[];
  radius?: number;
  radiusX?: number;
  radiusY?: number;

  rotation?: number;
}
interface ISkeNode {
  id: string;
  position: Vector2;
  attr: any;
}
interface ISkeLine {
  start: number;
  end: number;
  attr?: any;
}
function checkPoints(points: Vector2[]) {
  if (!Array.isArray(points)) return [];
  const keys: String[] = [];
  return points.filter((point) => {
    if (
      point &&
      typeof point.x === 'number' &&
      typeof point.y === 'number' &&
      !isNaN(point.x) &&
      !isNaN(point.y) &&
      isFiniteNumber(point.x) &&
      isFiniteNumber(point.y) &&
      !keys.includes(fixed(point.x) + '##' + fixed(point.y))
    ) {
      point.x = fixed(point.x);
      point.y = fixed(point.y);
      keys.push(point.x + '##' + point.y);
      return true;
    }
    return false;
  });
}
function fixed(num: number, len: number = 4) {
  return Number(num.toFixed(len));
}

// TODO 获取数据的转换
export function convertObject2Annotate(
  data: { objects: IObject[]; sourceId?: string | number; sourceType?: string },
  editor: Editor,
) {
  // bug data test //
  // data = bugData.resultData.saveDatas[0] as any;
  // data.sourceId = '-1';
  // data.sourceType = 'DATA_FLOW';
  // bug data test //

  const annotates = [] as AnnotateObject[];
  if (!data) return annotates;
  let { objects = [] } = data;
  const { sourceId, sourceType } = data;
  const groups = [] as IObject[];
  const others = [] as IObject[];
  objects.forEach((e) => {
    if (e.type === ToolType.GROUP) groups.push(e);
    else others.push(e);
  });
  objects = [...groups, ...others];

  const objectMap = {} as Record<string, AnnotateObject>;
  const groupIdMap = {} as Record<string, string[]>;

  objects.forEach((obj: IObject) => {
    const contour = (obj.contour || {}) as IContour;
    const classConfig = editor.getClassType(obj.classId || '');

    const userData: IUserData = {
      pointsLimit: classConfig?.getToolOptions()?.polygonPoint || 0,
      ...obj.meta,
      classId: classConfig ? classConfig.id : '',
      classType: classConfig ? classConfig.name : '',
      classVersion: obj.classVersion || 1,
      attrs: arrayToObj(obj.classValues),
      modelClass: obj.modelClass,
      confidence: obj.modelConfidence,
      trackId: obj.trackId,
      trackName: obj.trackName,
      sourceId,
      sourceType,
    };

    const points = checkPoints(contour.points || []);
    const interior = contour.interior || [];
    const pointsLen = points.length;

    const type = obj.type.toLocaleUpperCase();
    let object: AnnotateObject | undefined;
    if (type === ToolType.BOUNDING_BOX || type === ToolType.RECTANGLE) {
      if (pointsLen >= 2) {
        const rectOption = EditorUtils.getRectFromPointsWithRotation(points as any);
        object = new Rect({ ...rectOption, points });
      }
    } else if (type === ToolType.POLYGON) {
      if (pointsLen >= 3) {
        const innerPoints: IPolygonInnerConfig[] = [];
        interior.forEach((e: any) => {
          const filterPoints = checkPoints(e.coordinate || e.points || []);
          if (filterPoints.length > 2) innerPoints.push({ points: filterPoints });
        });
        object = new Polygon({ points, innerPoints });
      }
    } else if (type === ToolType.POLYLINE) {
      if (pointsLen > 1) object = new Line({ points });
    } else if (type === ToolType.IMAGE_CUBOID) {
      if (pointsLen > 1) object = new Cuboid({ points });
    } else if (type === ToolType.KEY_POINT) {
      if (pointsLen > 0) object = new KeyPoint({ ...points[0] });
    } else if (type === ToolType.GROUP) {
      object = new GroupObject();
    } else if (type === ToolType.CURVE) {
      if (pointsLen > 1) object = new SplineCurve({ points });
    } else if (type === ToolType.SKELETON) {
      object = new Skeleton();
      const color = classConfig ? classConfig.color : '#ffffff';
      const nodes = contour.nodes || [];
      const anchors = nodes.map((node, index) => {
        const anchor = new Circle({
          ...node.position,
          valid: node.attr.valid,
          draggable: false,
          // stroke: color,
          fill: node.attr.color || color,
        });
        anchor.uuid = node.id;
        anchor.userData = {
          tagId: node.attr.id,
          tag: node.attr.code,
          tagColor: node.attr.color,
          index: index,
        };
        return anchor;
      });
      const lines = contour.lines || [];
      const { pointList = [], lineList = [] } = classConfig?.getToolOptions().skeletonConfig || {};
      const edges = lines.map((lineConfig) => {
        const [index1, index2] = [lineConfig.start - 1, lineConfig.end - 1];
        const [anchor1, anchor2] = [anchors[index1], anchors[index2]];
        const [cfg1, cfg2] = [pointList[index1], pointList[index2]];
        const skeCfg = lineList.filter((e: any) => {
          return e.relationIds[0] === cfg1?.uuid && e.relationIds[1] === cfg2?.uuid;
        });
        const edgeColor = skeCfg?.[0]?.color || classConfig?.color;
        return new SkeletonEdge(anchor1, anchor2, { stroke: edgeColor, fill: edgeColor });
      });
      (object as Skeleton).setData(anchors, edges);
      userData.skeletonName = userData.classType;
    } else if (type === ToolType.CIRCLE) {
      if (pointsLen > 0) object = new CircleShape({ ...points[0], radius: contour.radius });
    } else if (type === ToolType.ELLIPSE) {
      if (pointsLen > 0)
        object = new Ellipse({
          ...points[0],
          radiusX: contour.radiusX,
          radiusY: contour.radiusY,
          rotation: contour.rotation,
        });
    }

    if (!object) return;

    object.uuid = obj.id;
    object._log_op = obj._log_op as any;
    object.userData = userData;
    annotates.push(object);
    if (object._deleted) object.visible(false);
    if (!object.isGroup()) editor.dataManager.updateObjectByUserData(object);
    objectMap[object.uuid] = object;
    obj.groups?.forEach((gid) => {
      if (gid == obj.id) return; // 遇到了自己在自己组里的情况 这里处理一下
      if (groupIdMap[gid]) groupIdMap[gid].push(obj.id);
      else groupIdMap[gid] = [obj.id];
    });

    // 统计
    object.createdAt = obj.createdAt;
    object.createdBy = obj.createdBy;
    object.version = obj.version;
    // updateTime lastTime只是临时信息
    object.lastTime = Date.now();
    object.updateTime = object.lastTime;
  });
  // debugger;
  // 处理 group
  Object.keys(groupIdMap).forEach((gid) => {
    const objIds = groupIdMap[gid];
    const objs = objIds.map((id) => objectMap[id]);
    const group = objectMap[gid] as GroupObject;
    if (group) {
      group.addObject(objs);
    } else {
      objs.forEach((obj) => {
        obj.groups = obj.groups.filter((g) => g.uuid !== gid);
      });
    }
  });

  return annotates;
}
export function segments2Annotate(
  segments: IObject[],
  editor: Editor,
  source: { sourceId: string | number; sourceType: string },
) {
  const annotates = [] as AnnotateObject[];
  const { sourceId, sourceType } = source;

  segments.forEach((obj: IObject) => {
    const contour = (obj.contour || {}) as IContour;
    const classConfig = editor.getClassType(obj.classId || '');

    const userData: IUserData = {
      ...obj.meta,
      classId: classConfig?.id || '',
      classType: classConfig?.name || '',
      classVersion: obj.classVersion || 1,
      attrs: arrayToObj(obj.classValues),
      modelClass: obj.modelClass,
      confidence: obj.modelConfidence,
      trackId: obj.trackId,
      trackName: obj.trackName,
      sourceId,
      sourceType,
    };

    const type = obj.type.toLocaleUpperCase();
    let object;
    if (type === ToolType.MASK) {
      const maskData = contour.maskData || [];
      const box = contour.box || [];
      const pathArray = EditorUtils.getPathByMaskData(maskData, box);
      object = new MaskShape({ maskData, box, pathArray });
    }
    if (!object) return;

    object.uuid = obj.id;
    object._log_op = obj._log_op as any;
    object.userData = userData;
    if (object._deleted) object.visible(false);
    editor.dataManager.updateObjectByUserData(object);
    annotates.push(object);

    // 统计
    object.createdAt = obj.createdAt;
    object.createdBy = obj.createdBy;
    object.version = obj.version;
    // updateTime lastTime只是临时信息
    object.lastTime = Date.now();
    object.updateTime = object.lastTime;
  });
  // debugger;
  return annotates;
}
export async function segmentsFile2Annotate(data: IFrameData, editor: Editor) {
  const { segments, segmentations, sourceId, sourceType } = data;
  const segmentFileUrl = segmentations[0].segmentPointsFilePath || segmentations[0].resultFilePath;
  if (!segmentFileUrl) return [];
  const segmentObjs = await EditorUtils.image2Mask(segmentFileUrl);
  segments.forEach((e) => {
    const contour = segmentObjs[String(e.no)];
    e.contour = contour;
    e.sourceId = sourceId + '';
    e.sourceType = sourceType;
  });
  return segments2Annotate(segments, editor, { sourceId, sourceType });
}
export async function getSegmentAnnotates(data: IFrameData, editor: Editor) {
  const { segments, sourceId, sourceType } = data || {};
  if (!segments || segments.length === 0) return [];
  const noContourSegment = segments.find((e) => !e.contour || !e.contour.maskData);
  if (noContourSegment) {
    return await segmentsFile2Annotate(data, editor);
  } else {
    return segments2Annotate(segments, editor, { sourceId, sourceType });
  }
}

// TODO 保存数据的转换
export function convertAnnotate2Object(annotates: AnnotateObject[], editor: Editor) {
  const objects = [] as IObject[];

  annotates.forEach((obj) => {
    const userData = editor.getUserData(obj);
    const classConfig = editor.getClassType(userData.classId || '');

    updateObjectVersion(obj);

    const type = obj.toolType;
    const contour = getContourData(obj, editor);
    const groups = obj.groups.filter((g) => g.uuid != obj.uuid).map((g) => g.uuid);

    // debugger;
    const compose = editor.trackManager.isChanged(userData.trackId) || obj.userData.needCompose;
    const classVersion = (compose ? classConfig?.classVersion : userData?.classVersion) || 1;
    const newInfo: any = {
      id: obj.uuid,
      type: type,
      groups,
      trackId: userData.trackId,
      trackName: userData.trackName,
      classId: classConfig ? Number(classConfig.id) : undefined,
      classValues: objToArray(
        editor.getValidAttrs(userData) || {},
        classConfig?.attrMap || {},
        compose,
      ),
      classVersion,
      className: userData.classType,
      modelConfidence: userData.confidence,
      modelClass: userData.modelClass,
      contour,
      meta: {
        classType: userData.classType,
        color: classConfig?.color,
        pointsLimit: userData.pointsLimit || 0,
        resultStatus: userData.resultStatus,
      },
      deviceName: obj.frame.imageData?.deviceName,
      // 统计信息
      createdAt: obj.createdAt,
      createdBy: obj.createdBy,
      version: obj.version,
    };
    console.log(newInfo.classValues);
    objects.push(newInfo);
  });
  return objects;
}

function getContourData(object: AnnotateObject, editor: Editor) {
  const returnContour: IContour = {};

  const position = object.position();
  if (object instanceof Rect) {
    // rect
    const points = checkPoints(EditorUtils.getRotatedRectPoints(object));
    returnContour.points = points.map((e, i) => {
      const attr = object.attrs.points?.[i]?.attr;
      if (attr && attr.attrs) {
        attr.attrs = editor.getValidAttrs(attr);
      }
      return { x: e.x, y: e.y, attr: attr };
    });
    returnContour.area = fixed(object.getArea(), 0) || 0;
    let r = object.rotation() || 0;
    r = r < 0 ? 360 + r : r;
    returnContour.rotation = fixed(r, 1);
  } else if (object instanceof KeyPoint) {
    // KeyPoint
    returnContour.points = [{ ...position }];
  } else if (object instanceof Skeleton) {
    let pointN = 0;
    const nodes: ISkeNode[] = object.points.map((point) => {
      const pointPos = point.position();
      const userData = point.userData;
      if (point.attrs.valid) pointN++;
      return {
        id: point.uuid,
        position: { x: pointPos.x + position.x, y: pointPos.y + position.y },
        attr: {
          id: userData.tagId,
          code: userData.tag,
          color: userData.tagColor,
          valid: point.attrs.valid,
        },
      };
    });
    returnContour.nodes = nodes;
    returnContour.pointN = pointN;
    const lines: ISkeLine[] = object.edges.map((edge) => {
      return {
        start: edge.source.userData.index + 1,
        end: edge.target.userData.index + 1,
        color: edge.attrs.stroke || edge.attrs.fill,
      };
    });
    returnContour.lines = lines;
  } else if (
    object instanceof Polygon ||
    object instanceof Line ||
    object instanceof SplineCurve ||
    object instanceof Cuboid
  ) {
    // Polygon Line SplineCurve
    const points = [] as Vector2[];
    const objectPoints = checkPoints(object.attrs.points);
    objectPoints.forEach((e) => {
      const p: Vector2 = { x: e.x + position.x, y: e.y + position.y };
      if (e.attr) {
        p.attr = e.attr;
        if (p.attr.attrs) {
          p.attr.attrs = editor.getValidAttrs(p.attr);
        }
      }
      points.push(p);
    });
    returnContour.points = points;

    const objectInnerPoints = object.attrs.innerPoints as IPolygonInnerConfig[];
    if (objectInnerPoints) {
      const innerPoints = [] as { points: Vector2[] }[];
      objectInnerPoints.forEach((inner) => {
        const _points = checkPoints(inner.points).map((e) => {
          if (e.attr?.attrs) {
            e.attr.attrs = editor.getValidAttrs(e.attr);
          }
          return { x: e.x + position.x, y: e.y + position.y, attr: e.attr };
        });
        innerPoints.push({ points: _points });
      });
      returnContour.interior = innerPoints;
    }
    if (object instanceof Polygon) returnContour.area = fixed(object.getArea(), 0) || 0;
  } else if (object instanceof MaskShape) {
    returnContour.area = fixed(object.getArea(), 0) || 0;
    returnContour.maskData = object.maskData;
    returnContour.box = object.box;
  } else if (object instanceof CircleShape) {
    returnContour.radius = object.radius();
    returnContour.points = [{ ...position }];
  } else if (object instanceof Ellipse) {
    let r = object.rotation() || 0;
    r = r < 0 ? 360 + r : r;
    returnContour.points = [{ ...position }];
    returnContour.rotation = fixed(r, 1);
    returnContour.radiusX = object.radiusX();
    returnContour.radiusY = object.radiusY();
  }

  return returnContour;
}

function objToArray(obj: Record<string, any> = {}, attrMap: Record<string, any>, compose: boolean) {
  const data = [] as any[];
  const isLeafRecord: Record<string, boolean> = {};
  Object.keys(obj).forEach((key) => {
    const attr = attrMap[key];
    if (attr) isLeafRecord[attr.id] = true;
  });
  Object.keys(obj).forEach((key) => {
    const attr = attrMap[key];
    if (empty(obj[key].value) || !attr) return;
    if (attr.parent && isLeafRecord[attr.parent.id]) isLeafRecord[attr.parent.id] = false;
  });
  Object.keys(obj).forEach((key) => {
    const objAttr = obj[key];
    const attr = attrMap[key];
    if (empty(objAttr.value) || !attr) return;
    const attributeVersion = (compose ? attr?.attributeVersion : objAttr?.attributeVersion) || 1;
    const isParentMulti = attr.parent && ClassUtils.isAttrValueTypeArr(attr.parent?.type);
    const isLeaf = isLeafRecord[attr.id] ?? true;
    data.push({
      id: key,
      pid: attr.parent?.id,
      name: attr.name || '',
      value: objAttr.value,
      alias: attr.alias || '',
      isLeaf: isLeaf,
      pvalue: isParentMulti ? attr.parentValue : undefined,
      type: attr?.type,
      attributeVersion,
    });
  });
  return data;
}

function arrayToObj(data: any[] = []) {
  const values = {} as Record<string, any>;
  if (!Array.isArray(data)) return values;

  data.forEach((e) => {
    // 忽略老数据
    if (Array.isArray(e)) return;
    values[e.id] = e;
  });
  return values;
}

export function updateObjectVersion(obj: AnnotateObject) {
  if (!obj.updateTime || !obj.lastTime) return;
  let version = (isFiniteNumber(obj.version) ? obj.version : 0) as number;
  if (obj.updateTime > obj.lastTime) {
    version++;
  }
  obj.lastTime = obj.updateTime;
  obj.version = version;
}

function isFiniteNumber(value: any) {
  return !empty(value) && isFinite(value);
}

export interface IBasicAIFormat {
  version?: string;
  // type: '3D_LABEL' | '2D_LABEL' | '3D_SEGMENT' | '2D_SEGMENT';
  dataId: string | number;
  sourceId?: string | number;
  sourceType?: 'DATA_FLOW' | 'TASK' | 'MODEL' | 'EXTERNAL_GROUND_TRUTH';
  validity: string;
  classifications: any[];
  objects: IObject[];
  segments: IObject[];
  segmentations: any[];
  [key: string]: any;
}

// https://zioug6is98.larksuite.com/wiki/wikusTjid7To5CzO20Vjw0oWo2f
export function getBasicAIFormat(config: IBasicAIFormat) {
  const data: IBasicAIFormat = {
    version: '1.0',
    ...config,
  };
  return data;
}
