import { EventCode } from '@basicai/tool-components';
import SocketManager from '.';
import { closeTab, refreshTab } from '../../utils';
import { IConfirmBtn } from '../../components/Modal/type';
import * as Button from '../../config/btn';

export type IMsgAction = {
  code: EventCode;
  valid: (tool: SocketManager, data: IMsgBody) => boolean | undefined;
  execute: (tool: SocketManager, data: IMsgBody) => Promise<any> | void;
};
export type IMsgBody = {
  code: EventCode;
  content: Record<string, string>;
  title: Record<string, string>;
  payload: any;
  teamId: string;
  buttons?: IConfirmBtn[];
};
export const defaultBtns = [Button.ButtonOk];

export const codeEvents: IMsgAction[] = [
  {
    code: EventCode.PAUSE_TASK_WORKING_USER,
    valid: (tool: SocketManager, data: IMsgBody) => {
      return checkTask(tool, data);
    },
    execute: async (tool: SocketManager, data: IMsgBody) => {
      data.buttons = [{ type: 'primary', action: 'save_quit', content: 'Save and Quit' }];
      await tool.showModal(data);
      await tool.editor.saveTaskFlow(undefined, { isForceSave: true });
      closeTab();
    },
  },
  {
    code: EventCode.REASSIGN_DATA_WORKING_USER, // 任务重新分配
    valid: (tool: SocketManager, data: IMsgBody) => {
      return checkTaskItem(tool, data);
    },
    execute: async (tool: SocketManager, data: IMsgBody) => {
      await tool.showModal(data);
      closeTab();
    },
  },
  {
    code: EventCode.UNLOCK_DATA_WORKING_USER,
    valid: (tool: SocketManager, data: IMsgBody) => {
      const _datasetId = data.payload?.datasetId;
      const { isTaskFlow, datasetId } = tool.editor.bsState;
      return !isTaskFlow && datasetId == _datasetId;
    },
    execute: async (tool: SocketManager, data: IMsgBody) => {
      const { dataIds = [] } = data.payload || {};
      const { state } = tool.editor;
      const flag = state.frames.some((frame) => dataIds.includes(frame.id));
      if (flag) {
        await tool.showModal(data);
        tool.editor.state.frames.forEach((f) => (f.needSave = false));
        closeTab();
      }
    },
  },
  {
    code: EventCode.ACC_DATA_UNLOCK,
    valid: (tool: SocketManager, data: IMsgBody) => {
      return checkTaskItem(tool, data);
    },
    execute: async (tool: SocketManager, data: IMsgBody) => {
      data.buttons = [Button.ButtonCancel, Button.ButtonRefresh];
      await tool.showConfirm(data).then(
        () => {
          refreshTab();
        },
        () => {},
      );
    },
  },
  {
    code: EventCode.ACC_DATA_PROCESSED,
    valid: (tool: SocketManager, data: IMsgBody) => {
      return checkTaskItem(tool, data);
    },
    execute: async (tool: SocketManager, data: IMsgBody) => {
      if (tool.editor.bsState.doing.accepting || tool.editor.bsState.doing.rejecting) return;
      data.buttons = [Button.ButtonCancel, Button.ButtonRefresh];
      await tool.showConfirm(data).then(
        () => {
          refreshTab();
        },
        () => {},
      );
    },
  },
];
// 是否是我当前的任务
function checkTask(tool: SocketManager, data: IMsgBody) {
  const editor = tool.editor;
  const { bsState } = editor;
  const isCurTask = bsState.isTaskFlow && bsState.taskId == data.payload?.taskId;
  return isCurTask;
}

// 检测推送消息中的任务是否是我当前的任务以及涉及到的itemIds是否包含我正在操作的数据
function checkTaskItem(tool: SocketManager, data: IMsgBody) {
  if (!checkTask(tool, data)) return false;
  const editor = tool.editor;
  const { state } = editor;
  const _itemId: number[] = data.payload?.itemIds || [];
  let _myItemIds: number[] = []; // 我正在操作的数据被强制其他操作了的itemids
  if (state.isSeriesFrame) {
    const sceneIds = state.sceneIds.map((id) => id + '');
    _myItemIds = _itemId.filter((id) => sceneIds.includes(String(id)));
  } else {
    const dataIds = state.frames.map((e) => e.id + '');
    _myItemIds = _itemId.filter((id) => dataIds.includes(String(id)));
  }
  data.payload.itemIds = _myItemIds;
  return _myItemIds.length > 0;
}
