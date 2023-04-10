import { ref, unref } from 'vue';
import { AttrItem, OptionItem } from './typing';
import {
  ontologyClassItem,
  ontologyClassificationItem,
  ClassTypeEnum,
  inputTypeEnum,
} from '/@/api/business/model/classesModel';

/** create an option */
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

/** create an attribute */
export const attributeFactory = (name) => {
  class AttributeClass {
    name: string;
    type: inputTypeEnum;
    required: boolean;
    options?: OptionItem[];
    constructor(name) {
      this.name = name;
      this.type = inputTypeEnum.RADIO;
      this.required = false;
      this.options = [];
    }
  }
  return new AttributeClass(name);
};

/** deep copy */
export function cloneDeep(parent, child) {
  child = child || {};
  for (const i in parent) {
    if (parent.hasOwnProperty(i)) {
      // Check if the current property is an object
      if (typeof parent[i] === 'object') {
        // If the current property is an object, also check if it is an array
        child[i] = Object.prototype.toString.call(parent[i]) === '[object Array]' ? [] : {};
        // recursively call extend
        cloneDeep(parent[i], child[i]);
      } else {
        child[i] = parent[i];
      }
    }
  }
  return child;
}

/** get current data */
export const getSchema = (schema, index) => {
  let data = unref(schema);
  const indexList = index.concat([]);
  if (index.length > 0) {
    if (data.options) {
      data = data.options[indexList.shift()];
    } else {
      data = data.attributes[indexList.shift()];
    }
  } else {
    return data;
  }
  return getSchema(data, indexList);
};

/** Get attributes based on classification parity */
export const getClassificationSchemaName = (index) => {
  return index % 2 === 0 ? 'attributes' : 'options';
};

/** Get attributes based on class parity */
export const getClassSchemaName = (index) => {
  if (index === 0) {
    return 'attributes';
  }
  return index % 2 === 0 ? 'attributes' : 'options';
};

/** set classification   */
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
    const deleteIndex = index[index.length - 1];
    tempData[getClassificationSchemaName(list.length)].splice(deleteIndex, 1);
  } else if (setType === 'update') {
    for (let i = 0; i < list.length - 1; i++) {
      getItem(tempData, i);
    }
    if (list.length == 0) {
      // under basic info
      tempData['options'] = [];
    } else {
      tempData[getClassificationSchemaName(list.length)][indexList[indexList.length - 1]] = {
        ...tempData[getClassificationSchemaName(list.length)][indexList[indexList.length - 1]],
        ...setValue,
      };
    }
  }
  return tempData;
};

/** set class */
export const setClassSchema = (
  schema,
  index,
  { setType, setValue }: { setType: string; setValue?: AttrItem | OptionItem },
) => {
  const indexList = index;
  let tempData = unref(schema);
  const list = indexList.map((_item, i) => {
    return getClassSchemaName(i);
  });
  function getItem(record, i) {
    tempData = record[list[i]][indexList[i]];
  }

  if (setType === 'add') {
    for (let i = 0; i < list.length; i++) {
      getItem(tempData, i);
    }
    tempData[getClassSchemaName(list.length)].push(setValue);
  } else if (setType === 'delete') {
    for (let i = 0; i < list.length - 1; i++) {
      getItem(tempData, i);
    }
    const deleteIndex = index[index.length - 1];
    tempData[getClassSchemaName(list.length - 1)].splice(deleteIndex, 1);
  } else if (setType === 'update') {
    for (let i = 0; i < list.length - 1; i++) {
      getItem(tempData, i);
    }
    tempData[getClassSchemaName(list.length - 1)][indexList[indexList.length - 1]] = {
      ...tempData[getClassSchemaName(list.length - 1)][indexList[indexList.length - 1]],
      ...setValue,
    };
  }
  return tempData;
};

/** Execute callback function according to class | classification */
export const handleMutiTabAction = (type, callback1, callback2) => {
  if (type === ClassTypeEnum.CLASS) {
    callback1();
  } else {
    callback2();
  }
};

/** Back to breadcrumbs */
export const getBreadcrumb = (schema, index, name: string[]) => {
  let data = unref(schema);
  const breadcrumbName: string[] = [...name];
  const indexList = index.concat([]);

  if (index.length > 0) {
    if (data.options && data.options.length > 0) {
      data = data.options[indexList.shift()];
    } else if (data.attributes && data.attributes.length > 0) {
      data = data.attributes[indexList.shift()];
    } else {
      return breadcrumbName.join(' / ');
    }
    breadcrumbName.push(data.name);
  } else {
    return breadcrumbName.join(' / ');
  }

  return getBreadcrumb(data, indexList, breadcrumbName);
};

const activeTab = ref<ClassTypeEnum>(ClassTypeEnum.CLASS);
/** get current activeTab */
export const setActiveTab = (type: ClassTypeEnum) => {
  activeTab.value = type;
};
// create empty attributes | options
type dataType = {
  attributes?: any[];
  options?: any[];
};
export const getInitClassData = (): dataType => {
  return { attributes: [] };
};
export const getInitClassificationData = (): dataType => {
  return { options: [] };
};
export const classDataSchema = ref(getInitClassData());
export const dataSchema = ref(getInitClassificationData());

// save the current level
export const indexList = ref<number[]>([]);

// setValue
export const handleSet = (setOption) => {
  handleMutiTabAction(
    activeTab,
    () => {
      setClassSchema(classDataSchema, indexList.value, setOption);
    },
    () => {
      setSchema(dataSchema, indexList.value, setOption);
    },
  );
};

// Next level
export const handleAddIndex = (index: number) => {
  unref(indexList).push(index);
};
// Previous level
export const handleRemoveIndex = () => {
  unref(indexList).pop();
};

// initial formModal
export const handleDetail = (detail, activeTab) => {
  if (detail?.id) {
    handleMutiTabAction(
      activeTab,
      () => {
        // echo attributes
        classDataSchema.value = {
          attributes: (detail as ontologyClassItem)?.attributes
            ? (detail as ontologyClassItem)!.attributes
            : [],
        };
      },
      () => {
        // echo options
        dataSchema.value = {
          options: (detail as ontologyClassificationItem)?.options
            ? (detail as ontologyClassificationItem)!.options
            : [],
        };
      },
    );
  } else {
    classDataSchema.value = getInitClassData();
    dataSchema.value = getInitClassificationData();
  }
};

// New options | attributes
export const handleSaveForm = (value, type) => {
  handleSet({
    setType: 'add',
    setValue: type === 'attributes' ? attributeFactory(value) : optionFactory(value),
  });
  if (type === 'attributes') {
    handleGo(0);
  }
};
export const handleGo = (index) => {
  handleAddIndex(index);
};
