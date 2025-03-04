import { useInjectEditor } from '../../context';
import { AnnotateObject, IUserData, Rect, Vector2, utils } from '../../../image-editor';

export interface IAttrText {
  x: number;
  y: number;
  userData?: IUserData;
  id: string;
  type: number; // 0表示锚点;-1表示object
}

export default function useAttr() {
  const editor = useInjectEditor();
  const { config } = editor.state;
  /**
   * object attrs tag
   */
  function getUserDataByAnchor(obj: AnnotateObject) {
    const list: IAttrText[] = [];
    const configShowAll = config.showObjectAttrs > 1;
    const index = editor.mainView.currentEditTool?.selectAnchorIndex() ?? -1;
    const typeIdx = editor.mainView.currentEditTool?.anchorType() ?? -1;
    const { innerPoints } = obj.attrs;
    let points: Vector2[] = obj.attrs.points;
    if (obj instanceof Rect) {
      const realPoints: Vector2[] = utils.getRotatedRectPoints(obj);
      realPoints.forEach((p, i) => (p.attr = points[i]?.attr));
      points = utils.getShapeRealPoint(obj, realPoints, false);
    } else {
      points = utils.getShapeRealPoint(obj);
    }
    function getTextFromPoint(p: Vector2, i: number, type: number = -1) {
      const select = typeIdx === type && index === i;
      const isShowPoint = (configShowAll || select) && p?.attr?.classId;
      if (!isShowPoint) return;
      const scale = editor.mainView.stage.scaleX();
      const pos = { x: p.x * scale, y: p.y * scale };
      const id = `${obj.uuid}##-1##${i}`;
      let userData = p.attr || {};
      userData = Object.assign(userData, { attrs: editor.getValidAttrs(userData) });
      const attrText: IAttrText = { x: pos.x, y: pos.y + 25, userData, id, type: 0 };
      return attrText;
    }
    points?.forEach((p: Vector2, i: number) => {
      const attrText = getTextFromPoint(p, i, -1);
      attrText && list.push(attrText);
    });
    innerPoints?.forEach((innerP: { points: Vector2[] }, type: number) => {
      const realPoints = utils.getShapeRealPoint(obj, innerP.points);
      realPoints?.forEach((p: Vector2, i: number) => {
        const attrText = getTextFromPoint(p, i, type);
        attrText && list.push(attrText);
      });
    });
    return list;
  }
  function getAttrsInfo(objs: AnnotateObject[]) {
    const attrsTextList: IAttrText[] = [];
    if (config.showObjectAttrs === 0) return attrsTextList;
    const scale = editor.mainView.stage.scaleX();
    objs.forEach((obj) => {
      if (obj.isGroup() && !config.showGroupBox && !obj.state.select) return;
      const configShowAll = config.showObjectAttrs > 1;
      const { select, hover } = obj.state;
      let isShow = configShowAll || select || hover;
      if (isShow) {
        let userData = editor.getUserData(obj);
        userData = Object.assign(userData, { attrs: editor.getValidAttrs(userData) });

        const textPos = utils.getShapeRealPoint(obj, [obj.getTextPosition()])[0];
        const pos = { x: textPos.x * scale, y: textPos.y * scale - 25 };
        const objAttrText: IAttrText = { ...pos, userData, id: obj.uuid, type: -1 };
        attrsTextList.push(objAttrText);
      }
      isShow = configShowAll || editor.mainView.currentEditTool?.object?.uuid == obj.uuid;
      if (isShow) attrsTextList.push(...getUserDataByAnchor(obj));
    });
    return attrsTextList;
  }
  return { getAttrsInfo };
}
