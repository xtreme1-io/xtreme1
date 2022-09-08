import { get, post } from './base';
import { IModel, IModelClass } from '../type';

export async function getModelList() {
    let url = '/api/model/list';
    let data = await get(url);
    data = data.data || [];

    let models = [] as IModel[];
    data.forEach((e: any) => {
        if (e.datasetType !== 'IMAGE') return;
        let classes = (e.classes || []) as IModelClass[];
        //  The model of COCO has subClass
        classes = classes
            .map((item) => {
                return item.subClasses || item;
            })
            .flat(1)
            .map((e: any) => {
                return { ...e, label: e.name, value: e.code };
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
    let args = [];
    dataIds.forEach((e) => {
        args.push(`dataIds=${e}`);
    });
    args.push(`serialNo=${recordId}`);
    return await get(`${url}?${args.join('&')}`);
}

export async function runModel(config: any) {
    let url = '/api/data/modelAnnotate';
    return await post(url, config);
}
