<template>
  <div class="chart_wrapper">
    <div class="title">Data Similarity Map</div>
    <div class="flex justify-between">
      <div class="flex gap-4px items-center">
        <span className="select-label">Display By</span>
        <Select
          style="width: 200px"
          :value="selectClassificationId"
          @change="handleChangeClassification"
        >
          <Select.Option v-for="item in classificationList" :key="item.id">
            {{ item.name }}
          </Select.Option>
        </Select>
      </div>
      <div class="flex gap-4px items-center">
        <span className="select-label">Select data by</span>
        <Radio.Group :value="selectedBrush" @change="handleChangeBrush">
          <Radio.Button :value="brushEnum.PATH">
            <div class="flex item-center"><SvgIcon name="dataset-overview-path" :size="24" /></div>
          </Radio.Button>
          <Radio.Button :value="brushEnum.RECT">
            <div class="flex item-center"><SvgIcon name="dataset-overview-rect" :size="24" /></div>
          </Radio.Button>
        </Radio.Group>
      </div>
    </div>
    <div class="chartContainer">
      <div ref="plotRef" class="chartContainer__box" @mousewheel.prevent></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { Select, Radio } from 'ant-design-vue';
  import { SvgIcon } from '/@/components/Icon';
  import { useG2plot, PlotEnum } from '/@/hooks/web/useG2plot';
  import { defaultScatterOptions } from './data';
  import { arr } from './scatter';
  import { getSimilarityRecordApi } from '/@/api/business/dataset/overview';
  import { getDatasetClassificationAllApi } from '/@/api/business/classes';
  import { brushEnum } from './typing';

  const props = defineProps<{ datasetId: number | string }>();

  const { setPlot } = useG2plot();
  const plotRef = ref<HTMLElement | null>(null);

  /** Classification List */
  const selectClassificationId = ref<number>();
  const classificationList = ref<any[]>([]);
  const getClassificationList = async () => {
    const params = { datasetId: props.datasetId as string };
    const res = await getDatasetClassificationAllApi(params);
    classificationList.value = [...res];
  };
  const handleChangeClassification = (value) => {
    selectClassificationId.value = value;
  };

  /** Brush */
  const selectedBrush = ref<brushEnum>();
  const handleChangeBrush = ({ target }) => {
    selectedBrush.value = target.value;
    console.log(selectedBrush.value);

    // const plot = chartRef.value;
    // if (plot) {
    //   plot.update({ brush: { type: value } });
    // }
  };

  const getSimilarityRecord = async () => {
    const params = { datasetId: props.datasetId as string };
    const res = await getSimilarityRecordApi(params);
    console.log(res);
  };

  const chartRef = ref<any>();
  onMounted(async () => {
    await getClassificationList();
    await getSimilarityRecord();

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
  :deep(.ant-radio-group) {
    border-radius: 300px;
    border: 2px solid #e6f0fe;
    .ant-radio-button-wrapper {
      border: none;
      &:nth-child(1) {
        border-right: none;
        border-radius: 300px 0 0 300px;
      }
      &:nth-child(2) {
        border-left: none;
        border-radius: 0 300px 300px 0;
      }
      &::before {
        display: none;
      }
      span {
        &:nth-child(2) {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
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
