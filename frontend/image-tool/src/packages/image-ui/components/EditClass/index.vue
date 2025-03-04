<template>
  <div
    v-show="state.objectId && config.showClassView"
    ref="editClassView"
    :class="{ 'edit-class': true, 'skeleton-class': state.isSkeleton }"
  >
    <ResizeComponent :limit-size="getLimitBox()" @resize-end="onResizeEnd" />
    <DragComponent :update-time="updateTime" @drag-end="onDragEnd" />
    <div ref="container" class="edit-class-over">
      <EditClassPanel
        ref="editComponent"
        v-bind="{
          locale: editor.state.lang,
          closeable: true,
          classData: classData,
          attrData: state.attrs,
          disabled: !canEdit(),
          labelKey: config.nameShowType,
          onClassChange: handleClassChange,
          onAttrChange: onAttChange,
        }"
        style="padding-left: 16px"
        @close="onClose"
        @hover="onHover"
      >
        <template #classTitle>
          <span v-if="state.isAnchor">
            {{
              t('image.Track Object') +
              ' #' +
              String(state.trackName) +
              ` · ${Number(anchorIndex()) + 1}`
            }}
          </span>
          <span v-else>
            {{ t('image.Track Object') + ' #' + String(state.trackName) }}
            &nbsp;
            <EyeOutlined
              v-if="uiSta.showTrackObj"
              class="tool-icon eyes-icon"
              @click.stop="onTrackObjVisible(false)"
            />
            <EyeInvisibleOutlined
              v-else
              class="tool-icon eyes-icon"
              @click.stop="onTrackObjVisible(true)"
            />
          </span>
        </template>
        <template #attrTitle>
          <ClassAttrsCopy
            v-if="editor.state.isSeriesFrame && !state.isMultiple && !state.isAnchor"
          />
          <span v-else> {{ t('image.Attribute') }} </span>
        </template>
        <a-collapse v-model:activeKey="uiSta.collActiveKeys" ghost>
          <a-collapse-panel
            v-if="!state.isMultiple && editor.state.isSeriesFrame && !state.isAnchor"
            key="advance"
            :header="t('image.Advanced')"
          >
            <div class="advance-item">
              <span>{{ t('image.Track ID') }}</span>
              <div class="item-content">
                <a-input
                  size="small"
                  style="margin-right: 4px; width: 250px; font-size: 12px; line-height: 24px"
                  disabled
                  :value="state.trackId"
                  placeholder=""
                />
                <copy-outlined class="copy-icon" :title="'copy'" @click="onCopyTrackId" />
              </div>
            </div>
            <div v-if="canEdit()">
              <div class="advance-item">
                <label>{{ t('image.Status') }}</label>
                <a-button
                  style="margin-left: 6px"
                  size="small"
                  type="primary"
                  @click="markAllTrueValue"
                >
                  {{ t('image.Mark All as Ground Truth') }}
                </a-button>
              </div>
              <ObjectMerge />
              <ObjectSplit />
              <ObjectDelete />
            </div>
          </a-collapse-panel>
        </a-collapse>
      </EditClassPanel>
    </div>
    <div v-show="!canOperate()" class="over-not-allowed"></div>
  </div>
</template>

