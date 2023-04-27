import * as THREE from 'three';

interface IOption {
    hasIntensity: boolean;
}

function getShaderCode(option: IOption = { hasIntensity: false }) {
    let defines = [];
    if (option.hasIntensity) defines.push('#define FLAG_INTENSITY');

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
    uniform ColorItem colorRange[6];
    uniform float colorMode;

    // intensity
    #ifdef FLAG_INTENSITY
    uniform vec2 intensityRange;
    attribute float intensity;
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

        vec3 color = vec3(1.0,0,0);
        ColorItem item;
        for(int i = 0; i < 6; i++){
            item = colorRange[i];
            if(value >= item.min && value < item.max) {
                color = item.color;
                break;
            }
        }

        return color;
    }


    void main()	{

        vOpacity = 1.0;
        float vDiscard = -1.0;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = pointSize;
        if(position.z>heightRange.y||position.z<heightRange.x){
            vDiscard = 1.0;  
        }
        
        if( colorMode > 0.0 ) {

            #ifdef FLAG_INTENSITY
            if(intensityRange.x > intensity || intensityRange.y < intensity){

                vDiscard = 1.0;  

            }else {

                // vColor = vec3(intensity/50.0);
                vColor = getColor(position.z) * intensity / 10.0;

            }
            #endif
             
        
        } else {
                vColor = getColor(position.z);
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

export enum IColorMode {
    COLOR_BY_HEIGHT = -1.0,
    COLOR_BY_INTENSITY = 1.0,
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
    colorMode?: IColorMode;
    // intensity
    intensityRange?: THREE.Vector2;
    // color
    colorN?: number;
    colorRange?: IColorRangeItem[];
    // Camera Region
    hasCameraRegion?: number;
    regionMatrix?: THREE.Matrix4;
}

type UniformKey = keyof IUniformOption;

export default class PointsMaterial extends THREE.RawShaderMaterial {
    option: IOption = { hasIntensity: false };
    constructor() {
        super({
            uniforms: {
                heightRange: {
                    value: new THREE.Vector2(-10000, 10000),
                },
                pointHeight: {
                    value: new THREE.Vector2(-10000, 10000),
                },
                pointSize: { value: 1 },
                trimType: { value: 1.0 },
                colorMode: { value: -1 },

                intensityRange: { value: new THREE.Vector2(0, 255) },
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
                colorRange: {
                    value: [
                        { min: -3, max: -1.5, color: new THREE.Color(1, 0, 0) },
                        { min: -1.5, max: 0, color: new THREE.Color(0, 1, 0) },
                        { min: 0, max: 2, color: new THREE.Color(0, 0, 1) },
                        { min: 0, max: 2, color: new THREE.Color(0, 0, 1) },
                        { min: 0, max: 2, color: new THREE.Color(0, 0, 1) },
                    ],
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
                case 'colorRange':
                    option.colorRange?.forEach((e, index) => {
                        uniforms.colorRange.value[index] = e;
                    });
                    break;
                default:
                    uniforms[key].value = option[key];
            }
        });
    }
}
