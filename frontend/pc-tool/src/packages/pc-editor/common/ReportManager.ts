//@ts-ignore
import MixPanel from 'mixpanel-browser';
import { Editor, Event, ICmdName, IActionName, ActionManager, IFrame } from 'pc-editor';
import {
    Event as RenderEvent,
    AnnotateObject,
    SideRenderView,
    ResizeTransAction,
    MainRenderView,
    SelectAction,
    Image2DRenderView,
} from 'pc-render';
import * as _ from 'lodash';
import { Box } from 'pc-render';
import { noop } from 'lodash';
import { BooleanLiteral } from 'typescript';
//@ts-ignore
window.MixPanel = MixPanel;

var HTTP_PROTOCOL = 'https:' === document.location.protocol ? 'https://' : 'http://';
const defaultInitOption = {
    api_host: HTTP_PROTOCOL + 'api.mixpanel.com',
    app_host: HTTP_PROTOCOL + 'mixpanel.com',
    autotrack: true,
    cdn: HTTP_PROTOCOL + 'cdn.mxpnl.com',
    cross_subdomain_cookie: true,
    persistence: 'cookie',
    persistence_name: '',
    cookie_name: '',
    loaded: function () {},
    store_google: true,
    save_referrer: true,
    test: false,
    verbose: false,
    img: false,
    track_pageview: true,
    debug: false,
    track_links_timeout: 300,
    cookie_expiration: 365,
    upgrade: false,
    disable_persistence: false,
    disable_cookie: false,
    secure_cookie: false,
    ip: true,
    property_blacklist: [],
};

export const ReportEvent = {
    ENTER: 'Enter Lidar Tool',
    CLOSE: 'Close Lidar Tool',
    CHANGE_FRAME: 'Switch Lidar Data',
    LOADED_RESOURCE: 'Finish Loading Lidar Data',
    SELECT_3D_OBJECT: 'Select 3D Object',
    UNSELECT_3D_OBJECT: 'Unselect 3D Object',
    Delete_3D_OBJECT: 'Delete 3D Object',
    EDIT_SIDE: 'Edited Side in Cuboid View',
    EDIT_CORNER: 'Edited Corner in Cuboid View',
    EDIT_POSITION: 'Edited Position in Cuboid View',
    EDIT_ANGLE: 'Rotate in Cuboid View',
    SHORTCUT_UP: 'Used Shortcuts in Cuboid View',
    ATTRIBUTE_PAD_OPEN: 'Show Attribute Pad',
    ATTRIBUTE_PAD_HIDE: 'Hide Attribute Pad',
    RUN_MODEL_DETECTION: 'Run Detection Model',
    ADD_MODEL_RESULT: 'Add Model Results',
    RUN_MODEL_TRACK: 'Run Tracking Model',
    TRACK_SUCCESS: 'Tracking Succeed',
    AUTO_LOAD: 'Auto Load',
    PLAY: 'Play',
    PAUSE: 'Pause',
    REPLAY: 'Replay',
    SPEED_PLAY: 'Speed Play',
};

interface ITrackOption {
    send_immediately: boolean;
    transport: 'xhr' | 'sendBeacon';
}
export type IReportFn = (
    event: string,
    prop?: Record<string, any>,
    option?: Partial<ITrackOption>,
) => void;
interface IProperty {
    'DataSet ID': number | string;
    'Lidar Type': 'Lidar Fusion' | 'Lidar Basic';
    'Is Frame Series': boolean;
    'Select From': string;
    '3D Object ID': string | number;
    'Track Id': string;
    'Data ID': string;
    'Data No Before': number;
    'Object Source': string;
    'Confidence Level': number | string;
    'Data No After': number;
    'Data No': string | number;
    'Model Name': string;
    'Is Predict All': boolean;
    'Selected Classes': string;
    'Shortcut Key': 'W' | 'S' | 'Q' | 'E' | 'A' | 'D' | 'Z' | 'X';
    'Model Run Time': number;
    Objects: 'All' | 'Selected';
    'Frame No': number;
    'Set Value To': 'On' | 'Off';
    'Current Frame No': number;
    'Speed Play': number;
    '# of Objects': number;
    Direction: 'Backward' | 'Forward';
    View: 'OverHead' | 'Side' | 'Rear';
    Position: string;
    Method:
        | 'Shortcut T'
        | 'Result List'
        | 'Attribute Pad'
        | 'Time Line'
        | 'Input'
        | 'Next'
        | 'Previous'
        | 'Close'
        | 'Create'
        | 'Tracking'
        | 'Copy';
    Speed: number;
    Mode: string;
    [key: string]: any;
}

