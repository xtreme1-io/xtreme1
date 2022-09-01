import {
  ClassTypeEnum,
  ToolTypeEnum,
  datasetTypeEnum,
  inputTypeEnum,
} from '/@/api/business/model/ontologyClassesModel';
import { imageConstraintsEnum } from './data';

export enum formType {
  options = 'options',
  attributes = 'attributes',
}

// export const dataProps = {
//   dataSchema: { type: Object as PropType<any> },
//   classDataSchema: { type: Object as PropType<any> },
//   handleSet: { type: Function },
//   handleAddIndex: { type: Function },
//   handleChangeTab: { type: Function },
//   handleRemoveIndex: { type: Function },
//   detail: { type: Object as PropType<any> },
//   activeTab: { type: String as PropType<ClassTypeEnum> },
//   indexList: { type: Array as PropType<number[]> },
//   type: { type: String, required: false, default: 'options' },
//   formValue: { type: Object as PropType<formType>, required: false },
//   isCenter: { type: Boolean, required: false },
//   datasetType: { type: datasetTypeEnum, required: false },
//   datasetId: { type: Number },
// };

/** props 的类型 */
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
  // 0.3.5 add
  // defaultHeight: string | undefined;
  // minHeight: string | undefined;
  // minPoints: string | undefined;
  isStandard?: boolean;
  length?: any;
  width?: any;
  height?: any;
  points?: any;
  // 0.5 add
  imageLimit: imageConstraintsEnum;
  imageLength?: any;
  imageWidth?: any;
  imageArea?: any;
}
