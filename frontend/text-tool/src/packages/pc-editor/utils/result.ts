import * as THREE from 'three';
import { Box, Rect, Box2D, AnnotateObject } from 'pc-render';
import {
    IUserData,
    IClassType,
    Const,
    IObject,
    ObjectType,
    IObjectV2,
    AttrType,
    IAttr,
    SourceType,
} from '../type';
import Editor from '../Editor';
import * as createUtils from './create';
import { empty } from './common';
import { copyClassAttrs, isClassAttrHasValue, isClassAttrVisible } from './classType';

let position = new THREE.Vector3();
let rotation = new THREE.Euler();
let scale = new THREE.Vector3();
let center = new THREE.Vector2();
let size = new THREE.Vector2();

function objToArray(obj: Record<string, any> = {}, classType?: IClassType) {
    if (!classType) {
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
    let copyAttrs = copyClassAttrs(classType, obj);
    let attrMap = {} as Record<string, IAttr>;
    copyAttrs.forEach((attr) => {
        attrMap[attr.id] = attr;
    });
    let attrs = copyAttrs.filter((e) => isClassAttrVisible(e, attrMap) && isClassAttrHasValue(e));

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
            type: e.type,
            pvalue: isParentMulti ? e.parentValue : undefined,
            alias: e.label,
            isLeaf: !!e.leafFlag,
        };
    });
    return data;
}
export function translateToObjectV2(object: IObject, baseClassType: IClassType) {
    let objectV2: IObjectV2 = {
        id: object.id,
        type: object.objType,
        version: object.version,
        createdBy: object.createdBy,
        createdAt: object.createdAt,
        trackId: object.trackId,
        backId: object.backId,
        frontId: object.id,
        trackName: object.trackName,
        classId: object.classId,
        className: object.classType,
        sourceId: object.sourceId,
        sourceType: object.sourceType,
        // classValues: object.attrs,
        classValues: objToArray(object.attrs, baseClassType),
        modelConfidence: object.confidence,
        modelClass: object.modelClass,
        meta: {
            lastTime: object.lastTime,
            updateTime: object.updateTime,
            isProjection: object.isProjection,
            classType: object.classType,
        },
        contour: {
            viewIndex: object.viewIndex,
            pointN: object.pointN,
            points: object.points,
        },
    };

    if (object.center3D) objectV2.contour.center3D = object.center3D;
    if (object.size3D) objectV2.contour.size3D = object.size3D;
    if (object.rotation3D) objectV2.contour.rotation3D = object.rotation3D;
    return objectV2;
}
export function translateToObject(objectV2: IObjectV2): IObject {
    let object = {
        ...objectV2,
        ...objectV2.meta,
        ...objectV2.contour,
        confidence: objectV2.modelConfidence,
        objType: objectV2.type || objectV2['objType'],
        attrs: arrayToObj(objectV2.classValues || []),
    } as IObject;
    return object;
}
function arrayToObj(data: any[] = []) {
    let values = {} as Record<string, any>;

    if (Array.isArray(data)) {
        data.forEach((e) => {
            if (Array.isArray(e)) return;
            values[e.id] = e.value;
        });
    }

    return values;
}
function bindInfo(target: any, info: IObject) {
    Object.assign(target, {
        lastTime: info.lastTime,
        updateTime: info.updateTime,
        createdAt: info.createdAt,
        createdBy: info.createdBy,
    });
}
export function convertObject2Annotate(objects: IObject[], editor: Editor) {
    let annotates = [] as AnnotateObject[];
    // let classMap = {} as Record<string, IClassType>;
    // editor.state.classTypes.forEach((e) => {
    //     classMap[e.name] = e;
    // });
    objects.forEach((obj) => {
        let userData = {} as IUserData;
        let objType = obj.objType || obj.type;
        let classConfig = editor.getClassType(obj.classId as string);
        if (!obj.classId && obj.classType) {
            classConfig = editor.getClassType(obj.classType);
        }
        userData.id = obj.id;
        userData.backId = obj.backId;
        // userData.invisibleFlag = obj.invisibleFlag;
        // userData.refId = obj.refId;
        userData.isProjection = obj.isProjection || false;
        // userData.isStandard = obj.isStandard || false;
        userData.trackId = obj.trackId || '';
        userData.trackName = obj.trackName || '';

        userData.classType = classConfig?.name || '';
        userData.classId = obj.classId || '';
        userData.confidence = obj.confidence || undefined;
        userData.modelClass = obj.modelClass || '';
        userData.modelRun = obj.modelRun || '';
        userData.modelRunLabel = obj.modelRunLabel || '';
        userData.sourceId = obj.sourceId;
        userData.sourceType = obj.sourceType;
        userData.attrs = obj.attrs || {};
        userData.pointN = obj.pointN || 0;
        if (objType === ObjectType.TYPE_3D_BOX || objType === ObjectType.TYPE_3D) {
            position.set(obj.center3D.x, obj.center3D.y, obj.center3D.z);
            rotation.set(obj.rotation3D.x, obj.rotation3D.y, obj.rotation3D.z);
            scale.set(obj.size3D.x, obj.size3D.y, obj.size3D.z);

            let box = createUtils.createAnnotate3D(editor, position, scale, rotation, userData);
            if (obj.frontId) box.uuid = obj.frontId;
            if (classConfig) {
                box.color.setStyle(classConfig.color);
                // box.editConfig.resize = !userData.isStandard && userData.resultType !== Const.Fixed;
            }
            bindInfo(box, obj);
            annotates.push(box);
        } else if (
            objType === ObjectType.TYPE_2D_RECT ||
            objType === ObjectType.TYPE_RECT
        ) {
            let bbox = getBBox(obj.points as any);
            center.set((bbox.xMax + bbox.xMin) / 2, (bbox.yMax + bbox.yMin) / 2);
            size.set(bbox.xMax - bbox.xMin, bbox.yMax - bbox.yMin);
            let rect = createUtils.createAnnotateRect(editor, center, size, userData);

            rect.viewId = `${editor.state.config.imgViewPrefix}-${obj.viewIndex}`;
            if (classConfig) rect.color = classConfig.color;
            bindInfo(rect, obj);
            annotates.push(rect);
        } else if (
            objType === ObjectType.TYPE_2D_BOX ||
            objType === ObjectType.TYPE_BOX2D
        ) {
            let positions1 = [] as THREE.Vector2[];
            let positions2 = [] as THREE.Vector2[];
            obj.points.forEach((e: any, index: number) => {
                if (index < 4) {
                    positions1.push(new THREE.Vector2(e.x, e.y));
                } else {
                    positions2.push(new THREE.Vector2(e.x, e.y));
                }
            });
            let box2d = createUtils.createAnnotateBox2D(
                editor,
                positions1 as any,
                positions2 as any,
                userData,
            );
            if (obj.frontId) box2d.uuid = obj.frontId;
            box2d.viewId = `${editor.state.config.imgViewPrefix}-${obj.viewIndex}`;
            if (classConfig) box2d.color = classConfig.color;
            bindInfo(box2d, obj);
            annotates.push(box2d);
        }
    });

    return annotates;
}

