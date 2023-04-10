import { IClassType } from 'editor/type';
import { AttrType, IClassification, IClassificationAttr } from '../api/typing';

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

export function parseClassesFromBackend(data: any[]) {
    let classTypes = [] as IClassType[];

    // console.log(data);
    data.forEach((config: any) => {
        let classType: IClassType = {
            id: config.id + '',
            name: config.name || '',
            // label: config.name + '-label',
            label: config.name || '',
            color: config.color || '#ff0000',
            attrs: [],
            toolType: config.toolType,
        };

        let attributes = config.attributes || [];
        // 图片工具这边暂时没有 toolOptions | isStandard | isConstraints
        // let toolOption = config.toolTypeOptions || {};
        //   if (toolOption.isStandard) {
        //     classType.type = 'standard';
        //     classType.size3D = new THREE.Vector3(
        //         toolOption.length || 0,
        //         toolOption.width || 0,
        //         toolOption.height || 0,
        //     );
        // } else if (toolOption.isConstraints) {
        //     let length, width, height;
        //     length = toolOption.length || [];
        //     width = toolOption.width || [];
        //     height = toolOption.height || [];
        //     classType.type = 'constraint';
        //     classType.sizeMin = new THREE.Vector3(length[0] || 0, width[0] || 0, height[0] || 0);
        //     classType.sizeMax = new THREE.Vector3(
        //         length[1] || Infinity,
        //         width[1] || Infinity,
        //         height[1] || Infinity,
        //     );
        // }

        // if (toolOption.points) {
        //     classType.points = [toolOption.points, 0];
        // }

        attributes.forEach((config: any) => {
            let options = (config.options || []).map((e: any) => {
                // return { value: e.name, label: e.name + '-label' };
                return { value: e.name, label: e.name };
            });
            classType.attrs.push({
                id: config.id || config.name,
                name: config.name,
                // label: config.name + '-label',
                label: config.name,
                required: config.required,
                type: config.type,
                options: options,
            } as any);
        });

        classTypes.push(classType);
    });
    return classTypes;
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

export function pathToClassificationValue(paths: string[][]) {
    let values = {} as Record<string, any>;
    paths.forEach((path) => {
        let id = '';
        path.forEach((p) => {
            let index = p.indexOf(':');
            if (index < 0) return;
            let k = p.substring(0, index) || '';
            let v = p.substring(index + 1) || '';
            id = id ? `${id}-${k}` : k;

            if (!values[id]) {
                values[id] = v;
            } else {
                if (Array.isArray(values[id])) {
                    if (values[id].indexOf(v) < 0) values[id].push(v);
                } else {
                    if (values[id] !== v) {
                        values[id] = [values[id], v];
                    }
                }
            }

            id = `${id}[${v}]`;
        });
    });
    // console.log(values);
    return values;
}
// TODO 多选项，先勾选下面一个属性值再取消，无法存储多选项
export function classificationToPath(classification: IClassification) {
    let attrMap = {} as Record<string, IClassificationAttr>;
    classification.attrs.forEach((attr) => {
        attrMap[attr.id] = attr;
    });
    let attrs = classification.attrs.filter((e) => isAttrVisible(e, attrMap) && isAttrHasValue(e));
    let attrIds = attrs.map((e) => e.id);

    let removeIdMap = {};
    attrIds.forEach((id) => {
        for (let i = 0; i < attrIds.length; i++) {
            let id1 = attrIds[i];
            if (id === id1) continue;
            if (id1.startsWith(id)) {
                removeIdMap[id] = true;
                break;
            }
        }
    });
    attrIds = attrIds.filter((e) => !removeIdMap[e]);

    let paths = [] as any[];
    attrIds.forEach((id) => {
        // let path = [];
        let attr = attrMap[id];
        if (attr.type === AttrType.MULTI_SELECTION) {
            attr.value.forEach((v: any) => {
                paths.push(createPath(attr, v));
            });
        } else {
            paths.push(createPath(attr, attr.value));
        }
    });

    // console.log(attrIds);
    // console.log(paths);
    return paths;

    function createPath(attr: IClassificationAttr, value: any) {
        let path = [`${attr.name}:${value}`];
        let parentAttr = attr;
        while (parentAttr && parentAttr.parentValue && parentAttr.parentAttr) {
            path.unshift(`${parentAttr.parentAttr}:${parentAttr.parentValue}`);
            parentAttr = attrMap[parentAttr.parent];
        }

        return path;
    }
}

export function isAttrHasValue(attr: IClassificationAttr) {
    if (attr.type === AttrType.MULTI_SELECTION) {
        return Array.isArray(attr.value) && attr.value.length > 0;
    } else {
        return !!attr.value;
    }
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
            : (parentAttr.value as any[])?.indexOf(attr.parentValue) >= 0;

    return visible && isAttrVisible(parentAttr, attrMap);
}
