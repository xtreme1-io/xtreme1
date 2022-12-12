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
  xField: 'weight',
  yField: 'height',
  colorField: 'gender',
  size: 3,
  shape: 'circle',
  limitInPlot: false,
  legend: {
    position: 'right',
    radio: null, // 隐藏图例后的 radio 按钮
    marker: {
      symbol: 'circle',
      style: (oldStyle) => {
        return {
          ...oldStyle,
          r: 6,
          // fill: oldStyle.stroke || oldStyle.fill,
        };
      },
    },
  },
  // tooltip: {
  //   enterable: true,
  // },
  tooltip: {
    showMarkers: false,
    enterable: true,
    domStyles: {
      'g2-tooltip': {
        width: '400px',
        padding: 0,
      },
    },
    customContent: (title, items) => {
      console.log('customContent', title, items);
      const data = items[0]?.data || {};
      console.log(data);
      const titleDom = `<div class ="custom-tooltip-title">${data.gender}</div>`;
      const tempDom = `<div class="custom-tooltip-value">
                          <div class="custom-tooltip-temp">
                              <span>低温</span>
                              <span>${data.weight}</span>
                          </div>
                          <div class="custom-tooltip-temp">
                            <span>高温</span>
                            <span>${data.height}</span>
                          </div>
                        </div>`;
      const windDom = `<div class = "custom-tooltip-wind">
                          <span>风向:${data.height}</span>
                       </div>`;
      let domClass;
      return `<div class="background-image ${domClass}">
                ${titleDom}
                ${tempDom}
                ${windDom}
                <div class="tooltip-footer"></div>
              </div>`;
    },
  },
  pointStyle: {
    fillOpacity: 1,
  },
  brush: {
    enabled: true,
    // 圈选高亮，不指定默认为: filter
    action: 'highlight',
    mask: {
      style: {
        fill: 'rgba(0,0,0,0.15)',
        stroke: 'rgba(0,0,0,0.45)',
        lineWidth: 0.5,
      },
    },
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
