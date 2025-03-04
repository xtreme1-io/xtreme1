import axios, { AxiosRequestHeaders, AxiosRequestConfig } from 'axios';
import { BSError, LangType } from 'image-editor';
import { compressData2Blob, formatNull } from '@basicai/tool-components';
import qs from 'qs';

// token
export const requestConfig = {
  currentTaskId: '',
  token:
    'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIzMDA4MCIsInRlYW1JZCI6IjUxIiwiaXNzIjoiYmFzaWMuYWkiLCJpYXQiOjE2NTI0MDc3MDcsImV4cCI6MTY1MjQ1MDkwN30.HC2tAjiDdYpjVvlnLXfNO_2_V7b0AAHrLVPm7Ox0tyuBA-c4-asQnDkbu6P4Nn1yvW2K9-8THpJEnOruA1Yf5g',
  lang: LangType['en-US'],
  downloadGZIP: false,
};

export function setToken(token: string) {
  requestConfig.token = token;
}

export function setCurrentTask(taskId: string) {
  requestConfig.currentTaskId = taskId;
}

export function setRequestLang(lang: LangType) {
  requestConfig.lang = lang;
}

export function setGZIPDownload(val: boolean) {
  requestConfig.downloadGZIP = val;
}

function isResource(headers: AxiosRequestHeaders) {
  // 'x-request-type': 'resource'
  return headers['x-request-type'] === 'resource';
}

// Service
// const host = location.hostname || location.host;
// const BaseURL = host.indexOf('localhost') >= 0 ? '' : 'https://' + host.replace('tool', 'app');
const BaseURL = location.origin;
export const Service = axios.create({
  timeout: 1000 * 60 * 5, // 请求超时时间
  baseURL: BaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // `paramsSerializer`是可选方法，主要用于序列化`params`
  // (e.g. https://www.npmjs.com/package/qs, http://api.jquery.com/jquery.param/)
  paramsSerializer: function (params) {
    // axios默认是{ arrayFormat: 'brackets' }，'a[]=b&a[]=c'
    // 改成{ arrayFormat: 'comma' }，'a=b,c'
    return qs.stringify(params, { arrayFormat: 'comma' });
  },
});

// 添加请求拦截器
Service.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  // if (!isResource(config.headers)) {
  // }
  if (!isResource(config.headers)) {
    config.headers['Authorization'] = requestConfig.token;
  }
  requestConfig.currentTaskId &&
    (config.headers['X-Current-Task-Id'] = requestConfig.currentTaskId);
  config.headers['Accept-Language'] = requestConfig.lang;

  // console.log('添加请求拦截器:', config);
  if (config.data?.removeHeaderField) {
    config.data.removeHeaderField.forEach((field: string) => {
      delete config.headers?.[field];
    });
    delete config.data.removeHeaderField;
  }

  return config;
});

// 添加响应拦截器
Service.interceptors.response.use(
  (response) => {
    // console.log('=======>响应拦截器', response);
    if (response.status === 200) {
      const data = response.data;
      if (data.code && data.code !== 'OK') {
        return Promise.reject(new BSError(data.code, data.message || data));
      }
      return formatNull(data);
    } else {
      if (response.status === 401) {
        return Promise.reject(new BSError('LOGIN_INVALID', 'Login Invalid'));
      } else {
        return Promise.reject(new BSError('NETWORK_ERROR', 'Network Error'));
      }
    }
  },
  (error) => {
    return Promise.reject(new BSError('NETWORK_ERROR', error?.message || 'Network Error'));
  },
);

// 工具方法
export function get<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  return Service.request<any, T>({
    url,
    method: 'get',
    params: data,
    ...config,
  });
}

export async function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  const headers = {} as AxiosRequestHeaders;

  let reqData = data;
  if (config?.headers?.['Content-Encoding'] === 'gzip' && data) {
    reqData = await compressData2Blob(reqData, requestConfig.downloadGZIP);
  }
  return Service.request<any, T>({
    url,
    data: reqData,
    method: 'post',
    headers,
    ...config,
  });
}
