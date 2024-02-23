<template>
  <div v-show="state.objectId && config.showClassView" ref="editClassView" class="edit-class">
    <div ref="container" class="edit-class-over">
      <div class="edit-class-title">
        <h3>{{ editor.lang('Track Object') + ' #' + state.trackName }}</h3>
        <CloseCircleOutlined @click="onClose" class="tool-icon" />
      </div>
      <div class="edit-class-panel">
        <ClassList @onChangeClass="onClassChange" @onChangeAttrs="onAttChange" />
        <ClassAttrsCopy v-if="state.classId && !state.isMultiple" />
      </div>
      <div class="edit-class-title">
        <h3>{{ editor.lang('Advanced') }}</h3>
      </div>
      <div class="advance-item">
        <span>{{ editor.lang('Track ID') }}</span>
        <div class="item-content">
          <div class="item-info"> {{ String(state.trackId) }} </div>
          <copy-outlined class="copy-icon" :title="'copy'" @click="onCopyTrackId" />
        </div>
      </div>
    </div>
    <div v-show="!canOperate()" class="over-not-allowed"></div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, onUpdated, onMounted } from 'vue';
  import { useClipboard } from '@vueuse/core';
  import { CopyOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';
  import { debounce, cloneDeep } from 'lodash';
  import {
    IAttr,
    IClassType,
    Event,
    AnnotateObject,
    ToolType,
    utils,
    MsgType,
  } from '../../../image-editor';
  import { useInjectEditor } from '../../context';
  import { useProvide } from './context';
  import vueEvent from '../../../image-ui/vueEvent';
  import useUI from '../../hook/useUI';

  import ClassList from './components/classList.vue';
  import ClassAttrsCopy from './components/classAttrsCopy.vue';
  import useEditclass from './useEditclass';

  interface IAttrItem extends IAttr {
    value: any;
  }
  const container = ref<HTMLElement | undefined>();

  const EVENT_SOURCE = 'edit_class';
  let currentObject = [] as AnnotateObject[];
  let currentAttrs = {} as any;
  const { canOperate } = useUI();
  const { copy } = useClipboard();
  const editor = useInjectEditor();
  const config = editor.state.config;
  const editClassView = ref<HTMLDivElement>();
  const uiSta = reactive({
    collActiveKeys: ['base'],
  });
  const state = reactive({
    searchVal: '',
    value: '',
    objects: [] as AnnotateObject[],
    objectId: [] as string[],
    trackId: [] as string[],
    trackName: [] as string[],
    toolType: ToolType.BOUNDING_BOX,
    classType: '',
    classList: [] as IClassType[],
    classId: '',
    attrs: [] as IAttrItem[],
    pointsLimit: 0,
    isMultiple: false,
    posX: 0,
    posY: 0,
    isSkeleton: false,
    reset: resetClassInfo,
  });
  useProvide(state as any);
  const { getClassInfo, getUserDataAttrs, setAttrsDefaultValue } = useEditclass();

  onMounted(() => {
    container.value?.addEventListener('scroll', () => {
      utils.elementBlur();
    });
  });
  onUpdated(() => {
    // fitPosition();
  });

  const debounceUpdate = debounce(() => {
    updateData();
  }, 100);

  vueEvent(editor, Event.SHOW_CLASS_INFO, showMsgInfo);
  vueEvent(editor, Event.ANNOTATE_REMOVE, update);
  vueEvent(editor, Event.ANNOTATE_USER_DATA, update);
  vueEvent(editor, Event.TRACK_OBJECT_CHANGE, update);
  vueEvent(editor, Event.SELECT, onSelect);

  function onCopyTrackId() {
    copy(String(state.trackId));
    editor.showMsg(MsgType.success, editor.lang('copy-ok'));
  }
  function update() {
    if (editor.eventSource === EVENT_SOURCE) return;
    debounceUpdate();
  }

  function resetClassInfo() {
    currentObject?.length > 0 && showObject(currentObject);
  }

  function showMsgInfo(object: AnnotateObject | AnnotateObject[]) {
    config.showClassView = true;
    uiSta.collActiveKeys = ['base'];
    showObject(object);
  }

  function onSelect() {
    if (!config.showClassView) return;
    const selection = editor.selection;
    if (selection.length === 1) {
      currentObject = selection;
      showObject(selection[0]);
    } else {
      onClose();
    }
  }

  function onClose() {
    config.showClassView = false;
  }

  const showObject = debounce((object: AnnotateObject | AnnotateObject[]) => {
    state.isMultiple = Array.isArray(object) && object.length > 1;
    const objects: AnnotateObject[] = Array.isArray(object) ? object : [object];
    state.objectId.length = 0;
    state.trackId.length = 0;
    state.trackName.length = 0;
    state.objects = objects;
    objects.forEach((obj) => {
      state.objectId.push(obj.uuid);
      state.trackId.push(obj.userData.trackId);
      state.trackName.push(obj.userData.trackName);
    });
    updateData();
  }, 100);

  function updateData() {
    console.log('class edit updateData ');

    state.isSkeleton = false;
    const objArr: AnnotateObject[] = [];
    state.objectId.forEach((id) => {
      const obj = editor.dataManager.getObject(id);
      if (obj) {
        objArr.push(obj);
        obj.userData.needCompose = true;
      }
    });
    if (objArr.length === 0) {
      state.objectId = [];
      onClose();
      return;
    }

    currentObject = objArr;
    const object = objArr[0];
    const userData = getClassInfo(object);
    state.pointsLimit = userData.pointsLimit || 0;
    const classConfig = editor.getClassType(userData.classId || '');

    state.classType = classConfig ? classConfig.name : '';
    state.classId = classConfig ? classConfig.id : '';
    state.toolType = classConfig?.toolType || userData.toolType || object.toolType;

    updateAttrInfo(object, state.classId);

    state.classList = editor.getClassList(state.toolType);
  }

  function onClassChange(classId: string) {
    const classConfig = editor.getClassType(classId);
    if (!classConfig) return;
    editor.trackManager.addChangedTrack(state.trackId);
    let objects: AnnotateObject[] = [];
    if (editor.state.isSeriesFrame) {
      objects = editor.trackManager.getObjects(state.trackId);
    } else objects = currentObject;

    editor.cmdManager.withGroup(() => {
      if (editor.state.isSeriesFrame) {
        const data = { classId: classId, classType: classConfig.name };
        const trackData = state.trackId.map((trackId) => {
          return { trackId, data };
        });
        editor.cmdManager.execute('update-track', trackData);
      }

      editor.cmdManager.execute('update-user-data', {
        objects,
        data: {
          classId: classId,
          classType: classConfig.name,
          attrs: {},
        },
      });
    });
    editor.mainView.draw();
  }

  const debounceUpdateAttr = debounce(() => {
    editor.withEventSource(EVENT_SOURCE, () => {
      const attrs = JSON.parse(JSON.stringify(currentAttrs));
      editor.cmdManager.execute('update-user-data', {
        objects: currentObject,
        data: {
          attrs,
        },
      });
    });
  }, 100);

  function onAttChange(name: string, value: any) {
    currentAttrs[name] = value;
    debounceUpdateAttr();
    // console.log('更新attrs:', currentAttrs);
  }

  function updateAttrInfo(object: AnnotateObject, classId: string) {
    const classConfig = editor.getClassType(classId);
    if (!classConfig) return;
    const attrs = getUserDataAttrs(object);
    const newAttrs: any[] = cloneDeep(classConfig.attrs || []);
    setAttrsDefaultValue(newAttrs, attrs);
    state.attrs = newAttrs;
    currentAttrs = JSON.parse(JSON.stringify(attrs));
  }
</script>
<style lang="less" scoped>
  .edit-class {
    position: absolute;
    right: 2px;
    bottom: 2px;
    padding: 10px 0;
    border-radius: 10px;
    z-index: 11;
    width: 360px;
    background: #393c45;

    .edit-class-over {
      padding: 0 5px;
      overflow: auto;
      min-height: 100px;
      max-height: min(600px, 60vh);
    }
    .edit-class-title {
      display: flex;
      align-items: center;
      padding: 4px 10px;
      h3 {
        flex: 1;
        text-align: left;
        font-weight: 600;
        padding: 0;
        margin: 0;
      }
    }
    .edit-class-panel {
      padding: 0 20px;
      text-align: left;
    }

    .tool-icon {
      font-size: 18px;
    }
    .advance-item {
      margin-bottom: 20px;
      text-align: left;
      padding: 0 20px;

      .item-content {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }

      .item-info {
        display: inline-block;
        padding: 2px 5px;
        width: 290px;
        background-color: #4a5162;
      }

      .copy-icon {
        margin-top: 2px;
        font-size: 20px;

        :hover {
          color: #2e8cf0;
        }
      }
    }

    .ant-collapse {
      border: 0;
    }
  }
</style>
