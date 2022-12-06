import { ToolTypeEnum, inputTypeEnum } from '/@/api/business/model/classesModel';
import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

export interface ICLassForm {
  name: string | undefined;
  color: string;
  datasetType: datasetTypeEnum;
  toolType: ToolTypeEnum;
  isConstraints: boolean;
  isConstraintsForImage: boolean;
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

export interface IClassificationForm {
  name: string | undefined;
  inputType: inputTypeEnum;
  isRequired: boolean;
}

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

/** image constraints type */
export enum imageConstraintsEnum {
  SIZE = 'SIZE',
  AREA = 'AREA',
}

export interface IDataSchema {
  attributes?: any[];
  options?: any[];
}