export type ListenFn = (editor: Editor, report: IReportFn) => Function;

function hackActionEnd(manager: ActionManager, name: IActionName, insert: (e: Editor) => void) {
    let action = manager.actions[name];
    if (action) {
        let end = action.end;
        action.end = (...arg) => {
            end.call(action, ...arg);
            insert(...arg);
        };
        return () => {
            action.end = end.bind(action);
        };
    }
    return noop;
}

export default class ReportManager {
    managerName = 'report_manager';
    private clears: Function[] = [];
    editor: Editor;
    enabled: boolean = false;
    mixpanel: any;
    baseInfo: Partial<IProperty> = {};
    constructor(editor: Editor) {
        this.editor = editor;
        this.mixpanel = MixPanel;
        this.report = this.report.bind(this);
        this.reportEnter = this.reportEnter.bind(this);
        this.reportClose = this.reportClose.bind(this);
        this.initEvent();
    }
    initBaseInfo() {
        const { isSeriesFrame, modeConfig } = this.editor.state;
        let frame = this.editor.getCurrentFrame();
        this.baseInfo = {
            'Lidar Type': isSeriesFrame ? 'Lidar Fusion' : 'Lidar Basic',
            'Is Frame Series': isSeriesFrame,
            Mode: modeConfig.name,
            'DataSet ID': frame.datasetId,
            'Data No': this.editor.state.frameIndex + 1,
            'Data ID': frame.id,
        };
    }
    initEvent() {
        let editor = this.editor;
        window.addEventListener('beforeunload', this.reportClose);

        // hack 取消选中
        let actionManager = editor.actionManager;
        let handleEsc = actionManager.handleEsc;
        actionManager.handleEsc = () => {
            this.reportUnSelect('Esc', this.editor.pc.selection);
            handleEsc.call(actionManager);
        };

        // hack view
        const addRenderView = editor.pc.addRenderView;
        editor.pc.addRenderView = (view) => {
            if (view instanceof SideRenderView) {
                let action = view.getAction('resize-translate') as ResizeTransAction;
                if (action) {
                    const onResizeEnd = action.onResizeEnd;
                    const onRotateEnd = action.onRotateEnd;
                    let angle: IProperty['View'];
                    if (view.axis === '-x' || view.axis === 'x') {
                        angle = 'Rear';
                    } else if (view.axis === '-y' || view.axis === 'y') {
                        angle = 'Side';
                    } else {
                        angle = 'OverHead';
                    }

                    action.onResizeEnd = (event) => {
                        const info = event.info;
                        switch (info) {
                            case 'bg':
                                this.reportEdit3D(angle, 'move');
                                break;
                            case 'lb':
                            case 'lt':
                            case 'rb':
                            case 'rt':
                                this.reportEdit3D(angle, 'corner');
                                break;
                            case 'left':
                            case 'right':
                            case 'bottom':
                            case 'top':
                                this.reportEdit3D(angle, 'side');
                                break;
                        }
                        onResizeEnd.call(action, event);
                    };

                    action.onRotateEnd = (...arg) => {
                        this.reportEdit3D(angle, 'rotation');
                        onRotateEnd.call(action, ...arg);
                    };
                    this.clears.push(() => {
                        action.onResizeEnd = onResizeEnd.bind(action);
                        action.onRotateEnd = onRotateEnd.bind(action);
                    });
                }
            } else if (view instanceof MainRenderView || view instanceof Image2DRenderView) {
                let action = view.getAction('select') as SelectAction;
                if (action) {
                    let selectObject = action.selectObject;
                    action.selectObject = (object) => {
                        let preObject = editor.pc.selection;
                        this.reportUnSelect('Switch to Others', preObject);
                        selectObject.call(action, object);
                        if (object) {
                            this.reportSelect(view instanceof MainRenderView ? '3D' : '2D', object);
                        }
                    };
                    this.clears.push(() => {
                        action.selectObject = selectObject.bind(action);
                    });
                }
            }
            addRenderView.call(editor.pc, view);
        };
        // 快捷键
        this.clears.push(
            hackActionEnd(actionManager, 'rotationZLeft', () => {
                this.reportClickResize('Z', 'OverHead');
            }),
        );
        this.clears.push(
            hackActionEnd(actionManager, 'rotationZRight', () => {
                this.reportClickResize('X', 'OverHead');
            }),
        );
        this.clears.push(
            hackActionEnd(actionManager, 'translateXMinus', () => {
                this.reportClickResize('A', 'Side');
            }),
        );
        this.clears.push(
            hackActionEnd(actionManager, 'translateXPlus', () => {
                this.reportClickResize('D', 'Side');
            }),
        );
        this.clears.push(
            hackActionEnd(actionManager, 'translateYMinus', () => {
                this.reportClickResize('Q', 'Rear');
            }),
        );
        this.clears.push(
            hackActionEnd(actionManager, 'translateYPlus', () => {
                this.reportClickResize('E', 'Rear');
            }),
        );
        this.clears.push(
            hackActionEnd(actionManager, 'translateZMinus', () => {
                this.reportClickResize('S', 'Side');
            }),
        );
        this.clears.push(
            hackActionEnd(actionManager, 'translateZPlus', () => {
                this.reportClickResize('W', 'Side');
            }),
        );

        // 显示面板 T

        this.clears.push(
            hackActionEnd(editor.actionManager, 'toggleClassView', () => {
                const showClassView = editor.state.config.showClassView;
                this.report(
                    showClassView ? ReportEvent.ATTRIBUTE_PAD_OPEN : ReportEvent.ATTRIBUTE_PAD_HIDE,
                    {
                        Method: 'Shortcut T',
                    },
                );
            }),
        );
        this.clears.push(
            hackActionEnd(editor.actionManager, 'createObjectWith3', () => {
                const showClassView = editor.state.config.showClassView;
                if (showClassView) {
                    this.report(ReportEvent.ATTRIBUTE_PAD_OPEN, {
                        Method: 'Create',
                    });
                }
            }),
        );
        // resource 加载完成
        let reportLoadedResource = (event: any) => {
            const frame = event.data as IFrame;
            if (frame) {
                const index = editor.getFrameIndex(frame.id);
                this.report(ReportEvent.LOADED_RESOURCE, {
                    'Data No': index + 1,
                });
            }
        };
        this.editor.addEventListener(Event.RESOURCE_LOAD_COMPLETE, reportLoadedResource);
        // 追踪模型
        const track = editor.dataManager.track;
        editor.dataManager.track = (option) => {
            const { method, direction, frameN, object } = option;
            this.report(ReportEvent.RUN_MODEL_TRACK, {
                Method: method === 'copy' ? 'Copy' : 'Tracking',
                Objects: object === 'all' ? 'All' : 'Selected',
                'Frame No': frameN,
                Direction: direction === 'BACKWARD' ? 'Backward' : 'Forward',
            });
            return track.call(editor.dataManager, option);
        };

        // 追踪成功
        const gotoNext = editor.dataManager.gotoNext;
        editor.dataManager.gotoNext = (...arg) => {
            gotoNext.call(editor.dataManager, ...arg);
            this.report(ReportEvent.TRACK_SUCCESS);
        };

        // 自动加载
        const setLoadMode = editor.dataResource.setLoadMode;
        editor.dataResource.setLoadMode = (mode) => {
            setLoadMode.call(editor.dataResource, mode);
            this.report(ReportEvent.AUTO_LOAD, {
                'Set Value To': mode === 'all' ? 'On' : 'Off',
            });
        };

        // 添加到 clear
        this.clears.push(() => {
            actionManager.handleEsc = handleEsc.bind(actionManager);
            editor.pc.addRenderView = addRenderView.bind(editor.pc);
            editor.dataManager.track = track.bind(editor.dataManager);
            editor.dataManager.gotoNext = gotoNext.bind(editor.dataManager);
            this.editor.removeEventListener(Event.RESOURCE_LOAD_COMPLETE, reportLoadedResource);
            window.removeEventListener('beforeunload', this.reportClose);
        });
    }
    initMixpanel() {
        throw new Error('must implement method initMixpanel');
    }
    report(event: string, prop?: Partial<IProperty>, option?: Partial<ITrackOption>) {
        if (!this.enabled) return;
        this.initBaseInfo();
        this.mixpanel.track(event, Object.assign({}, this.baseInfo, prop || {}), option);
    }
    listen(listen: ListenFn | ListenFn[]) {
        listen = Array.isArray(listen) ? listen : [listen];
        listen.forEach((fn) => {
            this.clears.push(fn.call(null, this.editor, this.report));
        });
    }
    clear() {
        this.clears.forEach((fn) => fn());
        this.clears = [];
    }

