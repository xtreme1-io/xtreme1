import { MaskShape } from '../ImageView/export';
//@ts-ignore
// import cv from '../../public/opencv.js';
import { Vector2 } from '../types';

interface IMaskParam {
  masks: MaskShape[];
  width: number;
  height: number;
  useNoRGB?: boolean;
}
interface IPngMaskData {
  no: number;
  area: number;
  box: number[];
  maskData: number[];
}

export const SEGMENT_NO = 9830400; // 从(0,0,150)开始

// 将png图片转Mask数据
export async function image2Mask(imgUrl: string) {
  const img = await loadMaskImage(imgUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) return {};
  context.drawImage(img, 0, 0);
  const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
  return imageData2Masks(imgData);
}
// 根据no-color的对应关系将各个mask数据从imageData中分离出来
export function imageData2Masks(imgData: ImageData) {
  const { data, width, height } = imgData;
  const dataLen = data.length;
  const pixelMap: Record<string, IPngMaskData> = {};
  let pixelInfo: IPngMaskData;
  let currentNo = -1;
  for (let i = 0; i < dataLen; i += 4) {
    const rgba = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    const no = rgb2number(rgba); // mask编号(基于当前像素点的rgb值)
    if (currentNo != no) currentNo = -1;
    if (no === 0) continue;
    const index = Math.floor(i / 4); // 图片像素点序号
    const px = index % width; // 像素点坐标x
    const py = Math.floor(index / width); // 像素点坐标y
    const key = String(no); // `rgba(${rgba.join(',')})no(${no})`;
    pixelInfo = pixelMap[key];
    if (!pixelInfo) {
      pixelInfo = { no, area: 0, box: [width, height, 0, 0], maskData: [] };
      pixelMap[key] = pixelInfo;
    }
    pixelInfo.box[0] = Math.min(px, pixelInfo.box[0]);
    pixelInfo.box[1] = Math.min(py, pixelInfo.box[1]);
    pixelInfo.box[2] = Math.max(px, pixelInfo.box[2]);
    pixelInfo.box[3] = Math.max(py, pixelInfo.box[3]);
    pixelInfo.area++;
    currentNo = no;
  }
  Object.values(pixelMap).forEach((e) => {
    e.box[2] = Math.abs(e.box[2] - e.box[0]) + 1;
    e.box[3] = Math.abs(e.box[3] - e.box[1]) + 1;
    e.maskData = getMaskData(imgData, e.box as any, e.no);
  });
  // console.log('==============>', pixelMap);
  return pixelMap;
}

// 根据box && maskData绘制mask
export function getPathByMaskData(maskData: number[], box: number[]) {
  let pathArr: Int32Array[] = [];
  const [, , w, h] = box;
  const imgData = new ImageData(w, h);
  const len = maskData.length;
  const rgba = [255, 255, 255, 255];
  for (let i = 0; i < len; i += 2) {
    const idx = maskData[i];
    const count = maskData[i + 1];
    for (let c = 0; c < count; c++) {
      const _i = (idx + c) * 4;
      imgData.data[_i] = rgba[0];
      imgData.data[_i + 1] = rgba[1];
      imgData.data[_i + 2] = rgba[2];
      imgData.data[_i + 3] = rgba[3];
    }
  }
  pathArr = opencvFindPath(imgData);
  return pathArr;
}

// 将canvas转Mask数据
export function canvas2Mask(canvas: HTMLCanvasElement) {
  const resultData = getDefaultMaskData();
  if (!canvas) return resultData;
  const context = canvas.getContext('2d');
  if (!context) return resultData;

  const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
  resultData.box = preImageData(imgData);
  const [x, y, w, h] = [...resultData.box];
  context.putImageData(imgData, 0, 0);
  const boxImgdata = context.getImageData(x, y, w, h);
  resultData.maskData = getMaskData(boxImgdata, <any>resultData.box); // v1
  // opencv处理图像时会改变原图数据,因此需要将原图数据copy到新的一个画布上
  // const cv_canvas: HTMLCanvasElement = document.createElement('canvas');
  // cv_canvas.width = w;
  // cv_canvas.height = h;
  // const cv_context = cv_canvas.getContext('2d');
  // if (!cv_context) return resultData;
  // cv_context.putImageData(boxImgdata, 0, 0);
  resultData.pathArray = opencvFindPath(boxImgdata);
  return resultData;
}

