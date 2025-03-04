import { useInjectEditor } from '../../context';
import { Event, AnnotateObject, ToolType, IUserData, IClassType } from '../../../image-editor';
import { ClassUtils } from '@basicai/tool-components';

export default function useEditclass() {
  const editor = useInjectEditor();
  editor.once(Event.INIT, () => {});

  // 是否是编辑锚点的class
  function isEditAnchorClass(object: AnnotateObject) {
    const tool = editor.mainView.currentEditTool;
    return tool?.selectAnchorIndex() !== -1 && object.uuid === tool?.object?.uuid;
  }
  function anchorIndex() {
    return editor.mainView.currentEditTool?.selectAnchorIndex() ?? '';
  }
  function getAnchorCmdData(classCfg?: IClassType, attrs?: Record<string, any>) {
    const index = editor.mainView.currentEditTool?.selectAnchorIndex() ?? -1;
    const typeIndex = editor.mainView.currentEditTool?.anchorType() ?? -1;
    return {
      index,
      typeIndex,
      data: {
        classId: classCfg?.id || '',
        classType: classCfg?.name || '',
        color: classCfg?.color || '',
        attrs: attrs || {},
      } as IUserData,
    };
  }
  function getClassInfo(object: AnnotateObject) {
    const isAnchor = isEditAnchorClass(object);
    if (isAnchor) return getUserDataByAnchor(object);
    else return editor.getUserData(object);
  }
  // 获取anchor的class info
  function getUserDataByAnchor(object: AnnotateObject) {
    const index = editor.mainView?.currentEditTool?.selectAnchorIndex() ?? -1;
    const typeIndex = editor.mainView?.currentEditTool?.anchorType() ?? -1;
    const { points, innerPoints } = object.attrs;
    const arr = typeIndex === -1 ? points : innerPoints?.[typeIndex]?.points;
    const data = arr?.[index] || { attr: {} };
    return {
      attrs: data.attr?.attrs || {},
      classId: data.attr?.classId || '',
      classType: data.attr?.classType || '',
      toolType: ToolType.KEY_POINT,
    } as IUserData;
  }

  /**
   * class attrs
   */
  function getUserDataAttrs(object: AnnotateObject) {
    return object.userData.attrs || {};
  }
  function getAnchorAttrs(object: AnnotateObject) {
    const index = editor.mainView?.currentEditTool?.selectAnchorIndex() ?? -1;
    const typeIndex = editor.mainView?.currentEditTool?.anchorType() ?? -1;
    const { points, innerPoints } = object.attrs;
    const arr = typeIndex === -1 ? points : innerPoints?.[typeIndex]?.points;
    const data = arr?.[index] || { attr: {} };
    return data.attr.attrs || {};
  }

  // set default value
  function setAttrsDefaultValue(attrs: any[], defaultMap: Record<string, any>) {
    if (!attrs || attrs.length === 0) return;
    attrs.forEach((e: any) => {
      const defaultValue = ClassUtils.isAttrValueTypeArr(e.type) ? [] : '';
      e.value = e.id in defaultMap ? defaultMap[e.id].value : defaultValue;
      if (e.options) {
        let arr1: any[] = [];
        e.options.forEach((option: any) => {
          if (option.attributes && option.attributes.length > 0) {
            arr1 = arr1.concat(option.attributes);
          }
        });
        setAttrsDefaultValue(arr1, defaultMap);
      }
    });
  }

  return {
    isEditAnchorClass,
    anchorIndex,
    getClassInfo,
    getAnchorCmdData,
    getUserDataAttrs,
    getAnchorAttrs,
    setAttrsDefaultValue,
  };
}
