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
