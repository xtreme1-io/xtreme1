import { computed, Ref, markRaw } from 'vue';
import * as _ from 'lodash';
import {
  IUserData,
  utils,
  ToolType,
  AnnotateObject,
  GroupObject,
  Skeleton,
  Const,
  ToolModelEnum,
} from 'image-editor';
import type { IItem, IState, IClass, ISourceObject } from './type';
import { IResultSource, SourceType } from '../../../type';
import { useInjectBSEditor } from '../../../context';
import { getObjectInfo } from './utils';
import DashObject from './dashObjectScript';
import { t } from '@/lang';

export const animation = {
  onEnter(node: any, done: any) {},
  onLeave(node: any, done: any) {
    done();
  },
};

export default function useCommon(state: IState, domRef: Ref<HTMLDivElement>) {
  const editor = useInjectBSEditor();
  const bsState = editor.bsState;

  const defaultList = createSource({
    name: 'Results',
    sourceId: '-1',
    sourceType: SourceType.DATA_FLOW,
  });

  const scrollSelectToView = _.debounce(() => {
    if (!domRef.value) return;

    let item;
    if (state.listMode === 'list') {
      item = domRef.value.querySelector('.result-data-list .list > .item.active');
    } else {
      item = domRef.value.querySelector('.result-layer-custom  .layer-item.active');
    }
    if (item) {
      if (!isSelectVisible(item as any, domRef.value)) {
        item.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      }
    }
  }, 100);

  function isSelectVisible(dom: HTMLDivElement, parent: HTMLDivElement) {
    const parentBox = parent.getBoundingClientRect();
    const domBox = dom.getBoundingClientRect();

    if (domBox.y + domBox.height > parentBox.y + parentBox.height || domBox.y < parentBox.y)
      return false;
    return true;
  }

  const update = _.debounce(() => {
    if (state.updateListFlag) {
      state.updateDataFlag = true;
      state.updateSelectFlag = true;
      state.updateStatisticFlag = true;
      createList();
    }

    if (state.updateSelectFlag) {
      updateSelect();
    }

    if (state.updateDataFlag) {
      updateData();
    }

    if (state.updateStatisticFlag) {
      updateStatistic();
    }

    scrollSelectToView();
    DashObject.getInstance(editor).onAction('update');
  }, 100);

  const frameSourceMap = computed(() => {
    const sourceMap = {} as Record<string, IResultSource>;
    const frame = editor.getCurrentFrame();
    const sources = editor.dataManager.getSources(frame);
    sources.forEach((e) => {
      sourceMap[e.sourceId] = e;
    });
    return sourceMap;
  });

  function onUpdateList() {
    state.updateListFlag = true;
    update();
  }

  function onSelect() {
    state.updateSelectFlag = true;
    update();
  }

  function createList() {
    const sourceMap: Record<string, ISourceObject> = {};
    // key有层级信息
    const trackMap: Record<string, IItem> = {};
    const classMap: Record<string, IClass> = {};
    const updateMap: Record<string, AnnotateObject> = {};
    // 防止响应式处理
    markRaw(updateMap);

    const oldActive = getOldActive();
    const filter = editor.loadManager.getRenderFilter();
    initClassSourceMap(classMap, sourceMap, oldActive);

    const isShowAll =
      editor.state.config.showAllObject &&
      editor.state.isSeriesFrame &&
      editor.state.imageToolMode === ToolModelEnum.INSTANCE;
    if (isShowAll) {
      createListFromGlobal(sourceMap, classMap, trackMap, updateMap, filter);
    } else {
      createListFromCurrentObject(sourceMap, classMap, trackMap, updateMap, filter);
    }

    state.currentList = sourceMap[bsState.currentSource] || defaultList;
    state.currentList.classData.forEach((e) => e.data.sort((a, b) => +a.name - +b.name));
    state.currentList.layerData.sort((a, b) => +a.name - +b.name);
    state.sourceMap = sourceMap;
    state.trackMap = trackMap;
    state.updateMap = updateMap;
    state.updateListFlag = false;
  }

  function updateSelect() {
    const selection = editor.selection;
    if (selection.length === 0) {
      state.selectMap = {};
      return;
    }
    const selectMap: any = {};
    selection.forEach((object) => {
      const userData = editor.getUserData(object);
      const { sourceId } = getSourceInfo(userData);
      const { classId } = getClassInfo(userData);
      const classMapId = sourceId + '##' + classId;
      const sourceInfo = state.sourceMap[sourceId];
      if (!sourceInfo) return;
      selectMap[object.uuid] = true;
      selectMap[object.userData.trackId] = true;
      if (sourceInfo.activeClass.indexOf(classMapId) < 0)
        sourceInfo.activeClass = [...sourceInfo.activeClass, classMapId];
    });
    state.selectMap = selectMap;
    state.updateSelectFlag = false;
  }

  // update item 信息
  function updateData() {
    const config = editor.state.config;
    const updateMap = state.updateMap;
    for (const uuid in updateMap) {
      const obj = updateMap[uuid];
      const userData = editor.getUserData(obj);

      const key = userData.trackId || '';
      const item = state.trackMap[key];
      if (!item) continue;

      item.visible = obj.showVisible;
      item.infoLabel = getInfo(obj);
      item.hasObject = true;
      item.id = obj.uuid;
      item.trueValue = userData.resultStatus === Const.True_Value;
      item._log_op = obj._log_op;
      item._deleted = obj._deleted;
      if (config.showAttrs) {
        const { classId } = getClassInfo(userData);
        const classConfig = editor.getClassType(classId);
        if (classConfig) {
          item.attrLabel = editor.getValidAttrs(userData);
        }
      } else {
        item.attrLabel = '';
      }

      if (config.showSize) {
        const infos = getObjectInfo(obj);
        if (infos.length > 0) {
          item.sizeLabel = infos.join(' | ');
        }
      } else {
        item.sizeLabel = '';
      }
    }

    state.updateMap = {};
    state.updateDataFlag = false;
  }

  function getInfo(object: AnnotateObject) {
    let info = '';
    if (object instanceof Skeleton) {
      const validN = object.points.filter((e) => e.attrs.valid).length;
      info = `${validN}/${object.points.length}`;
    }
    return info;
  }

  function createListFromGlobal(
    sourceMap: Record<string, ISourceObject>,
    classMap: Record<string, IClass> = {},
    trackMap: Record<string, IItem> = {},
    updateMap: Record<string, AnnotateObject> = {},
    filter: (e: AnnotateObject) => boolean,
  ) {
    const { frames } = editor.state;
    const { currentSource } = editor.bsState;
    const curFrame = editor.getCurrentFrame();

    frames.forEach((frame) => {
      const objects = editor.dataManager.getFrameObject(frame.id, undefined, true) || [];

      utils.traverse(objects, (object) => {
        const objSourceId = object.userData.sourceId || '-1';
        if (!filter(object) || !sourceMap[objSourceId]) return;

        // updateMap current frame
        if (frame.id === curFrame.id) {
          updateMap[object.uuid] = object;
        } else if (object.isGroup()) {
          return;
        }

        const userData = editor.getUserData(object);
        const trackName = userData.trackName || '';
        const trackId = userData.trackId || '';
        const { sourceId } = getSourceInfo(userData);

        if (currentSource !== sourceId) return;

        // key
        const key = trackId;
        if (!trackMap[key]) {
          const { isModel, classId, className } = getClassInfo(userData);
          const classMapId = getId([sourceId, classId]);
          const classConfig = editor.getClassType(classId);

          const toolType = classConfig ? classConfig.toolType : object.toolType;
          const color = classConfig ? classConfig.color : '#ffffff';

          // model标签
          if (!classMap[classMapId]) {
            const classData: IClass = {
              key: classMapId,
              id: classId,
              classType: classId,
              name: classId ? className : t('image.Class Required'),
              alias: classConfig?.alias || '',
              icon: toolType,
              color: 'rgb(252, 177, 122)',
              data: [],
              visible: false,
              isModel: isModel,
            };
            if (classId) {
              sourceMap[sourceId].classData.push(classData);
            } else {
              // 没有标签的放到第一个
              sourceMap[sourceId].classData.unshift(classData);
            }
            classMap[classMapId] = classData;
          }

          const item: IItem = {
            id: object.uuid,
            trackId: trackId,
            name: trackName,

            classType: editor.getLabel(classConfig),
            classId,
            toolType: toolType as any,
            color,
            icon: toolType,
            data: [],
            visible: false,
            isModel: false,
            frame: object.frame,
          };
          // if (object.frame?.id == curFrame?.id) {
          //   item._log_op = object._log_op;
          //   item._deleted = object._log_op == LogOpEnum.Delete;
          // }
          trackMap[key] = item;
          classMap[classMapId].data.push(item);
        }
      });
      // 处理组
      Object.values(trackMap).forEach((e) => {
        if (e.toolType !== ToolType.GROUP) return;
        const group = editor.dataManager.getObject(e.id, frame);
        if (!group || !(group instanceof GroupObject) || !group.isGroup()) return;
        if (group.member.length === 0) {
          delete trackMap[group.userData.trackId];
          return;
        }
        e.data = group.member.map((c) => trackMap[c.userData.trackId]).filter((e) => e);
      });
    });
  }

  function createListFromCurrentObject(
    sourceMap: Record<string, ISourceObject>,
    classMap: Record<string, IClass> = {},
    trackMap: Record<string, IItem> = {},
    updateMap: Record<string, AnnotateObject> = {},
    filter: (e: AnnotateObject) => boolean,
  ) {
    const frame = editor.getCurrentFrame();
    if (!frame) return;
    const objects = editor.dataManager.getFrameObject(frame.id, undefined, true) || [];

    objects.forEach((object) => {
      const objSourceId = object.userData.sourceId || '-1';
      if (!sourceMap[objSourceId]) return;
      getObjectData(object, sourceMap, trackMap, classMap, filter);
    });

    // object map
    utils.traverse(objects, (e) => {
      updateMap[e.uuid] = e;
    });
  }

  function updateStatistic() {
    const sourceMap = state.sourceMap;
    // console.log('filterData:', sourceMap);
    Object.keys(sourceMap).forEach((key) => {
      let objectN = 0;
      if (state.listMode === 'list') {
        sourceMap[key].classData.forEach((classInfo) => {
          const filterData = [] as any[];
          let hasVisible = false;
          classInfo.data = classInfo.data.filter((item) => {
            if (!item) return;
            filterData.push(item);
            if (item.visible && item.hasObject) hasVisible = true;
            if (item.toolType != ToolType.GROUP && !item._deleted) objectN++; // 不统计group的数量
          });

          classInfo.data = filterData;
          classInfo.visible = hasVisible;
        });
      } else {
        sourceMap[key].layerData.forEach((e) => {
          if (e.toolType != ToolType.GROUP && !e._deleted) objectN++; // 不统计group的数量
        });
      }
      sourceMap[key].objectN = objectN;
    });

    state.updateStatisticFlag = false;
  }

  function initClassSourceMap(
    classMap: Record<string, IClass>,
    sourceMap: Record<string, ISourceObject>,
    oldActive: Record<string, string[]>,
  ) {
    const { currentSource } = editor.bsState;
    const sources = editor.dataManager.getSources(editor.getCurrentFrame());
    if (!sources) return;

    const source = sources.find((e) => e.sourceId === currentSource);
    if (!source) return;

    // sources.forEach((source) => {
    const sourceId = source.sourceId;
    // let sourceConfig = frameSourceMap.value[sourceId];
    const sourceInfo = createSource(source);
    // active
    sourceInfo.activeClass = oldActive[sourceInfo.key] || [];
    sourceMap[sourceId] = sourceInfo;

    if (state.listMode === 'layer') return;

    const classTypes = editor.getClassTypesByToolmode(editor.state.imageToolMode);
    classTypes.forEach((classConfig) => {
      const classMapId = getId([sourceId, classConfig.id]);

      const toolType = classConfig ? classConfig.toolType : '';
      const color = classConfig ? classConfig.color : '#ffffff';

      if (!classMap[classMapId]) {
        const classData: IClass = {
          key: classMapId,
          id: classConfig.id,
          classType: classConfig.id,
          name: classConfig.name,
          alias: classConfig?.alias || '',
          icon: toolType,
          color,
          data: [],
          visible: false,
          isModel: false,
        };
        sourceInfo.classData.push(classData);
        classMap[classMapId] = classData;
      }
    });
    // });
  }

  function getId(infos: any[]) {
    return infos.join('##');
  }

  function getOldActive() {
    const activeMap = {} as Record<string, string[]>;
    Object.keys(state.sourceMap).forEach((key) => {
      const classify = state.sourceMap[key];
      activeMap[classify.key] = classify.activeClass;
    });
    return activeMap;
  }

  function getObjectData(
    object: AnnotateObject,
    sourceMap: Record<string, ISourceObject>,
    trackMap: Record<string, IItem>,
    classMap: Record<string, IClass>,
    filter: (e: AnnotateObject) => boolean,
    autoAdd = true,
  ) {
    const userData = editor.getUserData(object);
    const trackName = userData.trackName || '';
    const trackId = userData.trackId || '';
    const { sourceId } = getSourceInfo(userData);
    const { isModel, classId, className } = getClassInfo(userData);

    const classMapId = sourceId + '##' + classId;
    const classConfig = editor.getClassType(classId);

    const toolType = classConfig ? classConfig.toolType : object.toolType;
    const color = classConfig ? classConfig.color : '#ffffff';

    // list 模式
    if (state.listMode === 'list') {
      // model标签
      if (!classMap[classMapId]) {
        const classData: IClass = {
          key: classMapId,
          id: classId,
          classType: classId,
          name: classId ? className : t('image.Class Required'),
          alias: classConfig?.alias || '',
          icon: toolType,
          color: 'rgb(252, 177, 122)',
          data: [],
          visible: false,
          isModel: isModel,
        };

        if (classId) {
          sourceMap[sourceId].classData.push(classData);
        } else {
          // 没有标签的放到第一个
          sourceMap[sourceId].classData.unshift(classData);
        }
        classMap[classMapId] = classData;
      }
    }

    const key = trackId;
    const item: IItem = {
      id: object.uuid,
      trackId: trackId,
      name: trackName,
      classType: editor.getLabel(classConfig),
      classId,
      toolType: toolType as any,
      color,
      icon: toolType,
      data: [],
      visible: object.showVisible,
      isModel: false,
      frame: object.frame,
      _log_op: object._log_op,
      _deleted: object._deleted,
    };
    trackMap[key] = item;

    if (autoAdd) {
      if (state.listMode === 'list') {
        // 按trackName大小插入 排序显示
        classMap[classMapId].data[trackName as any] = item;
      } else {
        if (object.groups.length === 0) sourceMap[sourceId].layerData.push(item);
      }
    }

    if (object.isGroup()) {
      object.member.forEach((subObj) => {
        // filter
        if (!filter(subObj)) return;

        const subData = getObjectData(
          subObj,
          sourceMap,
          trackMap,
          classMap,
          filter,
          state.listMode === 'list',
        );
        item.data.push(subData);
      });
    }

    return item;
  }

  function getClassInfo(userData: IUserData) {
    let className = '';
    let classId = '';
    let isModel = false;
    if (!userData.classId && userData.modelClass) {
      isModel = true;
      classId = '__Model__##' + userData.modelClass;
      className = userData.modelClass;
    } else {
      classId = userData.classId || '';
      const classConfig = editor.getClassType(classId);
      className = classConfig ? classConfig.name : '';
    }
    return { className, isModel, classId };
  }

  function getSourceInfo(userData: IUserData) {
    const { config } = editor.state;
    let sourceId = userData.sourceId || config.defaultSourceId;
    let sourceConfig = frameSourceMap.value[sourceId];
    if (!sourceConfig) {
      sourceConfig = frameSourceMap.value[config.defaultSourceId];
      sourceId = config.defaultSourceId;
      userData.sourceId = sourceId;
    }

    return { sourceId, sourceConfig };
  }

  function createSource(config: IResultSource) {
    const data: ISourceObject = {
      key: config.sourceId,
      name: config.name,
      classData: [],
      layerData: [],
      layerActive: [],
      objectN: 0,
      // visible: false,
      // active: [],
      activeClass: [],
      sourceId: '-1',
      sourceType: config.sourceType,
    };
    return data;
  }
  function onChangeListSelect(step: number) {
    const isLayer = state.listMode === 'layer';
    let nextSelect: AnnotateObject[] = [];
    const itemList: IItem[] = [];
    if (isLayer) {
      state.currentList.layerData.forEach(function _push(e) {
        itemList.push(e);
        if (e.toolType == ToolType.GROUP) {
          e.data.forEach(_push);
        }
      });
    } else {
      state.currentList.classData.forEach((e) => {
        itemList.push(...e.data.filter((e) => e.hasObject));
      });
    }
    const currentSelectIndex = itemList.findIndex((e) => state.selectMap[e.id]);
    const nextIndex =
      currentSelectIndex >= 0
        ? (itemList.length + currentSelectIndex + step) % itemList.length
        : step > 0
        ? 0
        : itemList.length - 1;
    const objectId = itemList[nextIndex]?.id;
    let nextObj = editor.dataManager.getObject(objectId) as AnnotateObject;
    if (nextObj) nextSelect.push(nextObj);
    if (nextObj && nextObj.isGroup()) {
      nextObj = nextObj as GroupObject;
      if (nextObj.member.length > 0) {
        nextSelect = nextSelect.concat(nextObj.member);
      }
    }
    editor.selectObject(nextSelect[0]);
    if (nextSelect.length > 1) {
      editor.visibleObjects({ showObjects: nextSelect.slice(1) });
    }
    editor.mainView.focusObject(nextSelect[0]);
  }

  return {
    update,
    defaultList,
    onUpdateList,
    onSelect,
    getObjectData,
    getClassInfo,
    getSourceInfo,
    onChangeListSelect,
  };
}