/**
 * maskShape to ArrayBuffer
 * @param args IMaskParam
 */
export async function masks2buffer(args: IMaskParam) {
  const { masks, width, height } = args;
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw 'error: masks2buffer context undefined';
  // context.imageSmoothingEnabled = true;

  const imgData = context.getImageData(0, 0, width, height);
  let No = SEGMENT_NO;
  masks.forEach((shape) => {
    const [x, y, w] = shape.box;
    const len = shape.maskData.length;
    const num = shape.userData.no || No++;
    const rgba = number2rgba(num);
    for (let i = 0; i < len; i += 2) {
      let idx = shape.maskData[i]; // 相对于box的index
      const px = (idx % w) + x; // 将相对于box的坐标x转为画布坐标
      const py = Math.floor(idx / w) + y; // 将相对于box的坐标y转为画布坐标
      idx = px + py * width;
      const datai = idx * 4; // 对应到imageData.data数组的index
      const seriesI = shape.maskData[i + 1] * 4; // 连续值
      for (let count = 0; count < seriesI; count++) {
        imgData.data[datai + count] = rgba[count % 4];
      }
    }
  });
  context.putImageData(imgData, 0, 0);
  const blob = await getCanvasBlob(canvas);
  //@ts-ignore
  if (window.downloadSegmentPng) {
    // const url = getCanvasImgsrc(canvas);
    // console.log('==========>base64 url', url);
    const alink = document.createElement('a');
    alink.href = URL.createObjectURL(blob);
    // alink.href = url;
    alink.download = `canvas_mask${Date.now()}.png`;
    alink.click();
    checkSegImgData(imgData);
  }
  return blob;
}

/**
 * maskShape to canvas, 将maskShape绘制到canvas上,返回canvas
 * @param args IMaskParam
 */
export function masks2ImageData(args: IMaskParam) {
  const { masks, width, height, useNoRGB } = args;
  const imgData = new ImageData(width, height);
  // const canvas = document.createElement('canvas');
  // canvas.width = width;
  // canvas.height = height;
  // const context = canvas.getContext('2d');
  // if (!context) throw 'error: masks2Canvas context undefined';

  if (!masks || masks.length === 0) return imgData;

  masks.forEach((shape) => {
    if (!shape) return;
    const [x, y, w] = shape.box;
    const len = shape.maskData.length;
    const { r, g, b, a } = shape.attrs.fillColorRgba;
    let rgba = [r, g, b, Math.ceil(a * 255)];
    if (useNoRGB) rgba = number2rgba(shape.userData.no);
    const getIdx = (idx: number) => {
      const px = (idx % w) + x; // 将相对于box的坐标x转为画布坐标
      const py = Math.floor(idx / w) + y; // 将相对于box的坐标y转为画布坐标
      return px + py * width;
    };
    for (let i = 0; i < len; i += 2) {
      const s = shape.maskData[i];
      let datai = getIdx(s) * 4; // 相对于box的index
      const seriesI = shape.maskData[i + 1]; // 连续值
      for (let count = 0; count < seriesI; count++) {
        imgData.data[datai] = rgba[0];
        imgData.data[datai + 1] = rgba[1];
        imgData.data[datai + 2] = rgba[2];
        imgData.data[datai + 3] = rgba[3];
        datai = getIdx(s + count + 1) * 4;
      }
    }
  });
  return imgData;
}

// 计算 MaskShape 的像素点数 (mask的面积)
export function countMaskPixel(maskData: number[]): number {
  let total = 0;
  const len = maskData.length;
  for (let i = 1; i < len; i += 2) {
    total += maskData[i];
  }
  return total;
}
// 获取 canvas 转成 image后的image.src
export function getCanvasImgsrc(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}
export async function getCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    canvas.toBlob((blob: Blob) => {
      resolve(blob);
    }, 'image/png');
  });
}
// 像素值 (R, G, B), 编号 = R + G×256 + B×256^2(65536)
export function number2rgba(num: number) {
  const b = Math.floor(num / 65536);
  const g = Math.floor((num - 65536 * b) / 256);
  const r = num % 256;
  return [r, g, b, 255];
}
export function rgb2number(rgba: number[]) {
  const [r, g, b] = rgba;
  if (!isFinityNumber(r) || !isFinityNumber(g) || !isFinityNumber(b))
    throw 'this rgb should be array like [r, g, b]';
  return r + g * 256 + b * 65536;
}

