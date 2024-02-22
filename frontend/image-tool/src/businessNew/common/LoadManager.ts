import Editor from './Editor';
import * as api from '../api';
import {
  AnnotateModeEnum,
  LoadManager as BaseLoadManager,
  Event,
  IDataResource,
  IFrame,
  SourceType,
} from 'image-editor';
import { ShapeRoot } from 'image-editor/ImageView';
import * as utils from '../utils';

export default class LoadManager extends BaseLoadManager {
  declare editor: Editor;
  constructor(editor: Editor) {
    super(editor);
  }
  /**
   * load frames data
   */
  async loadFramesData(frames: IFrame[]) {
    // console.log('loadFramesData');
    this.editor.clearResource({ resetBgRotation: true });

    // Filter out data that has already been loaded
    const loadFrames = frames.filter((frame) => {
      return !this.editor.dataManager.getFrameObject(frame.id);
    });
    if (loadFrames.length === 0) return;

    const dataIds = loadFrames.map((e) => e.id);
    const frameDatas = await api.getAnnotationByDataIds({ dataIds });
    if (!frameDatas || frameDatas.length === 0) return;

    const dataMap: Record<string, any> = {};
    frameDatas.forEach((e) => (dataMap[`${e.dataId}`] = e));

    loadFrames.forEach(async (frame) => {
      const frameData = dataMap[String(frame.id)];
      if (!frameData) return;
      // set result objects
      const root_ins = new ShapeRoot({ frame, type: AnnotateModeEnum.INSTANCE });
      this.editor.dataManager.setFrameRoot(frame.id, [root_ins]);
      const instances = frameData.objects || [];
      const annotates_ins = utils.convertObject2Annotate(this.editor, instances);
      this.editor.mainView.updateObjectByUserData(annotates_ins);
      root_ins.addObjects(annotates_ins);
      // set classifications
      const values = frameData.classificationValues || [];
      frame.classifications = utils.classificationAssign(
        this.editor.bsState.classifications,
        values,
      );
    });

    this.editor.emit(Event.ANNOTATIONS_LOADED, dataIds);
  }
  /**
   * load result source
   */
  async loadResultSource(frames: IFrame[]) {
    frames.forEach(async (frame) => {
      const frameId = String(frame.id);
      let sources = await api.getResultSources(frameId);
      sources.unshift({
        name: 'Without Task',
        sourceId: this.editor.state.defaultSourceId,
        sourceType: SourceType.DATA_FLOW,
        frameId,
      });
      this.editor.dataManager.setSources(frame, sources);
    });
  }
  /**
   * request data resource
   * This is a virtual method that needs to be instantiated
   */
  async requestResource(frame: IFrame): Promise<IDataResource> {
    const { config, annotationStatus, validStatus } = await api.getDataFile(frame.id);
    frame.annotationStatus = annotationStatus;
    frame.validStatus = validStatus;
    const data: IDataResource = {
      ...config,
      time: Date.now(),
    };
    return data;
  }
}
