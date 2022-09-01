export interface BasicPageParams {
  pageNo?: number;
  pageSize?: number;
}

export interface BasicFetchResult<T> {
  list: T[];
  pageSize: number;
  pageNo: number;
  total: number;
}

export interface BasicIdParams {
  id: string | number;
}

export enum SortTypeEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}
export interface SortType {
  ascOrDesc?: SortTypeEnum;
}
