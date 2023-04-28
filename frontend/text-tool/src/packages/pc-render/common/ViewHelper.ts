import * as THREE from 'three';
import TWEEN, { Tween } from '@tweenjs/tween.js';
import MainRenderView from '../renderView/MainRenderView';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const vpTemp = new THREE.Vector4();

const viewPosition = {
    posX: 'posX',
    posY: 'posY',
    posZ: 'posZ',
    negX: 'negX',
    negY: 'negY',
    negZ: 'negZ',
};
export type viewType = keyof typeof viewPosition;

export class UIElement {
    dom: HTMLDivElement;
    constructor(dom: HTMLDivElement) {
        this.dom = dom;
    }

    add(...args: any) {
        for (let i = 0; i < arguments.length; i++) {
            const argument = args[i];

            if (argument instanceof UIElement) {
                this.dom.appendChild(argument.dom);
            } else {
                console.error('UIElement:', argument, 'is not an instance of UIElement.');
            }
        }

        return this;
    }

    remove(...args: any) {
        for (let i = 0; i < arguments.length; i++) {
            const argument = args[i];

            if (argument instanceof UIElement) {
                this.dom.removeChild(argument.dom);
            } else {
                console.error('UIElement:', argument, 'is not an instance of UIElement.');
            }
        }

        return this;
    }

    setId(id: string) {
        this.dom.id = id;

        return this;
    }

    getId() {
        return this.dom.id;
    }

    setClass(name: string) {
        this.dom.className = name;

        return this;
    }

    addClass(name: string) {
        this.dom.classList.add(name);

        return this;
    }

    removeClass(name: string) {
        this.dom.classList.remove(name);

        return this;
    }

    setStyle(style: string, array: any[]) {
        for (let i = 0; i < array.length; i++) {
            this.dom.style[style] = array[i];
        }

        return this;
    }

    setTextContent(value: any) {
        this.dom.textContent = value;

        return this;
    }

    setInnerHTML(value: any) {
        this.dom.innerHTML = value;
    }

    getIndexOfChild(element: UIElement) {
        return Array.prototype.indexOf.call(this.dom.children, element.dom);
    }
}

export class ViewHelper extends THREE.Object3D {
    controls: OrbitControls;
    renderView: MainRenderView;
    isViewHelper: boolean = true;
    camera: THREE.OrthographicCamera;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private dummy: THREE.Object3D;
    private clock: THREE.Clock;

    private posXAxisHelper: THREE.Sprite;
    private posYAxisHelper: THREE.Sprite;
    private posZAxisHelper: THREE.Sprite;
    private negXAxisHelper: THREE.Sprite;
    private negYAxisHelper: THREE.Sprite;
    private negZAxisHelper: THREE.Sprite;
    private point: THREE.Vector3;
    private dim: number = 128;
    private turnRate: number = 2 * Math.PI;
    private radius: number = 0;
    private targetPosition: THREE.Vector3;
    private targetQuaternion: THREE.Quaternion;
    private q1: THREE.Quaternion;
    private q2: THREE.Quaternion;
    private m: THREE.Matrix4;
    private offset: THREE.Vector3;
    private quat: THREE.Quaternion;
    private quatInverse: THREE.Quaternion;
    private spherical: THREE.Spherical;
    private interactiveObjects: THREE.Sprite[];

    constructor(renderView: MainRenderView, controls: OrbitControls) {
        super();
        this.controls = controls;
        this.renderView = renderView;

        const color1 = new THREE.Color('#ff3653');
        const color2 = new THREE.Color('#8adb00');
        const color3 = new THREE.Color('#2c8fff');

        const interactiveObjects = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.dummy = new THREE.Object3D();
        this.dummy.up.copy(this.renderView.camera.up);

        this.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0, 4);
        this.camera.position.set(0, 0, 2);
        this.clock = new THREE.Clock();

        this.m = new THREE.Matrix4();

        const geometry = new THREE.BoxGeometry(0.8, 0.05, 0.05).translate(0.4, 0, 0);

        const xAxis = new THREE.Mesh(geometry, getAxisMaterial(color1));
        const yAxis = new THREE.Mesh(geometry, getAxisMaterial(color2));
        const zAxis = new THREE.Mesh(geometry, getAxisMaterial(color3));

        yAxis.rotation.z = Math.PI / 2;
        zAxis.rotation.y = -Math.PI / 2;

        this.add(xAxis);
        this.add(zAxis);
        this.add(yAxis);

