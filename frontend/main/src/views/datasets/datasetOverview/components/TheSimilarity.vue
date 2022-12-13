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
        <span v-if="!selectedBrush" className="select-label">Select data by</span>
        <div
          v-else
          class="flex items-center gap-4px text-primary cursor-pointer"
          @click="handleChangeBrush()"
        >
          <Icon icon="ion:arrow-back" />
          <span>Back</span>
        </div>
        <div class="brush_container">
          <div
            class="brush-item"
            :class="selectedBrush == brushEnum.PATH ? 'active' : ''"
            @click="handleChangeBrush(brushEnum.PATH)"
          >
            <SvgIcon
              :name="
                selectedBrush == brushEnum.PATH
                  ? 'dataset-overview-path-inactive'
                  : 'dataset-overview-path'
              "
              :size="24"
            />
          </div>
          <div
            class="brush-item"
            :class="selectedBrush == brushEnum.RECT ? 'active' : ''"
            @click="handleChangeBrush(brushEnum.RECT)"
          >
            <SvgIcon
              :name="
                selectedBrush == brushEnum.RECT
                  ? 'dataset-overview-rect-inactive'
                  : 'dataset-overview-rect'
              "
              :size="24"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="chartContainer">
      <div ref="plotRef" class="chartContainer__box" @mousewheel.prevent></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import axios from 'axios';
  import { onMounted, ref } from 'vue';
  import { Select } from 'ant-design-vue';
  import Icon, { SvgIcon } from '/@/components/Icon';
  import { useG2plot, PlotEnum } from '/@/hooks/web/useG2plot';
  import { defaultScatterOptions } from './data';
  import {
    getSimilarityClassificationApi,
    getSimilarityRecordApi,
  } from '/@/api/business/dataset/overview';
  import { getDatasetClassificationAllApi } from '/@/api/business/classes';
  import { brushEnum } from './typing';
  import { ISimilarityList } from '/@/api/business/dataset/model/overviewModel';
  import { datasetDetailApi } from '/@/api/business/dataset';
  import _ from 'lodash';

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
    console.log(selectClassificationId.value);
    getSimilarityClassification();
  };

  /** Classification */
  const getSimilarityClassification = async () => {
    if (selectClassificationId.value) {
      const params = {
        datasetId: props.datasetId as string,
        classificationId: '12' ?? String(selectClassificationId.value),
      };
      await getSimilarityClassificationApi(params);
    }
  };

  /** Brush */
  const selectedBrush = ref<brushEnum>();
  const handleChangeBrush = (value?) => {
    selectedBrush.value = value;
    console.log(selectedBrush.value);

    // const plot = chartRef.value;
    // if (plot) {
    //   plot.update({ brush: { type: value } });
    // }
  };

  /** List */
  const similarList = ref<Array<ISimilarityList>>([]);
  const getSimilarityRecord = async () => {
    const params = { datasetId: props.datasetId as string };
    const res = await getSimilarityRecordApi(params);
    const url = res?.resultUrl;
    if (url) {
      const response = await axios.get(url);
      similarList.value = response.data ?? [];
    }
  };

  /** DataInfo */
  const isLoading = ref<boolean>(false);
  const lastDataId = ref<number>();
  const imgSrc = ref<string>();
  const labelName = ref<string>();
  const getDataInfo = _.debounce(async (id) => {
    isLoading.value = true;
    const res: any = await datasetDetailApi({ id });
    imgSrc.value = res?.content?.[0]?.file?.url;
    labelName.value = res.name;
    isLoading.value = false;
    // chartRef.value.update({
    //   tooltip: {
    //     customContent: (_, items) => {
    //       console.log(_, items);
    //       if (!_) return;
    //       const data = items[0]?.data || {};
    //       const dataId = data?.id ?? undefined;
    //       if (dataId && dataId != lastDataId.value) {
    //         lastDataId.value = dataId;
    //         getDataInfo(dataId);
    //         return;
    //       }

    //       const headerDom = `<div class="custom-tooltip-container-header">
    //                             <div class="custom-tooltip-container-header-left">
    //                               <div>ID: ${dataId}</div>
    //                               <div class="label">Label: ${labelName.value}</div>
    //                               <div>Vector: ${data?.x?.toFixed(4)},${data?.y?.toFixed(4)}</div>
    //                             </div>
    //                             <div class="custom-tooltip-container-header-right">View data</div>
    //                           </div>`;
    //       const contentDom = `<div class="custom-tooltip-container-content">
    //                             <img src="${imgSrc.value}" />
    //                           </div>`;
    //       return `<div class="custom-tooltip-container" style="background-color:orange">
    //                 ${headerDom}
    //                 ${contentDom}
    //               </div>`;
    //     },
    //   },
    // });
  }, 1500);

  const chartRef = ref<any>();
  onMounted(async () => {
    await getClassificationList();
    await getSimilarityRecord();

    chartRef.value = setPlot(PlotEnum.SCATTER, plotRef.value, {
      data: similarList.value,
      ...defaultScatterOptions,

      tooltip: {
        enterable: true,
        // showDelay: 2000,
        showMarkers: false,
        domStyles: {
          'g2-tooltip': {
            width: '223px',
            padding: 0,
          },
        },
        customContent: (_, items) => {
          console.log(_, items);
          if (!_) return;
          const data = items[0]?.data || {};
          const dataId = data?.id ?? undefined;
          if (dataId && dataId != lastDataId.value) {
            lastDataId.value = dataId;
            getDataInfo(dataId);
          }

          const headerDom = `<div class="custom-tooltip-container-header">
                                <div class="custom-tooltip-container-header-left">
                                  <div>ID: ${dataId}</div>
                                  <div class="label">Label: ${labelName.value}</div>
                                  <div>Vector: ${data?.x?.toFixed(4)},${data?.y?.toFixed(4)}</div>
                                </div>
                                <div class="custom-tooltip-container-header-right">View data</div>
                              </div>`;
          const contentDom = `<div class="custom-tooltip-container-content">
                                <img src="${imgSrc.value}" />
                              </div>`;
          return `<div v-if="${isLoading.value}" class="custom-tooltip-container" style="background-color:orange">
                    ${headerDom}
                    ${contentDom}
                  </div>`;
        },
      },
    });
  });
</script>
<style lang="less" scoped>
  @import './index.less';
  .chartContainer__box {
    width: 90%;
  }
  .brush_container {
    display: flex;
    justify-content: space-between;
    width: 74px;
    border-radius: 300px;
    border: 2px solid #e6f0fe;
    .brush-item {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s;
      &.active {
        background-color: @primary-color;
      }
      &:nth-child(1) {
        border-right: none;
        border-radius: 300px 0 0 300px;
      }
      &:nth-child(2) {
        border-left: none;
        border-radius: 0 300px 300px 0;
      }
    }
  }
</style>
<style lang="less">
  .custom-tooltip-container {
    height: 205px;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border: 1px solid #dddddd;
    border-radius: 4px;
    overflow: hidden;
    &-header {
      flex: 1;
      width: 100%;
      display: flex;
      padding: 10px;
      &-left {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 12px;
        line-height: 14px;
        color: #ffffff;

        .label {
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      &-right {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: @primary-color;
        padding: 0 6px;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 20px;
        border-radius: 4px;
        font-size: 12px;
        color: #fff;
      }
    }
    &-content {
      width: 100%;
      height: 127px;
      padding: 4px;
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
