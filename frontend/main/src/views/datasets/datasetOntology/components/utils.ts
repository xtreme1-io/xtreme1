import _ from 'lodash';

export const validateClassConflict = (fromOntologyList, currentList) => {
  if (!Array.isArray(fromOntologyList)) fromOntologyList = [];
  if (!Array.isArray(currentList)) currentList = [];

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
  if (!Array.isArray(fromOntologyList)) fromOntologyList = [];
  if (!Array.isArray(currentList)) currentList = [];

  const noConflictList = _.differenceBy(fromOntologyList, currentList, 'name');

  const conflictList = _.intersectionBy(fromOntologyList, currentList, 'name');

  return {
    noConflictList,
    conflictList,
  };
};
