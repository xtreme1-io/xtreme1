import { Editor, IConfirmOption, StatusType } from '../../../image-editor';
import { Modal } from 'ant-design-vue';
import { createVNode } from 'vue';

export default function injectConfirm(editor: Editor) {
  editor.showConfirm = (config = {} as IConfirmOption) => {
    const { title = '', subTitle = '', okText, okDanger, cancelText } = config;
    editor.state.status = StatusType.Confirm;
    return new Promise<void>((resolve, reject) => {
      Modal.confirm({
        // title: () => title,
        title: () =>
          createVNode(
            'div',
            {
              style: 'white-space:pre-wrap;color:#e5e5e5',
            },
            title,
          ),
        okText,
        cancelText,
        cancelButtonProps: config.cancelButtonProps,
        okButtonProps: {
          danger: okDanger,
        },
        content: () =>
          createVNode(
            'div',
            {
              style: {
                fontSize: '12px',
                color: 'rgb(161 161 161)',
                whiteSpace: 'pre-wrap',
              },
            },
            subTitle,
          ),
        onOk() {
          editor.state.status = StatusType.Default;
          resolve();
        },
        onCancel() {
          editor.state.status = StatusType.Default;
          reject();
        },
      });
    });
  };
}
