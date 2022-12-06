<template>
  <div class="chart_wrapper">
    <div class="title">Data Similarity Map</div>
    <div>
      <div>
        <span className="select-label">Brush Type</span>
        <Select v-model:value="brush" @change="handleChange" :options="brushOptions" />
      </div>
    </div>
    <div class="chartContainer">
      <div ref="plotRef" class="chartContainer__box" @mousewheel.prevent></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { Select } from 'ant-design-vue';
  import { useG2plot, PlotEnum } from '/@/hooks/web/useG2plot';
  import { defaultScatterOptions } from './data';
  import { arr } from './scatter';

  const { setPlot } = useG2plot();
  const plotRef = ref<HTMLElement | null>(null);

  const brushOptions = [
    {
      value: 'rect',
      label: 'rect',
    },
    {
      value: 'path',
      label: 'path',
    },
  ];
  const brush = ref<string>('rect');
  const handleChange = (v) => {
    console.log(v);
    const plot = chartRef.value;
    console.log(plot);
    if (plot) {
      plot.update({ brush: { type: v } });
    }
  };

  const chartRef = ref<any>();
  onMounted(async () => {
    console.log(arr.length);

    chartRef.value = setPlot(PlotEnum.SCATTER, plotRef.value, {
      data: arr,
      ...defaultScatterOptions,
    });
  });
</script>
<style lang="less" scoped>
  @import './index.less';
  .chartContainer__box {
    width: 90%;
  }
</style>
