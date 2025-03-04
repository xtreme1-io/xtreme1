import Editor from '../../../Editor';
import { define } from '../define';
import { Cursor } from '../../../config';
import {
  LineDrawModeEnum,
  SelectToolEnum,
  ShareDrawMode,
  ToolAction,
  ToolModelEnum,
  ToolName,
} from '../../../types';
import { Event } from '../../../config';
import {
  CircleShape,
  Cuboid,
  Ellipse,
  GroupObject,
  Line,
  LineTool,
  Polygon,
  PolygonTool,
  Rect,
  Shape,
  Skeleton,
  SplineCurve,
} from '../../../ImageView/export';
import SkeletonTool from '../../../ImageView/shapeTool/SkeletonTool';
import { t } from '@/lang';

export const changeTool = define({
  valid() {
    return true;
  },
  canBlocked() {
    return false;
  },
  execute(editor: Editor, args?: any) {
    return () => {
      const tool = editor.mainView.currentDrawTool || editor.mainView.currentEditTool;
      if (tool && tool instanceof SkeletonTool && tool.object instanceof Skeleton && tool.isOnDraw)
        return;
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
    const state = editor.state;
    editor.mainView.updateSelectToolModel(state.activeTool === ToolName.default);
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

    if (type === state.activeTool) {
      // editor.mainView.disableDraw();
    } else {
      editor.mainView.enableDraw(type);
    }
  },
});

export const showPoints = define({
  valid() {
    return true;
  },
  execute(editor: Editor, type: string) {
    const config = editor.state.config;
    config.showPoints = !config.showPoints;
    editor.mainView.stage.setAttrs({ drawPoint: config.showPoints });
  },
});
export const showGroupBox = define({
  valid() {
    return true;
  },
  execute(editor: Editor, type: string) {
    const config = editor.state.config;
    config.showGroupBox = !config.showGroupBox;
    editor.mainView.stage.setAttrs({ showGroupBox: config.showGroupBox });
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

export const createGroup = define({
  valid(editor: Editor) {
    const { selection, state } = editor;
    return selection.length > 0 && state.imageToolMode === ToolModelEnum.INSTANCE;
  },
  execute(editor: Editor) {
    const { selection, state } = editor;
    let filterSelections = selection.filter((e) => !(e.isGroup() && e.groups.length > 0));
    if (selection.length !== filterSelections.length) {
      editor.showMsg('warning', t('image.groupOnlyOneGroup'));
      return;
    }
    if (!state.config.allObjectInMultipleGroups) {
      filterSelections = filterSelections.filter((e) => e.groups.length === 0);
      if (selection.length !== filterSelections.length) {
        editor.showMsg('warning', t('image.resultOnlyOneGroup'));
        return;
      }
    }

    editor.mainView.disableEdit();
    const group = editor.createObject(() => new GroupObject());
    editor.setUserDataBySelect([group]);
    editor.cmdManager.withGroup(() => {
      if (state.isSeriesFrame) {
        editor.cmdManager.execute('add-track', editor.createTrackObj(group));
      }

      editor.cmdManager.execute('move-object-index', {
        object: [...filterSelections],
        index: Infinity,
        into: group,
      });
      editor.cmdManager.execute('add-object', group);
    });
    editor.selectObject([group, ...filterSelections]);
    editor.emit(Event.SHOW_CLASS_INFO, group);
  },
});
export const dissolveGroup = define({
  valid(editor: Editor) {
    const { selection, state } = editor;
    return selection.length > 0 && state.imageToolMode === ToolModelEnum.INSTANCE;
  },
  execute(editor: Editor) {
    const { selection } = editor;
    const groups = selection.filter((e) => e.isGroup()) as GroupObject[];
    if (groups.length === 0) {
      editor.showMsg('warning', t('image.invalidOperation'));
      return;
    }
    editor.cmdManager.execute('delete-object', groups);
    editor.selectObject();
  },
});

export const changeResultListSelect = define({
  valid(editor: Editor) {
    return editor.isDefaultStatus();
  },
  execute(editor: Editor, act: any) {
    const step = act == 'up' ? -1 : 1;
    editor.emit(Event.CHANGE_RESULTLIST_SELECT, step);
  },
});

// 按点共享(限折线工具,多边形工具)
export const sharedDrawingMode = define({
  valid(editor: Editor) {
    const isInstance = editor.state.imageToolMode == ToolModelEnum.INSTANCE;
    const tool = editor.mainView.currentDrawTool;
    const isLineTool = tool instanceof LineTool || tool?.name === ToolName.line;
    return isInstance && isLineTool;
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const curDrawTool = editor.mainView.currentDrawTool;
    if (!curDrawTool) return;
    const { toolConfig } = editor.state;
    if (curDrawTool.name === ToolName.polygon) {
      toolConfig.pgs = !toolConfig.pgs || toolConfig.pgsm !== ShareDrawMode.point;
      toolConfig.pgsm = ShareDrawMode.point;
    } else if (curDrawTool.name === ToolName.line) {
      toolConfig.pls = !toolConfig.pls;
    }
    editor.mainView.sharedDrawMode();
  },
});
// 按边共享(裁剪,限多边形工具)
export const sharedClipMode = define({
  valid(editor: Editor) {
    const { config, imageToolMode } = editor.state;
    const curDrawTool = editor.mainView.currentDrawTool;
    const validTool =
      curDrawTool &&
      curDrawTool instanceof PolygonTool &&
      config.polygonMaxPoint == 0 &&
      imageToolMode == ToolModelEnum.INSTANCE;
    return Boolean(validTool);
  },
  canBlocked: () => false,
  execute(editor: Editor) {
    const { toolConfig } = editor.state;
    toolConfig.pgs = !toolConfig.pgs || toolConfig.pgsm !== ShareDrawMode.edge;
    toolConfig.pgsm = ShareDrawMode.edge;
    editor.mainView.sharedClipMode();
  },
});
export const lineToolDrawMode = define({
  valid(editor: Editor) {
    const tool = editor.mainView.currentDrawTool;
    return Boolean(tool && (tool instanceof LineTool || tool.name === ToolName.line));
  },
  canBlocked() {
    return false;
  },
  execute(editor: Editor, key: string) {
    const cfg = editor.state.toolConfig;
    if (key === 'a') {
      // 水平绘制
      cfg.lineMode =
        cfg.lineMode === LineDrawModeEnum.Horizontal
          ? LineDrawModeEnum.Default
          : LineDrawModeEnum.Horizontal;
    } else {
      // 垂直模式
      cfg.lineMode =
        cfg.lineMode === LineDrawModeEnum.Vertical
          ? LineDrawModeEnum.Default
          : LineDrawModeEnum.Vertical;
    }
    const tool = editor.mainView.currentDrawTool;
    if (tool && (tool instanceof LineTool || tool.name === ToolName.line)) {
      tool.updateHolder();
    }
    if (cfg.lineMode === LineDrawModeEnum.Default) {
      editor.visibleMessageBox(false);
    } else if (cfg.lineMode === LineDrawModeEnum.Horizontal) {
      editor.visibleMessageBox(true, t('image.Horizontal Drawing Model'));
    } else if (cfg.lineMode === LineDrawModeEnum.Vertical) {
      editor.visibleMessageBox(true, t('image.Vertical Drawing Model'));
    }
  },
});

// 实例; 分割
export const changeToolMode = define({
  valid(editor: Editor) {
    return editor.isDefaultStatus() && editor.state.ToolModeList.length > 1;
  },
  execute(editor: Editor, ...args: any) {
    const hotKeys = ['alt+1', 'alt+2'];
    const modes = [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION];
    let type = ToolModelEnum.INSTANCE;
    if (hotKeys.includes(args[0])) {
      type = modes[hotKeys.indexOf(args[0])];
    } else if (modes.includes(args[0])) {
      type = args[0];
    }
    if (editor.state.imageToolMode === type || !editor.state.ToolModeList.includes(type)) return;
    // 切换实例/分割前, 某些配置需要重置或者禁用或者设置为指定值
    editor.state.config.showSingleResult = false;
    editor.updateObjectVisible();
    editor.selectObject();

    // 切换实例/分割
    editor.state.imageToolMode = type;

    // 切换实例/分割后, 某些配置需要重置或者禁用或者设置为指定值
    editor.state.resultTypeFilter = [ToolModelEnum.INSTANCE, ToolModelEnum.SEGMENTATION];
    editor.mainView.updateShapeRoot();
    editor.state.selectToolMode = SelectToolEnum.FILL;
    if (editor.state.activeTool !== ToolName.default) selectTool.execute(editor);
    editor.mainView.updateBGDisplayModel();
    editor.emit(Event.TOOLMODE_CHANGE, type);
    const text =
      type == ToolModelEnum.INSTANCE
        ? 'Switch to view/edit Instance'
        : 'Switch to view/edit Segmentation';
    editor.showMsg('success', editor.tI(text));
  },
});
export const switchSegmentTool = define({
  valid(editor: Editor) {
    return editor.state.imageToolMode === ToolModelEnum.SEGMENTATION;
  },
  canBlocked() {
    return false;
  },
  execute(editor: Editor) {},
  end(editor) {
    editor.mainView.MaskToolManager.switchTool();
  },
});

export const copyObject = define({
  valid(editor: Editor) {
    return true;
  },
  execute(editor: Editor) {
    const object = editor.selection.find((obj) => {
      return [Line, CircleShape, Cuboid, Ellipse, Polygon, Rect, SplineCurve].some(
        (t) => obj instanceof t,
      );
    }) as Shape;
    if (object) {
      editor.currentCopy = object;
      editor.showMsg('success', t('image.copy-ok'));
    }
  },
});
export const pasteObject = define({
  valid() {
    return true;
  },
  execute(editor: Editor) {
    return _pasteObject(editor, false);
  },
});
export const pasteObjectWithClass = define({
  valid() {
    return true;
  },
  execute(editor: Editor) {
    return _pasteObject(editor, true);
  },
});
export const cloneObject = define({
  valid() {
    return true;
  },
  execute(editor: Editor) {
    const clonedObject = editor.selection.find((obj) => {
      return [Line, CircleShape, Cuboid, Ellipse, Polygon, Rect, SplineCurve].some(
        (t) => obj instanceof t,
      );
    }) as Shape;
    if (!clonedObject) return;

    const newObj = clonedObject.cloneThisShape();
    newObj.userData.trackId = undefined;
    newObj.userData.trackName = undefined;

    editor.initIDInfo(newObj);
    editor.cmdManager.withGroup(() => {
      if (editor.state.isSeriesFrame) {
        editor.cmdManager.execute('add-track', editor.createTrackObj(newObj));
      }
      editor.cmdManager.execute('add-object', newObj);
      clonedObject.groups.forEach((group) => {
        editor.cmdManager.execute('move-object-index', {
          object: newObj,
          index: Infinity,
          into: group,
        });
      });
    });
    editor.selectObject(newObj);
  },
});

function _pasteObject(editor: Editor, copyClassAndAttrs: boolean) {
  const copiedObject = editor.currentCopy;
  const event = editor.mainView.curMouseEvent;

  if (!copiedObject || !event) return;

  const newObj = copiedObject.cloneThisShape();
  newObj.userData.trackId = undefined;
  newObj.userData.trackName = undefined;
  if (!copyClassAndAttrs) {
    newObj.userData.attrs = {};
    newObj.userData.classId = void 0;
    newObj.userData.classType = void 0;
    newObj.userData.modelClass = void 0;
  }
  const transformer = editor.mainView.stage.getAbsoluteTransform().copy().invert();
  const canvasPos = transformer.point({ x: event.offsetX, y: event.offsetY });
  const sWidth = editor.mainView.backgroundWidth;
  const sHeight = editor.mainView.backgroundHeight;
  if (canvasPos.x >= 0 && canvasPos.y >= 0 && canvasPos.x <= sWidth && canvasPos.y <= sHeight) {
    const copiedRectInfo = copiedObject.getBoundRect();
    const lastCenter = {
      x: copiedRectInfo.x + copiedRectInfo.width / 2,
      y: copiedRectInfo.y + copiedRectInfo.height / 2,
    };
    const copiedObjectPosition = copiedObject.position();
    newObj.position({
      x: copiedObjectPosition.x + (canvasPos.x - lastCenter.x),
      y: copiedObjectPosition.y + (canvasPos.y - lastCenter.y),
    });
  }

  editor.initIDInfo(newObj);
  editor.cmdManager.withGroup(() => {
    if (editor.state.isSeriesFrame) {
      editor.cmdManager.execute('add-track', editor.createTrackObj(newObj));
    }
    editor.cmdManager.execute('add-object', newObj);
  });
  editor.selectObject(newObj);
}
