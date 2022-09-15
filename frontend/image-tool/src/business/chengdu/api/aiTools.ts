import { get, post } from './base';
import { Point } from '../type';
import { AxiosRequestConfig } from 'axios';

export async function getModelList() {}

interface IClickSeq extends Point {
    type: string;
}
export interface IIdentify {
    crop: Point[];
    clickSeq: IClickSeq[];
    imgUrl: string;
}

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
