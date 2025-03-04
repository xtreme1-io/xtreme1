import { useInjectBSEditor } from '../../context';
import { OPType } from 'image-editor';
import Event from '../../config/event';
import { IAction, ISignParam } from '../../type';
import pageModes from '../../config/mode';
import * as Button from '../../config/btn';
import useCommon from '../../hook/useCommon';
import useUI from '../../hook/useUI';
import useIssue from './useIssue';
import * as utils from '../../utils';
import * as api from '../../api';
import { t } from '@/lang';

export default function useHeader() {
  // const { loadClaimRecord } = useLoadState();
  const editor = useInjectBSEditor();
  const { bsState, state } = editor;
  const { taskClose } = useCommon();
  const { canEdit } = useUI();
  const { getIssueInfoFile, getBaseInfo } = useIssue();

  // 任务流程中时间是否到期
  const checkExpired = () => {
    const claim = bsState.claim;
    const nowTm = Date.now() / 1000;
    return claim?.updateTime && nowTm - claim.updateTime >= claim.remainTotalTime;
  };

  async function onTaskClose() {
    try {
      await taskClose();
    } catch (error: any) {
      editor.handleErr(error);
    }
  }

  const modeWhiteList = [pageModes.preview.name];
  const modeBlackList = [pageModes.taskReview.name];
  async function onClose() {
    if (bsState.isVisitorClaim) {
      utils.closeTab();
      return;
    }
    await editor.reportWorkTime();
    const mode = state.modeConfig.name;
    const isWhiteList = modeWhiteList.includes(mode);
    const isBlackList = modeBlackList.includes(mode);
    const isMuted = state.editorMuted && state.editorMutedMsg;
    const isView = state.modeConfig.op === OPType.VIEW;
    if (isMuted || (!isBlackList && (isView || isWhiteList))) {
      if (mode === pageModes.taskAccept.name) {
        const data = {
          taskId: Number(bsState.taskId),
          userIds: [Number(bsState.user.id)],
        };
        await api.taskAccUnlock(data);
      }
      editor.frameChangeToggle(false);
      utils.closeTab();
      return;
    }

    // 任务流
    if (bsState.isTaskFlow) {
      await onTaskClose();
      return;
    }

    // 数据流
    let action = '';
    if (editor.needSave() && canEdit()) {
      try {
        action = await editor.showModal('confirm', {
          title: t('image.SaveChanges'),
          data: {
            subContent: t('image.msgSaveChange'),
            buttons: [Button.ButtonCancel, Button.ButtonDiscard, Button.ButtonSave],
          },
        });
      } catch (error) {
        return;
      }
    }

    if (action === Button.ButtonSave.action) {
      await editor.save();
    } else if (action === Button.ButtonDiscard.action) {
      editor.frameChangeToggle(false);
    } else if (action === Button.ButtonCancel.action) {
      return;
    }

    if (editor.state.modeConfig.name === pageModes.execute.name) {
      await api.unlockRecord(editor.bsState.recordId);
    }

    utils.closeTab();
  }
  function onHelp() {
    editor.showModal('HotkeyHelp', { title: t('image.titleHelp'), width: 1000 }).catch(() => {});
  }
  function onFlowAction(action: IAction) {
    editor.emit(Event.FLOW_ACTION, action);
  }
  function onModify() {
    editor.actionManager.execute('flowModify' as any);
  }

  async function onRevise(data: any) {
    editor.emit(Event.FLOW_ACTION, 'revise', data);
  }

  async function issueHandler(data: {
    type: string;
    title: string;
    description: string;
    files: File[];
  }) {
    const { type, title, description, files = [] } = data;
    let desc = description;
    const baseInfo = getBaseInfo();
    Object.keys(baseInfo).forEach((key) => {
      desc += `\r\n${key}: ${baseInfo[key] || ''}`;
    });
    files.unshift(getIssueInfoFile()); // 将收集的数据/信息的json文件放在第一个
    const { bsState } = editor;
    const frame = editor.getCurrentFrame();
    const configs = files.map((f: any) => {
      return {
        datasetId: bsState.datasetId,
        fileName: `${f.uid || ''}_${f.name}`,
        dataId: frame.id,
        taskId: bsState.taskId || '',
        uploadSource: 'ISSUE',
      } as ISignParam;
    });
    const presignedInfo = await api.getIssuePresigned(configs);
    if (presignedInfo?.length) {
      presignedInfo.forEach((p, index) => {
        const fileURL = index > 0 ? `!${p.accessUrl}!` : p.accessUrl;
        desc += `\r\n${fileURL}`;
      });
      // 上传
      const runner = utils.multiRun({ taskN: files.length }, async (index) => {
        const img = files[index];
        const preUrl = presignedInfo[index].preSignedUrl;
        await api.uploadBufferData(preUrl, img);
      });

      await runner.promise.then(() => {
        console.log('upload completed');
      });
    }
    await api.reportIssue({ type, title, description: desc });
    editor.showMsg('success', t('image.success-submit'));
  }

  return {
    checkExpired,
    onClose,
    onHelp,
    onFlowAction,
    onModify,
    onRevise,
    issueHandler,
  };
}
