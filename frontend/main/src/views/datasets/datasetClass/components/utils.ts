import { unref } from 'vue';
import { AttrItem, OptionItem, inputType } from './typing';
import { ClassTypeEnum } from '/@/api/business/model/classModel';
export const optionFactory = (name) => {
  class OptionClass {
    name: string;
    attributes?: AttrItem[];
    constructor(name) {
      this.name = name;
      this.attributes = [];
    }
  }
  return new OptionClass(name);
};

export const attributeFactory = (name) => {
  class AttributeClass {
    name: string;
    type: inputType;
    required: boolean;
    options?: OptionItem[];
    constructor(name) {
      this.name = name;
      this.type = inputType.Radio;
      this.required = false;
      this.options = [];
    }
  }
  return new AttributeClass(name);
};

export function cloneDeep(parent, child) {
  child = child || {};
  for (const i in parent) {
    if (parent.hasOwnProperty(i)) {
      //检测当前属性是否为对象
      if (typeof parent[i] === 'object') {
        //如果当前属性为对象，还要检测它是否为数组
        //这是因为数组的字面量表示和对象的字面量表示不同
        //前者是[],而后者是{}
        child[i] = Object.prototype.toString.call(parent[i]) === '[object Array]' ? [] : {};
        //递归调用extend
        cloneDeep(parent[i], child[i]);
      } else {
        child[i] = parent[i];
      }
    }
  }
  return child;
}

export const getSchema = (schema, index) => {
  let data = unref(schema);
  const indexList = index.concat([]);
  console.log(data, indexList);
  if (index.length > 0) {
    if (data.options) {
      console.log(data.options);
      data = data.options[indexList.shift()];
    } else {
      console.log(data.attributes);
      data = data.attributes[indexList.shift()];
    }
  } else {
    return data;
  }
  return getSchema(data, indexList);
};

export const getClassificationSchemaName = (index) => {
  return index % 2 === 0 ? 'attributes' : 'options';
};

export const getClassSchemaName = (index) => {
  if (index === 0) {
    return 'attributes';
  }
  return index % 2 === 0 ? 'attributes' : 'options';
};

export const setSchema = (
  schema,
  index,
  { setType, setValue }: { setType: string; setValue?: AttrItem | OptionItem },
) => {
  // debugger;
  const indexList = index;
  let tempData = unref(schema);
  const list = indexList.map((_item, i) => {
    return getClassificationSchemaName(i + 1);
  });
  console.log(list);
  function getItem(record, i) {
    tempData = record[list[i]][indexList[i]];
  }

  if (setType === 'add') {
    for (let i = 0; i < list.length; i++) {
      getItem(tempData, i);
    }
    tempData[getClassificationSchemaName(list.length + 1)].push(setValue);
  } else if (setType === 'delete') {
    for (let i = 0; i < list.length - 1; i++) {
      getItem(tempData, i);
    }
    tempData[getClassificationSchemaName(list.length)].splice(index, 1);
  } else if (setType === 'update') {
    for (let i = 0; i < list.length - 1; i++) {
      getItem(tempData, i);
    }
    tempData[getClassificationSchemaName(list.length)][index] = {
      ...tempData[getClassificationSchemaName(list.length)][index],
      ...setValue,
    };
  }
  return tempData;
};

export const setClassSchema = (
  schema,
  index,
  { setType, setValue }: { setType: string; setValue?: AttrItem | OptionItem },
) => {
  // debugger;
  const indexList = index;
  let tempData = unref(schema);
  const list = indexList.map((_item, i) => {
    return getClassSchemaName(i);
  });
  console.log(list);
  function getItem(record, i) {
    tempData = record[list[i]][indexList[i]];
  }
  console.log(tempData);
  console.log(getClassSchemaName(list.length), getClassSchemaName(list.length + 1));
  console.log(tempData[getClassSchemaName(list.length + 1)]);
  if (setType === 'add') {
    for (let i = 0; i < list.length; i++) {
      getItem(tempData, i);
    }
    console.log(tempData);
    tempData[getClassSchemaName(list.length)].push(setValue);
  } else if (setType === 'delete') {
    for (let i = 0; i < list.length - 1; i++) {
      getItem(tempData, i);
    }
    console.log(tempData);
    tempData[getClassSchemaName(list.length - 1)].splice(index, 1);
  } else if (setType === 'update') {
    for (let i = 0; i < list.length - 1; i++) {
      getItem(tempData, i);
    }
    console.log(tempData, list.length);
    tempData[getClassSchemaName(list.length - 1)][indexList[indexList.length - 1]] = {
      ...tempData[getClassSchemaName(list.length - 1)][indexList[indexList.length - 1]],
      ...setValue,
    };
  }
  return tempData;
};

export const handleMutiTabAction = (type, callback1, callback2) => {
  if (type === ClassTypeEnum.CLASS) {
    callback1();
  } else {
    callback2();
  }
};
