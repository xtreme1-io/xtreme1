import { v4 as uuid } from 'uuid';
import { IClassification } from '../type';
import { ClassUtils } from '@basicai/tool-components';
import { cloneDeep } from 'lodash';

export function saveToClassificationValue(data: any[]) {
  const values = {} as Record<string, any>;
  data.forEach((v) => {
    // 忽略老数据
    if (Array.isArray(v)) return;
    values[v.id] = {
      value: v.value,
      attributeVersion: v.attributeVersion || 1,
      id: v.id,
    };
  });
  return values;
}

export function copyClassificationValues(
  classifications: IClassification[],
  classificationValues: any[],
  setDefault: boolean = false,
) {
  const newClassifications = [] as IClassification[];
  const oldClassifications: Record<string, any> = {};
  classifications.forEach((classification) => {
    const oldClassificationVal: Record<string, any> = {};
    // classification 存在父子层级关系 不能用JSON.parse深拷贝 此处用lodash.cloneDeep
    const copyClassification = cloneDeep(classification);
    const target = classificationValues.find((e: any) => e.classificationId == classification.id);
    copyClassification.attrs.forEach((attr) => {
      const isMult = ClassUtils.isAttrValueTypeArr(attr.type);
      if (setDefault) {
        (attr.options || []).forEach((e) => {
          if (e.checked) isMult ? attr.value.push(e.name) : (attr.value = e.name);
        });
      } else {
        attr.value = isMult ? [] : '';
      }
      if (target) {
        const classificationAttributes = saveToClassificationValue(target.values);
        Object.assign(oldClassificationVal, classificationAttributes);
        if (classificationAttributes[attr.id]) attr.value = classificationAttributes[attr.id].value;
      }
    });
    newClassifications.push(copyClassification);
    if (target) {
      oldClassifications[classification.id] = {
        uuid: target.id || uuid(),
        id: target.classificationId,
        classificationVersion: target.classificationVersion || 1,
        valueMap: oldClassificationVal,
      };
    }
  });

  return {
    newClassifications,
    oldClassifications,
  };
}
