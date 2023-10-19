const Event = {
    UNDO: 'undo',
    REDO: 'redo',
    RESET: 'reset',
    EXECUTE: 'execute',
    SHOW_CLASS_INFO: 'show_class_info',
    POINTS_CHANGE: 'points_change',

    FLOW_ACTION: 'flow_action',
    UPDATE_RESULT_LIST: 'update_result_list',
    UPDATE_CLASS_EDIT: 'update_class_edit',
    // CLEAR_MERGE_SPLIT: 'clear_merge_split',
    // PLAY_FRAME_CHANGE: 'play_frame_change',
    PLAY_STOP: 'play_stop',
    PLAY_START: 'play_start',
    // PRE_MERGE_ACTION: 'pre_merge_action',
    // PRE_SPLIT_ACTION: 'pre_split_action',
    // UPDATE_TIME_LINE: 'update_time_line',

    FRAME_CHANGE: 'frame_change',

    ANNOTATE_TRANSFORM_CHANGE: 'annotate_transform_change',
    ANNOTATE_CHANGE: 'annotate_change',
    ANNOTATE_ADD: 'annotate_add',
    ANNOTATE_REMOVE: 'annotate_remove',
    ANNOTATE_LOAD: 'annotate_load',
    ANNOTATE_SELECT: 'annotate_select',
    ANNOTATE_CLEAR: 'annotate_clear',
    // CURRENT_TRACK_CHANGE: 'current_track_change',
    // TRACK_OBJECT_CHANGE: 'track_object_change',

    RESOURCE_LOAD_LOADING: 'resource_load_loading',
    RESOURCE_LOAD_COMPLETE: 'resource_load_complete',
    RESOURCE_LOAD_ERROR: 'resource_load_error',

    CHECK_UPDATE_FRAME_OBJECT: 'check_update_frame_object',
    CHECK_UPDATE_VIEW: 'check_update_view',
    CHECK_UPDATE_INFO: 'check_update_info',

    CURRENT_TRACK_CHANGE: 'current_track_change',

    RESULT_EXPAND_TOGGLE: 'result_expand_toggle',
    RESIZE: 'resize',
};

export default Event;
