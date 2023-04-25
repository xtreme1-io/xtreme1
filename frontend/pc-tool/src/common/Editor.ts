import { Editor as BaseEditor, IFrame, SourceType } from 'pc-editor';
import { IBSState } from '../type';
import { getDefault } from '../state';
import { utils, AttrType, IClassificationAttr, IUserData } from 'pc-editor';
import * as api from '../api';
import BusinessManager from './BusinessManager';
import DataManager from './DataManager';

export default class Editor extends BaseEditor {
    businessManager: BusinessManager;
    dataManager: DataManager;
    bsState: IBSState = getDefault();
    constructor() {
        super();

        this.businessManager = new BusinessManager(this);
        this.dataManager = new DataManager(this);
    }

    needSave(frames?: IFrame[]) {
        frames = frames || this.state.frames;
        let needSaveData = frames.filter((e) => e.needSave);
        return needSaveData.length > 0;
    }

    async saveObject(frames?: IFrame[], force?: boolean) {
        let { bsState } = this;
        let { classTypes } = this.state;
        // let dataMeta = state.dataList[state.dataIndex];
        if (bsState.saving) return;

        frames = frames || this.state.frames;

        if (!force && !this.needSave(frames)) return;

        let dataInfos = [] as any[];
        let queryTime = frames[0].queryTime;
        frames.forEach((dataMeta) => {
            // if (dataMeta.skipped) return;
            if (!dataMeta.needSave) return;
            let annotates = this.dataManager.getFrameObject(dataMeta.id) || [];
            if (new Date(dataMeta.queryTime).getTime() > new Date(queryTime).getTime())
                queryTime = dataMeta.queryTime;

            // result object
            let data = utils.convertAnnotate2Object(annotates, this);
            let infos = [] as any[];
            let dataAnnotations = [] as any[];
            data.forEach((e) => {
                let classConfig = this.getClassType(e.classId || e.classType || '');
                let objectV2 = utils.translateToObjectV2(e, classConfig);
                infos.push({
                    id: e.uuid || undefined,
                    frontId: e.frontId,
                    classId: classConfig?.id,
                    source: e.modelRun ? 'MODEL' : 'ARTIFICIAL',
                    sourceId: e.sourceId,
                    sourceType: e.sourceType,
                    classAttributes: objectV2,
                });
            });

            dataMeta.classifications.forEach((classification) => {
                let values = utils.classificationToSave(classification);
                dataAnnotations.push({
                    classificationId: classification.id,
                    classificationAttributes: {
                        id: classification.id,
                        values: values,
                    },
                });
            });

            dataInfos.push({
                dataId: dataMeta.id,
                objects: infos,
                dataAnnotations: dataAnnotations,
            });
        });

        let objectInfo = {
            datasetId: bsState.datasetId,
            dataInfos: dataInfos,
        };
        bsState.saving = true;
        try {
            // debugger
            await api.saveObject(objectInfo).then((keyMap) => {
                this.updateBackId(keyMap);
            });
            frames.forEach((e) => {
                e.needSave = false;
            });
            this.showMsg('success', this.lang('save-ok'));
        } catch (e: any) {
            console.error(e);
            this.showMsg('error', this.lang('save-error'));
        }
        bsState.saving = false;
    }

    updateBackId(keyMap: Record<string, Record<string, string>>) {
        Object.keys(keyMap).forEach((dataId) => {
            let dataKeyMap = keyMap[dataId];
            let annotates = this.dataManager.getFrameObject(dataId) || [];
            annotates.forEach((annotate: any) => {
                let frontId = annotate.uuid;
                let backId = dataKeyMap[frontId];
                if (!backId) return;
                annotate.userData.backId = backId;
                // annotate.uuid = backId;
            });
        });
    }
    async getResultSources(frame?: IFrame) {
        let { state } = this;
        frame = frame || this.getCurrentFrame();
        if (!frame.sources) {
            let sources = await api.getResultSources(frame.id);
            sources.unshift({
                name: 'Without Task',
                sourceId: state.config.withoutTaskId,
                sourceType: SourceType.DATA_FLOW,
            });
            frame.sources = sources;
        }
        this.setSources(frame.sources);

        // let sourceMap = {};
        // sources.forEach((e) => {
        //     sourceMap[e.sourceId] = true;
        // });
        // state.sourceFilters = [state.config.withoutTaskId];
        // state.sources = sources;
    }
}
