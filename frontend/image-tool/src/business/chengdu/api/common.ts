import { get, post } from './base';
import { IModelResult, IDataMeta, IClassType, IFileConfig } from '../type';
import { traverseClassification2Arr, empty } from '../utils';

enum Api {
    API = '/api',
    DATA = '/api/data',
    // DATASET_ANNOTATION = '/api/dataset/annotation',
    // DATASET_DATA = '/api/dataset/data',
    // ANNOTATION = '/api/annotation',
    DATASET_ANNOTATION = '/api/annotate',
    DATASET_DATA = '/api/data',
    ANNOTATION = '/api',
}

export async function getUrl(url: string) {
    return get(url, null, { headers: { 'x-request-type': 'resource' } });
}
// annotation -------
/**
 * 保存data的object数据　✓
 * /annotation/object/save
 * /annotate/object/save
 *  */
export async function saveObject(config: any) {
    let url = `${Api.DATASET_ANNOTATION}/object/save`;
    let data = await post(url, config);
    data = data.data || [];

    let keyMap = {} as Record<string, Record<string, string>>;
    data.forEach((e: any) => {
        let dataId = e.dataId + '';
        keyMap[dataId] = keyMap[dataId] || {};
        keyMap[dataId][e.frontId + ''] = e.id + '';
    });

    return keyMap;
}

/**
 * 根据 dataIds 查询数据标注详情（class）　✓
 * /annotation/object/listByDataIds
 * /annotate/object/listByDataIds
 *  */
export async function getDataObject(dataId: string) {
    let url = `${Api.DATASET_ANNOTATION}/object/listByDataIds`;
    let data = await get(url, { dataIds: dataId });
    data = data.data || [];

    let objects = [] as IObject[];
    (data.dataAnnotationObjects || []).forEach((e: any) => {
        e.classAttributes.uuid = e.id + '';
        e.classAttributes.modelRun = empty(e.modelRunId) ? '' : e.modelRunId + '';
        objects.push(e.classAttributes);
    });
    return {
        objects,
        queryTime: data.queryDate,
    };
}

/**
 * 保存 data 的 classification 数据　✓
 * /annotation/data/save
 * /annotate/data/save
 *  */
export async function saveDataClassification(config: any) {
    let url = `${Api.DATASET_ANNOTATION}/data/save`;
    await post(url, config);
}

/**
 * 根据 dataIds 查询 data 的 classification 数据　✓
 * /annotation/data/listByDataIds
 * /annotate/data/listByDataIds
 *  */
export async function getDataClassification(dataId: string) {
    let url = `${Api.DATASET_ANNOTATION}/data/listByDataIds`;
    let data = await get(url, { dataIds: dataId });
    data = data.data || {};
    let dataAnnotations = data.dataAnnotations || [];

    let attrsMap = {};
    dataAnnotations.forEach((e: any) => {
        Object.assign(attrsMap, e.classificationAttributes || {});
    });
    return attrsMap;
}

// data -------
/**
 * 根据ids查询数据详情　✓
 * /data/listByIds
 *  */
export async function getDataFile(dataId: string) {
    let url = `${Api.DATASET_DATA}/listByIds`;
    let data = await get(url, { dataIds: dataId });

    data = data.data || [];
    console.log('getDataFile', data);
    let configs = [] as IFileConfig[];
    data[0].content.forEach((config: any) => {
        let file = config.file;
        configs.push({
            name: config.name,
            size: +file.size,
            url: file.url,
        });
    });

    const annotationStatus = data[0].annotationStatus;
    const validStatus = data[0].status;

    return {
        info: configs[0],
        annotationStatus,
        validStatus,
    };
}
/**
 * 解除数据锁定　✓
 * /data/unLock/
 */
export async function unlockRecord(recordId: string) {
    let url = `${Api.DATASET_DATA}/unLock/${recordId}`;
    return await post(url);
}
/**
 * 根据锁定记录ID查询数据锁定记录　✓
 * /data/findDataAnnotationRecord
 *  */
