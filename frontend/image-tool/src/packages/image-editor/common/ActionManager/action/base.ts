import { DisplayModeEnum, ToolAction, ToolModelEnum } from './../../../types/enum';
import Editor from '../../../Editor';
import { define } from '../define';
import { Event } from '../../../config';
import { AnnotateObject, Background, Rect } from '../../../ImageView/export';
import { ITransform } from 'image-editor';

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

// edit-class控制编辑class标签弹窗的开关
export const toggleClassView = define({
  valid() {
    return true;
  },
  execute(editor: Editor) {
    const { config } = editor.state;
    const selection = editor.selection;
    const frame = editor.getCurrentFrame();

    if (config.showClassView) {
      config.showClassView = false;
    } else if (selection.length === 1 && selection[0].frame.id === frame.id) {
      editor.emit(Event.SHOW_CLASS_INFO, selection[0]);
    }
  },
});
// 控制标注结果的class标签显隐
export const toggleClassTitle = define({
  valid() {
    return true;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const { config } = editor.state;
    config.showClassTitle = !config.showClassTitle;
    if (config.showClassTitle) editor.emit(Event.DRAW);
  },
});
// 控制class-attrs浮层显隐
export const toggleAttrsView = define({
  valid() {
    return true;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const { config } = editor.state;
    config.showObjectAttrs = [1, 2, 0][config.showObjectAttrs];
    editor.mainView.draw();
  },
});
// 控制class & class attrs & classification显示name or alias
export const changeNameShowType = define({
  valid() {
    return true;
  },
  execute(editor: Editor) {
    const { config } = editor.state;
    config.nameShowType = config.nameShowType === 'name' ? 'alias' : 'name';
    editor.dataResource.store.set({ classLabelKey: config.nameShowType });
    editor.emit(Event.NAME_OR_ALIAS);
  },
});

// 评论显隐开关
export const toggleComment = define({
  valid() {
    return true;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const { config } = editor.state;
    config.showComment = !config.showComment;
  },
});