<script setup lang="ts">
  import {
    EditClassPanel,
    CustomTip,
    IClassTypeItem,
    IAttrItem,
    ClassUtils,
    TempClassInfoTip,
  } from '@basicai/tool-components';
  import { reactive, ref, onUpdated, onMounted, nextTick, computed, createVNode } from 'vue';
  import { useClipboard } from '@vueuse/core';
  import { EyeOutlined, EyeInvisibleOutlined, CopyOutlined } from '@ant-design/icons-vue';
  import { debounce } from 'lodash';
  import {
    IAttr,
    IClassType,
    Event,
    AnnotateObject,
    ToolType,
    Const,
    IUserData,
    utils,
    PropValueOrigin,
  } from '../../../image-editor';
  import { t } from '@/lang';
  import { useInjectEditor } from '../../context';
  import { useProvide } from './context';
  import { vueMsg } from '../../utils';
  import useUI from '../../hook/useUI';
  import { setStorageEditclass, getStorageEditclass } from '../../hook/useStorage';

  import ClassAttrsCopy from './components/classAttrsCopy.vue';
  import ObjectDelete from './components/ObjectDelete.vue';
  import ObjectMerge from './components/ObjectMerge.vue';
  import ObjectSplit from './components/ObjectSplit.vue';
  import useEditclass from './useEditclass';
  import { Checkbox } from 'ant-design-vue';
  import { ResizeComponent, DragComponent } from '@basicai/tool-components';

  const container = ref<HTMLElement | undefined>();
  const editComponent = ref<any>();

  const EVENT_SOURCE = 'edit_class';
  let currentObject = [] as AnnotateObject[];
  let currentAttrs = {} as any;
  const { canEdit, canOperate } = useUI();
  const { copy } = useClipboard();
  const editor = useInjectEditor();
  const config = editor.state.config;
  const editClassView = ref<HTMLDivElement>();
  const updateTime = ref<string>('');

  const uiSta = reactive({
    collActiveKeys: ['advance'],
    showTrackObj: true,
  });
  const updateVisible = () => {
    let show = true;
    currentObject?.forEach((e) => {
      show = show && e.showVisible;
    });
    uiSta.showTrackObj = show;
  };
  const state = reactive({
    searchVal: '',
    value: '',
    objects: [] as AnnotateObject[],
    objectId: [] as string[],
    trackId: [] as string[],
    trackName: [] as string[],
    toolType: ToolType.BOUNDING_BOX as ToolType,
    classType: '',
    classList: [] as IClassType[],
    classId: '',
    attrs: [] as IAttr[],
    pointsLimit: 0,
    isMultiple: false,
    posX: 0,
    posY: 0,
    isSkeleton: false,
    isAnchor: false, // 是否是 多边形/线的点打标签
    hideMsg: false,
    reset: resetClassInfo,
  });
  useProvide(state as any);

  const classData = computed(() => {
    const childrenMap = editor.state.classTypes.reduce<Record<string, IClassTypeItem[]>>(
      (m, item: IClassTypeItem) => {
        if (item.parentId) {
          if (!m[item.parentId]) m[item.parentId] = [];
          m[item.parentId].push(item);
        }
        return m;
      },
      {},
    );
    return state.classList
      .filter((c) => {
        return !c.parent;
      })
      .map(function createClassDataOption(item: IClassTypeItem): any {
        return {
          item: item,
          active: item.id == state.classId,
          disabled: (item.getToolOptions().polygonPoint || 0) != (state.pointsLimit || 0),
          withIcon: false,
          children: (childrenMap[item.id] || []).map(createClassDataOption),
        };
      });
  });
  const {
    isEditAnchorClass,
    anchorIndex,
    getClassInfo,
    getAnchorCmdData,
    getUserDataAttrs,
    getAnchorAttrs,
  } = useEditclass();

  onMounted(() => {
    container.value?.addEventListener('scroll', () => {
      utils.elementBlur();
    });
    if (editClassView.value) {
      const styleStr = getStorageEditclass();
      const style = styleStr
        ? JSON.parse(styleStr)
        : { bottom: '2px', right: '2px', width: '360px' };
      delete style.updateTime;
      for (const key in style) {
        editClassView.value.style[key as any] = style[key];
      }
    }
  });
  onUpdated(() => {
    nextTick(() => {
      if (container.value && editClassView.value) {
        const root = editClassView.value.parentElement;
        if (!root) return;
        const rect = root.getBoundingClientRect();
        const maxH = rect.height * 0.99 - 20;
        container.value.style.maxHeight = maxH + 'px';
      }
    });
  });

  const debounceUpdate = debounce(() => {
    updateData();
  }, 100);

  vueMsg(editor, Event.SHOW_CLASS_INFO, showMsgInfo);
  vueMsg(editor, Event.ANNOTATE_REMOVE, update);
  vueMsg(editor, Event.ANNOTATE_USER_DATA, update);
  vueMsg(editor, Event.ANNOTATE_VISIBLE, updateVisible);
  vueMsg(editor, Event.TRACK_OBJECT_CHANGE, update);
  vueMsg(editor, Event.ANNOTATE_OBJECT_POINT, onAnchorClass);
  vueMsg(editor, Event.SELECT, onSelect);

  function onTrackObjVisible(visible: boolean) {
    const params: Record<string, any> = {};
    if (visible) {
      params.showObjects = currentObject;
    } else {
      params.hideObjects = currentObject;
    }
    editor.visibleObjects(params);
  }
  function onCopyTrackId() {
    copy(String(state.trackId));
    editor.showMsg('success', t('image.copy-ok'));
  }
  function markAllTrueValue() {
    const trackId = state.trackId[0];
    const trackData = editor.trackManager.getTrackObject(trackId);
    const data = {
      ...trackData,
      resultStatus: Const.True_Value,
    } as IUserData;
    editor.cmdManager.execute('update-track', [{ trackId, data }]);
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
    updateVisible();
    nextTick(() => {
      container?.value?.scrollTo({ top: 0 });
    });
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
  // 折线/曲线/多边形/矩形锚点打标签
  function onAnchorClass() {
    if (!config.showClassView) return;

    if (currentObject?.length === 1) {
      const isAnchor = isEditAnchorClass(currentObject[0]);
      if (!state.isAnchor && !isAnchor) return;
      showObject(currentObject);
    } else {
      onClose();
    }
  }

  function onClose() {
    config.showClassView = false;
  }
  const getLimitInfo = (classType: IClassTypeItem) => {
    const limTool = [
      ToolType.BOUNDING_BOX,
      ToolType.POLYGON,
      ToolType.POLYGON_PLUS,
      ToolType.RECTANGLE,
      ToolType.MASK,
    ];
    if (!classType || !limTool.includes(classType.toolType)) return '';
    const {
      lengthLimit = [],
      widthLimit = [],
      areaLimit = [],
      ratioLimit = [],
    } = classType.getToolOptions();
    const unLimited = ['0', '∞'];
    const lengthLim = [lengthLimit[0] || unLimited[0], lengthLimit[1] || unLimited[1]];
    const widthLim = [widthLimit[0] || unLimited[0], widthLimit[1] || unLimited[1]];
    const areaLim = [areaLimit[0] || unLimited[0], areaLimit[1] || unLimited[1]];
    let infoStr = '';
    if (lengthLimit.length > 0) {
      infoStr += `${t('image.Width')}: ${lengthLim[0]}~${lengthLim[1]} `;
    }
    if (widthLimit.length > 0) {
      infoStr += `${t('image.Height')}: ${widthLim[0]}~${widthLim[1]} `;
    }
    if (areaLimit.length > 0) {
      infoStr += `${t('image.Area')}: ${areaLim[0]}~${areaLim[1]} `;
    }
    if (ratioLimit && ratioLimit.length > 0) {
      infoStr += `W/H: ${ratioLimit[0] || '0.01'}~${ratioLimit[1] || '1000'} `;
    }
    return infoStr;
  };
  function onHover(hover: boolean, event: MouseEvent, item: IClassTypeItem) {
    if (hover) {
      const target = event.target as HTMLDivElement;
      const { top, left } = target.getBoundingClientRect();
      const infoTop = top + 28;
      const infoLeft = left - 20;
      const title: any[] = [
        {
          value: editor.getLabel(item),
          style: {
            color: '#ffffff',
          },
        },
      ];
      const info = getLimitInfo(item);
      if (info) title.push(info);
      CustomTip.show(
        {
          title: title,
          content: item.attrs.map((e) => {
            return {
              text: `${editor.getLabel(e)}(${t(`common.${e.type}`)}): ${e.options
                .map((o) => `◆${editor.getLabel(o)}`)
                .join(' ')}`,
              required: e.required,
            };
          }),
          style: {
            top: infoTop + 'px',
            left: infoLeft + 'px',
          },
        },
        TempClassInfoTip,
      );
    } else {
      CustomTip.close();
    }
  }
  const showObject = debounce((object: AnnotateObject | AnnotateObject[]) => {
    state.isMultiple = Array.isArray(object) && object.length > 1;
    const objects: AnnotateObject[] = Array.isArray(object) ? object : [object];
    state.isAnchor = objects.length === 1 && isEditAnchorClass(objects[0]);
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
    const classConfig = editor.getClassType(userData.classId || '');
    state.pointsLimit = classConfig?.getToolOptions().polygonPoint || userData.pointsLimit || 0;

    state.classType = classConfig ? classConfig.name : '';
    state.classId = classConfig ? classConfig.id : '';
    state.toolType = classConfig?.toolType || userData.toolType || object.toolType;
    state.attrs = [];
    updateAttrInfo(object, state.classId);

    state.classList = editor.getClassList(state.toolType);
    if (state.toolType === ToolType.SKELETON) {
      state.isSkeleton = true;
      state.classList = classConfig ? [classConfig] : [];
    }
  }

  function onClassChange(classId: string) {
    const classConfig = editor.getClassType(classId);
    editor.trackManager.addChangedTrack(state.trackId);
    if (state.isAnchor) {
      // 锚点class变更
      const object = currentObject[0];
      const attrs = editor.getAttrsDefaultValue(classConfig, PropValueOrigin.default);
      const preClass = editor.getClassType(object.userData.classId);
      if (editor.isClassesRelated(preClass, classConfig)) {
        Object.assign(attrs, object.userData.attrs);
      }
      const data = getAnchorCmdData(classConfig, attrs);
      editor.cmdManager.execute('update-anchors-info', { object, data });
      updateData();
      editor.mainView.currentEditTool?.updateEditObject();
    } else {
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
        const attrs = editor.getAttrsDefaultValue(classConfig, PropValueOrigin.default);
        editor.cmdManager.execute('update-user-data', {
          objects,
          data: objects.map((o) => {
            let _attrs = attrs;
            const preClass = editor.getClassType(o.userData.classId);
            if (editor.isClassesRelated(preClass, classConfig)) {
              _attrs = Object.assign({}, attrs, o.userData.attrs || {});
            }
            return {
              classId: classId,
              classType: classConfig.name,
              attrs: _attrs,
            };
          }),
        });
        editor.updateObjectFitClass(objects, classConfig, true);
      });
      editor.state.currentClass = classConfig.id;
    }
    editor.mainView.draw();
  }

  async function handleClassChange(classId: string, item: IClassTypeItem) {
    if (!canEdit() || classId == state.classId) return;
    const newClassName = editor.getLabel(item);
    const preClass = editor.getClassType(state.classId);
    const hasAttrValue = state.attrs.some((e) => {
      return Array.isArray(e.value) ? e.value.length > 0 : !!e.value;
    });
    if (
      state.isAnchor ||
      !state.classId ||
      state.hideMsg ||
      !hasAttrValue ||
      editor.isClassesRelated(preClass, item)
    ) {
      return onClassChange(classId);
    }
    const _hideMsg = ref(false);
    const confirm = await editComponent.value.confirm(() =>
      createVNode('span', {}, [
        t('image.class_change_warn', { type: newClassName }),
        createVNode('br'),
        createVNode(
          Checkbox,
          {
            checked: _hideMsg.value,
            'onUpdate:checked': (value: any) => (_hideMsg.value = value),
          },
          { default: () => t('image.not_show_anymore') },
        ),
      ]),
    );
    if (confirm) {
      state.hideMsg = _hideMsg.value;
      onClassChange(classId);
    }
  }
  const debounceUpdateAttr = debounce(() => {
    // 防止修改属性触发自己重新更新
    editor.withEventSource(EVENT_SOURCE, () => {
      const attrs = JSON.parse(JSON.stringify(currentAttrs));
      if (state.isAnchor) {
        const object = currentObject[0];
        const classConfig = editor.getClassType(state.classId);
        const data = getAnchorCmdData(classConfig, attrs);
        editor.cmdManager.execute('update-anchors-info', { object, data });
      } else {
        editor.cmdManager.execute('update-user-data', {
          objects: currentObject,
          data: {
            attrs,
          },
        });
      }
    });
  }, 100);

  /** 更新单个 class 属性 */
  function onAttChange(name: string, value: any, item: IAttrItem) {
    const data = {
      id: item.id,
      name: item.name || '',
      pid: item.parent?.id,
      alias: item.alias,
      isLeaf: Boolean(item.parent),
      attributeVersion: item.attributeVersion,
      value: value,
    };
    currentAttrs[name] = data;
    debounceUpdateAttr();
  }

  /** 更新全部 class 信息 */
  function updateAttrInfo(object: AnnotateObject, classId: string) {
    const classConfig = editor.getClassType(classId);
    if (!classConfig) return;
    const attrs = state.isAnchor ? getAnchorAttrs(object) : getUserDataAttrs(object);
    const newAttrMap: Record<string, IAttrItem> = {};
    const newAttrs: any[] = classConfig.getAttrs().map((e: IAttrItem) => {
      const attrItem = e.clone();
      newAttrMap[attrItem.id] = attrItem;
      const field = e.id;
      const isArr = ClassUtils.isAttrValueTypeArr(e.type);
      const defaultValue = isArr ? [] : '';
      if (isArr && attrs[field] && !Array.isArray(attrs[field].value)) {
        attrs[field].value = [attrs[field].value];
      }
      const value = field in attrs ? attrs[field]?.value : defaultValue;
      attrItem.value = value;
      return attrItem;
    });
    newAttrs.forEach((e) => {
      if (e.parent && newAttrMap[e.parent.id]) {
        e.setParent(newAttrMap[e.parent.id]);
      }
    });
    state.attrs = newAttrs;
    currentAttrs = JSON.parse(JSON.stringify(attrs));
  }

  function getLimitBox() {
    if (!editClassView.value) return {};
    const parentRect =
      editClassView.value.parentElement?.getBoundingClientRect() ||
      document.body.getBoundingClientRect();
    return {
      maxW: parentRect.width - 40,
      maxH: parentRect.height * 0.99,
      minW: 360,
      minH: 120,
    };
  }
  // 保存到localStorage
  function onResizeEnd() {
    if (!editClassView.value) return;
    updateTime.value = Date.now() + '';
    const transRect = editClassView.value.getBoundingClientRect();
    const style = {
      bottom: '2px',
      right: '2px',
      width: transRect.width + 'px',
      height: transRect.height + 'px',
      updateTime: updateTime.value,
    };
    setStorageEditclass(JSON.stringify(style));
  }
  function onDragEnd() {}
