import { AttrType, IAttr, IClassType } from "../type";

export function isClassAttrHasValue(attr: IAttr) {
    if (attr.type === AttrType.MULTI_SELECTION) {
        return Array.isArray(attr.value) && attr.value.length > 0;
    } else {
        return !!attr.value;
    }
}

export function isClassAttrVisible(
    attr: IAttr,
    attrMap: Record<string, IAttr>,
): boolean {
    if (!attr.parent) return true;
    let parentAttr = attrMap[attr.parent];
    let visible =
        parentAttr.type !== AttrType.MULTI_SELECTION
            ? parentAttr.value === attr.parentValue
            : (parentAttr.value as any[]).indexOf(attr.parentValue) >= 0;

    return visible && isClassAttrVisible(parentAttr, attrMap);
}
export function copyClassAttrs(classType: IClassType, valueMap: Record<string, any> = {}) {
    let copyClassAttrs = JSON.parse(JSON.stringify(classType.attrs)) as IAttr[];
    copyClassAttrs.forEach((attr) => {
        attr.value = attr.type === AttrType.MULTI_SELECTION ? [] : '';
        if (valueMap[attr.id]) {
            if (attr.type === AttrType.MULTI_SELECTION && !Array.isArray(valueMap[attr.id])) {
                valueMap[attr.id] = [valueMap[attr.id]];
            }
            attr.value = valueMap[attr.id];
        }
    });
    return copyClassAttrs;
}