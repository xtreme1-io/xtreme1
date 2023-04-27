import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
export function formatNumber(str: string | number, precision: number = 2): string {
    str = '' + str;
    let regex = /(?!^)(?=(\d{3})+(\.|$))/g;
    str.replace(regex, ',');

    if (precision) {
        return (+str).toFixed(precision);
    } else {
        return str;
    }
}
export function formatTimeUTC(time: number) {
    // return dayjs(time).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
    return dayjs(time).utc().format();
}
