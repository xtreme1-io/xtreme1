export const Event = {
  // cmd
  EXECUTE: 'execute',
  UNDO: 'undo',
  REDO: 'redo',
  RESET: 'reset',
  // action
  ACTION_START: 'action_start',
  ACTION_END: 'action_end',

  INIT: 'init', // editor init
  DRAW: 'draw',
  RESIZE: 'resize',
  ZOOM: 'zoom',
  ROTATE: 'rotate',
  TOOL_CHANGE: 'tool_change',
  HOTKEY: 'HOTKEY',
  SELECT: 'select',

  ANNOTATIONS_LOADED: 'annotations_loaded',
  ANNOTATE_CHANGE: 'annotate_change',
  ANNOTATE_TRANSFORM: 'annotate_transform',
  ANNOTATE_EDIT: 'annotate_edit',
  ANNOTATE_USER_DATA: 'annotate_user_data',
  ANNOTATE_CLEAR: 'annotate_clear',
  ANNOTATE_ADD: 'annotate_add',
  ANNOTATE_REMOVE: 'annotate_remove',
  // delete handler: args(objects, type(1: delet by hotkey;2: delete by click result list))
  ANNOTATE_HANDLE_DELETE: 'annotate_handle_delete',
  ANNOTATE_LOAD: 'annotate_load',
  ANNOTATE_VISIBLE: 'annotate_visible',
  ANNOTATE_CREATE: 'annotate_create',
  ANNOTATE_DISABLED_DRAW: 'annotate_disabled_draw',
  ANNOTATE_OBJECT_POINT: 'annotate_object_point',

  // shape-tool
  TOOL_DRAW: 'tool_draw',
  TOOL_Edit: 'tool_edit',
  TOOL_DRAW_CHANGE: 'tool_draw_change',
  TOOL_DRAW_END: 'tool_draw_end',
  UPDATE_ATTR: 'update_attr',

  // scene frame
  SCENE_LOADED: 'scene_loaded',
  FRAMES: 'frames',
  BEFORE_FRAME_CHANGE: 'before_frame-change',
  FRAME_CHANGE: 'frame_change',
  FRAME_SWITCH: 'frame_switch',
  SHOW_CLASS_INFO: 'show_class_info',
  NAME_OR_ALIAS: 'name_or_alias',

  PLAY_START: 'play_start',
  PLAY_STOP: 'play_stop',
  PLAY_FRAME_CHANGE: 'play_frame_change',
  CURRENT_TRACK_CHANGE: 'current_track_change',
  FRAME_PLAY: 'frame_play',
  FRAME_PAUSE: 'frame_pause',
  FRAME_REPLAY: 'frame_replay',
  FRAME_AUTOLOAD: 'frame_autoload',
  FRAME_PLAY_SPEED: 'frame_play_speed',

  // track
  TRACK_OBJECT_CHANGE: 'track_object_change',

  // flow
  SAVE_SUCCESS: 'save_success',
  CLASS_INITDATA: 'class_initdata',
  MODEL_LOADED: 'model_loaded',
  UPDATE_VIEW_MODE: 'update_view_mode',

  // model: time, classes, modelConfig
  MODEL_RUN: 'model_run',
  MODEL_RESULT_ADD: 'model_result_add',

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
