import { cloneDeep } from 'lodash';
import Editor from '../Editor';
import { AnnotateObject, IFrame, IUserData, Const, ITransform } from '../types';
import { traverse, createUUID } from './index';
import { GroupObject, Skeleton } from '../ImageView/export';
import { IMoveObjectIndexOption } from '../common/CmdManager/cmd/MoveObjectIndex';

const userdataKeys = ['attrs', 'resultStatus', 'pointsLimit'];
export function copyUserData(userData: Partial<IUserData> = {}, attrs = userdataKeys) {
  const newData = pickAttrs(userData, attrs) as IUserData;
  return newData;
}
const attrsKeys = [
  'x',
  'y',
  'radiusX',
  'radiusY',
  'rotation',
  'width',
  'height',
  'points',
  'innerPoints',
  'visible',
];
export function copyAttrs(attrs: Record<string, any> = {}, keys = attrsKeys) {
  const newData = pickAttrs(attrs, keys);
  return newData;
}

export function pickAttrs(obj: any, attrs: string[]) {
  const newObj: any = {};
  attrs.forEach((attr) => {
    if (obj[attr] != undefined) newObj[attr] = cloneDeep(obj[attr]);
  });
  return newObj;
}

/**
 * 将第一帧结果复制到第二帧, 第一帧为复制帧, 第二帧为目标帧
 * @param editor
 * @param copyId 复制帧的id
 * @param toIds 目标帧id集合
 * @param annotations 复制帧需要复制的标注结果
 * @param strategy 目标帧结果已存在覆盖策略 为空->不覆盖 包含 Const.True_Value->覆盖真值 Const.Predicted=>覆盖非真值
 */
