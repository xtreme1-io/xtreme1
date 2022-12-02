// import { Chart } from '@antv/g2';
import { Line, Column, Bar } from '@antv/g2plot';
import type { Plot, LineOptions, ColumnOptions, BarOptions } from '@antv/g2plot';
import { tryOnUnmounted } from '@vueuse/core';

export enum PlotEnum {
  LINE = 'line',
  COLUMN = 'column',
  BAR = 'bar',
}
type PlotType = LineOptions | ColumnOptions | BarOptions;

export function useG2plot() {
  let plot: Plot<PlotType>;

  function setPlot(type, container, options) {
    if (!type || !container) {
      console.error('No type or element');
      return;
    }

    switch (type) {
      case PlotEnum.LINE:
        plot = createPlotLine(container, options);
        break;
      case PlotEnum.COLUMN:
        plot = createPlotColumn(container, options);
        break;
      case PlotEnum.BAR:
        plot = createPlotBar(container, options);
        break;
      default:
        console.error('There is no matching type');
    }

    plotRender();
    removeInteraction();
  }

  // 创建图表实例
  function createPlotLine(container: HTMLElement, options: LineOptions): Line {
    return new Line(container as HTMLElement, options);
  }
  function createPlotColumn(container: HTMLElement, options: ColumnOptions): Column {
    return new Column(container, options);
  }
  function createPlotBar(container: HTMLElement, options: BarOptions): Bar {
    return new Bar(container, options);
  }

  // 渲染
  function plotRender() {
    plot.render();
  }
  // 销毁
  function plotDestroy() {
    plot.destroy();
    plot = null as any;
  }
  // 移除某些交互
  function removeInteraction() {
    // 移除图例交互
    plot.chart.removeInteraction('legend-filter');
    plot.chart.removeInteraction('legend-highlight');
    plot.chart.removeInteraction('legend-active');
    // 移除分类背景框
    plot.chart.removeInteraction('active-region');
  }
  tryOnUnmounted(() => {
    if (!plot) return;
    plotDestroy();
  });

  return {
    setPlot,
  };
}
