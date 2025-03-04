<template>
  <a-tooltip
    @visibleChange="onMergeVisibleChange"
    v-model:visible="iState.mergeTipVisible"
    placement="top"
    :trigger="btnDisable() ? '' : 'click'"
  >
    <template #title>
      <div class="frame-setting">
        <div class="title border-bottom">{{ t('image.merge') }}</div>
        <div class="wrap">
          <div class="title2">
            <a-radio-group
              :value="iState.action"
              style="margin-top: 5px; width: 100%; font-size: 12px"
            >
              <a-radio-button style="padding: 0; width: 50%; text-align: center" value="PreMergeTo">
                <span
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
                  @click.stop="() => onAction('PreMergeTo')"
                  >{{ t('image.mergeTo') }}</span
                >
              </a-radio-button>
              <a-radio-button
                style="padding: 0; width: 50%; text-align: center"
                value="PreMergeFrom"
              >
                <span
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
                  @click.stop="() => onAction('PreMergeFrom')"
                  >{{ t('image.mergeFrom') }}</span
                >
              </a-radio-button>
            </a-radio-group>
          </div>
        </div>
        <div class="wrap">
          <div class="title1"> {{ t('image.target') }}: </div>
          <div class="title2">
            <a-select
              show-search
              animation="no"
              :getPopupContainer="(node:HTMLElement) => node.parentNode"
              style="width: 100%"
              :options="iState.trackIds"
              @change="onChange"
              v-model:value="iState.trackId"
            >
            </a-select>
            <!-- <SubnodeOutlined
                            @click="onPick"
                            style="font-size: 20px; line-height: 32px; margin-left: 10px"
                        /> -->
          </div>
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
          <a-button @click="onOk" size="small" type="primary" :disabled="!canMerge">{{
            t('image.merge')
          }}</a-button>
        </div>
      </div>
    </template>
    <a-button :disabled="btnDisable()" @click="() => onBtnClick()" :title="t('image.merge')">
      <template #icon>
        <IconDownwardMerge />
      </template>
    </a-button>
  </a-tooltip>
</template>
<script lang="ts" setup>
  import { reactive, watch, computed } from 'vue';
  import { ITrackAction, IBottomState } from '../useBottom';
  import { useInjectEditor } from '../../../context';
  import { IUserData } from '../../../../image-editor';
  import { t } from '@/lang';

  interface IOption extends IUserData {
    value: string;
    label: string;
  }
  const editor = useInjectEditor();
  const iState = reactive<{
    action: ITrackAction;
    trackId: string;
    mergeTipVisible: boolean;
    trackIds: IOption[];
  }>({
    action: 'PreMergeFrom',
    trackId: '',
    trackIds: [],
    mergeTipVisible: false,
  });
  const props = defineProps<{
    state: IBottomState;
  }>();
  const emit = defineEmits(['action']);

  watch(
    () => iState.mergeTipVisible,
    (visible) => {
      visible && updateTrackIds();
    },
  );

  function onClose() {
    iState.mergeTipVisible = false;
  }
  function updateTrackIds() {
    let infos = [...editor.trackManager.getTrackMap().values()];
    infos = infos.filter((e) => e.trackId != editor.state.currentTrack);
    iState.trackIds = infos.map((item) => {
      const trackLabel = item.trackName
        ? `#${item.trackName} (${item.trackId})`
        : `(${item.trackId})`;
      return {
        ...item,
        label: trackLabel,
        // value: item.trackId || '',
        value: trackLabel,
      };
    });
  }

  function btnDisable() {
    return editor.state.config.showClassView && !!props.state.trackAction;
  }
  function onMergeVisibleChange(visible: boolean) {
    if (visible) {
      if (!props.state.trackTargetLine.trackId) {
        editor.showMsg('warning', t('image.warnNoObject'));
        onCancel();
      } else {
        update();
      }
    } else {
      onCancel();
    }
  }

  function onBtnClick() {
    editor.state.config.showClassView = false;
    onMergeVisibleChange(true);
  }

  function onAction(type: ITrackAction) {
    switch (type) {
      case 'PreMergeFrom':
      case 'PreMergeTo':
        iState.action = type;
        const trackId = props.state.trackMergeResult.trackId;
        if (!trackId) return;
        break;
      default:
        break;
    }
    emit('action', type);
  }

  watch(
    () => [props.state.trackMergeResult.trackId, props.state.trackMergeResult.trackName],
    () => {
      const { trackId } = props.state.trackMergeResult;
      if (!trackId) {
        iState.trackId = '';
        iState.mergeTipVisible = false;
      }
    },
  );

  function onOk() {
    switch (iState.action) {
      case 'PreMergeFrom':
        onAction('MergeFrom');
        break;
      case 'PreMergeTo':
        onAction('MergeTo');
        break;
      default:
        break;
    }
  }
  function onCancel() {
    onAction('Cancel');
    onClose();
  }
  const canMerge = computed(() => {
    return (
      ['PreMergeTo', 'PreMergeFrom', 'MergeFrom', 'MergeTo'].indexOf(props.state.trackAction) >=
        0 && props.state.trackList.length === 1
    );
  });
  function update() {
    onAction(iState.action);
  }
  function onChange(_: any, item: any) {
    Object.assign(props.state.trackMergeResult, {
      trackName: item.trackName,
      trackId: item.trackId,
    });
    update();
  }
</script>