function isFinityNumber(num: number) {
  return !isNaN(num) && isFinite(num);
}
/**
 * 像素边缘检测计算路径 copy hasty.ai findCounters
 * @param imageData 像素数据
 * @returns number[][] pathArray
 */
function computePath(imageData: ImageData) {
  const fnT = (t: ImageData) => {
    let e = t.width,
      n = t.height,
      a = t.data,
      o = new Uint8Array(e * n),
      r = -1,
      i = e + 1,
      s = -1,
      l = n + 1,
      f = !0;
    for (let u = 0; u < n; u += 1)
      for (let d = 0; d < e; d += 1) {
        const h = u * e + d;
        a[4 * h + 3] >= 150 &&
          ((f = !1),
          (o[h] = 1),
          u > s && (s = u),
          d > r && (r = d),
          u < l && (l = u),
          d < i && (i = d));
      }
    return f
      ? null
      : { data: o, width: e, height: n, bounds: { minX: i, minY: l, maxX: r, maxY: s } };
  };
  const fnE = (t: { inner: boolean; label: number; points: Vector2[]; initialCount: number }[]) => {
    // let e: number,
    //   n: number,
    //   a = t
    //     .map(function (t: any) {
    //       return t.points
    //         .map(function (t: any, a: number) {
    //           let o,
    //             r = t.x,
    //             i = t.y;
    //           if (0 === a) {
    //             o = 'M'.concat(r, ',').concat(i);
    //           } else {
    //             const offsetX = r - e;
    //             const offsetY = i - n;
    //             o = offsetX === 0 ? 'v'.concat(String(offsetY)) : 'h'.concat(String(offsetX));
    //           }
    //           e = r;
    //           n = i;
    //           return o;
    //         })
    //         .join('');
    //     })
    //     .join(' ');
    // return a ? ''.concat(a, 'z') : null;
    return t.map((item) => {
      const array = new Int32Array(item.points.length * 2);
      item.points.forEach((point, i) => {
        array[i * 2] = point.x;
        array[i * 2 + 1] = point.y;
      });
      return array;
    });
  };

  const fnN = (e: any) => {
    const a = undefined,
      o = void 0 === a ? 0 : a,
      r = undefined,
      i = void 0 === r ? 100 : r,
      s = fnContours(e);
    return fnSimplifyContours(s, o, i);
  };

  const fnContours = function (t: any) {
    let e,
      n,
      a,
      o,
      r,
      i,
      s: any,
      l,
      f: any,
      u: any,
      d: any,
      h: any,
      c: any,
      y: any,
      b: any,
      x,
      p = (function (t) {
        let e,
          n,
          a = t.width,
          o = t.data,
          r = t.bounds.minX,
          i = t.bounds.maxX,
          s = t.bounds.minY,
          l = t.bounds.maxY,
          f = i - r + 3,
          u = l - s + 3,
          d = new Uint8Array(f * u);
        for (n = s; n < l + 1; n++)
          for (e = r; e < i + 1; e++) 1 === o[n * a + e] && (d[(n - s + 1) * f + (e - r + 1)] = 1);
        return { data: d, width: f, height: u, offset: { x: r - 1, y: s - 1 } };
      })(t),
      g = [],
      v = 0,
      m = p.width,
      w = 2 * m,
      k = p.height,
      C = p.data,
      D = p.offset.x,
      E = p.offset.y,
      I = new Uint8Array(C),
      M = [
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
      ];
    for (o = 1; o < k - 1; o++)
      for (a = 1; a < m - 1; a++)
        if (1 === C[(r = o * m + a)])
          for (e = -m; e < w; e += w)
            if (0 === C[r + e] && 0 === I[r + e]) {
              v++;
              s = [];
              c = y = d = { x: a, y: o };
              h = null;
              l = e === m;
              u = f = l ? 2 : 6;
              l ? s.push({ x: d.x + 1 + D, y: d.y + 1 + E }) : s.push({ x: d.x + D, y: d.y + E });
              for (
                let q = function () {
                  let t = !1;
                  for (I[c.y * m + c.x] = v, n = 0; n < 8; n++) {
                    if (
                      ((x = M[(f = (f + 1) % 8)]),
                      (b = { x: c.x + x[0], y: c.y + x[1] }),
                      (i = b.y * m + b.x),
                      1 === C[i])
                    ) {
                      I[i] = v;
                      break;
                    }
                    (I[i] = -1), (b = null);
                  }
                  if (null === b) return 'break';
                  (c = b),
                    h
                      ? y.x === d.x && y.y === d.y && c.x === h.x && c.y === h.y && (t = !0)
                      : (h = b);
                  let e = function (t: number, e: number) {
                      const n = y.x + D + t,
                        a = y.y + E + e,
                        o = s.length ? s[s.length - 1] : null;
                      (o && o.x === n && o.y === a) || s.push({ x: n, y: a });
                    },
                    a = 'number' === typeof u ? u : f,
                    o = [];
                  if ((u - f + 8) % 8 > 2) for (; a !== f; ) o.push(a), (a = (a + 1) % 8);
                  return (
                    o.push(f),
                    o.forEach(function (t) {
                      return (function (t) {
                        switch (t) {
                          case 0:
                            e(1, 0);
                            break;
                          case 1:
                            e(1, 0), e(1, 1);
                            break;
                          case 2:
                            e(1, 1);
                            break;
                          case 3:
                            e(1, 1), e(0, 1);
                            break;
                          case 4:
                            e(0, 1);
                            break;
                          case 5:
                            e(0, 1), e(0, 0);
                            break;
                          case 6:
                            e(0, 0);
                            break;
                          case 7:
                            e(0, 0), e(1, 0);
                        }
                      })(t);
                    }),
                    (y = c),
                    (u = f),
                    (f = (f + 4) % 8),
                    t ? 'break' : void 0
                  );
                };
                ;

              ) {
                if ('break' === q()) break;
              }
              null === b &&
                (s.push({ x: d.x + D, y: d.y + E }),
                s.push({ x: d.x + 1 + D, y: d.y + E }),
                s.push({ x: d.x + 1 + D, y: d.y + 1 + E }),
                s.push({ x: d.x + D, y: d.y + 1 + E }),
                s.push({ x: d.x + D, y: d.y + E }));
              const _ = { inner: l, label: v, points: s };
              g.push(_);
            }
    return g;
  };
  const fnSimplifyContours = (t: any, e: any, n: any) => {
    let a,
      o,
      r,
      i,
      s,
      l,
      f,
      u,
      d,
      h,
      c,
      y,
      b,
      x,
      p,
      g,
      v,
      m,
      w,
      k,
      C,
      D = t.length,
      E = [];
    for (o = 0; o < D; o++)
      if (((s = (i = t[o]).points), (l = i.points.length) < n)) {
        for (f = [], r = 0; r < l; r++) f.push({ x: s[r].x, y: s[r].y });
        E.push({ inner: i.inner, label: i.label, points: f, initialCount: l });
      } else {
        (u = [0, l - 1]), (d = [{ first: 0, last: l - 1 }]);
        do {
          h = d.shift() as any;
          if (!(h.last <= h.first + 1)) {
            for (c = -1, y = h.first, a = h.first + 1; a < h.last; a++)
              (w = s[a]),
                (k = s[h.first]),
                (C = s[h.last]),
                (v = w.x - k.x),
                (m = w.y - k.y),
                (x = Math.sqrt(v * v + m * m)),
                (v = w.x - C.x),
                (m = w.y - C.y),
                (p = Math.sqrt(v * v + m * m)),
                (v = k.x - C.x),
                (m = k.y - C.y),
                (g = Math.sqrt(v * v + m * m)),
                (b =
                  x >= Math.sqrt(p * p + g * g)
                    ? p
                    : p >= Math.sqrt(x * x + g * g)
                    ? x
                    : Math.abs((m * w.x - v * w.y + k.x * C.y - C.x * k.y) / g)) > c &&
                  ((y = a), (c = b));
            c > e &&
              (u.push(y), d.push({ first: h.first, last: y }), d.push({ first: y, last: h.last }));
          }
        } while (d.length > 0);
        for (
          f = [],
            l = u.length,
            u.sort(function (t, e) {
              return t - e;
            }),
            r = 0;
          r < l;
          r++
        )
          f.push({ x: s[u[r]].x, y: s[u[r]].y });
        E.push({
          inner: i.inner,
          label: i.label,
          points: f,
          initialCount: i.points.length,
        });
      }
    return E;
  };
  const a = fnT(imageData);
  return (a ? fnE(fnN(a)) : []) as any;
}

