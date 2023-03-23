import {
    IToolState,
    IToolConfig,
    IDataResource,
    IObject,
    ObjectType,
    IResultFilter,
    IClassificationAttr,
    IClassification,
    AttrType,
    SourceType,
    IResultSource,
} from '../type';
import { Editor } from 'editor';
import { getDefault, getDefaultConfig } from '../state';
import DataManager from './DataManager';
import DataResource, { ResourceLoader } from './DataResource';
import * as utils from '../utils';
import * as api from '../api';
import BSError from './BSError';
import * as THREE from 'three';
import { classificationToSave, saveToClassificationValue } from '../utils';

type AnnotateObject = any;

export default class Tool {
    config: IToolConfig = getDefaultConfig();
    editor: Editor;
    state: IToolState = getDefault();
    dataManager: DataManager;
    dataResource: DataResource;
    constructor() {
        this.editor = new Editor(this);
        this.dataManager = new DataManager(this);
        this.dataResource = new DataResource(this);
    }
    async loadData(index: number, showLoading: boolean = true) {
        index = +index;
        if (index === this.state.dataIndex) return;
        this.state.dataIndex = index;

        showLoading && this.editor.showLoading(true);
        try {
            await this.loadResource();
            await Promise.all([this.loadObject()]);
        } catch (error: any) {
            this.handleErr(error);
        }

        showLoading && this.editor.showLoading(false);

        this.dataResource.load();
    }

    async loadObject() {
        console.log('======= loadObject =======');
        const dataInfo = this.state.dataList[this.state.dataIndex];

        const objects = this.dataManager.getDataObject(dataInfo.dataId);
        if (!objects) {
            try {
                const res = await api.getAnnotationByDataIds([dataInfo.dataId]);

                // objects ==>
                const annotationObject = res.objects ?? [];
                const annotates = utils.convertObject2Annotate(annotationObject, this.editor);
                this.editor.state.isAnnotated = annotates.length > 0;
                this.dataManager.setDataObject(dataInfo.dataId, annotates);

                // classification ==>
                const annotationClassification = res.classificationValues ?? [];

                const classifications = [] as IClassification[];
                this.state.classifications.forEach((classification) => {
                    let copyClassification = {} as IClassification;
                    copyClassification = JSON.parse(JSON.stringify(classification));
                    copyClassification.attrs.forEach((attr) => {
                        // console.log('attr', attr);
                        attr.value = attr.type === AttrType.MULTI_SELECTION ? [] : '';
                        const target = annotationClassification.find(
                            (item: any) => item.id == attr.classificationId,
                        );
                        if (target) {
                            const classificationAttributes = saveToClassificationValue(
                                target.values,
                            );
                            attr.value = classificationAttributes[attr.id];
                        }
                    });
                    classifications.push(copyClassification);
                });
                dataInfo.classifications = classifications;
            } catch (error: any) {
                this.handleErr(new BSError('', 'Load Object Error', error));
            }
        }
        // console.log(annotates);
        this.getResultSources();
        this.editor.reset();
        this.state.resultActive = [];
        this.setFilterFromData();
        this.loadDataFromManager(true);
    }
    getMaxId(dataId?: string) {
        let { dataIndex, dataList } = this.state;
        let curData = dataList[dataIndex];
        let objects = this.dataManager.getDataObject(dataId || curData.dataId) || [];
        let maxId = 0;
        objects.forEach((e) => {
            if (!e.intId) return;
            let id = parseInt(e.intId);
            if (id > maxId) maxId = id;
        });
        return maxId;
    }
    getCurrentFrame() {
        return this.state.dataList[this.state.dataIndex];
    }
    addModelData(flag?: boolean) {
        let { state } = this;
        let dataInfo = state.dataList[state.dataIndex];
        // console.log(dataInfo.dataId);
        let objects = this.dataManager.modelMap[dataInfo.dataId];
        // let oldAnnotate = this.dataManager.getDataObject(dataInfo.dataId);
        let annotates = utils.convertObject2Annotate(objects, this.editor);
        annotates.forEach((e) => {
            e.userData.sourceId = state.withoutTaskId;
            e.userData.sourceType = SourceType.DATA_FLOW;
        });
        // this.dataManager.setDataObject(dataInfo.dataId, [...oldAnnotate, ...annotates]);
        this.editor.cmdManager.execute('add-object', annotates);
        // if (!flag) {
        //     this.editor.cmdManager.execute('add-modelRun', {
        //         annotates,
        //         objects,
        //         id: dataInfo.dataId,
        //     });
        // }
        dataInfo.model = undefined;

        dataInfo.needSave = true;

        this.setFilterFromData();
        this.loadDataFromManager(true);

        // delete this.dataManager.modelMap[dataInfo.dataId];
    }

