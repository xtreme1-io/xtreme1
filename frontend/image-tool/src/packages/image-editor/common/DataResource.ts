import { IDataResource, IFrame, LoadStatus, TrackDirEnum } from '../types';
import Editor from '../Editor';
import { UTIF } from '@basicai/tool-components';
import { Event } from 'image-editor';
export class ResourceLoader {
  manual: boolean = false;
  data: IFrame;
  dataResource: DataResource;
  promise: Promise<IDataResource> = {} as Promise<IDataResource>;
  constructor(dataResource: DataResource, data: IFrame) {
    this.data = data;
    this.dataResource = dataResource;
    this.handleProgress = this.handleProgress.bind(this);
  }
  remove() {
    this.dataResource.loaders = this.dataResource.loaders.filter((e) => e.data.id !== this.data.id);

    // if (!this.manual)
    this.dataResource.load();
  }
  get() {
    return this.promise;
  }
  // 加载数据
  load() {
    const promise: Promise<IDataResource> = new Promise(async (resolve, reject) => {
      try {
        const info = await this.dataResource.editor.businessManager.loadDataResource(this.data);
        // console.log('load info: ', info);
        this.data.imageData = info;

        // const startTm = Date.now();
        info.image = await this.dataResource.loadData(info.url);
        // console.log('根据图片URL从服务器上加载图片时间: ', Date.now() - startTm);

        this.dataResource.setResource(this.data, info);

        // console.log(`load resource: ${this.data.id} completed`);
        this.data.loadState = LoadStatus.COMPLETE;
        this.remove();
        resolve(this.dataResource.dataMap[this.data.id]);
      } catch (e) {
        console.error(e);
        this.data.loadState = LoadStatus.ERROR;
        this.remove();
        reject(e);
      }
    });

    // NOTE Editor 里面 loadResource 中的 promise
    this.promise = promise;
  }
  handleProgress(percent: number) {
    console.log(percent);
  }
}
// 数据加载方式: 加载前后两帧/加载全部
export type LoadMode = 'near' | 'all';

type LocalStoreConfig = {
  autoLoad: boolean;
  classLabelKey: string;
  trackDirection: TrackDirEnum;
};
function useStoreConfig(key: string = 'IMAGE_TOOL_CONFIG') {
  return {
    set(config: Partial<LocalStoreConfig>) {
      const _config = Object.assign(this.get(), config);
      localStorage.setItem(key, JSON.stringify(_config));
    },
    get(): LocalStoreConfig {
      return JSON.parse(localStorage.getItem(key) || '{}') || {};
    },
    get autoLoad() {
      const { autoLoad } = this.get();
      return autoLoad == true;
    },
  };
}

