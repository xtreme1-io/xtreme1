import { AttrType, IClassType } from 'image-editor';
import { IClassification, IClassificationAttr } from '../types';
import { cloneDeep } from 'lodash';

export function isAttrTypeMulti(type: string) {
  switch (type) {
    case AttrType.RANK:
    case AttrType.MULTI_SELECTION:
      return true;
    case AttrType.DROPDOWN:
    case AttrType.RADIO:
    case AttrType.TEXT:
    default:
      return false;
  }
}
export function parseClassesFromBackend(data: any[]) {
  const classTypes = [] as IClassType[];

  data.forEach((config: any) => {
    const classType: IClassType = {
      id: config.id + '',
      name: config.name || '',
      label: config.alias || '',
      color: config.color || '#ff0000',
      classVersion: config.version || 1,
      // attrs: [],
      attrs: config.attributes || [],
      toolType: config.toolType,
      toolTypeOptions: config.toolTypeOptions || {},
    };

    classTypes.push(classType);
  });

  return classTypes;
}

export function traverseClassification2Arr(data: any[]) {
  let classifications = [] as IClassification[];

  data.forEach((e: any) => {
    let classificationId = e.id + '';
    let classification: IClassification = {
      id: classificationId,
      uuid: '',
      name: e.name,
      alias: e.alias,
      attrs: [],
    };
    const options = e.attribute?.options || [];
    let classificationAttr: IClassificationAttr = {
      id: e.attribute.id,
      classificationId,
      parent: '',
      parentValue: '',
      parentAttr: e.name,
      type: e.inputType,
      name: e.name,
      alias: e.alias,
      value: isAttrTypeMulti(e.inputType) ? [] : '',
      required: e.isRequired,
      options: options.map((e: any) => {
        return { value: e.name, ...e };
      }),
    };

    classification.attrs.push(classificationAttr);
    options.forEach((option: any) => {
      traverseOption(classification, option, classificationAttr.id, e.name);
    });
    classifications.push(classification);
  });

  return classifications;

  function traverseOption(
    classification: IClassification,
    option: any,
    parent: string,
    parentAttr: string,
  ) {
    if (!option.attributes || option.attributes.length === 0) return;

    option.attributes.forEach((attr: any) => {
      let name = attr.name;
      let classificationAttr: IClassificationAttr = {
        id: attr.id,
        key: `${parent}[${option.name}]-${name}`,
        classificationId: classification.id,
        parent,
        parentAttr,
        parentValue: option.name,
        type: attr.type,
        name,
        alias: attr.alias,
        value: isAttrTypeMulti(attr.type) ? [] : '',
        required: attr.required,
        options: attr.options.map((e: any) => {
          return { value: e.name, ...e };
        }),
      };
      classification.attrs.push(classificationAttr);
      (attr.options || []).forEach((option: any) => {
        traverseOption(classification, option, classificationAttr.id, name);
      });
    });
  }
}

export function classificationAssign(baseArr: IClassification[], values: any[]) {
  const returnArr = cloneDeep(baseArr);
  const valuesMap: Record<string, any> = {};
  values.forEach((e: any) => {
    const attrsValues = e.classificationAttributes.values;
    attrsValues.forEach((attr: any) => {
      valuesMap[attr.id] = attr.value;
    });
  });
  returnArr.forEach((e) => {
    e.attrs?.forEach((e) => {
      if (valuesMap[e.id]) e.value = valuesMap[e.id];
    });
  });
  return returnArr;
}
