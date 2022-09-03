import { reactive, toRefs } from 'vue';
import { useInjectTool } from '../../state';
import { IModelResult, IModel } from '../../type';
import * as api from '../../api';
import BSError from '../../common/BSError';
import { allItems } from './item';
import { BsUIType } from '../../config/ui';
import { handleError } from '../../utils';
export interface IClass {
    label: string;
    value: string;
    selected: boolean;
}
export default function useTool() {
    let tool = useInjectTool();
    let editor = tool.editor;
    let innerState = reactive({
        allItems,
    });

    function onTool(name: string, args?: any) {
        // let config = editor.state.config;
        console.log('select', name);
        switch (name) {
            case 'edit': {
                if (editor.toolConfig.isDrawing) {
                    handleError(tool, new BSError('', 'Please finish drawing first'));
                    return;
                }
                if (editor.tool) {
                    editor.tool.toolmanager.currentTool = null;
                }
                editor.tool?.setMode('edit');
                editor.state.activeItem = BsUIType.edit;
                editor.state.helpLineVisible = false;
                break;
            }
            case 'rectangle':
            case 'polygon':
            case 'polyline': {
                if (editor.toolConfig.isDrawing) {
                    handleError(tool, new BSError('', 'Please finish drawing first'));
                    return;
                }
                editor.tool?.setMode('draw');
                editor.tool?.toolmanager.selectTool(name);
                editor.state.activeItem = BsUIType[name];
                editor.state.helpLineVisible = true;
                break;
            }
            case 'model':
                if (editor.toolConfig.isDrawing) {
                    handleError(tool, new BSError('', 'Please finish drawing first'));
                    return;
                }
                onModel();
                break;
            case 'interactive': {
                if (editor.toolConfig.isDrawing) {
                    handleError(tool, new BSError('', 'Please finish drawing first'));
                    return;
                }
                editor.tool?.setMode('draw');
                editor.tool?.toolmanager.selectTool('interactive');
                editor.state.activeItem = BsUIType.interactive;
                editor.state.helpLineVisible = true;
                break;
            }
            case 'addInterior': {
                editor.tool?.addInteriorToShape();
                // editor.cmdManager.execute('add-interior', {});
                break;
            }
            case 'removeInterior': {
                editor.tool?.removeInterior();
                // editor.cmdManager.execute('remove-interior', {});
                break;
            }
            case 'clipPolygon': {
                editor.tool?.clipPolygon(args);
                break;
            }
        }
    }
    async function runModel() {
        const modelConfig = tool.state.modelConfig;
        if (!modelConfig.model) {
            editor.showMsg('warning', 'Please choose Model');
            return;
        }
        let toolState = tool.state;
        let data = toolState.dataList[toolState.dataIndex];
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
            datasetId: data.datasetId,
            dataIds: [+data.dataId],
            modelId: +model.id,
            modelVersion: model?.version,
            dataType: 'SINGLE_DATA',
            modelCode: model.code,
            // annotationRecordId: +toolState.recordId,
            resultFilterParam,
        };

        modelConfig.loading = true;
        try {
            let result = await api.runModel(config);
            if (!result.data) throw new Error('Model Run Error');
            data.model = {
                recordId: result.data,
                id: model.id,
                version: model.version,
                state: 'loading',
            };
        } catch (error) {
            tool.editor.showMsg('error', 'Model Run Error');
        }
        modelConfig.loading = false;
        tool.dataManager.pollDataModelResult();
    }
    function onModel() {
        let toolState = tool.state;
        let dataInfo = toolState.dataList[toolState.dataIndex];

        if (dataInfo.loadState === 'loading') return;

        // if (dataInfo.model) {
        if (dataInfo.model && dataInfo.model.state === 'complete') {
            let model = dataInfo.model as IModelResult;
            console.log(model);
            editor.showConfirm({ title: 'Model Results', subTitle: 'Add Results?' }).then(
                async () => {
                    await api.clearModel([+dataInfo.dataId], model.recordId);
                    tool.addModelData();
                },
                () => {},
            );
        } else {
            // editor.showModal('modelRun', { title: 'AI Annotation', data: {} });
            runModel();
        }
    }
    return {
        ...toRefs(innerState),
        runModel,
        onTool,
    };
}
