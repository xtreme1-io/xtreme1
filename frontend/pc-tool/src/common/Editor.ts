import { Editor as BaseEditor, IFrame } from 'pc-editor';
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

        let classMap = {};
        classTypes.forEach((e) => {
            classMap[e.name] = e;
        });
        let dataInfos = [] as any[];
        let classValueInfos = [] as any[];
        let queryTime = frames[0].queryTime;
        frames.forEach((dataMeta) => {
            // if (dataMeta.skipped) return;
            let annotates = this.dataManager.getFrameObject(dataMeta.id) || [];
            if (new Date(dataMeta.queryTime).getTime() > new Date(queryTime).getTime())
                queryTime = dataMeta.queryTime;

            // result object
            let data = utils.convertAnnotate2Object(annotates, this);
            let infos = [] as any[];
            data.forEach((e) => {
                infos.push({
                    id: e.uuid ? +e.uuid : undefined,
                    frontId: e.frontId,
                    classId: e.classType ? classMap[e.classType]?.id : '',
                    source: e.modelRun ? 'MODEL' : 'ARTIFICIAL',
                    modelRunId: utils.empty(e.modelRun) ? undefined : +(e.modelRun as any),
                    modelClassName: e.modelClass || undefined,
                    modelConfidence: e.confidence || undefined,
                    classAttributes: e,
                    // visibleType:
                    // classAttributes: JSON.stringify(e),
                });
            });
            dataInfos.push({ dataId: dataMeta.id, objects: infos });

            // class value
            // dataMeta
            let valueInfos = [] as any[];
            dataMeta.classifications.forEach((classification) => {
                let classificationAttributes = {};

                let attrMap = {} as Record<string, IClassificationAttr>;
                classification.attrs.forEach((attr) => {
                    attrMap[attr.id] = attr;
                });
                classification.attrs.forEach((attr) => {
                    let visible = isAttrVisible(attr, attrMap);
                    if (visible) {
                        classificationAttributes[attr.id] = attr.value;
                    }
                    // classificationAttributes[attr.id] = attr.value;
                });

                valueInfos.push({
                    id: undefined,
                    classificationId: +classification.id,
                    classificationAttributes: classificationAttributes,
                });
            });
            valueInfos.length > 0 &&
                classValueInfos.push({ dataId: dataMeta.id, dataAnnotations: valueInfos });
        });

        let objectInfo = {
            datasetId: bsState.datasetId,
            queryTime: queryTime,
            dataInfos: dataInfos,
        };

        let classificationInfo = {
            datasetId: bsState.datasetId,
            queryTime: queryTime,
            dataInfos: classValueInfos,
        };

        // console.log(classValueInfos);
        let saveObject = api.saveObject(objectInfo).then((keyMap) => {
            this.updateBackId(keyMap);
        });
        let saves = [saveObject] as Promise<any>[];
        if (classValueInfos.length > 0) {
            saves.push(api.saveDataClassification(classificationInfo));
        }

        bsState.saving = true;
        try {
            await Promise.all(saves);
            frames.forEach((e) => {
                e.needSave = false;
            });
            this.showMsg('success', this.lang('save-ok'));
        } catch (e: any) {
            this.showMsg('error', this.lang('save-error'));
        }
        bsState.saving = false;

        // tool
        function isAttrVisible(
            attr: IClassificationAttr,
            attrMap: Record<string, IClassificationAttr>,
        ): boolean {
            if (!attr.parent) return true;
            let parentAttr = attrMap[attr.parent];
            let visible =
                parentAttr.type !== AttrType.MULTI_SELECTION
                    ? parentAttr.value === attr.parentValue
                    : (parentAttr.value as any[]).indexOf(attr.parentValue) >= 0;

            return visible && isAttrVisible(parentAttr, attrMap);
        }
    }

    updateBackId(keyMap: Record<string, Record<string, string>>) {
        Object.keys(keyMap).forEach((dataId) => {
            let dataKeyMap = keyMap[dataId];
            let annotates = this.dataManager.getFrameObject(dataId) || [];
            annotates.forEach((annotate) => {
                let frontId = annotate.uuid;
                let backId = dataKeyMap[frontId];
                if (!backId) return;
                (annotate.userData as IUserData).backId = backId;
                // annotate.uuid = backId;
            });
        });
    }
}
