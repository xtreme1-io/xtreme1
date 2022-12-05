import _ from 'lodash';
import { ToolTypeEnum } from '/@/api/business/model/classModel';

const list1 = [
  {
    id: '11',
    name: '111',
    toolType: ToolTypeEnum.POLYGON,
  },
  {
    id: '12',
    name: '444',
    toolType: ToolTypeEnum.POLYGON,
  },
  {
    id: '13',
    name: '222',
    toolType: ToolTypeEnum.POLYGON,
  },
];
const list2 = [
  {
    id: '1',
    name: '111',
    toolType: ToolTypeEnum.POLYGON,
  },
  {
    id: '2',
    name: '222',
    toolType: ToolTypeEnum.BOUNDING_BOX,
  },
  {
    id: '3',
    name: '333',
    toolType: ToolTypeEnum.KEY_POINT,
  },
];

const list3 = [
  {
    id: '11',
    name: '111',
    toolType: ToolTypeEnum.POLYGON,
  },
  {
    id: '12',
    name: '444',
    toolType: ToolTypeEnum.POLYGON,
  },
  {
    id: '13',
    name: '222',
    toolType: ToolTypeEnum.POLYGON,
  },
];
const list4 = [
  {
    id: '1',
    name: '111',
    toolType: ToolTypeEnum.POLYGON,
  },
  {
    id: '2',
    name: '222',
    toolType: ToolTypeEnum.BOUNDING_BOX,
  },
  {
    id: '3',
    name: '333',
    toolType: ToolTypeEnum.KEY_POINT,
  },
];

export const validateClassConflict = (fromOntologyList, currentList) => {
  if (fromOntologyList.length == 0) fromOntologyList = list1;
  if (currentList.length == 0) currentList = list2;

  const noConflictList = _.differenceWith(
    fromOntologyList,
    currentList,
    (leftValue: any, rightValue: any) => {
      return leftValue.name == rightValue.name && leftValue.toolType == rightValue.toolType;
    },
  );

  const conflictList = _.intersectionWith(
    fromOntologyList,
    currentList,
    (leftValue: any, rightValue: any) => {
      return leftValue.name == rightValue.name && leftValue.toolType == rightValue.toolType;
    },
  );

  return {
    noConflictList,
    conflictList,
  };
};

export const validateClassificationConflict = (fromOntologyList, currentList) => {
  if (fromOntologyList.length == 0) fromOntologyList = list3;
  if (currentList.length == 0) currentList = list4;

  const noConflictList = _.differenceBy(fromOntologyList, currentList, 'name');

  const conflictList = _.intersectionBy(fromOntologyList, currentList, 'name');

  return {
    noConflictList,
    conflictList,
  };
};
