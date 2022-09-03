import {
    Rect,
    CreateAction,
    Image2DRenderView,
    Box,
    Box2D,
    Object2D,
    AnnotateObject,
    AnnotateType,
} from 'pc-render';
import * as THREE from 'three';
import * as _ from 'lodash';
import Editor from '../../../Editor';
import { define } from '../define';
import { setIdInfo } from '../../../utils';
import { Const, IAnnotationInfo, IUserData, StatusType } from '../../../type';
import EditorEvent from '../../../config/event';

export const create2DRect = define({
    valid(editor: Editor) {
        let state = editor.state;
        return (
            state.config.showSingleImgView &&
            state.modeConfig.actions['create2DRect'] &&
            state.config.projectPoint4
        );
    },
    end(editor: Editor) {
        let action = this.action as CreateAction;
        action.end();
        editor.state.status = StatusType.Default;
    },
    execute(editor: Editor) {
        let config = editor.state.config;
        let view = editor.pc.renderViews.find(
            (e) => e.name === config.singleViewPrefix,
        ) as Image2DRenderView;
        // let view = editor.activeView as Image2DRenderView;
        if (view) {
            let action = view.getAction('create-obj') as CreateAction;
            this.action = action;
            editor.state.status = StatusType.Create;

            return new Promise<any>((resolve) => {
                action.start(
                    {
                        type: 'box',
                        trackLine: config.activeTrack,
                        // startMouseDown: true,
                        // startClick: false,
                    },
                    (data: THREE.Vector2[]) => {
                        // console.log(data);
                        if (data.length !== 2) {
                            return resolve(null);
                        }

                        // image coordinate
                        let imgSize = view.imgSize;
                        data.forEach((pos) => {
                            pos.x = (pos.x / view.width) * imgSize.x;
                            pos.y = (pos.y / view.height) * imgSize.y;
                        });

                        let center = new THREE.Vector2();
                        center.copy(data[0]).add(data[1]).divideScalar(2);
                        let size = new THREE.Vector2();

                        size.copy(data[0]).sub(data[1]);
                        size.x = Math.abs(size.x);
                        size.y = Math.abs(size.y);

                        let rect = editor.createAnnotateRect(center, size, {
                            resultStatus: Const.True_Value,
                            resultType: Const.Dynamic,
                        } as IUserData);
                        let userData = rect.userData;
                        rect.viewId = view.renderId || view.id;
                        editor.state.config.showClassView = true;

                        editor.cmdManager.withGroup(() => {
                            // if (editor.state.isSeriesFrame) {
                            //     editor.cmdManager.execute('add-track', {
                            //         trackId: userData.trackId,
                            //         trackName: userData.trackName,
                            //     });
                            // }

                            editor.cmdManager.execute('add-object', [
                                { objects: rect, frame: editor.getCurrentFrame() },
                            ]);
                            editor.cmdManager.execute('select-object', rect);
                        });

                        resolve(rect);
                    },
                );
            });
        }
    },
});

export const create2DBox = define({
    valid(editor: Editor) {
        let state = editor.state;
        return (
            editor.state.config.showSingleImgView &&
            state.modeConfig.actions['create2DBox'] &&
            state.config.projectPoint8
        );
    },
    isContinue(editor: Editor) {
        return editor.state.config.active2DBox;
    },
    end(editor: Editor) {
        let action = this.action as CreateAction;
        action.end();
        editor.state.status = StatusType.Default;
    },
    execute(editor: Editor) {
        let config = editor.state.config;
        let view = editor.pc.renderViews.find(
            (e) => e.name === config.singleViewPrefix,
        ) as Image2DRenderView;
        // let view = editor.activeView as Image2DRenderView;
        if (view) {
            let action = view.getAction('create-obj') as CreateAction;
            this.action = action;
            editor.state.status = StatusType.Create;

            return new Promise<any>((resolve) => {
                action.start(
                    {
                        type: 'box-2',
                        trackLine: config.activeTrack,
                        // startMouseDown: true,
                        // startClick: false,
                    },
                    (data: THREE.Vector2[]) => {
                        // console.log(data);
                        // if (data.length !== 2) {
                        //     return resolve(null);
                        // }

                        // // image coordinate
                        let imgSize = view.imgSize;
                        data.forEach((pos) => {
                            pos.x = (pos.x / view.width) * imgSize.x;
                            pos.y = (pos.y / view.height) * imgSize.y;
                        });

                        let positions1 = getPositionFromPoints([data[0], data[1]]);
                        let positions2 = getPositionFromPoints([data[2], data[3]]);

                        let box = editor.createAnnotateBox2D(
                            positions1 as any,
                            positions2 as any,
                            {
                                resultStatus: Const.True_Value,
                                resultType: Const.Dynamic,
                            } as IUserData,
                        );
                        let userData = box.userData;
                        box.viewId = view.renderId || view.id;

                        editor.state.config.showClassView = true;
                        editor.cmdManager.withGroup(() => {
                            // if (editor.state.isSeriesFrame) {
                            //     editor.cmdManager.execute('add-track', {
                            //         trackId: userData.trackId,
                            //         trackName: userData.trackName,
                            //     });
                            // }
                            editor.cmdManager.execute('add-object', [{ objects: box }]);
                            editor.cmdManager.execute('select-object', box);
                        });

                        resolve(box);
                    },
                );
            });
        }
    },
});

