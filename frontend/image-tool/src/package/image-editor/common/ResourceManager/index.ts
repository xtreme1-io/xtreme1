import Editor from '../../Editor';
import { IDataResource, IFrame, LoadStatus, ResourceLoadMode } from '../../types';
import { Event } from '../../configs';
import { ResourceLoader } from './ResourceLoader';

export default class DataResource {
  // Maximum Memory 3gb => byte
  loadMax: number = 3 * 1024 * 1024 * 1024;
  // test 100mb
  // loadMax: number = 100 * 1024 * 1024;
  loadMode: ResourceLoadMode = ResourceLoadMode.near;
  /**
   * -1: any;
   * 0: Stop loading when memory overflows;
   * 1: Release memory when memory overflows;
   */
  loadTactics: number = -1;

  editor: Editor;
  // You can enter 'editor.dataResource' in the browser console to view cached image data
  dataMap: Record<string, IDataResource> = {};
  loaders: ResourceLoader[] = [];
  loadFrameNum: number = 10;
  firstLoadNum: number = 50;
  waitLoads: IFrame[] = [];

  constructor(editor: Editor) {
    this.editor = editor;
  }
  /**
   * load image data
   * @param fromIndex the start frame index
   * @param tactics
   */
  load(fromIndex: number = -1, tactics: number = -1) {
    const { frameIndex } = this.editor.state;
    fromIndex = fromIndex >= 0 ? fromIndex : frameIndex;
    fromIndex = Math.max(0, fromIndex);
    if (tactics !== -1) {
      this.loadTactics = tactics;
      this.waitLoads = this.countLoadList(fromIndex);
    }

    const overflows = this.checkMemory();
    if (overflows) {
      if (this.loadTactics !== 1) return;
      // Release memory && load continue
      const clearList = this.countClearList(fromIndex);
      this.clearResource(clearList);
      this.loadTactics = 0;
      if (clearList.length === 0) return;
    }

    // loading
    if (this.loaders.length > 0) return;

    let nextLoad: IFrame | undefined = undefined;
    while (!nextLoad && this.waitLoads.length > 0) {
      const frame = this.waitLoads.shift();
      if (!frame) return;
      if (!frame.loadState) nextLoad = frame;
    }
    if (!nextLoad) return;

    this.loadNext(nextLoad);
  }
  countLoadList(fIndex?: number) {
    const { frames, frameIndex } = this.editor.state;
    const startIndex = fIndex || frameIndex;
    let loadNum = this.loadFrameNum;
    if (this.loadMode === ResourceLoadMode.all) {
      if (this.loadTactics === 1) loadNum = this.firstLoadNum;
      else loadNum = Math.max(startIndex, frames.length - startIndex - 1);
    }
    let countedNum = 1;
    const loadList: IFrame[] = [];
    while (countedNum <= loadNum) {
      let f = frames[startIndex - countedNum];
      if (f) loadList.push(f);
      f = frames[startIndex + countedNum];
      if (f) loadList.push(f);
      countedNum++;
    }
    return loadList;
  }
  countClearList(fIndex?: number) {
    const { frames, frameIndex } = this.editor.state;
    const initIndex = fIndex || frameIndex;
    const clearList = frames.filter((e, index) => {
      return Math.abs(index - initIndex) > this.firstLoadNum && e.loadState === LoadStatus.COMPLETE;
    });
    return clearList;
  }
  checkMemory(): boolean {
    let total = 0;
    let count = 0;
    Object.values(this.dataMap).forEach((e) => {
      if (e.size > 0) {
        count++;
        total += e.size;
      }
    });
    count = Math.max(1, count);
    const average = total / count;
    const overflows = total + average >= this.loadMax;
    return overflows;
  }
  setLoadMode(mode: ResourceLoadMode) {
    this.loadMode = mode;
    this.load(-1, 0);
    const config = this.editor.state.config;
    config.autoLoad = mode === 'all';
    this.editor.emit(Event.FRAME_AUTOLOAD, config.autoLoad);
  }
  clear(frame?: IFrame) {
    if (frame) {
      this.clearResource([frame]);
      delete this.dataMap[frame.id];
    } else {
      this.dataMap = {};
      this.loaders = [];
      this.clearResource(this.editor.state.frames);
    }
  }
  clearResource(frames: IFrame[]) {
    if (!frames || frames.length == 0) return;
    frames.forEach((frame) => {
      const key = frame.id;
      frame.loadState = '';
      delete this.dataMap[key];
      frame.imageData = undefined;
    });
  }
  loadNext(data: IFrame, manual: boolean = false) {
    const oldLoader = this.loaders.find((e) => e.data.id === data.id);
    if (this.loaders.length > 0 && oldLoader) return oldLoader;

    const loader = new ResourceLoader(this, data);
    loader.manual = manual;
    this.loaders.push(loader);
    loader.load();

    return loader;
  }
  // load image && create HTMLImageElement
  async loadData(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.setAttribute('crossOrigin', '');
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        reject();
      };
      img.onabort = () => {
        reject();
      };
    });
  }

  // set dataMap, cache resource data
  setResource(data: IFrame, resource: IDataResource) {
    const { frames } = this.editor.state;
    const resourceIds = Object.keys(this.dataMap).filter((e) => this.dataMap[e]);
    // clear cache
    if (resourceIds.length > this.loadMax) {
      const dataMap = {} as Record<string, IFrame>;
      frames.forEach((e) => {
        dataMap[e.id] = e;
      });
      resourceIds.sort((a, b) => {
        return this.dataMap[b].time - this.dataMap[a].time;
      });
      while (resourceIds.length > this.loadMax - 2) {
        const key = resourceIds.pop() as string;
        const data = dataMap[key];
        if (data) data.loadState = '';
        delete this.dataMap[key];
      }
    }
    this.dataMap[data.id] = resource;
  }
  getResource(data: IFrame) {
    const resource = this.getResourceData(data);
    // If the resource has been loaded, return it
    if (resource) return resource;

    // If the resource is not loaded, return resourceLoader
    return this.getResourceLoader(data);
  }
  getResourceLoader(data: IFrame) {
    return this.loadNext(data, true);
  }
  getResourceData(data: IFrame) {
    const resource = this.dataMap[data.id];
    if (resource) resource.time = Date.now();
    return resource;
  }
  async requestResource(frame: IFrame): Promise<IDataResource> {
    return this.editor.loadManager.requestResource(frame);
  }
}
