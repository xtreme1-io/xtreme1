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
<style>
  .custom-tooltip-title {
    margin: 0px 12px;
    padding: 72px 0 8px;
    font-size: 12px;
    border-bottom-style: solid;
    border-bottom-width: thin;
    border-bottom-color: #e9e9e9;
  }

  .custom-tooltip-value {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin: 8px 12px 0 12px;
    padding-bottom: 8px;
    font-size: 40px;
    text-align: center;
    border-bottom-style: solid;
    border-bottom-width: thin;
    border-bottom-color: #e9e9e9;
    height: 70px;
  }

  .custom-tooltip-temp {
    display: flex;
    position: relative;
    align-items: center;
  }

  .custom-tooltip-temp span:first-child {
    font-size: 12px;
    position: absolute;
    top: 0px;
    color: rgba(0, 0, 0, 0.45);
  }

  .custom-tooltip-temp span:last-child {
    font-size: 12px;
    text-align: left;
    margin-top: 10px;
    position: relative;
    color: rgba(0, 0, 0, 0.85);
  }

  .custom-tooltip-wind {
    margin: 8px 12px 12px 12px;
    font-size: 10px;
    color: rgba(0, 0, 0, 0.45);
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .tooltip-footer {
    margin: 8px 12px 12px 12px;
    font-size: 10px;
    color: rgba(0, 0, 0, 0.45);
  }

  .background-image {
    background-repeat: no-repeat;
  }
</style>