function opencvFindPath(imgData: ImageData) {
  // const pathArray: any[] = [];
  // opencv图像处理
  // const cv_img = cv.matFromImageData(imgData);
  // cv.cvtColor(cv_img, cv_img, cv.COLOR_RGBA2GRAY, 0);
  // cv.threshold(cv_img, cv_img, 120, 200, cv.THRESH_BINARY);
  // const contours = new cv.MatVector();
  // const hierarchy = new cv.Mat();
  // cv.findContours(cv_img, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
  // for (let i = 0; i < contours.size(); ++i) {
  //   const ci = contours.get(i);
  //   const points = ci.data32S;
  //   pathArray.push(points);
  // }
  // cv_img.delete();
  // contours.delete();
  // hierarchy.delete();
  return computePath(imgData);
}
// 图像数据预处理 (1: 锐化图像处理; 2: 计算并返回图像内容box区域)
function preImageData(imgData: ImageData) {
  const { data, width, height } = imgData;
  const dataLen = data.length;
  let x0 = width,
    y0 = height,
    x1 = 0,
    y1 = 0;
  for (let i = 3; i < dataLen; i = i + 4) {
    // 透明度低于 0.5(128/256)的点舍弃, 高于0.5视为1
    data[i] = data[i] < 128 ? 0 : 255;
    // 空白点不处理
    if (data[i] == 0) continue;
    // 其他点转为白色, 防止某些颜色的值在计算时出现未知的错误以及锯齿影响
    data[i - 1] = 255;
    data[i - 2] = 255;
    data[i - 3] = 255;

    // box计算
    const pixelIndex = Math.floor(i / 4); // 像素点index(data中每4个值为一个像素点的rgba)
    const pixelX = pixelIndex % width; // 像素点x坐标
    const pixelY = Math.floor(pixelIndex / width); // 像素点y坐标
    if (pixelX < x0) x0 = pixelX;
    if (pixelX > x1) x1 = pixelX;
    if (pixelY < y0) y0 = pixelY;
    if (pixelY > y1) y1 = pixelY;
  }
  // x, y, width, height
  return [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
}
function getImageDataIndex(x: number, y: number, imageData: ImageData) {
  const { width } = imageData;
  return y * width + x;
}
// 计算imageData的maskData; [像素点index, 连续像素点数];
function getMaskData(
  imgData: ImageData,
  box: [x: number, y: number, width: number, height: number],
  no?: number,
) {
  const [x, y, w, h] = box;
  const { data } = imgData;
  let index = -1;
  const maskData: number[] = [];
  for (let _row = 0; _row < h; _row++) {
    for (let _col = 0; _col < w; _col++) {
      const pixelIndex = getImageDataIndex(x + _col, y + _row, imgData);
      if (
        (no !== undefined &&
          no !== rgb2number(data.slice(pixelIndex * 4, pixelIndex * 4 + 4) as any)) ||
        data[pixelIndex * 4 + 3] == 0
      ) {
        index = -1;
        continue;
      }
      if (index == -1) {
        index = _row * w + _col;
        maskData.push(index, 1);
      } else {
        maskData[maskData.length - 1]++;
      }
    }
  }
  return maskData;
}

function getDefaultMaskData() {
  // 声明需要返回的处理后的数据(即绘制mask图形所需要的数据)
  const box: number[] = [0, 0, 0, 0]; // mask图形的矩形包围框
  const pathArray: Int32Array[] = []; // mask绘制path
  const maskData: number[] = [];
  return {
    box,
    pathArray,
    maskData,
  };
}

function checkSegImgData(imgData: ImageData) {
  const data = imgData.data;
  const map: Record<string, number> = {};
  for (let i = 0; i < data.length; i += 4) {
    const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
    map[key] = (map[key] || 0) + 1;
  }
  return map;
}
// 创建图片标签
async function loadMaskImage(url: string): Promise<HTMLImageElement> {
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
