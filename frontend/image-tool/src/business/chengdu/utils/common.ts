import UAParser from 'ua-parser-js';

export function rand(start: number, end: number) {
    return (Math.random() * (end - start) + start) | 0;
}

export function empty(value: any) {
    return value === null || value === undefined || value === '';
}
export function enableEscOnFullScreen() {
    // @ts-ignore
    if (navigator.keyboard && navigator.keyboard.lock) {
        // @ts-ignore
        navigator.keyboard.lock(['Escape']);
    }
}

// 是否是 mac 系统
export function isMac() {
    const parser = new UAParser();
    const osInfo = parser.getResult();
    const osName = (osInfo.os.name || '').toLowerCase();
    const isMac = osName.indexOf('mac') >= 0;
    return isMac;
}
