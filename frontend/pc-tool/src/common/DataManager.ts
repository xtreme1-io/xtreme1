import { IObject, IFrame, IModelResult, IUserData } from 'pc-editor';
import Editor from './Editor';
import * as api from '../api';
import { DataManager as BaseDataManager, Const } from 'pc-editor';
import * as bsUtils from '../utils';
import { AnnotateObject } from 'pc-render';

export default class DataManager extends BaseDataManager {
    editor: Editor;
    constructor(editor: Editor) {
        super(editor);

        this.editor = editor;
    }

    async pollDataModelResult() {
        let _this = this;
        let editor = this.editor;
        let modelMap = {} as Record<string, IFrame[]>;

        let dataList = this.editor.state.frames;
        dataList.forEach((data) => {
            if (data.model && data.model.state !== 'complete') {
                let id = data.model.recordId;
                modelMap[id] = modelMap[id] || [];
                modelMap[id].push(data);
            }
        });

        if (Object.keys(modelMap).length === 0) return;

        let requests = [] as Promise<any>[];
        Object.keys(modelMap).forEach((recordId) => {
            requests.push(createRequest(recordId, modelMap[recordId]));
        });

        await Promise.all(requests);

        setTimeout(this.pollDataModelResult.bind(this), 1500);

        function createRequest(recordId: string, dataInfos: IFrame[]) {
            let ids = dataInfos.map((e) => e.id);
            let request = api
                .getModelResult(ids, recordId)
                .then((data) => {
                    let { frameIndex, frames } = _this.editor.state;
                    let curData = dataList[frameIndex];
                    // return;
                    data = data.data || {};
                    let resultList = data.modelDataResults;
                    if (!resultList) return;

                    let resultMap = {} as Record<string, any>;
                    resultList.forEach((e: any) => {
                        resultMap[e.dataId] = e;
                    });

                    dataInfos.forEach((dataMeta) => {
                        let info = resultMap[dataMeta.id];
                        let model = dataMeta.model as IModelResult;

                        if (info) {
                            let modelResult = info.modelResult;
                            let objects = (modelResult.objects || []) as IObject[];

                            if (modelResult.code !== "OK") {
                                dataMeta.model = undefined;
                                if (dataMeta.id === curData.id)
                                    editor.showMsg('error', editor.lang('model-run-error'));
                                return;
                            }

                            if (objects.length > 0) {
                                model.state = 'complete';
                                objects = objects.filter(
                                    (e) => e.confidence && e.confidence >= 0.5,
                                );
                                editor.modelManager.modelMap.set(dataMeta.id, objects);
                            } else {
                                dataMeta.model = undefined;
                                if (dataMeta.id === curData.id)
                                    editor.showMsg('warning', editor.lang('model-run-no-data'));
                            }
                        } else {
                            dataMeta.model = undefined;
                            if (dataMeta.id === curData.id)
                                editor.showMsg('warning', editor.lang('model-run-no-data'));
                        }
                    });

                    // data.forEach((info: any) => {
                })
                .catch(() => {});

            return request;
        }
    }
    onAnnotatesAdd(objects: AnnotateObject[], frame?: IFrame | undefined): void {
        let { user } = this.editor.bsState;

        console.log('onAnnotatesAdd')
        // 
        if (user.id) {
            objects.forEach((object) => {
                let bsObj = object as any;
                if (!bsObj.createdAt) {
                    bsObj.lastTime = Date.now();
                    bsObj.updateTime = bsObj.lastTime;
                    bsObj.createdAt = bsUtils.formatTimeUTC(bsObj.lastTime);
                }
                if (!bsObj.createdBy) {
                    bsObj.createdBy = user.id;
                }
            });
        }
        super.onAnnotatesAdd(objects, frame);
    }
}
