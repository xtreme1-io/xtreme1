export interface IDataStatus {
  datasetId: string;
  annotatedCount: number;
  notAnnotatedCount: number;
  invalidCount: number;
  objectCount: number;
  itemCount: number;
}

export interface IClassObject {
  id: number;
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
