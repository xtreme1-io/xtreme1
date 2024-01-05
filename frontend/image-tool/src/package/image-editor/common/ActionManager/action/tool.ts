import Editor from '../../../Editor';
import { define } from '../define';
import { LineDrawMode, ToolAction } from '../../../types';
import { Event, Cursor } from '../../../configs';
import { PolylineTool } from 'image-editor/ImageView/shapeTool';

export const changeTool = define({
  valid() {
    return true;
  },
  canBlocked() {
    return false;
  },
  execute(editor: Editor, args?: any) {
    return () => {
      editor.emit(Event.TOOL_CHANGE, args);
    };
  },
  end(editor: Editor, executeCallback: Function) {
    executeCallback();
  },
});

export const selectTool = define({
  valid() {
    return true;
  },
  canBlocked() {
    return false;
  },
  execute(editor: Editor) {
    editor.mainView.disableDraw();
    editor.selectObject();
  },
});

export const drawTool = define({
  valid() {
    return true;
  },
  canBlocked() {
    return false;
  },
  execute(editor: Editor, type: string) {
    const state = editor.state;
    if (state.activeTool !== type) editor.mainView.enableDraw(type);
  },
});

export const stopCurrentDraw = define({
  valid() {
    return true;
  },
  canBlocked() {
    return false;
  },
  execute(editor: Editor) {
    const { currentDrawTool, currentEditTool } = editor.mainView;
    const tool = currentDrawTool || currentEditTool;

    if (tool && tool.checkAction(ToolAction.stop)) {
      tool.onAction(ToolAction.stop);
    }
    editor.mainView.setCursor(editor.mainView.cursor || Cursor.auto);
  },
});

export const lineToolDrawMode = define({
  valid(editor: Editor) {
    const curDrawTool = editor.mainView.currentDrawTool;
    return Boolean(curDrawTool && curDrawTool instanceof PolylineTool);
  },
  canBlocked() {
    return false;
  },
  execute(editor: Editor, key: string) {
    const cfg = editor.state.toolConfig;
    if (key === 'a') {
      cfg.lineMode =
        cfg.lineMode === LineDrawMode.horizontal ? LineDrawMode.default : LineDrawMode.horizontal;
    } else {
      cfg.lineMode =
        cfg.lineMode === LineDrawMode.vertical ? LineDrawMode.default : LineDrawMode.vertical;
    }
    const curDrawTool = editor.mainView.currentDrawTool;
    if (curDrawTool && curDrawTool instanceof PolylineTool) {
      curDrawTool.updateHolder();
    }
    // if (cfg.lineMode === LineDrawMode.default) {
    //   editor.visibleMessageBox(false);
    // } else if (cfg.lineMode === LineDrawMode.horizontal) {
    //   const txt = editor.lang('Horizontal Drawing Model');
    //   editor.visibleMessageBox(true, txt);
    // } else if (cfg.lineMode === LineDrawMode.vertical) {
    //   const txt = editor.lang('Vertical Drawing Model');
    //   editor.visibleMessageBox(true, txt);
    // }
  },
});
