import { IState } from 'pc-editor';
import Editor from '../../common/Editor';
import { BsUIType as UIType } from '../../config/ui';
import { Component } from 'vue';
import ToolTip from './modelConfig.vue';
export interface IItemConfig {
    action: string;
    label: string;
    title: string;
    getStyle?: (editor: Editor) => any;
    extra?: () => Component;
    hasMsg?: (editor: Editor) => boolean;
    getIcon: (editor: Editor) => string;
    isDisplay: (editor: Editor) => boolean;
    isActive: (editor: Editor) => boolean;
}
export const allItems: IItemConfig[] = [
    {
        action: 'createRect',
        label: 'Rect',
        title: 'Create Rect',
        getIcon: function (editor: Editor) {
            return 'iconfont icon-biaozhunkuang';
        },
        isDisplay: function (editor: Editor) {
            let state = editor.state;
            return (
                state.modeConfig.ui[UIType.create2dRect] &&
                state.config.showSingleImgView &&
                state.config.projectPoint4
            );
        },
        isActive: function (editor: Editor) {
            // return state.config.activeRect;
            return false;
        },
    },
    {
        action: 'create2DBox',
        label: 'Box',
        title: 'Create Box(2D)',
        getIcon: function (editor: Editor) {
            return 'iconfont icon-biaozhunkuang';
        },
        isDisplay: function (editor: Editor) {
            let state = editor.state;
            return (
                state.modeConfig.ui[UIType.create2dBox] &&
                state.config.showSingleImgView &&
                state.config.projectPoint8
            );
        },
        isActive: function (editor: Editor) {
            // return state.config.active2DBox;
            return false;
        },
    },
    {
        action: 'create3DBox',
        label: 'Box',
        title: 'Create Box(3D)',
        getIcon: function (editor: Editor) {
            return 'iconfont icon-biaozhunkuang';
        },
        isDisplay: function (editor: Editor) {
            let state = editor.state;
            return state.modeConfig.ui[UIType.create3dBox] && !state.config.showSingleImgView;
        },
        isActive: function (editor: Editor) {
            // return state.config.active3DBox;
            return false;
        },
    },
    {
        action: 'translate',
        label: 'Trans',
        title: 'Translate',
        getIcon: function (editor: Editor) {
            return 'iconfont icon-yidong';
        },
        isDisplay: function (editor: Editor) {
            let state = editor.state;
            return state.modeConfig.ui[UIType.translate] && !state.config.showSingleImgView;
        },
        isActive: function (editor: Editor) {
            let state = editor.state;
            return state.config.activeTranslate;
        },
    },
    // {
    //     action: 'projection',
    //     label: 'Project',
    //     title: 'Projection',
    //     getIcon: function (editor: Editor) {
    //         return 'iconfont icon-yingshe';
    //     },
    //     isDisplay: function (editor: Editor) {
    //         let state = editor.state;
    //         return (
    //             state.modeConfig.ui[UIType.project] &&
    //             (state.config.projectPoint4 === true || state.config.projectPoint8 === true)
    //         );
    //     },
    //     isActive: function (editor: Editor) {
    //         return false;
    //     },
    // },
    // {
    //     action: 'reProjection',
    //     label: 'Re-Projection',
    //     title: 'Re-Projection',
    //     getIcon: function (editor: Editor) {
    //         return 'iconfont icon-xuanzhuan';
    //     },
    //     isDisplay: function (editor: Editor) {
    //         let state = editor.state;
    //         return (
    //             state.modeConfig.ui[UIType.reProject] &&
    //             (state.config.projectPoint4 === true || state.config.projectPoint8 === true)
    //         );
    //     },
    //     isActive: function (editor: Editor) {
    //         return false;
    //     },
    // },
    {
        action: 'track',
        label: 'Track',
        title: 'Track Line',
        getIcon: function (editor: Editor) {
            return 'iconfont icon-fuzhuxian';
        },
        isDisplay: function (editor: Editor) {
            let state = editor.state;
            return state.modeConfig.ui[UIType.track] && state.config.showSingleImgView;
        },
        isActive: function (editor: Editor) {
            let state = editor.state;
            return state.config.activeTrack;
        },
    },
    {
        action: 'filter2D',
        label: 'filter2D',
        title: 'Filter other object in 2d view',
        getIcon: function (editor: Editor) {
            return 'iconfont icon-shaixuan';
        },
        isDisplay: function (editor: Editor) {
            let state = editor.state;
            return state.modeConfig.ui[UIType.filter2D];
        },
        isActive: function (editor: Editor) {
            let state = editor.state;
            return state.config.filter2DByTrack;
        },
    },
    {
        action: 'model',
        label: 'Model',
        title: 'Run Model',
        hasMsg: function (editor: Editor) {
            let state = editor.state;
            let dataInfo = state.frames[state.frameIndex];
            return dataInfo && !!dataInfo.model && dataInfo.model.state === 'complete';
        },
        extra: () => ToolTip,
        getStyle: function (editor: Editor) {
            return {
                'margin-bottom': 0,
                'border-bottom-right-radius': 0,
                'border-bottom-left-radius': 0,
                'padding-bottom': 0,
            };
        },
        getIcon: function (editor: Editor) {
            let state = editor.state;
            let dataInfo = state.frames[state.frameIndex];
            return dataInfo && !!dataInfo.model && dataInfo.model.state === 'loading'
                ? 'iconfont icon-loading loading'
                : 'iconfont icon-Vector';
        },
        isDisplay: function (editor: Editor) {
            let state = editor.state;
            return state.modeConfig.ui[UIType.rumModel] && !state.config.showSingleImgView;
        },
        isActive: function (editor: Editor) {
            let state = editor.state;
            let dataInfo = state.frames[state.frameIndex];
            return dataInfo && !!dataInfo.model && dataInfo.model.state === 'loading';
        },
    },
];
