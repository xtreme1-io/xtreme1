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
    IResultSource,
    ICheckConfig,
    IUserData,
} from './type';

const withoutTaskId = '-1';
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

    config: IConfig;
    imgViews: IImgViewConfig[];
    modeConfig: IModeConfig;
    status: StatusType;
    activeSourceData: string;
    sources: IResultSource[];
    sourceFilters: string[];
    classTypes: IClassType[];
}

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

        config: getDefaultConfig(),
        imgViews: [],
        // mode: 'empty',
        modeConfig: Modes.empty,
        status: StatusType.Default,
        classTypes: [],
        activeSourceData: withoutTaskId,
        sources: [],
        sourceFilters: [],
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
            vCount: 0,
        },
        renderRect: true,
        // renderProjectRect: true,
        renderBox: true,
        renderProjectBox: true,
        renderProjectPoint: false,
        //
        FILTER_ALL: 'All',
        aspectRatio: 1.78,
        maxViewHeight: '100%',
        maxViewWidth: '100%',
        limitRect2Image: true,
        withoutTaskId: withoutTaskId,
    };
}
