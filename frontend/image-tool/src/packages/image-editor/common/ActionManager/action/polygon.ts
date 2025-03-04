import Editor from '../../../Editor';
import { Line, Polygon, Shape } from '../../../ImageView/shape';
import { define } from '../define';
import {
  getArea,
  polygonContains,
  shapePositionRelation,
  POSTYPE,
  polygon2PointsVector,
} from '../../../utils';
import { OPType } from '../../../types/enum';
import { Vector2 } from 'image-editor/types';
import { t } from '@/lang';

// 是否全是多边形
function isAllPolygons(shapes: Shape[] | Shape) {
  if (!Array.isArray(shapes)) shapes = [shapes];
  const invalid = shapes.find((shape) => !(shape instanceof Polygon));
  return !invalid;
}

export const holeSelection = define({
  valid() {
    return true;
  },
  execute(editor: Editor) {
    const selection = editor.selection as Polygon[];
    if (selection.length < 2) return;
    const hollowTips: string = t('image.hollowConditionTips'); // 不满足镂空条件的提示
    if (!isAllPolygons(selection)) {
      editor.showMsg('warning', hollowTips);
      return;
    }
    // 根据面积从大到小排序, 最大的maxShape作为被镂空的目标
    selection.sort((shape1, shape2) => {
      return getArea(shape2.attrs.points) - getArea(shape1.attrs.points);
    });
    const [maxShape, ...otherShapes] = selection;
    // 条件1: otherShapes 自身不能是镂空结果
    const invalid = otherShapes.find((shape) => {
      return shape.attrs.innerPoints?.length > 0;
    });
    if (invalid) {
      editor.showMsg('warning', hollowTips);
      return;
    }
    // 条件2: otherShapes 须完全处于maxShape内部, 条件3: otherShapes 须两两相离
    const innerNum: number = maxShape.attrs.innerPoints.length; // maxShape-innerPoints 原始长度
    const arrLen = otherShapes.length;
    for (let i = 0; i < arrLen; i++) {
      const shape = otherShapes[i];
      const isInner = polygonContains(maxShape, shape);
      if (!isInner) {
        editor.showMsg('warning', hollowTips);
        if (maxShape.attrs.innerPoints.length > innerNum) {
          // 把添加的 innerPoints 删除
          maxShape.attrs.innerPoints.splice(innerNum, i);
        }
        return;
      }
      maxShape.attrs.innerPoints.push({ points: shape.attrs.points });
    }
    // otherShapes 全部满足镂空条件
    if (maxShape.attrs.innerPoints.length === otherShapes.length + innerNum) {
      maxShape.attrs.innerPoints.length = innerNum;
      editor.mainView.holeShape(maxShape, otherShapes);
      editor.showMsg('success', 'Hollow out Succeeded');
    }
    // editor.mainView.holeShape(selection[1], selection[0]);
  },
});

export const removeHoleSelection = define({
  valid() {
    return true;
  },
  execute(editor: Editor) {
    const object = editor.selection[0] as Polygon;
    if (!(object instanceof Polygon) || object.attrs.innerPoints.length === 0) return;

    editor.mainView.removeHole(object);
  },
});

export const clipSelection = define({
  valid() {
    return true;
  },
  execute(editor: Editor, isClipFirst: boolean = false) {
    const selection = editor.selection as Polygon[];
    // 检测条件一: 选择的所有shape中存在非多边形的shape, 则提示错误
    let condition = isAllPolygons(selection);
    if (!condition) {
      editor.showMsg('warning', t('image.clipConditionTips'));
      return;
    }
    const [targetShape, ...ohterShapes] = selection;
    const targetPoints = polygon2PointsVector(targetShape).points;
    ohterShapes.forEach((shape) => {
      const shapePoints = polygon2PointsVector(shape).points;
      // 裁剪与被裁剪的 shape 不能相离
      const pos = shapePositionRelation(targetPoints, shapePoints);
      if (pos == POSTYPE.disjoint) {
        condition = false;
        return;
      }
    });
    if (!condition) {
      editor.showMsg('warning', t('image.clipCannotTips'));
      return;
    }
    if (isClipFirst) editor.mainView.cropFirstPolygon(selection);
    else editor.mainView.cropOtherPolygon(selection);
  },
});
export const cutSelectionOther = define({
  valid(editor: Editor) {
    return checkClip(editor);
  },
  execute(editor: Editor) {
    clipSelection.execute(editor, false);
  },
});
export const cutSelectionFirst = define({
  valid(editor: Editor) {
    return checkClip(editor);
  },
  execute(editor: Editor) {
    clipSelection.execute(editor, true);
  },
});
function checkClip(editor: Editor) {
  const polys = editor.selection.filter((e) => e instanceof Polygon);
  const selectValid = Boolean(polys && polys.length > 1);
  const modeValid = editor.state.modeConfig.op !== OPType.VIEW;
  return selectValid && modeValid;
}

function checkMergePolyline(editor: Editor) {
  const polys = editor.selection.filter((e) => e instanceof Line);
  const selectValid = polys.length == 2 && editor.selection.length == 2;
  const modeValid = editor.state.modeConfig.op !== OPType.VIEW;
  return selectValid && modeValid;
}
export const mergePolyline = define({
  valid(editor: Editor) {
    return checkMergePolyline(editor);
  },
  execute(editor: Editor, args: 1 | -1) {
    const selections = [...editor.selection];
    if (args === -1) selections.reverse();
    const [target, merged] = selections; // 合并目标, 被合并对象
    const mergePoints = merged.attrs.points.map((p: Vector2) => {
      return {
        x: p.x + merged.attrs.x - target.attrs.x,
        y: p.y + merged.attrs.y - target.attrs.y,
      };
    });
    editor.cmdManager.withGroup(() => {
      editor.cmdManager.execute('delete-object', merged);
      editor.cmdManager.execute('update-points', {
        object: target,
        pointsData: { points: [...target.attrs.points, ...mergePoints] },
      });
    });
    editor.showMsg('success', t('image.Polyline merge successful'));
  },
});
export const mergePolyline1 = define({
  valid(editor: Editor) {
    return checkMergePolyline(editor);
  },
  execute(editor: Editor) {
    return mergePolyline.execute(editor, -1);
  },
});
export const mergePolyline2 = define({
  valid(editor: Editor) {
    return checkMergePolyline(editor);
  },
  execute(editor: Editor) {
    return mergePolyline.execute(editor, 1);
  },
});
