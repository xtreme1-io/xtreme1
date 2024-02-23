import { reactive, ref, watchEffect, watch, computed, h } from 'vue';
import { transformToPc, focusTransform } from '/@/utils/annotation';
import {
  datasetTypeEnum,
  DatasetListItem,
  DatasetItem,
  fileItem,
} from '/@/api/business/model/datasetModel';
import placeImg from '/@/assets/images/dataset/fusion-banner-content.png';
import placeImgFull from '/@/assets/images/dataset/basic-banner-content.png';
import { Vector2, Matrix3 } from 'three';
import { debounce } from 'lodash-es';

export enum OBJECT_TYPE {
  POLYGON = 'POLYGON',
  RECTANGLE = 'RECTANGLE',
  BOUNDING_BOX = 'BOUNDING_BOX',
  POLYLINE = 'POLYLINE',
  RECT = '2D_RECT',
  BOX2D = '2D_BOX',
  BOX3D = '3D_BOX',
}
export const NodeType = {
  '2D_RECT': 'polygon',
  '2D_BOX': 'polyline',
  '3D_BOX': 'polygon',
};
const AnnotationTypeMap: Record<string, OBJECT_TYPE> = {
  '2D_RECT': OBJECT_TYPE.RECT,
  '2D_BOX': OBJECT_TYPE.BOX2D,
  '3D_BOX': OBJECT_TYPE.BOX3D,
  '3d': OBJECT_TYPE.BOX3D,
  rect: OBJECT_TYPE.RECT,
  box2d: OBJECT_TYPE.BOX2D,
  POLYGON: OBJECT_TYPE.POLYGON,
  BOUNDING_BOX: OBJECT_TYPE.RECTANGLE,
  RECTANGLE: OBJECT_TYPE.RECTANGLE,
  POLYLINE: OBJECT_TYPE.POLYLINE,
};
const regLidar = new RegExp(/point(_?)cloud/i);
const regImage = new RegExp(/image/i);
// const fliterAnnotation=()=>{

//   return
// }

export function NodeImage({ imageObject, viewBox }) {
  return h(
    'svg',
    {
      class: 'easy-image',
      'stroke-width': 1,
      stroke: 'white',
      fill: 'transparent',
      viewBox: `0 0 ${viewBox.width} ${viewBox.height}`,
    },
    imageObject?.reduce((childs, { type, color, uuid, points, hole }) => {
      color = color || '#fff';
      switch (type) {
        case OBJECT_TYPE.RECTANGLE:
          childs.push(
            h('polygon', {
              stroke: color,
              key: type + uuid,
              points: points,
            }),
          );
          break;
        case OBJECT_TYPE.POLYGON:
          if (hole.length > 0) {
            childs.push(
              h(
                'mask',
                {
                  id: uuid,
                  key: uuid,
                },
                [
                  h('polygon', {
                    points: points,
                    fill: 'currentColor',
                  }),
                  ...hole.map((_h, i) =>
                    h('polygon', {
                      fill: '#000',
                      key: i,
                      points: _h,
                    }),
                  ),
                ],
              ),
            );
            childs.push(
              h('rect', {
                x: 0,
                y: 0,
                width: '100%',
                height: '100%',
                fill: color || '#fff',
                key: uuid,
                style: { mask: `url(#${uuid})` },
              }),
            );
          } else {
            childs.push(
              h('polygon', {
                stroke: color,
                key: type + uuid,
                points: points,
              }),
            );
          }
          break;
        case OBJECT_TYPE.POLYLINE:
          childs.push(
            h('polyline', {
              stroke: color,
              key: uuid,
              points: points,
            }),
          );
          break;
      }
      return childs;
    }, []),
  );
}

export function NodePc({ pcObject, ref }) {
  return h(
    'svg',
    {
      class: 'easy-pc',
      fill: 'transparent',
      'stroke-width': 1,
      stroke: 'currentColor',
      ref: ref,
    },
    pcObject?.map(({ id, points, type, color = '#fff' }) => {
      return h(NodeType[type], {
        stroke: color,
        key: id,
        points: points,
      });
    }),
  );
}

