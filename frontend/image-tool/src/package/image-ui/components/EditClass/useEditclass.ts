import { useInjectEditor } from '../../context';
import { AnnotateObject, IUserData, IClassType, IAttr, AttrType } from '../../../image-editor';

export function isAttrTypeMulti(type: string) {
  switch (type) {
    case AttrType.RANK:
    case AttrType.MULTI_SELECTION:
      return true;
    case AttrType.DROPDOWN:
    case AttrType.RADIO:
    case AttrType.TEXT:
    default:
      return false;
  }
}
export default function useEditclass() {
  const editor = useInjectEditor();

  function getClassInfo(object: AnnotateObject) {
    return editor.getUserData(object);
  }

  /**
   * class attrs
   */
  function getUserDataAttrs(object: AnnotateObject) {
    return object.userData.attrs || {};
  }

  // set default value
  function setAttrsDefaultValue(attrs: any[], defaultMap: Record<string, any>) {
    if (!attrs || attrs.length === 0) return;
    attrs.forEach((e: any) => {
      const defaultValue = isAttrTypeMulti(e.type) ? [] : '';
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
    getClassInfo,
    getUserDataAttrs,
    setAttrsDefaultValue,
  };
}
