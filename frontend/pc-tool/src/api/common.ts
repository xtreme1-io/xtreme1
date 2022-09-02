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
    let url = '/api/annotate/object/save';
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

export async function getDataObject(dataIds: string[] | string) {
    if (!Array.isArray(dataIds)) dataIds = [dataIds];

    let url = '/api/annotate/object/listByDataIds';
    let argsStr = queryStr({ dataIds });
    let data = await get(`${url}?${argsStr}`);
    data = data.data || [];

    let objectsMap = {} as Record<string, IObject[]>;
    // let objects = [] as IObject[];
    data.forEach((e: any) => {
        let dataId = e.dataId;
        objectsMap[dataId] = objectsMap[dataId] || [];

        e.classAttributes.uuid = e.id + '';
        e.classAttributes.modelRun = empty(e.modelRunId) ? '' : e.modelRunId + '';
        e.classAttributes.modelRunLabel = empty(e.modelRunNo) ? '' : e.modelRunNo + '';
        objectsMap[dataId].push(e.classAttributes);
    });
    return {
        objectsMap,
        queryTime: data.queryDate,
    };
}

export async function getDataClassification(dataIds: string[] | string) {
    if (!Array.isArray(dataIds)) dataIds = [dataIds];

    let url = `/api/annotate/data/listByDataIds`;
    let argsStr = queryStr({ dataIds });
    let data = await get(`${url}?${argsStr}`);
    data = data.data || {};
    let dataAnnotations = data.dataAnnotations || [];

    let attrsMap = {} as Record<string, Record<string, string>>;
    dataAnnotations.forEach((e: any) => {
        let dataId = e.dataId;
        attrsMap[dataId] = attrsMap[dataId] || {};
        Object.assign(attrsMap[dataId], e.classificationAttributes || {});
    });
    return attrsMap;
}

export async function unlockRecord(recordId: string) {
    let url = `/api/dataset/data/unLock/${recordId}`;
    return await post(url);
}

export async function getInfoByRecordId(recordId: string) {
    let url = `/api/data/findDataAnnotationRecord/${recordId}`;
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

    let dataInfos: IFrame[] = [];
    (data.datas || []).forEach((config: any) => {
        dataInfos.push({
            // id: config.id,
            id: config.dataId,
            datasetId: config.datasetId,
            teamId: config.teamId,
            // config: [],
            // viewConfig: [],
            pointsUrl: '',
            queryTime: '',
            // loadErr: false,
            // loaded: false,
            loadState: '',
            model: model,
            // modelId: config.modelId,
            // modelVersion: config.modelVersion,
            needSave: false,
            classifications: [],
        });
    });

    return { dataInfos, isSeriesFrame, seriesFrameId };
}

export async function saveDataClassification(config: any) {
    let url = `/api/annotate/data/save`;
    await post(url, config);
}

export async function getDataSetClassification(datasetId: string) {
    let url = `api/datasetClassification/findAll/${datasetId}`;
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

export async function getFrameSeriesData(
    datasetId: string,
    frameSeriesId: string,
    pageNo: string = '1',
    pageSize: string = '300',
) {
    let url = `/api/dataset/data/findByPage`;
    let data = await get(url, {
        datasetId,
        frameSeriesId,
        pageNo,
        pageSize,
        type: 'SINGLE_DATA',
        // sortFiled: 'ID',
        // ascOrDesc: 'ASC',
    });

    let list = data.data.list || [];
    (list as any[]).reverse();
    if (list.length === 0) throw '';

    let dataList = [] as IFrame[];
    list.forEach((e: any) => {
        dataList.push({
            id: e.id,
            datasetId: e.datasetId,
            pointsUrl: '',
            queryTime: '',
            loadState: '',
            needSave: false,
            classifications: [],
        });
    });
    return dataList;
    // return configs;
}
export async function getUserInfo() {
    let url = `/api/user/user/logged`;
    let {
        data: { user, team, roles },
    } = await get(url);
    return user;
}
export async function getDataSetInfo(datasetId: string) {
    let url = `/api/dataset/info/${datasetId}`;
    let { data } = await get(url);
    return data;
}
