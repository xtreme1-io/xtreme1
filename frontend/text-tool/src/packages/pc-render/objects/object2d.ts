import * as THREE from 'three';
import { AnnotateType } from '../type';
import { isPointInRect } from '../utils';

export class Object2D {
    connectId: number = -1;
    uuid: string = '';
    viewId: string = '';
    visible: boolean = true;
    dashed: boolean = false;
    userData: any;
    annotateType: AnnotateType;
    position: any;
    color: string;
    constructor() {
        this.userData = {};
        this.annotateType = AnnotateType.ANNOTATE_2D;
        this.uuid = THREE.MathUtils.generateUUID();
        this.color = '#ffffff';
    }
    isContainPosition(pos: THREE.Vector2) {
        return false;
    }
}

let temp1 = new THREE.Vector2();
let temp2 = new THREE.Vector2();
// Rect
export class Rect extends Object2D {
    center: THREE.Vector2 = new THREE.Vector2();
    size: THREE.Vector2 = new THREE.Vector2();
    constructor(center?: THREE.Vector2, size?: THREE.Vector2) {
        super();
        if (center) this.center.copy(center);
        if (size) this.size.copy(size);
    }

    isContainPosition(pos: THREE.Vector2) {
        temp1.copy(this.center).addScaledVector(this.size, -0.5);
        temp2.copy(this.center).addScaledVector(this.size, 0.5);

        return pos.x >= temp1.x && pos.x <= temp2.x && pos.y >= temp1.y && pos.y <= temp2.y;
    }
}

// Box2D
export type Vector2Of4 = [THREE.Vector2, THREE.Vector2, THREE.Vector2, THREE.Vector2];
let tempVector2Of4 = getVector2Of4();
export class Box2D extends Object2D {
    positions1: Vector2Of4 = getVector2Of4();
    positions2: Vector2Of4 = getVector2Of4();
    constructor(positions1?: Vector2Of4, positions2?: Vector2Of4) {
        super();

        if (positions1) this.copyVector2Of4(positions1, this.positions1);
        if (positions2) this.copyVector2Of4(positions2, this.positions2);
    }
    isContainPosition(pos: THREE.Vector2) {
        if (isPointInRect(pos, this.positions1)) return true;
        if (isPointInRect(pos, this.positions2)) return true;

        for (let i = 0; i < 4; i++) {
            let next = i + 1;
            if (next === 4) next = 0;
            tempVector2Of4[0] = this.positions1[i];
            tempVector2Of4[1] = this.positions1[next];
            tempVector2Of4[2] = this.positions2[next];
            tempVector2Of4[3] = this.positions2[i];
            if (isPointInRect(pos, tempVector2Of4)) return true;
        }

        return false;
        // temp1.copy(this.center).addScaledVector(this.size, -0.5);
        // temp2.copy(this.center).addScaledVector(this.size, 0.5);

        // return pos.x >= temp1.x && pos.x <= temp2.x && pos.y >= temp1.y && pos.y <= temp2.y;
    }
    copyVector2Of4(source: Vector2Of4, target: Vector2Of4) {
        target.forEach((e, index) => {
            e.copy(source[index]);
        });
    }

    getCenter(pos?: THREE.Vector2) {
        pos = pos || new THREE.Vector2();

        let sumX = 0;
        let sumY = 0;
        this.positions1.forEach((e, index) => {
            sumX += this.positions1[index].x;
            sumX += this.positions2[index].x;

            sumY += this.positions1[index].y;
            sumY += this.positions2[index].y;
        });

        pos.set(sumX / 8, sumY / 8);

        return pos;
    }
}

function getVector2Of4(): Vector2Of4 {
    return [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()];
}
