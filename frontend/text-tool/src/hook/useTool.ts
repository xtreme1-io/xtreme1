import { useInjectEditor } from '../state';
import * as api from '../api';
import { BSError } from 'pc-editor';

export default function useTool() {
    let editor = useInjectEditor();
    let { bsState, state } = editor;
    
    async function loadRecord() {
        try {
            let { dataInfos, datasetId } = await api.getInfoByRecordId(bsState.recordId);
            // state.isSeriesFrame = isSeriesFrame;
            bsState.datasetId = datasetId;
            editor.dataManager.setSceneData(dataInfos);
            loadSceneData(0);
        } catch (error) {
            throw new BSError('', editor.lang('load-record-error'), error);
        }
    }
    // 加载连续帧sceneData
    function loadSceneData(index: number) {
        const { bsState } = editor;
        // bsState.sceneIndex = index;
        // bsState.seriesFrameId = bsState.seriesFrames[index] || '';
        let id = bsState.seriesFrameId || '-1';
        let sceneFrames = editor.dataManager.getFramesBySceneId(id);
        if (sceneFrames.length === 0) return;
        editor.setFrames(sceneFrames);
        editor.loadFrame(0, true, true);
    }







    ////////////////////////////////

    async function loadClasses() {
        try {
            let config = await api.getDataSetClass(bsState.datasetId);
            // test
            // if (config.length > 0) {
            //     config[0].constraint = true;
            //     config[0].size3D = new THREE.Vector3(4, 4, 4);
            // }
            editor.setClassTypes(config);
        } catch (error) {
            throw new BSError('', editor.lang('load-class-error'), error);
        }
    }

    async function loadModels() {
        try {
            let models = await api.getModelList();
            editor.state.models = models;
        } catch (error) {
            throw new BSError('', editor.lang('load-model-error'), error);
        }
    }

    async function loadDateSetClassification() {
        try {
            let classifications = await api.getDataSetClassification(bsState.datasetId);
            editor.state.classifications = classifications;
        } catch (error) {
            throw new BSError('', editor.lang('load-dataset-classification-error'), error);
        }
    }

    async function loadDataSetInfo() {
        try {
            let datasetId = editor.bsState.datasetId;
            let data = await api.getDataSetInfo(datasetId);
            bsState.datasetName = data.name;
            bsState.datasetType = data.type;
        } catch (error) {
            throw new BSError('', 'load data-set info error', error);
        }
    }

    return {
        loadModels,
        loadClasses,
        loadDataSetInfo,
        loadRecord,
        loadDateSetClassification,
    };
}
