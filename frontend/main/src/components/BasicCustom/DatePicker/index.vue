<template>
  <div :class="`${prefixCls}`">
    <div class="box mr-1">
      <DatePicker
        style="width: 91px; font-size: 12px"
        :value="start"
        @change="handleStartChange"
        :allowClear="false"
      >
        <template #suffixIcon>
          <div></div>
        </template>
      </DatePicker>
      <div>from</div>
    </div>
    <div class="box">
      <DatePicker
        style="width: 91px; font-size: 12px"
        :value="end"
        @change="handleEndChange"
        :allowClear="false"
      >
        <template #suffixIcon>
          <div></div>
        </template>
      </DatePicker>
      <div>to</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { defineProps, defineEmits } from 'vue';
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { DatePicker } from 'ant-design-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  const { prefixCls } = useDesign('date-picker');

  // const { t } = useI18n();
  defineProps<{
    start: any;
    end: any;
  }>();
  const emits = defineEmits(['update:start', 'update:end']);

  const handleStartChange = (d) => {
    emits('update:start', d);
  };
  const handleEndChange = (d) => {
    emits('update:end', d);
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-date-picker';
  .@{prefix-cls} {
    color: #333;
    display: flex;
    margin-top: 6px;

    .box {
      text-align: center;
    }
  }
</style>
