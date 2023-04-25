<template>
  <div class="chart_wrapper" v-loading="isLoading">
    <div class="title flex items-center gap-8px">
      Data Similarity Map
      <div v-if="isCalculating" class="flex items-center gap-6px">
        <Spin :indicator="indicator" />
        <span style="font-size: 14px; color: #000">Calculating</span>
        <Tooltip placement="top" :overlayStyle="{ width: '237px' }">
          <template #title>
            <span>
              Calculating your dataset similarity, current chart may be inconsistent with final
              result
            </span>
          </template>
          <InfoCircleOutlined style="color: #ccc; font-size: 15px" />
        </Tooltip>
      </div>
    </div>
    <ChartEmpty v-if="!hasData" class="py-80px" />
    <template v-else>
      <div class="flex justify-between mb-20px" style="padding-right: 16.5%">
        <div class="flex gap-4px items-center">
          <span className="select-label">Display By</span>
          <Select
            style="width: 200px"
            :value="selectClassificationId"
            @change="handleChangeClassification"
            allowClear
          >
            <Select.Option v-for="item in classificationList" :key="item.id">
              {{ item.name }}
            </Select.Option>
          </Select>
        </div>
        <div>
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
            <div @click="handleChangeBrush('fliter')">
              <Icon
                :style="selectedBrush !== 'fliter' ? '' : ' background-color: #60a9fe; color: #fff'"
                size="22"
                class="zoom"
                icon="ant-design:zoom-in-outlined"
            /></div>
          </div>
          <div>
            <span style="font-size: 14px"> Selected {{ selectedData.length }} data </span> &nbsp;
            <Button
              style="border-radius: 8px"
              @click="showSelectedData"
              v-if="selectedData.length"
              type="default"
              >View data</Button
            >
          </div>
        </div>
      </div>
      <div class="chartContainer">
        <div class="container"> <div ref="plotRef" class="chartContainer__box"></div> </div>
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
  import axios from 'axios';
  import { computed, onMounted, ref, h, watch } from 'vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { RouteChildEnum, RouteEnum } from '/@/enums/routeEnum';
  import { setDatasetBreadcrumb } from '/@/utils/business';
  import { Select, Spin, Tooltip, Button } from 'ant-design-vue';
  import { LoadingOutlined, InfoCircleOutline } from '@ant-design/icons-vue';
  import Icon, { SvgIcon } from '/@/components/Icon';
  import ChartEmpty from './ChartEmpty.vue';
  import emptyImg from '/@/assets/images/ontology/overview-empty-img.svg';
  import { useG2plot, PlotEnum } from '/@/hooks/web/useG2plot';
  import { defaultScatterOptions } from './data';
  import {
    getSimilarityClassificationApi,
    getSimilarityRecordApi,
  } from '/@/api/business/dataset/overview';
  import { getDatasetClassificationAllApi } from '/@/api/business/classes';
  import { brushEnum, optionEnum } from './typing';
  import { ISimilarityList } from '/@/api/business/dataset/model/overviewModel';
  import { datasetDetailApi } from '/@/api/business/dataset';
  import { datasetTypeEnum } from '/@/api/business/model/datasetModel';
  import _ from 'lodash';
  import { Column, G2 } from '@antv/g2plot';
  import { parseParam } from '/@/utils/business/parseParams';
  import { useRouter } from 'vue-router';
  const go = useGo();
  const props = defineProps<{ datasetId: number | string }>();

  const { setPlot } = useG2plot();
  const plotRef = ref<HTMLElement | null>(null);

  const indicator = h(LoadingOutlined, {
    style: {
      fontSize: '18px',
    },
    spin: true,
  });

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

  /** Similarity Classification */
  const similarList = ref<ISimilarityList[]>([]);
  const getSimilarityClassification = async () => {
    if (selectClassificationId.value) {
      const params = {
        datasetId: props.datasetId as string,
        classificationId: String(selectClassificationId.value),
      };
      const res = await getSimilarityClassificationApi(params);
      similarList.value = (res?.dataSimilarityList ?? []).map((item: any) => {
        item.key = item.attributeId + ':' + item.optionName;
        return item;
      });
    } else {
      similarList.value = [];
    }
    updateScatterList();
    chartRef.value.update({ data: scatterList.value });
  };
  const updateScatterList = () => {
    const optionMap = {} as Record<number, ISimilarityList[]>;
    similarList.value.forEach((item) => {
      if (optionMap[item.id]) {
        optionMap[item.id].push(item);
      } else {
        optionMap[item.id] = [];
        optionMap[item.id].push(item);
      }
    });

    scatterList.value = scatterList.value.map((item: any) => {
      const option = optionMap[item.id];
      if (Array.isArray(option)) {
        item.option = option.length > 1 ? optionEnum.MULTIPLE_OPTIONS : option[0].optionName;
      } else {
        item.option = optionEnum.NO_OPTIONS;
      }
      return item;
    });
    console.log(scatterList.value);
  };

  /** Brush */
  const selectedBrush = ref<brushEnum | 'fliter'>();
  const handleChangeBrush = (value?) => {
    selectedBrush.value = value;
    const plot = chartRef.value;
    if (plot && !!value) {
      if (value == 'fliter') {
        plot.update({
          brush: {
            enabled: true,
            action: 'filter',
            type: brushEnum.RECT,
          },
        });
      } else {
        plot.update({ brush: { action: 'highlight', enabled: true, type: value } });
      }
    } else {
      plot.update({ brush: { action: 'highlight', enabled: false } });
    }
  };
  let showG2Tooltip = computed(() => (selectedBrush.value ? 'none' : 'block'));

  /** List */
  const isLoading = ref<boolean>(false);
  const isCalculating = ref<boolean>(false);
  const scatterList = ref<any[]>([]);
  const hasData = computed(() => {
    return scatterList.value.length > 0;
  });
  const getSimilarityRecord = async () => {
    isLoading.value = true;
    try {
      const params = { datasetId: props.datasetId as string };
      const res = await getSimilarityRecordApi(params);
      isCalculating.value = res ? res?.isHistoryData : true;
      const url = res?.resultUrl;
      if (url) {
        const response = await axios.get(url);
        scatterList.value = (response.data ?? []).map((item) => {
          item.option = optionEnum.NO_OPTIONS;
          return item;
        });
      }
    } catch (error) {}
    isLoading.value = false;
  };

  /** DataInfo */
  const lastDataId = ref<number>();
  const imgSrc = ref<string>(emptyImg);
  const labelName = ref<string>('');
  const getDataInfo = _.debounce(async (id) => {
    lastDataId.value = id;
    const maskDom: any = document.querySelector('#tooltipMask');
    if (maskDom) {
      maskDom.style.display = 'flex';
    }

    try {
      const res: any = await datasetDetailApi({ id });
      console.log(1111);
      imgSrc.value = res?.content?.[0]?.file?.largeThumbnail?.url ?? res?.content?.[0]?.file?.url;
      labelName.value = res.name;
      getToolTipDom(id);
    } catch (error) {
      getToolTipDom(id);
    }
  });

  const getToolTipDom = (id) => {
    const labelDom = document.querySelector('#tooltipLabel');
    if (labelDom) {
      labelDom.innerHTML = labelName.value as string;
    }

    const imgDom = document.querySelector('#tooltipImg');
    if (imgDom) {
      imgDom.setAttribute('src', imgSrc.value as string);
    }

    const viewDom = document.querySelector('#tooltipView');
    if (viewDom) {
      viewDom.addEventListener('click', () => {
        setDatasetBreadcrumb(labelName.value, datasetTypeEnum.IMAGE);
        go(`${RouteEnum.DATASETS}/data?id=${props.datasetId}&dataId=${id}`);
      });
    }

    const maskDom: any = document.querySelector('#tooltipMask');
    if (maskDom) {
      maskDom.style.display = 'none';
    }
  };
  const selectedData = ref([]);
  let getHighlightData = _.debounce((data) => {
    let result = data?.map((item) => item.data.id);
    console.log(result);
    if (result?.length) {
      selectedData.value = result;
    }
  }, 200);
  const { currentRoute } = useRouter();
  let showSelectedData = () => {
    const params = { dataId: selectedData.value, ...currentRoute.value.query };
    go(parseParam(RouteChildEnum.DATASETS_DATA, params));
  };
  watch(
    () => selectedBrush.value,
    (val) => {
      if (!val || val === 'fliter') {
        selectedData.value = [];
      }
    },
    {},
  );

  let setTypeAsFilter = () => {
    chartRef.value.update({
      brush: {
        enabled: true,
        // 圈选高亮，不指定默认为: filter
        action: 'filter',
        // isStartEnable: () => !!selectedBrush.value,
      },
    });
    // selectedBrush.value = undefined;
  };

  const chartRef = ref<any>();
  onMounted(async () => {
    await getClassificationList();
    await getSimilarityRecord();
    if (scatterList.value.length == 0) return;

    chartRef.value = setPlot(PlotEnum.SCATTER, plotRef.value, {
      data: scatterList.value,
      ...defaultScatterOptions,
      brush: {
        enabled: true,
        // 圈选高亮，不指定默认为: filter
        action: 'highlight',
        mask: {
          style: {
            fill: 'rgba(255,0,0,0.15)',
          },
        },
        isStartEnable: () => !!selectedBrush.value,
      },
      tooltip: {
        enterable: true,
        // showDelay: 1000,
        showMarkers: false,
        domStyles: {
          'g2-tooltip': {
            width: '223px',
            padding: 0,
          },
        },
        offset: -3,
        customContent: (_, items) => {
          if (!_) return;
          const data = items[0]?.data || {};
          const dataId = data?.id ?? undefined;
          if (dataId && dataId != lastDataId.value) {
            imgSrc.value = emptyImg;
            labelName.value = '';
            getDataInfo(dataId);
          } else {
            setTimeout(() => {
              getToolTipDom(dataId);
            });
          }

          // mask & loading
          const maskDom = `<div id="tooltipMask" class="custom-tooltip-container-mask">
                            <div class="loading"></div>
                          </div>`;
          const headerDom = `<div class="custom-tooltip-container-header">
                                <div class="custom-tooltip-container-header-left">
                                  <div>ID: ${dataId}</div>
                                  <div class="label">
                                    Label: <span id="tooltipLabel">${labelName.value}</span>
                                  </div>
                                  <div>Vector: ${data?.x?.toFixed(4)},${data?.y?.toFixed(4)}</div>
                                </div>
                                <div id="tooltipView" class="custom-tooltip-container-header-right">View data</div>
                              </div>`;
          const contentDom = `<div class="custom-tooltip-container-content">
                                <img id="tooltipImg" src="${imgSrc.value}" onError="{{  this.src = ''}}" />
                              </div>`;

          return `<div class="custom-tooltip-container" style="background-color:orange">
                    ${maskDom}
                    ${headerDom}
                    ${contentDom}
                  </div>`;
        },
      },
    });

    chartRef.value.on(G2.ELEMENT_RANGE_HIGHLIGHT_EVENTS.AFTER_HIGHLIGHT, ({ data }) => {
      getHighlightData(data.highlightElements);
    });

    chartRef.value.getStates(G2.BRUSH_FILTER_EVENTS.AFTER_RESET, () => {
      // after brush filter reset
      // debugger
      console.log(chartRef.value.chart.getStates());
    });
  });
</script>
<style lang="less" scoped>
  @import './index.less';
  .zoom {
    cursor: pointer;
    border-radius: 30%;
    padding: 2px;
  }
  .container {
    width: 100%;
    // max-width: 20000px;
    height: 0;
    position: relative;
    padding-top: 50%;
    // overflow: auto;
    .chartContainer__box {
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0 20px;
    }
    :deep(.g2-tooltip) {
      display: v-bind(showG2Tooltip);
    }
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
    position: relative;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border: 1px solid #dddddd;
    border-radius: 4px;
    overflow: hidden;
    &-mask {
      position: absolute;
      width: 223px;
      height: 205px;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1;
      background-color: rgba(0, 0, 0, 0.5);
      .loading {
        width: 30px;
        height: 30px;
        border: 2px solid #fff;
        border-top-color: transparent;
        border-radius: 100%;

        animation: circle infinite 0.75s linear;
      }

      // 转转转动画
      @keyframes circle {
        0% {
          transform: rotate(0);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    }
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
        cursor: pointer;
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
        object-fit: cover;
      }
    }
  }
</style>
