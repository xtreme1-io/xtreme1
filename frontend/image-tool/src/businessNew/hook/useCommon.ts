import { OPType } from 'image-editor';
import { useInjectBSEditor } from '../context';
import { ButtonCancel, ButtonDiscard, ButtonSave } from '../configs/ui';
import pageModes from '../configs/mode';
import * as api from '../api';
import { closeTab } from '../utils';

export default function useCommon() {
  const editor = useInjectBSEditor();
  const { state } = editor;

  async function onClose() {
    if (state.modeConfig.op == OPType.VIEW) {
      state.frames.forEach((frame) => {
        frame.needSave = false;
      });
      closeTab();
      return;
    }
    let action = '';
    if (editor.needSave()) {
      action = await editor.showModal('confirm', {
        title: editor.lang('Save Changes'),
        data: {
          subContent: editor.lang('Do you want to save changes?'),
          buttons: [ButtonCancel, ButtonDiscard, ButtonSave],
        },
      });
    }
    if (action === ButtonSave.action) {
      await editor.save();
    } else if (action === ButtonDiscard.action) {
      editor.frameChangeToggle(false);
    } else if (action === ButtonCancel.action) {
      return;
    }

    if (editor.state.modeConfig.name === pageModes.execute.name) {
      await api.unlockRecord(editor.bsState.recordId);
    }
    closeTab();
  }

  return { onClose };
}
