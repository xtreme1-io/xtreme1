import {
  AnnotateModeEnum,
  AnnotateObject,
  IDataResource,
  IFrame,
  IObjectSource,
  IUserData,
  SourceType,
  __UNSERIES__,
  utils,
} from '..';
import Editor from '../Editor';
import { Event } from '../configs';
import { ResourceLoader } from './ResourceManager/ResourceLoader';

export default class LoadManager {
  editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  /**
   * load scene data
   */
  async loadSceneData(index: number) {
    this.editor.showLoading(true);

    const { state } = this.editor;
    state.sceneIndex = index;
    state.sceneId = state.sceneIds[index] || __UNSERIES__;
    const sceneFrames = this.editor.dataManager.getFramesBySceneId(state.sceneId);
    if (sceneFrames.length === 0) return;
    this.editor.setFrames(sceneFrames);
    // If it is a seriesFrame, all frames need to be loaded
    if (state.isSeriesFrame) {
      await this.loadFramesData(state.frames);
      const allObject: AnnotateObject[] = [];
      sceneFrames.forEach((frame) => {
        const frameObject = this.editor.dataManager.getFrameObject(frame.id) || [];
        allObject.push(...frameObject);
      });
      this.updateTrack(allObject);
    }
    await this.editor.loadFrame(0, false, true);

    this.editor.showLoading(false);
    this.editor.emit(Event.SCENE_LOADED);
  }
  updateTrack(objects: AnnotateObject[]) {
    const { defaultSourceId } = this.editor.state;
    const globalTrack = {} as Record<string, Partial<IUserData>>;
    // let frameTrack = {} as Record<string, Record<string, Partial<IObject>>>;

    const trackNames = objects
      .filter((e) => e.userData.trackName)
      .map((e) => parseInt(e.userData.trackName as any))
      .filter((e) => !isNaN(e));

    let maxId = 0;
    if (trackNames.length > 0) maxId = Math.max(...trackNames);

    objects.forEach((obj) => {
      const userData = obj.userData;
      if (!userData.trackId) userData.trackId = utils.createTrackId();
      const trackId = userData.trackId as string;

      if (!globalTrack[trackId]) {
        const classConfig = this.editor.getClassType(userData.classId || '');
        let trackName = userData.trackName;
        if (!trackName) trackName = '' + maxId++;
        globalTrack[trackId] = {
          trackName: trackName,
          trackId: userData.trackId,
          classType: classConfig ? classConfig.name : '',
          classId: classConfig ? classConfig.id : '',
          sourceId: userData.sourceId || defaultSourceId,
          annotationType: AnnotateModeEnum.INSTANCE,
          // sourceType: obj.sourceType || SourceType.DATA_FLOW,
        };
      } else {
        Object.assign(obj, globalTrack[trackId]);
      }
    });

    Object.keys(globalTrack).forEach((trackId) => {
      this.editor.trackManager.addTrackObject(trackId, globalTrack[trackId]);
    });

    this.editor.idCount = maxId + 1;
  }
  async loadFrame(index: number, showLoading: boolean = true, force: boolean = false) {
    const { isSeriesFrame, frameIndex, frames } = this.editor.state;
    if (index > frames.length - 1 || index < 0) return;
    if (index === frameIndex && !force) return;

    this.editor.emit(Event.BEFORE_FRAME_CHANGE, this.editor.state.frameIndex);
    this.editor.state.frameIndex = index;
    this.editor.actionManager.stopCurrentAction();
    showLoading && this.editor.showLoading(true);

    try {
      await this.loadResultSource([frames[index]]);
      await this.loadResource();
      await this.loadFramesData([frames[index]]);

      this.editor.dataResource.load(-1, 1); // preload resource
    } catch (error: any) {
      this.editor.handleErr(error);
    }
    if (!isSeriesFrame) {
      this.editor.cmdManager.reset();
      this.editor.updateTrack();
    }

    showLoading && this.editor.showLoading(false);
  }
  /**
   * load frames data
   * This is a virtual method that needs to be instantiated
   */
  async loadFramesData(frames: IFrame[]) {
    throw 'loadFramesData implement error';
  }
  /**
   * load result source
   * This is a virtual method that needs to be instantiated
   */
  async loadResultSource(frames: IFrame[]) {
    if (!frames) throw 'frames is required';
    const { state } = this.editor;
    frames.forEach((frame) => {
      if (this.editor.dataManager.getSources(frame)) return;
      const sources: IObjectSource[] = [
        {
          name: 'Without Task',
          sourceId: state.defaultSourceId,
          sourceType: SourceType.DATA_FLOW,
          frameId: frame.id + '',
        },
      ];
      this.editor.dataManager.setSources(frame, sources);
    });
  }
  /**
   * load data resource
   */
  async loadResource() {
    const { frames, frameIndex } = this.editor.state;
    const frame = frames[frameIndex];
    const resource = this.editor.dataResource.getResource(frame);
    if (resource instanceof ResourceLoader) await resource.get();
  }
  /**
   * request data resource
   * This is a virtual method that needs to be instantiated
   */
  async requestResource(frame: IFrame): Promise<IDataResource> {
    throw 'requestResource implement error';
  }
}
