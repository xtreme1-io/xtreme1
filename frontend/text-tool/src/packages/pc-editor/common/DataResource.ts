import { IDataResource, IFrame, IFileConfig, PointAttr } from '../type';
import Editor from '../Editor';
// import * as api from '../api';
import * as utils from '../utils';
import Event from '../config/event';
import { IImgViewConfig } from 'pc-editor';

export type LoadMode = 'near_2' | 'all';
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
        this.dataResource.loaders = this.dataResource.loaders.filter(
            (e) => e.data.id !== this.data.id,
        );

        setTimeout(() => {
            this.dataResource.load();
        });
    }
    get() {
        return this.promise;
    }
    load() {
        let promise: Promise<any> = new Promise(async (resolve, reject) => {
            try {
                this.data.loadState = 'loading';
                let config = await this.dataResource.loadDataConfig(this.data);
                this.data.jsonFile = config;
                let jsonStr = await this.onLoadJSON(config.url);
                let jsonObj = JSON.parse(jsonStr);
                this.data.loadState = 'complete';
                resolve(jsonObj);
            } catch (e) {
                console.log(`load resource: ${this.data.id} err`);
                this.data.loadState = 'error';
                this.remove();
                reject(e);
            }
        });

        this.promise = promise;
    }
    handleProgress(percent: number) {
        this.onProgress(percent);
    }
    onProgress(percent: number) {
        // console.log(percent);
    }
    async onLoadJSON(url: string) {
        return await fetch(url)
        .then((res) => res.text())
        .then((json) => {
          return json;
        });
    }
}

export default class DataResource {
    loadMax: number = 500;
    loadMode: LoadMode = 'near_2';
    editor: Editor;
    dataMap: Record<string, IDataResource> = {};
    loaders: ResourceLoader[] = [];
    constructor(editor: Editor) {
        this.editor = editor;
    }

    clear() {
        this.dataMap = {};
        this.loaders = [];
    }

    async loadDataConfig(data: IFrame) {
        return await this.editor.businessManager.loadFrameConfig(data);
    }

    async loadImage(viewConfigs: IImgViewConfig[]) {
        let requests = [] as Promise<HTMLImageElement | null>[];

        viewConfigs.forEach((config) => {
            if (!config.imgObject) {
                requests.push(createRequest(config));
            }
        });

        if (requests.length) {
            await Promise.all(requests);
        }

        if (viewConfigs.filter((e) => !e.imgObject).length > 0) throw 'load image error';

        function createRequest(config: IImgViewConfig): Promise<HTMLImageElement | null> {
            return new Promise((resolve, reject) => {
                let img = document.createElement('img') as HTMLImageElement;
                img.src = config.imgUrl;
                img.onload = () => {
                    config.imgObject = img;
                    config.imgSize = [img.naturalWidth, img.naturalHeight];
                    resolve(img);
                };
                img.onerror = () => {
                    resolve(null);
                };
                img.onabort = () => {
                    resolve(null);
                };
            });
        }
    }

    calculatePointInfo(data: Record<PointAttr, number[]>) {
        let position = data.position || [];
        let intensity = data.intensity || [];

        let intensityRange = undefined;
        let ground = 0;
        if (position.length > 0) ground = utils.getPositionGround(position);
        if (intensity.length > 0) {
            let min = Infinity;
            let max = -Infinity;
            for (let i = 0; i < intensity.length; i++) {
                min = Math.min(intensity[i], min);
                max = Math.max(intensity[i], max);
                intensityRange = [min, max] as [number, number];
            }
        }
        return { ground, intensityRange };
    }

    async loadPoints(pointsUrl: string, onProgress?: (percent: number) => void): Promise<any> {
        return new Promise((resolve, reject) => {});
    }

    setLoadMode(mode: LoadMode) {
        this.loadMode = mode;
    }

    load(fromIndex?: number) {
        let { frameIndex } = this.editor.state;
        if (this.loaders.length > 0) return;

        let loaderN = Object.keys(this.dataMap).filter((e) => this.dataMap[e]).length;
        if (loaderN > this.loadMax) return;

        fromIndex = fromIndex || frameIndex;
        let data = this.getNext(fromIndex < 0 ? 0 : fromIndex);

        if (!data) {
            console.log('load complete');
            return;
        }

        this.loadNext(data);
    }

    getNext(fromIndex: number) {
        let { frames } = this.editor.state;

        let hasLoader = {} as Record<string, boolean>;
        this.loaders.forEach((e) => {
            hasLoader[e.data.id] = true;
        });

        let nextDataIndex = -1;
        let maxWeight = -1;

        for (let i = 0; i < frames.length; i++) {
            let data = frames[i];
            if (data.loadState !== '') continue;

            let weight = 100000 - i;
            let isNear2 = Math.abs(i - fromIndex) <= 1;
            weight = isNear2 ? Infinity : weight;
            if (this.loadMode === 'all' || (this.loadMode === 'near_2' && isNear2)) {
                if (weight > maxWeight) {
                    maxWeight = weight;
                    nextDataIndex = i;
                }
            }
        }

        console.log('nextDataIndex', nextDataIndex);

        if (nextDataIndex < 0) return null;
        else return frames[nextDataIndex];
    }

    getResource(data: IFrame) {
        let resource = this.dataMap[data.id];
        if (resource) {
            resource.time = Date.now();
            return resource;
        }
        return this.loadNext(data, true);
    }

    setResource(data: IFrame, resource: IDataResource) {
        this.dataMap[data.id] = resource;
    }

    loadNext(data: IFrame, manual: boolean = false) {
        let oldLoader = this.loaders.find((e) => e.data.id === data.id);
        if (this.loaders.length > 0 && oldLoader) return oldLoader;

        let loader = new ResourceLoader(this, data);
        loader.manual = manual;
        this.loaders.push(loader);
        loader.load();

        return loader;
    }
}
