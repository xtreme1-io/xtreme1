<template>
  <a-tooltip
    trigger="click"
    placement="right"
    v-model:visible="iState.visible"
    @visibleChange="onVisibleChange"
  >
    <div
      class="tool-trigger"
      :style="{
        color: iState.visible ? 'rgb(23, 125, 220)' : '',
      }"
    >
      <IconHorizontalMore style="font-size: 14px; border-top: 1px solid #4e4e4e" />
    </div>
    <template #title>
      <div class="polygon-tooltip">
        <div class="tooltip-setting">
          <div class="setting-switch">
            <label>{{ t('image.Shared Edge') }}</label>
            <a-switch v-model:checked="toolConfig.pgs" size="small" @change="onShare" />
          </div>
          <a-radio-group v-model:value="toolConfig.pgsm" v-show="toolConfig.pgs" @change="onShare">
            <a-radio :value="ShareDrawMode.edge">{{ t('image.By Edges') }}</a-radio>
            <a-radio :value="ShareDrawMode.point">{{ t('image.By Points') }}</a-radio>
          </a-radio-group>
        </div>
        <div
          v-for="pointNum in iState.typeList"
          :key="pointNum"
          :class="['tooltip-item', { active: pointNum === state.config.polygonMaxPoint }]"
          @click="onSelectPolygonClass(pointNum)"
        >
          <span>
            <ToolIcon :tool="ToolType.POLYGON" />
            <label v-if="pointNum > 0"> {{ pointNum }} </label>
          </span>
        </div>
      </div>
    </template>
  </a-tooltip>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { IconHorizontalMore } from '@basicai/icons';
  import { useInjectEditor } from '../../../context';
  import {
    ToolType,
    ToolIcon,
    ToolName,
    ShareDrawMode,
    IClassTypeItem,
  } from '../../../../image-editor';
  import { t } from '@/lang';

  const emit = defineEmits(['callbackOntool']);

  const editor = useInjectEditor();
  const { state } = editor;
  const { toolConfig } = state;

  const iState = reactive({
    visible: false,
    typeList: [] as number[],
  });
  const onVisibleChange = (val: boolean) => {
    if (val && iState.typeList.length === 0) {
      const classArr = editor.getClassList(ToolType.POLYGON);
      const list: number[] = [0];
      classArr.forEach((classType: IClassTypeItem) => {
        const congifNum = classType.getToolOptions().polygonPoint || 0;
        if (!list.includes(congifNum)) list.push(congifNum);
      });
      iState.typeList = list;
    }
  };
  function onShare() {
    editor.mainView.intoSharedMode();
  }
  const onSelectPolygonClass = (num: number) => {
    state.config.polygonMaxPoint = num;
    if (editor.state.activeTool === ToolName.polygon) onShare();
    emit('callbackOntool', ToolName.polygon);
  };
</script>

<style lang="less" scoped>
  .polygon-tooltip {
    display: flex;
    flex-direction: column;
  }

  .tooltip-setting {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 6px;
    padding-bottom: 10px;
    border-bottom: 1px solid #57575c;
    font-size: 12px;

    .setting-switch {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      line-height: 22px;
    }

    .ant-radio-group {
      display: flex;
      flex-direction: column;

      .ant-radio-wrapper {
        font-size: 12px;
      }
    }
  }

  .tooltip-item {
    padding: 3px 0;
    cursor: pointer;

    &:hover {
      color: @primary-color;
    }

    &.active {
      color: @primary-color;
    }
  }
</style>
