<template>
  <div class="chart_wrapper">
    <div class="title">Distribution</div>
    <div class="chartContainer">
      <Tabs v-model:activeKey="activeKey" @change="handleChange">
        <Tabs.TabPane :key="tabPaneEnum.CLASS" tab="Classes" forceRender>
          <div ref="plotClassRef" class="chartContainer__box" @mousewheel.prevent></div>
        </Tabs.TabPane>
        <Tabs.TabPane :key="tabPaneEnum.CLASSIFICATION" tab="Classifications" forceRender>
          <div ref="plotClassificationRef" class="chartContainer__box" @mousewheel.prevent></div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref, unref } from 'vue';
  import { Tabs } from 'ant-design-vue';
  import { useG2plot, PlotEnum } from '/@/hooks/web/useG2plot';
  import { classificationBarOptions, classOptions } from './data';
  import { tabPaneEnum } from './typing';
  import { getClassificationDataApi, getClassObjectApi } from '/@/api/business/dataset/overview';
  import { IClassificationData, IClassUnits } from '/@/api/business/dataset/model/overviewModel';
  import _ from 'lodash';
  import { formatEnum } from '/@/utils/business';

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
  const annotations = ref<any[]>([]);
  const getClassObject = async () => {
    const params = { datasetId: props.datasetId };
    const res = await getClassObjectApi(params);

    const dataLength = res.classUnits.length;
    let itemLength = 0;

    const tempClassData: any[] = [];
    const groupClassData = _.groupBy(res.classUnits, 'toolType');
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
        content: formatEnum(item),
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
      console.log(line);
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

  /** Classification */
  const classificationData = ref<Array<IClassificationData>>([]);
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
</style>
