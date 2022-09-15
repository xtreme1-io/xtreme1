import * as THREE from 'three';
import { Intersect } from '../type';
import { get } from '../utils/tempVar';
import { AnnotateType } from '../type';

let defaultMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    toneMapped: false,
});

let dashedMaterial = new THREE.LineDashedMaterial({
    color: 0xffffff,
    linewidth: 1,
    scale: 1,
    dashSize: 0.1,
    gapSize: 0.1,
});
// defaultMaterial.depthTest = false;

let { indices, positions, lineDistance } = getBoxInfo();
const emptyGeometry = new THREE.BufferGeometry();
emptyGeometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));

const defaultGeometry = new THREE.BufferGeometry();
defaultGeometry.setIndex(new THREE.Uint16BufferAttribute(indices, 1));
defaultGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
defaultGeometry.setAttribute('lineDistance', new THREE.Float32BufferAttribute(lineDistance, 1));
defaultGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 0.8660254037844386);
defaultGeometry.boundingBox = new THREE.Box3(
    new THREE.Vector3(-0.5, -0.5, -0.5),
    new THREE.Vector3(0.5, 0.5, 0.5),
);

interface IEditConfig {
    resize: boolean;
}

export default class Box extends THREE.LineSegments {
    // object: THREE.Box3;
    dashed: boolean = false;
    dashedMaterial: THREE.LineDashedMaterial = dashedMaterial;
    annotateType: AnnotateType;
    editConfig: IEditConfig = { resize: true };
    color: THREE.Color;
    constructor() {
        super(defaultGeometry, defaultMaterial);

        this.type = 'Box3Helper';
        // EMPTY
        this.annotateType = AnnotateType.ANNOTATE_3D;
        this.color = new THREE.Color();
    }

    raycast(raycaster: THREE.Raycaster, intersects: Intersect[]) {
        if (!this.visible) return;

        let geometry = this.geometry;
        const matrixWorld = this.matrixWorld;

        let _sphere = get(THREE.Sphere, 0).copy(geometry.boundingSphere as any);
        _sphere.applyMatrix4(matrixWorld);

        if (raycaster.ray.intersectsSphere(_sphere) === false) return;

        let _inverseMatrix = get(THREE.Matrix4, 0).copy(matrixWorld).invert();
        let _ray = get(THREE.Ray, 0).copy(raycaster.ray).applyMatrix4(_inverseMatrix);

        if (geometry.boundingBox === null) geometry.computeBoundingBox();

        if (_ray.intersectsBox(geometry.boundingBox as any) === false) return;
        else {
            let pos = get(THREE.Vector3, 0).set(0, 0, 0).applyMatrix4(matrixWorld);
            let distance = pos.distanceTo(raycaster.ray.origin);
            intersects.push({ object: this, distance, point: pos });
        }
    }
}

function getBoxInfo() {
    const arrowLen = 0.4;
    const arrowWidth = 0.15;
    const dirStartX = 0.25;
    const dirEndX = 1.0 + arrowLen;
    const indices = [
        // box index  +z
        0, 1, 1, 2, 2, 3, 3, 0,
        // box index  -z
        4, 5, 5, 6, 6, 7, 7, 4,
        // box line
        0, 4, 1, 5, 2, 6, 3, 7,
        //  line
        8, 9,
        // arrow
        9, 10, 10, 11, 11, 9, 9, 12, 13, 12, 13, 9,
    ];

    const lineDistance = [
        // box index  +z
        0, 1, 2, 1,
        // box index  -z
        1, 2, 3, 2,
        //  line
        0, 2,
        // arrow
        0.2, 0.2, 0.2, 0.2,
    ];

    const positions = [
        // box points +z
        1,
        1,
        1,
        -1,
        1,
        1,
        -1,
        -1,
        1,
        1,
        -1,
        1,
        // box points -z
        1,
        1,
        -1,
        -1,
        1,
        -1,
        -1,
        -1,
        -1,
        1,
        -1,
        -1,
        // line
        dirStartX,
        0,
        0,
        dirEndX,
        0,
        0,
        // arrow pos 1
        1.0,
        arrowWidth,
        0,
        // arrow pos 2
        1.0,
        -arrowWidth,
        0,
        // arrow pos 3
        1.0,
        0,
        arrowWidth,
        //  arrow pos 4
        1.0,
        0,
        -arrowWidth,
    ];
    positions.forEach((e, index) => {
        positions[index] *= 0.5;
    });

    return { indices, positions, lineDistance };
}
