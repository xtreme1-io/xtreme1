import Editor from '../Editor';
import { IFrame, IDataResource, IUserData, ToolModelEnum, LoadStatus } from '../types';
import { ResourceLoader } from './DataResource';
import { Event } from '../config';
import { ShapeRoot, utils } from '..';

export default class LoadManager {
  editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  async loadFrame(index: number, showLoading: boolean = true, force: boolean = false) {
    const { isSeriesFrame, frameIndex, frames } = this.editor.state;

    if (index === frameIndex && !force) return;
    this.editor.clearResource();
    if (index > frames.length - 1 || index < 0) return;

    this.editor.emit(Event.BEFORE_FRAME_CHANGE, this.editor.state.frameIndex);

    this.editor.state.frameIndex = index;
    this.editor.actionManager.stopCurrentAction();

    showLoading && this.editor.showLoading(true);
    try {
      await this.loadFrameData(frames[index]);
      // 自动加载数据
      if (!this.editor.playManager.playing) this.editor.dataResource.load(-1, 1);
    } catch (error: any) {
      this.editor.handleErr(error);
    }

    if (!isSeriesFrame) {
      this.editor.cmdManager.reset();
      this.updateFrameCounter();
    }

    this.loadDataFromManager();

    // 更新选中状态
    // if (currentTrack) this.editor.selectByTrackId(currentTrack);
    // else this.editor.selectObject();

    showLoading && this.editor.showLoading(false);
    this.editor.emit(Event.FRAME_CHANGE, this.editor.state.frameIndex);
  }

  async loadFrameData(frame: IFrame) {
    if (!frame) throw 'frame is required in loadFrameData';
  }

  updateFrameIdInfo(frameId?: string) {
    const { frameIndex, frames } = this.editor.state;
    const curFrame = frames[frameIndex];

    frameId = frameId || curFrame.id;
    const objects = this.editor.dataManager.getFrameObject(frameId) || [];

    let startId = this.getFrameMaxId(frameId) + 1;
    objects.forEach((e) => {
      const userData = e.userData as IUserData;
      if (!userData.trackId) userData.trackId = utils.createTrackId();
      if (!userData.trackName) userData.trackName = startId++ + '';
    });
  }

  updateFrameCounter() {
    const id = this.getFrameMaxId();
    this.editor.idCount = id + 1;
  }
  updateFramesCounter() {
    const frames = this.editor.state.frames || [];
    let maxId = 0;
    frames.forEach((f) => {
      maxId = Math.max(maxId, this.getFrameMaxId(f.id));
    });
    this.editor.idCount = maxId + 1;
  }

  getFrameMaxId(frameId?: string) {
    const { frameIndex, frames } = this.editor.state;
    const id = frameId || frames[frameIndex].id;

    const objects_ins = this.editor.dataManager.getFrameObject(id, ToolModelEnum.INSTANCE) || [];
    const objects_seg =
      this.editor.dataManager.getFrameObject(id, ToolModelEnum.SEGMENTATION) || [];
    const objects = objects_ins.concat(objects_seg);
    let maxId = 0;
    objects.forEach((e) => {
      if (!e.userData.trackName) return;
      const id = parseInt(e.userData.trackName);
      if (id > maxId) maxId = id;
    });
    return maxId;
  }

  async loadResource() {
    const { frames, frameIndex } = this.editor.state;
    const frame = frames[frameIndex];

    const resource = this.editor.dataResource.getResource(frame);
    if (resource instanceof ResourceLoader) {
      const data = await resource.get();
      this.setResource(data);
    } else {
      frame.loadState = LoadStatus.COMPLETE;
      this.setResource(resource);
    }
  }

  setResource(data: IDataResource) {
    this.editor.mainView.setBackground(data.image as any);
  }

  getRenderFilter() {
    return (e: any) => Boolean(e);
  }

  updateRenderFilter(roots: ShapeRoot[]) {
    if (!roots) return;
    roots.forEach((root) => {
      root.renderFilter = this.getRenderFilter();
    });
  }

  loadDataFromManager() {
    const frame = this.editor.getCurrentFrame();
    const root_ins = this.editor.dataManager.getFrameRoot(frame.id, ToolModelEnum.INSTANCE);
    const root_seg = this.editor.dataManager.getFrameRoot(frame.id, ToolModelEnum.SEGMENTATION);
    if (!root_ins || !root_seg) {
      console.error('no shape root');
      return;
    }

    const roots: any[] = [root_ins, root_seg];
    this.editor.mainView.updateShapeRoot(roots);
    this.updateRenderFilter(roots);
    this.editor.emit(Event.ANNOTATE_LOAD);
  }
}