export function NodePcImage({ pcImageObject }) {
  return h(
    'svg',
    {
      class: 'easy-image',
      'stroke-width': '1',
      stroke: 'currentColor',
      fill: 'transparent',
    },
    pcImageObject?.reduce((childs, { type, uuid, points, color = '#fff' }) => {
      const nodeType = NodeType[type];
      if (nodeType) {
        childs.push(
          h(NodeType[type], {
            stroke: color,
            key: uuid,
            points: points,
          }),
        );
      }
      return childs;
    }, []),
  );
}

export default function useCardObject() {
  const svg = ref<any>(null);
  const refs = ref({});
  const iState = reactive({
    pcObject: [] as any[],
    pcImageObject: [] as any[],
    imageObject: [] as any[],
  });
  const size = ref({
    init: false,
    width: 0,
    height: 0,
    svgWidth: 0,
    svgHeight: 0,
  });
  const setRef = (e: any, key: any) => {
    refs.value[key] = e;
  };
  const getRef = (key: any) => {
    return refs.value[key];
  };
  const getSize = (element: SVGElement | null | undefined) => {
    const size = {
      width: 0,
      height: 0,
    };
    if (element) {
      size.width = element.clientWidth;
      size.height = element.clientHeight;
    }
    return size;
  };
  const getImageUrl = (item: any) => {
    const file = item.content[0]?.file || item.content[0]?.files?.[0]?.file;
    const info = file?.extraInfo;
    const url = file?.url;
    const largeThumbnail = file?.largeThumbnail?.url;
    return info ? largeThumbnail || url : url;
  };
  const canPreview = (data: any, info: any) => {
    const isPc =
      info?.type === datasetTypeEnum.LIDAR_BASIC || info?.type === datasetTypeEnum.LIDAR_FUSION;
    if (!isPc) return true;
    const pc = data?.content && data?.content.filter((item) => regLidar.test(item.name))[0];
    const renderImage = pc?.files && pc.files[0].file?.renderImage;
    return renderImage?.url && renderImage?.extraInfo;
  };
  const onImgLoad = (data: any) => {
    const info = data.content && (data.content ?? [])[0]?.files[0].file?.extraInfo;
    if (!svg.value || !info) return;
    const imgDom = svg.value as HTMLImageElement;
    const { clientWidth, clientHeight } = imgDom as HTMLImageElement;
    const naturalWidth = info?.width || imgDom.naturalWidth;
    const naturalHeight = info?.height || imgDom.naturalHeight;
    size.value.width = naturalWidth;
    size.value.height = naturalHeight;
    size.value.svgWidth = clientWidth;
    size.value.svgHeight = clientHeight;
    size.value.init = true;
  };
  const updatePcResult = (target: any[], { objects, selectedSourceIds }: any, info: any) => {
    if (selectedSourceIds && selectedSourceIds.length) {
      objects = objects.filter((item) => selectedSourceIds.some((e) => e == item.sourceId));
    }

    const size = getSize(svg.value);
    const dom = svg.value as SVGElement;
    if (info) {
      dom?.setAttribute('viewBox', `0 0 ${size.width} ${size.height}`);
      objects.forEach((obj) => {
        const contour = obj.contour || obj;
        const { center3D, rotation3D, size3D } = contour;
        if (center3D && rotation3D && size3D) {
          const { points } = transformToPc(contour, size, info);
          target.push({
            color: obj.meta?.color,
            id: obj.id,
            type: OBJECT_TYPE.BOX3D,
            points: points.map((pos) => pos.join(',')).join(' '),
          });
        }
      });
    }
  };

  const transformPos = (nWidth: number, nHeight: number, cWidth: number, cHeight: number) => {
    const aspect = nWidth / nHeight;
    const fitAspect = cWidth / cHeight;
    let _w: number;
    let _h: number;
    let _offsetX = 0;
    let _offsetY = 0;
    if (aspect > fitAspect) {
      _w = cHeight * aspect;
      _h = cHeight;
      _offsetX = _w - cWidth;
    } else {
      _w = cWidth;
      _h = cWidth / aspect;
      _offsetY = _h - cHeight;
    }
    return (pos: { x: number; y: number }) => {
      const _x = (pos.x / nWidth) * _w - _offsetX / 2;
      const _y = (pos.y / nHeight) * _h - _offsetY / 2;
      return [_x, _y];
    };
  };

  const updatePcImageResult = (
    target: any[],
    { objects, selectedSourceIds }: any,
    index: number,
    svg: SVGElement,
    imgSize: any,
  ) => {
    if (selectedSourceIds && selectedSourceIds.length) {
      objects = objects.filter((item) => selectedSourceIds.some((e) => e == item.sourceId));
    }
    if (svg && imgSize) {
      // const aspect = imgSize.width / imgSize.height;
      const contextNode = svg.parentElement as HTMLDivElement;
      svg?.setAttribute('viewBox', `0 0 ${contextNode.clientWidth} ${contextNode.clientHeight}`);
      // const contextAspect = contextNode.clientWidth / contextNode.clientHeight;
      const convert = transformPos(
        imgSize.width,
        imgSize.height,
        contextNode.clientWidth,
        contextNode.clientHeight,
      );
      // let width: number;
      // let height: number;
      // if (aspect > contextAspect) {
      //   height = contextNode.clientHeight;
      //   width = aspect * height;
      // } else {
      //   width = contextNode.clientWidth;
      //   height = width / aspect;
      // }
      // svg.style.width = width + 'px';
      // svg.style.height = height + 'px';
      objects.forEach((item) => {
        const contour = item.contour || item;
        if (contour?.viewIndex !== index) return;
        const type = AnnotationTypeMap[item.type || item.objType];
        if (type === OBJECT_TYPE.RECT) {
          let points = contour.points;
          if (points.length === 2) {
            points = [
              { x: points[0].x, y: points[0].y },
              { x: points[0].x, y: points[1].y },
              { x: points[1].x, y: points[1].y },
              { x: points[1].x, y: points[0].y },
            ];
          }
          target.push({
            id: item.id,
            type: type,
            color: item.meta?.color,
            points: points
              .map((point) => {
                return convert(point).join(',');
              })
              .join(' '),
          });
        } else if (type === OBJECT_TYPE.BOX2D) {
          const P = contour.points;
          target.push({
            id: item.id,
            type: type,
            points: [
              P[0],
              P[1],
              P[2],
              P[3],
              P[0],
              P[4],
              P[5],
              P[6],
              P[7],
              P[4],
              P[5],
              P[1],
              P[2],
              P[6],
              P[7],
              P[3],
            ]
              .map((point) => {
                return convert(point).join(',');
              })
              .join(' '),
          });
        }
      });
    }
  };
  const updateImageResult = (objects: any[], selectedSourceIds: any[]) => {
    if (selectedSourceIds && selectedSourceIds.length) {
      objects = objects.filter((item) => selectedSourceIds.some((e) => e == item.sourceId));
    }
    const { width, height, svgWidth, svgHeight } = size.value;
    const convert = transformPos(width, height, svgWidth, svgHeight);
    const getPoints = function getPoints(points: { x: number; y: number }[]) {
      return points
        .map((point) => {
          const points = convert(point).join(',');
          return points;
        })
        .join(' ');
    };

    const result = objects.map((item) => {
      const { contour, id, type, meta = {} } = item;
      const { points = [], interior = [] } = contour || item || {};
      let _points: any = [];
      if ([OBJECT_TYPE.BOUNDING_BOX, OBJECT_TYPE.RECTANGLE].includes(type)) {
        if (points && points.length === 2) {
          const newPoints = points.map((p) => {
            return convert(p);
          });
          const rect = [
            [newPoints[0][0], newPoints[0][1]].join(','),
            [newPoints[0][0], newPoints[1][1]].join(','),
            [newPoints[1][0], newPoints[1][1]].join(','),
            [newPoints[1][0], newPoints[0][1]].join(','),
          ];
          _points = rect.join(' ');
        } else {
          _points = getPoints(points);
        }
      } else if ([OBJECT_TYPE.POLYGON, OBJECT_TYPE.POLYLINE].includes(type)) {
        _points = getPoints(points);
      }
      const hole = interior.map((el: any) => {
        const coord = el.coordinate;
        return getPoints(coord);
      });
      return {
        points: _points,
        type: AnnotationTypeMap[type],
        hole,
        color: meta.color,
        uuid: id,
      };
    });
    return result;
  };

  return {
    iState,
    size,
    svg,
    refs,
    setRef,
    getRef,
    getSize,
    onImgLoad,
    getImageUrl,
    canPreview,
    updatePcResult,
    updatePcImageResult,
    updateImageResult,
  };
}

