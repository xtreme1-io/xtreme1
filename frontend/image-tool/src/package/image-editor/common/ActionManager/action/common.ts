import { AnnotateModeEnum, AnnotateObject, ITransform, ToolAction } from './../../../types';
import Editor from '../../../Editor';
import { define } from '../define';
import { Event } from '../../../configs';

export const deleteSelection = define({
  valid() {
    return true;
  },
  execute(editor: Editor) {
    const { currentDrawTool, currentEditTool } = editor.mainView;

    const tool = currentDrawTool || currentEditTool;
    if (tool && tool.checkAction(ToolAction.del)) {
      tool.onAction(ToolAction.del);
    } else {
      const selection = editor.selection;
      if (selection.length === 0) return;
      editor.cmdManager.execute('delete-object', selection);
      editor.emit(Event.ANNOTATE_HANDLE_DELETE, { objects: selection, type: 1 });
      editor.selectObject();
    }
  },
});
export const adjustObject = define({
  valid(editor: Editor) {
    const { selection, state } = editor;
    return (
      selection.length === 1 &&
      state.annotateMode === AnnotateModeEnum.INSTANCE &&
      editor.isDefaultStatus()
    );
  },
  execute(editor: Editor, args?: any) {
    const object = editor.selection[0];
    if (!object) return;
    const rect = object.getSelfRect(true);
    const position = object.getAbsolutePosition(editor.mainView.stage);
    const { backgroundWidth, backgroundHeight } = editor.mainView;
    const left = position.x + rect.x;
    const up = position.y + rect.y;
    const right = left + rect.width;
    const down = up + rect.height;

    const key = args.split('+').pop();
    let { x, y } = object.attrs;
    switch (key) {
      case 'up':
        if (up <= 0) return;
        y--;
        break;
      case 'down':
        if (down >= backgroundHeight) return;
        y++;
        break;
      case 'left':
        if (left <= 0) return;
        x--;
        break;
      case 'right':
        if (right >= backgroundWidth) return;
        x++;
        break;
    }
    let objects: AnnotateObject[] = [];
    let transforms: ITransform[] = [];
    objects = [object];
    transforms = [{ x, y }];
    editor.cmdManager.execute('update-transform', { objects, transforms });
  },
});

// 绘制结果时的尺寸信息的显隐控制
export const toggleSizeInfo = define({
  valid() {
    return true;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const { config } = editor.state;
    config.showSizeTips = !config.showSizeTips;
  },
});
