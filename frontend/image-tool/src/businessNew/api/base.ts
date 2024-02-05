import axios, { AxiosRequestHeaders, AxiosRequestConfig } from 'axios';
import { BSError } from 'image-editor';

// token
export const requestConfig = {
  token:
    'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIzMDA4MCIsInRlYW1JZCI6IjUxIiwiaXNzIjoiYmFzaWMuYWkiLCJpYXQiOjE2NTI0MDc3MDcsImV4cCI6MTY1MjQ1MDkwN30.HC2tAjiDdYpjVvlnLXfNO_2_V7b0AAHrLVPm7Ox0tyuBA-c4-asQnDkbu6P4Nn1yvW2K9-8THpJEnOruA1Yf5g',
};

export function setToken(token: string) {
  requestConfig.token = token;
}

function isResource(headers: AxiosRequestHeaders) {
  // 'x-request-type': 'resource'
  return headers['x-request-type'] === 'resource';
}

// Service
const BaseURL = '';
export const Service = axios.create({
  timeout: 1000 * 60 * 20,
  baseURL: BaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

Service.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  if (!isResource(config.headers)) {
    config.headers['Authorization'] = requestConfig.token;
  }

  return config;
});

Service.interceptors.response.use(
  (response) => {
    let data = response.data;
    if (!isResource(response.config.headers || {}) && data.message) {
      return Promise.reject(new BSError('', 'Network Error'));
    }
    return data;
  },
  (error) => {
    return Promise.reject(new BSError('', 'Network Error'));
  },
);

export function get<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  return Service.request<any, T>({
    url,
    method: 'get',
    params: data,
    ...config,
  });
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  let headers = {} as AxiosRequestHeaders;

  return Service.request<any, T>({
    url,
    data,
    method: 'post',
    headers,
    ...config,
  });
}
