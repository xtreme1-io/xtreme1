import { IConfirmBtn } from '../components/Modal/type';

export const ButtonCancel: IConfirmBtn = {
    type: 'primary',
    action: 'cancel',
    content: 'Cancel',
    class: 'ghost-white',
    ghost: true,
};

export const ButtonRelease: IConfirmBtn = {
    type: 'primary',
    action: 'release',
    content: 'Release',
    class: 'ghost-red',
    ghost: true,
};

export const ButtonDiscard: IConfirmBtn = {
    type: 'primary',
    action: 'discard',
    content: 'Discard',
    class: 'ghost-red',
    ghost: true,
};

export const ButtonSave: IConfirmBtn = {
    type: 'primary',
    action: 'save',
    content: 'Save',
};

export const ButtonOk: IConfirmBtn = {
    type: 'primary',
    action: 'ok',
    content: 'Ok',
};
export const ButtonRefresh: IConfirmBtn = {
    type: 'primary',
    action: 'refresh',
    content: 'Refresh',
};