    reportEnter() {
        this.report(ReportEvent.ENTER);
    }
    reportClose() {
        this.report(ReportEvent.CLOSE, {}, { send_immediately: true });
    }
    reportRunModel() {
        let modelConfig = this.editor.state.modelConfig;

        let props = {
            'Model Name': modelConfig.model,
            'Is Predict All': modelConfig.predict,
            'Confidence Level': modelConfig.confidence.join('~'),
        };
        if (!modelConfig.predict) {
            props['Selected Classes'] = modelConfig.classes[modelConfig.model].filter(
                (item) => item.selected,
            );
        }

        this.report(ReportEvent.RUN_MODEL_DETECTION, props);
    }
    reportClickResize = _.debounce((Key: IProperty['Shortcut Key'], View: IProperty['View']) => {
        const object3D = this.editor.pc.selection.find((item) => item instanceof Box) as Box;
        if (!object3D) return;
        this.report(ReportEvent.SHORTCUT_UP, {
            View: View,
            'Shortcut Key': Key,
            Position: object3D.position.toArray().toString(),
            '3D Object ID': object3D.userData.id,
            'Object Source': object3D.userData.resultStatus,
        });
    }, 800);
    reportSelect = _.debounce(
        (method: 'Result List' | '3D' | '2D', objects?: AnnotateObject | AnnotateObject[]) => {
            const selection = objects
                ? Array.isArray(objects)
                    ? objects
                    : [objects]
                : this.editor.pc.selection;
            let object3D = selection.find((item) => item instanceof Box);
            if (object3D) {
                this.report(ReportEvent.SELECT_3D_OBJECT, {
                    'Select From': method,
                    '3D Object ID': object3D.userData.id,
                    'Track Id': object3D.userData.trackId,
                });
            }
        },
        800,
    );
    reportUnSelect = _.debounce(
        (method: 'Esc' | 'Switch to Others', objects: AnnotateObject | AnnotateObject[]) => {
            // const selection = this.editor.pc.selection;

            const object3D = (Array.isArray(objects) ? objects : [objects]).find(
                (item) => item instanceof Box,
            );
            if (object3D) {
                this.report(ReportEvent.UNSELECT_3D_OBJECT, {
                    'Select From': method,
                    '3D Object ID': object3D.userData.id,
                    'Track Id': object3D.userData.trackId,
                });
            }
        },
        800,
    );

