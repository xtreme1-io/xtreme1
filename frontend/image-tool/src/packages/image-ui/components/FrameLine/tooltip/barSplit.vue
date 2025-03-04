<template>
  <a-tooltip
    @visibleChange="onSplitVisibleChange"
    v-model:visible="iState.splitTipVisible"
    placement="top"
    :trigger="btnDisable() ? '' : 'click'"
  >
    <template #title>
      <div class="frame-setting">
        <div class="title border-bottom">{{ t('image.split') }}</div>
        <div class="wrap">
          <div class="title1">
            <span>{{ t('image.newTrackObject') }}:</span></div
          >
          <div class="title2">
            <a-input :disabled="true" :value="state.trackSplitTrackId"></a-input>
          </div>
        </div>
        <div class="wrap">
          <div class="title1">
            <span>{{ t('image.class') }}:</span>
          </div>
          <a-select
            :getPopupContainer="(node:HTMLElement) => node.parentNode"
            v-model:value="state.trackSplitClass"
            :options="iState.classList"
            class="split-select"
          >
          </a-select>
        </div>
        <div style="text-align: right" class="wrap">
          <a-button
            style="margin-right: 10px"
            ghost
            @click="onCancel"
            size="small"
            type="primary"
            >{{ t('image.btnCancelText') }}</a-button
          >
          <a-button @click="toSplit()" size="small" type="primary" :disabled="!canSplit">{{
            t('image.split')
          }}</a-button>
        </div>
      </div>
    </template>
    <a-button :disabled="btnDisable()" @click="() => onBtnClick()" :title="t('image.split')">
      <template #icon>
        <ScissorOutlined />
      </template>
    </a-button>
  </a-tooltip>
</template>
<script lang="ts" setup>
  import { reactive, computed, onMounted, onBeforeUnmount } from 'vue';
  import { ITrackAction, IBottomState } from '../useBottom';
  import { useInjectEditor } from '../../../context';
  import { IClassType, IClassTypeItem, ToolType } from '../../../../image-editor';
  import { ScissorOutlined } from '@ant-design/icons-vue';
  import { t } from '@/lang';

  interface IClassSelect extends IClassType {
    label: string;
    value: string;
  }

  const editor = useInjectEditor();
  const props = defineProps<{
    state: IBottomState;
  }>();
  const emit = defineEmits(['action']);
  // const container = ref<HTMLElement | undefined>();
  const iState = reactive<{
    splitTipVisible: boolean;
    classList: IClassSelect[];
  }>({
    splitTipVisible: false,
    classList: [],
  });
  onMounted(() => {
    // editor.addEventListener(Event.CLEAR_MERGE_SPLIT, onClose);
  });
  onBeforeUnmount(() => {
    // editor.removeEventListener(Event.CLEAR_MERGE_SPLIT, onClose);
  });
  function onClose() {
    iState.splitTipVisible = false;
  }
  async function toSplit() {
    await onAction('Split');
    onClose();
  }
  async function onAction(type: ITrackAction) {
    await emit('action', type);
  }
  function btnDisable() {
    return editor.state.config.showClassView && !!props.state.trackAction;
  }
  const canSplit = computed(() => {
    const actions = ['Split', 'PreSplit'];
    return (
      actions.includes(props.state.trackAction) &&
      props.state.trackList.length === 2 &&
      props.state.trackSplitClass
    );
  });
  function onCancel() {
    onAction('Cancel');
    onClose();
  }
  function onSplitVisibleChange(visible: boolean) {
    if (visible) {
      if (!props.state.trackTargetLine.trackId) {
        editor.showMsg('warning', t('image.warnNoObject'));
        iState.splitTipVisible = false;
      } else {
        iState.classList = getSplitClasses();
        onAction('PreSplit');
      }
    } else {
      onCancel();
    }
  }
  function getSplitClasses(): IClassSelect[] {
    const obj = editor.selection[0];
    const classType = editor.getClassType(obj.userData.classId);
    if (!classType) return [];
    const type = classType.toolType;
    if (type === ToolType.SKELETON)
      return [{ ...classType, value: classType.id, label: classType.name }];
    let classList = editor.getClassList(classType.toolType);
    const polygonPoint = classType.getToolOptions().polygonPoint || 0;
    if (type === ToolType.POLYGON || type === ToolType.POLYGON_PLUS) {
      classList = classList.filter(
        (e: IClassTypeItem) => (e.getToolOptions().polygonPoint || 0) === polygonPoint,
      );
    }
    const list = classList.map((e) => {
      return { ...e, value: e.id, label: editor.showNameOrAlias(e, true) };
    });
    return list;
  }
  function onBtnClick() {
    editor.state.config.showClassView = false;
  }
</script>
<style lang="less">
  .frame-setting {
    .class-label {
      display: inline-block;
      width: 200px;
    }

    .label {
      display: inline-block;
      padding-right: 10px;
      height: 32px;
      line-height: 32px;
    }

    .recent-title {
      color: #878787;
      font-weight: bold;
    }

    .recent-item {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .recent-item:hover {
      background: rgb(255 255 255 / 8%);
    }

    .class-info {
      margin-top: 4px;
      padding: 2px;
      width: 250px;
      background: #3e3e3e;
      font-size: 12px;
      color: #b5b5b5;
      word-wrap: break-word;
    }
  }

  .split-select {
    width: 100%;
  }
</style>
