import { cloneDeep } from 'lodash';
import Editor from '../Editor';
import { AnnotateObject, IFrame, IUserData, Const, ITransform } from '../types';

const userdataKeys = ['classId', 'resultType', 'resultStatus', 'pointsLimit'];
export function copyUserData(userData: Partial<IUserData> = {}, attrs = userdataKeys) {
  const newData = pickAttrs(userData, attrs) as IUserData;
  newData.attrs = JSON.parse(JSON.stringify(userData.attrs || {}));
  return newData;
}
const attrsKeys = ['x', 'y', 'rotation', 'width', 'height', 'points', 'innerPoints'];
export function copyAttrs(attrs: Record<string, any> = {}, keys = attrsKeys) {
  const newData: Record<string, any> = {};
  keys.forEach((key) => {
    if (attrs[key] !== undefined) newData[key] = cloneDeep(attrs[key]);
  });
  return newData;
}
export function pickAttrs(obj: any, attrs: string[]) {
  const newObj: any = {};
  attrs.forEach((attr) => {
    newObj[attr] = cloneDeep(obj[attr]);
  });
  return newObj;
}

export function copyData(
  editor: Editor,
  copyId: string,
  toIds: string[],
  annotations: AnnotateObject[],
) {
  const updateDatas = { objects: [], data: [] } as { objects: AnnotateObject[]; data: IUserData[] };
  const addDatas = [] as { objects: AnnotateObject[]; frame: IFrame }[];
  const updateTrans = { objects: [], transforms: [] } as {
    objects: AnnotateObject[];
    transforms: ITransform[];
  };

  toIds.forEach((id, index) => {
    if (id === copyId) return;

    const frame = editor.getFrame(id);
    frame.needSave = true;
    const oldObjects = editor.dataManager.getFrameRoot(id)?.allObjects || [];
    const oldMap = {} as Record<string, AnnotateObject>;
    oldObjects.forEach((e: AnnotateObject) => {
      oldMap[e.userData.trackId] = e;
    });

    const addOption = { objects: [], frame: frame, groupMap: new Map() } as {
      objects: AnnotateObject[];
      frame: IFrame;
      groupMap: Map<string, any>;
    };

    annotations.forEach((annotate) => {
      const userData = annotate.userData as Required<IUserData>;
      const object = oldMap[userData.trackId];

      if (object) {
        const updateData = copyUserData(annotate.userData) as IUserData;
        updateData.resultStatus = Const.Copied;

        updateDatas.objects.push(object);
        updateDatas.data.push(updateData);

        const copyedAttrs = copyAttrs(annotate.attrs);
        updateTrans.objects.push(object);
        updateTrans.transforms.push(copyedAttrs);
      } else {
        const newObject = annotate.cloneThisShape();
        newObject.userData.backId = undefined;
        newObject.userData.resultStatus = Const.Copied;
        addOption.objects.push(newObject);
      }
    });

    if (addOption.objects.length > 0) addDatas.push(addOption);
  });

  editor.cmdManager.withGroup(() => {
    if (addDatas.length > 0) {
      editor.cmdManager.execute('add-object', addDatas);
    }
    if (updateDatas.objects.length > 0) {
      editor.cmdManager.execute('update-user-data', updateDatas);
    }
    if (updateTrans.objects.length > 0) {
      editor.cmdManager.execute('update-transform', updateTrans);
    }
  });
}
