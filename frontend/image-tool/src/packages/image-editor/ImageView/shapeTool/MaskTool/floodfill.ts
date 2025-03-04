import { Vector2 } from '../../../types';

interface IFloodFillParam {
  imageData: ImageData; // 目标图片数据
  point: Vector2; // 起始点(点击点)坐标
  fillColor: number[]; // 填充颜色
  tolerance?: number; // 颜色误差值(在正负区间内视为同一颜色值)
}

export function floodFillContext(param: IFloodFillParam) {
  const { imageData, point, fillColor, tolerance = 0 } = param;
  const result = floodfill(imageData, point, fillColor, tolerance);
  return result;
}
// 判断颜色值是否一致
export function sameColor(rgba1: number[], rgba2: number[], tolerance: number) {
  let isSame = true;
  rgba1.forEach((val, i) => {
    isSame = isSame && Math.abs(val - rgba2[i]) <= tolerance;
  });
  return isSame;
}

export function fillColorToImageData(
  imageData: ImageData,
  mask: Uint8ClampedArray,
  fillcolor: number[],
) {
  const { data, width, height } = imageData;
  const maskLen = mask.length;
  if (maskLen != width * height) throw new Error('imageData size mismatch mask size');
  for (let i = 0; i < maskLen; i++) {
    if (mask[i] != 1) continue;
    const idx = i * 4;
    data[idx] = fillcolor[0];
    data[idx + 1] = fillcolor[1];
    data[idx + 2] = fillcolor[2];
    data[idx + 3] = fillcolor[3];
  }
  return imageData;
}

function floodfill(imageData: ImageData, point: Vector2, fillColor: number[], tolerance: number) {
  const { data, width, height } = imageData;
  const datai = (x: number, y: number) => (x + y * width) * 4; // 坐标转图片imageData.data的索引
  const indexi = (x: number, y: number) => x + y * width; // 坐标转图片像素的索引
  const pixelCompare = (x: number, y: number, targetColor: number[], tolerance: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false; //out of bounds

    const i = datai(x, y);
    const dataColor = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (sameColor(dataColor, targetColor, tolerance)) return true;
    return false;
  };

  const { x, y } = point;
  const i = datai(x, y);
  const targetcolor = [data[i], data[i + 1], data[i + 2], data[i + 3]];

  if (!pixelCompare(x, y, targetcolor, tolerance)) {
    return { imageData, mark: new Uint8ClampedArray() };
  }
  const connection_4 = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ]; // 四领域计算
  const seedMap = new Uint8ClampedArray(width * height).fill(0);
  // 点击处填充上
  seedMap[indexi(x, y)] = 1;
  data[i] = fillColor[0];
  data[i + 1] = fillColor[1];
  data[i + 2] = fillColor[2];
  data[i + 3] = fillColor[3];
  const seeds: number[][] = [[x, y]];
  while (seeds.length > 0) {
    const point = seeds.pop();
    if (!point) break;
    for (let j = 0; j < 4; j++) {
      const px = point[0] + connection_4[j][0];
      const py = point[1] + connection_4[j][1];
      const index = indexi(px, py);
      const k = datai(px, py);
      if (seedMap[index] || !pixelCompare(px, py, targetcolor, tolerance)) continue;
      seeds.push([px, py]);
      seedMap[index] = 1;
      data[k] = fillColor[0];
      data[k + 1] = fillColor[1];
      data[k + 2] = fillColor[2];
      data[k + 3] = fillColor[3];
    }
  }

  return {
    imageData,
    mark: seedMap,
  };
}
