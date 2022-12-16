import { pieDataEnum } from './typing';
import { toolTypeImg } from '../../../ontology/classes/attributes/data';

export const defaultPieOptions = {
  appendPadding: 10,
  angleField: 'count',
  colorField: 'type',
  radius: 1,
  innerRadius: 0.6,
  color: ({ type }) => {
    if (type === pieDataEnum.ANNOTATED) {
      return '#60A9FE';
    } else if (type == pieDataEnum.NOT_ANNOTATED) {
      return '#AAAAAA';
    } else {
      return '#FCB17A';
    }
  },
  label: {
    type: 'inner',
    style: {
      fontSize: 0,
    },
  },
  interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
  statistic: {
    title: false,
    content: {
      style: {
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      content: '',
    },
  },
};

export const defaultScatterOptions = {
  xField: 'x',
  yField: 'y',
  colorField: 'option',
  size: 10,
  shape: 'circle',
  limitInPlot: false,
  legend: {
    offsetX: 5,
    position: 'right-top',
    radio: null, // 隐藏图例后的 radio 按钮
    marker: {
      symbol: 'circle',
      style: (oldStyle) => {
        return {
          ...oldStyle,
          r: 6,
        };
      },
    },
  },
  pointStyle: {
    fillOpacity: 1,
  },
};

export const classificationBarOptions = {
  xField: 'dataAmount',
  yField: 'yKey', // attributeId + ':' + name
  yAxis: {
    label: {
      formatter: (text) => {
        return `${text.split(':')[1]}`;
      },
    },
  },
  domStyles: {
    'g2-tooltip-value': {
      float: 'none',
      'margin-left': 0,
    },
  },
  legend: {
    position: 'top-left',
    radio: null, // 隐藏图例后的 radio 按钮
    marker: {
      symbol: 'circle',
      style: (oldStyle) => {
        return {
          ...oldStyle,
          r: 6,
        };
      },
    },
  },
  minBarWidth: 20,
  maxBarWidth: 20,
};

export const classOptions = {
  xField: 'objectAmount',
  yField: 'yKey', // toolType + ':' + name
  seriesField: 'color',
  yAxis: {
    title: {
      offset: 220,
      text: '',
    },
    label: {
      offset: 30,
      formatter: (text) => {
        return `${text.split(':')[1]}`;
      },
    },
  },
  tooltip: {
    position: 'bottom',
    shared: false,
    showTitle: false,
    customContent: (_, items) => {
      const data = items[0]?.data || {};

      const titleDom = `<div class="flex">
                          <span class="w-12px h-12px rounded-12px mr-10px" style="background-color: ${
                            data.color
                          }"></span>
                          <span class="w-12px h-12px mr-4px">
                            <img src="${toolTypeImg[data.toolType]}" />
                          </span>
                          <span class="text-12px" style="color:#333">${data.name}</span>
                        </div>`;
      const tempDom = `<div style="color:#666">Counts: ${data.objectAmount}</div>`;

      return `<div class="flex flex-col gap-8px py-12px">
                ${titleDom}
                ${tempDom}
              </div>`;
    },
  },
  legend: false,
  minBarWidth: 20,
  maxBarWidth: 20,
};
