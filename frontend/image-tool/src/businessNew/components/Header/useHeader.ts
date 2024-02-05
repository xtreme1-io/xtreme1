import { useInjectBSEditor } from '../../context';
import Event from '../../configs/event';
import * as api from '../../api';
import { AnnotateStatus, FlowAction, ValidStatus } from '../../types';
import { computed } from 'vue';
import { MsgType } from 'image-editor';
import { ButtonOk } from '../../configs/ui';
import { closeTab } from '../../utils';

export default function useHeader() {
  // const { loadClaimRecord } = useLoadState();
  const editor = useInjectBSEditor();
  const { bsState, state } = editor;

  const validStatus = computed<boolean>(() => {
    const { frames, frameIndex } = state;
    const frame = frames[frameIndex];
    return frame?.validStatus == ValidStatus.vaild;
  });
  const annotateStatus = computed<boolean>(() => {
    const { frames, frameIndex } = state;
    const frame = frames[frameIndex];
    return frame?.annotationStatus == AnnotateStatus.annotated;
  });

  function onHelp() {
    editor
      .showModal('HotkeyHelp', { title: editor.lang('titleHelp'), width: 1000 })
      .catch(() => {});
  }
  async function updateDataStatus() {
    const frame = editor.getCurrentFrame();
    const res = await api.getDataStatusByIds(frame.id);
    frame.validStatus = res.status;
    frame.annotationStatus = res.annotationStatus;
  }
  async function markVaild() {
    if (bsState.doing.marking) return;
    bsState.doing.marking = true;
    const frame = editor.getCurrentFrame();
    try {
      if (validStatus.value) {
        await api.setInvalid(frame.id);
      } else {
        await api.setValid(frame.id);
      }
      await updateDataStatus();
    } catch (error) {
      console.log(error);
    }
    bsState.doing.marking = false;
  }
  async function submitReq(id: string) {
    try {
      await api.submit(id);
      await updateDataStatus();
    } catch (error) {
      console.log(error);
    }
  }
  async function onSubmit() {
    if (bsState.doing.submitting) return;
    bsState.doing.submitting = true;
    const frame = editor.getCurrentFrame();
    const hasAnnotated = annotateStatus.value || frame.needSave;
    await editor.save();
    if (validStatus.value && !hasAnnotated) {
      await editor
        .showConfirm({
          title: editor.lang('Reminder'),
          subTitle: editor.lang('submitTips'),
          okText: editor.lang('btnSubmit'),
        })
        .then(
          async () => {
            await submitReq(frame.id);
            await switchData();
          },
          () => {},
        );
    } else {
      await submitReq(frame.id);
      await switchData();
    }
    bsState.doing.submitting = false;

    async function switchData() {
      const { frameIndex, frames } = editor.state;
      if (frameIndex < frames.length - 1) {
        editor.loadFrame(frameIndex + 1);
      } else {
        const notAnnotateIndex = frames.findIndex((item) => {
          return item.annotationStatus == AnnotateStatus.unannotated;
        });
        if (notAnnotateIndex != -1) {
          editor.loadFrame(notAnnotateIndex);
        } else {
          // All Annotated
          await editor
            .showModal('confirm', {
              title: editor.lang('Reminder'),
              data: {
                content: editor.lang('Well Done!'),
                subContent: editor.lang('You have finish all the annotation!'),
                buttons: [{ ...ButtonOk, content: editor.lang('Close and release those data') }],
              },
            })
            .then(
              async () => {
                await api.unlockRecord(bsState.recordId);
                closeTab();
              },
              () => {},
            );
        }
      }
    }
  }
  async function onSkip() {
    if (bsState.doing.skip) return;
    bsState.doing.skip = true;
    if (editor.needSave()) await editor.save();

    const { frames, frameIndex } = state;
    if (frameIndex < frames.length - 1) {
      editor.loadFrame(frameIndex + 1);
    } else {
      editor.showMsg(MsgType.info, editor.lang('This is last data'));
    }
    bsState.doing.skip = false;
  }
  async function onViewToAnnotate() {
    if (bsState.doing.modify) return;
    bsState.doing.modify = true;

    const frame = editor.getCurrentFrame();
    try {
      const res = await api.takeRecordByData({
        datasetId: bsState.datasetId,
        dataIds: [frame.id],
        dataType: 'SINGLE_DATA',
      });
      console.log(res);

      const { origin, pathname } = window.location;
      window.location.href = `${origin}${pathname}?recordId=${res.data}`;
    } catch (error) {
      // DATASET_DATA_EXIST_ANNOTATE
      console.log(error);
      editor.showMsg(
        MsgType.warning,
        `Fail to modify data because it is being annotated by others`,
      );
    }

    bsState.doing.modify = false;
  }
  function onFlowAction(action: FlowAction) {
    editor.emit(Event.FLOW_ACTION, action);
  }

  return {
    onHelp,
    markVaild,
    onSubmit,
    onSkip,
    onViewToAnnotate,
    onFlowAction,
    validStatus,
    annotateStatus,
  };
}
