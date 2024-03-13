import Editor from './Editor';
import * as THREE from 'three';
import {
    SideRenderView,
    ResizeTransAction,
    MainRenderView,
    Image2DRenderView,
    RenderView,
    ITransform,
    TransformControlsAction,
    Render2DTrackAction,
    SelectAction,
    AnnotateObject,
    Edit2DAction,
    Rect,
    Box2D,
    Object2D,
    Box,
} from 'pc-render';
import * as _ from 'lodash';

export default function hack(editor: Editor) {
    let addRenderView = editor.pc.addRenderView;
    editor.pc.addRenderView = (view: RenderView) => {
        if (view instanceof SideRenderView) {
            hackSideView(editor, view);
        }

        if (view instanceof MainRenderView) {
            hackMainView(editor, view);
        }

        if (view instanceof Image2DRenderView) {
            hackImgView(editor, view);
        }

        addRenderView.call(editor.pc, view);

        editor.viewManager.updateViewAction(view);
    };
}

function hackSideView(editor: Editor, view: SideRenderView) {
    let action = view.getAction('resize-translate') as ResizeTransAction;
    // let updateChange = action.updateChange;
    if (action) {
        action.updateChange = (data: ITransform | null) => {
            if (!data) return;
            editor.cmdManager.execute('update-transform', {
                object: action.renderView.object as THREE.Object3D,
                transform: data,
            });
            action.renderView.updateProjectRect();
        };
    }
}

function hackMainView(editor: Editor, view: MainRenderView) {
    let action = view.getAction('transform-control') as TransformControlsAction;
    if (action) {
        action.updatePosition = _.throttle((position: THREE.Vector3) => {
            editor.cmdManager.execute('update-transform', {
                object: (action.control as any).object as THREE.Object3D,
                transform: { position: position },
            });
        }, 30);
    }

    // let selectAction = view.getAction('select') as SelectAction;
    // if (selectAction) {
    //     selectAction.selectObject = (object?: AnnotateObject) => {
    //         editor.cmdManager.execute('select-object', object);
    //     };
    // }
}

function hackImgView(editor: Editor, view: Image2DRenderView) {
    let selectAction = view.getAction('select') as SelectAction;
    if (selectAction) {
        selectAction.selectObject = (object?: AnnotateObject) => {
            editor.cmdManager.execute('select-object', object);
        };
    }

    const trackAction = view.getAction('render-2d-track') as Render2DTrackAction;
    if (trackAction) {
        trackAction.activeTrack = () => {
            return editor.state.config.activeTrack;
        };
        trackAction.trackCircle = () => {
            return editor.state.config.activeHelper2d.includes('aux_circle');
        };
        trackAction.trackLine = () => {
            return editor.state.config.activeHelper2d.includes('aux_line');
        };
        trackAction.trackRadius = () => {
            return editor.state.config.circleRadius;
        };
    }

    let editAction = view.getAction('edit-2d') as Edit2DAction;
    if (editAction) {
        editAction.updateRectData = (center: THREE.Vector2, size?: THREE.Vector2) => {
            let object = editAction.object as Rect;
            editor.cmdManager.execute('update-2d-rect', { object, option: { center, size } });
        };

        editAction.updateBox2DData = (
            positionName: 'positions1' | 'positions2',
            positionMap: Record<number, THREE.Vector2>,
        ) => {
            let object = editAction.object as Box2D;
            let option = {} as any;
            option[positionName] = positionMap;
            editor.cmdManager.execute('update-2d-box', { object, option });
        };
        editAction.validRect = function (
            center: THREE.Vector2,
            size: THREE.Vector2,
            moveOnly: boolean,
        ) {
            let config = editor.state.config;
            if (config.limitRect2Image) {
                validRect(center, size, view.imgSize, moveOnly);
            }
        };
    }

    let get2DObject = view.get2DObject;
    view.get2DObject = function () {
        let { config } = editor.state;
        let currentTrack = editor.getCurTrack();

        let objects = get2DObject.call(view);
        if (config.filter2DByTrack && currentTrack) {
            return objects.filter((e) => {
                return (
                    e.userData.trackId === currentTrack && (e instanceof Rect || e instanceof Box2D)
                );
            }) as Object2D[];
        } else {
            return get2DObject.call(view);
        }
    };

    let get3DObject = view.get3DObject;
    view.get3DObject = function () {
        let { config } = editor.state;
        let currentTrack = editor.getCurTrack();

        let objects = get3DObject.call(view);
        if (config.filter2DByTrack && currentTrack) {
            return objects.filter((e) => {
                return e.userData.trackId === currentTrack && e instanceof Box;
            }) as Box[];
        } else {
            return objects;
        }
    };
}
function validRect(
    center: THREE.Vector2,
    size: THREE.Vector2,
    imgSize: THREE.Vector2,
    moveOnly: boolean,
) {
    if (moveOnly) {
        // x
        if (center.x - size.x / 2 < 0) center.x = size.x / 2;
        if (center.x + size.x / 2 > imgSize.x) center.x = imgSize.x - size.x / 2;
        // y
        if (center.y - size.y / 2 < 0) center.y = size.y / 2;
        if (center.y + size.y / 2 > imgSize.y) center.y = imgSize.y - size.y / 2;
    } else {
        let rx = THREE.MathUtils.clamp(center.x + size.x / 2, 0, imgSize.x);
        let lx = THREE.MathUtils.clamp(center.x - size.x / 2, 0, imgSize.x);
        let ty = THREE.MathUtils.clamp(center.y - size.y / 2, 0, imgSize.y);
        let by = THREE.MathUtils.clamp(center.y + size.y / 2, 0, imgSize.y);
        center.set((rx + lx) / 2, (by + ty) / 2);
        size.set(rx - lx, by - ty);
    }
}
