import { get, post } from './base';
import { IModel, IModelClass } from '../type';
import { empty } from '../utils';

export async function getModelList() {
    // let url = '/api/dataset/model/findAll';
    let url = '/api/model/list';
    let data = await get(url);
    data = data.data || [];

    let models = [] as IModel[];
    data.forEach((e: any) => {
        if (e.datasetType !== 'IMAGE') return;
        let classes = (e.classes || []) as IModelClass[];
        //  COCO 模型有subClass
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

/** 清除data模型结果 */
export async function clearModel(dataIds: number[], recordId: string) {
    // let url = `/api/dataset/data/removeModelDataResult`;
    let url = `/api/data/removeModelDataResult`;
    let data = await post(url, { serialNo: recordId, dataIds });
}
/** 预标注模型结果查询 */
export async function getModelResult(dataIds: string[], recordId: string) {
    // let url = '/api/dataset/data/modelAnnotationResult';
    let url = '/api/data/modelAnnotationResult';
    let args = [];
    dataIds.forEach((e) => {
        args.push(`dataIds=${e}`);
    });
    args.push(`serialNo=${recordId}`);
    return await get(`${url}?${args.join('&')}`);
}

/**
 * 预标注模型任务提交-图片
 * /data/modelAnnotate
 *  */
export async function runModel(config: any) {
    // let url = '/api/dataset/data/modelAnnotate';
    let url = '/api/data/modelAnnotate';
    return await post(url, config);
}
