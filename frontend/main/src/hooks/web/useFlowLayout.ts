import { reactive, onMounted, toRefs } from 'vue';

/**
 * 动态计算卡片宽高和间距
 *
 * @param className 卡片可视区域父节点元素类名
 * @param extraHeight 卡片文字部分 或者其他部分 固定的额外高度 大小不会随着窗口变化改变
 * @param beReducedWidth 基于非异步加载的父容器 需要减掉的两边padding值
 */

export function useFlowLayout(className: string, extraHeight = 0, beReducedWidth = 30) {
  const listCardCss = reactive<{
    // 卡片动态宽度
    cardWidth: string;
    // 卡片动态高度
    cardHeight: string;
    // 卡片之间动态padding
    paddingX: string;
    // 可调节宽度进度条 card 最大宽度 保持和父级dom宽度一致，最多放大到每行一个卡片
    maxSliderWidth: number;
    // 卡片区域高度 (未添加extraHeight)
    cardHeightPure: string;
  }>({
    cardWidth: '100px',
    cardHeight: '100px',
    cardHeightPure: '100px',
    paddingX: '10px',
    maxSliderWidth: 900,
  });

  // 页面设置卡片大小进度条改变时触发回调给宽度重新赋值
  const changeWidth = (sliderValue: number) => {
    if (sliderValue <= 200) {
      sliderValue = 200;
    }
    listCardCss.cardWidth = sliderValue + 'px';
    listCardCss.cardHeight = sliderValue / 1.5 + extraHeight + 'px';
  };
  const getCssConfig = (contenWidthNum: number) => {
    if (contenWidthNum <= 200) {
      contenWidthNum = 200;
    }
    // const tagnum = Math.floor(contenWidthNum / 300);
    const tagnum = Math.ceil(contenWidthNum / 300);
    listCardCss.maxSliderWidth = contenWidthNum;
    const cardWidth = Math.floor(contenWidthNum / tagnum);
    listCardCss.cardWidth = cardWidth + 'px';
    listCardCss.cardHeight = Math.floor(contenWidthNum / tagnum) / 1.5 + extraHeight + 'px';
    listCardCss.cardHeightPure = Math.floor(contenWidthNum / tagnum) / 1.5 + 'px';
  };
  // 重置页面卡片宽度
  const resetWidth = () => {
    getCssConfig(listCardCss.maxSliderWidth);
  };
  const { cardHeight, cardHeightPure, cardWidth, paddingX, maxSliderWidth } = toRefs(listCardCss);
  onMounted(() => {
    setTimeout(() => {
      const box = document.getElementsByClassName(className)[0];

      let wrapwidth = window.getComputedStyle(box, null)['width'];
      if (!wrapwidth.includes('px')) {
        const boxHeader = document.getElementsByClassName('basic-layout-multiple-header')[0];
        const wrapwidthNum = parseInt(window.getComputedStyle(boxHeader, null)['width']);
        wrapwidth = wrapwidthNum - 230 + 'px';
      }
      let contenWidthNum = Number(wrapwidth.replaceAll('px', '')) - beReducedWidth;
      getCssConfig(contenWidthNum);
      window.addEventListener('resize', function () {
        wrapwidth = window.getComputedStyle(box, null)['width'];
        contenWidthNum = Number(wrapwidth.replaceAll('px', '')) - beReducedWidth;
        getCssConfig(contenWidthNum);
      });
    }, 0);
  });

  return {
    cardHeight,
    cardWidth,
    paddingX,
    changeWidth,
    cardHeightPure,
    resetWidth,
    maxSliderWidth,
  };
}
