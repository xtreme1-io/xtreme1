import { Tensor } from 'onnxruntime-web';
import { IModeDataProps, IModelScaleProps } from './type';
import Konva from 'konva';

function arrayToMaskImageData(input: any, width: number, height: number, oriImageData?: ImageData) {
  const rgba1 = [0, 114, 189, 255];
  const rgba2 = [0, 0, 0, 255];
  const arr = new Uint8ClampedArray(4 * width * height).fill(0);
  for (let i = 0; i < input.length; i++) {
    const isValidData = input[i] > 0.0;
    const [r, g, b, a] = isValidData ? rgba1 : rgba2;
    arr[4 * i + 0] = r;
    arr[4 * i + 1] = g;
    arr[4 * i + 2] = b;
    arr[4 * i + 3] = a;
  }
  return new ImageData(arr, height, width);
}
// Convert the onnx model mask prediction to ImageData
function arrayToImageData(input: any, width: number, height: number, oriImageData?: ImageData) {
  const [r, g, b, a] = [0, 114, 189, 255]; // the masks's blue color
  const arr = new Uint8ClampedArray(4 * width * height).fill(0);
  for (let i = 0; i < input.length; i++) {
    // Threshold the onnx model mask prediction at 0.0
    // This is equivalent to thresholding the mask using predictor.model.mask_threshold
    // in python
    const oa = oriImageData?.data[4 * i + 3] || 0;
    if (input[i] > 0.0 && oa === 0) {
      arr[4 * i + 0] = r;
      arr[4 * i + 1] = g;
      arr[4 * i + 2] = b;
      arr[4 * i + 3] = a;
    }
  }
  return new ImageData(arr, height, width);
}

// Canvas elements can be created from ImageData
function imageDataToCanvas(imageData: ImageData) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx?.putImageData(imageData, 0, 0);
  return canvas;
}
/**
 * Converts mask array into RLE array using the fortran array
 * format where rows and columns are transposed. This is the
 * format used by the COCO API and is expected by the mask tracer.
 * @param {Array<number>} input
 * @param {number} nrows
 * @param {number} ncols
 * @returns array of integers
 */
function maskDataToFortranArrayToRle(input: any, nrows: number, ncols: number) {
  const result = [];
  let count = 0;
  let bit = false;
  for (let c = 0; c < ncols; c++) {
    for (let r = 0; r < nrows; r++) {
      const i = c + r * ncols;
      if (i < input.length) {
        const filled = input[i] > 0.0;
        if (filled !== bit) {
          result.push(count);
          bit = !bit;
          count = 1;
        } else count++;
      }
    }
  }
  if (count > 0) result.push(count);
  return result;
}
/**
 * Filters SVG edges that enclose an area smaller than maxRegionSize.
 * Expects a list over SVG strings, with each string in the format:
 * 'M<x0> <y0> L<x1> <y1> <x2> <y2> ... <xn-1> <yn-1>'
 * The area calculation is not quite exact, truncating fractional pixels
 * instead of rounding. Both clockwise and counterclockwise SVG edges
 * are filtered, removing stray regions and small holes. Always keeps
 * at least one positive area region.
 */
function filterSmallSVGRegions(input: string[], maxRegionSize: number = 100) {
  const filtered_regions = input.filter(
    (region: string) => Math.abs(areaOfSVGPolygon(region)) > maxRegionSize,
  );
  if (filtered_regions.length === 0) {
    const areas = input.map((region: string) => areaOfSVGPolygon(region));
    const bestIdx = areas.indexOf(Math.max(...areas));
    return [input[bestIdx]];
  }
  return filtered_regions;
}
function areaOfSVGPolygon(input: string) {
  const coords = input.split(' ');
  if (coords.length < 4) return 0;
  if (coords.length % 2 != 0) return 0;
  let area = 0;
  // We need to close the polygon loop, so start with the last coords.
  let old_x = svgCoordToInt(coords[coords.length - 2]);
  let old_y = svgCoordToInt(coords[coords.length - 1]);
  for (let i = 0; i < coords.length; i = i + 2) {
    const new_x = svgCoordToInt(coords[i]);
    const new_y = svgCoordToInt(coords[i + 1]);
    area = area + areaUnderLine(old_x, old_y, new_x, new_y);
    old_x = new_x;
    old_y = new_y;
  }
  return area;
}

