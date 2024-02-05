import { AttrType } from 'image-editor';

export interface IClassificationAttr {
  classificationId: string;
  parent: string;
  parentAttr: string;
  parentValue: any;
  parentLabel?: any;
  id: string;
  type: AttrType;
  name: string;
  label?: string;
  alias?: string;
  required: boolean;
  attributeVersion?: number;
  options: {
    value: any;
    name: string;
    alias?: string;
    [k: string]: any;
  }[];
  value: any;
  isLeaf?: boolean;
  [k: string]: any;
}
export interface IClassification {
  id: string;
  uuid: string;
  name: string;
  label?: string;
  alias?: string;
  attrs: IClassificationAttr[];
  [k: string]: any;
}
