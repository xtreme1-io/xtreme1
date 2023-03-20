// import type { FormInstance } from 'ant-design-vue';
export interface IUser {
    id: string;
    nickname: string;
}

export interface IObjectV2 {
    id?: string;
    type?: ObjectType;
    version?: number;
    createdBy?: number;
    createdAt?: string;

    trackId?: string;
    trackName?: string;
    classId?: string;
    className?: string;
    backId?: string;
    frontId?: string;
    classType?: string;
    classValues?: any[];
    // classValues?: Record<string, any>;
    modelConfidence?: number;
    modelClass?: string;
    contour: {
        [k: string]: any;
    };
    meta?: {
        [k: string]: any;
    };
    // other
    sourceId?: string;
    sourceType?: string;
}

export interface IModelConfig {
    confidence: number[];
    predict: boolean;
    classes: { [key: string]: IModelClass[] };
    model: string;
    loading: boolean;
}
export interface IToolConfig {
    FILTER_ALL: string;
}

export enum SourceType {
    TASK = 'TASK',
    DATA_FLOW = 'DATA_FLOW',
    MODEL = 'MODEL',
}

export interface IResultSource {
    name: string;
    sourceId: string;
    sourceType: SourceType;
    modelId?: string;
    modelName?: string;
}
export interface IToolState {
    query: Record<string, string>;
    // flow
    saving: boolean;
    //
    models: IModel[];
    // serial number
    recordId: string;
    // dataset
    datasetId: string;
    //
    user: IUser;
    // data
    dataList: IDataMeta[];
    dataIndex: number;
    // classification config
    classifications: IClassification[];
    // classificationForm: FormInstance | null;
    showVerify?: boolean;
    // run model config
    modelConfig: IModelConfig;
    resultActive?: any;
    seriesFrameId?: any;
    resultFilter?: any;
    sources: IResultSource[];
    sourceFilters: string[];
    activeSourceData: string;
    FILTER_ALL: string;
    withoutTaskId: string;
    focus?: any;
}

export interface IDataMeta {
    datasetId: string;
    // id
    dataId: string;
    // uuid
    // id: string;
    teamId?: string;
    imageUrl: string;
    queryTime: string;
    // autoload
    loadState: LoadStatus;
    // model
    model?: IModelResult;
    // classification values
    classifications: IClassification[];
    // save
    needSave: boolean;
    resultExist?: boolean;
    dataConfig: IFileConfig;
    validStatus: any;
    annotationStatus: any;
    isAnnotated: boolean;
    sources?: IResultSource[];
}

export interface IFileConfig {
    // dirName: string;
    name: string;
    size: number;
    url: string;
}

export type IAction = 'save';

export interface IPageHandler {
    init: () => void;
    onAction: (e: IAction) => void;
}

export type LoadStatus = '' | 'loading' | 'complete' | 'error';

export interface IModelResult {
    recordId: string;
    id: string;
    version: string;
    state?: LoadStatus;
}
export type PointAttr = 'position' | 'color' | string;
export interface IDataResource {
    time: number;
    // position
    image: HTMLImageElement | string;
}

export interface IResourceLoader {
    data: IDataMeta;
    getResource: () => Promise<IDataResource>;
    onProgress?: (percent: number) => void;
}

export enum ObjectType {
    TYPE_3D = '3d',
    TYPE_RECT = 'rect',
    TYPE_BOX2D = 'box2d',
}
export interface IObject {
    frontId?: string;
    uuid?: string;
    objType: string;
    id: string;
    classType: string;
    attrs: Record<string, any>;
    // model
    confidence?: number;
    modelClass?: string;
    modelRun?: string;
    //
    coordinate: THREE.Vector2[];
    color: string;
}

export interface IResultFilter {
    value?: string;
    label: string;
    type: '' | 'project' | 'model';
    options?: { value: string; label: string }[];
}

export interface IModel {
    id: string;
    name: string;
    version: string;
    classes: IModelClass[];
    code: string;
}
export interface IModelClass {
    code: string;
    name: string;
    label: string;
    value: string;
    selected?: boolean;
    subClasses?: IModelClass;
    url: string;
}
export interface IClassificationAttr {
    classificationId: string;
    parent: string;
    parentAttr: string;
    parentValue: any;
    id: string;
    type: AttrType;
    name: string;
    label?: string;
    required: boolean;
    options: { value: any; label: string }[];
    value: any;
}

export interface IClassification {
    id: string;
    name: string;
    label?: string;
    attrs: IClassificationAttr[];
}

export interface IModel {
    id: string;
    name: string;
    version: string;
    classes: IModelClass[];
    code: string;
}

export enum AttrType {
    RADIO = 'RADIO',
    MULTI_SELECTION = 'MULTI_SELECTION',
    DROPDOWN = 'DROPDOWN',
    TEXT = 'TEXT',
}

export interface Point {
    x: number;
    y: number;
}
export interface Box2D {
    type: ObjectType;
    uuid: string;
    intId: number;
    classType: string;
    attrs: Record<string, any>;
    points: Point[];
}
export type AnnotateObject = Box2D;

export type IClassType = any;
