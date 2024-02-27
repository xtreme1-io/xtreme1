import { BasicPageParams, BasicFetchResult, SortType } from '/@/api/model/baseModel';
import { resultFilterParam } from '/@/api/business/model/modelsModel';

export enum listTypeEnum {
  list = 'LIST',
  floder = 'DIRECTORY',
}

export enum UploadTypeEnum {
  image = 'IMAGE_COMPRESSED_PACKAGE',
  zip = 'POINT_CLOUD_COMPRESSED_PACKAGE',
}

export enum UploadFileEnum {
  DATASET = 'DATASET',
  OTHER = 'OTHER',
}

export enum CompressSourceType {
  LOCAL = 'LOCAL',
  URL = 'URL',
  MINIO = 'MINIO',
}

export enum dataTypeEnum {
  ALL = 'ALL',
  SINGLE_DATA = 'SINGLE_DATA',
  FRAME_SERIES = 'SCENE',
}

export enum SortFieldEnum {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  ANNOTATION_COUNT = 'ANNOTATION_COUNT',
  UPDATED_AT = 'UPDATED_AT',
  DATA_CONFIDENCE = 'DATA_CONFIDENCE',
}

export type ListParams = BasicPageParams;

export type CreateParams = {
  name: string;
  type: datasetTypeEnum;
  description?: string | null;
};

export type InsertUploadDataParams = {
  datasetId: number;
  files: any[];
  // fileIds: number[];
  // type: UploadTypeEnum;
};

export type InsertPointCloudParams = {
  datasetId: number;
  filePath: string;
  source: CompressSourceType;
  uploadType: UploadTypeEnum;
};

export type DatasetIdParams = {
  datasetId: number;
  frameSeriesId?: number;
};

export type MakeFrameParams = {
  dataIds: number[];
  datasetId: number;
  frameSize?: number;
};

export type MergeFrameParams = {
  datasetId: number;
  sourceDataIds: number[];
  targetFrameId: number;
};

export interface DatasetParams extends BasicPageParams, SortType {
  datasetId: Nullable<string | number>;
  type?: dataTypeEnum;
  name?: string;
  createStartTime?: number;
  createEndTime?: number;
  projectId?: number;
  classIds?: number[];
  classificationId?: number;
  sortFiled?: SortFieldEnum;
  annotationCountMin?: number;
  annotationCountMax?: number;
  frameSeriesId?: number;
}

export type DetailParams = {
  id: string;
};

export enum datasetTypeEnum {
  LIDAR_FUSION = 'LIDAR_FUSION',
  LIDAR_BASIC = 'LIDAR_BASIC',
  IMAGE = 'IMAGE',
  LIDAR = 'LIDAR',
  TEXT = 'TEXT',
}

export interface fileItem {
  id: string;
  name: string;
  originalName: string;
  path: string;
  type: string;
  size: string;
  region: string;
  bucketName: string;
  createdAt: string;
  updatedAt: string;
  mediumThumbnail?: imgUrlObj;
  largeThumbnail?: imgUrlObj;
  extraInfo?: any;
  url: string;
  renderImage?: imgUrlObj;
}

export interface imgUrlObj {
  url: string;
  extraInfo?: any;
}

export interface content {
  directoryType?: string;
  files?: fileDetail<fileItem>[];
  file?: fileItem;
  name: string;
  type: string;
}

export interface fileDetail<T> {
  file: T;
  fileId: number;
  name: string;
  type: string;
}

export interface DatasetItem {
  id: string;
  firstDataId?: string;
  datasetId?: string;
  directoryId?: string;
  displaySettings?: {};
  createdAt?: string;
  updatedAt?: string;
  content: content[];
  type: dataTypeEnum;
  name: string;
  lockedBy: Nullable<string>;
  datasetName?: string;
  splitType: string;
}

export interface DatasetListItem {
  annotationCount: number;
  classCount: number;
  createdAt: string;
  createdBy: number;
  datas: DatasetItem[];
  deletedAt: number;
  description: string;
  desensitizingStatus: number;
  id: 2;
  isDeleted: boolean;
  isSensitive: number;
  itemCount: number;
  name: string;
  type: datasetTypeEnum;
  updatedAt: string;
  updatedBy: number;
  annotatedCount: number;
  notAnnotatedCount: number;
  invalidCount: number;
}

export type GetFrameParams = {
  datasetId: number;
  name?: string;
};

export type FrameItem = {
  name: string;
  id: number;
};

export type MinioInfo = {
  id: string;
  accessKey: string;
  secretKey: string;
  endPoint: string;
};

export enum modelCode {
  PRE_LABEL = 'PRE_LABEL',
  TRACKING = 'TRACKING',
  FRONT_MIRROR_47 = 'FRONT_MIRROR_47',
  FRONT_MIRROR_16 = 'FRONT_MIRROR_16',
  COCO_80 = 'COCO_80',
}

export interface takeRecordParams {
  datasetId: number;
  dataIds: string[];
  dataType?: dataTypeEnum;
  modelId?: Nullable<number>;
  modelCode?: modelCode;
  isFilterData?: boolean;
  resultFilterParam?: Nullable<resultFilterParam>;
  operateItemType: dataTypeEnum;
}

export interface exportFileRecord {
  fileId: number;
  filePath: string;
  generatedNum: number;
  id: number;
  serialNumber: string;
  status: ExportStatus;
  totalNum: number;
  fileName: string;
}

export enum ExportStatus {
  UNSTARTED = 'UNSTARTED',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export type DatasetListGetResultModel = BasicFetchResult<DatasetListItem>;

export type DatasetGetResultModel = BasicFetchResult<DatasetItem>;

export type FrameListResult = BasicFetchResult<FrameItem>;

export interface GetPresignedParams {
  fileName?: string;
  datasetId?: string;
}

export interface ResponsePresignedParams {
  accessUrl: string;
  presignedUrl: string;
}

export enum UploadSourceEnum {
  LOCAL = 'LOCAL',
  URL = 'URL',
}

export interface UploadParams {
  fileUrl: string;
  datasetId: string;
  source: UploadSourceEnum;
  resultType?: string;
  modelId?: number;
  dataFormat?: string;
}

export enum UploadStatusEnum {
  UNSTARTED = 'UNSTARTED',
  DOWNLOADING = 'DOWNLOADING',
  DOWNLOAD_COMPLETED = 'DOWNLOAD_COMPLETED',
  PARSING = 'PARSING',
  PARSE_COMPLETED = 'PARSE_COMPLETED',
  FAILED = 'FAILED',
}
export interface ResponseUploadRecord {
  id: string;
  serialNumber: string;
  errorMessage: Nullable<string>;
  totalFileSize: string;
  downloadedFileSize: string;
  totalDataNum: string;
  parsedDataNum: string;
  status: UploadStatusEnum;
}

export enum SelectedDataSplitType {
  TRAINING = 'TRAINING',
  VALIDATION = 'VALIDATION',
  TEST = 'TEST',
  NOT_SPLIT = 'NOT_SPLIT',
}
export interface SelectedDataPa {
  dataIds: string[];
  splitType: SelectedDataSplitType;
}
export interface splitFliterParams {
  datasetId: Number;
  targetDataType?: string;
  totalSizeRatio: number;
  trainingRatio: number;
  validationRatio: number;
  testRatio: number;
  splittingBy: String;
  sortBy?: string;
  ascOrDesc?: string;
}

export interface TotalDataCountPa {
  datasetId: Number;
  targetDataType?: string;
}
