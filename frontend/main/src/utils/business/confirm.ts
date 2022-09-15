import { Modal } from 'ant-design-vue';
import { createVNode } from 'vue';
import { Icon } from '/@/components/Icon';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();

export const ModalConfirm = (desc, okHandle) => {
  Modal.confirm({
    title: () =>
      createVNode('div', null, [
        createVNode('span', null, desc || 'Are you sure you want to remove those members'),
      ]),
    icon: () =>
      createVNode(Icon, {
        icon: 'eva:info-fill',
        style: 'color: #f8e792;',
        size: '24',
      }),
    centered: true,
    okText: t('common.removeText'),
    okButtonProps: {
      danger: true,
    },
    cancelText: t('common.cancelText'),
    cancelButtonProps: {
      type: 'default',
    },
    onOk: async () => {
      okHandle();
    },
    onCancel() {},
  });
};

export const ModalConfirmCustom = (options) => {
  const { title, content, okText, okButtonProps, cancelText, cancelButtonProps, onOk, onCancel } =
    options;

  Modal.confirm({
    title: title ?? '',
    icon: () =>
      createVNode(Icon, {
        icon: 'eva:info-fill',
        style: 'color: #f8e792;',
        size: '24',
      }),
    centered: true,
    content: content ?? '',
    okText: okText ?? t('common.removeText'),
    okButtonProps: okButtonProps ?? {
      danger: true,
    },
    cancelText: cancelText ?? t('common.cancelText'),
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
  });
};