export const projectObject2D = define({
    valid(editor: Editor) {
        return true;
    },
    execute(
        editor: Editor,
        args: { updateFlag?: boolean; createFlag?: boolean; selectFlag?: boolean } = {},
    ) {
        let { updateFlag = true, createFlag = true, selectFlag = false } = args;
        let selection = editor.pc.selection;
        let config = editor.state.config;
        let addObjects: AnnotateObject[] = [];

        if (!config.projectPoint4 && !config.projectPoint8) return;

        let annotate3D = editor.pc.getAnnotate3D();
        let annotate2D = editor.pc.getAnnotate2D();
        let views = editor.pc.renderViews.filter(
            // (e) => e.name === `${config.imgViewPrefix}-${0}`,
            (e) => e.name.startsWith(`${config.imgViewPrefix}`),
        ) as Image2DRenderView[];

        // project select box
        if (selectFlag && selection.length === 1 && selection[0] instanceof Box) {
            annotate3D = [selection[0]];
        }

        let existMapRect = {} as Record<string, Record<string, Rect>>;
        let existMapBox2D = {} as Record<string, Record<string, Box2D>>;
        views.forEach((view) => {
            existMapRect[view.id] = {} as Record<string, Rect>;
            existMapBox2D[view.id] = {} as Record<string, Box2D>;
        });
        annotate2D.forEach((object) => {
            let viewId = object.viewId;
            let userData = object.userData as IUserData;
            if (
                object instanceof Rect &&
                existMapRect[viewId] &&
                // userData.isProjection &&
                userData.trackId
            ) {
                existMapRect[viewId][userData.trackId] = object;
            }

            if (
                object instanceof Box2D &&
                existMapBox2D[viewId] &&
                // userData.isProjection &&
                userData.trackId
            ) {
                existMapBox2D[viewId][userData.trackId] = object;
            }
        });

        let imgPos = new THREE.Vector3();
        let pos = new THREE.Vector3();
        let updateN = 0;
        annotate3D.forEach((object) => {
            let userData = object.userData as IUserData;
            // let objectId = userData.id as string;
            let trackId = userData.trackId as string;
            views.forEach((view) => {
                let viewId = view.id;

                // pos.set(0, 0, 0).applyMatrix4(object.matrixWorld);
                // view.worldToCanvas(pos, imgPos);

                // imgPos.x > 0 &&
                //     imgPos.x <= view.width &&
                //     imgPos.y > 0 &&
                //     imgPos.y <= view.height &&
                //     Math.abs(imgPos.z) <= 1

                // isBoxInImage
                if (isBoxInImage(object, view)) {
                    if (config.projectPoint8) {
                        if (existMapBox2D[viewId][trackId]) {
                            if (updateFlag) {
                                updateProjectBox(view, object, existMapBox2D[viewId][trackId]);
                                updateN++;
                            }
                        } else {
                            if (createFlag) {
                                createProjectBox2D(view, object);
                            }
                        }
                    }

                    if (config.projectPoint4) {
                        if (existMapRect[viewId][trackId]) {
                            if (updateFlag) {
                                updateProjectRect(view, object, existMapRect[viewId][trackId]);
                                updateN++;
                            }
                        } else {
                            if (createFlag) {
                                createProjectRect(view, object);
                            }
                        }
                    }
                }
            });
        });

        console.log('updateN:', updateN);
        console.log('addObjects:', addObjects);
        if (addObjects.length > 0) {
            editor.cmdManager.execute('add-object', [{ objects: addObjects }]);

            let selection = editor.pc.selection;
            if (editor.state.config.showClassView && selection.length > 0) {
                let object = selection[0];
                editor.dispatchEvent({
                    type: EditorEvent.SHOW_CLASS_INFO,
                    data: { id: object.userData.trackId },
                });
            }
        }

        function updateProjectRect(view: Image2DRenderView, object: Box, target: Rect) {
            let info1 = view.getBoxRect(object);
            target.center.copy(info1.center);
            target.size.copy(info1.size);
            // TODO:
            editor.pc.render();
        }

        function updateProjectBox(view: Image2DRenderView, object: Box, target: Box2D) {
            let info2 = view.getBox2DBox(object);
            target.copyVector2Of4(info2.positionsFront as any, target.positions1);
            target.copyVector2Of4(info2.positionsBack as any, target.positions2);
            // TODO:
            editor.pc.render();
        }

        function createProjectRect(view: Image2DRenderView, object: Box) {
            let info1 = view.getBoxRect(object);
            let object2D1 = new Rect();
            object2D1.center.copy(info1.center);
            object2D1.size.copy(info1.size);
            setObject(view, object, object2D1);
        }
        function createProjectBox2D(view: Image2DRenderView, object: Box) {
            let info2 = view.getBox2DBox(object);
            let object2D = new Box2D();
            object2D.copyVector2Of4(info2.positionsFront as any, object2D.positions1);
            object2D.copyVector2Of4(info2.positionsBack as any, object2D.positions2);
            setObject(view, object, object2D);
        }
        function setObject(view: Image2DRenderView, object: Box, object2D: Box2D | Rect) {
            object2D.color = object.color.getStyle();
            object2D.viewId = view.id;
            object2D.connectId = object.id;

            let userData = object2D.userData as IUserData;
            userData.classType = object.userData.classType;
            userData.modelClass = object.userData.modelClass;
            userData.trackId = object.userData.trackId;
            userData.trackName = object.userData.trackName;

            setIdInfo(editor, userData);
            userData.isProjection = true;

            addObjects.push(object2D);

            // editor.pc.addObject(object2D as any);
        }
    },
});

