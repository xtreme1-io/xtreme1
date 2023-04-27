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
