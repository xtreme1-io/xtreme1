import { get, post } from './base';
import { IClassType, AttrType, IResultSource, SourceType } from 'pc-editor';
import {
    IFrame,
    IFileConfig,
    IObject,
    IModel,
    IClassificationAttr,
    IClassification,
    IModelResult,
} from 'pc-editor';
import { utils } from 'pc-editor';
// import { empty, queryStr } from '../utils';
// import { traverseClassification2Arr } from '../utils/classification';
// import BSError from '../common/BSError';
import * as THREE from 'three';

let { empty, queryStr, traverseClassification2Arr, traverseClass2Arr } = utils;

export async function getUrl(url: string) {
    return get(url, null, { headers: { 'x-request-type': 'resource' } });
}

export async function saveObject(config: any) {
    let url = '/api/annotate/data/save';
    let data = await post(url, config);
    data = data.data || [];
    let keyMap = {} as Record<string, Record<string, string>>;
    data.forEach((e: any) => {
        let dataId = e.dataId;
        keyMap[dataId] = keyMap[dataId] || {};
        keyMap[dataId][e.frontId] = e.id;
    });

    return keyMap;
}

export async function getDataObject(dataIds: string[] | string) {
    if (!Array.isArray(dataIds)) dataIds = [dataIds];

    let url = '/api/annotate/data/listByDataIds';
    let argsStr = queryStr({ dataIds });
    let data = await get(`${url}?${argsStr}`);
    data = data.data || [];
    let objectsMap = {} as Record<string, IObject[]>;
    let classificationMap = {};
    // let objects = [] as IObject[];
    data.forEach((e: any) => {
        const { dataId, objects, classificationValues } = e;
        objectsMap[dataId] = objects.map((o: any) => {
            let { id, sourceId, sourceType, classId } = o;
            return utils.translateToObject(
                Object.assign({ backId: id, sourceId, sourceType, classId }, o.classAttributes),
            );
        });
        classificationMap[dataId] = classificationValues.reduce((map: any, c: any) => {
            return Object.assign(
                map,
                utils.saveToClassificationValue(c.classificationAttributes.values),
            );
        }, {});
    });
    return {
        objectsMap,
        classificationMap,
        queryTime: data.queryDate,
    };
}

export async function getDataClassification(dataIds: string[] | string) {
    if (!Array.isArray(dataIds)) dataIds = [dataIds];

    let url = `/api/annotate/data/listByDataIds`;
    let argsStr = queryStr({ dataIds });
    let data = await get(`${url}?${argsStr}`);
    // data = data.data || {};
    let dataAnnotations = data.data || [];

    let attrsMap = {} as Record<string, Record<string, string>>;
    dataAnnotations.forEach((e: any) => {
        let dataId = e.dataId;
        attrsMap[dataId] = attrsMap[dataId] || {};
        Object.assign(attrsMap[dataId], e.classificationAttributes || {});
    });
    return attrsMap;
}

export async function unlockRecord(recordId: string) {
    let url = `/api/data/unLock/${recordId}`;
    return await post(url);
}

export async function getDataStatus(dataIds: string[]) {
    let url = '/api/data/getDataStatusByIds';
    let argsStr = queryStr({ dataIds });
    let data = await get(`${url}?${argsStr}`);

    let statusMap = {};
    data.data.forEach((e: any) => {
        statusMap[e.id] = e;
    });
    return statusMap;
}

export async function getInfoByRecordId(recordId: string) {
    let url = `/api/data/findDataAnnotationRecord/${recordId}`;
    let data = await get(url);
    data = data.data;
    const resultObj = {
        dataInfos: [] as IFrame[],
        datasetId: data.datasetId,
    }
    // no data
    if (!data || !data.datas || data.datas.length === 0)
        return resultObj;

    let dataIds: string[] = [];
    (data.datas || []).forEach((config: any) => {
        resultObj.dataInfos.push({
            id: config.dataId + '',
            datasetId: config.datasetId + '',
            teamId: config.teamId + '',
            model: config.model,
            loadState: '',
            needSave: false,
            classifications: [],
            dataStatus: 'VALID',
            annotationStatus: 'NOT_ANNOTATED',
            skipped: false,
        });
        dataIds.push(config.dataId + '');
    });

    let stateMap = await getDataStatus(dataIds);

    resultObj.dataInfos.forEach((data) => {
        let status = stateMap[data.id];
        if (!status) return;
        data.dataStatus = status.status || 'VALID';
        data.annotationStatus = status.annotationStatus || 'NOT_ANNOTATED';
    });

    return resultObj;
}

export async function saveDataClassification(config: any) {
    let url = `/api/annotate/data/save`;
    await post(url, config);
}

export async function getDataSetClassification(datasetId: string) {
    let url = `/api/datasetClassification/findAll/${datasetId}`;
    let data = await get(url);
    data = data.data || [];

    let classifications = traverseClassification2Arr(data);

    return classifications;
}

export async function getDataSetClass(datasetId: string) {
    let url = `/api/datasetClass/findAll/${datasetId}`;
    let data = await get(url);
    data = data.data || [];

    let classTypes = traverseClass2Arr(data);

    return classTypes;
}

export async function getDataFile(dataId: string) {
    let url = `/api/data/listByIds`;
    let data = await get(url, { dataIds: dataId });

    data = data.data || [];

    let configs = [] as IFileConfig[];
    data[0].content.forEach((config: any) => {
        let file = config.file;
        configs.push({
            name: config.name,
            fileId: config.fileId,
            type: config.type,
            url: file.url,
            size: file.size,
        });
    });

    return { configs };
}

export async function getUserInfo() {
    let url = `/api/user/logged`;
    let { data } = await get(url);
    return data;
}
export async function getDataSetInfo(datasetId: string) {
    let url = `/api/dataset/info/${datasetId}`;
    let { data } = await get(url);
    return data;
}

export async function annotateData(config: any) {
    let url = `/api/data/annotate`;
    let data = await post(url, config);
    return data;
}

export async function getLockRecord(datasetId: string) {
    let url = `/api/data/findLockRecordIdByDatasetId`;
    let data = await get(url, { datasetId });
    return data;
}
export async function getResultSources(dataId: string) {
    let url = `/api/data/getDataModelRunResult/${dataId}`;
    // let url = `/api/dataset/dataset/getDatasetAnnotateResult/${datasetId}`;
    let data = await get(url);

    data = data.data || {};

    let sources = [] as IResultSource[];
    data.forEach((item: any) => {
        let { modelId, modelName, runRecords = [] } = item;
        runRecords.forEach((e: any) => {
            sources.push({
                name: e.runNo,
                sourceId: e.id,
                modelId: modelId,
                modelName: modelName,
                sourceType: SourceType.MODEL,
            });
        });
    });
    return sources.filter((e) => e.sourceType !== SourceType.DATA_FLOW);
}
