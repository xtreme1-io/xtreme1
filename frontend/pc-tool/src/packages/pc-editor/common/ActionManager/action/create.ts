import {
    MainRenderView,
    CreateAction,
    Image2DRenderView,
    Box,
    Points,
    Event,
    utils,
    ITransform,
} from 'pc-render';
import * as THREE from 'three';
import * as _ from 'lodash';
import Editor from '../../../Editor';
import { define } from '../define';
import { getTransformFrom3Point, getMiniBox, getMiniBox1 } from '../../../utils';
import { IAnnotationInfo, StatusType, IUserData, Const, IObject } from '../../../type';
import EditorEvent from '../../../config/event';

function showLoading(position: THREE.Vector3, view: MainRenderView) {
    const wrap = document.createElement('div');
    wrap.className = 'loading-3d-wrap';
    const iconDiv = document.createElement('div');
    const icon = document.createElement('i');
    const msg = document.createElement('div');
    msg.className = 'loading-msg';
    icon.className = 'iconfont icon-loading loading create-status';
    iconDiv.appendChild(msg);
    iconDiv.appendChild(icon);
    wrap.appendChild(iconDiv);
    const update = () => {
        const pos = new THREE.Vector3().copy(position);
        const camera = view.camera;
        const matrix = utils.get(THREE.Matrix4, 1);
        matrix.copy(camera.projectionMatrix);
        matrix.multiply(camera.matrixWorldInverse);
        pos.applyMatrix4(matrix);
        const invisible = Math.abs(pos.z) > 1 || pos.x < -1 || pos.x > 1 || pos.y > 1 || pos.y < -1;
        iconDiv.style.display = invisible ? 'none' : 'block';
        pos.x = ((pos.x + 1) / 2) * view.width;
        pos.y = (-(pos.y - 1) / 2) * view.height;
        iconDiv.style.transform = `translate(${pos.x - 8}px, ${pos.y + 8}px) translateY(-100%)`;
    };
    const init = () => {
        view.container.appendChild(wrap);
        view.addEventListener(Event.RENDER_AFTER, update);
        update();
    };

    const clear = () => {
        view.removeEventListener(Event.RENDER_AFTER, update);
        view.container.removeChild(wrap);
    };
    const updateMsg = (message: string) => {
        msg.innerText = message;
    };
    init();
    return { clear, updateMsg };
}

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
            const config = editor.state.config;
            const isAIbox = config.boxMethod === 'AI';
            let points = editor.pc.groupPoints.children[0] as Points;
            let positions = points.geometry.attributes['position'] as THREE.BufferAttribute;
            return new Promise<any>((resolve) => {
                action.start(
                    {
                        type: isAIbox ? 'box' : 'points-3',
                        startClick: !isAIbox,
                        startMouseDown: isAIbox,
                    },
                    async (data: THREE.Vector2[]) => {
                        let transform: Required<
                            Pick<ITransform, 'position' | 'rotation' | 'scale'>
                        >;
                        if (isAIbox) {
                            const { clear, updateMsg } = showLoading(
                                view.canvasToWorld(
                                    new THREE.Vector2(
                                        (data[1].x + data[0].x) / 2,
                                        (data[1].y + data[0].y) / 2,
                                    ),
                                ),
                                view,
                            );
                            const createTask = editor.taskManager.createTask;
                            const projectPos = data.map((e) => view.getProjectPos(e));
                            const worldPos = data.map((e) => view.canvasToWorld(e));
                            const headAngle = Math.atan2(
                                worldPos[1].y - worldPos[0].y,
                                worldPos[1].x - worldPos[0].x,
                            );
                            const matrix = new THREE.Matrix4();
                            matrix.copy(view.camera.projectionMatrix);
                            matrix.multiply(view.camera.matrixWorldInverse);
                            const taskData = await createTask
                                .create(
                                    positions,
                                    projectPos,
                                    matrix,
                                    headAngle,
                                    true,
                                    config.heightRange,
                                )
                                .catch(() => {
                                    return { data: undefined, frameId: undefined };
                                });
                            const result = taskData.data as Required<ITransform>;
                            const frameId = taskData.frameId;
                            if (result && frameId == editor.getCurrentFrame().id) {
                                transform = {
                                    position: new THREE.Vector3().copy(result.position),
                                    scale: new THREE.Vector3().copy(result.scale),
                                    rotation: new THREE.Euler().copy(result.rotation),
                                };
                            } else {
                                data.splice(1, -1, new THREE.Vector2(data[0].x, data[1].y));
                                const _projectPos = data.map((e) => view.canvasToWorld(e));
                                transform = getTransformFrom3Point(_projectPos);
                            }
                            clear();
                        } else {
                            let projectPos = data.map((e) => view.canvasToWorld(e));
                            transform = getTransformFrom3Point(projectPos);
                            transform.scale.z = 2;
                            transform.position.z = editor.pc.ground.plane.constant + 1;

                            getMiniBox1(transform, positions, editor.state.config.heightRange);
                        }

                        transform.scale.x = Math.max(0.2, transform.scale.x);
                        transform.scale.y = Math.max(0.2, transform.scale.y);
                        transform.scale.z = Math.max(0.2, transform.scale.z);
                        // debugger;

                        let userData = {
                            resultStatus: Const.True_Value,
                            resultType: Const.Dynamic,
                        } as IUserData;

                        const classConfig = editor.getClassType(editor.state.currentClass);

                        if (classConfig) {
                            userData.classType = classConfig.name;
                            userData.classId = classConfig.id;
                        }
                        if (editor.currentTrack) {
                            const object3d = editor.pc.getAnnotate3D().find((e) => {
                                return (
                                    e instanceof Box &&
                                    !(e as any).isHolder &&
                                    e.userData.trackId == editor.currentTrack
                                );
                            });
                            if (!object3d) {
                                userData.trackId = editor.currentTrack as string;
                                userData.trackName = editor.currentTrackName;
                            }
                        }

                        let box = editor.createAnnotate3D(
                            transform.position,
                            transform.scale,
                            transform.rotation,
                            userData,
                        );

                        let trackObject: Partial<IObject> = {
                            trackId: userData.trackId,
                            trackName: userData.trackName,
                            classType: userData.classType,
                            classId: userData.classId,
                        };

                        editor.state.config.showClassView = true;

                        editor.cmdManager.withGroup(() => {
                            editor.cmdManager.execute('add-object', box);
                            if (editor.state.isSeriesFrame) {
                                editor.cmdManager.execute('add-track', trackObject);
                            }

                            editor.cmdManager.execute('select-object', box);
                        });

                        resolve(box);
                    },
                );
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
