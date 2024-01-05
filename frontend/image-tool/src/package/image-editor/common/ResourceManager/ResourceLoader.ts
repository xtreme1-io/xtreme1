import DataResource from '.';
import { IDataResource, IFrame, LoadStatus } from '../../types';

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
    this.dataResource.load();
  }
  get() {
    return this.promise;
  }
  load() {
    const promise: Promise<IDataResource> = new Promise(async (resolve, reject) => {
      try {
        const info = await this.dataResource.requestResource(this.data);
        // console.log('load info: ', info);
        this.data.imageData = info;

        console.time(`load(${this.data.id}) image from server`);
        info.image = await this.dataResource.loadData(info.url);
        console.timeEnd(`load(${this.data.id}) image from server`);

        this.dataResource.setResource(this.data, info);
        this.data.loadState = LoadStatus.COMPLETE;
        this.remove();
        resolve(this.dataResource.dataMap[this.data.id]);
      } catch (e) {
        this.data.loadState = LoadStatus.ERROR;
        this.remove();
        reject(e);
      }
    });
    this.promise = promise;
  }
  handleProgress(percent: number) {
    console.log(percent);
  }
}
