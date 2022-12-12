export const list = [
  {
    number: 99,
    name: 'Class12',
    color: '#faef2c',
    toolType: 'POLYGON',
  },
  {
    number: 100,
    name: 'Class12',
    color: '#c18af7',
    toolType: 'BOUNDING_BOX',
  },
  {
    number: 107,
    name: 'Class12',
    color: '#7ff0b3',
    toolType: 'POLYLINE',
  },
  {
    number: 45,
    name: 'TRY',
    color: '#7dfaf2',
    toolType: 'TEXT',
  },
];

export const getColor = (name) => {
  const target = list.find((item) => item.name == name);
  return target?.color ?? '#dedede';
};
export const classOptions = {
  data: list,
  xField: 'number',
  yField: 'name',
  // color
  seriesField: 'name',
  color: (item) => getColor(item.name),
  // axis: {
  yAxis: {
    label: {
      formatter: (text) => {
        return `【${text}】♤♡♢♧`;
      },
      // content: 'color',
    },
  },
  // },
  legend: {
    layout: 'horizontal',
    position: 'top-left',
    radio: null, // 隐藏图例后的 radio 按钮
    itemName: {
      formatter: (text, item) => {
        console.log('legend', text, item);
        return text;
      },
    },
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
};
