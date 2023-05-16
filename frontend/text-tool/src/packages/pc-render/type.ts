import * as THREE from 'three';

export type { AnnotateObject, Vector2Of4 } from './objects';

export interface Intersect {
    object: THREE.Object3D;
    distance: number;
    point: THREE.Vector3;
}

export interface ITransform {
    rotation?: THREE.Euler;
    scale?: THREE.Vector3;
    position?: THREE.Vector3;
}

export interface IRenderViewConfig<T> {
    name?: string;
    actions?: T[];
    [key: string]: any;
}

export interface ICameraInternal {
    fx: number;
    fy: number;
    cx: number;
    cy: number;
}

export enum AnnotateType {
    ANNOTATE_3D = 'annotate_3d',
    ANNOTATE_2D = 'annotate_2d',
}
