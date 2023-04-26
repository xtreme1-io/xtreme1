import { ClassTypeEnum } from '/@/api/business/model/classModel';

export enum inputType {
  Radio = 'RADIO',
  MultiSelection = 'MULTI_SELECTION',
  Dropdown = 'DROPDOWN',
  Text = 'TEXT',
  LongText = 'LONG_TEXT',
}

export enum formType {
  options = 'options',
  attributes = 'attributes',
}

export const dataProps = {
  dataSchema: { type: Object as PropType<any> },
  handleSet: { type: Function },
  handleAddIndex: { type: Function },
  handleChangeTab: { type: Function },
  handleRemoveIndex: { type: Function },
  detail: { type: Object as PropType<any> },
  activeTab: { type: String as PropType<ClassTypeEnum> },
  indexList: { type: Array as PropType<number[]> },
  type: { type: String, required: false, default: 'options' },
  formValue: { type: Object as PropType<formType>, required: false },
};

export type AttrItem = {
  name: string;
  type: inputType;
  required: boolean;
  options: OptionItem[];
};

export type OptionItem = {
  name: string;
  attributes: AttrItem[];
};
