export interface IToolConfig {
    backgroudColor: string;
    defaultCorlor: string;
    maskgroudColor: string;
    isDrawing: boolean;
    soloMode: boolean;
    showDistance: boolean;
    showPoly: boolean;
    showLabel: boolean;
    showAttr: boolean;
    limitInBackgroud: boolean;
    userColor: string;
    isShowMask: boolean;
    fillalpha: number;
    spaceKeyIsPressed: boolean;
}

export const config: IToolConfig = {
    backgroudColor: '#aaaaaa',
    defaultCorlor: '#ffffff',
    maskgroudColor: '#000000',
    isDrawing: false,
    isShowMask: false,
    soloMode: false,
    showDistance: false,
    showPoly: true,
    showLabel: true,
    showAttr: false,
    limitInBackgroud: false,
    userColor: '',
    fillalpha: 0.1,
    spaceKeyIsPressed: false,
};
