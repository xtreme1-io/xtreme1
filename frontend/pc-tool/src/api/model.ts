import { get, post } from './base';
import { IModel } from 'pc-editor';
import { utils } from 'pc-editor';
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
    let url = `/api/data/removeModelDataResult`;
    let data = await post(url, { serialNo: recordId, dataIds });
}

export async function getModelResult(dataIds: string[], recordId: string) {
    let url = '/api/data/modelAnnotationResult';
    const query = utils.queryStr({
        serialNo: recordId,
        dataIds: dataIds,
    });
    return await get(`${url}?${query}`);
}

export async function runModel(config: any) {
    let url = '/api/data/modelAnnotate';
    return await post(url, config);
}
