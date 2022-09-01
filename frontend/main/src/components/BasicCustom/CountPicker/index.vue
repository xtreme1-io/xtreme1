<template>
  <div :class="`${prefixCls}`">
    <div class="wrapper"
      ><div class="box mr-1">
        <Input
          autocomplete="off"
          style="text-align: center"
          :value="start"
          @change="handleStartChange"
          :bordered="false"
        />
        <div>from</div>
      </div>
      <div class="box">
        <Input
          autocomplete="off"
          style="text-align: center"
          :value="end"
          @change="handleEndChange"
          :bordered="false"
        />
        <div>to</div>
      </div>
    </div>

    <div>
      <Slider
        :value="[start as number, end as number]"
        range
        @change="handleSliderChange"
        :max="max"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { defineProps, defineEmits } from 'vue';
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { Input, Slider } from 'ant-design-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  const { prefixCls } = useDesign('countPicker');
  const emits = defineEmits(['update:start', 'update:end']);
  // const { t } = useI18n();
  defineProps<{
    start: number | undefined;
    end: number | undefined;
    max: number | undefined;
  }>();
  const handleStartChange = (e) => {
    emits('update:start', e.target.value);
  };
  const handleEndChange = (e) => {
    emits('update:end', e.target.value);
  };

  const handleSliderChange = (value) => {
    emits('update:start', value[0]);
    emits('update:end', value[1]);
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-countPicker';
  .@{prefix-cls} {
    color: #333;

    .wrapper {
      display: flex;

      .box {
        display: inline-block;
        width: 90px;
        text-align: center;
      }
    }
  }
</style>
