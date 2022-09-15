import { UIType } from 'editor';
import Tool from '../../common/Tool';
import { Component } from 'vue';
import ModelToolTip from './modelConfig.vue';
import InteractiveToolTip from './InteractiveConfig.vue';
export interface IItemConfig {
    action: string;
    title: string;
    hotkey: number;
    bottomBar: boolean;
    // active: boolean;
    // display: boolean;
    getStyle?: (tool: Tool) => object;
    extra?: () => Component;
    hasMsg?: (tool: Tool) => boolean;
    getIcon: (tool: Tool) => string;
    isDisplay: (tool: Tool) => boolean;
    isActive: (tool: Tool) => boolean;
}

export const allItems: IItemConfig[] = [
    {
        action: 'edit',
        title: 'Resize',
        hotkey: 2,
        bottomBar: true,
        getIcon: function (tool: Tool) {
            return 'iconfont icon-edit';
        },
        isDisplay: function (tool: Tool) {
            let state = tool.editor.state;
            return state.modeConfig.ui[UIType.edit];
        },
        isActive: function (tool: Tool) {
            let state = tool.editor.state;
            return state.activeItem === UIType.edit;
        },
    },
    {
        action: 'rectangle',
        title: 'Rectangle',
        hotkey: 3,
        bottomBar: false,
        getIcon: function (tool: Tool) {
            return 'iconfont icon-rectangle';
        },
        isDisplay: function (tool: Tool) {
            let state = tool.editor.state;
            return state.modeConfig.ui[UIType.rectangle];
        },
        isActive: function (tool: Tool) {
            let state = tool.editor.state;
            return state.activeItem === UIType.rectangle;
        },
    },
    {
        action: 'polygon',
        title: 'Polygon',
        hotkey: 4,
        bottomBar: false,
        getIcon: function (tool: Tool) {
            return 'iconfont icon-polygon';
        },
        isDisplay: function (tool: Tool) {
            let state = tool.editor.state;
            return state.modeConfig.ui[UIType.polygon];
        },
        isActive: function (tool: Tool) {
            let state = tool.editor.state;
            return state.activeItem === UIType.polygon;
        },
    },
    {
        action: 'polyline',
        title: 'Polyline',
        hotkey: 5,
        bottomBar: true,
        getIcon: function (tool: Tool) {
            return 'iconfont icon-polyline';
        },
        isDisplay: function (tool: Tool) {
            let state = tool.editor.state;
            return state.modeConfig.ui[UIType.polyline];
        },
        isActive: function (tool: Tool) {
            let state = tool.editor.state;
            return state.activeItem === UIType.polyline;
        },
    },
    {
        action: 'model',
        title: 'Smart Tool',
        hotkey: 7,
        bottomBar: false,
        hasMsg: function (tool: Tool) {
            let state = tool.state;
            let dataInfo = state.dataList[state.dataIndex];
            return dataInfo && !!dataInfo.model && dataInfo.model.state === 'complete';
        },
        extra: () => ModelToolTip,
        getStyle: function (tool: Tool) {
            return {
                'margin-bottom': 0,
                'border-bottom-right-radius': 0,
                'border-bottom-left-radius': 0,
                'padding-bottom': 0,
                'margin-top': 4,
            };
        },
        getIcon: function (tool: Tool) {
            let state = tool.state;
            let dataInfo = state.dataList[state.dataIndex];
            return dataInfo && !!dataInfo.model && dataInfo.model.state === 'loading'
                ? 'iconfont icon-loading loading'
                : 'iconfont icon-ai';
        },
        isDisplay: function (tool: Tool) {
            let state = tool.editor.state;
            return state.modeConfig.ui[UIType.model];
        },
        isActive: function (tool: Tool) {
            let state = tool.state;
            let dataInfo = state.dataList[state.dataIndex];
            return dataInfo && !!dataInfo.model && dataInfo.model.state === 'loading';
            // return state.activeItem === UIType.model;
        },
    },
    // {
    //     action: 'interactive',
    //     title: 'Interactive Tool',
    //     hotkey: 8,
    //     bottomBar: false,
    //     // extra: () => InteractiveToolTip,
    //     // getStyle: function (tool: Tool) {
    //     //     return {
    //     //         'margin-bottom': 0,
    //     //         'border-bottom-right-radius': 0,
    //     //         'border-bottom-left-radius': 0,
    //     //         'padding-bottom': 0,
    //     //         'margin-top': 4,
    //     //         background: '#1e1f22',
    //     //     };
    //     // },
    //     getIcon: function (tool: Tool) {
    //         return 'iconfont icon-interactive';
    //         // return 'iconfont icon-interactive interactive';
    //     },
    //     isDisplay: function (tool: Tool) {
    //         let state = tool.editor.state;
    //         return state.modeConfig.ui[UIType.interactive];
    //     },
    //     isActive: function (tool: Tool) {
    //         let state = tool.editor.state;
    //         return state.activeItem === UIType.interactive;
    //     },
    // },
];
