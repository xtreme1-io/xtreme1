import Editor from '../Editor';
import { getColorRangeByArray, countVisiblePointN } from '../utils';
import * as THREE from 'three';
import { Points, PointsMaterial } from 'pc-render';
import { debounce } from 'lodash';

export default class ConfigManager {
    editor: Editor;

    constructor(editor: Editor) {
        this.editor = editor;

        this.initConfig();
    }

    initConfig() {
        let config = this.editor.state.config;
        this.editor.pc.material.setUniforms({
            // trimType: config.type === 'range-only' ? 1 : 2,
            pointSize: config.pointSize * 10,
            edgeColor: config.edgeColor,
            pointHeight: new THREE.Vector2().fromArray(config.pointHeight),
        });
    }
    countVisiblePointN = debounce(async () => {
        const config = this.editor.state.config;
        let points = this.editor.pc.groupPoints.children[0] as Points;
        let positions = points.geometry.getAttribute('position') as THREE.BufferAttribute;
        config.pointInfo.vCount = await countVisiblePointN(positions, config.heightRange);
    }, 50);
    updatePointConfig(ground: number, intensityRange?: [number, number]) {
        let { config } = this.editor.state;
        let points = this.editor.pc.groupPoints.children[0] as Points;

        if (!points.geometry.boundingBox) points.geometry.computeBoundingBox();
        let boundingBox = points.geometry.boundingBox as THREE.Box3;
        let position = points.geometry.getAttribute('position') as THREE.BufferAttribute;
        const color = points.geometry.getAttribute('color') as THREE.BufferAttribute;
        const velocity = points.geometry.getAttribute('velocity') as THREE.BufferAttribute;
        let pointIntensity = config.pointIntensity;
        let pointInfo = config.pointInfo;
        pointInfo.hasIntensity = !!intensityRange;
        pointInfo.hasVelocity = velocity?.count > 0;
        pointInfo.hasRGB = color?.count > 0;
        if (intensityRange) {
            pointInfo.intensityRange.set(intensityRange[0], intensityRange[1]);
            config.pointIntensity = [
                Math.max(intensityRange[0], pointIntensity[0]),
                Math.min(intensityRange[1], pointIntensity[1]),
            ];
        } else {
            pointInfo.intensityRange.set(0, 0);
        }
        pointInfo.count = position.count;
        pointInfo.min.copy(boundingBox.min);
        pointInfo.max.copy(boundingBox.max);
        config.heightRange[0] = Math.max(config.heightRange[0], pointInfo.min.z);
        config.heightRange[1] = Math.min(config.heightRange[1], pointInfo.max.z);

        const _ground = config.pointHeight[0];
        if (_ground < pointInfo.min.z || _ground > pointInfo.max.z) {
            config.pointHeight[0] = ground;
        }
        // config.pointHeight[0] = Math.max(config.pointHeight[0], pointInfo.min.z);
        config.pointHeight[1] = Math.min(config.pointHeight[1], pointInfo.max.z);
        // config.groundValue = ground;
        this.editor.pc.ground.plane.constant = config.pointHeight[0];
        let material = points.material as PointsMaterial;
        material.setOption({
            hasIntensity: pointInfo.hasIntensity,
            hasRGB: pointInfo.hasRGB,
            hasVelocity: pointInfo.hasVelocity,
        });
        material.setUniforms({
            // groundValue: ground,
            colorRoad: -1,
            pointHeight: new THREE.Vector2().fromArray(config.pointHeight),
            pointVelocity: new THREE.Vector2().fromArray(config.pointVelocity),
            heightRange: new THREE.Vector2().fromArray(config.heightRange),
        });
    }
}
