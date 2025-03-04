const Event = {
  BUSINESS_INIT: 'bussiness_init',
  FLOW_ACTION: 'flow_action',
  SCENE_CHANGE: 'scene_change', // scene切换
  SCENE_LOADED: 'scene_loaded', // scene加载完成
  OPERATION_TAB_CHANGE: 'operation_tab_change',
  // task
  TASK_PAUSE: 'task_puase', // 暂停任务
  TASK_CONTINUE: 'task_continue', // 继续任务
  SAMPLE_LOADED: 'sample_loaded',
  // 评论事件
  UPDATE_COMMENTS: 'update_comments', // 刷新评论
  DELETE_COMMENT: 'delete_comment', // 删除评论
  REPLY_COMMENT: 'reply_comment', // 打开回复评论
  FOCUS_COMMENT: 'focus_comment', // 聚焦评论
  UPDATE_COMMENT_VIEW: 'update_comment_view', // 刷新视图上的评论

  // net
  SOCKET_CONNECT_ERROR: 'Socket_Connect_Error', // webSocket连接错误

  // error收集
  ERROR_CONSOLE: 'error_console', // 控制台打印的报错信息
};

export default Event;
