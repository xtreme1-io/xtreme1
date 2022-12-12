import { ToolTypeEnum } from '../../model/classesModel';
export interface IDataStatus {
  datasetId: string;
  annotatedCount: number;
  notAnnotatedCount: number;
  invalidCount: number;
  objectCount: number;
  itemCount: number;
}

export interface IClassObject {
  classUnits: IClassUnits[];
  toolTypeUnits: IToolTypeUnits[];
}
export interface IClassUnits {
  color: string;
  name: string;
  objectAmount: number;
  toolType: ToolTypeEnum;
}
export interface IToolTypeUnits {
  objectAmount: number;
  toolType: ToolTypeEnum;
}

export interface IClassificationData {
  id: number;
  datasetId: number;
  classificationId: number;
  optionName: string;
  attributeId: string;
  optionPath: Array<string>;
  dataAmount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: null;
}
