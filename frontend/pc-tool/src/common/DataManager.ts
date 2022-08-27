import { IObject, IFrame, IModelResult, IUserData } from 'pc-editor';
import Editor from './Editor';
import * as api from '../api';
import { DataManager as BaseDataManager, Const } from 'pc-editor';
import * as bsUtils from '../utils';

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

        console.log('pollModel');

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

                            if (modelResult.code !== 0) {
                                dataMeta.model = undefined;
                                if (dataMeta.id === curData.id)
                                    editor.showMsg('error', editor.lang('model-run-error'));
                                return;
                            }

                            if (objects.length > 0) {
                                // 更新状态
                                model.state = 'complete';
                                // 过滤
                                objects = objects.filter(
                                    (e) => e.confidence && e.confidence >= 0.5,
                                );
                                editor.modelManager.modelMap.set(dataMeta.id, objects);
                                let { start } = editor.state.modelConfig;
                                editor.state.modelConfig.duration = Date.now() - start;
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

    async runModelTrack(
        curId: string,
        toIds: string[],
        direction: 'BACKWARD' | 'FORWARD',
        targetObjects: any[],
        trackIdName: Record<string, string>,
        onComplete?: () => void,
    ) {
        let editor = this.editor;
        let { frameIndex, frames } = this.editor.state;
        let { datasetId } = this.editor.bsState;
        let dataInfo = frames[frameIndex];
        let config = {
            datasetId: +datasetId,
            dataId: +dataInfo.id,
            direction,
            dataIds: toIds,
            targetObjects,
        };
        editor.showLoading({ type: 'loading', content: editor.lang('load-track') });

        await api
            .runModelTrack(config)
            .then((result) => {
                let recordId = result.data as string;
                let clear = bsUtils.pollModelTrack(
                    recordId,
                    (objectsMap) => {
                        if (Object.keys(objectsMap).length === 0) {
                            editor.showMsg('warning', editor.lang('track-no-data'));
                        } else {
                            let dataIdMap = {} as Record<string, IObject[]>;
                            Object.keys(objectsMap).forEach((index) => {
                                let dataId = toIds[index];
                                dataIdMap[dataId] = objectsMap[index];
                            });
                            editor.modelManager.addModelTrackData(dataIdMap);
                            editor.showMsg('success', editor.lang('track-ok'));
                            onComplete && onComplete();
                        }
                        editor.showLoading(false);
                    },
                    () => {
                        editor.showLoading(false);
                        editor.showMsg('error', editor.lang('track-error'));
                    },
                );
            })
            .catch((e) => {
                editor.showLoading(false);
                editor.showMsg('error', e.message || editor.lang('track-error'));
            });
    }
}