export default class DataResource {
  // 最大加载内存 3gb => byte
  loadMax: number = 3 * 1024 * 1024 * 1024;
  // test 30mb
  // loadMax: number = 100 * 1024 * 1024;
  waitLoads: IFrame[] = []; // Record<string, IFrame> = {};
  editor: Editor;
  dataMap: Record<string, IDataResource> = {};
  loaders: ResourceLoader[] = [];
  loadMode: LoadMode = 'near';
  // 加载策略: -1 无策略; 0 内存满则停止加载; 1 内存满则释放内存加载
  loadTactics: number = -1;
  // 优先加载当前帧附近帧
  loadFrameNum: number = 10;
  firstLoadNum: number = 50;
  store = useStoreConfig();
  // pointsLoader: PCDLoader = new PCDLoader();
  constructor(editor: Editor) {
    this.editor = editor;
    editor.on(Event.FRAMES, () => {
      const config = editor.state.config;
      const { autoLoad = false, trackDirection = TrackDirEnum.FORWARD } = this.store.get();
      if (editor.state.isSeriesFrame) {
        config.autoLoad = autoLoad;
        editor.dataResource.setLoadMode(autoLoad ? 'all' : 'near');
      }
      config.trackDirection = trackDirection;
    });
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
  getImgUrl(url: string) {
    if (/\.tif+$/i.test(url)) {
      return new Promise<string>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';
        xhr.open('GET', url);
        xhr.onload = function (e) {
          try {
            const dataUrl = UTIF.bufferToURI(xhr.response);
            resolve(dataUrl);
          } catch (err: any) {
            console.error(err);
            resolve(url);
          }
        };
        xhr.onabort = () => {
          resolve(url);
        };
        xhr.onerror = () => {
          resolve(url);
        };
        xhr.send();
      });
    }
    return url + '?' + Date.now();
  }
  // 创建图片标签？
  async loadData(url: string): Promise<HTMLImageElement> {
    url = await this.getImgUrl(url);
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
  setLoadMode(mode: LoadMode) {
    this.loadMode = mode;
    this.load(-1, 0);
    const config = this.editor.state.config;
    config.autoLoad = mode === 'all';
    this.store.set({ autoLoad: config.autoLoad });
    this.editor.emit(Event.FRAME_AUTOLOAD, config.autoLoad);
  }

  checkMemory(): boolean {
    let totalMemroy = 0;
    let validNum = 0;
    Object.values(this.dataMap).forEach((e) => {
      if (e.size > 0) {
        validNum++;
        totalMemroy += e.size;
      }
    });
    validNum = Math.max(1, validNum);
    const average = totalMemroy / validNum;
    const needClear = totalMemroy + average >= this.loadMax;
    return needClear;
  }
  // 根据加载策略以及自动加载设置计算需要加载的数据
  countNeedLoad(fIndex?: number) {
    const { frames, frameIndex } = this.editor.state;
    const startIndex = fIndex || frameIndex;
    let loadNum = this.loadFrameNum;
    if (this.loadMode === 'all') {
      if (this.loadTactics === 1) loadNum = this.firstLoadNum;
      else loadNum = Math.max(startIndex, frames.length - startIndex - 1);
    }
    let countedNum = 1;
    const needLoadList: IFrame[] = [];
    while (countedNum <= loadNum) {
      let f = frames[startIndex - countedNum];
      if (f) needLoadList.push(f);
      f = frames[startIndex + countedNum];
      if (f) needLoadList.push(f);
      countedNum++;
    }
    return needLoadList;
  }

  // 加载数据 (参数:起始帧; 加载策略[-1无策略; 0内存满则停止加载; 1内存满则释放内存加载])
  load(fromIndex: number = -1, tactics: number = -1) {
    const { frameIndex } = this.editor.state;
    fromIndex = fromIndex >= 0 ? fromIndex : frameIndex;
    fromIndex = Math.max(0, fromIndex);
    if (tactics !== -1) {
      this.loadTactics = tactics;
      this.waitLoads = this.countNeedLoad(fromIndex);
    }

    // 内存是否溢出
    const memroyOver = this.checkMemory();
    if (memroyOver) {
      if (this.loadTactics !== 1) return;
      // 加载策略为内存溢出, 释放内存继续加载
      const clearList = this.getNeedClearList(fromIndex);
      this.clearResource(clearList);
      this.loadTactics = 0;
      if (clearList.length === 0) return;
    }

    // 正在加载的
    if (this.loaders.length > 0) return;
    // 获取需要加载的帧
    const hasLoader = {} as Record<string, boolean>;
    this.loaders.forEach((e) => {
      hasLoader[e.data.id] = true;
    });
    let nextLoad: IFrame | undefined = undefined;
    while (!nextLoad && this.waitLoads.length > 0) {
      const frame = this.waitLoads.shift();
      if (!frame) return;
      if (!frame.loadState && !hasLoader[frame.id]) nextLoad = frame;
    }

    if (!nextLoad) return;

    this.loadNext(nextLoad);
  }

  // 计算需要清理的内存数据
  getNeedClearList(fIndex?: number) {
    const { frames, frameIndex } = this.editor.state;
    const initIndex = fIndex || frameIndex;
    const clearList = frames.filter((e, index) => {
      return Math.abs(index - initIndex) > this.firstLoadNum && e.loadState === LoadStatus.COMPLETE;
    });
    return clearList;
  }
  // 清理数据
  clearResource(frames: IFrame[]) {
    if (!frames || frames.length == 0) return;
    frames.forEach((frame) => {
      const key = frame.id;
      frame.loadState = '';
      delete this.dataMap[key];
      frame.imageData = undefined;
    });
  }

  getResource(data: IFrame) {
    const resource = this.dataMap[data.id];
    if (resource) {
      resource.time = Date.now();
      return resource;
    }
    // 第一次进来获取会走这里
    return this.loadNext(data, true);
  }
  // 设置映射数据 dataMap ?
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

  loadNext(data: IFrame, manual: boolean = false) {
    const oldLoader = this.loaders.find((e) => e.data.id === data.id);
    if (this.loaders.length > 0 && oldLoader) return oldLoader;

    const loader = new ResourceLoader(this, data);
    loader.manual = manual;
    this.loaders.push(loader);
    // 到这里会去加载数据
    loader.load();

    return loader;
  }
}
