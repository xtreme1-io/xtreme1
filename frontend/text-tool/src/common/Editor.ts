import { Editor as BaseEditor, IFrame, ITextItem, SourceType } from 'pc-editor';
import { IBSState } from '../type';
import { getDefault } from '../state';
import { utils, AttrType, IClassificationAttr, IUserData } from 'pc-editor';
import * as api from '../api';
import BusinessManager from './BusinessManager';
import DataManager from './DataManager';
import * as THREE from 'three';

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
        if (bsState.saving) return;

        frames = frames || this.state.frames;

        if (!force && !this.needSave(frames)) return;

        let dataInfos = [] as any[];
        frames.forEach((dataMeta) => {
            if (!dataMeta.needSave) return;
            let texts = this.dataManager.getTextItemsByFrame(dataMeta);

            // result object
            let infos = [] as any[];
            let dataAnnotations = [] as any[];
            texts.forEach((e) => {
                console.log()
                if (!e.needSave) return;
                infos.push({
                    classAttributes: {
                        messageId: e.id,
                        direction: e.direction,
                        type: 'CHAT_THUMB',
                        version: e.version,
                        createdBy: e.createdBy,
                        createdAt: e.createdAt,

                    },
                    id: e.backId,
                    frontId: e.id,
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
        // console.log('================>save', objectInfo);
        // return;
        try {
            // debugger
            await api.saveObject(objectInfo).then((keyMap) => {
                this.updateBackId(keyMap);
            });
            frames.forEach((e) => {
                e.needSave = false;
            });
            dataInfos.forEach((datainfo) => {
                datainfo.objects.forEach((e: ITextItem) => e.needSave = false);
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
            let frame = this.getFrame(dataId);
            if (!frame) return;
            let texts = this.dataManager.getTextItemsByFrame(frame);
            texts.forEach((item: ITextItem) => {
                let frontId = item.id;
                let backId = dataKeyMap[frontId];
                if (!backId) return;
                item.backId = Number(backId);
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
