import { IClassification, IClassificationAttr } from '../type';
import { AttrType } from 'pc-editor';

export function traverseClassification2Arr(data: any[]) {
    let classifications = [] as IClassification[];

    data.forEach((e: any) => {
        let classificationId = e.id + '';
        let classification: IClassification = {
            id: classificationId,
            name: e.name,
            label: e.name,
            attrs: [],
        };
        let options = e.options || [];
        let classificationAttr: IClassificationAttr = {
            id: e.id,
            key: e.name,
            classificationId,
            parent: '',
            parentValue: '',
            parentAttr: e.name,
            type: e.inputType,
            name: e.name,
            label: e.name,
            value: e.inputType === AttrType.MULTI_SELECTION ? [] : '',
            required: e.isRequired,
            options: options.map((e: any) => {
                return { value: e.name, label: e.name };
            }),
        };

        classification.attrs.push(classificationAttr);
        options.forEach((option: any) => {
            traverseOption(classification, option, classificationAttr.id, e.name);
        });
        classifications.push(classification);
    });

    return classifications;

    function traverseOption(
        classification: IClassification,
        option: any,
        parent: string,
        parentAttr: string,
    ) {
        if (!option.attributes || option.attributes.length === 0) return;

        option.attributes.forEach((attr: any) => {
            let name = attr.name;
            let classificationAttr: IClassificationAttr = {
                id: attr.id || attr.uuid,
                key: `${parent}[${option.name}]-${name}`,
                classificationId: classification.id,
                parent,
                parentAttr,
                parentValue: option.name,
                type: attr.type,
                name,
                label: name,
                value: attr.type === AttrType.MULTI_SELECTION ? [] : '',
                required: attr.required,
                options: attr.options.map((e: any) => {
                    return { value: e.name, label: e.name };
                }),
            };
            classification.attrs.push(classificationAttr);
            (attr.options || []).forEach((option: any) => {
                traverseOption(classification, option, classificationAttr.id, name);
            });
        });
    }
}

export function copyClassification(
    baseClassifications: IClassification[],
    valueMap: Record<string, any>,
) {
    let classifications = [] as IClassification[];
    baseClassifications.forEach((classification) => {
        let copyClassification = {} as IClassification;
        copyClassification = JSON.parse(JSON.stringify(classification));

        copyClassification.attrs.forEach((attr) => {
            attr.value = attr.type === AttrType.MULTI_SELECTION ? [] : '';
            if (valueMap[attr.id]) {
                // 处理成数组
                if (attr.type === AttrType.MULTI_SELECTION && !Array.isArray(valueMap[attr.id])) {
                    valueMap[attr.id] = [valueMap[attr.id]];
                }
                attr.value = valueMap[attr.id];
            }
        });
        classifications.push(copyClassification);
    });
    return classifications;
}
export function classificationToSave(classification: IClassification) {
    let attrMap = {} as Record<string, IClassificationAttr>;
    classification.attrs.forEach((attr) => {
        attrMap[attr.id] = attr;
    });
    let attrs = classification.attrs.filter((e) => isAttrVisible(e, attrMap) && isAttrHasValue(e));

    // find leaf
    attrs.forEach((e) => (e.leafFlag = true));
    attrs.forEach((e) => {
        let parent = e.parent && attrMap[e.parent] ? attrMap[e.parent] : null;
        if (parent) parent.leafFlag = false;
    });

    let data = attrs.map((e) => {
        return {
            id: e.id,
            pid: e.parent ? e.parent : null,
            name: e.name,
            value: e.value,
            alias: e.label,
            isLeaf: !!e.leafFlag,
        };
    });

    console.log(data);
    return data;
}
export function isAttrVisible(
    attr: IClassificationAttr,
    attrMap: Record<string, IClassificationAttr>,
): boolean {
    if (!attr.parent) return true;
    let parentAttr = attrMap[attr.parent];
    let visible =
        parentAttr.type !== AttrType.MULTI_SELECTION
            ? parentAttr.value === attr.parentValue
            : (parentAttr.value as any[]).indexOf(attr.parentValue) >= 0;

    return visible && isAttrVisible(parentAttr, attrMap);
}
export function isAttrHasValue(attr: IClassificationAttr) {
    if (attr.type === AttrType.MULTI_SELECTION) {
        return Array.isArray(attr.value) && attr.value.length > 0;
    } else {
        return !!attr.value;
    }
}
export function saveToClassificationValue(data: any[]) {
    let values = {} as Record<string, any>;
    data.forEach((v) => {
        // 忽略老数据
        if (Array.isArray(v)) return;
        values[v.id] = v.value;
    });
    return values;
}