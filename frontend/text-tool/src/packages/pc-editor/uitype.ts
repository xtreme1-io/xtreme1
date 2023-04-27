export interface IModalOption {
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
    centered?: boolean;
}

export interface ILoadingOption {
    type: 'loading' | 'error';
    content: string;
}

export type MsgType = 'error' | 'warning' | 'success';

export type RegisterFn = (name: string, modal: any) => void;
export type ModalFn = (name: string | false, option?: IModalOption) => Promise<any>;
export type MsgFn = (type: MsgType, msg: string) => void;
export type ConfirmFn = (config: IConfirmOption) => Promise<any>;
export type LoadingFn = (config: ILoadingOption | boolean) => void;
