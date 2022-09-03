import { get, post } from './base';
import { Point } from '../type';
import { empty } from '../utils';
import { AxiosRequestConfig } from 'axios';

// 获取模型列表 -- 暂时无用
export async function getModelList() {}

interface IClickSeq extends Point {
    type: string;
}
export interface IIdentify {
    crop: Point[];
    clickSeq: IClickSeq[];
    imgUrl: string;
}

// TODO 没了
export async function identifyImage(params: IIdentify, config: AxiosRequestConfig) {
    const url = '/api/dataset/annotation/object/image/identify';

    return await post(
        url,
        {
            datas: [params],
            params: {},
        },
        config,
    );
}
