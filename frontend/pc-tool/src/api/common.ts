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

export async function getDataObjectBatch(dataIds: string[] | string) {
    if (!Array.isArray(dataIds)) dataIds = [dataIds];
    const batchSize = 200;
    const requests: ReturnType<typeof getDataObject>[] = [];
    while (dataIds.length > 0) {
        const batchIds = dataIds.splice(0, batchSize);
        requests.push(getDataObject(batchIds));
    }
    return Promise.all(requests).then((res) => {
        return res.reduce(
            (map, item) => {
                Object.assign(map.objectsMap, item.objectsMap || {});
                Object.assign(map.classificationMap, item.classificationMap || {});
                return map;
            },
            { objectsMap: {}, classificationMap: {}, queryTime: Date.now() },
        );
    });
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
export async function getDataClassificationBatch(dataIds: string[] | string) {
    if (!Array.isArray(dataIds)) dataIds = [dataIds];
    const batchSize = 200;
    const requests: Promise<any>[] = [];
    while (dataIds.length > 0) {
      const batchIds = dataIds.splice(0, batchSize);
      requests.push(getDataClassification(batchIds));
    }
    return Promise.all(requests).then((res) => {
      return res.reduce((map, item) => {
        return Object.assign(map, item);
      }, {});
    });
  }
export async function unlockRecord(recordId: string) {
    let url = `/api/data/unLock/${recordId}`;
    return await post(url);
}

export async function getDataStatus(dataIds: string[]) {
    const batchSize = 200;
    const requests: Promise<any>[] = [];
    let url = '/api/data/getDataStatusByIds';
    while (dataIds.length > 0) {
        const batchIds = dataIds.splice(0, batchSize);
        let argsStr = queryStr({ dataIds: batchIds });
        requests.push(get(`${url}?${argsStr}`));
    }
    return Promise.all(requests).then((res) => {
        const statusMap = {};
        res.forEach((re) => {
            re.data.forEach((item: any) => {
                statusMap[item.id] = item;
            });
        });
        return statusMap;
    });
}

export async function getInfoByRecordId(recordId: string) {
    let url = `/api/data/findDataAnnotationRecord/${recordId}`;
    let data = await get(url);
    data = data.data;
    // no data
    if (!data || !data.datas || data.datas.length === 0)
        return { dataInfos: [], isSeriesFrame: false, seriesFrameId: '' };

    let isSeriesFrame = ['FRAME_SERIES', 'SCENE'].includes(data.itemType);
    let modelRecordId = data.serialNo || '';
    const seriesFrameId = data.datas[0]?.sceneId;
    let model = undefined as IModelResult | undefined;
    if (modelRecordId) {
        model = {
            recordId: modelRecordId,
            id: '',
            version: '',
            state: '',
        };
    }

    let dataInfos: IFrame[] = [];
    (data.datas || []).forEach((config: any) => {
        dataInfos.push({
            // id: config.id,
            id: config.dataId + '',
            datasetId: config.datasetId + '',
            teamId: config.teamId + '',
            // config: [],
            // viewConfig: [],
            pointsUrl: '',
            queryTime: '',
            loadState: '',
            model: model,
            needSave: false,
            classifications: [],
            dataStatus: 'VALID',
            annotationStatus: 'NOT_ANNOTATED',
            skipped: false,
        });
    });

    let ids = dataInfos.map((e) => e.id);
    let stateMap = await getDataStatus(ids);
    dataInfos.forEach((data) => {
        let status = stateMap[data.id];
        if (!status) return;
        data.dataStatus = status.status || 'VALID';
        data.annotationStatus = status.annotationStatus || 'NOT_ANNOTATED';
    });

    return { dataInfos, isSeriesFrame, seriesFrameId };
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
        let file = config.files[0];
        let fileUrl = file.file;
        if (fileUrl.binary) fileUrl = fileUrl.binary;
        configs.push({
            dirName: config.name,
            name: file.name,
            url: fileUrl.url,
        });
    });

    return { configs, name: data[0]?.name || '' };
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
export async function getFrameSeriesData(datasetId: string, frameSeriesId: string) {
    const url = `/api/data/getDataIdBySceneIds`;
    const data = await get(url, {
        datasetId,
        sceneIds: frameSeriesId,
        // sortFiled: 'ID',
        // ascOrDesc: 'ASC',
    });

    const list = (data.data || {})[frameSeriesId] || [];
    // (list as any[]).reverse();
    if (list.length === 0) throw '';

    const dataList = [] as IFrame[];
    list.forEach((e: any) => {
        dataList.push({
            id: e,
            datasetId: datasetId,
            pointsUrl: '',
            queryTime: '',
            loadState: '',
            needSave: false,
            classifications: [],
            dataStatus: 'VALID',
            annotationStatus: 'NOT_ANNOTATED',
            skipped: false,
        });
    });
    return dataList;
    // return configs;
}
