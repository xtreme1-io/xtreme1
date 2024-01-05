import { AttrType, ToolType } from './enum';

export interface IClassType {
  id: string;
  label: string;
  name: string;
  color: string;
  classVersion: number;
  attrs: IAttr[];
  toolType: ToolType;
  toolTypeOptions: IClassLimit;
  modelMapClass?: string[];
  [k: string]: any;
}

export interface IClassLimit {
  [k: string]: any;
}

export interface IAttr {
  id: string;
  name: string;
  alias: string;
  options: IAttrOption[];
  required: boolean;
  type: AttrType;
  attributeVersion?: number;
  latexExpression?: boolean;
  value?: any;
}
export interface IAttrOption {
  id: string;
  name: string;
  alias: string;
  attributes?: IAttr[];
  value?: any;
}
export interface IClassOptions {
  [k: string]: any;
}
