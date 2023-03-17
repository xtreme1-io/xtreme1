import { reactive } from 'vue';
import EventEmitter from 'eventemitter3';
import CmdManager from './CmdManager';
import HotkeyManager from './HotkeyManager';
import ActionManager from './ActionManager';
import { getDefaultState } from './state';
import type { IEditorState } from './state';
import { IUserData, IClassType } from './type';
import { IModeType, OPType, IModeConfig, IBisectrixLineConf } from './config/type';
import { Event } from './config/event';
import Modes from './config/mode';
import * as _ from 'lodash';
import { ImageLabel } from './ImageLabel/index';
import { config, IToolConfig } from './ImageLabel/config';
import { getSelectedShapByCurrentTool } from './ImageLabel/util';

export interface IModalOption {
    title: string;
    data?: any;
}

export interface IConfirmOption {
    title: string;
    subTitle: string;
}

export interface ILoadingOption {
    type: 'loading' | 'error';
    content: string;
}

export type MsgType = 'error' | 'warning' | 'success';

// type HideFn = () => void;
type RegisterFn = (name: string, modal: any) => void;
type ModalFn = (name: string | false, option?: IModalOption) => Promise<any>;
type MsgFn = (type: MsgType, msg: string) => void;
type ConfirmFn = (config: IConfirmOption) => Promise<any>;
type WarningFn = (config: IConfirmOption) => Promise<any>;
type LoadingFn = (config: ILoadingOption | boolean) => void;

export class Editor extends EventEmitter {
    idCount: number = 1;
    tool?: ImageLabel;
    cmdManager: CmdManager;
    hotkeyManager: HotkeyManager;
    actionManager: ActionManager;
    state: IEditorState;
    toolConfig: IToolConfig = reactive(config);
    initResize: boolean = false;
    registerModal: RegisterFn = () => {};
    showModal: ModalFn = () => Promise.resolve();
    showMsg: MsgFn = () => {};
    showConfirm: ConfirmFn = () => Promise.resolve();
    showWarning: WarningFn = () => Promise.resolve();
    showLoading: LoadingFn = () => {};
    constructor(tool: any) {
        super();
        // this.tool = new ImageLabel(opt);
        this.cmdManager = new CmdManager(this, tool);
        this.hotkeyManager = new HotkeyManager(this);
        this.actionManager = new ActionManager(this);
        this.state = getDefaultState();
    }
    initTool(opt: any) {
        this.tool = new ImageLabel(opt, this);
        this.tool.on(Event.ADD_OBJECT, (payload) => {
            this.emit(Event.SHOW_CLASS_INFO, payload);
        });
        this.tool.on(Event.CLICK_LABEL, (payload) => {
            payload.data.object.selectShape(true);
            this.emit(Event.SHOW_CLASS_INFO, payload);
        });
        // this.tool.on(Event.SELECT, (payload) => {
        //     this.emit(Event.SELECT, payload);
        // });
        // this.tool.on(Event.LOAD_OBJECTS, (payload) => {
        //     this.emit(Event.LOAD_OBJECTS, payload);
        // });
        Object.values(Event).forEach((evt) => {
            this.tool?.on(evt, (payload) => {
                this.emit(evt, payload);
            });
        });
    }
    addObject(objects: any) {
        this.tool?.fromJSON(objects);
    }
    reset() {
        this.tool?.removeAll(false);
    }
    getObjects() {
        return this.tool?.toJSON() || [];
    }
    loadImage(image: string | HTMLImageElement) {
        return new Promise((resolve, reject) => {
            this.tool?.setBackground(
                image,
                (t) => {
                    this.emit(Event.IMAGE_LOADED, {
                        data: t,
                    });
                    this.state.imageHeight = t.originHeight;
                    this.state.imageWidth = t.originWidth;
                    resolve(t);
                },
                () => {
                    reject();
                },
            );
        });
    }
    // set get
    setClassTypes(classTypes: IClassType[]) {
        this.state.classTypes = classTypes;
    }
    setMode(modeConfig: IModeConfig) {
        console.log('editor - setMode', modeConfig);
        // let config = Modes[mode];
        // if (!config) return;
        this.state.mode = modeConfig.name || '';
        this.state.modeConfig = modeConfig;
        if (this.state.mode === OPType.EXECUTE) {
            this.tool?.setMode('edit');
            this.state.activeItem = 'edit';
        }

        this.hotkeyManager.setHotKeyFromAction(this.state.modeConfig.actions);

        // this.pc.renderViews.forEach((view) => {
        //     this.updateViewAction(view);
        // });
    }
    updateCanvasStyle(config: any) {
        let { brightness, contrast } = config;
        if (this.tool) {
            let canvas = this.tool.background._layer.getCanvas()._canvas;
            canvas.style.filter = `contrast(${(contrast + 100) / 100}) brightness(${
                (brightness + 100) / 100
            })`;
        }
    }
    updateShapeStyle(config: any) {
        let { fillalpha, strokeWidth } = config;
        if (this.tool) {
            this.tool.updateShapeStyle({
                fillalpha,
                strokeWidth,
            });
        }
    }
    toggleShapeSize(status: boolean) {}
    toggleLabel(status: boolean) {
        this.tool?.toggleLabel(status);
    }
    toggleAttrs(status: boolean) {}
    updateViewType(viewType: string) {
        this.tool?.toggleMask(viewType);
    }
    updateBisectrixLine(config: IBisectrixLineConf) {
        this.tool?.bisectrixLine.update(config);
    }
    setVisible(ids: string[], visible: boolean) {
        this.tool?.setVisible(ids, visible);
    }
    handleToggleKeyboard() {}
    handlePageUp() {}
    handlePageDown() {}
    handleSaveObject() {}
    handleSelectTool(name: string, args?: any) {}
    handleDelete() {
        console.log('this.view:', this.tool);
        const activeAnchor = this?.tool?.activeAnchor;
        const selectShape = getSelectedShapByCurrentTool(this);

        if (!activeAnchor && !selectShape) {
            console.log('empty delete');
        } else if (activeAnchor) {
            const index = activeAnchor;
            console.log('delete point index -- ', index);
            selectShape.removeAnchor(activeAnchor);
        } else if (selectShape) {
            const id = selectShape.uuid;
            console.log('delete object id -- ', id);
            this.showConfirm({ title: 'Delete', subTitle: 'Delete Objects?' }).then(
                () => {
                    this.cmdManager.execute('delete-object', {
                        object: this.tool?.toJSON().filter((record: any) => record.uuid === id),
                        id: id,
                    });
                    this.tool?.removeById(id);
                },
                () => {},
            );
        }
    }
}
