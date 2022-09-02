import { get, post } from './base';
import { IModel } from 'pc-editor';

export async function getModelList() {
    let url = '/api/model/list';
    let data = await get(url);
    data = data.data || [];

    let models = [] as IModel[];
    data.forEach((e: any) => {
        if (e.isInteractive || e.datasetType === 'IMAGE') return;
        // let classes = JSON.parse(e.classes || '[]');
        let classes = (e.classes || []).map((e: any) => {
            return { label: e.name, value: e.code };
        });
        models.push({
            id: e.id + '',
            name: e.name,
            version: e.version,
            code: e.modelCode,
            classes,
        });
    });

    return models;
}

export async function clearModel(dataIds: number[], recordId: string) {
    let url = `/api/dataset/data/removeModelDataResult`;
    let data = await post(url, { serialNo: recordId, dataIds });
}

export async function getModelResult(dataIds: string[], recordId: string) {
    let url = '/api/dataset/data/modelAnnotationResult';
    let args = [];
    dataIds.forEach((e) => {
        args.push(`dataIds=${e}`);
    });
    args.push(`serialNo=${recordId}`);
    return await get(`${url}?${args.join('&')}`);
}

export async function runModel(config: any) {
    let url = '/api/dataset/data/modelAnnotate';
    return await post(url, config);
}

export async function runModelTrack(config: any) {
    let url = '/api/dataset/data/modelTracing';
    return await post(url, config);
}
