import { ClassItem } from './classModel';
import { BasicIdParams } from '/@/api/model/baseModel';

export interface BaseTaskModel extends BasicIdParams {
  datasetId: number | string;
}

export interface TaskListItem extends BaseTaskModel {
  name: string;
}

export enum TaskStatusEnum {
  PUBLISHED = 'PUBLISHED',
  UN_PUBLISH = 'UN_PUBLISH',
  CLOSED = 'CLOSED',
}

export interface TaskDetail extends BaseTaskModel {
  name?: string;
  instruction: string;
  classList: ClassItem[];
  stageList: StageItem[];
  batchSize: number;
  maxStageTime: number;
  status: TaskStatusEnum;
  datasetHaveClass: boolean;
}

export interface StageItem {
  id?: string | number;
  datasetId: number | string;
  taskId?: number;
  order?: number;
  type: StageTypeEnum;
  isAnyone?: boolean;
  operatorIds: number[];
  tempId?: number;
}

export enum StageTypeEnum {
  ANNOTATION = 'ANNOTATION',
  REVIEW = 'REVIEW',
}
