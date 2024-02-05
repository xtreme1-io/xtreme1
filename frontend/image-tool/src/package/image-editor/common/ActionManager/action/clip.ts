import Editor from '../../../Editor';
import { Polygon, Shape } from '../../../ImageView/shape';
import { define } from '../define';
import {
  getArea,
  polygonContains,
  shapePositionRelation,
  POSTYPE,
  polygon2PointsVector,
  polygonsHollow,
  getShapeRealPoint,
  polygonToClip,
  polygonToClips,
} from '../../../utils';
import { MsgType, OPType } from '../../../types/enum';

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
    const hollowTips: string = editor.lang('hollowConditionTips'); // 不满足镂空条件的提示
    if (!isAllPolygons(selection)) {
      editor.showMsg(MsgType.warning, hollowTips);
      return;
    }
    // sort by area
    selection.sort((shape1, shape2) => {
      return getArea(shape2.attrs.points) - getArea(shape1.attrs.points);
    });
    const [maxShape, ...otherShapes] = selection;
    // condition 1
    const invalid = otherShapes.find((shape) => {
      return shape.attrs.innerPoints?.length > 0;
    });
    if (invalid) {
      editor.showMsg(MsgType.warning, hollowTips);
      return;
    }
    // condition 2; condition 3
    const innerNum: number = maxShape.attrs.innerPoints.length;
    const arrLen = otherShapes.length;
    for (let i = 0; i < arrLen; i++) {
      const shape = otherShapes[i];
      const isInner = polygonContains(maxShape, shape);
      if (!isInner) {
        editor.showMsg(MsgType.warning, hollowTips);
        if (maxShape.attrs.innerPoints.length > innerNum) {
          maxShape.attrs.innerPoints.splice(innerNum, i);
        }
        return;
      }
      maxShape.attrs.innerPoints.push({ points: shape.attrs.points });
    }
    if (maxShape.attrs.innerPoints.length === otherShapes.length + innerNum) {
      maxShape.attrs.innerPoints.length = innerNum;
      holeShape(editor, maxShape, otherShapes);
      editor.showMsg(MsgType.success, 'Hollow out Succeeded');
    }
  },
});

export const removeHoleSelection = define({
  valid() {
    return true;
  },
  execute(editor: Editor) {
    const object = editor.selection[0] as Polygon;
    if (!(object instanceof Polygon) || object.attrs.innerPoints.length === 0) return;
    removeHole(editor, object);
  },
});

