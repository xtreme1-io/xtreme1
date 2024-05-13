import {
  str2ab,
  ab2str,
  parseHeader,
  getPointsFromTextData,
  getPointsFromDataView,
  setWithTypeToDataView,
} from './lib';

export type DataType = 'ascii' | 'binary';
export type Type = 'F' | 'I' | 'U';
export type SizeType = 1 | 2 | 4 | 8;

export interface IConfig {
  fields: string[];
  data: DataType;
  size: SizeType[];
  type: Type[];
  count: number[];
  offset: number[];
  width: number;
  height: number;
  viewpoint: number[];
  rowSize: number;
  points: number;
  version: string;
  raw: string;
}

export default class PCDFile {
  // header
  version = 0.7;
  fields: IConfig['fields'] = [];
  size: IConfig['size'] = [];
  type: IConfig['type'] = [];
  count: IConfig['count'] = [];
  offset: IConfig['offset'] = [];
  width = 1;
  height = 0;
  points = 0;
  rowSize = 0;
  viewpoint: IConfig['viewpoint'] = [0, 0, 0, 1, 0, 0, 0];
  //
  data: DataType = 'binary';
  isList = false;
  pointsDataList: number[] = [];
  pointsDataMap: Record<string, number[]> = {};
  littleEndian = true;
  constructor(pointsData: number[] | Record<string, number[]>, config: Partial<IConfig>) {
    const fields = config.fields || [];
    this.fields = fields;
    this.data = config.data || 'binary';

    let length = 0;
    if (Array.isArray(pointsData)) {
      this.isList = true;
      this.pointsDataList = pointsData;
      length = Math.floor(this.pointsDataList.length / fields.length);
    } else {
      this.isList = false;
      this.pointsDataMap = pointsData;
      length = this.pointsDataMap[fields[0]].length;
    }

    this.points = length;
    this.height = length;

    this.size = config.size ? config.size : fields.map((e) => 4);
    this.type = config.type ? config.type : fields.map((e) => 'F');
    this.count = fields.map((e) => 1);

    const offset = [] as number[];
    let rowSize = 0;
    fields.forEach((e, index) => {
      offset.push(rowSize);
      rowSize += this.size[index];
    });
    this.offset = offset;
    this.rowSize = rowSize;
  }

  static parse(buffer: ArrayBuffer, fieldFilter?: string[], littleEndian = true) {
    // let chunkData = ab2str(new Uint8Array(buffer));
    const chunkData = ab2str(new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 1000)));
    const header = parseHeader(chunkData);

    let dataMap = {} as Record<string, number[]>;
    if (header.data === 'ascii') {
      const textData = ab2str(new Uint8Array(buffer));
      const pcdData = textData.substring(header.raw.length);
      dataMap = getPointsFromTextData(pcdData, header, fieldFilter);
    } else if (header.data === 'binary') {
      const dataview = new DataView(buffer, header.raw.length);
      dataMap = getPointsFromDataView(dataview, header, fieldFilter, littleEndian);
    } else {
      throw 'only support ascii or binary format';
    }

    if (Object.keys(dataMap).length === 0) throw 'no point data';

    return new PCDFile(dataMap, header);
  }

  getHeader(name: string) {
    let value = this[name];
    name = name.toUpperCase();
    if (Array.isArray(value)) value = value.join(' ');
    return `${name} ${value}`;
  }

  getHeaderInfo() {
    const version = '# .PCD v.7 - Point Cloud Data file format';
    const headers = [
      version,
      this.getHeader('fields'),
      this.getHeader('size'),
      this.getHeader('type'),
      this.getHeader('count'),
      this.getHeader('width'),
      this.getHeader('height'),
      this.getHeader('viewpoint'),
      this.getHeader('points'),
      this.getHeader('data'),
    ];

    return headers.join('\n');
  }

  getDataBuffer() {
    let header = this.getHeaderInfo();
    if (this.data === 'ascii') {
      let textData = header;
      textData += this.getPointAsciiData();
      return str2ab(textData);
    } else {
      // binary
      header += '\n';
      const bufferSize = header.length + this.points * this.rowSize;
      const arrayBuffer = new ArrayBuffer(bufferSize);

      // write header
      const headerView = new Uint8Array(arrayBuffer, 0, header.length);
      for (let i = 0; i < header.length; i++) {
        headerView[i] = header.charCodeAt(i);
      }

      // write data
      const dataview = new DataView(arrayBuffer, header.length);
      this.setPointsToDataView(dataview);

      return arrayBuffer;
    }
  }

  getPointAsciiData() {
    const { pointsDataList, pointsDataMap, isList, points, fields } = this;
    let textData = '';
    for (let i = 0; i < points; i++) {
      textData += '\n';
      if (isList) {
        textData += fields.map((e, j) => pointsDataList[i * fields.length + j]).join(' ');
      } else {
        textData += fields.map((e, j) => pointsDataMap[e][i]).join(' ');
      }
    }
    return textData;
  }

  setPointsToDataView(dataview: DataView) {
    const { pointsDataList, pointsDataMap, isList, points, fields } = this;
    const littleEndian = this.littleEndian;
    for (let i = 0; i < points; i++) {
      for (let j = 0; j < fields.length; j++) {
        const type = this.type[j];
        const size = this.size[j];
        let data;
        if (isList) {
          data = pointsDataList[i * fields.length + j];
        } else {
          data = pointsDataMap[fields[j]][i];
        }

        const offset = i * this.rowSize + this.offset[j];
        setWithTypeToDataView(dataview, offset, littleEndian, type, size, data);
      }
    }
  }
}
