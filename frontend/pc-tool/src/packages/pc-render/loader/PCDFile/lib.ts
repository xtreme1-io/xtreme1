import { Type, IConfig, SizeType } from './index';

export function ab2str(array: ArrayBuffer) {
  let s = '';
  for (let i = 0, il = array.byteLength; i < il; i++) {
    s += String.fromCharCode(array[i]);
  }
  return s;
}

export function str2ab(str: string) {
  const array = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    array[i] = str.charCodeAt(i);
  }
  return array.buffer;
}

export function correctNumber(n: number) {
  return isFinite(n) ? n : 0;
}
export function correctXYZ(x: number, y: number, z: number) {
  return {
    x: correctNumber(x),
    y: correctNumber(y),
    z: correctNumber(z),
  };
}

export function setWithTypeToDataView(
  dataview: DataView,
  offset: number,
  littleEndian: boolean,
  type: Type,
  size: number,
  data: any,
) {
  switch (type) {
    case 'F':
      switch (size) {
        case 4:
          dataview.setFloat32(offset, data, littleEndian);
          return;
        case 8:
          dataview.setFloat64(offset, data, littleEndian);
          return;
        default:
          break;
      }
      break;
    case 'U':
      switch (size) {
        case 1:
          dataview.setUint8(offset, data);
          return;
        case 2:
          dataview.setUint16(offset, data, littleEndian);
          return;
        case 4:
          dataview.setUint32(offset, data, littleEndian);
          return;
        default:
          break;
      }
      break;
    case 'I':
      switch (size) {
        case 1:
          dataview.setInt8(offset, data);
          return;
        case 2:
          dataview.setInt16(offset, data, littleEndian);
          return;
        case 4:
          dataview.setInt32(offset, data, littleEndian);
          return;
        default:
          break;
      }
      break;
    default:
      break;
  }
}

export function parseHeader(textData: string) {
  const header = {} as any;
  const dataStart = textData.search(/[\r\n]DATA\s(\S*)[\f\r\t\v]*\n/i);
  if (dataStart == -1) {
    throw 'PCD-Format: not found DATA';
  }

  const result = /[\r\n]DATA\s(\S*)[\f\r\t\v]*\n/i.exec(textData) as any[];
  header.raw = textData.substring(0, dataStart + result[0].length);
  header.str = header.raw.replace(/#.*/gi, '');

  // parse
  header.version = /VERSION (.*)/i.exec(header.str);
  header.fields = /FIELDS (.*)/i.exec(header.str);
  header.size = /SIZE (.*)/i.exec(header.str);
  header.type = /TYPE (.*)/i.exec(header.str);
  header.count = /COUNT (.*)/i.exec(header.str);
  header.width = /WIDTH (.*)/i.exec(header.str);
  header.height = /HEIGHT (.*)/i.exec(header.str);
  header.viewpoint = /VIEWPOINT (.*)/i.exec(header.str);
  header.points = /POINTS (.*)/i.exec(header.str);
  header.data = /DATA (.*)/i.exec(header.str);

  // evaluate
  if (header.version != undefined) header.version = parseFloat(header.version[1]);

  if (header.fields != undefined)
    header.fields = header.fields[1].split(' ').map((e: any) => String(e).toLowerCase());

  if (header.type != undefined)
    header.type = header.type[1].split(' ').map((e: any) => String(e).toUpperCase());

  if (header.width != undefined) header.width = parseInt(header.width[1]);

  if (header.height != undefined) header.height = parseInt(header.height[1]);

  if (header.viewpoint != undefined)
    header.viewpoint = header.viewpoint[1].split(' ').map(parseFloat);

  if (header.points != undefined) header.points = parseInt(header.points[1], 10);

  if (header.points == undefined) header.points = header.width * header.height;

  if (header.data != undefined) header.data = header.data[1];

  if (header.size != undefined) {
    header.size = header.size[1].split(' ').map(function (x: any) {
      return parseInt(x, 10);
    });
  }

  if (header.count != undefined) {
    header.count = header.count[1].split(' ').map(function (x: any) {
      return parseInt(x, 10);
    });
  } else {
    header.count = [];
    for (let i = 0, l = header.fields.length; i < l; i++) {
      header.count.push(1);
    }
  }

  header.offset = [];
  let sizeSum = 0;
  for (let i = 0, l = header.fields.length; i < l; i++) {
    header.offset.push(sizeSum);
    if (header.data === 'ascii') {
      sizeSum += header.count[i];
    } else {
      sizeSum += header.size[i] * header.count[i];
    }
  }

  // for binary only
  header.rowSize = sizeSum;

  return header as IConfig;
}

export function getPointsFromTextData(textData: string, header: IConfig, fieldFilter?: string[]) {
  let fields = header.fields;
  if (fieldFilter) {
    fields = fields.filter((e) => fieldFilter.includes(e));
  }

  const dataMap = {} as Record<string, number[]>;
  const lines = textData.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '') continue;
    const line = lines[i].split(' ');
    for (let j = 0; j < fields.length; j++) {
      const field = fields[j];
      const type = header.type[j];
      const offset = header.offset[j];

      const text = line[offset];
      const item = correctNumber(getWithTypeFromText(text, type));
      dataMap[field] = dataMap[field] || [];
      dataMap[field].push(item);
    }
  }
  return dataMap;
}

