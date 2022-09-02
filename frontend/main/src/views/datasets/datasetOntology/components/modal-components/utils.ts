import { ref, unref } from 'vue';
import { AttrItem, OptionItem } from './typing';
import {
  ClassItem,
  ClassificationItem,
  ClassTypeEnum,
  inputTypeEnum,
} from '/@/api/business/model/ontologyClassesModel';
/** 创建一个 option */
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

/** 创建一个 attribute */
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

/** 深拷贝 */
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

/** 获取当前的 数据 */
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

/** 根据 classification 奇偶获取属性 */
export const getClassificationSchemaName = (index) => {
  return index % 2 === 0 ? 'attributes' : 'options';
};

/** 根据 class 奇偶获取属性 */
export const getClassSchemaName = (index) => {
  if (index === 0) {
    return 'attributes';
  }
  return index % 2 === 0 ? 'attributes' : 'options';
};

/** 设置 classification   */
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
    console.log('delete', deleteIndex);
    tempData[getClassificationSchemaName(list.length)].splice(deleteIndex, 1);
  } else if (setType === 'update') {
    for (let i = 0; i < list.length - 1; i++) {
      getItem(tempData, i);
    }
    if (list.length == 0) {
      // 表明在 basic info 下
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

/** 设置 class */
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
    console.log('delete', deleteIndex);
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

/** 根据 class | classification 执行回调函数 */
export const handleMutiTabAction = (type, callback1, callback2) => {
  if (type === ClassTypeEnum.CLASS) {
    callback1();
  } else {
    callback2();
  }
};

/** 返回面包屑导航 */
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

// 尝试抽离 FormModal 内部方法

const activeTab = ref<ClassTypeEnum>(ClassTypeEnum.CLASS);
/** 获取当前 activeTab */
export const setActiveTab = (type: ClassTypeEnum) => {
  activeTab.value = type;
};
// 创建空的 attributes | options
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

// 存储当前层级
export const indexList = ref<number[]>([]);

// 设置值
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

// 下一层
export const handleAddIndex = (index: number) => {
  unref(indexList).push(index);
};
// 上一层
export const handleRemoveIndex = () => {
  unref(indexList).pop();
};

// formModal 初始化
export const handleDetail = (detail, activeTab) => {
  if (detail?.id) {
    handleMutiTabAction(
      activeTab,
      () => {
        // 回显 attributes
        classDataSchema.value = {
          attributes: (detail as ClassItem)?.attributes ? (detail as ClassItem)!.attributes : [],
        };
      },
      () => {
        // 回显 options
        dataSchema.value = {
          options: (detail as ClassificationItem)?.options
            ? (detail as ClassificationItem)!.options
            : [],
        };
      },
    );
  } else {
    classDataSchema.value = getInitClassData();
    dataSchema.value = getInitClassificationData();
  }
};

// 抽离 FormEditor 内部方法
// 新增 options | attributes
export const handleSaveForm = (value, type) => {
  // 新增
  handleSet({
    setType: 'add',
    setValue: type === 'attributes' ? attributeFactory(value) : optionFactory(value),
  });
  // -- 保存之后，如果是 AttrForm ，则立即进入
  if (type === 'attributes') {
    handleGo(0);
  }
};
// 前往点击项
export const handleGo = (index) => {
  handleAddIndex(index);
};