        const posXAxisHelper = new THREE.Sprite(getSpriteMaterial(color1, 'X'));
        posXAxisHelper.userData.type = viewPosition.posX;
        const posYAxisHelper = new THREE.Sprite(getSpriteMaterial(color2, 'Y'));
        posYAxisHelper.userData.type = viewPosition.posY;
        const posZAxisHelper = new THREE.Sprite(getSpriteMaterial(color3, 'Z'));
        posZAxisHelper.userData.type = viewPosition.posZ;
        const negXAxisHelper = new THREE.Sprite(getSpriteMaterial(color1));
        negXAxisHelper.userData.type = viewPosition.negX;
        const negYAxisHelper = new THREE.Sprite(getSpriteMaterial(color2));
        negYAxisHelper.userData.type = viewPosition.negY;
        const negZAxisHelper = new THREE.Sprite(getSpriteMaterial(color3));
        negZAxisHelper.userData.type = viewPosition.negZ;

        posXAxisHelper.position.x = 1;
        posYAxisHelper.position.y = 1;
        posZAxisHelper.position.z = 1;
        negXAxisHelper.position.x = -1;
        negXAxisHelper.scale.setScalar(0.8);
        negYAxisHelper.position.y = -1;
        negYAxisHelper.scale.setScalar(0.8);
        negZAxisHelper.position.z = -1;
        negZAxisHelper.scale.setScalar(0.8);

        this.add(posXAxisHelper);
        this.add(posYAxisHelper);
        this.add(posZAxisHelper);
        this.add(negXAxisHelper);
        this.add(negYAxisHelper);
        this.add(negZAxisHelper);
        this.posXAxisHelper = posXAxisHelper;
        this.posYAxisHelper = posYAxisHelper;
        this.posZAxisHelper = posZAxisHelper;
        this.negXAxisHelper = negXAxisHelper;
        this.negYAxisHelper = negYAxisHelper;
        this.negZAxisHelper = negZAxisHelper;

        interactiveObjects.push(posXAxisHelper);
        interactiveObjects.push(posYAxisHelper);
        interactiveObjects.push(posZAxisHelper);
        interactiveObjects.push(negXAxisHelper);
        interactiveObjects.push(negYAxisHelper);
        interactiveObjects.push(negZAxisHelper);
        this.interactiveObjects = interactiveObjects;
        this.point = new THREE.Vector3();
        this.dim = 128;
        this.turnRate = 2 * Math.PI; // turn rate in angles per second

        this.targetPosition = new THREE.Vector3();
        this.targetQuaternion = new THREE.Quaternion();

        this.q1 = new THREE.Quaternion();
        this.q2 = new THREE.Quaternion();

        this.offset = new THREE.Vector3();
        this.quat = new THREE.Quaternion().setFromUnitVectors(
            this.renderView.camera.up,
            new THREE.Vector3(0, 1, 0),
        );
        this.quatInverse = this.quat.clone().invert();
        this.spherical = new THREE.Spherical();
        this.radius = 0;

        function getAxisMaterial(color: THREE.Color) {
            return new THREE.MeshBasicMaterial({ color: color, toneMapped: false });
        }

