import { IHotkeyConfig } from '../type';
import { UITypeEnum } from '../../enum/UITypeEnum';
import UAParser from 'ua-parser-js';

const parser = new UAParser();
const osInfo = parser.getResult();
const osName = (osInfo.os.name || '').toLowerCase();
const isMac = osName.indexOf('mac') >= 0;
console.log('isMac:', isMac);

const macConfig: IHotkeyConfig[] = [
    { key: 'Backspace', action: 'onDelete' },
    { key: '⌘ + s', action: 'onSave' },
    { key: '⌘ + z', action: 'undo' },
    { key: '⌘ + Shift + z', action: 'redo' },
    { key: '⌘ + up', action: 'translate', args: { direction: 'up', distance: 1 } },
    { key: '⌘ + down', action: 'translate', args: { direction: 'down', distance: 1 } },
    { key: '⌘ + left', action: 'translate', args: { direction: 'left', distance: 1 } },
    { key: '⌘ + right', action: 'translate', args: { direction: 'right', distance: 1 } },
    { key: '⌘ + Shift + up', action: 'translate', args: { direction: 'up', distance: 10 } },
    { key: '⌘ + Shift + down', action: 'translate', args: { direction: 'down', distance: 10 } },
    { key: '⌘ + Shift + left', action: 'translate', args: { direction: 'left', distance: 10 } },
    { key: '⌘ + Shift + right', action: 'translate', args: { direction: 'right', distance: 10 } },
    { key: '⌘ + x', action: 'clipPolygon', args: { firstisClip: true } },
    { key: '⌘ + Shift + x', action: 'cancelClip' },
];
const windowsConfig: IHotkeyConfig[] = [
    { key: 'Delete', action: 'onDelete' },
    { key: 'Ctrl + s', action: 'onSave' },
    { key: 'Ctrl + z', action: 'undo' },
    { key: 'Ctrl + Shift + z', action: 'redo' },
    { key: 'Ctrl + up', action: 'translate', args: { direction: 'up', distance: 1 } },
    { key: 'Ctrl + down', action: 'translate', args: { direction: 'down', distance: 1 } },
    { key: 'Ctrl + left', action: 'translate', args: { direction: 'left', distance: 1 } },
    { key: 'Ctrl + right', action: 'translate', args: { direction: 'right', distance: 1 } },
    { key: 'Ctrl + Shift + up', action: 'translate', args: { direction: 'up', distance: 10 } },
    { key: 'Ctrl + Shift + down', action: 'translate', args: { direction: 'down', distance: 10 } },
    { key: 'Ctrl + Shift + left', action: 'translate', args: { direction: 'left', distance: 10 } },
    {
        key: 'Ctrl + Shift + right',
        action: 'translate',
        args: { direction: 'right', distance: 10 },
    },
    { key: 'Ctrl + x', action: 'clipPolygon', args: { firstisClip: true } },
    { key: 'Ctrl + Shift + x', action: 'cancelClip' },
];
const commonConfig: IHotkeyConfig[] = [
    // { key: 'Esc', action: 'KeyEscDown' },
    // { key: 'Enter', action: 'KeyEnterDown' },
    { key: 't', action: 'toggleClassView' },
    { key: 'x', action: 'clipPolygon', args: { firstisClip: false } },
    { key: 'PageUp', action: 'pageUp' },
    { key: 'PageDown', action: 'pageDown' },
    { key: '1', action: 'selectTool', args: UITypeEnum.annotation },
    { key: '2', action: 'selectTool', args: UITypeEnum.edit },
    { key: '3', action: 'selectTool', args: UITypeEnum.rectangle },
    { key: '4', action: 'selectTool', args: UITypeEnum.polygon },
    { key: '5', action: 'selectTool', args: UITypeEnum.polyline },
    { key: '6', action: 'selectTool', args: UITypeEnum.segmentation },
    { key: '7', action: 'selectTool', args: UITypeEnum.model },
    { key: '8', action: 'selectTool', args: UITypeEnum.interactive },
];
const hotkeyConfig: IHotkeyConfig[] = isMac
    ? commonConfig.concat(macConfig)
    : commonConfig.concat(windowsConfig);

export const drawingConfig: IHotkeyConfig[] = [
    { key: 'Space', action: 'KeySpaceDown', upAction: 'KeySpaceUp' },
    { key: 'Esc', action: 'KeyEscDown' },
    { key: 'Enter', action: 'KeyEnterDown' },
    isMac ? { key: '⌘ + z', action: 'KeyBackDown' } : { key: 'Ctrl + z', action: 'KeyBackDown' },
    isMac
        ? { key: '⌘ + Shift + z', action: 'KeyForwardDown' }
        : { key: 'Ctrl + Shift + z', action: 'KeyForwardDown' },
    // isMac ? { key: 'Backspace', action: 'onDelete' } : { key: 'Delete', action: 'onDelete' },
];
export default hotkeyConfig;
