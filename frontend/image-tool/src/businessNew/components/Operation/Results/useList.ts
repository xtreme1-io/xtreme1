import { Ref } from 'vue';
import { IClassItem, IObjectItem, IState } from './type';
import { useInjectBSEditor } from '../../../context';
import { debounce } from 'lodash';
import { IFrame, IUserData } from 'image-editor';
import { getObjectInfo } from './utils';

export const animation = {
  onEnter(node: any, done: any) {},
  onLeave(node: any, done: any) {
    done();
  },
};

export default function useList(state: IState, domRef: Ref<HTMLDivElement>) {
  const editor = useInjectBSEditor();

  /** list scroll */
  const scrollSelectToView = debounce(() => {
    if (!domRef.value) return;

    const item = domRef.value.querySelector('.result-data-list .list > .item.active');
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
  function getClassList() {
    const classMap: Record<string, IClassItem> = {};
    const classTypes = editor.state.classTypes;
    classTypes.forEach((config) => {
      const classItem: IClassItem = {
        data: [],
        alias: config.alias,
        color: config.color || '#ffffff',
        id: config.id,
        name: config.name,
        classType: config.name,
        classId: config.id,
        toolType: config.toolType,
        key: config.id,
      };
      classMap[config.id] = classItem;
    });
    return classMap;
  }

  const update = debounce(() => {
    if (state.updateListFlag) {
      state.updateSelectFlag = true;
      updateList();
    }
    if (state.updateSelectFlag) {
      updateSelect();
    }
    scrollSelectToView();
  }, 100);
  function onUpdateList() {
    state.updateListFlag = true;
    update();
  }
  function onSelect() {
    state.updateSelectFlag = true;
    update();
  }

  function updateList() {
    const isShowAll = false;
    let frames: IFrame[] = [];
    if (isShowAll) frames = editor.state.frames;
    else frames = [editor.getCurrentFrame()];
    const filter = editor.getRenderFilter();
    let objN = 0;

    // class items
    const classMap = getClassList();
    // object items
    frames.forEach((f) => {
      let objs = editor.dataManager.getFrameObject(f.id) || [];
      objs = objs.filter((e) => filter(e));
      objs.forEach((obj) => {
        const userData = editor.getUserData(obj);
        const trackName = userData.trackName || '';
        const trackId = userData.trackId || '';
        const { isModel, classId, className } = getClassInfo(userData);
        const classConfig = editor.getClassType(classId);
        const toolType = classConfig ? classConfig.toolType : obj.toolType;
        let classItem = classMap[classId];
        if (!classItem) {
          classItem = {
            data: [],
            alias: classConfig?.label,
            color: 'rgb(252, 177, 122)',
            id: classId,
            name: classId ? className : editor.lang('Class Required'),
            classType: className,
            classId: classId,
            toolType,
            isModel: isModel,
            visible: false,
            key: classId,
          };
          classMap[classId] = classItem;
        }
        const objItem: IObjectItem = {
          id: obj.uuid,
          trackId,
          trackName,
          name: trackName,
          classType: classConfig?.name || '',
          classId,
          toolType,
          visible: obj.showVisible,
          isModel: false,
          frame: obj.frame,
          key: obj.uuid + Date.now(),
        };
        objItem.attrLabel = classConfig ? editor.getValidAttrs(userData) : '';
        const infos = getObjectInfo(obj);
        objItem.sizeLabel = infos.join(' | ');
        classItem.data.push(objItem);
        objN++;
        if (obj.showVisible) classItem.visible = true;
      });
    });
    const list: IClassItem[] = [];
    Object.values(classMap).forEach((e) => {
      if (e.data.length === 0) return;
      if (e.id === '') list.unshift(e);
      else list.push(e);
    });
    state.list = list;
    state.objectN = objN;
    console.log('=======>>>>>>>>> result state', state);
  }
  function updateSelect() {
    console.log('updateSelect');
    const selection = editor.selection;
    state.selectMap = {};
    if (selection.length === 0) return;
    selection.forEach((object) => {
      state.selectMap[object.uuid] = true;
      state.updateSelectFlag = false;
      const userData = editor.getUserData(object);
      const { classId } = getClassInfo(userData);
      if (state.activeClass.indexOf(classId) < 0) {
        state.activeClass = [...state.activeClass, classId];
      }
    });
  }

  return {
    update,
    onUpdateList,
    onSelect,
  };
}
