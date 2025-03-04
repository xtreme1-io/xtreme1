import { useInjectEditor } from '../../context';
import { ISkeletonInfo, ITag } from '../SkeletonTool/type';
import {
  AnnotateObject,
  Skeleton,
  IUserData,
  ToolType,
  Rect,
  Polygon,
  Line,
  Vector2,
  MaskShape,
  utils,
  ClassLimitInfo,
  GroupObject,
  IClassTypeItem,
  LineDrawModeEnum,
} from '../../../image-editor';
import { t } from '@/lang';

export interface ITextItem {
  objectId: string;
  x: number;
  y: number;
  trackName: string;
  className: string;
  color: string;
  limitInfo?: ClassLimitInfo;
  zindex?: number;
}

export default function useClassTag() {
  const editor = useInjectEditor();
  const limitTool = [
    ToolType.BOUNDING_BOX,
    ToolType.RECTANGLE,
    ToolType.POLYGON,
    ToolType.POLYGON_PLUS,
    ToolType.POLYLINE,
    ToolType.MASK,
  ];

  function checkArea(area: number, min?: number, max?: number) {
    if (min && area < min) return ClassLimitInfo.areaS;
    if (max && area > max) return ClassLimitInfo.areaL;
    return ClassLimitInfo.noInfo;
  }
  function checkWidth(length: number, min?: number, max?: number) {
    if (min && length < min) return ClassLimitInfo.widthS;
    if (max && length > max) return ClassLimitInfo.widthL;
    return ClassLimitInfo.noInfo;
  }
  function checkHeight(width: number, min?: number, max?: number) {
    if (min && width < min) return ClassLimitInfo.heightS;
    if (max && width > max) return ClassLimitInfo.heightL;
    return ClassLimitInfo.noInfo;
  }
  function checkObjectLimit(obj: AnnotateObject, classType: IClassTypeItem) {
    if (!limitTool.includes(classType.toolType)) return;
    if (obj instanceof Rect) checkRectLimit(obj, classType);
    else if (obj instanceof Polygon) checkPolygonLimit(obj, classType);
    else if (obj instanceof Line && obj.className === 'line') checkPolylineLimit(obj, classType);
    else if (obj instanceof MaskShape) checkMaskLimit(obj, classType);
  }
  function checkRectLimit(obj: Rect, classType: IClassTypeItem) {
    obj.userData.limitState = ClassLimitInfo.noInfo;
    const { areaLimit = [], lengthLimit = [], widthLimit = [] } = classType.getToolOptions();
    const { width, height } = obj.attrs;
    const area = width * height;
    obj.userData.limitState = checkArea(area, areaLimit[0], areaLimit[1]);
    if (obj.userData.limitState) return;
    obj.userData.limitState = checkWidth(width, lengthLimit[0], lengthLimit[1]);
    if (obj.userData.limitState) return;
    obj.userData.limitState = checkHeight(height, widthLimit[0], widthLimit[1]);
  }
  function checkPolygonLimit(obj: Polygon, classType: IClassTypeItem) {
    obj.userData.limitState = ClassLimitInfo.noInfo;
    const { areaLimit = [], lengthLimit = [], widthLimit = [] } = classType.getToolOptions();
    const area = utils.getArea(obj.attrs.points);
    obj.userData.limitState = checkArea(area, areaLimit[0], areaLimit[1]);
    if (obj.userData.limitState) return;
    const { width, height } = obj.getBoundRect();
    obj.userData.limitState = checkWidth(width, lengthLimit[0], lengthLimit[1]);
    if (obj.userData.limitState) return;
    obj.userData.limitState = checkHeight(height, widthLimit[0], widthLimit[1]);
  }
  function checkMaskLimit(obj: MaskShape, classType: IClassTypeItem) {
    obj.userData.limitState = '';
    const { areaLimit = [] } = classType.getToolOptions();
    const area = obj.getArea();
    obj.userData.limitState = checkArea(area, areaLimit[0], areaLimit[1]);
  }
  function checkPolylineLimit(obj: Line, classType: IClassTypeItem) {
    obj.userData.limitState = ClassLimitInfo.noInfo;
    const { directionLimit } = classType.getToolOptions();
    if (!directionLimit) return;
    if (directionLimit === LineDrawModeEnum.Horizontal && !utils.isHorizontal(obj.attrs.points)) {
      obj.userData.limitState = ClassLimitInfo.nonH;
    } else if (
      directionLimit == LineDrawModeEnum.Vertical &&
      !utils.isVerticality(obj.attrs.points)
    ) {
      obj.userData.limitState = ClassLimitInfo.nonV;
    }
  }

  /**
   * 标注结果 class 标签
   */
  // 标注结果的点的标签
  function getAnchorInfo(points: Vector2[], obj: AnnotateObject, typeIndex: number = -1) {
    const list: ITextItem[] = [];
    if (!points || points.length === 0) return list;
    const scale = editor.mainView.stage.scaleX();
    points.forEach((p, i) => {
      if (!p?.attr) return;
      const { classId, color } = p.attr;
      const classConfig = editor.getClassType(classId || '');
      if (!classConfig) return;
      const pos = { x: p.x * scale, y: p.y * scale + 25 };
      const className = editor.showNameOrAlias(classConfig);
      const isSelect =
        typeIndex === editor.mainView.currentEditTool?.anchorType() &&
        editor.mainView.currentEditTool?.selectAnchorIndex() === i;
      const zindex = isSelect ? 10 : 0;
      // const trackName = `${userData.trackName} - ${i}`;
      const objectId = `${obj.uuid}#${i}#${typeIndex}`;
      list.push({
        ...pos,
        className,
        color,
        zindex,
        trackName: '',
        objectId,
      });
    });
    return list;
  }
  // 骨骼点特殊处理
  function getSkeletonInfo(object: Skeleton) {
    const infos = [] as ISkeletonInfo[];
    const { stroke } = object.attrs;
    const { trackName, classId, skeletonName } = editor.getUserData(object);
    const classConfig = editor.getClassType(classId || '');
    const tagMap: Record<string, ITag> = {};
    const tags = classConfig?.getToolOptions()?.skeletonConfig?.tagList as ITag[];
    if (tags) {
      tags.forEach((e) => {
        tagMap[e.id] = e;
      });
    }

    const scale = editor.mainView.stage.scaleX();
    const points = (object.pointsGroup.children || []) as AnnotateObject[];
    points.forEach((e, index) => {
      const { tag, tagColor, tagId } = e.userData as Required<IUserData>;
      const tagInfo = tagMap[tagId];
      const tagName = tagInfo
        ? editor.showNameOrAlias({ name: tagInfo.attribute, ...tagInfo })
        : tag;
      const anchorPos = utils.getShapeRealPoint(object, [e.position()])[0];
      const idx = e.userData.index || index;
      const activeIdx = e.userData.activeIndex;
      const anchorInfos: string[] = [];
      const { skeletonConfig } = editor.state.config;
      if (skeletonConfig.showNumber) anchorInfos.push(idx + 1);
      if (skeletonConfig.showAttr) anchorInfos.push(tagName);
      infos.push({
        x: anchorPos.x * scale,
        y: anchorPos.y * scale,
        objectIndex: trackName || '',
        objectColor: activeIdx === idx ? '#f00' : (stroke as string) || classConfig?.color,
        anchorIndex: idx,
        anchorColor: tagColor,
        name: editor.showNameOrAlias(classConfig) || skeletonName || '',
        info: anchorInfos.join('-'), //`${idx + 1}-${tagName}`,
      });
    });

    return infos;
  }
  function getObjectInfo(obj: AnnotateObject) {
    const userData = editor.getUserData(obj);
    const { trackName } = userData;
    const classConfig = editor.getClassType(userData.classId || '');
    if (classConfig) checkObjectLimit(obj, classConfig);
    const limitInfo = obj.userData.limitState;
    const isModel = !userData.classId && userData.modelClass;
    // pos
    const scale = editor.mainView.stage.scaleX();
    const textPos = utils.getShapeRealPoint(obj, [obj.getTextPosition()])[0];
    const pos = { x: textPos.x * scale, y: textPos.y * scale };
    let className = '';
    let color = '';

    if (isModel) {
      className = userData.modelClass;
      color = '#ccc';
    } else {
      className = classConfig ? editor.showNameOrAlias(classConfig) : t('image.Class Required');
      color = classConfig ? classConfig.color : 'rgb(255 0 0)';
    }
    const zindex = obj.state.select ? 9 : 1;
    const info: ITextItem[] = [
      { ...pos, trackName, className, color, limitInfo, zindex, objectId: obj.uuid },
    ];
    const { points, innerPoints } = obj.attrs;
    let realPoints: Vector2[] = [];
    if (obj instanceof Rect) {
      realPoints = utils.getRotatedRectPoints(obj);
      realPoints.forEach((p, i) => (p.attr = points[i]?.attr));
      realPoints = utils.getShapeRealPoint(obj, realPoints, false);
    } else {
      realPoints = utils.getShapeRealPoint(obj);
    }
    const pointsInfo = getAnchorInfo(realPoints, obj);
    const innersInfo: ITextItem[] = [];
    if (innerPoints && innerPoints.length > 0) {
      innerPoints.forEach((e: any, i: number) => {
        realPoints = utils.getShapeRealPoint(obj, e.points);
        innersInfo.push(...getAnchorInfo(realPoints, obj, i));
      });
    }

    return [...info, ...pointsInfo, ...innersInfo];
  }
  // 非骨骼点结果的classText
  function getObjClassText(objs: AnnotateObject[]) {
    const objectInfos: ITextItem[] = [];
    objs.forEach((obj) => {
      if (obj.isGroup() && (obj.member.length === 0 || !(obj as GroupObject).showBgRect)) return;
      const info = getObjectInfo(obj);
      objectInfos.push(...info);
    });
    return objectInfos;
  }
  // 骨骼点的classText
  function getSkeClassText(objs: Skeleton[]) {
    const skeletonInfos: ISkeletonInfo[] = [];
    objs.forEach((ske) => {
      const infos = getSkeletonInfo(ske);
      skeletonInfos.push(...infos);
    });
    return skeletonInfos;
  }

  return {
    getObjClassText,
    getSkeClassText,
  };
}
