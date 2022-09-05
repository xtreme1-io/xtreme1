import { createVNode } from 'vue';
import { Modal } from 'ant-design-vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import './confirm.less';

export const ModalConfirmCustom = (options: any) => {
    const { title, content, okText, okButtonProps, cancelText, cancelButtonProps, onOk, onCancel } =
        options;

    Modal.confirm({
        title: title ?? '',
        icon: () =>
            createVNode(ExclamationCircleFilled, {
                style: {
                    color: '#F8E792',
                    transform: 'rotate(180deg)',
                },
            }),
        centered: true,
        content: content ?? '',
        okText: okText ?? 'OK',
        okButtonProps: okButtonProps ?? {
            danger: true,
        },
        cancelText: cancelText ?? 'Cancel',
        cancelButtonProps: cancelButtonProps ?? {
            type: 'default',
        },
        onOk: async () => {
            if (onOk) {
                onOk();
            }
        },
        onCancel: () => {
            if (onCancel) {
                onCancel();
            }
        },
        class: 'ModalConfirmCustom',
    });
};