export async function getInfoByRecordId(recordId: string) {
    let url = `${Api.DATASET_DATA}/findDataAnnotationRecord/${recordId}`;
    let data = await get(url);
    data = data.data;
    // 没有结果
    if (!data) return { dataInfos: [], isSeriesFrame: false, seriesFrameId: '' };

    let isSeriesFrame = data.dataType === 'FRAME_SERIES';
    let seriesFrameId = data.frameSeriesId ? data.frameSeriesId + '' : '';
    let modelRecordId = data.serialNo || '';
    let model = undefined as IModelResult | undefined;
    if (modelRecordId) {
        model = {
            recordId: modelRecordId,
            id: '',
            version: '',
            state: '',
        };
    }
    let dataInfos: IDataMeta[] = [];
    (data.datas || []).forEach((config: any) => {
        dataInfos.push({
            // id: config.id,
            dataId: config.dataId,
            datasetId: config.datasetId,
            needSave: false,
            model: model,
        } as IDataMeta);
    });

    return { dataInfos, isSeriesFrame, seriesFrameId };
}

/**
 * 根据 dataset 的 id 查询该 dataset 下所有 Classification　✓
 * /datasetClassification/findAll
 *  */
export async function getDataSetClassification(datasetId: string) {
    let url = `${Api.ANNOTATION}/datasetClassification/findAll/${datasetId}`;
    let data = await get(url);
    data = data.data || [];

    let classifications = traverseClassification2Arr(data);

    return classifications;
}
/**
 * 根据 datasetID 查询全部 class　✓
 * /datasetClass/findAll/
 *  */
export async function getDataSetClass(datasetId: string) {
    let url = `${Api.ANNOTATION}/datasetClass/findAll/${datasetId}`;
    let data = await get(url);
    data = data.data || [];

    let classTypes = [] as IClassType[];
    data.forEach((config: any) => {
        let classType: IClassType = {
            id: config.id + '',
            name: config.name || '',
            label: config.name || '',
            color: config.color || '#ff0000',
            attrs: [],
            toolType: config.toolType,
        };

        let attributes = config.attributes || [];
        // attributes = JSON.parse(attributes);

        attributes.forEach((config: any) => {
            let options = (config.options || []).map((e: any) => {
                return { value: e.name, label: e.name };
            });
            classType.attrs.push({
                name: config.name,
                label: config.name,
                required: config.required,
                type: config.type,
                options: options,
            });
        });

        classTypes.push(classType);
    });

    return classTypes;
}

/** 数据流转 */
/**
 * 根据dataId将data的状态置为无效
 * /data/flow/markAsInvalid/
 *  */
export async function setInvalid(dataId: string) {
    const url = `${Api.API}/data/flow/markAsInvalid/${dataId}`;
    await post(url);
}
/**
 * 据dataId将data的状态置为有效
 * /data/flow/markAsInvalid
 *  */
export async function setValid(dataId: string) {
    const url = `${Api.API}/data/flow/markAsValid/${dataId}`;
    await post(url);
}
/**
 * 更新数据的标注状态
 * /data/flow/submit/
 * */
export async function submit(dataId: string) {
    const url = `${Api.API}/data/flow/submit/${dataId}`;
    await post(url);
}

/**
 * modify
 * /data/annotate
 */
export async function takeRecordByData(params: any) {
    const url = `${Api.DATASET_DATA}/annotate`;
    console.log(123);
    const res = await post(url, params);
    return res;
}

/** 根据数据集ID查询标注状态数量
 * /data/getAnnotationStatusStatisticsByDatasetId
 */
export async function getAnnotationStatus(datasetId: string) {
    let url = `${Api.DATASET_DATA}/getAnnotationStatusStatisticsByDatasetId`;
    let data = await get(url, { datasetId: datasetId });

    data = data.data || [];

    return data;
}

/**
 * 根据数据ID集合查询数据状态
 */
export async function getDataStatusByIds(dataId: string) {
    let url = `${Api.DATASET_DATA}/getDataStatusByIds`;
    let data = await get(url, { dataIds: dataId });

    data = data.data || [];

    return data[0];
}