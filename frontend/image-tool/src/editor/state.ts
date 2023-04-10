// import type { IActionName } from './ActionManager/type';
// import type { IHotkeyConfig } from './HotkeyManager/type';
import type { IModeConfig } from './config/type';
// import * as THREE from 'three';
import { IModeType } from './config/type';
import Modes from './config/mode';

import {
    StatusType,
    IClassType,
    IAnnotationInfo,
    IUserInfo,
    IAttr,
    IAnnotationTag,
    ValidStatus,
    AnnotateStatus,
} from './type';

let i18n = {
    info_title: '信息',
    info_datainfo: '数据信息',
    info_pointinfo: '点信息',
    info_pointall: '真实',
    info_pointvisible: '可见',
    setting_display: '显示',
    setting_imgview: '图片显示',
    setting_rect: '矩形框',
    setting_box: '立体框',
    setting_projectbox: '映射立体框',
    setting_projectpoint: '映射点',
    setting_pointview: '点云显示',
    setting_pointsize: '点大小',
    setting_pointreset: '重置',
    setting_resultview: '结果显示',
    setting_showlabel: '显示标签(M)',
    setting_showannotate: '显示批注(Shift+H)',
    side_overhead: '俯视图',
    side_side: '侧视图',
    side_near: '后视图',
    side_length: '长',
    side_width: '宽',
    side_height: '高',
    imgMax_link: '关联结果',
    mainInfo_result: '结果',
    mainInfo_length: '长度',
    mainInfo_width: '宽度',
    mainInfo_height: '高度',
    mainInfo_points: '点数',
    mainInfo_position: '位置',
    mainInfo_infinity: '正无穷',
};

export type I18N = typeof i18n;
export interface IClassEditStyle {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface IEditorState {
    imageUrl: string;
    withoutTaskId: string;
    user: IUserInfo;
    annotationTags: IAnnotationTag[];
    annotations: IAnnotationInfo[];
    mode: string;
    modeConfig: IModeConfig;
    status: StatusType;
    activeItem: string;
    // hotkeyConfig: IHotkeyConfig[];
    classTypes: IClassType[];
    workInfo: (IAttr & { value: any })[];
    // i18n: I18N;
    showClassView: boolean;
    classEditStyle: IClassEditStyle;
    dataId: string;
    dataName: string;
    imageWidth: number;
    imageHeight: number;
    imageSize: number;
    helpLineVisible: boolean;
    showAttrs: boolean;
    showSize: boolean;
    showSizeTips: boolean;
    allVisible: boolean;
    showKeyboard: boolean;
    showMask: boolean;
    validStatus: ValidStatus;
    annotationStatus: AnnotateStatus;
    isAnnotated: boolean;
    focusId?: number;
}

const tags: IAnnotationTag[] = [
    { label: '漏标', value: 'result_empty', id: 'result_empty' },
    { label: '错标', value: 'result_error', id: 'result_error' },
    { label: '标签错误', value: 'lable_error', id: 'lable_error' },
    { label: '不贴合', value: 'not_fit', id: 'not_fit' },
    { label: '多标', value: 'more_error', id: 'more_error' },
    { label: '其他', value: 'other', id: 'other' },
];

export function getDefaultState(): IEditorState {
    const defaultState: IEditorState = {
        imageUrl: '',
        user: {
            id: 'test-123123',
        },
        withoutTaskId: '-1',
        annotationTags: tags,
        annotations: [],
        mode: 'empty',
        modeConfig: Modes.empty,
        status: StatusType.Default,
        activeItem: '',
        // hotkeyConfig: [],
        classTypes: [],
        workInfo: [],
        // i18n,
        showClassView: false,
        classEditStyle: { x: 0, y: 0, width: 0, height: 0 },
        dataId: '',
        dataName: '',
        imageWidth: 0,
        imageHeight: 0,
        imageSize: 0,
        helpLineVisible: false,
        showAttrs: false,
        showSize: false,
        showSizeTips: true,
        allVisible: true,
        showKeyboard: false,
        showMask: false,
        validStatus: ValidStatus.VALID,
        annotationStatus: AnnotateStatus.NOT_ANNOTATED,
    };

    return defaultState;
}
