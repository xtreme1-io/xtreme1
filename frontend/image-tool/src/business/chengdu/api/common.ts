import { get, post } from './base';
import { IModelResult, IDataMeta, IClassType, IFileConfig } from '../type';
import { traverseClassification2Arr, empty } from '../utils';

enum Api {
    API = '/api',
    DATA = '/api/data',
    DATASET_ANNOTATION = '/api/annotate',
    DATASET_DATA = '/api/data',
    ANNOTATION = '/api',
}

export async function getUrl(url: string) {
    return get(url, null, { headers: { 'x-request-type': 'resource' } });
}
// annotation -------
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

export async function getDataObject(dataId: string) {
    let url = `${Api.DATASET_ANNOTATION}/object/listByDataIds`;
    let data = await get(url, { dataIds: dataId });
    data = data.data || [];

    let objects = [] as any[];
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

export async function saveDataClassification(config: any) {
    let url = `${Api.DATASET_ANNOTATION}/data/save`;
    await post(url, config);
}

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
export async function unlockRecord(recordId: string) {
    let url = `${Api.DATASET_DATA}/unLock/${recordId}`;
    return await post(url);
}
export async function getInfoByRecordId(recordId: string) {
    let url = `${Api.DATASET_DATA}/findDataAnnotationRecord/${recordId}`;
    let data = await get(url);
    data = data.data;
    // no result
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

export async function getDataSetClassification(datasetId: string) {
    let url = `${Api.ANNOTATION}/datasetClassification/findAll/${datasetId}`;
    let data = await get(url);
    data = data.data || [];

    let classifications = traverseClassification2Arr(data);

    return classifications;
}

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

/** Data flow */
export async function setInvalid(dataId: string) {
    const url = `${Api.API}/data/flow/markAsInvalid/${dataId}`;
    await post(url);
}
export async function setValid(dataId: string) {
    const url = `${Api.API}/data/flow/markAsValid/${dataId}`;
    await post(url);
}
export async function submit(dataId: string) {
    const url = `${Api.API}/data/flow/submit/${dataId}`;
    await post(url);
}

export async function takeRecordByData(params: any) {
    const url = `${Api.DATASET_DATA}/annotate`;
    console.log(123);
    const res = await post(url, params);
    return res;
}

export async function getAnnotationStatus(datasetId: string) {
    let url = `${Api.DATASET_DATA}/getAnnotationStatusStatisticsByDatasetId`;
    let data = await get(url, { datasetId: datasetId });

    data = data.data || [];

    return data;
}

export async function getDataStatusByIds(dataId: string) {
    let url = `${Api.DATASET_DATA}/getDataStatusByIds`;
    let data = await get(url, { dataIds: dataId });

    data = data.data || [];

    return data[0];
}