</script>

<style lang="less">
  .skeleton-class {
    right: 244px !important;
  }

  .edit-class {
    position: absolute;
    padding: 4px;
    border-radius: 4px;
    z-index: 11;
    overflow-x: hidden;
    min-width: 360px;
    max-width: calc(100% - 40px);
    min-height: 120px;
    max-height: 99%;
    background: #1e1f22;

    &:hover {
      overflow-x: visible;
    }

    .bcom-class-operation-main .bcom-class-operation-wrap {
      padding: 0;
    }

    .edit-class-over {
      overflow-y: auto;
      width: 100%;
      height: 100%;
    }

    .ant-collapse > .ant-collapse-item {
      .ant-collapse-header,
      .ant-collapse-content > .ant-collapse-content-box {
        padding-top: 0;
        padding-left: 0;
      }
    }

    .edit-class-drag {
      position: absolute;
      top: 0;
      padding: 0 4px;
      width: 40px;

      .drag-icon {
        display: flex;
        border: 1px solid #926b6b;
        border-radius: 5px;
        justify-content: center;
        align-items: center;
        width: 32px;
        height: 32px;
        background-color: #393c45;
        font-size: 20px;
        cursor: move;
      }
    }

    .resize-drag {
      position: absolute;

      &:hover {
        border: 1px dashed #ffffff;
      }
    }

    .tool-icon {
      font-size: 18px;
    }

    .eyes-icon {
      padding-top: 2px;
    }

    .panel-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-left: 12px;
    }

    .advance-item {
      margin-bottom: 20px;
      padding-left: 16px;
      text-align: left;

      .item-content {
        display: flex;
        margin-top: 8px;
        font-size: 12px;
        flex-direction: row;
        line-height: 20px;
      }

      .item-info {
        margin-right: 14px;
        padding: 2px 10px;
        border-radius: 4px;
        width: max-content;
        background-color: #3e4047;
      }

      .copy-icon {
        margin-top: 2px;
        font-size: 16px;

        :hover {
          color: #2e8cf0;
        }
      }
    }

    .item-flex {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }

  .class-attr-preview {
    .ant-tooltip-inner {
      background: none;
      box-shadow: none;
    }

    .ant-tooltip-arrow {
      display: none;
    }
  }
</style>
