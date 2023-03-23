import { IObject, IDataMeta, IModelResult, AnnotateObject } from '../type';
import Tool from './Tool';
import * as api from '../api';
import * as utils from '../utils';
import { Event, ICmdName, ICmdOption } from 'editor';
import { isArray } from 'lodash';
import { convertModelRunResult } from '../utils';

let timer: any;

export default class DataManager {
    tool: Tool;
    dataMap: Record<string, any[]> = {};
    modelMap: Record<string, IObject[]> = {};
    constructor(tool: Tool) {
        this.tool = tool;
        this.initEvent();
    }

    initEvent() {
        // this.tool.editor.on(Event.ADD_OBJECT, () => {
        //     this.handleEditorResultChange();
        // });
        this.tool.editor.on(Event.ADD_OBJECT, (data: any) => {
            let object = data?.data?.object;
            if (object) {
                this.onEditorAdd(object.toJSON());
            }
        });
        this.tool.editor.on(Event.REMOVE_OBJECT, (data: any) => {
            let ids = data?.data?.removed || [];
            let { dataList, dataIndex } = this.tool.state;
            let dataInfo = dataList[dataIndex];
            if (!dataInfo) return;
            let allObjects = this.getDataObject(dataInfo.dataId) || [];
            this.onEditorRemove(allObjects.filter((e) => ids.indexOf(e.uuid) >= 0));
        });
        this.tool.editor.on(Event.DIMENSION_CHANGE, (data: any) => {
            let object = data?.data;
            let { dataList, dataIndex } = this.tool.state;
            let dataInfo = dataList[dataIndex];
            if (!dataInfo || !object) return;
            let allObjects = this.getDataObject(dataInfo.dataId) || [];
            let index = allObjects.findIndex((item) => item.uuid == object.uuid);
            if (index > 0) {
                allObjects[index] = object.toJSON();
                this.setDataObject(dataInfo.dataId, allObjects);
            }
        });
        [
            Event.ADD_OBJECT,
            Event.CLEAR_DATA,
            Event.DIMENSION_CHANGE,
            Event.REMOVE_OBJECT,
            Event.USER_DATA_CHANGE,
        ].forEach((evt) => {
            this.tool.editor.on(evt, () => {
                this.handleEditorResultChange();
            });
        });
        // this.tool.editor.cmdManager.addEventListener(Event.EXECUTE, (data) => {
        //     this.handleEditorCmd(data.data.cmd, 'execute');
        // });
        this.tool.editor.cmdManager.addEventListener(Event.REDO, (data) => {
            this.handleEditorCmd(data.data.cmd, 'redo');
        });
        this.tool.editor.cmdManager.addEventListener(Event.UNDO, (data) => {
            this.handleEditorCmd(data.data.cmd, 'undo');
        });
    }
    handleEditorResultChange() {
        let { dataList, dataIndex } = this.tool.state;
        let curData = dataList[dataIndex];
        // // let allObjects = this.getDataObject(curData.dataId) || [];
        // let objects = this.tool.editor.getObjects();
        if (curData) curData.needSave = true;
        // // allObjects.push(...objects);
        // this.setDataObject(curData.dataId, objects);
    }
    handleEditorCmd(cmd: any, cmdType: 'undo' | 'redo' | 'execute') {
        let { dataList, dataIndex } = this.tool.state;
        let curData = dataList[dataIndex];

        let name = cmd.name as ICmdName;
        // if (name === 'add-object') {
        //     let data = cmd.data as any;
        //     if (cmdType === 'undo') {
        //         this.onEditorRemove(data);
        //     } else {
        //         this.onEditorAdd(data);
        //     }
        //     // console.log('handleEditorCmd', name, cmdType);
        // } else
        if (name === 'delete-object') {
            let data = cmd.data as any;
            if (cmdType === 'undo') {
                this.onEditorAdd(data);
            } else {
                this.onEditorRemove(data);
            }
            // console.log('handleEditorCmd', name, cmdType);
        } else if (
            name === 'update-2d-box' ||
            name === 'update-2d-rect' ||
            name === 'update-transform' ||
            name === 'update-userData'
        ) {
            curData.needSave = true;
        } else {
            return;
        }
    }

    onEditorAdd(objects: AnnotateObject[], dataInfo?: IDataMeta) {
        // console.log('onEditorAdd', objects);
        let { dataList, dataIndex } = this.tool.state;

        dataInfo = dataInfo || dataList[dataIndex];
        let allObjects = this.getDataObject(dataInfo.dataId) || [];

        dataInfo.needSave = true;
        if (!isArray(objects)) {
            objects = [objects];
        }
        allObjects.push(...objects);
        this.setDataObject(dataInfo.dataId, allObjects);
    }