        function getSpriteMaterial(color: THREE.Color, text: string | null = null) {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;

            const context: CanvasRenderingContext2D = canvas.getContext(
                '2d',
            ) as CanvasRenderingContext2D;
            context.beginPath();
            context.arc(32, 32, 16, 0, 2 * Math.PI);
            context.closePath();
            context.fillStyle = color.getStyle();
            context.fill();

            if (text !== null) {
                context.font = '24px Arial';
                context.textAlign = 'center';
                context.fillStyle = '#000000';
                context.fillText(text, 32, 41);
            }

            const texture = new THREE.CanvasTexture(canvas);

            return new THREE.SpriteMaterial({
                map: texture,
                // depthWrite: false,
                // transparent: true,
                depthTest: false,
                toneMapped: true,
            });
        }
    }
    render(renderer: THREE.WebGLRenderer) {
        this.quaternion.copy(this.renderView.camera.quaternion).invert();
        this.updateMatrixWorld();

        this.point.set(0, 0, 1);
        this.point.applyQuaternion(this.renderView.camera.quaternion);

        if (this.point.x >= 0) {
            this.posXAxisHelper.material.opacity = 1;
            this.negXAxisHelper.material.opacity = 0.5;
        } else {
            this.posXAxisHelper.material.opacity = 0.5;
            this.negXAxisHelper.material.opacity = 1;
        }

        if (this.point.y >= 0) {
            this.posYAxisHelper.material.opacity = 1;
            this.negYAxisHelper.material.opacity = 0.5;
        } else {
            this.posYAxisHelper.material.opacity = 0.5;
            this.negYAxisHelper.material.opacity = 1;
        }

        if (this.point.z >= 0) {
            this.posZAxisHelper.material.opacity = 1;
            this.negZAxisHelper.material.opacity = 0.5;
        } else {
            this.posZAxisHelper.material.opacity = 0.5;
            this.negZAxisHelper.material.opacity = 1;
        }

        //

        const x = this.renderView.container.offsetWidth - this.dim;

        renderer.clearDepth();

        renderer.getViewport(vpTemp);
        renderer.setViewport(x, 0, this.dim, this.dim);

        renderer.render(this, this.camera);

        renderer.setViewport(vpTemp.x, vpTemp.y, vpTemp.z, vpTemp.w);
    }
    handleClick(event: MouseEvent) {
        this.mouse.x = (event.offsetX / this.dim) * 2 - 1;
        this.mouse.y = (-event.offsetY / this.dim) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
        if (intersects.length > 0) {
            const intersection = intersects[0];
            const object = intersection.object;
            this.view(object.userData.type);
            return true;
        } else {
            return false;
        }
    }
    view(type: viewType): Promise<any> {
        return new Promise((resolve, reject) => {
            const focusPoint = this.controls.target;
            const _camera = this.renderView.camera;
            switch (type) {
                case viewPosition.posX:
                    this.targetPosition.set(1, 0, 0);
                    break;
                case viewPosition.posY:
                    this.targetPosition.set(0, 1, 0);
                    break;
                case viewPosition.posZ:
                    this.targetPosition.set(0, 0, 1);
                    break;
                case viewPosition.negX:
                    this.targetPosition.set(-1, 0, 0);
                    break;
                case viewPosition.negY:
                    this.targetPosition.set(0, -1, 0);
                    break;
                case viewPosition.negZ:
                    this.targetPosition.set(0, 0, -1);
                    break;

                default:
                    console.error('ViewHelper: Invalid axis.');
            }
            this.offset.copy(this.targetPosition);
            this.offset.applyQuaternion(this.quat);
            this.spherical.setFromVector3(this.offset);
            this.spherical.phi = Math.max(
                this.controls.minPolarAngle,
                Math.min(this.controls.maxPolarAngle, this.spherical.phi),
            );
            this.spherical.makeSafe();
            this.offset.setFromSpherical(this.spherical);
            this.offset.applyQuaternion(this.quatInverse);
            this.targetPosition.set(0, 0, 0).add(this.offset);
            this.m.lookAt(this.targetPosition, new THREE.Vector3(0, 0, 0), _camera.up);
            this.targetQuaternion.setFromRotationMatrix(this.m);
            this.radius = _camera.position.distanceTo(focusPoint);
            this.targetPosition.multiplyScalar(this.radius).add(focusPoint);
            this.dummy.position.copy(focusPoint);
            this.dummy.lookAt(_camera.position);
            this.q1.copy(this.dummy.quaternion);
            this.dummy.lookAt(this.targetPosition);
            this.q2.copy(this.dummy.quaternion);
            // clock
            this.clock = new THREE.Clock();
            this._animate(resolve);
        });

        // tween
        // if (this.tween) this.tween.stop();
        // var preelapsed = 0;
        // this.tween = new TWEEN.Tween({ time: 0 })
        //     .to({ time: 1 }, 1500)
        //     .onUpdate((object, elapsed) => {
        //         var delta = elapsed - preelapsed;
        //         preelapsed = elapsed;
        //         if (delta === 0) return false;
        //         // const step = delta * this.turnRate;
        //         // animate position by doing a slerp and then scaling the position on the unit sphere
        //         this.update(delta);
        //         render();
        //     })
        //     .onComplete(() => {
        //         this.tween = null;
        //     })
        //     .start();
    }
    _animate(resolve: Function) {
        const delta = this.clock.getDelta();
        const step = delta * this.turnRate;
        const focusPoint = this.controls.target;
        const _camera = this.renderView.camera;
        // animate position by doing a slerp and then scaling the position on the unit sphere
        this.q1.rotateTowards(this.q2, step);
        _camera.position
            .set(0, 0, 1)
            .applyQuaternion(this.q1)
            .multiplyScalar(this.radius)
            .add(focusPoint);
        // animate orientation
        _camera.quaternion.rotateTowards(this.targetQuaternion, step);
        this.renderView.render();
        if (this.q1.angleTo(this.q2) < 1e-6) {
            resolve(true);
        } else {
            requestAnimationFrame(this._animate.bind(this, resolve));
        }
    }
}
