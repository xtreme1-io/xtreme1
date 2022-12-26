<template>
  <div class="progress">
    <div class="left">
      <div class="box">
        <div class="icon">
          <SvgIcon name="dataset-overview-data" :size="22" />
        </div>
        <div class="data">
          <div class="num">{{ totalData }}</div>
          <div class="tip">Total Data</div>
        </div>
      </div>
      <div class="box">
        <div class="icon">
          <SvgIcon name="dataset-overview-annotation" :size="22" style="color: #fff" />
        </div>
        <div class="data">
          <div class="num">{{ totalAnnotations }}</div>
          <div class="tip">Total Annotations</div>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="chart_wrapper">
        <div class="title">Progress</div>
        <div class="chartContainer">
          <div ref="plotRef" class="chartContainer__box"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { SvgIcon } from '/@/components/Icon';
  import { useG2plot, PlotEnum } from '/@/hooks/web/useG2plot';
  import { defaultPieOptions } from './data';
  import { getDataStatusApi } from '/@/api/business/dataset/overview';
  import { IDataStatus } from '/@/api/business/dataset/model/overviewModel';
  import { IPieData, pieDataEnum } from './typing';

  const props = defineProps<{ datasetId: number }>();

  const { setPlot } = useG2plot();
  const plotRef = ref<HTMLElement | null>(null);
  const pieData = ref<Array<IPieData>>([]);
  const totalCount = ref<number>(0);

  const totalData = ref<number>(0);
  const totalAnnotations = ref<number>(0);
  const getDataStatus = async () => {
    const params = { datasetId: props.datasetId };
    const res: IDataStatus = await getDataStatusApi(params);
    const { annotatedCount, notAnnotatedCount, invalidCount, objectCount, itemCount } = res;

    totalData.value = itemCount;
    totalAnnotations.value = objectCount;

    totalCount.value = annotatedCount + notAnnotatedCount + invalidCount;
    const annotatedData = { type: pieDataEnum.ANNOTATED, count: annotatedCount };
    const notAnnotatedData = { type: pieDataEnum.NOT_ANNOTATED, count: notAnnotatedCount };
    const invalidData = { type: pieDataEnum.INVALID, count: invalidCount };
    pieData.value = [annotatedData, notAnnotatedData, invalidData];
  };

  onMounted(async () => {
    await getDataStatus();

    setPlot(PlotEnum.PIE, plotRef.value, {
      data: pieData.value,
      ...defaultPieOptions,
      tooltip: {
        position: 'bottom',
        shared: false,
        title: 'Progress',
        formatter: (data) => {
          console.log(data);
          return {
            name: data.type,
            value: ((data.count / totalCount.value) * 100).toFixed(2) + '%',
          };
        },
      },
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
          display: flex;
          justify-content: center;
          align-items: center;
          width: 40px;
          height: 40px;
          background-color: @primary-color;
          border-radius: 6px;
        }
        .data {
          display: flex;
          flex-direction: column;
          gap: 6px;
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