    onEditorRemove(objects: AnnotateObject[]) {
        console.log('onEditorRemove', objects);
        let { dataList, dataIndex } = this.tool.state;
        let curData = dataList[dataIndex];
        let allObjects = this.dataMap[curData.dataId];
        if (!allObjects) return;

        curData.needSave = true;

        let removeMap = {} as Record<string, boolean>;
        if (!isArray(objects)) {
            objects = [objects];
        }
        objects.forEach((e) => {
            removeMap[e.uuid] = true;
        });

        let remainObjects = allObjects.filter((e) => !removeMap[e.uuid]);
        this.setDataObject(curData.dataId, remainObjects);
    }

    setDataObject(dataId: string | number, objects: AnnotateObject[]) {
        dataId = dataId + '';
        this.dataMap[dataId] = objects;
    }

    getDataObject(dataId: string | number) {
        dataId = dataId + '';
        return this.dataMap[dataId];
    }

    // model
    getModelResult(dataId: number) {
        return this.modelMap[dataId];
    }
    clearModelResult(dataId: number) {
        delete this.modelMap[dataId];
    }

    addModelTrackData(dataIds: string[], objectsMap: Record<number, IObject[]>) {
        let { dataList } = this.tool.state;

        let dataMap = {} as Record<string, IDataMeta>;
        dataList.forEach((e) => {
            dataMap[e.dataId] = e;
        });

        Object.keys(objectsMap).forEach((e) => {
            let index = +e;
            let dataId = dataIds[index];
            dataMap[dataId].needSave = true;

            let idStart = this.tool.getMaxId(dataId) + 1;
            let objects = utils.convertObject2Annotate(objectsMap[e], this.tool.editor);
            objects.forEach((e) => {
                e.userData.id = idStart + '';
                idStart++;
            });

            if (objects.length > 0) {
                this.onEditorAdd(objects, dataMap[dataId]);
            }
        });
    }

    async pollDataModelResult() {
        let _this = this;
        let { editor, state } = this.tool;
        let modelMap = {} as Record<string, IDataMeta[]>;
        let confidence = state.modelConfig.confidence || [0.5, 1];
        let dataList = this.tool.state.dataList;

        dataList.forEach((data) => {
            if (data.model && data.model.state !== 'complete') {
                let id = data.model.recordId;
                modelMap[id] = modelMap[id] || [];
                modelMap[id].push(data);
            }
        });

        if (Object.keys(modelMap).length === 0) return;

        // console.log('pollModel');

        let requests = [] as Promise<any>[];
        Object.keys(modelMap).forEach((recordId) => {
            requests.push(createRequest(recordId, modelMap[recordId]));
        });
        console.log('requests', requests);

        await Promise.all(requests);

        setTimeout(this.pollDataModelResult.bind(this), 1000);

        function createRequest(recordId: string, dataList: IDataMeta[]) {
            let ids = dataList.map((e) => e.dataId);
            let request = api
                .getModelResult(ids, recordId)
                .then((data) => {
                    // console.log('getModelResult ==> ', data);
                    let { dataIndex, dataList } = _this.tool.state;
                    let curData = dataList[dataIndex];
                    // return;
                    data = data.data || {};
                    let resultList = data.modelDataResults;
                    if (!resultList) return;

                    // let hasErrorMessage = resultList.some((item: any) =>
                    //     item.modelResult.message.includes('UnknownHostException'),
                    // );
                    // console.log(hasErrorMessage);

                    // if (hasErrorMessage) {
                    //     console.log('Interval');
                    //     timer = setInterval(() => {
                    //         return createRequest(recordId, dataList);
                    //     }, 1000);
                    // } else {
                    //     console.log('clearInterval');
                    //     clearInterval(timer);
                    // }

                    let resultMap = {} as Record<string, any>;
                    resultList.forEach((e: any) => {
                        resultMap[e.dataId] = e;
                    });

                    dataList.forEach((dataMeta) => {
                        let info = resultMap[dataMeta.dataId];
                        let model = dataMeta.model as IModelResult;

                        if (info) {
                            let modelResult = info.modelResult;
                            let objects = (modelResult.objects || []) as IObject[];
                            if (modelResult.code != 'OK') {
                                dataMeta.model = undefined;
                                if (dataMeta.dataId === curData.dataId)
                                    editor.showMsg('error', 'Model Run Error.');
                                clearInterval(timer);
                                return;
                            }
                            if (objects.length > 0) {
                                // 更新状态
                                model.state = 'complete';
                                // 过滤
                                objects = objects.filter((e) => {
                                    let c = e.confidence;
                                    return !c || (c >= confidence[0] && c <= confidence[1]);
                                });
                                _this.modelMap[dataMeta.dataId] = convertModelRunResult(objects);
                            } else {
                                dataMeta.model = undefined;
                                if (dataMeta.dataId === curData.dataId)
                                    editor.showMsg('warning', 'No Model Results.');
                            }
                        } else {
                            dataMeta.model = undefined;
                            if (dataMeta.dataId === curData.dataId)
                                editor.showMsg('warning', 'No Model Results.');
                        }
                    });

                    // data.forEach((info: any) => {
                })
                .catch(() => {
                    clearInterval(timer);
                });

            return request;
        }
    }
}
