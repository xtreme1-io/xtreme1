import CmdManager from './common/CmdManager';
import HotkeyManager from './common/HotkeyManager';
import ActionManager from './common/ActionManager';
import ViewManager from './common/ViewManager';
import ConfigManager from './common/ConfigManager';
import DataManager from './common/DataManager';
import BusinessManager from './common/BusinessManager';
import LoadManager from './common/LoadManager';
import DataResource from './common/DataResource';
import ModelManager from './common/ModelManager';

import { getDefaultState } from './state';
import type { IState } from './state';
import {
    IUserData,
    IClassType,
    IImgViewConfig,
    LangType,
    IFrame,
    Const,
    IResultSource,
} from './type';
import { IModeType, OPType, IModeConfig } from './config/type';
import * as _ from 'lodash';
import * as THREE from 'three';
import Event from './config/event';
import { nanoid } from 'nanoid';
import Mustache from 'mustache';
import BSError from './common/BSError';
import * as locale from './lang';
import * as utils from './utils';
import { RegisterFn, ModalFn, MsgFn, ConfirmFn, LoadingFn } from './uitype';

type LocaleType = typeof locale;

export default class Editor extends THREE.EventDispatcher {
    idCount: number = 1;
    state: IState;
    // currentTrack: string | null = null;
    frameMap: Map<string, IFrame> = new Map();
    frameIndexMap: Map<string, number> = new Map();
    classMap: Map<string, IClassType> = new Map();
    needUpdateFilter: boolean = true;
    eventSource: string = '';

    cmdManager: CmdManager;
    hotkeyManager: HotkeyManager;
    actionManager: ActionManager;
    viewManager: ViewManager;
    configManager: ConfigManager;
    dataManager: DataManager;
    businessManager: BusinessManager;
    // playManager: PlayManager;
    loadManager: LoadManager;
    dataResource: DataResource;
    modelManager: ModelManager;
    // trackManager: TrackManager;

    // ui
    registerModal: RegisterFn = () => {};
    showModal: ModalFn = () => Promise.resolve();
    showMsg: MsgFn = () => {};
    showConfirm: ConfirmFn = () => Promise.resolve();
    showLoading: LoadingFn = () => {};

    constructor() {
        super();

        this.state = getDefaultState();

        this.cmdManager = new CmdManager(this);
        this.hotkeyManager = new HotkeyManager(this);
        this.actionManager = new ActionManager(this);
        this.viewManager = new ViewManager(this);
        this.configManager = new ConfigManager(this);
        this.dataManager = new DataManager(this);
        // this.playManager = new PlayManager(this);
        this.loadManager = new LoadManager(this);
        this.dataResource = new DataResource(this);
        this.businessManager = new BusinessManager(this);
        this.modelManager = new ModelManager(this);
        // this.trackManager = new TrackManager(this)

        this.initEvent();

        // util
        this.blurPage = _.throttle(this.blurPage.bind(this), 40);
    }

    initEvent() {
    }

    // locale
    lang<T extends keyof LocaleType['en']>(name: T, args?: Record<string, any>) {
        return this.getLocale(name, locale, args);
    }

    getLocale<T extends Record<LangType, Record<string, string>>, D extends keyof T['en']>(
        name: D,
        locale: T,
        args?: Record<string, any>,
    ) {
        let lang = this.state.lang;
        let langObject = locale[lang];
        if (!langObject) return '';
        let msg = langObject[name as any] || '';
        if (args) {
            msg = Mustache.render(msg, args);
        }
        return msg;
    }

    bindLocale<T extends Record<LangType, Record<string, string>>>(locale: T) {
        let bindGet = <D extends keyof T['en']>(name: D, args?: Record<string, any>) => {
            return this.getLocale(name, locale, args);
        };
        return bindGet;
    }

    withEventSource(source: string, fn: () => void) {
        this.eventSource = source;
        try {
            fn();
        } catch (e: any) {}
        this.eventSource = '';
    }

    async loadFrame(index: number, showLoading: boolean = true, force: boolean = false) {
        await this.loadManager.loadFrame(index, showLoading, force);
    }

    getCurrentFrame() {
        return this.state.frames[this.state.frameIndex];
    }
    // trackId
    createTrackId() {
        return nanoid(16);
    }

    // trackName
    getId() {
        // return THREE.MathUtils.generateUUID();
        return this.idCount++ + '';
    }

