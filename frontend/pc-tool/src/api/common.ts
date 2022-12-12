import { get, post } from './base';
import { IClassType, AttrType } from 'pc-editor';
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

let { empty, queryStr, traverseClassification2Arr } = utils;

export async function getUrl(url: string) {
    return get(url, null, { headers: { 'x-request-type': 'resource' } });
}

export async function saveObject(config: any) {
    let url = '/api/annotate/data/save';
    let data = await post(url, config);
    data = data.data || [];
    console.log(data);
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
            return utils.translateToObject(Object.assign(o.classAttributes, { backId: o.id }));
        });
        classificationMap[dataId] = classificationValues.reduce((map: any, c: any) => {
            return Object.assign(
                map,
                utils.saveToClassificationValue(c.classificationAttributes.values),
            );
        }, {});
        // e.classAttributes.uuid = e.id + '';
        // e.classAttributes.modelRun = empty(e.modelRunId) ? '' : e.modelRunId + '';
        // e.classAttributes.modelRunLabel = empty(e.modelRunNo) ? '' : e.modelRunNo + '';
        // objectsMap[dataId] = objectsMap[dataId].concat(objects);
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
    // no data
    if (!data || !data.datas || data.datas.length === 0)
        return { dataInfos: [], isSeriesFrame: false, seriesFrameId: '' };

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

    let classTypes = [] as IClassType[];
    data.forEach((config: any) => {
        let classType: IClassType = {
            id: config.id + '',
            name: config.name || '',
            // label: config.name + '-label',
            label: config.name || '',
            color: config.color || '#ff0000',
            attrs: [],
            type: '',
        };

        let attributes = config.attributes || [];
        let toolOption = config.toolTypeOptions || {};

        if (toolOption.isStandard) {
            classType.type = 'standard';
            classType.size3D = new THREE.Vector3(
                toolOption.length || 0,
                toolOption.width || 0,
                toolOption.height || 0,
            );
        } else if (toolOption.isConstraints) {
            let length, width, height;
            length = toolOption.length || [];
            width = toolOption.width || [];
            height = toolOption.height || [];
            classType.type = 'constraint';
            classType.sizeMin = new THREE.Vector3(length[0] || 0, width[0] || 0, height[0] || 0);
            classType.sizeMax = new THREE.Vector3(length[1] || 0, width[1] || 0, height[1] || 0);
        }

        if (toolOption.points) {
            classType.points = [toolOption.points, 0];
        }

        attributes.forEach((config: any) => {
            let options = (config.options || []).map((e: any) => {
                // return { value: e.name, label: e.name + '-label' };
                return { value: e.name, label: e.name };
            });
            classType.attrs.push({
                id: config.id || config.name,
                name: config.name,
                // label: config.name + '-label',
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

    return configs;
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
