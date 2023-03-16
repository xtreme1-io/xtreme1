import { Box, AnnotateObject, ITransform } from 'pc-render';
import { IUserData, IFrame, Const, Editor, IObject } from 'pc-editor';
import { convertObject2Annotate } from './result';
import * as THREE from 'three';
import { setIdInfo } from './create';

// export function copyData(editor: Editor, copyId: string, toIds: string[], objects: Box[]) {
//     // let { dataManager, editor, state } = tool;
//     // let { frames } = editor.state;

//     let updateDatas = { objects: [], data: [] } as { objects: AnnotateObject[]; data: IUserData[] };
//     let updateTrans = { objects: [], transforms: [] } as {
//         objects: Box[];
//         transforms: ITransform[];
//     };
//     let addDatas = [] as { objects: AnnotateObject[]; frame: IFrame }[];

//     // debugger;
//     toIds.forEach((id) => {
//         if (id === copyId) return;

//         let frame = editor.getFrame(id);
//         let oldObjects = editor.dataManager.dataMap.get(id) || [];
//         let oldMap = {} as Record<string, Box>;
//         oldObjects.forEach((e: AnnotateObject) => {
//             if (!(e instanceof Box)) return;
//             oldMap[e.userData.trackId] = e;
//         });

//         let addOption = { objects: [], frame: frame } as {
//             objects: AnnotateObject[];
//             frame: IFrame;
//         };

//         objects.forEach((annotate) => {
//             let userData = annotate.userData as Required<IUserData>;

//             let trackId = userData.trackId;
//             let object = oldMap[trackId];

//             if (object) {
//                 let updateData = object.userData as IUserData;
//                 updateData.trackName = userData.trackName;
//                 // updateData.resultType = userData.resultType;
//                 // updateData.isStandard = userData.isStandard;
//                 updateData.classType = userData.classType;
//                 // updateData.resultStatus = Const.Copied;
//                 updateData.attrs = JSON.parse(JSON.stringify(userData.attrs || {}));

//                 // object.position.copy(annotate.position);
//                 // TODO
//                 (object as any).frame = frame;

//                 updateDatas.objects.push(object);
//                 updateDatas.data.push(updateData);

//                 updateTrans.objects.push(object);
//                 updateTrans.transforms.push({
//                     position: annotate.position,
//                     scale: annotate.scale,
//                     rotation: annotate.rotation,
//                 });
//             } else {
//                 let newUserData = JSON.parse(JSON.stringify(userData)) as IUserData;
//                 newUserData.backId = '';
//                 newUserData.pointN = undefined;
//                 // newUserData.resultStatus = Const.Copied;

//                 // newUserData.cBy = '';

//                 object = editor.createAnnotate3D(
//                     annotate.position,
//                     annotate.scale,
//                     annotate.rotation,
//                     newUserData,
//                 );

//                 addOption.objects.push(object);
//                 editor.updateObjectRenderInfo(object);
//             }
//         });

//         if (addOption.objects.length > 0) addDatas.push(addOption);
//     });

//     editor.cmdManager.withGroup(() => {
//         if (addDatas.length > 0) {
//             editor.cmdManager.execute('add-object', addDatas);
//         }

//         if (updateDatas.objects.length > 0) {
//             // updateDatas
//             editor.cmdManager.execute('update-object-user-data', updateDatas);
//         }

//         if (updateTrans.objects.length > 0) {
//             editor.cmdManager.execute('update-transform-batch', updateTrans);
//         }
//     });
// }

export function addModelTrackData(editor: Editor, objectsMap: Record<string, IObject[]>) {
    let curFrame = editor.getCurrentFrame();
    let objects = editor.dataManager.getFrameObject(curFrame.id) || [];

    let curObjectMap = {} as Record<string, Box>;
    objects.forEach((e) => {
        if (e instanceof Box) curObjectMap[e.userData.trackId] = e;
    });

    let updateDatas = { objects: [], data: [] } as { objects: AnnotateObject[]; data: IUserData[] };
    let updateTrans = { objects: [], transforms: [] } as {
        objects: Box[];
        transforms: ITransform[];
    };
    let addDatas = [] as { objects: AnnotateObject[]; frame: IFrame }[];

    Object.keys(objectsMap).forEach((dataId) => {
        let frame = editor.getFrame(dataId);
        frame.needSave = true;

        let existMap = {} as Record<string, Box>;
        let existObjects = editor.dataManager.getFrameObject(frame.id) || [];
        existObjects.forEach((e) => {
            if (e instanceof Box) existMap[e.userData.trackId] = e;
        });

        let addOption = { objects: [], frame: frame } as {
            objects: AnnotateObject[];
            frame: IFrame;
        };

        let trackObjects = objectsMap[dataId] || [];
        trackObjects.forEach((e: IObject) => {
            let trackId = (e as any).trackId;
            let oldObject = existMap[trackId];

            if (oldObject) {
                let oldUserData = editor.getObjectUserData(oldObject);
                let updateUserData = {} as IUserData;
                updateUserData.confidence = e.confidence;
                // updateUserData.resultStatus = Const.Predicted;

                updateDatas.objects.push(oldObject);
                updateDatas.data.push(updateUserData);

                let transform = {} as ITransform;
                transform.position = new THREE.Vector3(e.center3D.x, e.center3D.y, e.center3D.z);
                transform.rotation = new THREE.Euler(
                    e.rotation3D.x,
                    e.rotation3D.y,
                    e.rotation3D.z,
                );
                // if (!oldUserData.isStandard && oldUserData.resultType !== Const.Fixed) {
                //     transform.scale = new THREE.Vector3(e.size3D.x, e.size3D.y, e.size3D.z);
                // }

                updateTrans.objects.push(oldObject);
                updateTrans.transforms.push(transform);
            } else {
                const curObject = curObjectMap[trackId];
                let userData = editor.getObjectUserData(curObject);

                e.trackId = userData.trackId;
                e.trackName = userData.trackName;
                e.classType = userData.classType;
                e.classId = userData.classId;
                // e.resultType = userData.resultType;
                // e.isStandard = userData.isStandard;
                // e.resultStatus = Const.Predicted;

                // if (userData.isStandard === true || userData.resultType === Const.Fixed) {
                //     e.size3D = curObject.scale.clone();
                // }

                let object = convertObject2Annotate([e], editor)[0];
                editor.updateObjectRenderInfo(object);
                setIdInfo(editor, object.userData);
                addOption.objects.push(object);
            }
        });

        if (addOption.objects.length > 0) addDatas.push(addOption);
    });

    editor.cmdManager.withGroup(() => {
        if (addDatas.length > 0) {
            editor.cmdManager.execute('add-object', addDatas);
        }

        if (updateDatas.objects.length > 0) {
            // updateDatas
            editor.cmdManager.execute('update-object-user-data', updateDatas);
        }

        // if (updateTrans.objects.length > 0) {
        //     editor.cmdManager.execute('update-transform-batch', updateTrans);
        // }
    });
}