function areaUnderLine(x0: number, y0: number, x1: number, y1: number) {
  // A vertical line has no area
  if (x0 === x1) return 0;
  // Square piece
  const ymin = Math.min(y0, y1);
  const squareArea = (x1 - x0) * ymin;
  // Triangle piece
  const ymax = Math.max(y0, y1);
  const triangleArea = Math.trunc(((x1 - x0) * (ymax - ymin)) / 2);
  return squareArea + triangleArea;
}

function svgCoordToInt(input: string) {
  if (input.charAt(0) === 'L' || input.charAt(0) === 'M') {
    return parseInt(input.slice(1));
  }
  return parseInt(input);
}

// Helper function for handling image scaling needed for SAM
function handleImageScale(image?: HTMLImageElement | Konva.Image): IModelScaleProps {
  if (!image) return { width: 0, height: 0, samScale: 1 };
  // Input images to SAM must be resized so the longest side is 1024
  const LONG_SIDE_LENGTH = 1024;
  let w = 0;
  let h = 0;
  if (image instanceof Konva.Image) {
    w = image.width();
    h = image.height();
  } else {
    w = image.naturalWidth;
    h = image.naturalHeight;
  }
  const samScale = LONG_SIDE_LENGTH / Math.max(h, w);
  return { width: w, height: h, samScale };
}

function modelData({ clicks, tensor, modelScale }: IModeDataProps) {
  const imageEmbedding = tensor;
  let pointCoords;
  let pointLabels;
  let pointCoordsTensor;
  let pointLabelsTensor;
  // Check there are input click prompts
  if (clicks) {
    const n = clicks.length;

    // If there is no box input, a single padding point with
    // label -1 and coordinates (0.0, 0.0) should be concatenated
    // so initialize the array to support (n + 1) points.
    pointCoords = new Float32Array(2 * (n + 1));
    pointLabels = new Float32Array(n + 1);

    // Add clicks and scale to what SAM expects
    for (let i = 0; i < n; i++) {
      pointCoords[2 * i] = clicks[i].x * modelScale.samScale;
      pointCoords[2 * i + 1] = clicks[i].y * modelScale.samScale;
      pointLabels[i] = clicks[i].clickType;
    }

    // Add in the extra point/label when only clicks and no box
    // The extra point is at (0, 0) with label -1
    pointCoords[2 * n] = 0.0;
    pointCoords[2 * n + 1] = 0.0;
    pointLabels[n] = -1.0;

    // Create the tensor
    pointCoordsTensor = new Tensor('float32', pointCoords, [1, n + 1, 2]);
    pointLabelsTensor = new Tensor('float32', pointLabels, [1, n + 1]);
  }
  const imageSizeTensor = new Tensor('float32', [modelScale.height, modelScale.width]);

  if (pointCoordsTensor === undefined || pointLabelsTensor === undefined) return;

  // There is no previous mask, so default to an empty tensor
  const maskInput = new Tensor('float32', new Float32Array(256 * 256), [1, 1, 256, 256]);
  // There is no previous mask, so default to 0
  const hasMaskInput = new Tensor('float32', [0]);

  return {
    image_embeddings: imageEmbedding,
    point_coords: pointCoordsTensor,
    point_labels: pointLabelsTensor,
    orig_im_size: imageSizeTensor,
    mask_input: maskInput,
    has_mask_input: hasMaskInput,
  };
}

const utils = {
  arrayToImageData,
  arrayToMaskImageData,
  imageDataToCanvas,
  handleImageScale,
  modelData,
  maskDataToFortranArrayToRle,
  filterSmallSVGRegions,
};
export default utils;
