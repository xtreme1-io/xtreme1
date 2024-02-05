import { h } from 'vue';
import { ToolName, ToolType } from '../types';

type AllTool = ToolType | ToolName | 'loading' | '';
const ToolIconClass: Record<AllTool, string> = {
  [ToolType.RECTANGLE]: 'iconfont icon-rect',
  [ToolType.BOUNDING_BOX]: 'iconfont icon-rect',
  [ToolName.rect]: 'iconfont icon-rect',

  [ToolType.POLYGON]: 'iconfont icon-polygon',
  [ToolName.polygon]: 'iconfont icon-polygon',

  [ToolType.POLYLINE]: 'iconfont icon-polyline',
  [ToolName.polyline]: 'iconfont icon-polyline',

  [ToolType.KEY_POINT]: 'iconfont icon-point',
  [ToolName['key-point']]: 'iconfont icon-point',

  [ToolName.model]: 'iconfont icon-ai',

  [ToolName.edit]: 'iconfont icon-arrow',
  loading: 'iconfont icon-loading loading',
  [ToolName.default]: '',
};
interface IToolIcon {
  tool: AllTool;
}
export const ToolIcon = (props: IToolIcon, ctx: any) => {
  const { tool } = props;
  let iconClass: string = ToolIconClass[tool] || '';
  return h('i', { style: 'font-size: 16px', class: iconClass });
};
