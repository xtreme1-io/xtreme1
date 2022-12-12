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
  import { onMounted, ref } from 'vue';
  import { Tabs } from 'ant-design-vue';
  import { useG2plot, PlotEnum } from '/@/hooks/web/useG2plot';
  import { defaultBarOptions } from './data';
  import { barData } from './data';
  import { classOptions } from './classData';

  enum tabPaneEnum {
    CLASS = 'Class',
    CLASSIFICATION = 'Classification',
  }
  const activeKey = ref<tabPaneEnum>(tabPaneEnum.CLASS);

  const handleChange = (newValue: tabPaneEnum) => {
    activeKey.value = newValue;
  };

  const { setPlot } = useG2plot();
  const plotClassRef = ref<HTMLElement | null>(null);
  const plotClassificationRef = ref<HTMLElement | null>(null);

  onMounted(async () => {
    const classPlot = setPlot(PlotEnum.BAR, plotClassRef.value, {
      // data: list,
      ...classOptions,
    });
    console.log(classPlot);

    // (classPlot as any).chart
    //   .interval()
    //   .position('number*name')
    //   .label('name', {
    //     /**
    //      * 创建 html 文本
    //      * @param  {string} text  每条记录 x 属性的值
    //      * @param  {object} item  映射后的每条数据记录，是一个对象，可以从里面获取你想要的数据信息
    //      * @param  {number} index 每条记录的索引
    //      * @return {string}       返回 html 字符串
    //      */
    //     htmlTemplate: (text, item, index) => {
    //       console.log(text, item, index);
    //       return `<span>123123123</span>`;
    //     },
    //   });

    setPlot(PlotEnum.BAR, plotClassificationRef.value, {
      data: barData,
      ...defaultBarOptions,
    });
  });
</script>
<style lang="less" scoped>
  @import './index.less';
</style>
