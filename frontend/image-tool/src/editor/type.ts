import type { Vector3 } from 'three';
// import { Vector2Of4, AnnotateType } from 'pc-render';

// export * from './CmdManager/type';
export * from './ActionManager/type';
export * from './HotkeyManager/type';
export * from './config/type';

export type { IEditorState, I18N } from './state';
export type { IModalOption, IConfirmOption, MsgType, ILoadingOption } from './Editor';

export interface IUserData {
    // 结果id
    id?: string;
    // track id
    trackId?: string;
    // 关联结果
    refId?: string;
    refType?: AnnotateType;
    backId?: string;
    // 是否是映射生成的
    isProjection?: boolean;
    // model
    confidence?: number;
    modelClass?: string;
    modelRun?: string;
    project?: string;
    // 标签
    classType?: string;
    // 属性
    attrs?: Record<string, any>;
    // info
    pointN?: number;
    [key: string]: any;
}
export interface IUserInfo {
    id: string;
}
export enum AttrType {
    RADIO = 'RADIO',
    MULTI_SELECTION = 'MULTI_SELECTION',
    DROPDOWN = 'DROPDOWN',
    TEXT = 'TEXT',
}
export interface IAttr {
    type: AttrType;
    name: string;
    label?: string;
    required: boolean;
    options: { value: any; label: string }[];
}

export enum ToolType {
    BOUNDING_BOX = 'BOUNDING_BOX',
    POLYGON = 'POLYGON',
    POLYLINE = 'POLYLINE',
    KEY_POINT = 'KEY_POINT',
}
export enum AnnotateType {
    RECTANGLE = 'rectangle',
    POLYGON = 'polygon',
    POLYLINE = 'polyline',
}

export enum AnnotateType2ToolType {
    rectangle = ToolType.BOUNDING_BOX,
    polygon = ToolType.POLYGON,
    polyline = ToolType.POLYLINE,
}
export enum ToolType2AnnotatteType {
    BOUNDING_BOX = AnnotateType.RECTANGLE,
    POLYGON = AnnotateType.POLYGON,
    POLYLINE = AnnotateType.POLYLINE,
}
export interface IClassType {
    id: string;
    label: string;
    name: string;
    color: string;
    attrs: IAttr[];
    toolType: ToolType;
}

export interface IImgViewConfig {
    cameraInternal: { fx: number; fy: number; cx: number; cy: number };
    cameraExternal: number[];
    imgSize: [number, number];
    imgUrl: string;
    name: string;
}

export interface IConfig {
    // prefix
    imgViewPrefix: string;
    singleViewPrefix: string;
    //
    showClassView: boolean;
    showImgView: boolean;
    showSingleImgView: boolean;
    showSideView: boolean;
    showOperationView: boolean;
    // img view info
    singleImgViewIndex: number;
    imgRegionIndex: number;
    // tool info
    activeRect: boolean;
    active3DBox: boolean;
    active2DBox: boolean;
    activeAnnotation: boolean;
    activeTranslate: boolean;
    activeTrack: boolean;
    // project
    projectPoint4: boolean;
    projectPoint8: boolean;
}

export interface IAnnotationInfo {
    id: string;
    msg: string;
    position?: Vector3;
    objectId?: string;
}

export interface IRenderConfig {
    type: string;
    pointSize: number;
    groundValue: number;
    groundEnable: boolean;
    trimMin: THREE.Vector3;
    trimMax: THREE.Vector3;
    // setting
    renderRect: boolean;
    // renderProjectRect: boolean;
    renderBox: boolean;
    renderProjectBox: boolean;
    renderProjectPoint: boolean;
    // 结果
    showLabel: boolean;
    showAnnotation: boolean;
}

export enum StatusType {
    Default = '',
    // 创建
    Create = 'Create',
    // 加载框
    Loading = 'Loading',
    // 弹窗
    Modal = 'Modal',
    // 确认框
    Confirm = 'Confirm',
}

export interface IAnnotationTag {
    label: string;
    value: string;
    id: string;
}

export interface IPoint {
    x: number;
    y: number;
    angle?: number;
    index?: number;
}

export interface IDim {
    width: number;
    height: number;
    scale: number;
    x: number;
    y: number;
}

// 流转
export enum ValidStatus {
    VALID = 'VALID',
    INVALID = 'INVALID',
}
export enum AnnotateStatus {
    ANNOTATED = 'ANNOTATED',
    NOT_ANNOTATED = 'NOT_ANNOTATED',
    INVALID = 'INVALID',
}