    // setCurrentTrack(trackId: string | null = null) {
    //     if (this.currentTrack !== trackId) {
    //         this.currentTrack = trackId;
    //         this.dispatchEvent({ type: Event.CURRENT_TRACK_CHANGE, data: this.currentTrack });
    //     }
    // }
    getCurTrack() {
    }
    // create
    createAnnotate3D(
        position: THREE.Vector3,
        scale: THREE.Vector3,
        rotation: THREE.Euler,
        userData: IUserData = {},
    ) {
        let object = utils.createAnnotate3D(this, position, scale, rotation, userData);
        utils.setIdInfo(this, object.userData);
        return object;
    }

    createAnnotateRect(center: THREE.Vector2, size: THREE.Vector2, userData: IUserData = {}) {
        let object = utils.createAnnotateRect(this, center, size, userData);
        utils.setIdInfo(this, object.userData);
        return object;
    }

    createAnnotateBox2D(positions1: any, positions2: any, userData: IUserData = {}) {
        let object = utils.createAnnotateBox2D(this, positions1, positions2, userData);
        utils.setIdInfo(this, object.userData);
        return object;
    }

    setFrames(frames: IFrame[]) {
        this.frameMap.clear();
        this.state.frames = frames;
        frames.forEach((e, index) => {
            this.frameMap.set(e.id + '', e);
            this.frameIndexMap.set(e.id + '', index);
        });
    }

    getFrameIndex(frameId: string) {
        return this.frameIndexMap.get(frameId + '') as number;
    }
    getFrame(frameId: string) {
        return this.frameMap.get(frameId + '') as IFrame;
    }

    getObjectUserData(object: any, frame?: IFrame) {
        // let { isSeriesFrame } = this.state;

        let userData = object.userData as Required<IUserData>;
        let trackId = userData.trackId as string;
        // if (isSeriesFrame) {
        //     let globalTrack = this.trackManager.getTrackObject(trackId) || {};
        //     Object.assign(userData, globalTrack);
        // }
        return userData;
    }

    updateObjectRenderInfo(objects: any) {
    }

    // set get
    setClassTypes(classTypes: IClassType[]) {
        this.classMap.clear();
        this.state.classTypes = classTypes;
        classTypes.forEach((e) => {
            this.classMap.set(e.name + '', e);
            this.classMap.set(e.id + '', e);
        });
    }

    getClassType(name: string | IUserData) {
        if (name instanceof Object) {
            let { classId, classType } = name;
            let key = classId || classType;
            return this.classMap.get(key + '') as IClassType;
        } else {
            return this.classMap.get(name + '') as IClassType;
        }
    }
    async getResultSources(frame?: IFrame): Promise<void> {}
    setSources(sources: IResultSource[]) {
        if (!sources) return;
        let { FILTER_ALL, withoutTaskId } = this.state.config;
        this.state.sources = sources;

        let sourceMap = {};
        sources.forEach((e) => {
            sourceMap[e.sourceId] = true;
        });

        this.state.sourceFilters = this.state.sourceFilters.filter((e) => sourceMap[e]);
        if (this.state.sourceFilters.length === 0) this.state.sourceFilters = [FILTER_ALL];
    }
    setMode(modeConfig: IModeConfig) {
        // this.state.mode = modeConfig.name || '';
        this.state.modeConfig = modeConfig;
        this.hotkeyManager.setHotKeyFromAction(this.state.modeConfig.actions);
        this.viewManager.updateViewStatus();
    }

    focusObject(object: THREE.Object3D) {
        let view = this.viewManager.getMainView();
        view.focusPosition(object.position);
    }

    focusPosition(position: THREE.Vector3) {
        let view = this.viewManager.getMainView();
        view.focusPosition(position);
    }

    setPointCloudData(data: any, ground: number, intensityRange?: [number, number]) {
        // this.dispatchEvent({ type: Event.LOAD_POINT_AFTER });
    }

    frameChange(frames?: IFrame | IFrame[]) {
        frames = frames || this.state.frames;
        if (!Array.isArray(frames)) frames = [frames];

        frames.forEach((frame) => {
            frame.needSave = true;
        });
    }

    handleErr(err: BSError | Error, message: string = '') {
        if (err instanceof BSError) {
            utils.handleError(this, err);
        } else {
            utils.handleError(this, new BSError('', message, err));
        }
    }

    updateIDCounter() {
        let id = this.dataManager.getMaxId();
        this.idCount = id + 1;
    }

    reset() {
        this.state.frameIndex = -1;
        this.state.frames = [];
        this.dataManager.clear();
        this.dataResource.clear();
    }

    clear() {
    }

    toggleTranslate(flag: boolean, object?: THREE.Object3D) {
    }

    blurPage() {
        if (document.activeElement && document.activeElement !== document.body) {
            (document.activeElement as any).blur();
        }
    }

    selectObject(objects?: any) {
    }

    selectByTrackId(trackId: string) {
    }

    updateSelect() {
    }
}
