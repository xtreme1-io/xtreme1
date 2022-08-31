import Editor from '../Editor';
import { getColorRangeByArray, filterPosition } from '../utils';
import * as THREE from 'three';
import { Points, PointsMaterial } from 'pc-render';

export default class ConfigManager {
    editor: Editor;

    constructor(editor: Editor) {
        this.editor = editor;

        this.initConfig();
    }

    initConfig() {
        let colors = [
            { value: '#6055C6' },
            { value: '#378CDF' },
            { value: '#1CC7C1' },
            { value: '#33EC83' },
            { value: '#7FF55B' },
        ];
        let config = this.editor.state.config;
        this.editor.pc.material.setUniforms({
            // trimType: config.type === 'range-only' ? 1 : 2,
            pointSize: config.pointSize * 10,
            trimMin: new THREE.Vector3(config.trimMin.x, config.trimMin.y, config.trimMin.z),
            trimMax: new THREE.Vector3(config.trimMax.x, config.trimMax.y, config.trimMax.z),
            colorN: colors.length,
            colorRange: getColorRangeByArray(config.pointColors, config.pointHeight, [
                config.trimMin.z,
                config.trimMax.z,
            ]),
            pointHeight: new THREE.Vector2().fromArray(config.pointHeight),
            // getColorRange(
            //     config.trimMin.z,
            //     config.trimMax.z,
            //     colors.map((e) => e.value),
            // ),
            // hasCameraRegion: 1,
            // regionMatrix: camera_external,
        });
    }

    updatePointConfig(ground: number, intensityRange?: [number, number]) {
        let { config } = this.editor.state;
        let points = this.editor.pc.groupPoints.children[0] as Points;

        if (!points.geometry.boundingBox) points.geometry.computeBoundingBox();
        let boundingBox = points.geometry.boundingBox as THREE.Box3;
        let position = points.geometry.getAttribute('position') as THREE.BufferAttribute;

        let pointIntensity = config.pointIntensity;
        let pointInfo = config.pointInfo;
        pointInfo.hasIntensity = !!intensityRange;
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

        pointInfo.vCount = filterPosition(position, config.heightRange).length;

        const _ground = config.pointHeight[0];
        if (_ground < pointInfo.min.z || _ground > pointInfo.max.z) {
            config.pointHeight[0] = ground;
        }
        // config.pointHeight[0] = Math.max(config.pointHeight[0], pointInfo.min.z);
        config.pointHeight[1] = Math.min(config.pointHeight[1], pointInfo.max.z);
        // config.groundValue = ground;
        this.editor.pc.ground.plane.constant = config.pointHeight[0];
        let material = points.material as PointsMaterial;
        material.setOption({ hasIntensity: pointInfo.hasIntensity });
        material.setUniforms({
            // groundValue: ground,
            colorRange: getColorRangeByArray(config.pointColors, config.pointHeight, [
                config.pointInfo.min.z,
                config.pointInfo.max.z,
            ]),
            heightRange: new THREE.Vector2().fromArray(config.heightRange),
        });
    }
}
