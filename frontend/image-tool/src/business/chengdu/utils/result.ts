import { IUserData, Editor, IClassType } from 'editor/index';
// @ts-ignore
import uuid from 'uuid/v4';
import { empty } from './common';
import { isArray } from 'lodash';
type IObject = any;
type IAnnotateObject = any;

// TODO 获取数据的转换
export function convertObject2Annotate(objects: IObject[], editor: Editor) {
    const annotates = [] as IAnnotateObject[];
    const classMap = {} as Record<string, IClassType>;
    editor.state.classTypes.forEach((e) => {
        classMap[e.name] = e;
    });
    objects.forEach((e: IObject) => {
        const obj = e.classAttributes;
        console.log(obj);
        const annotate: any = {
            id: e.id,
            color: classMap[obj.meta?.classType]?.color ?? '#dedede',
            coordinate: obj.contour.points,
            interior: obj.contour?.interior || [],
            type: obj?.type.toLocaleLowerCase(),
            version: obj.version,
            userData: {
                ...obj.meta,
                attrs: arrayToObj(obj.classValues),
                modelClass: obj.modelClass,
                confidence: obj.modelConfidence,
                createdAt: obj.createdAt,
                createdBy: obj.createdBy,
                version: obj.version,
            },
            intId: Number(obj.trackName),
            uuid: obj.id,
        };

        if (annotate.type == 'rectangle') {
            const [p0, p1] = obj.contour.points;
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

    annotates.forEach((obj: any) => {
        const userData = obj.userData as Required<IUserData>;

        // updateVersion
        let version = obj.userData.version || 0;
        if (obj.userData.updateTime > obj.userData.lastTime) {
            version++;
        }
        obj.userData.lastTime = obj.userData.updateTime;
        obj.userData.version = version;
        // console.log(obj);
        // debugger;
        const newInfo: any = {
            id: obj.uuid,
            type: obj.type.toLocaleUpperCase(),
            version: userData.version,
            createdAt: userData.createdAt,
            createdBy: userData.createdBy,
            trackId: obj.intId,
            trackName: obj.intId,
            classId: userData.classType ? classMap[userData.classType]?.id : '',
            classValues: objToArray(userData.attrs || []),
            modelConfidence: userData.confidence || undefined,
            modelClass: userData.modelClass || undefined,
            contour: {
                points: obj.coordinate,
                interior: obj.interior ?? undefined,
            },
            meta: {
                color: obj.color,
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

function objToArray(obj: Record<string, any> = {}) {
    let data = [] as any[];
    Object.keys(obj).forEach((key) => {
        let value = obj[key];
        if (empty(value)) return;
        data.push({
            id: key,
            pid: null,
            name: '',
            value: value,
            alias: '',
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
    console.log(paths);
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