export function copyData(
  editor: Editor,
  copyId: string,
  toIds: string[],
  annotations: AnnotateObject[],
  strategy: Const[] = [],
) {
  const allowGroups = editor.state.config.allObjectInMultipleGroups;
  const updateDatas = { objects: [], data: [] } as { objects: AnnotateObject[]; data: IUserData[] };
  const addDatas = [] as { objects: AnnotateObject[]; frame: IFrame }[];
  const delDatas = [] as { objects: AnnotateObject[]; frame: IFrame }[];
  const updateTrans = { objects: [], transforms: [] } as {
    objects: AnnotateObject[];
    transforms: ITransform[];
  };
  const updateGroups = [] as IMoveObjectIndexOption[];
  const copiedTrackMap: Record<string, AnnotateObject> = {}; // 被复制的结果的一个索引对象
  annotations.forEach((a) => (copiedTrackMap[a.userData.trackId] = a));
  /**是否覆盖已存在的结果 */
  const canCoverOldObject = (oldObject?: AnnotateObject) => {
    if (!oldObject) return true;
    if (strategy.length <= 0) return false;
    const isTruth = oldObject.userData.resultStatus == Const.True_Value;
    if (isTruth) return strategy.includes(Const.True_Value);
    else return strategy.includes(Const.Predicted);
  };
  toIds.forEach((id, index) => {
    if (id === copyId) return;

    // 目标帧原有数据
    const frame = editor.getFrame(id);
    frame.needSave = true;
    const oldObjects = editor.dataManager.getFrameRoot(id)?.allObjects || [];
    const oldMap = {} as Record<string, AnnotateObject>;
    oldObjects.forEach((e: AnnotateObject) => {
      oldMap[e.userData.trackId] = e;
    });
    const needCopiedRelationGroup: AnnotateObject[] = []; // 需要复制组关系的组
    const newMap = {} as Record<string, AnnotateObject>;

    const addOption = { objects: [], frame: frame } as {
      objects: AnnotateObject[];
      frame: IFrame;
    };

    function isCopiedEmptyGroup(object: AnnotateObject): boolean {
      const member = object.member.find((m) => {
        return copiedTrackMap[m.userData.trackId] && (!m.isGroup() || !isCopiedEmptyGroup(m));
      });
      return !member;
    }
    // 复制结果: 目标帧有则修改, 无则新增
    annotations.forEach((obj_from) => {
      const userData = obj_from.userData as Required<IUserData>;
      const obj_into = oldMap[userData.trackId];
      // skeleton 特殊处理,skeleton无法复制,故ske需要删除之前的,在新增一个ske
      const isSke = obj_into instanceof Skeleton;
      const isEmpty = isCopiedEmptyGroup(obj_from);
      if (!isEmpty) needCopiedRelationGroup.push(obj_from);
      if (obj_into && !isSke) {
        if (!canCoverOldObject(obj_into)) return;
        // 复制属性 ==> 复制 userData/attrs 里的相关字段
        const fromUserData = copyUserData(editor.getUserData(obj_from)) as IUserData;
        fromUserData.resultStatus = Const.Copied;

        updateDatas.objects.push(obj_into);
        updateDatas.data.push(fromUserData);

        const fromAttrs = copyAttrs(obj_from.attrs);
        updateTrans.objects.push(obj_into);
        updateTrans.transforms.push(fromAttrs);
      } else {
        if (obj_from.isGroup() && isEmpty) return;
        if (isSke && !canCoverOldObject(obj_into)) return;
        // 新增结果
        const newObject = obj_from.cloneThisShape(false);
        newObject.frame = frame;
        newObject.userData.resultStatus = Const.Copied;
        addOption.objects.push(newObject);
        newMap[userData.trackId] = newObject;
        if (isSke) delDatas.push({ objects: [obj_into], frame });
      }
    });
    // 复制组关系
    needCopiedRelationGroup.forEach((obj_from) => {
      const copiedMember = obj_from.member.filter((m) => copiedTrackMap[m.userData.trackId]);
      const userData = obj_from.userData as Required<IUserData>;
      const obj_into = (oldMap[userData.trackId] || newMap[userData.trackId]) as GroupObject;
      const hasMap: Record<string, boolean> = {};
      obj_into.member.forEach((m) => (hasMap[m.userData.trackId] = true));
      copiedMember.forEach((m) => {
        const m_into = oldMap[m.userData.trackId] || newMap[m.userData.trackId];
        // 如果m_into上已经存在相同的组关系,则不必复制
        if (hasMap[m.userData.trackId]) return;
        // 不允许单个结果位于多个组内或者该member本身是一个组, 需要先把member从之前的组移到新组内
        if ((m_into.isGroup() && m_into.groups.length > 0) || !allowGroups) {
          m_into.groups.forEach((g) => {
            updateGroups.push({ object: m_into, index: Infinity, from: g, into: obj_into });
          });
        }
        updateGroups.push({ object: m_into, index: Infinity, into: obj_into });
      });
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
    if (delDatas.length > 0) {
      delDatas.forEach((delData) => {
        editor.cmdManager.execute('delete-object', delData);
      });
    }
    if (updateGroups.length > 0) {
      updateGroups.forEach((data) => {
        editor.cmdManager.execute('move-object-index', data);
      });
    }
  });
  // addDatas.forEach((copyedData) => {
  //   copyedData.objects.forEach((e) => (e.userData.resultStatus = Const.Copied));
  // });
}
export function copyDataByTrackModel(
  editor: Editor,
  copyId: string,
  toIds: string[],
  annotationsList: AnnotateObject[][],
  strategy: Const[] = [],
) {
  const updateDatas = { objects: [], data: [] } as { objects: AnnotateObject[]; data: IUserData[] };
  const addDatas = [] as { objects: AnnotateObject[]; frame: IFrame }[];
  const updateTrans = { objects: [], transforms: [] } as {
    objects: AnnotateObject[];
    transforms: ITransform[];
  };
  /**是否覆盖已存在的结果 */
  const canCoverOldObject = (oldObject?: AnnotateObject) => {
    if (!oldObject) return true;
    if (strategy.length <= 0) return false;
    const isTruth = oldObject.userData.resultStatus == Const.True_Value;
    if (isTruth) return strategy.includes(Const.True_Value);
    else return strategy.includes(Const.Predicted);
  };
  toIds.forEach((id, index) => {
    if (id === copyId) return;

    // 目标帧原有数据
    const frame = editor.getFrame(id);
    frame.needSave = true;
    const oldObjects = editor.dataManager.getFrameObject(id) || [];
    const oldMap = {} as Record<string, AnnotateObject>;
    oldObjects.forEach((e: AnnotateObject) => {
      oldMap[e.userData.trackId] = e;
    });

    const addOption = { objects: [], frame: frame, groupMap: new Map() } as {
      objects: AnnotateObject[];
      frame: IFrame;
      groupMap: Map<string, any>;
    };

    const annotations = annotationsList[index] || [];
    // 复制帧
    annotations.forEach((annotate) => {
      const userData = annotate.userData as Required<IUserData>;
      let object = oldMap[userData.trackId];

      if (object) {
        if (!canCoverOldObject(object)) return;
        // copy userData, 用于cmd回退
        const updateData = copyUserData(object.userData) as IUserData;
        updateData.resultStatus = Const.Copied;

        updateDatas.objects.push(object);
        updateDatas.data.push(updateData);

        updateTrans.objects.push(object);
        updateTrans.transforms.push({
          ...annotate.position(),
        });
      } else {
        object = annotate;
        // 将追踪对象的userData复制到模型跑出来的annotation上
        const trackId = annotate.userData.trackId || '';
        const trackObj = editor.trackManager.getObjectByTrackId(trackId)[0];
        if (trackObj) {
          const newUserData = pickAttrs(
            trackObj.userData,
            Object.keys(userData) as any,
          ) as IUserData;
          object.userData = newUserData;
        }

        traverse([object], (e) => {
          e.uuid = createUUID();
          e.userData.resultStatus = Const.Copied;
        });

        addOption.objects.push(object);
      }
    });

    if (addOption.objects.length > 0) addDatas.push(addOption);
  });

  editor.cmdManager.withGroup(() => {
    if (addDatas.length > 0) {
      editor.cmdManager.execute('add-object', addDatas);
    }
    if (updateDatas.objects.length > 0) {
      // updateDatas
      editor.cmdManager.execute('update-user-data', updateDatas);
    }
    if (updateTrans.objects.length > 0) {
      editor.cmdManager.execute('update-transform', updateTrans);
    }
  });
}
