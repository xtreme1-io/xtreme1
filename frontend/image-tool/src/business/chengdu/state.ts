import { provide, inject, reactive } from 'vue';
import Tool from './common/Tool';
import { Editor } from 'editor/Editor';
import { IToolState, IToolConfig, IModelClass } from './type';
// import { initRegistry } from './registry';

import { useProvideEditor, useProvideEditorState } from 'editor/inject';

export function getDefaultConfig(): IToolConfig {
    return {
        FILTER_ALL: 'All',
    };
}
let withoutTaskId = '-1';
let FILTER_ALL = 'All';
export function getDefault(): IToolState {
    return {
        query: {},
        // flow
        saving: false,
        //
        models: [],
        // serial number
        recordId: '',
        // dataset
        datasetId: '',
        //
        // data
        dataList: [],
        dataIndex: -1,
        // classification config
        classifications: [],
        sources: [],
        sourceFilters: [FILTER_ALL],
        activeSourceData: withoutTaskId,
        FILTER_ALL: 'All',
        withoutTaskId: withoutTaskId,
        // user
        user: {
            id: '',
            nickname: '',
        },
        // classificationForm: null,
        showVerify: false,
        modelConfig: {
            confidence: [0.5, 1],
            predict: true,
            classes: {} as { [key: string]: IModelClass[] },
            model: '',
            loading: false,
        },
    };
}

// global state
export const toolContext = Symbol('pc-tool-image-tool');
export function useProvideTool() {
    let tool = new Tool();
    // @ts-ignore
    window.tool = tool;
    // @ts-ignore
    tool.state = reactive(tool.state);
    tool.editor.state = reactive(tool.editor.state);

    // initRegistry(tool.editor);
    useProvideEditor(tool.editor);
    useProvideEditorState(tool.editor.state);
    provide(toolContext, tool);

    return tool;
}

export function useInjectTool(): Tool {
    return inject(toolContext) as Tool;
}
