const Event = {
  // cmd
  EXECUTE: 'execute',
  UNDO: 'undo',
  REDO: 'redo',
  RESET: 'reset',
  // action
  ACTION_START: 'action_start',
  ACTION_END: 'action_end',

  INIT: 'init',
  DRAW: 'draw',
  RESIZE: 'resize',
  ZOOM: 'zoom',
  ROTATE: 'rotate',
  TOOL_CHANGE: 'tool_change', // 切换工具
  TOOLMODE_CHANGE: 'toolMode_change', // 工具模式切换(实例/分割)
  EDIT_CHANGE: 'edit_change', // edit-tool切换模式
  HOTKEY: 'HOTKEY',
  SELECT: 'select',
  CHANGE_RESULTLIST_SELECT: 'change_resultlist_select', // 上下切换resultList的选中结果
  SELECT_RESULT_MASK: 'select_result_mask', // 显示选中结果的mask

  ANNOTATIONS_LOADED: 'annotations_loaded',
  ANNOTATE_CHANGE: 'annotate_change',
  ANNOTATE_TRANSFORM: 'annotate_transform',
  ANNOTATE_EDIT: 'annotate_edit',
  ANNOTATE_USER_DATA: 'annotate_user_data',
  ANNOTATE_CLEAR: 'annotate_clear',
  ANNOTATE_ADD: 'annotate_add',
  ANNOTATE_REMOVE: 'annotate_remove',
  // 手动删除: 参数(objects, type(1快捷键;2列表))
  ANNOTATE_HANDLE_DELETE: 'annotate_handle_delete',
  ANNOTATE_LOAD: 'annotate_load',
  ANNOTATE_VISIBLE: 'annotate_visible',
  ANNOTATE_CREATE: 'annotate_create',
  ANNOTATE_DISABLED_DRAW: 'annotate_disabled_draw',
  ANNOTATE_OBJECT_POINT: 'annotate_object_point', // 标注对象编辑点变化
  ANNOTATE_ANCHOR_ATTR: 'annotate_anchor_attr', // 点的class属性变化

  // shape-tool
  TOOL_DRAW: 'tool_draw',
  TOOL_Edit: 'tool_edit',
  TOOL_DRAW_CHANGE: 'tool_draw_change',
  TOOL_DRAW_END: 'tool_draw_end',
  INTERACTIVE_RETRY: 'interactive_retry',
  UPDATE_ATTR: 'update_attr',
  // skeleton
  SKELETON_GRAPH: 'skeleton-graph', // 更新骨骼点组件

  FRAMES: 'frames',
  BEFORE_FRAME_CHANGE: 'before_frame-change',
  FRAME_CHANGE: 'frame_change',
  FRAME_SWITCH: 'frame_switch', // 手动切换frame, 区别于frame_change
  SHOW_CLASS_INFO: 'show_class_info',
  NAME_OR_ALIAS: 'name_or_alias',
  // 序列帧
  PLAY_START: 'play_start',
  PLAY_STOP: 'play_stop',
  PLAY_FRAME_CHANGE: 'play_frame_change',
  CURRENT_TRACK_CHANGE: 'current_track_change',
  FRAME_PLAY: 'frame_play', // 播放
  FRAME_PAUSE: 'frame_pause', // 暂停
  FRAME_REPLAY: 'frame_replay', // 重播
  FRAME_AUTOLOAD: 'frame_autoload', // 自动加载
  FRAME_PLAY_SPEED: 'frame_play_speed', // 设置倍速

  // track
  TRACK_OBJECT_CHANGE: 'track_object_change',
  TRACK_SPLIT: 'track_split', // 拆分
  TRACK_MERGE: 'track_merge', // 合并
  UPDATE_TIME_LINE: 'update_time_line',

  // flow
  SAVE_SUCCESS: 'save_success', // 数据保存成功
  CLASS_INITDATA: 'class_initdata', // class数据初始
  MODEL_LOADED: 'model_loaded', // 模型数据初始
  UPDATE_VIEW_MODE: 'update_view_mode', // 视图模式切换
  GOT_SOURCELIST: 'got_sourcelist',
  UPDATE_ACTIVE_SOURCE: 'update_active_source',

  // model: time, classes, modelConfig
  MODEL_RUN: 'model_run',
  MODEL_RESULT_ADD: 'model_result_add',
  MODEL_LOAD_SAM: 'model_load_sam', // 根据npy文件url,加载解析运行npy文件脚本
  // 跑追踪模型
  MODEL_RUN_TRACK: 'model_run_track',
  MODEL_RUN_TRACK_SUCCESS: 'model_run_track_success',
  /**issue 上报弹窗 */
  SHOW_REPORT: 'show_report',
  // mouseEvent
  DRAG_START: 'dragstart',
  DRAG_MOVE: 'dragmove',
  DRAG_END: 'dragend',
  MOUSE_DOWN: 'mousedown',
  MOUSE_UP: 'mouseup',
  MOUSE_MOVE: 'mousemove',
  MOUSE_ENTER: 'mouseenter',
  MOUSE_OVER: 'mouseover',
  MOUSE_OUT: 'mouseout',
  CLICK: 'click',
};

export default Event;
