import { message } from 'ant-design-vue';
import qs from 'qs';
import { datasetTypeEnum } from '/@/api/business/model/datasetModel';

export const goToTool = (query: any, type?: datasetTypeEnum) => {
  const toolPath = type === datasetTypeEnum.IMAGE ? '/tool/image' : '/tool/pc';
  const BaseURL = location.host;

  // window.open(BaseURL + toolPath + '?' + qs.stringify(query));
  const oA = document.createElement('a'); //创建a标签
  oA.href = BaseURL + toolPath + '?' + qs.stringify(query); //添加 href 属性
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
  if (window.location.href.includes('dev')) {
    window.location.href = 'http://portal.alidev.beisai.com/';
  } else if (window.location.href.includes('test')) {
    window.location.href = 'http://portal.alitest.beisai.com/';
  } else {
    window.location.href = 'https://basic.ai';
  }
};

export const handleToast = (list, action) => {
  message.success(
    `${action} ${list.length > 1 ? `${list.length} members` : 'member'} successfully`,
  );
};

export const countFormat = (num) => {
  return num > 999 ? '999+' : num;
};
