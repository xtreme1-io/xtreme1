import { IDataResource, IDataMeta, IFileConfig } from '../type';
// import { PCDLoader } from 'pc-render';
import Tool from './Tool';
import * as api from '../api';
// import { createViewConfig } from '../utils';
import BSError from './BSError';

export class ResourceLoader {
    manual: boolean = false;
    data: IDataMeta;
    dataResource: DataResource;
    promise: Promise<IDataResource> = {} as Promise<IDataResource>;
    constructor(dataResource: DataResource, data: IDataMeta) {
        this.data = data;
        this.dataResource = dataResource;
        this.handleProgress = this.handleProgress.bind(this);
    }
    remove() {
        this.dataResource.loaders = this.dataResource.loaders.filter(
            (e) => e.data.dataId !== this.data.dataId,
        );

        // if (!this.manual)
        this.dataResource.load();
    }
    get() {
        return this.promise;
    }
    load() {
        let promise: Promise<IDataResource> = new Promise(async (resolve, reject) => {
            try {
                const { info, annotationStatus, validStatus } =
                    await this.dataResource.loadDataFile(this.data);
                console.log('====>', info, this.data);
                this.data.imageUrl = info.url;
                this.data.dataConfig = info;
                this.data.annotationStatus = annotationStatus;
                this.data.validStatus = validStatus;

                // test resource
                // if (import.meta.env.DEV) {
                //     this.data.imageUrl = '/image/M1 Abrams (202).jpg';
                // }

                let data = await this.dataResource.loadPoints(
                    this.data.imageUrl,
                    this.handleProgress,
                );
                this.dataResource.setResource(this.data, {
                    time: Date.now(),
                    image: data,
                });

                console.log(`load resource: ${this.data.dataId} completed`);
                this.data.loadState = 'complete';
                this.remove();
                resolve(this.dataResource.dataMap[this.data.dataId]);
                // resolve({
                //     info: this.dataResource.dataMap[this.data.dataId],
                //     annotationStatus: this.data.annotationStatus,
                //     validStatus: this.data.validStatus,
                // });
            } catch (e) {
                console.log(`load resource: ${this.data.dataId} err`);
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
}

export default class DataResource {
    loadMax: number = 50;
    tool: Tool;
    dataMap: Record<string, IDataResource> = {};
    loaders: ResourceLoader[] = [];
    // pointsLoader: PCDLoader = new PCDLoader();
    constructor(tool: Tool) {
        this.tool = tool;
    }

    async loadDataFile(data: IDataMeta) {
        console.log('loadDataFile');
        return await api.getDataFile(data.dataId + '');
    }

    async loadPoints(pointsUrl: string, onProgress?: (percent: number) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => {
                resolve(img);
            };
            img.onerror = () => {
                reject();
            };
            console.log('pointsUrl ==> ', pointsUrl);
            img.src = pointsUrl;
        });
    }

    load(fromIndex?: number) {
        let { dataIndex } = this.tool.state;
        if (this.loaders.length > 0) return;

        let loaderN = Object.keys(this.dataMap).filter((e) => this.dataMap[e]).length;
        if (loaderN > this.loadMax) return;

        fromIndex = fromIndex || dataIndex;
        let data = this.getNext(fromIndex < 0 ? 0 : fromIndex);

        if (!data) {
            // console.log('load complete');
            return;
        }

        this.loadNext(data);
    }

    getNext(fromIndex: number) {
        let { dataIndex, dataList } = this.tool.state;

        let hasLoader = {} as Record<string, boolean>;
        this.loaders.forEach((e) => {
            hasLoader[e.data.dataId] = true;
        });

        // The data near the current frame is preferentially loaded into the previous two frames
        let indexData = [] as number[];
        dataList.forEach((data, index) => {
            if (
                data.loadState === '' &&
                !hasLoader[data.dataId] &&
                Math.abs(index - fromIndex) <= 1
            )
                indexData.push(index);
        });

        console.log('indexData', indexData);

        if (indexData.length === 0) return null;
        else return dataList[indexData[0]];
    }

    getResource(data: IDataMeta) {
        let resource = this.dataMap[data.dataId];
        if (resource) {
            resource.time = Date.now();
            return resource;
        }
        return this.loadNext(data, true);
    }

    setResource(data: IDataMeta, resource: IDataResource) {
        let { dataList } = this.tool.state;
        let resourceKeys = Object.keys(this.dataMap).filter((e) => this.dataMap[e]);
        // clear cache
        if (resourceKeys.length > this.loadMax) {
            let dataMap = {} as Record<string, IDataMeta>;
            dataList.forEach((e) => {
                dataMap[e.dataId] = e;
            });
            resourceKeys.sort((a, b) => {
                return this.dataMap[b].time - this.dataMap[a].time;
            });
            while (resourceKeys.length > this.loadMax - 2) {
                let key = resourceKeys.pop() as string;
                let data = dataMap[key];
                if (data) data.loadState = '';
                delete this.dataMap[key];
            }
        }
        this.dataMap[data.dataId] = resource;
    }

    loadNext(data: IDataMeta, manual: boolean = false) {
        let oldLoader = this.loaders.find((e) => e.data.dataId === data.dataId);
        if (this.loaders.length > 0 && oldLoader) return oldLoader;

        let loader = new ResourceLoader(this, data);
        console.log('loadNext', loader);
        loader.manual = manual;
        this.loaders.push(loader);
        loader.load();

        return loader;
    }
}
