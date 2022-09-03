import axios, { AxiosRequestHeaders, AxiosRequestConfig } from 'axios';
import { BSError } from 'pc-editor';
import Code from '../config/code';

// token
export const requestConfig = {
    token: '',
};

export function setToken(token: string) {
    requestConfig.token = token;
}

function isResource(headers: AxiosRequestHeaders) {
    // 'x-request-type': 'resource'
    return headers['x-request-type'] === 'resource';
}

// Service
let host = location.hostname || location.host;
const BaseURL = host.indexOf('localhost') >= 0 ? '' : 'https://' + host.replace('tool', 'app');
// const BaseURL = 'https://app.alidev.beisai.com';
export const Service = axios.create({
    timeout: 1000 * 60 * 20, // 请求超时时间
    baseURL: BaseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 添加请求拦截器
Service.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    if (!isResource(config.headers)) {
        config.headers['Authorization'] = requestConfig.token;
    }

    return config;
});

// 添加响应拦截器
Service.interceptors.response.use(
    (response) => {
        if (response.status === 200) {
            let data = response.data;
            if (!isResource(response.config.headers || {}) && data.message) {
                return Promise.reject(new BSError('', data.message || 'Network Error'));
            }
            return data;
        } else {
            if (response.status === 401) {
                return Promise.reject(new BSError(Code.LOGIN_INVALID, 'Login Invalid'));
            } else {
                return Promise.reject(new BSError(Code.NETWORK_ERROR, 'Network Error'));
            }
        }
    },
    (error) => {
        return Promise.reject(new BSError(Code.NETWORK_ERROR, 'Network Error'));
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
