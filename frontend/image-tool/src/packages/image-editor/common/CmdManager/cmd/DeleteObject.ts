import CmdBase from '../CmdBase';
import type { ICmdOption } from './index';
import type { AnnotateObject, IFrame } from '../../../types';
import { GroupObject, ShapeRoot } from '../../../ImageView/export';

export interface IDeleteObjectItem {
  objects: AnnotateObject | AnnotateObject[];
  frame?: IFrame;
}

interface IOldData {
  index: number;
  group?: GroupObject;
  object: AnnotateObject;
  groupGroup?: GroupObject;
}

interface IUndoData {
  oldData: IOldData[];
  objects: AnnotateObject[];
  indexs?: number[];
}

export type IDeleteObjectOption = IDeleteObjectItem | AnnotateObject | AnnotateObject[];

export default class DeleteObject extends CmdBase<ICmdOption['delete-object'], IUndoData> {
  name: string = 'delete-object';
  redo(): void {
    const editor = this.editor;
    const frame = editor.getCurrentFrame();

    if (!(this.data as any).objects) {
      const objects = Array.isArray(this.data) ? this.data : [this.data];
      const _data: IDeleteObjectItem = { objects: objects as AnnotateObject[] };
      this.data = _data;
    }

    const data = this.data as IDeleteObjectItem;
    if (!data.frame) data.frame = frame;
    const objects = data.objects as AnnotateObject[];

    if (!this.undoData) {
      const oldData = getGroupData(objects);
      this.undoData = { oldData, objects };
    }

    editor.dataManager.removeAnnotates(objects, data.frame);
  }
  undo(): void {
    const editor = this.editor;
    const data = this.data as IDeleteObjectItem;

    if (!this.undoData) return;

    const { objects, oldData } = this.undoData;
    editor.dataManager.addAnnotates(objects, data.frame);
    oldData.forEach((e) => {
      editor.dataManager.moveObjectIndex(e.object, e.index, e.group, e.groupGroup);
    });
  }
}

function getGroupData(objects: AnnotateObject[]) {
  const data: IOldData[] = [];
  const delMap: Record<string, boolean> = {};
  const groupMap: Record<string, GroupObject> = {};
  const delGroups: AnnotateObject[] = [];
  objects.forEach((object) => {
    delMap[object.uuid] = true;
    if (object.parent) {
      // 还原删除结果在shapeRoot的位置
      const index = (object.parent as ShapeRoot).children.findIndex((e) => e.uuid === object.uuid);
      data.push({ object, index });
    }
    object.groups?.forEach((group) => {
      // 删除结果所涉及到的组
      groupMap[group.uuid] = group;
      // 该 object 是组内元素, 需要记录其被删除前的组关系
      const index = group.member.findIndex((c) => c.uuid === object.uuid);
      data.push({ object, group, index });
    });
    // 该 object 本身是组, 需要将组内元素移到该组的上层组内
    if (object.isGroup()) {
      const group = object as GroupObject;
      const groupGroup = group.groups[0];
      group.member.forEach((child, index) => {
        groupGroup?.addObject(child);
        data.push({ object: child, group, index, groupGroup });
      });
    }
  });
  // 处理空组
  tranverGroups(data, groupMap, delMap, delGroups);
  if (delGroups.length > 0) objects.push(...delGroups);
  return data;
}
/** 递归处理空组问题
 * @param data: IOldData[] 记录操作前的组关系
 * @param groups: Record<string, GroupObject>
 * @param deletes: Record<string, boolean>
 * @param extraDeletedGroups: GroupObject[]
 */
function tranverGroups(
  data: IOldData[],
  groupMap: Record<string, GroupObject>,
  deleteMap: Record<string, boolean>,
  extraDeletedGroups: AnnotateObject[],
) {
  const needDels: string[] = [];
  // 处理空组
  for (const key in groupMap) {
    const g = groupMap[key];
    const member = g.member.find((m) => !deleteMap[m.uuid]);
    if (!member) {
      needDels.push(g.uuid);
      deleteMap[g.uuid] = true;
    }
  }
  if (needDels.length === 0) return;
  needDels.forEach((gid) => {
    const g = groupMap[gid];
    extraDeletedGroups.push(g);
    Reflect.deleteProperty(groupMap, gid);
    g.groups?.forEach((gg) => {
      // 删除组所涉及到的组
      groupMap[gg.uuid] = gg;
      // 该 删除 是组内元素, 需要记录其被删除前的组关系
      const index = gg.member.findIndex((c) => c.uuid === gg.uuid);
      data.push({ object: g, group: gg, index });
    });
  });
  tranverGroups(data, groupMap, deleteMap, extraDeletedGroups);
}
