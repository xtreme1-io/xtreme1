import Editor from '../../common/Editor';
import { SnapshotGroup } from '@basicai/tool-components';
import { IBasicAIFormat } from '../../utils';

export type CompareResult<T = any> = {
  dataId: number;
  create: T[];
  delete: T[];
  edit: T[];
  validity: string;
  classifications: any[];
};

function getObjectMap(data?: IBasicAIFormat) {
  const objMap: Record<string, any> = {};
  if (!data) return objMap;
  const objects = [...(data.objects || []), ...(data.segments || [])];
  objects.forEach((o) => {
    objMap[o.id] = o;
  });
  return objMap;
}
type PcSnapshotGroup = SnapshotGroup<IBasicAIFormat>;
export class SnapshotManager {
  editor: Editor;
  current: PcSnapshotGroup;
  history: PcSnapshotGroup;
  constructor(editor: Editor) {
    this.editor = editor;
    this.current = new SnapshotGroup();
    this.history = new SnapshotGroup();
  }

  /**
   * target基于base比较差异
   */
  compare(
    base: SnapshotGroup<IBasicAIFormat> | IBasicAIFormat[],
    target: SnapshotGroup<IBasicAIFormat> | IBasicAIFormat[],
    dataIds?: (string | number)[],
  ) {
    const compareResult: Record<string, CompareResult> = {};

    const arrayToMap = (
      data: SnapshotGroup<IBasicAIFormat> | IBasicAIFormat[],
    ): Record<string, IBasicAIFormat> => {
      data =
        data instanceof SnapshotGroup ? Object.values(data.dataMap).map((e) => e.getData()) : data;
      return data.reduce((m: any, e: any) => {
        m[e.dataId] = e;
        return m;
      }, {});
    };
    const baseData = arrayToMap(base);
    const targetData = arrayToMap(target);
    dataIds = dataIds || Object.keys(baseData);
    dataIds.forEach((dataId) => {
      const _cData = baseData[dataId];
      const _tData = targetData[dataId];
      if (!dataId) return;
      const frameResult: CompareResult = {
        dataId: +dataId,
        create: [],
        delete: [],
        edit: [],
        validity: _tData.validity,
        classifications: _tData.classifications,
      };
      compareResult[dataId] = frameResult;
      const curObjMap = getObjectMap(_cData);
      const targetObjMap = getObjectMap(_tData);
      const objIds = new Set([...Object.keys(curObjMap), ...Object.keys(targetObjMap)]);
      objIds.forEach((id) => {
        const curObj = curObjMap[id];
        const targetObj = targetObjMap[id];
        const cVersion = curObj?.version ?? 0;
        const tVersion = targetObj?.version ?? 0;
        if (curObj && targetObj) {
          if (tVersion != cVersion) {
            frameResult.edit.push(targetObj);
          }
        } else if (curObj) {
          frameResult.delete.push(curObj);
        } else if (targetObj) {
          frameResult.create.push(targetObj);
        }
      });
    });
    return Object.values(compareResult);
  }
  clear() {
    this.current.clear();
    this.history.clear();
  }
}
