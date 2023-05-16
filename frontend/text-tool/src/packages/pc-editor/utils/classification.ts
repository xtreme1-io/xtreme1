import { IAttr, IClassification, IClassificationAttr } from '../type';
import { AttrType, IClassType } from 'pc-editor';
import * as THREE from 'three';
export function traverseClassification2Arr(data: any[]) {
    let classifications = [] as IClassification[];

    data.forEach((e: any) => {
        let attribute = e.attribute || e;
        let classificationId = e.id + '';

        let classification: IClassification = {
            id: classificationId,
            name: e.name,
            label: e.name,
            attrs: [],
        };
        let options = attribute.options || [];
        if (e.inputType) {
            attribute.type = e.inputType;
        }
        let classificationAttr: IClassificationAttr = {
            id: attribute.id,
            key: attribute.name,
            classificationId,
            parent: '',
            parentValue: '',
            parentAttr: e.name,
            type: attribute.type,
            name: attribute.name,
            label: attribute.name,
            value: attribute.type === AttrType.MULTI_SELECTION ? [] : '',
            required: attribute.required,
            options: options.map((e: any) => {
                return { value: e.name, label: e.name };
            }),
        };

        classification.attrs.push(classificationAttr);
        options.forEach((option: any) => {
            traverseOption(classification, option, classificationAttr.id, attribute.name);
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
                id: attr.id,
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

export function traverseClass2Arr(data: any) {
    let classTypes = [] as IClassType[];
    data.forEach((config: any) => {
        let classType: IClassType = {
            id: config.id || config.name,
            name: config.name || '',
            // label: config.name + '-label',
            label: config.name || '',
            color: config.color || '#ff0000',
            attrs: [],
            type: '',
        };

        let attributes = config.attributes || [];
        let toolOption = config.toolTypeOptions || {};
        if (toolOption.isStandard) {
            classType.type = 'standard';
            classType.size3D = new THREE.Vector3(
                toolOption.length || 0,
                toolOption.width || 0,
                toolOption.height || 0,
            );
        } else if (toolOption.isConstraints) {
            let length, width, height;
            length = toolOption.length || [];
            width = toolOption.width || [];
            height = toolOption.height || [];
            classType.type = 'constraint';
            classType.sizeMin = new THREE.Vector3(length[0] || 0, width[0] || 0, height[0] || 0);
            classType.sizeMax = new THREE.Vector3(length[1] || 0, width[1] || 0, height[1] || 0);
        }

        if (toolOption.points) {
            classType.points = [toolOption.points, 0];
        }

        attributes.forEach((option: any) => {
            let classAttr: IAttr = {
                id: option.id || option.name,
                name: option.name,
                classId: classType.id,
                label: option.name,
                required: option.required,
                type: option.type,
                options: (option.options || []).map((e: any) => {
                    return { value: e.name, label: e.name };
                }),
                parent: '',
                parentValue: '',
                parentAttr: config.name,
                key: option.name,
                value: option.type === AttrType.MULTI_SELECTION ? [] : '',
            };
            classType.attrs.push(classAttr);

            option.options.forEach((o: any) => {
                traverseOption(classType, o, classAttr.id, option.name);
            });
        });

        classTypes.push(classType);
    });

    function traverseOption(classType: IClassType, option: any, parent: any, parentAttr: string) {
        // console.log(option);
        if (!option.attributes || option.attributes.length === 0) return;

        option.attributes.forEach((attr: any) => {
            let name = attr.name;
            let classAttr: IAttr = {
                id: attr.id || name,
                key: `${parent}[${option.name}]-${name}`,
                classId: classType.id,
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
            classType.attrs.push(classAttr);
            (attr.options || []).forEach((option: any) => {
                traverseOption(classType, option, classAttr.id, name);
            });
        });
    }

    return classTypes;
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
        const isParentMulti = e.parent && attrMap[e.parent]?.type === AttrType.MULTI_SELECTION;
        return {
            id: e.id,
            pid: e.parent ? e.parent : null,
            name: e.name,
            value: e.value,
            alias: e.label,
            pvalue: isParentMulti ? e.parentValue : undefined,
            type: e.type,
            isLeaf: !!e.leafFlag,
        };
    });

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