    createTrackId() {
        let { seriesFrameId } = this.state;
        let uuid6 = THREE.MathUtils.generateUUID().slice(0, 6);
        return `${seriesFrameId}-${uuid6}`;
    }

    loadDataFromManager(clear: boolean = false) {
        if (clear) {
            this.editor.tool?.removeAll(false);
        }
        let config = this.state.dataList[this.state.dataIndex];
        let objects = this.dataManager.dataMap[config.dataId];

        let filterMap = this.getActiveFilter();
        let withoutTaskId = this.state.withoutTaskId;
        // console.log('filterMap', filterMap);
        let filterObjects = [] as AnnotateObject[];
        objects.forEach((e) => {
            let sourceId = e.userData.sourceId || withoutTaskId;
            let valid = filterMap.all || filterMap.source[sourceId];

            if (!valid) return;

            filterObjects.push(e);
        });
        this.editor.addObject(filterObjects);
        this.editor.idCount = this.getMaxId() + 1;
    }

    getActiveFilter() {
        let { sourceFilters, FILTER_ALL } = this.state;

        let filterMap = {
            all: false,
            source: {},
            // project: {},
            // model: {},
        };
        sourceFilters.forEach((filter) => {
            if (filter === FILTER_ALL) filterMap.all = true;
            else {
                filterMap.source[filter] = true;
            }
        });

        return filterMap;
    }

    setFilterFromData() {
        let config = this.state.dataList[this.state.dataIndex];
        let objects = this.dataManager.getDataObject(config.dataId + '');
        let { FILTER_ALL } = this.config;
        let all: IResultFilter = { value: FILTER_ALL, label: FILTER_ALL, type: '' };
        let project: IResultFilter = { label: 'Ground Truth', options: [], type: 'project' };
        let model: IResultFilter = { label: 'Model Runs', options: [], type: 'model' };

        let projectMap = {};
        let modelMap = {};

        objects.forEach((object) => {
            if (object.modelRun) {
                let name = object.modelRun;
                if (!modelMap[name]) {
                    let option = { value: name, label: `Model Runs ${name}` };
                    model.options?.push(option);
                    modelMap[name] = option;
                }
            } else {
                let name = object.project || '';
                if (!projectMap[name]) {
                    let option = { value: name, label: name || 'No Project' };
                    project.options?.push(option);
                    projectMap[name] = option;
                }
            }
        });

        let filters = [all] as IResultFilter[];

        if ((project as any).options.length > 0) filters.push(project);
        if ((model as any).options.length > 0) filters.push(model);

        this.state.resultFilter = filters;
        if (this.state.resultActive.length === 0) this.state.resultActive = [FILTER_ALL];
    }

    async loadResource() {
        let data = this.state.dataList[this.state.dataIndex];
        let resource = this.dataResource.getResource(data);

        if (resource instanceof ResourceLoader) {
            // console.log('load Resource');
            resource.onProgress = (ratio: number) => {
                let percent = (ratio * 100).toFixed(2);
                this.editor.showLoading({
                    type: 'loading',
                    content: `Load Points....${percent}%`,
                });
            };
            return resource
                .get()
                .then((data) => {
                    this.setResource(data);
                })
                .catch((e) => {
                    this.handleErr(new BSError('', 'Load Resource Error', e));
                });
        } else {
            this.setResource(resource);
        }
    }