// 单独显示选中结果的开关
export const toggleSingleResult = define({
  valid(editor) {
    return editor.isDefaultStatus();
  },
  execute(editor: Editor) {
    editor.state.config.showSingleResult = !editor.state.config.showSingleResult;
    editor.updateObjectVisible();
  },
});
// 显示选中结果mask的开关
export const toggleSelectedMask = define({
  valid(editor) {
    return editor.isDefaultStatus() && editor.state.config.showSingleResult;
  },
  execute(editor: Editor) {
    editor.state.config.selectedViewType.showMask = !editor.state.config.selectedViewType.showMask;
    editor.emit(Event.SELECT_RESULT_MASK);
  },
});
// 切换选中结果的显隐状态
export const toggleVisibleSelection = define({
  valid(editor: Editor) {
    return editor.selection.length > 0;
  },
  execute(editor: Editor) {
    const { selection } = editor;
    const hasShow = selection.find((e) => e.showVisible);
    const params: Record<string, any> = {};
    if (hasShow) params.hideObjects = selection;
    else params.showSelection = true;
    editor.visibleObjects(params);
  },
});
// 结果的trackName的显示开关
export const toggleResultTrackName = define({
  valid() {
    return true;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const { config } = editor.state;
    config.showResultNumber = !config.showResultNumber;
  },
});
// 骨骼点tag信息显示
export const toggleSkeAnchorTag = define({
  valid() {
    return true;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const { skeletonConfig } = editor.state.config;
    skeletonConfig.showAttr = !skeletonConfig.showAttr;
    editor.mainView.draw();
  },
});
export const toggleSkeAnchorNum = define({
  valid() {
    return true;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const { skeletonConfig } = editor.state.config;
    skeletonConfig.showNumber = !skeletonConfig.showNumber;
    editor.mainView.draw();
  },
});
export const toggleSkeComponentNum = define({
  valid() {
    return true;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    editor.state.config.skeletonConfig.showGraphLabel =
      !editor.state.config.skeletonConfig.showGraphLabel;
    editor.emit(Event.SKELETON_GRAPH);
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
// 辅助线
export const toggleHelpLine = define({
  valid() {
    return true;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const { config } = editor.state;
    config.helperLine.showLine = !config.helperLine.showLine;
  },
});
// 辅助圆
export const toggleHelpCircle = define({
  valid() {
    return true;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const { config } = editor.state;
    config.helperLine.showCircle = !config.helperLine.showCircle;
  },
});
// 等分线
export const toggleBisectrixLine = define({
  valid() {
    return true;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const { config } = editor.state;
    config.bisectrixLine.enable = !config.bisectrixLine.enable;
    Background.getInstance().updateEquisector();
  },
});
// 多边形绘制顺序指向显示切换
export const toggleShowPolygonArrow = define({
  valid: () => true,
  canBlocked: () => false,
  execute(editor: Editor) {
    const { config } = editor.state;
    config.showObjectDriect = [1, 2, 0][config.showObjectDriect];
    editor.mainView.draw();
  },
});
// 切换显示模式
export const switchDisplayMode = define({
  valid() {
    return true;
  },
  execute(editor: Editor) {
    const { config } = editor.state;
    config.viewType =
      config.viewType == DisplayModeEnum.MARK ? DisplayModeEnum.MASK : DisplayModeEnum.MARK;
    editor.mainView.updateBGDisplayModel();
  },
});

// 重置图片视角和缩放大小
export const resetImageZoom = define({
  valid() {
    return true;
  },
  execute(editor: Editor) {
    editor.mainView.fitBackgroundAsRatio();
  },
});

export const adjustObject = define({
  valid(editor: Editor) {
    const { selection, state } = editor;
    return (
      selection.length === 1 &&
      state.imageToolMode === ToolModelEnum.INSTANCE &&
      editor.isDefaultStatus()
    );
  },
  execute(editor: Editor, args?: any) {
    const object = editor.selection[0];
    if (!object) return;
    const rect = object.getSelfRect();
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
    if (object.isGroup()) {
      objects = object.member;
      transforms = objects.map((e) => {
        return { x: e.x() + x, y: e.y() + y };
      });
      object.setAttrs({ x: 0, y: 0 });
    } else {
      objects = [object];
      transforms = [{ x, y }];
    }
    editor.cmdManager.execute('update-transform', { objects, transforms });
  },
});

export const adjustRect = define({
  valid(editor: Editor) {
    const { selection } = editor;
    return selection.length === 1 && selection[0] instanceof Rect;
  },
  execute(editor: Editor, args?: any) {
    const rect = editor.selection[0];
    if (!rect) return;
    const { backgroundWidth, backgroundHeight } = editor.mainView;
    let { x, y, width, height } = rect.attrs;
    const up = Math.min(y, y + height);
    const down = Math.max(y, y + height);
    const left = Math.min(x, x + width);
    const right = Math.max(x, x + width);

    const keys = args.split('+');
    const decKey = keys[0];
    const key = keys[1];
    switch (key) {
      case 'up':
        if (decKey === 'shift') {
          if (up <= 0) return;
          y--;
          height++;
        } else {
          if (height <= 0) return;
          height--;
        }
        break;
      case 'down':
        if (decKey === 'shift') {
          if (height <= 0) return;
          y++;
          height--;
        } else {
          if (down >= backgroundHeight) return;
          height++;
        }
        break;
      case 'left':
        if (decKey === 'shift') {
          if (left <= 0) return;
          x--;
          width++;
        } else {
          if (width <= 0) return;
          width--;
        }
        break;
      case 'right':
        if (decKey === 'shift') {
          if (width <= 0) return;
          x++;
          width--;
        } else {
          if (right >= backgroundWidth) return;
          width++;
        }
        break;
    }
    rect.setAttrs({ x, y, width, height });
  },
});
