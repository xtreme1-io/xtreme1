import { max, min } from 'lodash';
import * as THREE from 'three';

export function getPositionGround(position: number[]) {
    let info = statisticPositionInfo(position, 1);

    let maxKey = 0;
    let maxValue = -Infinity;
    Object.keys(info).forEach((attr) => {
        let key = +attr;
        if (info[attr] > maxValue) {
            maxValue = info[attr];
            maxKey = key;
        }
    });
    return maxKey;
}

export function statisticPositionInfo(position: number[], precision = 2, index = 2) {
    let info = {};
    let len = position.length;
    for (let i = 0; i < len; i = i + 3) {
        let v = position[i + index];
        let strValue = v.toFixed(precision);

        info[strValue] = info[strValue] || 0;
        info[strValue]++;
    }

    return info;
}

export function statisticPositionVInfo(
    position: THREE.Vector3[],
    precision = 2,
    index: 'x' | 'y' | 'z' = 'z',
) {
    let info = {} as Record<string, number>;
    let len = position.length;
    for (let i = 0; i < len; i++) {
        let v = position[i][index];
        let strValue = v.toFixed(precision);

        info[strValue] = info[strValue] || 0;
        info[strValue]++;
    }

    return info;
}

export function getMaxMinInfo(
    info: Record<string, number>,
    option = { filter: 1, min: -Infinity, max: Infinity },
) {
    let { filter = 1, min = -Infinity, max = Infinity } = option;
    let infoMax = -Infinity;
    let infoMin = Infinity;

    Object.keys(info).forEach((attr) => {
        let key = +attr;
        let value = info[attr];
        if (value <= filter || key < min || key > max) return;
        if (key > infoMax) {
            infoMax = key;
        }
        if (key < infoMin) {
            infoMin = key;
        }
    });

    return { infoMax, infoMin };
}
