import { AnnotateObject, utils } from 'image-editor';
import { useInjectEditor } from '../../context';
import { ITextItem } from './type';

export default function useTags() {
  const editor = useInjectEditor();
  /**
   * result class tag
   */
  function getObjectInfo(obj: AnnotateObject) {
    const userData = editor.getUserData(obj);
    const { trackName } = userData;
    const classConfig = editor.getClassType(userData.classId || '');
    const isModel = !userData.classId && userData.modelClass;

    const scale = editor.mainView.stage.scaleX();
    const textPos = utils.getShapeRealPoint(obj, [obj.getTextPosition()])[0];
    const pos = { x: textPos.x * scale, y: textPos.y * scale };
    let className = isModel
      ? userData.modelClass
      : classConfig?.name || editor.lang('Class Required');
    let color = isModel ? '#ccc' : classConfig?.color || '#f00';
    const zindex = obj.state.select ? 9 : 1;
    const info: ITextItem[] = [{ ...pos, trackName, className, color, zindex, objectId: obj.uuid }];

    return info;
  }
  function getClassTags(objs: AnnotateObject[]) {
    const classTexts: ITextItem[] = [];
    objs.forEach((obj) => {
      const info = getObjectInfo(obj);
      classTexts.push(...info);
    });
    return { classTexts };
  }

  return {
    getClassTags,
  };
}
