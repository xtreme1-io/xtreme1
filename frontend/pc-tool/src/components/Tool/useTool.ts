import { reactive, toRefs, watch } from 'vue';
import { useInjectEditor } from '../../state';
import { allItems } from './item';
import { IActionName } from 'pc-editor';
import { Image2DRenderView, CreateAction, Box } from 'pc-render';
import { IModelResult, IModel } from 'pc-editor';
import * as api from '../../api';

let createActions: IActionName[] = [
    'create2DBox',
    'create2DRect',
    'createObjectWith3',
    'pickObject',
];

export interface IConfig {
    noUtility?: boolean;
    noAnnotate?: boolean;
}

export interface IClass {
    label: string;
    value: string;
    selected: boolean;
}
export default function useTool() {
    let editor = useInjectEditor();
    let innerState = reactive({
        tools: allItems,
    });
    function onTool(name: string) {
        let config = editor.state.config;
        switch (name) {
            case 'create2DBox':
                stopOtherCreateAction('create2DBox');
                editor.actionManager.execute('create2DBox');

                break;
            case 'create3DBox':
                stopOtherCreateAction('createObjectWith3');
                editor.actionManager.execute('createObjectWith3');

                break;
            case 'createRect':
                stopOtherCreateAction('create2DRect');
                editor.actionManager.execute('create2DRect');

                break;
            case 'translate':
                editor.actionManager.execute('toggleTranslate');
                break;
            case 'reProjection':
                reProject();
                break;
            case 'projection':
                project();
                break;
            case 'track':
                let view = editor.pc.renderViews.find(
                    (e) => e.name === config.singleViewPrefix,
                ) as Image2DRenderView;
                let action = view.getAction('create-obj') as CreateAction;
                editor.state.config.activeTrack = !editor.state.config.activeTrack;
                action.trackLine = editor.state.config.activeTrack;
                break;
            case 'model':
                onModel();
                break;
            case 'filter2D':
                onFilter2D();
                break;
        }
    }

    function onFilter2D() {
        let config = editor.state.config;
        config.filter2DByTrack = !config.filter2DByTrack;
        editor.pc.render();
    }

    function project() {
        let selection = editor.pc.selection;

        if (selection.length > 0) {
            let object3D = selection.filter((e) => e instanceof Box);
            if (object3D.length === 0) {
                editor.showMsg('warning', 'Please Select a 3D Result');
                return;
            }
            editor.actionManager.execute('projectObject2D', {
                createFlag: true,
                updateFlag: false,
                selectFlag: true,
            });
        } else {
            editor.actionManager.execute('projectObject2D', {
                createFlag: true,
                updateFlag: false,
            });
        }
    }

    function reProject() {
        let selection = editor.pc.selection;
        let object3D = selection.filter((e) => e instanceof Box);
        if (object3D.length === 0) {
            editor.showMsg('warning', 'Please Select a 3D Result');
            return;
        }

        editor.actionManager.execute('projectObject2D', {
            createFlag: true,
            updateFlag: true,
            selectFlag: true,
        });
    }

    async function runModel() {
        const modelConfig = editor.state.modelConfig;
        if (!modelConfig.model) {
            editor.showMsg('warning', 'Please choose Model');
            return;
        }
        let toolState = editor.state;
        let bsState = editor.bsState;
        let data = toolState.frames[toolState.frameIndex];
        let model = toolState.models.find((e) => e.name === modelConfig.model) as IModel;
        const resultFilterParam = {
            minConfidence: 0.5,
            maxConfidence: 1,
            classes: model?.classes.map((e) => e.value),
        };
        if (!modelConfig.predict) {
            const selectedClasses = (modelConfig.classes[modelConfig.model] || []).reduce(
                (classes, item) => {
                    if (item.selected) {
                        classes.push(item.value);
                    }
                    return classes;
                },
                [] as string[],
            );
            if (selectedClasses.length <= 0) {
                editor.showMsg('warning', 'Select at least one Class!');
                return;
            }
            resultFilterParam.minConfidence = modelConfig.confidence[0];
            resultFilterParam.maxConfidence = modelConfig.confidence[1];
            resultFilterParam.classes = selectedClasses;
        }
        let config = {
            datasetId: bsState.datasetId,
            dataIds: [+data.id],
            modelId: +model.id,
            modelVersion: model?.version,
            dataType: 'SINGLE_DATA',
            modelCode: model.code,
            // annotationRecordId: +toolState.recordId,
            resultFilterParam,
        };
        // modelConfig.loading = true;
        try {
            let result = await api.runModel(config);
            if (!result.data) throw new Error('Model Run Error');
            data.model = {
                recordId: result.data,
                id: model.id,
                version: model.version,
                state: 'loading',
            };
        } catch (error: any) {
            editor.showMsg('error', error.message || 'Model Run Error');
        }
        // modelConfig.loading = false;
        editor.dataManager.pollDataModelResult();
    }
    function onModel() {
        let toolState = editor.state;
        let dataInfo = toolState.frames[toolState.frameIndex];

        if (dataInfo.model && dataInfo.model.state === 'loading') return;

        // if (dataInfo.model) {
        if (dataInfo.model && dataInfo.model.state === 'complete') {
            let model = dataInfo.model as IModelResult;
            // editor.showConfirm({ title: 'Model Results', subTitle: 'Add Results?' }).then(
            //     async () => {
            //     },
            //     () => {},
            // );
            api.clearModel([+dataInfo.id], model.recordId);
            editor.modelManager.addModelData();
        } else {
            runModel();
            // editor.showModal('modelRun', { title: 'AI Annotation', data: {} });
        }
    }

    function stopOtherCreateAction(name: string) {
        if (editor.actionManager.currentAction) {
            let action = editor.actionManager.currentAction;
            if (action.name === name) return;
            if (createActions.indexOf(action.name as IActionName) >= 0) {
                editor.actionManager.stopCurrentAction();
            }
        }
    }

    return {
        ...toRefs(innerState),
        runModel,
        onModel,
        onTool,
    };
}
