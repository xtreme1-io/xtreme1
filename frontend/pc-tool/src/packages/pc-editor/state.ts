import * as THREE from 'three';
import { IModeType, IModeConfig } from './config/type';
import Modes from './config/mode';

import {
    IConfig,
    IImgViewConfig,
    StatusType,
    IClassType,
    IAnnotationInfo,
    // IUserInfo,
    IFrame,
    IFilter,
    IClassification,
    IAnnotationTag,
    IModelConfig,
    IAnnotationItem,
    LangType,
    IModelClass,
    IModel,
    ICheckConfig,
    IUserData,
} from './type';

export interface IState {
    lang: LangType;
    // pointUrl: string;

    frames: IFrame[];
    frameIndex: number;

    filters: IFilter[];
    filterActive: string[];

    classifications: IClassification[];
    // isSeriesFrame: boolean;
    models: IModel[];
    modelConfig: IModelConfig;
    recentClass: IClassType[];
    // user: IUserInfo;

    // checkConfig: ICheckConfig;

    // 批注
    // annotations: IAnnotationItem[];
    // annotationTags: IAnnotationTag[];
    // annotationInfos: IAnnotationInfo[];
    // 视图显示配置
    config: IConfig;
    // 2D视图配置
    imgViews: IImgViewConfig[];
    // 编辑器模式
    // mode: string;
    modeConfig: IModeConfig;
    // 编辑器状态
    status: StatusType;
    // 当前模式的hotkey
    classTypes: IClassType[];
}

const tags: IAnnotationTag[] = [
    { label: '漏标', value: 'result_empty', id: 'result_empty' },
    { label: '错标', value: 'result_error', id: 'result_error' },
    { label: '标签错误', value: 'lable_error', id: 'lable_error' },
    { label: '不贴合', value: 'not_fit', id: 'not_fit' },
    { label: '多标', value: 'more_error', id: 'more_error' },
    { label: '其他', value: 'other', id: 'other' },
];

export function getDefaultState(): IState {
    const defaultState: IState = {
        lang: 'en',
        // pointUrl: '',
        // user: {
        //     id: 'test-123123',
        // },
        filters: [],
        filterActive: [],
        frames: [],
        frameIndex: -1,

        classifications: [],
        // isSeriesFrame: false,
        models: [],
        modelConfig: {
            confidence: [0.5, 1],
            predict: true,
            classes: {} as { [key: string]: IModelClass[] },
            model: '',
            loading: false,
            start: 0,
            duration: 0,
        },
        // annotations: [],
        recentClass: [],

        // checkConfig: {
        //     type: '3d',
        //     axis: 'z',
        //     trackId: '',
        //     imageIndex: 0,
        //     imageMaxIndex: 0,
        //     showImageMax: false,
        //     showAttr: false,
        //     showAttrType: 'single',
        //     status3D: [],
        //     status2D: [],
        //     subViewHeight: 200,
        //     subViewWidth: 140,
        //     subViewScale: 1,
        // },

        // annotationTags: tags,
        // annotationInfos: [],
        config: getDefaultConfig(),
        imgViews: [],
        // mode: 'empty',
        modeConfig: Modes.empty,
        status: StatusType.Default,
        classTypes: [],
    };

    return defaultState;
}

function getDefaultConfig(): IConfig {
    return {
        imgViewPrefix: 'image-2d-small',
        singleViewPrefix: 'image-2d-max',
        //
        showClassView: false,
        showImgView: true,
        showSingleImgView: false,
        showSideView: true,
        showOperationView: true,
        // showCheckView: false,
        // showCheckClassView: false,
        // showCheckViewImgMax: false,
        showLabel: false,
        // showAnnotation: true,
        showAttr: false,
        enableShowAttr: false,
        //
        filter2DByTrack: false,
        singleImgViewIndex: 0,
        imgRegionIndex: -1,
        //
        activeRect: false,
        active2DBox: false,
        active3DBox: false,
        activeAnnotation: false,
        activeTranslate: false,
        activeTrack: false,
        // project
        projectPoint4: true,
        projectPoint8: true,
        projectMap3d: true,
        // config
        pointSize: 0.1,
        heightRange: [-10000, 10000],
        groundEnable: true,
        trimMin: new THREE.Vector3(-200, -200, -5),
        trimMax: new THREE.Vector3(200, 200, 20),
        // render
        pointColorMode: 'height',
        pointIntensity: [0, 255],
        pointGround: -1.5,
        pointColors: ['#141ff0', '#Fab942'],
        pointHeight: [-10000, 10000],
        pointInfo: {
            count: 0,
            hasIntensity: false,
            intensityRange: new THREE.Vector2(),
            min: new THREE.Vector3(),
            max: new THREE.Vector3(),
        },
        renderRect: true,
        // renderProjectRect: true,
        renderBox: true,
        renderProjectBox: true,
        renderProjectPoint: false,
        //
        FILTER_ALL: 'All',
    };
}
