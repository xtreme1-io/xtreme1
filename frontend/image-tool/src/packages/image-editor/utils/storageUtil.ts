export const KEY_SETTING = 'IMAGE_TOOL_SETTING';

interface ISetting {
  helpLineColor?: string; // 辅助线设置颜色
  helpToolColor?: string; // 辅助线工具的颜色
  drawColor?: string; // 默认的绘制颜色
  rotation?: number; // 辅助线旋转角度, 临时缓存
}
export function storageSetting() {
  return {
    set(config: ISetting) {
      const _config = Object.assign(this.get(), config);
      localStorage.setItem(KEY_SETTING, JSON.stringify(_config));
    },
    get(): ISetting {
      return JSON.parse(localStorage.getItem(KEY_SETTING) || '{}');
    },
  };
}
