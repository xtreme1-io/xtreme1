import * as THREE from 'three';
import { getColorTable } from '../utils';

interface IOption {
    hasIntensity: boolean;
    hasVelocity: boolean;
    hasRGB: boolean;
}

function getShaderCode(
    option: IOption = { hasIntensity: false, hasVelocity: false, hasRGB: false },
) {
    let defines = [];
    if (option.hasIntensity) defines.push('#define FLAG_INTENSITY');
    if (option.hasRGB) defines.push('#define FLAG_COLOR');
    if (option.hasVelocity) defines.push('#define FLAG_V');
    let vertex = `
    ${defines.join('\n')}
    precision mediump float;
    precision mediump int;

    struct ColorItem {
        float min;
        float max;
        vec3 color;
    };

    struct FilterBox {
        // 0 color, 1 color filter,
        float type;
        vec3 min;
        vec3 max;
        vec3 color;
        mat4 matrix;
    };


    // color
    uniform vec3 colorTable[64];
    uniform float colorMode;
    uniform vec3 edgeColor[2];
    uniform vec3 singleColor;
    uniform float openIntensity;
    uniform float brightness;

    attribute float road;
    uniform float colorRoad;

    #ifdef FLAG_COLOR
    attribute vec3 color;
    #endif

    // intensity
    #ifdef FLAG_INTENSITY
    uniform vec2 intensityRange;
    attribute float intensity;
    #endif

    #ifdef FLAG_V
    uniform vec2 velocityRange;
    uniform vec2 pointVelocity;
    attribute float velocity;
    #endif

    // matrix
    uniform mat4 modelViewMatrix; 
    uniform mat4 projectionMatrix; 

    // 
    uniform vec2 heightRange;
    uniform vec2 pointHeight;
    uniform float pointSize; 
    // 1.0 range-only, 2.0 range-opacity
    uniform float trimType; 

    // filter box
    uniform float hasFilterBox;
    uniform FilterBox boxInfo;

    // camera region
    uniform float hasCameraRegion;
    uniform mat4 regionMatrix;

    attribute vec3 position;
    //attribute vec4 color;

    varying vec3 vColor;
    varying float vOpacity;

    bool isInBox(vec3 pos, vec3 min, vec3 max){
        return pos.x >= min.x && pos.x <= max.x && pos.y >= min.y && pos.y <= max.y && pos.z >= min.z && pos.z <= max.z;
    }

    vec3 getColor(float value){
        vec3 color = vec3(1,0,0);
        float min = pointHeight.x;
        float max = pointHeight.y;
        if(colorRoad>0.0) min = 0.0;

        if(colorRoad>0.0&&road>0.0){
          color = edgeColor[0];
        } else if(value <= min){
            color = edgeColor[0];
        }else if(value >= max){
            color = edgeColor[1];
        }else{
            float alpha = (value-min) / (max-min);
            int index = int(floor(alpha * 64.0));
            if(index==64) index = 63;
            color = colorTable[index];
        }
        return color;
    }

    vec3 getColorByV(float value, vec2 vValue){
        vec3 c1 = edgeColor[0];
        vec3 c2 = edgeColor[1];
        if(value<vValue.x){
            return c1;
        }
        if(value>vValue.y){
            return c2;
        }
        float total = vValue.y - vValue.x;
        float alpha = (value - vValue.x) / total;
        c1.r = c1.r+(c2.r-c1.r)*alpha;
        c1.g = c1.g+(c2.g-c1.g)*alpha;
        c1.b = c1.b+(c2.b-c1.b)*alpha;
        return c1;
    }


    void main()	{

        vOpacity = 1.0;
        float vDiscard = -1.0;
        float vPointSize = pointSize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        if(position.z>heightRange.y||position.z<heightRange.x){
            vDiscard = 1.0;  
        }
        
        if (colorMode == 1.0)
        {
            if(colorRoad>0.0&&road>0.0){
                vColor = edgeColor[0];
            } else {
                vColor = singleColor;
            }

        } else if(colorMode == 2.0)
        {
            #ifdef FLAG_COLOR
            vColor = color / 255.0;
            #endif
        } else if(colorMode == 3.0) {
            #ifdef FLAG_V
            vColor = getColorByV(velocity, pointVelocity);
            if(velocity!=0.0){
                vPointSize+=2.0;
            }
            #endif
        } else {
            vColor = getColor(position.z);
        }
        if(openIntensity > 0.0){
            #ifdef FLAG_INTENSITY
            if(intensityRange.x > intensity || intensityRange.y < intensity){
                vDiscard = 1.0;  
            }else {
                vColor *= intensity / 10.0;
            }
            #endif
            
        }

        if(hasCameraRegion > 0.0){
            vec4 posNor = regionMatrix * vec4( position, 1.0 );
            posNor.xyz = posNor.xyz/posNor.w;
            if( isInBox(posNor.xyz, vec3(-1.0,-1.0,-1.0),vec3(1.0,1.0,1.0))){
                vColor = vec3(1.0,1.0,1.0);
            }

        }

        if(hasFilterBox > 0.0){
            vec4 boxPos = boxInfo.matrix *  vec4( position, 1.0 );
            //type: 0 color, 1 color filter,
            float type = boxInfo.type;
            if(type == 0.0){
                if(isInBox(boxPos.xyz,boxInfo.min,boxInfo.max)){
                    vColor = boxInfo.color;
                }
            }else if(type == 1.0){
                if(isInBox(boxPos.xyz,boxInfo.min,boxInfo.max)){
                    vColor = boxInfo.color;
                }else{
                    // gl_Position = vec4(2.0);
                    vDiscard = 1.0;
                }
            }
            
        }
        vColor *= brightness;
        gl_PointSize = vPointSize;
        if(vDiscard > 0.0) {
            gl_Position = vec4(2.0,2.0,2.0,1.0);
            vOpacity = 0.0;
        }

    }`;

    let frag = `
    precision mediump float;
    precision mediump int;

    varying vec3 vColor;
    varying float vOpacity;

    void main()	{
        gl_FragColor = vec4(vColor*vOpacity,vOpacity);

    }`;

    return { vertex, frag };
}

