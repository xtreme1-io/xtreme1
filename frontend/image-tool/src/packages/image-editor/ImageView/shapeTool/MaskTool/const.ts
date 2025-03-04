/**
 * segment tool 常量定义
 */
// 暂定的每个canvas最大分辨率(2.5K: 2560 * 1440), 太大的图片绘制时会卡顿
const MAX_PIXEL: number = 3686400;
// 拆分的canvas最小高度(画笔的最大直径)
const MAX_SPLIT_HEIGHT = 200;
// MaskTool 快捷键 nameSpace
const HOTKYE_NAMESPACE = 'MaskTool';
// 切换masktool的快捷键
const KEY_X = 'x';
// 切换是否覆盖的快捷键
const KEY_2 = '2';
// 切换橡皮擦模式
const KEY_3 = '3';
const KEY_REDUCE = '-';
const KEY_ADD = '=';

export default {
  MAX_PIXEL,
  MAX_SPLIT_HEIGHT,
  HOTKYE_NAMESPACE,
  KEY_X,
  KEY_2,
  KEY_3,
  KEY_REDUCE,
  KEY_ADD,
};