    setResource(resource: IDataResource) {
        let data = this.state.dataList[this.state.dataIndex];
        // console.log('setResource ==>', resource, data);

        this.editor.state.dataId = data.dataId;
        this.editor.state.imageSize = data.dataConfig.size;
        this.editor.state.dataName = data.dataConfig.name;
        this.editor.state.imageUrl = data.dataConfig.url;
        this.editor.state.annotationStatus = data.annotationStatus;
        this.editor.state.validStatus = data.validStatus;
        if (this.state?.focus?.focusId) {
            this.editor.state.focusId = this.state?.focus?.focusId;
        }

        this.editor.loadImage(resource.image);
    }
    setResultSource(sources: IResultSource[]) {
        if (!sources) return;
        let { FILTER_ALL, withoutTaskId } = this.state;
        this.state.sources = sources;

        let sourceMap = {};
        sources.forEach((e) => {
            sourceMap[e.sourceId] = true;
        });

        this.state.sourceFilters = this.state.sourceFilters.filter((e) => sourceMap[e]);
        if (this.state.sourceFilters.length === 0) this.state.sourceFilters = [FILTER_ALL];
    }
    async getResultSources() {
        let frame = this.getCurrentFrame();
        if (!frame) return;
        if (!frame.sources) {
            let state = this.state;
            let sources = await api.getResultSources(frame.dataId);
            sources.unshift({
                name: 'Without Task',
                sourceId: state.withoutTaskId,
                sourceType: SourceType.DATA_FLOW,
            });
            frame.sources = sources;
        }
        this.setResultSource(frame.sources);
        // let sourceMap = {};
        // sources.forEach((e) => {
        //     sourceMap[e.sourceId] = true;
        // });
        // state.sourceFilters = [state.withoutTaskId];
        // state.sources = sources;
        // return sources;
    }

    needSave() {
        let needSaveData = this.state.dataList.filter((e) => e.needSave);
        return needSaveData.length > 0;
    }

    // NOTE
    async saveObject() {
        let { state, editor } = this;
        let { withoutTaskId } = state;
        // let dataMeta = state.dataList[state.dataIndex];
        if (state.saving) return;

        if (!this.needSave()) return;

        // currentData
        const currentData = state.dataList[state.dataIndex];
        // class
        let classMap = {};
        editor.state.classTypes.forEach((e) => {
            classMap[e.name] = e;
        });

        const dataInfos = [] as any;
        state.dataList.forEach((dataMeta) => {
            if (!dataMeta.needSave) return;

            // object  ==>
            const objectInfos = [] as any[];
            const annotates = this.dataManager.getDataObject(dataMeta.dataId) || [];
            let data = utils.convertAnnotate2Object(annotates, editor);

            data.forEach((e) => {
                objectInfos.push({
                    id: e.backId,
                    frontId: e.id,
                    classId: +e.classId,
                    sourceId: +e.sourceId,
                    sourceType: e.sourceType,
                    classAttributes: e,
                });
            });
            // const data = utils.convertAnnotate2Object(annotates, editor); // 转换数据
            // data.forEach((e) => {
            //     console.log('object ==>', e);
            //     objectInfos.push(e);
            // });

            // classification ==>
            const classificationInfos = [] as any[];
            (dataMeta.classifications || []).forEach((classification: any) => {
                const newClassification = classificationToSave(classification);
                const classificationAttributes = {
                    id: +classification.id,
                    values: newClassification,
                };
                classificationInfos.push({
                    id: undefined,
                    classificationId: classification.id,
                    classificationAttributes,
                });
            });

            dataInfos.push({
                dataId: dataMeta.dataId,
                objects: objectInfos,
                dataAnnotations: classificationInfos,
            });
        });

        try {
            state.saving = true;
            const saveParams = {
                datasetId: currentData.datasetId,
                dataInfos,
            };
            const keyMap = await api.saveAnnotation(saveParams);
            this.updateBackId(keyMap);
            state.dataList.forEach((e) => {
                e.needSave = false;
            });
            editor.showMsg('success', 'Save Success');
            state.saving = false;
            return true;
        } catch (error: any) {
            this.editor.showMsg('error', error.message || 'Save Error');
            state.saving = false;
            return false;
        }

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

    handleErr(err: BSError | Error) {
        utils.handleError(this, err);
    }

    updateBackId(keyMap: Record<string, Record<string, string>>) {
        Object.keys(keyMap).forEach((dataId) => {
            let dataKeyMap = keyMap[dataId];
            let annotates = this.dataManager.getDataObject(dataId) || [];
            annotates.forEach((annotate) => {
                let frontId = annotate.uuid;
                let backId = dataKeyMap[frontId];
                if (!backId) return;
                annotate.id = backId;
                // annotate.uuid = backId;
            });
        });
    }
}
