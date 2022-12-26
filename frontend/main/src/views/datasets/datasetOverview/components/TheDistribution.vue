<template>
  <div class="chart_wrapper">
    <div class="title">Distribution</div>
    <div class="chartContainer">
      <Tabs v-model:activeKey="activeKey" @change="handleChange">
        <Tabs.TabPane :key="tabPaneEnum.CLASS" tab="Classes" forceRender>
          <ChartEmpty v-if="!hasClassData" tip="No Classes" class="py-80px" />
          <div v-else>
            <!-- <div class="class-legend">
              <div
                class="class-legend-item"
                v-for="(item, index) in currentToolTypeImg"
                :key="index"
              >
                <img :src="item.img" alt="" />
                <span>{{ formatEnum(item.label) }}</span>
              </div>
            </div> -->
            <div ref="plotClassRef" class="chartContainer__box"></div>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane :key="tabPaneEnum.CLASSIFICATION" tab="Classifications" forceRender>
          <ChartEmpty v-if="!hasClassificationData" tip="No Classifications" class="py-80px" />
          <div v-else ref="plotClassificationRef" class="chartContainer__box"></div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, onMounted, ref, unref } from 'vue';
  import { Tabs } from 'ant-design-vue';
  import { useG2plot, PlotEnum } from '/@/hooks/web/useG2plot';
  import ChartEmpty from './ChartEmpty.vue';
  import { classificationBarOptions, classOptions } from './data';
  import { tabPaneEnum } from './typing';
  import { getClassificationDataApi, getClassObjectApi } from '/@/api/business/dataset/overview';
  import { IClassificationData, IClassUnits } from '/@/api/business/dataset/model/overviewModel';
  import _ from 'lodash';
  import { formatEnum } from '/@/utils/business';
  import { toolTypeImg } from '/@/views/ontology/classes/attributes/data';

  const activeKey = ref<tabPaneEnum>(tabPaneEnum.CLASS);

  const props = defineProps<{ datasetId: number }>();

  const handleChange = (newValue: tabPaneEnum) => {
    activeKey.value = newValue;
  };

  const { setPlot } = useG2plot();
  const plotClassRef = ref<HTMLElement | null>(null);
  const plotClassificationRef = ref<HTMLElement | null>(null);

  /** Class */
  const classData = ref<Array<IClassUnits>>([]);
  const hasClassData = computed(() => {
    return classData.value.length > 0;
  });
  const annotations = ref<any[]>([]);
  const getClassObject = async () => {
    const params = { datasetId: props.datasetId };
    const res = await getClassObjectApi(params);
    getToolTypeImg(res.classUnits ?? []);
    const dataLength = res.classUnits.length;
    let itemLength = 0;
    const tempClassData: any[] = [];
    const groupClassData = _.groupBy(
      res.classUnits.sort((a, b) => b.objectAmount - a.objectAmount),
      'toolType',
    );
    Object.keys(groupClassData).forEach((item) => {
      tempClassData.push(...groupClassData[item]);
      const length = groupClassData[item].length;

      unref(annotations).push({
        type: 'text',
        top: true,
        position: () => {
          const middle = Math.ceil(length / 2);
          const key = (groupClassData[item][middle - 1] as any).yKey;
          return [key, 'min'];
        },
        content: item == 'null' ? 'N/A' : formatEnum(item),
        style: {
          fontSize: 12,
          fontWeight: '300',
          textAlign: 'center',
        },
        offsetX: -160,
        // rotate: Math.PI * -0.5,
      });

      itemLength += length;
      const line = (itemLength / dataLength) * 100 + '%';
      unref(annotations).push({
        type: 'line',
        top: true,
        start: ['-20%', line],
        end: ['120%', line],
        style: {
          stroke: '#c0c0c0',
          lineDash: [2, 2],
        },
        position: () => {
          const middle = Math.ceil(length / 2);
          const key = (groupClassData[item][middle - 1] as any).yKey;
          return [key, 'min'];
        },
      });
    });

    classData.value = tempClassData.map((item: any) => {
      item.yKey = item.toolType + ':' + item.name;
      return item;
    });
  };
  const currentToolTypeImg = ref<any[]>([]);
  const getToolTypeImg = (list) => {
    const toolTypeList = list.map((item) => item.toolType);
    Object.keys(toolTypeImg).forEach((item) => {
      if (toolTypeList.includes(item))
        currentToolTypeImg.value.push({
          label: item,
          img: toolTypeImg[item],
        });
    });
  };

  /** Classification */
  const classificationData = ref<Array<IClassificationData>>([]);
  const hasClassificationData = computed(() => {
    return classificationData.value.length > 0;
  });
  const getClassificationObject = async () => {
    const params = { datasetId: props.datasetId };
    const res = await getClassificationDataApi(params);
    classificationData.value = res.map((item: any) => {
      item.yKey = item.attributeId + ':' + item.optionName;
      return item;
    });
  };

  onMounted(async () => {
    // class
    await getClassObject();
    setPlot(PlotEnum.BAR, plotClassRef.value, {
      data: classData.value,
      ...classOptions,
      color: (item) => {
        return item.color;
      },
      annotations: annotations.value,
    });

    // classification
    await getClassificationObject();
    setPlot(PlotEnum.BAR, plotClassificationRef.value, {
      data: classificationData.value,
      ...classificationBarOptions,
      tooltip: {
        position: 'bottom',
        shared: false,
        showTitle: false,
        // customContent: (title, items) => {
        //   console.log(title, items);
        //   const data = items[0]?.data || {};
        //   const titleDom = `<div>${title}</div>`;
        //   const tempDom = `<div>${data.optionPath?.join(',')}</div>`;

        //   return `<div class="flex flex-col gap-5px p-10px">
        //             ${titleDom}
        //             ${tempDom}
        //           </div>`;
        // },
        formatter: (data) => {
          const target = classificationData.value.find((item: any) => item.yKey == data.yKey);
          return {
            name: target?.optionName,
            value: target?.optionPath?.join(','),
          };
        },
      },
    });
  });
</script>
<style lang="less" scoped>
  @import './index.less';

  .class-legend {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
    &-item {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border: 1px solid @primary-color;
      border-radius: 4px;
      background: #f0f7ff;
      img {
        width: 12px;
        height: 12px;
      }
      span {
        font-weight: 400;
        font-size: 14px;
        color: #333333;
      }
    }
  }
</style>