export function useImgCard(props: {
  info: DatasetListItem | undefined;
  data: DatasetItem;
  showAnnotation?: boolean;
  object?: any;
  selectedSourceIds: any;
}) {
  const {
    iState,
    setRef,
    size,
    svg,
    getRef,
    onImgLoad,
    getImageUrl,
    updateImageResult,
    updatePcImageResult,
    updatePcResult,
  } = useCardObject();
  const getExtraInfo = () => {
    const pc = props.data.content
      ? props.data.content.filter((item) => regLidar.test(item.name))[0]
      : { files: null };
    return pc.files ? pc.files[0].file?.renderImage?.extraInfo : null;
  };
  /**
   * Point cloud miniature object
   */
  const updatePcObject = () => {
    const results: { id: string; points: string }[] = [];
    if (
      props.showAnnotation !== false &&
      (props.info?.type === datasetTypeEnum.LIDAR_FUSION ||
        props.info?.type === datasetTypeEnum.LIDAR_BASIC)
    ) {
      const objects = (props.object || []).filter(
        (item) => AnnotationTypeMap[item.type || item.objType] === OBJECT_TYPE.BOX3D,
      );
      // let size = getSize(svg.value);
      const info = getExtraInfo();
      updatePcResult(
        results,
        { objects: objects, selectedSourceIds: props.selectedSourceIds },
        info,
      );
    }
    iState.pcObject = results;
  };
  watchEffect(updatePcObject);
  /**
   * Image miniature object
   */
  const updateImageObject = () => {
    let results: any[] = [];
    onImgLoad(props.data);
    if (
      props.showAnnotation !== false &&
      props.info?.type === datasetTypeEnum.IMAGE &&
      size.value.init
    ) {
      const objects = props.object || [];
      results = updateImageResult(objects, props?.selectedSourceIds);
    }

    iState.imageObject = results;
  };
  watchEffect(updateImageObject);
  /**
   * Point cloud fusion image miniature object
   */
  const updatePcImageObject = () => {
    const imgs: any[] = props.data.content
      ? props.data.content
          .filter((record) => regImage.test(record.name))
          .slice(0, 3)
          .map((img) => {
            return Object.assign({}, img, { object: null });
          })
      : [];

    if (
      props.showAnnotation !== false &&
      props.info?.type === datasetTypeEnum.LIDAR_FUSION &&
      props.data.content
    ) {
      const objects = (props.object || []).filter((item) => {
        return [OBJECT_TYPE.BOX2D, OBJECT_TYPE.RECT].includes(item.type);
      });
      imgs.forEach((img, index) => {
        const ref = getRef(index) as HTMLDivElement;
        if (!ref) return;
        const imgSize = (img?.files || [])[0]?.file?.extraInfo;

        const svgElement = ref.querySelector('svg.easy-image') as SVGElement;
        if (imgSize) {
          const items: any[] = [];
          updatePcImageResult(
            items,
            { objects: objects, selectedSourceIds: props.selectedSourceIds },
            index,
            svgElement,
            imgSize,
          );

          img.object = items;
        }
      });
    }
    iState.pcImageObject = imgs;
  };
  watchEffect(updatePcImageObject);

  const getPcImage = (item: any) => {
    return getUrl(item) || placeImg;
  };
  const getUrl = (item: any) => {
    // const info = (item?.files || [])[0]?.file?.extraInfo;
    const smallUrl = item?.files && item?.files[0]?.file?.smallThumbnail?.url;
    const url = item?.files && item?.files[0]?.file?.url;
    return smallUrl || url;
  };
  const getPlaceImg = () => {
    const placeImgType = props.info?.type === datasetTypeEnum.LIDAR_BASIC ? placeImgFull : placeImg;
    const pc = props.data.content
      ? props.data.content.filter((item) => regLidar.test(item.name))[0]
      : { files: null };
    const file = pc.files && pc.files[0].file;
    const thumbnailUrl = file?.largeThumbnail?.url;
    const url = file?.renderImage?.url;
    return thumbnailUrl || url || placeImgType;
  };

  const getTextJson = async () => {
    if (props.data.content[0].name.includes('json')) {
      const jsonUrl = props.data.content[0]?.file?.url;
      const data = (await fetch(jsonUrl as string)).json();
      return data;
    }
  };

  return {
    getPcImage,
    getPlaceImg,
    setRef,
    iState,
    svg,
    size,
    onImgLoad,
    getImageUrl,
    getTextJson,
  };
}

