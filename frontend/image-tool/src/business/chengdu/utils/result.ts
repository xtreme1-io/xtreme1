import { IUserData, Editor, IClassType, IAttr, AnnotateType2ToolType } from 'editor/index';
// @ts-ignore
import uuid from 'uuid/v4';
import { empty } from './common';
import { copyClassAttrs, isClassAttrHasValue, isClassAttrVisible } from './classType';
import { AttrType, IObjectV2, SourceType } from '../type';
type IObject = any;
type IAnnotateObject = any;

// TODO 获取数据的转换
export function convertObject2Annotate(objects: IObject[], editor: Editor) {
    const annotates = [] as IAnnotateObject[];

    const classMap = {} as Record<string, IClassType>;
    editor.state.classTypes.forEach((e) => {
        classMap[e.name] = e;
    });

    // 用 classIdMap 来映射，防止 name 重复
    const classIdMap = {};
    editor.state.classTypes.forEach((e) => {
        classIdMap[e.id] = e;
    });

    objects.forEach((e: IObject) => {
        const obj = e.classAttributes;
        // console.log(obj);

        // 用 classId 查找唯一，直接使用 classType 可能会有重复
        let targetClassType: any = classIdMap[obj.classId];
        // console.log(targetClassType);

        const annotate: any = {
            id: e.id,
            color: targetClassType?.color ?? '#dedede',
            coordinate: obj?.contour?.points ?? [],
            interior: obj?.contour?.interior || [],
            type: obj?.type?.toLocaleLowerCase(),
            version: obj?.version,
            userData: {
                ...obj?.meta,
                sourceId: e.sourceId || obj.sourceId || editor.state.withoutTaskId,
                sourceType: e.sourceType || obj.sourceType || SourceType.DATA_FLOW,
                attrs: arrayToObj(obj?.classValues),
                modelClass: obj.modelClass,
                confidence: obj.modelConfidence,
                createdAt: obj.createdAt,
                createdBy: obj.createdBy,
                version: obj.version,
            },
            intId: Number(obj.trackName),
            uuid: obj.id || uuid(),
        };

        if (annotate.type == 'rectangle') {
            const defaultPoint = { x: 0, y: 0 };
            const [p0 = defaultPoint, p1 = defaultPoint] = obj.contour?.points || obj.points || [];
            annotate.coordinate = [p0, { x: p1.x, y: p0.y }, p1, { x: p0.x, y: p1.y }];
        }
        annotates.push(annotate);
    });
    // debugger;

    return annotates;
}

// TODO 保存数据的转换
export function convertAnnotate2Object(annotates: IAnnotateObject[], editor: Editor) {
    const objects = [] as IObject[];

    const classMap = {};
    editor.state.classTypes.forEach((e) => {
        classMap[e.name] = e;
    });
    // console.log('===>', classMap);

    // 用 classIdMap 来映射，防止 name 重复
    const classIdMap = {};
    editor.state.classTypes.forEach((e) => {
        classIdMap[e.id] = e;
    });
    // console.log('===>', classIdMap);

    annotates.forEach((obj: any) => {
        const userData = {
            ...obj.userData,
            toolType: AnnotateType2ToolType[obj.type],
        } as any;

        // 用 name + toolType 查找唯一，防止 name 重复
        let targetClassType: any;
        Object.keys(classIdMap).forEach((item: any) => {
            const tempObj = classIdMap?.[item];
            if (tempObj?.name == userData.classType && tempObj?.toolType == userData.toolType) {
                targetClassType = tempObj;
            }
        });
        // console.log('>>>', userData);
        // console.log(targetClassType);

        // updateVersion
        let version = obj.userData.version || 0;
        if (obj.userData.updateTime > obj.userData.lastTime) {
            version++;
        }
        obj.userData.lastTime = obj.userData.updateTime;
        obj.userData.version = version;

        // debugger;
        const newInfo: any = {
            backId: obj.id,
            id: obj.uuid,
            type: obj?.type?.toLocaleUpperCase(),
            version: userData.version,
            createdAt: userData.createdAt,
            createdBy: userData.createdBy,
            trackId: obj.intId,
            sourceId: userData.sourceId || editor.state.withoutTaskId,
            sourceType: userData.sourceType || SourceType.DATA_FLOW,
            trackName: obj.intId,
            classId: userData.classType ? targetClassType?.id : '',
            classValues: objToArray(userData.attrs || [], targetClassType ?? {}),
            modelConfidence: userData.confidence || undefined,
            modelClass: userData.modelClass || undefined,
            contour: {
                points: obj.coordinate,
                interior: obj.interior ?? undefined,
            },
            meta: {
                color: targetClassType?.color || obj.color,
                classType: userData.classType,
                sourceId: userData.sourceId,
                sourceType: userData.sourceType,
                version: userData.version,
                lastTime: userData.lastTime,
                updateTime: userData.updateTime,
            },
        };
        if (obj.type == 'rectangle') {
            newInfo.contour.points = [obj.coordinate[0], obj.coordinate[2]];
        }
        objects.push(newInfo);
    });
    return objects;
}

export function convertModelRunResult(objects: any[]) {
    const newObjects = objects.map((item) => {
        return {
            classAttributes: {
                meta: {},
                contour: {
                    points: item.points,
                },
                type: item.objType || item.type,
                modelClass: item.modelClass,
                modelConfidence: item.confidence,
            },
        };
    });
    return newObjects;
}

function objToArray(obj: Record<string, any> = {}, baseClassType?: IClassType) {
    // const attrMap = {} as Record<string, IAttr>;
    const attrMap = {} as Record<string, any>;
    const attrs = baseClassType?.attrs || [];

    attrs.forEach((attr: any) => {
        attrMap[attr.id] = attr;
    });
    // console.log('attrMap', attrMap);

    const data = [] as any[];
    // console.log(obj);

    Object.keys(obj).forEach((key) => {
        // console.log(key);

        let value = obj[key];
        if (empty(value)) return;
        data.push({
            id: attrMap[key]?.id,
            pid: null,
            name: attrMap[key]?.name || '',
            value: value,
            alias: attrMap[key]?.label || '',
            isLeaf: true,
        });
    });
    return data;
}

function arrayToObj(data: any[] = []) {
    let values = {} as Record<string, any>;
    if (!Array.isArray(data)) return values;

    data.forEach((e) => {
        // 忽略老数据
        if (Array.isArray(e)) return;
        values[e.id] = e.value;
    });
    return values;
}

// 先处理第一层级的属性, TODO:多层属性
export function classAttrToPath(obj: Record<string, any> = {}) {
    let paths = [] as any[];
    Object.keys(obj).forEach((key) => {
        let value = obj[key];
        if (empty(value)) return;
        if (Array.isArray(value)) {
            value.forEach((e) => {
                paths.push([`${key}:${e}`]);
            });
        } else {
            paths.push([`${key}:${value}`]);
        }
    });
    return paths;
}

export function pathToClassAttr(paths: string[][]) {
    let values = {} as Record<string, any>;
    // 兼容处理以前的键值对
    if (!paths.length) paths = [];
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
    return values;
}