    reportChangeFrame = _.debounce(
        (
            method: 'Input' | 'Next' | 'Previous' | 'Time Line',
            before = this.editor.state.frameIndex + 1,
        ) => {
            this.report(ReportEvent.CHANGE_FRAME, {
                Method: method,
                'Data No Before': before,
            });
        },
        800,
    );
    reportDeleteObject(
        method: 'Result List' | 'Attribute Pad' | 'Time Line',
        annotateObjects: AnnotateObject[],
    ) {
        let objects = annotateObjects.filter((item) => {
            return item instanceof Box;
        });
        if (objects.length <= 0) return;
        let status: any = [];
        let confidences: any = [];
        let IDs: any = [];
        objects.forEach((item) => {
            const { confidence, resultStatus, id } = item.userData;
            status.push(resultStatus);
            confidences.push(confidence);
            IDs.push(id);
        });
        this.report(ReportEvent.Delete_3D_OBJECT, {
            Method: method,
            '3D Object ID': IDs.join(','),
            'Object Source': status.join(','),
            'Confidence Level': confidences.join(','),
            '# of Objects': objects.length,
        });
    }
    reportEdit3D = _.debounce(
        (view: IProperty['View'], target: 'side' | 'corner' | 'move' | 'rotation') => {
            let object = this.editor.pc.selection.find((item) => item instanceof Box) as Box;
            if (object) {
                let event;
                if (target === 'side') {
                    event = ReportEvent.EDIT_SIDE;
                } else if (target === 'corner') {
                    event = ReportEvent.EDIT_CORNER;
                } else if (target === 'rotation') {
                    event = ReportEvent.EDIT_ANGLE;
                } else {
                    event = ReportEvent.EDIT_POSITION;
                }
                this.report(event, {
                    View: view,
                    Position: object.position.toArray().toString(),
                    '3D Object ID': object.userData.id,
                    'Object Source': object.userData.resultStatus,
                });
            }
        },
        800,
    );
}
