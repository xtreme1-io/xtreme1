import { UIType } from 'image-editor';
import { ButtonProps } from 'ant-design-vue';

export interface IConfirmBtn extends ButtonProps {
  action: string;
  content: string;
  class?: string;
}
export interface IConfirmProps {
  content?: string;
  subContent?: string;
  buttons: IConfirmBtn[];
}

export const BsUIType = {
  ...UIType,
  flowSave: 'flowSave',
  markValid: 'markValid',
  skip: 'skip',
  submit: 'submit',
  modify: 'modify',
};

export type IBsUIType = keyof typeof BsUIType;
export const allUI = Object.keys(BsUIType) as IBsUIType[];

export const baseViewUI = [BsUIType.setting, BsUIType.info] as IBsUIType[];

export const baseEditUI = [
  ...baseViewUI,
  BsUIType.edit,
  BsUIType.tool_rect,
  BsUIType.tool_polygon,
  BsUIType.tool_line,
  BsUIType.tool_keyPoint,
  BsUIType.model,
] as IBsUIType[];

export const ButtonCancel: IConfirmBtn = {
  type: 'primary',
  action: 'cancel',
  content: 'Cancel',
  class: 'ghost-white',
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
