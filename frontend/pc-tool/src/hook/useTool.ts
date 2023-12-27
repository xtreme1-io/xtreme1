import { useInjectEditor } from '../state';
import * as api from '../api';
import { BSError } from 'pc-editor';
import * as THREE from 'three';

export default function useTool() {
    let editor = useInjectEditor();
    let { bsState, state } = editor;

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

    async function loadRecord() {
        try {
            let { dataInfos, isSeriesFrame, seriesFrameId } = await api.getInfoByRecordId(
                bsState.recordId,
            );
            state.isSeriesFrame = isSeriesFrame;
            bsState.seriesFrameId = seriesFrameId;
            let dataId = bsState.query.dataId;
            if (dataId) {
                dataInfos = dataInfos.filter((data) => data.id === dataId);
            }
            if (dataInfos.length === 0) {
                throw '';
            }
            // let copys = [...dataInfos];
            // let time = Date.now();
            // [...Array(10)].forEach(() => {
            //     dataInfos.forEach((e) => {
            //         copys.push({ ...e });
            //     });
            // });
            // editor.setFrames(copys);

            editor.setFrames(dataInfos);
            bsState.datasetId = dataInfos[0].datasetId + '';
        } catch (error) {
            throw new BSError('', editor.lang('load-record-error'), error);
        }
    }

    async function loadUserInfo() {
        try {
            const data = await api.getUserInfo();
            Object.assign(editor.bsState.user, {
                id: data.id,
                nickname: data.nickname,
                username: data.username,
            });
        } catch (error) {
            throw new BSError('', 'load user info error', error);
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
    async function loadDataFromFrameSeries(frameSeriesId: string) {
        try {
            const { datasetId } = editor.bsState;
            const frames = await api.getFrameSeriesData(datasetId, frameSeriesId);
            if (frames.length === 0) throw new BSError('', 'load scene error');
            // state.frames = frames;
            editor.setFrames(frames);
        } catch (error) {
            throw error instanceof BSError ? error : new BSError('', 'load scene error', error);
        }
    }

    return {
        loadUserInfo,
        loadModels,
        loadClasses,
        loadDataSetInfo,
        loadRecord,
        loadDateSetClassification,
        loadDataFromFrameSeries,
    };
}