export function useSearchCard(props: {
  info: DatasetListItem | undefined;
  object: any;
  // object2D: any;
  data: DatasetItem;
}) {
  const iState = reactive({
    pcObject: [] as any[],
    pcImageObject: [] as any[],
    imageObject: [] as any[],
  });
  const svg = ref<any>(null);
  const state = reactive({
    object2d: [] as any[],
    imgTransform: '',
    transform: '',
    imgIndex: 0,
  });
  const cardContainer = ref<HTMLDivElement | null>(null);
  const getPlaceImg = () => {
    const placeImgType = props.info?.type === datasetTypeEnum.LIDAR_BASIC ? placeImgFull : placeImg;
    const pc = props.data
      ? props.data.content.filter((item) => regLidar.test(item.name))[0]
      : { files: null };
    const file = pc.files && pc.files[0].file;
    const thumbnailUrl = file?.largeThumbnail?.url;
    const url = file?.renderImage?.url;
    return thumbnailUrl || url || placeImgType;
  };
  const getPcImage = (item: any) => {
    return getUrl(item) || placeImg;
  };

  const getSize = (element: SVGElement | null | undefined) => {
    const size = {
      width: 0,
      height: 0,
    };
    if (element) {
      size.width = element.clientWidth;
      size.height = element.clientHeight;
    }
    return size;
  };

  const getUrl = (item: any) => {
    // const info = (item?.files || [])[0]?.file?.extraInfo;
    const smallUrl = item?.files && item?.files[0]?.file?.smallThumbnail?.url;
    const url = item?.files && item?.files[0]?.file?.url;
    return smallUrl || url;
  };
  const getExtraInfo = () => {
    const pc = props.data
      ? props.data.content.filter((item) => regLidar.test(item.name))[0]
      : { files: null };
    return pc.files ? pc.files[0].file?.renderImage?.extraInfo : null;
  };
  /**
   * Point cloud Miniature object
   */
  const get3D = () => {
    if (!props.object) return;
    const objects = Array.isArray(props.object) ? props.object : [props.object];
    return objects.find(
      ({ classAttributes: { type, objType } }) =>
        AnnotationTypeMap[type || objType] === OBJECT_TYPE.BOX3D,
    );
  };
  const get2D = () => {
    return props.object?.filter(({ classAttributes: { type, objType } }) =>
      [OBJECT_TYPE.BOX2D, OBJECT_TYPE.RECT].includes(AnnotationTypeMap[type || objType]),
    );
  };
  const updatePcObject = () => {
    const results: { id: string; points: string }[] = [];
    if (
      props.info?.type === datasetTypeEnum.LIDAR_FUSION ||
      props.info?.type === datasetTypeEnum.LIDAR_BASIC
    ) {
      const object = get3D()?.classAttributes;
      // let size = getSize(svg.value);
      const info = getExtraInfo();

      const size = getSize(svg.value);
      state.imgTransform = '';
      if (info && object) {
        const contour = object.contour || object;
        const { center3D, rotation3D, size3D } = contour;
        if (center3D && rotation3D && size3D) {
          const { center, points } = transformToPc(contour, size, info);
          const { matrix3Str, scale } = focusTransform(contour, size, info);

          state.imgTransform = matrix3Str;

          const cX = size.width / 2;
          const cY = size.height / 2;
          const vec2 = new Vector2();
          const _center = new Vector2(cX, cY);
          const rotation3D = contour.rotation3D;
          const _points = points.map((p) => {
            return vec2
              .fromArray([(p[0] - center[0]) * scale + cX, (p[1] - center[1]) * scale + cY])
              .rotateAround(_center, Math.PI / 2 + rotation3D.z)
              .toArray();
          });
          results.push({
            id: contour.id,
            color: object.meta?.color,
            points: _points.map((pos) => pos.join(',')).join(' '),
          });
        }
      }
    }
    iState.pcObject = results;
  };
  watchEffect(updatePcObject);

  const pcActiveImage = computed(() => {
    let file: fileItem | undefined;
    if (props.info?.type === datasetTypeEnum.LIDAR_FUSION) {
      const imgs = props.data?.content.filter((content) => regImage.test(content.name));
      const img = imgs?.length ? imgs[state.imgIndex] : null;
      file = img?.files && img?.files[0]?.file;
    } else if (props.info?.type === datasetTypeEnum.IMAGE) {
      const content = props.data.content as any;
      file = content && content[0]?.files[0]?.file;
    }
    if (file) {
      const extraInfo = file?.extraInfo;
      const url = file?.url;
      const smallUrl = file?.largeThumbnail?.url;
      // if (props.info?.type === datasetTypeEnum.IMAGE) {
      //   smallUrl = url;
      // }
      return {
        extraInfo: extraInfo,
        url: extraInfo ? smallUrl || url : url,
      };
    }
    return {
      url: '',
    };
  });
  /**
   * Point cloud fusion Image Miniature object
   */
  const update2d = debounce(() => {
    if (props.info?.type !== datasetTypeEnum.LIDAR_FUSION) return;
    const dom = cardContainer.value as HTMLDivElement;
    if (!dom) return;
    const img = dom.querySelector('img.img-2d') as HTMLImageElement;
    const svg = dom.querySelector('svg.easy-svg') as SVGElement;
    const objects = get2D();
    state.transform = '';
    const object2d: any[] = [];
    if (img.src && img.complete && objects?.length) {
      const imgIndex = state.imgIndex;
      const { naturalWidth, naturalHeight, clientWidth, clientHeight } = updateDom(img, svg);
      const focusItem = (os: any[]) => {
        if (!os.length) return;

        const imgToView_X = (x: number) => {
          return (x / naturalWidth) * clientWidth;
        };
        const imgToView_Y = (y: number) => {
          return (y / naturalHeight) * clientHeight;
        };

        const getOffsetAndScale = (instance: any) => {
          const min = new Vector2(Infinity, Infinity);
          const max = new Vector2(-Infinity, -Infinity);
          let offsetX = 0;
          let offsetY = 0;
          let scale = 1;
          const info = instance.classAttributes;
          const contour = info.contour || info;
          contour.points.forEach((p) => {
            min.min(p);
            max.max(p);
          });
          offsetX = (naturalWidth - (min.x + max.x)) / 2;
          offsetY = (naturalHeight - (min.y + max.y)) / 2;
          scale = Math.min(naturalWidth / (max.x - min.x), naturalHeight / (max.y - min.y)) * 0.4;
          return {
            offsetX,
            offsetY,
            scale: scale,
          };
        };
        const { offsetX, offsetY, scale } = getOffsetAndScale(os[0]);

        os.forEach((o) => {
          let points: any[] = [];
          const info = o.classAttributes;
          const type = info.type || info.objType;
          const contour = info.contour || info;
          const cX = naturalWidth / 2;
          const cY = naturalHeight / 2;
          if (AnnotationTypeMap[type] === OBJECT_TYPE.BOX2D) {
            // const { positions1, positions2 } = o;
            const P = contour.points.map((p) => {
              const _x = imgToView_X(cX - (cX - p.x - offsetX) * scale);
              const _y = imgToView_Y(cY - (cY - p.y - offsetY) * scale);
              return [_x, _y];
            });
            points = [
              P[0],
              P[1],
              P[2],
              P[3],
              P[0],
              P[4],
              P[5],
              P[6],
              P[7],
              P[4],
              P[5],
              P[1],
              P[2],
              P[6],
              P[7],
              P[3],
            ];
          } else if (AnnotationTypeMap[type] === OBJECT_TYPE.RECT) {
            let _points = contour.points;
            if (_points.length === 2) {
              _points = [
                { x: _points[0].x, y: _points[0].y },
                { x: _points[0].x, y: _points[1].y },
                { x: _points[1].x, y: _points[1].y },
                { x: _points[1].x, y: _points[0].y },
              ];
            }
            points = _points.map((p) => {
              const _x = imgToView_X(cX - (cX - p.x - offsetX) * scale);
              const _y = imgToView_Y(cY - (cY - p.y - offsetY) * scale);
              return [_x, _y];
            });
          }

          if (points.length) {
            object2d.push({
              color: info.meta?.color,
              id: o.uuid,
              points: points.map((p) => p.join(',')).join(' '),
            });
          }
        });
        updateCssTransform(imgToView_X(offsetX), imgToView_Y(offsetY), scale);
      };
      focusItem(
        objects.filter((o) => {
          const info = o.classAttributes;
          const contour = info.contour || info;
          const index = contour.viewIndex;
          const flag1 = index === imgIndex;
          // const flag2 = info.trackId === props.object.classAttributes.trackId;
          return flag1;
        }),
      );
    }
    state.object2d = object2d;
  }, 200);

  function onChange(n: number) {
    const imgs = props.data.content.filter((content) => regImage.test(content.name));
    const length = imgs.length;
    const index = state.imgIndex + n;
    state.imgIndex = Math.max(0, Math.min(length - 1, index));
  }

  const updateCssTransform = (offsetX: number, offsetY: number, scale: number) => {
    const matrix3 = new Matrix3();
    matrix3.translate(offsetX, offsetY);
    matrix3.scale(scale, scale);
    const el = matrix3.elements;
    state.transform = `translate(-50%, -50%) matrix(${el[0]},${el[1]},${el[3]},${el[4]},${el[6]},${el[7]})`;
  };

  const updateDom = (img: HTMLImageElement, svg: SVGElement) => {
    let { clientHeight, clientWidth, naturalWidth, naturalHeight } = img;
    const contentWidth = clientWidth;
    const contentHeight = clientHeight;
    const info = pcActiveImage.value?.extraInfo;
    if (info) {
      naturalWidth = info.width || naturalWidth;
      naturalHeight = info.height || naturalHeight;
    }
    const aspect = naturalWidth / naturalHeight;
    const fitAspect = clientWidth / clientHeight;
    let width: number;
    let height: number;
    if (aspect > fitAspect) {
      width = clientHeight * aspect;
      height = clientHeight;
    } else {
      width = clientWidth;
      height = clientWidth / aspect;
    }
    clientHeight = height;
    clientWidth = width;
    img.style.width = width + 'px';
    img.style.height = height + 'px';
    img.style.maxWidth = 'none';
    svg.style.width = width + 'px';
    svg.style.height = height + 'px';
    return {
      clientHeight,
      clientWidth,
      naturalWidth,
      naturalHeight,
      contentWidth,
      contentHeight,
    };
  };

  const onHandleImgLoad = () => {
    const target = cardContainer.value as HTMLImageElement;
    target?.classList.remove('image-loading');
  };

  /**
   * Image Miniature object
   */
  const updateImage = debounce(() => {
    onHandleImgLoad();
    if (props.info?.type !== datasetTypeEnum.IMAGE) return;
    const dom = cardContainer.value as HTMLDivElement;
    if (!dom) return;
    const img = dom.querySelector('img.image') as HTMLImageElement;
    const svg = dom.querySelector('svg.easy-svg') as SVGElement;
    state.transform = '';
    const results: any[] = [];
    const object = props.object?.classAttributes;
    if (img.src && img.complete && object) {
      const {
        clientHeight,
        clientWidth,
        naturalWidth,
        naturalHeight,
        contentHeight,
        contentWidth,
      } = updateDom(img, svg);
      const imgToView_X = (x: number) => {
        return (x / naturalWidth) * clientWidth;
      };
      const imgToView_Y = (y: number) => {
        return (y / naturalHeight) * clientHeight;
      };
      const getOffsetAndScale = (points: { x: number; y: number }[]) => {
        const min = new Vector2(Infinity, Infinity);
        const max = new Vector2(-Infinity, -Infinity);
        let offsetX = 0;
        let offsetY = 0;
        let scale = 1;
        const zoom = 0.8;
        if (points.length) {
          points.forEach((p) => {
            min.min(p);
            max.max(p);
          });
          offsetX = (naturalWidth - (min.x + max.x)) / 2;
          offsetY = (naturalHeight - (min.y + max.y)) / 2;
          scale = Math.min(naturalWidth / (max.x - min.x), naturalHeight / (max.y - min.y)) * zoom;
          scale = Math.max(scale, 1);
          const _sWidth = clientWidth * scale;
          const _sHeight = clientHeight * scale;
          const __x = (Math.max((_sWidth - contentWidth) / 2, 0) / _sWidth) * naturalWidth;
          const __y = (Math.max((_sHeight - contentHeight) / 2, 0) / _sHeight) * naturalHeight;
          offsetX = Math.max(-__x, Math.min(__x, offsetX));
          offsetY = Math.max(-__y, Math.min(__y, offsetY));
        }

        return {
          offsetX,
          offsetY,
          scale: scale,
        };
      };

      const { contour = {}, id, type, meta = {} } = object;
      const { points = [], interior = [] } = contour;
      let _points: any = [];
      const { scale, offsetX, offsetY } = getOffsetAndScale(points);
      const cX = naturalWidth / 2;
      const cY = naturalHeight / 2;
      const pointsToSvgPolyStr = function getPoints(points: { x: number; y: number }[]) {
        return points
          .map((point) => {
            const _x = imgToView_X(cX - (cX - point.x - offsetX) * scale);
            const _y = imgToView_Y(cY - (cY - point.y - offsetY) * scale);
            return [_x, _y].join(',');
          })
          .join(' ');
      };

      if ([OBJECT_TYPE.RECTANGLE, OBJECT_TYPE.BOUNDING_BOX].includes(type)) {
        if (points && points.length === 2) {
          const newPoints = points.map((point) => {
            const _x = imgToView_X(cX - (cX - point.x - offsetX) * scale);
            const _y = imgToView_Y(cY - (cY - point.y - offsetY) * scale);
            return [_x, _y];
          });
          const rect = [
            [newPoints[0][0], newPoints[0][1]].join(','),
            [newPoints[0][0], newPoints[1][1]].join(','),
            [newPoints[1][0], newPoints[1][1]].join(','),
            [newPoints[1][0], newPoints[0][1]].join(','),
          ];
          _points = rect.join(' ');
        } else {
          _points = pointsToSvgPolyStr(points);
        }
      } else if ([OBJECT_TYPE.POLYGON, OBJECT_TYPE.POLYLINE].includes(type)) {
        _points = pointsToSvgPolyStr(points);
      }
      const hole = interior.map((el: any) => {
        const coord = el.coordinate;
        return pointsToSvgPolyStr(coord);
      });
      updateCssTransform(imgToView_X(offsetX), imgToView_Y(offsetY), scale);
      results.push({
        points: _points,
        type: AnnotationTypeMap[type],
        hole,
        color: meta.color,
        uuid: id,
      });
    }
    iState.imageObject = results;
  }, 200);

  watch(
    () => props.object,
    () => {
      if (props.info?.type === datasetTypeEnum.LIDAR_FUSION) {
        const objects = get2D();
        state.imgIndex = 0;
        if (objects?.length && objects[0]) {
          const object = objects[0].classAttributes;
          const contour = object?.contour || object;
          const index = contour?.viewIndex || 0;
          state.imgIndex = index;
        }
        update2d();
      } else if (props.info?.type === datasetTypeEnum.IMAGE) {
        updateImage();
      }
    },
    {
      immediate: true,
    },
  );

  return {
    onHandleImgLoad,
    getPcImage,
    getPlaceImg,
    iState,
    svg,
    state,
    cardContainer,
    update2d,
    onChange,
    updateImage,
    pcActiveImage,
  };
}