function getBBox(points: THREE.Vector2[]) {
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    points.forEach((p) => {
        if (p.x < xMin) xMin = p.x;
        if (p.x > xMax) xMax = p.x;
        if (p.y > yMax) yMax = p.y;
        if (p.y < yMin) yMin = p.y;
    });
    return { xMax, xMin, yMax, yMin };
}
export function updateObjectVersion(obj: any) {
    let version = obj.version || 1;
    if (!obj.version) {
        version = 1;
    } else if (obj.updateTime > obj.lastTime) {
        version++;
    }
    obj.lastTime = obj.updateTime;
    obj.version = version;
}
export function convertAnnotate2Object(annotates: AnnotateObject[], editor: Editor) {
    let objects = [] as IObject[];

    annotates.forEach((obj) => {
        let userData = editor.getObjectUserData(obj) as Required<IUserData>;
        let points = obj instanceof Box ? [] : get2DPoints(obj as any);
        let classConfig = editor.getClassType(userData);
        updateObjectVersion(obj as any);
        let bsObj = obj as any;
        let info: IObject = {
            frontId: obj.uuid,
            uuid: userData.backId || undefined,
            objType: getObjType(obj),
            version: bsObj.version,
            createdBy: bsObj.createdBy,
            createdAt: bsObj.createdAt,
            id: userData.id,
            // refId: userData.refId || '',
            // invisibleFlag: !!userData.invisibleFlag,
            isProjection: userData.isProjection || false,
            // isStandard: userData.isStandard || false,
            trackId: userData.trackId || '',
            trackName: userData.trackName || '',
            // resultStatus: userData.resultStatus || '',
            // resultType: userData.resultType || '',
            classId: classConfig ? classConfig.id : '',
            classType: classConfig ? classConfig.name : '',
            confidence: userData.confidence || undefined,
            modelRun: userData.modelRun || '',
            modelClass: userData.modelClass || '',
            modelRunLabel: userData.modelRunLabel || '',
            sourceId: userData.sourceId || editor.state.config.withoutTaskId,
            sourceType: userData.sourceType || SourceType.DATA_FLOW,
            points: points,
            pointN: userData.pointN || 0,
            viewIndex: 0,
            attrs: userData.attrs || {},
            center3D: new THREE.Vector3(),
            rotation3D: new THREE.Vector3(),
            size3D: new THREE.Vector3(),
        };

        if (obj instanceof Box) {
            info.center3D.set(obj.position.x, obj.position.y, obj.position.z);
            info.rotation3D.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
            info.size3D.set(obj.scale.x, obj.scale.y, obj.scale.z);
        } else {
            info.viewIndex = parseInt((obj.viewId.match(/[0-9]{1,5}$/) as any)[0]);
        }
        objects.push(info);
    });

    // console.log(objects);

    return objects;
}

