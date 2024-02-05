import { ButtonProps } from 'ant-design-vue';
import { MsgType } from './enum';

export interface IModalOption {
  [x: string]: any;
  title: string;
  width?: number;
  data?: any;
  closable?: boolean;
}
export interface IConfirmOption {
  title: string;
  subTitle: string;
  okText?: string;
  cancelText?: string;
  okDanger?: boolean;
  cancelButtonProps?: ButtonProps;
}
export interface ILoadingOption {
  type: 'loading' | 'error';
  content: string;
}
export type RegisterFn = (name: string, modal: any) => void;
export type ModalFn = (name: string | false, option?: IModalOption) => Promise<any>;
export type MsgFn = (type: MsgType, msg: string, config?: Object) => void;
export type ConfirmFn = (config: IConfirmOption) => Promise<any>;
export type LoadingFn = (config: ILoadingOption | boolean) => void;

export interface I18n {
  messages: Record<string, Record<string, any>>;
  lang: (
    module: string | Record<string, any>,
    name: string,
    args?: any[] | Record<string, any>,
  ) => string;
}
