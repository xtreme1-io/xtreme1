import { message } from 'ant-design-vue';
import qs from 'qs';
import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

export const goToTool = (query: any, type?: datasetTypeEnum) => {
  let toolPath;
  console.log(type === datasetTypeEnum.TEXT);
  switch (type) {
    case datasetTypeEnum.IMAGE:
      toolPath = '/tool/image';
      break;
    case datasetTypeEnum.TEXT:
      toolPath = '/tool/text';
      break;
    default:
      toolPath = '/tool/pc';
      break;
  }
  if (import.meta.env.DEV) {
    switch (type) {
      case datasetTypeEnum.IMAGE:
        toolPath = 'http://localhost:3300/tool/image';
        break;
      case datasetTypeEnum.TEXT:
        toolPath = 'http://localhost:3300/tool/text';
        break;
      default:
        toolPath = 'http://localhost:3200/tool/pc';
        break;
    }
  }

  // window.open(BaseURL + toolPath + '?' + qs.stringify(query));
  const oA = document.createElement('a'); //创建a标签
  oA.href = toolPath + '?' + qs.stringify(query); //添加 href 属性
  oA.target = '_blank'; //添加 target 属性
  oA.click(); //模拟点击
};

export const getBaseUrl = () => {
  const host = location.hostname || location.host;
  const BaseURL = host.indexOf('localhost') >= 0 ? '' : 'https://' + host;

  return BaseURL;
};

export const setDatasetBreadcrumb = (name, type?) => {
  window.sessionStorage.setItem('breadcrumbTitle', name);
  if (type) {
    window.sessionStorage.setItem('breadcrumbType', type);
  }
};

export const handleGoPortal = () => {
  window.location.href = 'https://www.basic.ai';
};

export const handleToast = (list, action) => {
  message.success(
    `${action} ${list.length > 1 ? `${list.length} members` : 'member'} successfully`,
  );
};

export const countFormat = (num) => {
  return num > 999 ? '999+' : num;
};

export const formatEnum = (string) => {
  return string && string.slice
    ? string.slice(0, 1) + string.slice(1, string.length).toLowerCase().split('_').join(' ')
    : '';
};
