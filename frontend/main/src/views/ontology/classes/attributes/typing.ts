import { ClassTypeEnum, ToolTypeEnum, inputTypeEnum } from '/@/api/business/model/classesModel';
import { imageConstraintsEnum } from './data';
import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

export enum formType {
  options = 'options',
  attributes = 'attributes',
}

/** the type of props */
export type dataProps = {
  dataSchema?: any;
  classDataSchema?: any;
  handleSet?: Function;
  handleAddIndex?: Function;
  handleRemoveIndex?: Function;
  handleChangeTab?: Function;
  detail?: any;
  activeTab?: ClassTypeEnum;
  indexList?: number[];
  type?: string;
  formValue?: formType;
  isCenter?: boolean;
  datasetType?: datasetTypeEnum;
  datasetId?: number;
};

export type AttrItem = {
  name: string;
  type: inputTypeEnum;
  required: boolean;
  options: OptionItem[];
};

export type OptionItem = {
  name: string;
  attributes: AttrItem[];
};

export interface BaseForm {
  name: string | undefined;
  color: string;
  datasetType: datasetTypeEnum;
  toolType: ToolTypeEnum;
  isConstraints: boolean;
  isConstraintsForImage: boolean;
  inputType: inputTypeEnum;
  isRequired: boolean;
  isStandard?: boolean;
  length?: any;
  width?: any;
  height?: any;
  points?: any;
  imageLimit: imageConstraintsEnum;
  imageLength?: any;
  imageWidth?: any;
  imageArea?: any;
}

export enum attributeOptionEnum {
  TREE_CLICK = 'tree_click',
  FORM_UPDATE = 'form_update',
  BACK = 'back',
  NEXT = 'next',
  CONFIRM = 'confirm',
  CLOSE = 'close',
}
