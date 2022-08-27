import { SideRenderView, ResizeTransAction, Box } from 'pc-render';
import Editor from '../../../Editor';
import { define } from '../define';
import * as THREE from 'three';

let offset = 0.02;
export const translateXPlus = define({
    valid(editor: Editor) {
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box);
        return !!object;
    },
    execute(editor: Editor) {
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box) as Box;
        let dir = new THREE.Vector3(offset, 0, 0);
        toWorld(dir, object);

        dir.add(object.position);

        editor.cmdManager.execute('update-transform', { object, transform: { position: dir } });
    },
});

export const translateXMinus = define({
    valid(editor: Editor) {
        // let selection = editor.pc.selection;
        // return !!(selection.length === 1 && selection[0] instanceof Box);
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box);
        return !!object;
    },
    execute(editor: Editor) {
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box) as Box;
        let dir = new THREE.Vector3(-offset, 0, 0);
        toWorld(dir, object);

        dir.add(object.position);

        editor.cmdManager.execute('update-transform', { object, transform: { position: dir } });
    },
});

export const translateYPlus = define({
    valid(editor: Editor) {
        // let selection = editor.pc.selection;
        // return !!(selection.length === 1 && selection[0] instanceof Box);
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box);
        return !!object;
    },
    execute(editor: Editor) {
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box) as Box;
        let dir = new THREE.Vector3(0, offset, 0);
        toWorld(dir, object);

        dir.add(object.position);

        editor.cmdManager.execute('update-transform', { object, transform: { position: dir } });
    },
});

export const translateYMinus = define({
    valid(editor: Editor) {
        // let selection = editor.pc.selection;
        // return !!(selection.length === 1 && selection[0] instanceof Box);
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box);
        return !!object;
    },
    execute(editor: Editor) {
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box) as Box;
        let dir = new THREE.Vector3(0, -offset, 0);
        toWorld(dir, object);

        dir.add(object.position);

        editor.cmdManager.execute('update-transform', { object, transform: { position: dir } });
    },
});

export const translateZPlus = define({
    valid(editor: Editor) {
        // let selection = editor.pc.selection;
        // return !!(selection.length === 1 && selection[0] instanceof Box);
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box);
        return !!object;
    },
    execute(editor: Editor) {
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box) as Box;
        let dir = new THREE.Vector3(0, 0, offset);
        toWorld(dir, object);

        dir.add(object.position);

        editor.cmdManager.execute('update-transform', { object, transform: { position: dir } });
    },
});

export const translateZMinus = define({
    valid(editor: Editor) {
        // let selection = editor.pc.selection;
        // return !!(selection.length === 1 && selection[0] instanceof Box);
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box);
        return !!object;
    },
    execute(editor: Editor) {
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box) as Box;
        let dir = new THREE.Vector3(0, 0, -offset);
        toWorld(dir, object);

        dir.add(object.position);

        editor.cmdManager.execute('update-transform', { object, transform: { position: dir } });
    },
});

export const rotationZLeft = define({
    valid(editor: Editor) {
        // let selection = editor.pc.selection;
        // return !!(selection.length === 1 && selection[0] instanceof Box);
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box);
        return !!object;
    },
    execute(editor: Editor) {
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box) as Box;
        let rotation = getRotationZ(offset, 1, object);
        editor.cmdManager.execute('update-transform', { object, transform: { rotation } });
    },
});

export const rotationZRight = define({
    valid(editor: Editor) {
        // let selection = editor.pc.selection;
        // return !!(selection.length === 1 && selection[0] instanceof Box);
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box);
        return !!object;
    },
    execute(editor: Editor) {
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box) as Box;
        let rotation = getRotationZ(offset, -1, object);
        editor.cmdManager.execute('update-transform', { object, transform: { rotation } });
    },
});

export const rotationZRight90 = define({
    valid(editor: Editor) {
        // let selection = editor.pc.selection;
        // return !!(selection.length === 1 && selection[0] instanceof Box);
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box);
        return !!object;
    },
    execute(editor: Editor) {
        let object = editor.pc.selection.find((annotate) => annotate instanceof Box) as Box;
        let rotation = getRotationZ(Math.PI / 2, -1, object);
        let scale = object.scale.clone();

        let temp = scale.x;
        scale.x = scale.y;
        scale.y = temp;

        editor.cmdManager.execute('update-transform', { object, transform: { rotation, scale } });
    },
});

let tempV3 = new THREE.Vector3();
function toWorld(offset: THREE.Vector3, object: THREE.Object3D) {
    // console.log('start',offset)
    let center = tempV3.set(0, 0, 0).applyMatrix4(object.matrixWorld);
    offset.applyMatrix4(object.matrixWorld).sub(center);
    // console.log('end',offset)
}

let tempQuat = new THREE.Quaternion();
let starQuat = new THREE.Quaternion();
let axisDir = new THREE.Vector3(0, 0, 1);
function getRotationZ(angle: number, dir: number, object: THREE.Object3D) {
    starQuat.setFromEuler(object.rotation);
    tempQuat.setFromAxisAngle(axisDir, dir * angle);
    tempQuat.premultiply(starQuat);

    let rotation = new THREE.Euler();
    rotation.setFromQuaternion(tempQuat);
    return rotation;
}
