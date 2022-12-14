import * as api from '../api';
import { useInjectTool } from '../state';

export default function useTool() {
    let tool = useInjectTool();
    let toolState = tool.state;
    let editor = tool.editor;

    async function loadClasses() {
        let config = await api.getDataSetClass(toolState.datasetId);
        editor.setClassTypes(config);
    }

    async function loadModels() {
        let models = await api.getModelList();
        toolState.models = models;
    }

    async function loadDateSetClassification() {
        let classifications = await api.getDataSetClassification(toolState.datasetId);
        toolState.classifications = classifications;
    }

    async function loadDataFile() {
        let { dataList } = toolState;
        let classifications = await api.getDataFile(dataList[0].dataId);
    }

    async function loadRecord() {
        let { recordId } = toolState;
        let { dataInfos } = await api.getInfoByRecordId(recordId);

        if (dataInfos.length === 0) {
            // editor.showMsg('error', 'No Data');
            // return;
            throw new Error('No Data');
        }
        if (toolState?.focus?.dataId) {
            toolState.dataList = dataInfos.filter(
                (item) => item.dataId == toolState?.focus?.dataId,
            );
            toolState.datasetId = dataInfos[0].datasetId + '';
        } else {
            toolState.dataList = dataInfos;
            toolState.datasetId = dataInfos[0].datasetId + '';
        }
    }

    async function loadInfo() {
        await loadRecord();
        await loadClasses();
        await loadModels();
        await loadDateSetClassification();
        await loadDataFile();
    }
    return {
        loadInfo,
        loadRecord,
        loadClasses,
        loadModels,
        loadDateSetClassification,
    };
}
