import { IUserData, Editor, IClassType } from 'editor';
import { IObject, ObjectType, AnnotateObject } from '../type';
import uuid from 'uuid/v4';

export function convertObject2Annotate(objects: IObject[], editor: Editor) {
    let annotates = [] as AnnotateObject[];
    let classMap = {} as Record<string, IClassType>;
    editor.state.classTypes.forEach((e) => {
        classMap[e.name] = e;
    });
    objects.forEach((obj) => {
        obj.id = obj.id || uuid();
        let userData = {} as IUserData;
        userData.id = obj.id;
        userData.backId = obj.uuid;
        userData.classType = obj.classType || '';
        userData.confidence = obj.confidence || undefined;
        userData.modelClass = obj.modelClass || '';
        userData.modelRun = obj.modelRun || '';
        userData.attrs = obj.attrs || {};

        let classType = userData.classType || userData.modelClass;
        let classConfig = classType && classMap[classType] ? classMap[classType] : null;
        let coordinate = obj.coordinate;
        if (obj.points) {
            let [p0, p1] = obj.points;
            coordinate = [p0, { x: p1.x, y: p0.y }, p1, { x: p0.x, y: p1.y }];
        }
        let box = {
            type: obj.objType,
            color: obj.color,
            uuid: obj.id,
            coordinate: coordinate,
            interior: obj.interior || [],
            userData,
        };
        if (classConfig) {
            box.color = classConfig.color;
        } else {
            // let color = (classType || '')
            //     .split('')
            //     .reduce((c, v) => {
            //         return c + v.charCodeAt(0);
            //     }, 0)
            //     .toString(16)
            //     .slice(0, 6);
            let color = 'dedede';
            box.color = '#' + color;
        }
        annotates.push(box);
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

export function convertAnnotate2Object(annotates: AnnotateObject[]) {
    let objects = [] as IObject[];

    annotates.forEach((obj) => {
        let userData = obj.userData as Required<IUserData>;

        let info: IObject = {
            frontId: obj.uuid,
            uuid: userData.backId || undefined,
            objType: obj.type,
            id: userData.id,
            classType: userData.classType || '',
            confidence: userData.confidence || undefined,
            modelClass: userData.modelClass || '',
            modelRun: userData.modelRun || '',
            coordinate: obj.coordinate,
            interior: obj.interior,
            attrs: userData.attrs || {},
            color: obj.color,
        };
        objects.push(info);
    });
    return objects;
}
