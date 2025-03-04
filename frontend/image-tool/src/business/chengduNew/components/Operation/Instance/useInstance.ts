import { reactive, watch, ref } from 'vue';
import { Event, IUserData, AnnotateObject, IShapeConfig } from 'image-editor';
import type { IState } from './type';
import { useInjectBSEditor } from '../../../context';
import { vueMsg } from 'image-ui/utils';
import useCommon from './useCommon';
import { t } from '@/lang';

export default function useInstance() {
  const editor = useInjectBSEditor();
  // const editorState = editor.state;
  const bsState = editor.bsState;

  const domRef = ref<HTMLDivElement>();
  const state = reactive<IState>({
    // activeKey: [],
    selectMap: {},
    list: [],
    objectN: 0,
    // layer list
    listMode: 'list',
    currentList: {} as any,
    // flag
    updateListFlag: true,
    updateDataFlag: true,
    updateSelectFlag: true,
    updateStatisticFlag: true,
    // map
    sourceMap: {},
    trackMap: {},
    updateMap: {},
  });

  watch(
    () => bsState.currentSource,
    () => {
      state.currentList = state.sourceMap[bsState.currentSource] || defaultList;
    },
  );

  const { onSelect, onUpdateList, defaultList, update, onChangeListSelect } = useCommon(
    state,
    domRef as any,
  );
  state.currentList = defaultList;

  // *****life hook******
  vueMsg(editor, Event.FRAME_CHANGE, updateListByEvents);
  vueMsg(editor, Event.ANNOTATE_ADD, updateListByEvents);
  vueMsg(editor, Event.ANNOTATE_LOAD, updateListByEvents);
  vueMsg(editor, Event.ANNOTATE_REMOVE, onUpdateList);
  vueMsg(editor, Event.TRACK_OBJECT_CHANGE, onUpdateList);
  vueMsg(editor, Event.CHANGE_RESULTLIST_SELECT, onChangeListSelect);
  vueMsg(editor, Event.ANNOTATE_CHANGE, onChange);
  vueMsg(editor, Event.ANNOTATE_VISIBLE, onVisibleChange);
  vueMsg(editor, Event.SELECT, onSelect);
  vueMsg(editor, Event.NAME_OR_ALIAS, onUpdateList);
  vueMsg(editor, Event.TOOLMODE_CHANGE, onUpdateList);

  // *****life hook******

  function updateListByEvents() {
    if (layerModeDisabled(state.listMode)) return;
    onUpdateList();
  }
  function onChange(
    objects: AnnotateObject[],
    type: 'userData' | 'transform' | 'attrs' | 'positionIndex' | 'group',
    datas: any,
  ) {
    const updateMap = state.updateMap;
    state.updateDataFlag = true;
    objects.forEach((e) => {
      updateMap[e.uuid] = e;
    });

    if (type === 'positionIndex' || type === 'group') {
      state.updateListFlag = true;
    } else if (type === 'userData') {
      const userData = (Array.isArray(datas) ? datas[0] : datas) as IUserData;
      if ('classId' in userData) {
        state.updateListFlag = true;
      }
    } else if (type === 'attrs') {
      const attrs = (Array.isArray(datas) ? datas[0] : datas) as IShapeConfig;
      if ('visible' in attrs) {
        state.updateListFlag = true;
      }
    }

    update();
  }
  function onVisibleChange(objects: AnnotateObject[]) {
    const updateMap = state.updateMap;
    objects.forEach((e) => {
      updateMap[e.uuid] = e;
    });
    state.updateDataFlag = true;
    state.updateListFlag = true;

    update();
  }

  function onChangeMode() {
    if (state.listMode === 'list') {
      if (layerModeDisabled('layer', false)) return;
      state.listMode = 'layer';
      editor.state.config.showAllObject = false;
    } else {
      state.listMode = 'list';
    }
    onUpdateList();
  }
  function layerModeDisabled(
    checked: 'list' | 'layer',
    changeMode: boolean = true,
    showTips: boolean = true,
  ) {
    if (checked === 'list') return false;
    const frame = editor.getCurrentFrame();
    if (!frame) return false;
    const objects = editor.dataManager.getFrameObject(frame.id, undefined, true) || [];
    const obj = objects.find((e) => e.groups.length > 1);
    const isSomeObjHasMultipleGroup = !!obj;
    if (isSomeObjHasMultipleGroup) {
      changeMode && onChangeMode();
      showTips && editor.showMsg('warning', t('image.layerDisabledWithGroup'));
    }
    return isSomeObjHasMultipleGroup;
  }

  return {
    state,
    domRef,
    onUpdateList,
    onChangeMode,
  };
}
