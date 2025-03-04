import { BSError } from 'image-editor';
import { useInjectBSEditor } from '../context';
import * as utils from '../utils';
import * as Button from '../config/btn';
import * as api from '../api';
import { t } from '@/lang';

export default function useCommon() {
  const editor = useInjectBSEditor();
  const { bsState, state } = editor;

  async function releaseData() {
    let items = [];
    items = state.isSeriesFrame ? [state.sceneId] : state.frames.map((e) => e.id);
    await api.taskRelease(bsState.taskId, bsState.stageId, bsState.claimRecordId, items);
    state.frames.forEach((frame) => {
      frame.needSave = false;
    });
  }

  async function taskBack(callback?: () => void) {
    if (editor.needSave() && !bsState.isVisitorClaim) {
      let action = '';
      try {
        editor.autoSaveUtil.enableSave(false);
        action = await editor.showModal('confirm', {
          title: t('image.SaveChanges'),
          data: {
            subContent: t('image.msgSaveChange'),
            buttons: [Button.ButtonCancel, Button.ButtonDiscard, Button.ButtonSave],
          },
        });
      } catch (error) {
        action = '';
      }
      editor.autoSaveUtil.enableSave(true);
      if (!action || action === 'cancel') return;

      if (action === 'save') {
        await editor.save();
      } else if (action === 'discard') {
        state.frames.forEach((frame) => {
          frame.needSave = false;
        });
        await editor.reloadObjects();
      }
    }
    callback && callback();
  }

  async function taskClose(callback?: () => void) {
    let action = '';
    try {
      action = await editor.showModal('confirm', {
        title: t('image.Warning'),
        data: {
          subContent: t('image.taskReviewCloseTips'),
          buttons: [Button.ButtonCancel, Button.ButtonRelease, Button.ButtonSave],
        },
      });
    } catch (error) {
      action = '';
    }
    if (!action || action === 'cancel') return;

    await editor.reportWorkTime();
    if (action === 'save') {
      try {
        await editor.save();
      } catch (error) {
        editor.handleErr(new BSError('', 'Failed to save, please try again'));
        return;
      }
    } else if (action === 'release') {
      try {
        if (bsState.query.stageType === 'acceptance') {
          const data = {
            taskId: Number(bsState.taskId),
            userIds: [Number(bsState.user.id)],
          };
          editor.frameChangeToggle(false);
          await api.taskAccUnlock(data);
        } else if (bsState.stageId) {
          await releaseData();
        }
      } catch (error) {
        editor.handleErr(new BSError('', 'Failed to release, please try again'));
        return;
      }
    }
    utils.closeTab();
  }

  return {
    taskBack,
    taskClose,
  };
}