function getObjType(annotate: AnnotateObject): ObjectType {
    let type: ObjectType = ObjectType.TYPE_3D_BOX;
    if (annotate instanceof Box) type = ObjectType.TYPE_3D_BOX;
    else if (annotate instanceof Rect) type = ObjectType.TYPE_2D_RECT;
    else if (annotate instanceof Box2D) type = ObjectType.TYPE_2D_BOX;
    return type;
}

export function get2DPoints(object: Rect | Box2D) {
    let points = [] as THREE.Vector2[];
    if (object instanceof Rect) {
        let { size, center } = object;
        points = [
            new THREE.Vector2(center.x - size.x / 2, center.y - size.y / 2),
            new THREE.Vector2(center.x - size.x / 2, center.y + size.y / 2),
            new THREE.Vector2(center.x + size.x / 2, center.y + size.y / 2),
            new THREE.Vector2(center.x + size.x / 2, center.y - size.y / 2),
        ];
    } else if (object instanceof Box2D) {
        points = [...object.positions1, ...object.positions2];
    }
    return points;
}

export function get3DPoints8(object: Box) {
    let positionsFrontV3 = [...Array(4)].map((e) => new THREE.Vector3());
    let positionsBackV3 = [...Array(4)].map((e) => new THREE.Vector3());

    let bbox = object.geometry.boundingBox as THREE.Box3;

    getPositions(bbox, positionsFrontV3, positionsBackV3);

    positionsFrontV3.forEach((v) => {
        v.applyMatrix4(object.matrixWorld);
    });

    positionsBackV3.forEach((v) => {
        v.applyMatrix4(object.matrixWorld);
    });

    return [...positionsFrontV3, ...positionsBackV3];

    function getPositions(
        box: THREE.Box3,
        positionsFront: THREE.Vector3[],
        positionsBack: THREE.Vector3[],
    ) {
        // front
        positionsFront[0].set(box.max.x, box.min.y, box.max.z);
        positionsFront[1].set(box.max.x, box.min.y, box.min.z);
        positionsFront[2].set(box.max.x, box.max.y, box.min.z);
        positionsFront[3].set(box.max.x, box.max.y, box.max.z);

        // back
        positionsBack[0].set(box.min.x, box.min.y, box.max.z);
        positionsBack[1].set(box.min.x, box.min.y, box.min.z);
        positionsBack[2].set(box.min.x, box.max.y, box.min.z);
        positionsBack[3].set(box.min.x, box.max.y, box.max.z);
    }
}
