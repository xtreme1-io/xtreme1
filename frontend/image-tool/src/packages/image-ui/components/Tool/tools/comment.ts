import { IItemConfig } from '../item';
import { Editor, UIType, ToolName } from '../../../../image-editor';

/**
 * 评论工具配置
 */
// 评论工具
export const commentTool: IItemConfig = {
  action: ToolName.comment,
  name: 'Comment Tool',
  hotkey: 'W',
  title: 'commentTips',
  getIcon: () => {
    return ToolName.comment;
  },
  isDisplay: function (editor: Editor) {
    return editor.state.modeConfig.ui[UIType.tool_comment];
  },
  isActive: function (editor: Editor) {
    const state = editor.state;
    return state.activeTool === ToolName.comment;
  },
};
