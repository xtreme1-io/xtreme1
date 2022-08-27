import { IHotkeyConfig } from '../type';
import UAParser from 'ua-parser-js';
// import { SideRenderView } from 'pc-render';

const parser = new UAParser();
let osInfo = parser.getResult();

let osName = (osInfo.os.name || '').toLowerCase();
let isMac = osName.indexOf('mac') >= 0;

const hotkeyConfig: IHotkeyConfig[] = [
    { key: 'f', action: 'createObjectWith3' },
    // { key: 'f', action: ['createObjectWith3', 'create2DRect', 'create2DBox', 'createAnnotation'] },
    // mac or window
    isMac ? { key: 'backspace', action: 'deleteObject' } : { key: 'del', action: 'deleteObject' },
    { key: 'ctrl+z', action: 'undo' },
    { key: 'ctrl+shift+z', action: 'redo' },

    { key: 'Alt+right', action: 'copyForward' },
    { key: 'Alt+left', action: 'copyBackWard' },

    // side view
    // 【AWSD】 以物体行进方向，向后向上向下向前平移结果
    // 【QE】以物体行进方向，向左向右平移结果
    // 【ZX】 俯视图 视角下，向左向右旋转点云图
    { key: 'e', action: 'translateYMinus' },
    { key: 'q', action: 'translateYPlus' },
    { key: 'a', action: 'translateXMinus' },
    { key: 'd', action: 'translateXPlus' },
    { key: 'w', action: 'translateZPlus' },
    { key: 's', action: 'translateZMinus' },
    { key: 'z', action: 'rotationZLeft' },
    { key: 'x', action: 'rotationZRight' },
    { key: 'c', action: 'rotationZRight90' },
    //
    { key: 'g', action: 'toggleTranslate' },
    { key: 'y', action: 'focusObject' },
    // view
    { key: 't', action: 'toggleClassView' },
    { key: 'm', action: 'toggleShowLabel' },
    { key: 'n', action: 'toggleShowMeasure' },
    { key: 'shift+h', action: 'toggleShowAnnotation' },
    { key: 'h', action: 'resultExpandToggle' },
    { key: 'b', action: 'filter2DByTrack' },

    { key: '1', action: 'toggleViewPosZ' },
    { key: '2', action: 'toggleViewPosX' },
    { key: '3', action: 'toggleViewPosY' },
    { key: '4', action: 'toggleViewNegX' },
    { key: '5', action: 'toggleViewNegY' },
    { key: '6', action: 'toggleViewNegZ' },
    //
    { key: 'right', action: 'nextFrame' },
    { key: 'left', action: 'preFrame' },
];

export default hotkeyConfig;
