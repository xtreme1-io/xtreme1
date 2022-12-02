<template>
  <div class="progress">
    <div class="left">
      <div class="box">
        <div class="icon"></div>
        <div class="data">
          <div class="num">1,234,567</div>
          <div class="tip">Total Data</div>
        </div>
      </div>
      <div class="box">
        <div class="icon"></div>
        <div class="data">
          <div class="num">456789</div>
          <div class="tip">Total Annotations</div>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="chart_wrapper">
        <div class="title">Progress</div>
        <div class="chartContainer">
          <div ref="plotRef" class="chartContainer__box" @mousewheel.prevent></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { useG2plot, PlotEnum } from '/@/hooks/web/useG2plot';
  import { defaultPieOptions, pieData } from './data';

  const { setPlot } = useG2plot();
  const plotRef = ref<HTMLElement | null>(null);

  onMounted(async () => {
    setPlot(PlotEnum.PIE, plotRef.value, {
      data: pieData,
      ...defaultPieOptions,
    });
  });
</script>
<style lang="less" scoped>
  @import './index.less';
  .progress {
    width: 100%;
    height: 240px;
    display: flex;
    gap: 20px;
    .left {
      width: 50%;
      display: flex;
      flex-direction: column;
      gap: 20px;
      .box {
        height: 110px;
        display: flex;
        align-items: center;
        gap: 20px;
        background-color: #ffffff;
        border-radius: 12px;
        padding: 20px;
        .icon {
          width: 40px;
          height: 40px;
          background-color: @primary-color;
          border-radius: 6px;
        }
        .data {
          .num {
            font-weight: 400;
            font-size: 24px;
            line-height: 28px;
            color: #333333;
          }
          .tip {
            font-weight: 500;
            font-size: 14px;
            line-height: 16px;
            color: #aaaaaa;
          }
        }
      }
    }
    .right {
      width: 50%;
      background-color: #ffffff;
      border-radius: 12px;
      .chartContainer__box {
        width: 450px;
      }
    }
  }
</style>