export const clipSelection = define({
  valid() {
    return true;
  },
  execute(editor: Editor, isClipFirst: boolean = false) {
    const selection = editor.selection as Polygon[];
    let condition = isAllPolygons(selection);
    if (!condition) {
      editor.showMsg(MsgType.warning, editor.lang('clipConditionTips'));
      return;
    }
    const [targetShape, ...ohterShapes] = selection;
    const targetPoints = polygon2PointsVector(targetShape).points;
    ohterShapes.forEach((shape) => {
      const shapePoints = polygon2PointsVector(shape).points;
      const pos = shapePositionRelation(targetPoints, shapePoints);
      if (pos == POSTYPE.disjoint) {
        condition = false;
        return;
      }
    });
    if (!condition) {
      editor.showMsg(MsgType.warning, editor.lang('clipCannotTips'));
      return;
    }
    if (isClipFirst) cropFirstPolygon(editor, selection);
    else cropOtherPolygon(editor, selection);
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
  const modeValid = editor.state.modeConfig.op === OPType.EDIT;
  return selectValid && modeValid;
}
function holeShape(editor: Editor, shape: Polygon, hole: Polygon | Polygon[]) {
  const holes = Array.isArray(hole) ? hole : [hole];
  const pos = shape.position();
  const holesPoints = polygonsHollow(shape, holes);
  if (pos.x !== 0 || pos.y !== 0) {
    holesPoints.forEach((inner) => {
      inner.points.forEach((point) => {
        point.x -= pos.x;
        point.y -= pos.y;
      });
    });
  }
  let { innerPoints } = shape.clonePointsData();
  innerPoints = innerPoints.concat(holesPoints);

  editor.cmdManager.withGroup(() => {
    editor.cmdManager.execute('delete-object', holes);
    editor.cmdManager.execute('update-transform', {
      objects: shape,
      transforms: { innerPoints },
    });
  });

  editor.selectObject(shape, true);
}
function removeHole(editor: Editor, shape: Polygon) {
  const innerShapes: Polygon[] = [];
  const { innerPoints } = shape.clonePointsData();
  innerPoints.forEach((inner) => {
    const points = getShapeRealPoint(shape, inner.points);
    const newPoly = new Polygon({ points, innerPoints: [] });
    editor.initIDInfo(newPoly);
    innerShapes.push(newPoly);
  });
  editor.cmdManager.withGroup(() => {
    editor.cmdManager.execute('add-object', innerShapes);
    editor.cmdManager.execute('update-transform', {
      objects: shape,
      transforms: { innerPoints: [] },
    });
  });
}
function clipMultipleByOne(editor: Editor, cropPoly: Polygon, otherPoly: Polygon[]): Polygon[] {
  let newPolyArr: Polygon[] = [];
  otherPoly.forEach((cliped) => {
    const shapes = polygonToClip(cliped, cropPoly);
    shapes.forEach((poly) => {
      editor.initIDInfo(poly);
      poly.userData.classId = cliped.userData.classId;
      poly.userData.classType = cliped.userData.classType;
      poly.userData.classVersion = cliped.userData.classVersion;
      poly.userData.sourceId = cliped.userData.sourceId;
      editor.mainView.updateObjectByUserData(poly);
    });
    newPolyArr = newPolyArr.concat(shapes);
  });
  return newPolyArr;
}
function clipOneByMultiple(editor: Editor, poly: Polygon, polys: Polygon[]) {
  let failed: Polygon[] = [];
  let clipedArr: Polygon[] = [];
  try {
    clipedArr = polygonToClips(poly, polys);
  } catch (error) {
    failed = polys;
  }
  if (failed.length > 0) {
    console.log('========== clip all failed, and clip one by one');
    clipedArr = [poly];
    failed = [];
    polys.forEach((clipPoly) => {
      try {
        const clipeds = clipMultipleByOne(editor, clipPoly, clipedArr);
        if (clipeds.length > 0) clipedArr = clipeds;
      } catch (error) {
        failed.push(clipPoly);
      }
    });
  }
  if (failed.length > 0) {
    editor.showMsg(
      MsgType.error,
      editor.lang('shareFailed', {
        polygons: failed.map((e) => `#${e.userData.trackName}`).join(','),
      }),
    );
  }
  if (clipedArr.length === 0) return [poly];
  return clipedArr;
}
function cropFirstPolygon(editor: Editor, polygonList: Polygon[]) {
  const [firstPoly, ...otherPoly] = polygonList;
  const clipedArr = clipOneByMultiple(editor, firstPoly, otherPoly);
  clipedArr.forEach((poly) => {
    editor.initIDInfo(poly);
    poly.userData.classId = firstPoly.userData.classId;
    poly.userData.classType = firstPoly.userData.classType;
    poly.userData.classVersion = firstPoly.userData.classVersion;
    poly.userData.sourceId = firstPoly.userData.sourceId;
    editor.mainView.updateObjectByUserData(poly);
  });
  editor.cmdManager.withGroup(() => {
    if (editor.state.isSeriesFrame) {
      editor.cmdManager.execute('add-track', editor.createTrackObj(clipedArr));
    }
    editor.cmdManager.execute('add-object', clipedArr);
    editor.cmdManager.execute('delete-object', firstPoly);
  });
}
function cropOtherPolygon(editor: Editor, polygonList: Polygon[]) {
  const [firstPoly, ...otherPoly] = polygonList;
  const newPolyArr: Polygon[] = clipMultipleByOne(editor, firstPoly, otherPoly);
  if (newPolyArr.length === 0) return;
  editor.cmdManager.withGroup(() => {
    if (editor.state.isSeriesFrame) {
      editor.cmdManager.execute('add-track', editor.createTrackObj(newPolyArr));
    }
    editor.cmdManager.execute('add-object', newPolyArr);
    editor.cmdManager.execute('delete-object', otherPoly);
  });
}
