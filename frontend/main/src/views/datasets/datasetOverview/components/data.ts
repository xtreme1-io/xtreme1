export const defaultPieOptions = {
  appendPadding: 10,
  angleField: 'value',
  colorField: 'type',
  radius: 1,
  innerRadius: 0.6,
  color: ({ type }) => {
    if (type === 'Annotated') {
      return '#60A9FE';
    } else if (type == 'Not Annotated') {
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
  tooltip: {
    position: 'bottom',
    shared: false,
    title: 'Progress',
    formatter: (data) => {
      return {
        name: data.type,
        value: Math.round(data.value * 100) + '%',
      };
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

export const defaultBarOptions = {
  xField: 'sales',
  yField: 'type',
  seriesField: 'type',
  color: ({ type }) => {
    return type === '美容洗护' ? '#FAAD14' : '#5B8FF9';
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
          // fill: oldStyle.stroke || oldStyle.fill,
        };
      },
    },
  },
  meta: {
    type: {
      alias: '类别',
    },
    sales: {
      alias: '销售额',
    },
  },
};

export const pieData = [
  { type: 'Annotated', value: 27 },
  { type: 'Not Annotated', value: 25 },
  { type: 'Invalid', value: 18 },
];

export const barData = [
  {
    type: '家具家电',
    sales: 38,
  },
  {
    type: '粮油副食',
    sales: 52,
  },
  {
    type: '生鲜水果',
    sales: 61,
  },
  {
    type: '美容洗护',
    sales: 145,
  },
  {
    type: '母婴用品',
    sales: 48,
  },
  {
    type: '进口食品',
    sales: 38,
  },
  {
    type: '食品饮料',
    sales: 38,
  },
  {
    type: '家庭清洁',
    sales: 38,
  },
];
