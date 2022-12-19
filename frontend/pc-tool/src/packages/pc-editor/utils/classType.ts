import { AttrType, IAttr } from "../type";

export function isAttrHasValue(attr: IAttr) {
    if (attr.type === AttrType.MULTI_SELECTION) {
        return Array.isArray(attr.value) && attr.value.length > 0;
    } else {
        return !!attr.value;
    }
}

export function isAttrVisible(
    attr: IAttr,
    attrMap: Record<string, IAttr>,
): boolean {
    if (!attr.parent) return true;
    let parentAttr = attrMap[attr.parent];
    let visible =
        parentAttr.type !== AttrType.MULTI_SELECTION
            ? parentAttr.value === attr.parentValue
            : (parentAttr.value as any[]).indexOf(attr.parentValue) >= 0;

    return visible && isAttrVisible(parentAttr, attrMap);
}
