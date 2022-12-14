export interface IClassification {
    id: string;
    name: string;
    label?: string;
    attrs: IClassificationAttr[];
}
export interface IClassificationAttr {
    classificationId: string;
    parent: string;
    parentAttr: string;
    parentValue: any;
    key: string;
    id: string;
    type: AttrType;
    name: string;
    label?: string;
    required: boolean;
    options: { value: any; label: string }[];
    value: any;
    leafFlag?: boolean;
}

export enum AttrType {
    RADIO = 'RADIO',
    MULTI_SELECTION = 'MULTI_SELECTION',
    DROPDOWN = 'DROPDOWN',
    TEXT = 'TEXT',
}

export interface IClassAttr {
    label: string;
    name: string;
    options: IClassAttr[];
    required?: boolean;
    type: AttrType;
    value: any;
}