function get2DBox(points: THREE.Vector2[]) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    points.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    });

    return { minX, minY, maxX, maxY };
}

function getPositionFromPoints(points: THREE.Vector2[]) {
    let { minX, minY, maxX, maxY } = get2DBox(points);
    let positions = [
        new THREE.Vector2(minX, minY),
        new THREE.Vector2(minX, maxY),
        new THREE.Vector2(maxX, maxY),
        new THREE.Vector2(maxX, minY),
    ];

    return positions;
}

let v1 = new THREE.Vector3();
let v2 = new THREE.Vector3();
let v3 = new THREE.Vector3();
let v4 = new THREE.Vector3();
let v5 = new THREE.Vector3();
let v6 = new THREE.Vector3();
let v7 = new THREE.Vector3();
let v8 = new THREE.Vector3();

function isBoxInImage(object: Box, view: Image2DRenderView) {
    let box = object.geometry.boundingBox as THREE.Box3;
    v1.set(box.max.x, box.min.y, box.max.z);
    v2.set(box.max.x, box.min.y, box.min.z);
    v3.set(box.max.x, box.max.y, box.min.z);
    v4.set(box.max.x, box.max.y, box.max.z);

    v5.set(box.min.x, box.min.y, box.max.z);
    v6.set(box.min.x, box.min.y, box.min.z);
    v7.set(box.min.x, box.max.y, box.min.z);
    v8.set(box.min.x, box.max.y, box.max.z);

    let positions = [v1, v2, v3, v4, v5, v6, v7, v8];

    for (let i = 0; i < positions.length; i++) {
        let pos = positions[i];
        pos.applyMatrix4(object.matrixWorld);
        view.worldToCanvas(pos);
        if (
            pos.x > 0 &&
            pos.x < view.width &&
            pos.y > 0 &&
            pos.y < view.height &&
            Math.abs(pos.z) < 1
        ) {
            return true;
        }
    }

    return false;
}