export interface IColorRangeItem {
    min: number;
    max: number;
    color: THREE.Color;
}

// struct CameraRegion{
//     uniform mat4 matrix;
//     uniform vec2 imgSize;
// }

type IBoxInfoType = 0 | 1;

export enum ColorModeEnum {
    HEIGHT = 0.0,
    PURE = 1.0,
    RGB = 2.0,
    VELOCITY = 3.0,
}
export interface IUniformOption {
    groundColor?: THREE.Color;
    pointSize?: number;
    // 1.0 range-only, 2.0 range-opacity
    trimType?: 1 | 2;
    // filter
    hasFilterBox?: -1 | 1;
    boxInfo?: {
        type?: IBoxInfoType;
        min?: THREE.Vector3;
        max?: THREE.Vector3;
        color?: THREE.Color;
        matrix?: THREE.Matrix4;
    };
    heightRange?: THREE.Vector2;
    pointHeight?: THREE.Vector2;
    edgeColor?: [string, string];
    singleColor?: string;
    colorMode?: ColorModeEnum;
    colorRoad?: number;
    openIntensity?: 1 | -1;
    brightness?: number;
    velocityRange?: THREE.Vector2;
    pointVelocity?: THREE.Vector2;
    // intensity
    intensityRange?: THREE.Vector2;
    // color
    colorN?: number;
    // colorRange?: IColorRangeItem[];
    // Camera Region
    hasCameraRegion?: number;
    regionMatrix?: THREE.Matrix4;
}

type UniformKey = keyof IUniformOption;

export default class PointsMaterial extends THREE.RawShaderMaterial {
    option: IOption = { hasIntensity: false, hasRGB: false, hasVelocity: false };
    constructor() {
        super({
            uniforms: {
                heightRange: {
                    value: new THREE.Vector2(-10000, 10000),
                },
                pointHeight: {
                    value: new THREE.Vector2(-10000, 10000),
                },
                pointVelocity: {
                    value: new THREE.Vector2(-10000, 10000),
                },
                pointSize: { value: 1 },
                trimType: { value: 1.0 },
                colorMode: { value: -1 },
                colorRoad: { value: -1 },
                intensityRange: { value: new THREE.Vector2(0, 255) },
                velocityRange: { value: new THREE.Vector2() },
                brightness: { value: 1 },
                // filter
                hasFilterBox: { value: -1 },
                boxInfo: {
                    value: {
                        // 0 color, 1 color filter,
                        type: 0,
                        min: new THREE.Vector3(-10, -10, -5),
                        max: new THREE.Vector3(10, 10, 5),
                        color: new THREE.Color(1, 1, 0),
                        matrix: new THREE.Matrix4(),
                    },
                },
                edgeColor: {
                    value: ['#000dff', '#ff0000'].map((color) => new THREE.Color(color)),
                },
                singleColor: {
                    value: new THREE.Color('#87abff'),
                },
                colorTable: {
                    value: getColorTable(),
                },
                openIntensity: {
                    value: -1,
                },
                hasCameraRegion: { value: -1 },
                regionMatrix: { value: new THREE.Matrix4() },
            },
            vertexShader: '',
            fragmentShader: '',
        });
        this.updateShader();
    }

    updateShader() {
        let { vertex, frag } = getShaderCode(this.option);
        this.vertexShader = vertex;
        this.fragmentShader = frag;
        this.needsUpdate = true;
    }

    setOption(option: IOption) {
        Object.assign(this.option, option);
        this.updateShader();
    }

    getUniforms(key: UniformKey) {
        return this.uniforms[key].value;
    }
    setUniforms(option: IUniformOption) {
        let keys = Object.keys(option) as UniformKey[];
        let uniforms = this.uniforms;
        keys.forEach((key) => {
            switch (key) {
                case 'boxInfo':
                    Object.assign(uniforms[key].value, option[key]);
                    break;
                case 'singleColor':
                    uniforms.singleColor.value.set(option.singleColor);
                    break;
                case 'edgeColor':
                    option.edgeColor?.forEach((color, index) => {
                        uniforms.edgeColor.value[index].set(color);
                    });
                    break;
                default:
                    uniforms[key].value = option[key];
            }
        });
    }
}
