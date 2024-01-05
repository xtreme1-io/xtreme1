<template>
  <div class="flow-index">
    <Tooltip placement="bottom" trigger="hover">
      <template #title> {{ editor.lang('Page Up') }} </template>
      <i
        :class="['iconfont icon-toleft action-icon', { disabled: flowIndex <= 1 }]"
        @click="handleSwitch(-1)"
      />
    </Tooltip>
    <span class="flow-index-input">
      <InputNumber
        style="width: 54px; font-size: 16px"
        v-model:value="flowIndex"
        :precision="0"
        @blur="() => inputIndex()"
        @pressEnter="() => inputIndex()"
        autocomplete="off"
        :min="1"
        :max="props.info.total"
        size="small"
      />
      <span> / {{ props.info.total }}</span>
    </span>
    <Tooltip placement="bottom" trigger="hover">
      <template #title> {{ editor.lang('Page Down') }} </template>
      <i
        :class="['iconfont icon-toright action-icon', { disabled: flowIndex >= props.info.total }]"
        @click="handleSwitch(1)"
      />
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { Tooltip, InputNumber } from 'ant-design-vue';
  import { IFlowIndex } from '../type';
  import { useInjectBSEditor } from '../../../context';

  interface IFlowIndexState {
    info: IFlowIndex;
  }
  const editor = useInjectBSEditor();

  const props = defineProps<IFlowIndexState>();
  const emits = defineEmits(['onFlowindex']);
  const flowIndex = ref(props.info.currentIndex + 1);

  function handleSwitch(step: number) {
    const index = flowIndex.value + step;
    if (index < 1 || index > props.info.total) return;
    emits('onFlowindex', { index: index - 1 });
  }
  function inputIndex() {
    if (!flowIndex.value) flowIndex.value = props.info.currentIndex + 1;
    handleSwitch(0);
  }
  watch(
    () => props.info.currentIndex,
    () => {
      if (flowIndex.value !== props.info.currentIndex + 1)
        flowIndex.value = props.info.currentIndex + 1;
    },
    { immediate: true },
  );
</script>

<style lang="less" scoped>
  .flow-index {
    font-size: 16px;
  }
  .flow-index-input {
    padding: 0 8px;
  }
</style>
