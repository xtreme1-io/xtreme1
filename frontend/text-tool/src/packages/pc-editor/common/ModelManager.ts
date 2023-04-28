import { IObject, IFrame, IModelResult } from '../type';
import { AnnotateObject, Box } from 'pc-render';
import Editor from '../Editor';
// import * as api from '../api';
import * as utils from '../utils';
import { Const, ICmdName, IFilter, IUserData } from '../type';
import { utils as baseUtils } from 'pc-editor';

export default class ModelManager {
    editor: Editor;
    modelMap: Map<string, IObject[]> = new Map();
    constructor(editor: Editor) {
        this.editor = editor;
    }

    // model
    getModelResult(frameId: string) {
        return this.modelMap.get(frameId);
    }
    clearModelResult(frameId: string) {
        this.modelMap.delete(frameId);
    }

    addModelData() {
        let { frameIndex, frames } = this.editor.state;
        let frame = this.editor.getCurrentFrame();
        let objects = this.getModelResult(frame.id) || [];

        if (objects.length === 0) return;

        // let oldAnnotate = this.dataManager.getDataObject(dataInfo.dataId);
        let annotates = utils.convertObject2Annotate(objects, this.editor);

        let newTracks = [] as Partial<IObject>[];

        annotates.forEach((object) => {
            let userData = object.userData as IUserData;
            // userData.resultStatus = Const.Predicted;

            utils.setIdInfo(this.editor, userData);

            // let trackId = userData.trackId as string;
            // let trackName = userData.trackName as string;
            // let resultType = userData.resultType;

            // if (!this.editor.trackManager.hasTrackObject(trackId)) {
            //     newTracks.push({ trackId, trackName, resultType, classType: '' });
            // }
        });

        this.editor.needUpdateFilter = true;
        this.editor.cmdManager.execute('add-object', annotates);
        // this.editor.cmdManager.withGroup(() => {
        //     this.editor.cmdManager.execute('add-track', newTracks);
        //     this.editor.cmdManager.execute('add-object', annotates);
        // });

        // this.updateDataId();
        // this.dataManager.setDataObject(dataInfo.dataId, [...oldAnnotate, ...annotates]);

        frame.model = undefined;

        this.editor.frameChange(frame);
        this.clearModelResult(frame.id);
    }

    addModelTrackData(objectsMap: Record<string, IObject[]>) {
    }
}
