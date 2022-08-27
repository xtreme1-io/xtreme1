const tempMap = new Map();

export function get<T>(type: new () => T, index: number = 0): T {
    let tempArr = tempMap.get(type);
    if (!tempArr) {
        tempArr = [];
        tempMap.set(type, tempArr);
    }

    let value = tempArr[index];
    if (!value) {
        tempArr[index] = new type();
        value = tempArr[index];
    }

    return value;
}
