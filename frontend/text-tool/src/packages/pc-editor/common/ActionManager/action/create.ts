import { MainRenderView, CreateAction, Image2DRenderView, Box, Points } from 'pc-render';
import * as THREE from 'three';
import * as _ from 'lodash';
import Editor from '../../../Editor';
import { define } from '../define';
import { getTransformFrom3Point, getMiniBox, getMiniBox1 } from '../../../utils';
import { IAnnotationInfo, StatusType, IUserData, Const, IObject } from '../../../type';
import EditorEvent from '../../../config/event';

export const createObjectWith3 = define({
    valid(editor: Editor) {
        let state = editor.state;
        return !state.config.showSingleImgView && state.modeConfig.actions['createObjectWith3'];
    },
    end(editor: Editor) {
        let action = this.action as CreateAction;
        action.end();
        editor.state.status = StatusType.Default;
    },
    execute(editor: Editor) {
        let view = editor.pc.renderViews.find((e) => e instanceof MainRenderView) as MainRenderView;
        if (view) {
            let action = view.getAction('create-obj') as CreateAction;
            this.action = action;

            editor.state.status = StatusType.Create;

            return new Promise<any>((resolve) => {
                action.start({ type: 'points-3' }, (data: THREE.Vector2[]) => {
                    // console.log(data);
                    let projectPos = data.map((e) => view.canvasToWorld(e));
                    let transform = getTransformFrom3Point(projectPos);
                    // console.log(projectPos);

                    transform.scale.z = 2;
                    transform.position.z = editor.pc.ground.plane.constant + 1;
                    // transform.position.z = 1;

                    let points = editor.pc.groupPoints.children[0] as Points;
                    let positions = points.geometry.attributes['position'] as THREE.BufferAttribute;
                    getMiniBox1(transform, positions, editor.state.config.heightRange);
                    // getMiniBox(transform, positions);

                    transform.scale.x = Math.max(0.2, transform.scale.x);
                    transform.scale.y = Math.max(0.2, transform.scale.y);
                    transform.scale.z = Math.max(0.2, transform.scale.z);
                    // debugger;

                    let userData = {} as IUserData;
                    // userData.resultType = Const.Dynamic;
                    // userData.resultStatus = Const.True_Value;

                    let box = editor.createAnnotate3D(
                        transform.position,
                        transform.scale,
                        transform.rotation,
                        userData,
                    );

                    let trackObject: Partial<IObject> = {
                        trackId: userData.trackId,
                        trackName: userData.trackName,
                        // resultType: userData.resultType,
                        // resultStatus: userData.resultStatus,
                    };

                    editor.state.config.showClassView = true;

                    editor.cmdManager.withGroup(() => {
                        editor.cmdManager.execute('add-object', box);
                        // if (editor.state.isSeriesFrame) {
                        //     editor.cmdManager.execute('add-track', trackObject);
                        // }

                        editor.cmdManager.execute('select-object', box);
                    });

                    resolve(box);
                });
            });
        }
    },
});

export const createAnnotation = define({
    valid(editor: Editor) {
        let state = editor.state;
        return !state.config.showSingleImgView && state.modeConfig.actions['createAnnotation'];
    },
    end(editor: Editor) {
        let action = this.action as CreateAction;
        if (action) action.end();

        editor.showModal(false);
        editor.state.status = StatusType.Default;
    },
    execute(editor: Editor, args?: { object: Box }) {
        let view = editor.pc.renderViews.find((e) => e instanceof MainRenderView) as MainRenderView;
        let state = editor.state;

        editor.state.status = StatusType.Create;

        if (view) {
            return new Promise<any>(async (resolve) => {
                if (args && args.object) {
                    this.action = null;
                    await create(args.object);
                    resolve(null);
                } else {
                    let action = view.getAction('create-obj') as CreateAction;
                    this.action = action;

                    action.start(
                        { type: 'points-1', trackLine: false },
                        async (data: THREE.Vector2[]) => {
                            let obj = view.getObjectByCanvas(data[0]);
                            if (obj) {
                                await create(obj);
                            } else {
                                await create(view.canvasToWorld(data[0]));
                            }
                            resolve(null);
                        },
                    );
                }
            });
        }

        async function create(data: THREE.Object3D | THREE.Vector3) {
            let result;
            let isObject = data instanceof THREE.Object3D;
            let object = data as THREE.Object3D;
            let custom = isObject
                ? { id: object.userData.id, uuid: object.uuid }
                : (data as THREE.Vector3).clone();

            try {
                result = await editor.showModal('annotation', {
                    title: '',
                    data: { type: isObject ? 'object' : 'position', custom },
                });
            } catch (e) {
                console.log('cancel');
            }
        }
    },
});
