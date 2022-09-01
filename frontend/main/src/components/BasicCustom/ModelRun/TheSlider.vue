<template>
  <div class="flex items-center">
    <InputNumber
      :value="props.start"
      :min="min"
      :max="props.end"
      :step="step"
      :precision="precision"
      @change="handleStartChange"
    />
    <Slider
      :value="[props.start, props.end]"
      range
      :min="min"
      :max="max"
      :step="step"
      @change="handleSliderChange"
    />
    <InputNumber
      :value="props.end"
      :min="props.start"
      :max="max"
      :step="step"
      :precision="precision"
      @change="handleEndChange"
    />
  </div>
</template>
<script lang="ts" setup>
  // import { unref, computed } from 'vue';
  import { Slider, InputNumber } from 'ant-design-vue';

  // 固定值
  const min = 0;
  const max = 1;
  const step = 0.01;
  const precision = 2;

  const props = defineProps<{ start: number; end: number }>();
  const emits = defineEmits(['update:start', 'update:end']);

  const handleStartChange = (value) => {
    // 判断边界
    if (!value) value = props.start;
    else if (value < 0) value = 0;
    else if (value > props.end) value = props.end;

    emits('update:start', value);
  };
  const handleEndChange = (value) => {
    // 判断边界
    if (!value) value = props.end;
    else if (value > 1) value = 1;
    else if (value < props.start) value = props.start;

    emits('update:end', value);
  };
  const handleSliderChange = (value) => {
    emits('update:start', value[0]);
    emits('update:end', value[1]);
  };
</script>
<style lang="less" scoped>
  :deep(.ant-input-number) {
    width: 52px;
    height: 20px;
    line-height: 20px;
    min-width: auto;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;

    .ant-input-number-handler-wrap {
      display: none;
    }

    .ant-input-number-input-wrap {
      height: 20px;

      .ant-input-number-input {
        height: 20px;
      }
    }
  }

  :deep(.ant-slider) {
    width: 168px;
    margin: 0 20px;

    .ant-slider-track {
      background: linear-gradient(135deg, #57ccef 0%, #86e5c9 100%);
    }

    .ant-slider-handle {
      border-color: #57ccef;
      // border-image: linear-gradient(to right, #8f41e9, #578aef) 1;
    }
  }
</style>