export function getWithTypeFromText(text: string, type: Type) {
  switch (type) {
    case 'F':
      return parseFloat(text);
    case 'U':
    case 'I':
      return parseInt(text);
    default:
      break;
  }
  throw 'PCD-Format: parse data failed';
}

export function getPointsFromDataView(
  dataview: DataView,
  header: IConfig,
  fieldFilter?: string[],
  littleEndian = true,
) {
  let fields = header.fields;
  if (fieldFilter) {
    fields = fields.filter((e) => fieldFilter.includes(e));
  }

  const dataMap = {} as Record<string, number[]>;
  for (let i = 0; i < header.points; i++) {
    for (let j = 0; j < fields.length; j++) {
      const field = fields[j];
      let type = header.type[j];
      const size = header.size[j];
      // const count = header.count[j];
      if (field === 'rgb') {
        type = 'U';
      }
      const offset = i * header.rowSize + header.offset[j];
      const item = correctNumber(
        getWithTypeFromDataView(dataview, offset, littleEndian, type, size),
      );
      dataMap[field] = dataMap[field] || new (typeArray(type, size))(header.points);
      dataMap[field][i] = item;
    }
  }
  return dataMap;
}

export function getWithTypeFromDataView(
  dataview: DataView,
  offset: number,
  littleEndian: boolean,
  type: Type,
  size: SizeType,
) {
  switch (type) {
    case 'F':
      switch (size) {
        case 4:
          return dataview.getFloat32(offset, littleEndian);
        case 8:
          return dataview.getFloat64(offset, littleEndian);
        default:
          break;
      }
      break;
    case 'U':
      switch (size) {
        case 1:
          return dataview.getUint8(offset);
        case 2:
          return dataview.getUint16(offset, littleEndian);
        case 4:
          return dataview.getUint32(offset, littleEndian);
        default:
          break;
      }
      break;
    case 'I':
      switch (size) {
        case 1:
          return dataview.getInt8(offset);
        case 2:
          return dataview.getInt16(offset, littleEndian);
        case 4:
          return dataview.getInt32(offset, littleEndian);
        default:
          break;
      }
      break;
    default:
      break;
  }
  throw 'PCD-Format: parse data failed';
}
export function typeArray(type: Type, size: SizeType) {
  switch (type) {
    case 'F':
      switch (size) {
        case 4:
          return Float32Array;
        case 8:
        default:
          return Float64Array;
      }
    case 'U':
      switch (size) {
        case 1:
          return Uint8Array;
        case 2:
          return Uint16Array;
        case 4:
        default:
          return Uint32Array;
      }
    case 'I':
      switch (size) {
        case 1:
          return Int8Array;
        case 2:
          return Int16Array;
        case 4:
        default:
          return Int32Array;
      }
    default:
      return Array;
  }
}
