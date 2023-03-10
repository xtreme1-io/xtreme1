/** models详情页类型 */
export enum detailType {
  overview = 'OVERVIEW',
  runs = 'RUNS',
  settings = 'SETTINGS',
}

/** overview 接收数据类型 */
export interface IOverview {
  description: Nullable<string>;
  scenario: Nullable<string>;
  isType: boolean;
  classes: IClasses[];
  url?: string;
}

/** detailHeader 接收数据类型 */
export interface IHeader {
  type: string;
  name: string;
  creator: string | number;
  createTime: Date;
  quotaProgress: number;
  quotaText: string;
}

/** classes 类型 */
export interface IClasses {
  name: string;
  icon?: string;
  url?: string;
  code?: string;
  subClasses?: IClasses[];
}
