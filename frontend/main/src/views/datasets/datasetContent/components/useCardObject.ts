import { reactive, ref, watchEffect } from 'vue';
import { transformToPc, mapLinear } from '/@/utils/annotation';
import { datasetTypeEnum, DatasetListItem, DatasetItem } from '/@/api/business/model/datasetModel';
import placeImg from '/@/assets/images/dataset/fusion-banner-content.png';
import placeImgFull from '/@/assets/images/dataset/basic-banner-content.png';

export enum I2D_TYPE {
  POLYGON = 'POLYGON',
  RECTANGLE = 'RECTANGLE',
  POLYLINE = 'POLYLINE',
}

const AnnotationTypeMap = {
  '2D_RECT': '2D_RECT',
  '2D_BOX': '2D_BOX',
  '3D_BOX': '3D_BOX',
  '3d': '3D_BOX',
  rect: '2D_RECT',
  box2d: '2D_BOX',
  POLYGON: 'POLYGON',
  RECTANGLE: 'RECTANGLE',
  POLYLINE: 'POLYLINE',
};

export default function useCardObject() {
  const svg = ref(null);
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
    const info = item.content && item.content[0]?.file?.extraInfo;
    const url = item.content && item.content[0]?.file?.url;
    const mediumUrl = item.content && item.content[0]?.file?.mediumThumbnail?.url;
    return info ? mediumUrl || url : url;
  };
  const canPreview = (data: any, info: any) => {
    const isPc =
      info?.type === datasetTypeEnum.LIDAR_BASIC || info?.type === datasetTypeEnum.LIDAR_FUSION;
    if (!isPc) return true;
    const pc = data?.content && data?.content.filter((item) => item.name === 'pointCloud')[0];
    const renderImage = pc?.files && pc.files[0].file?.renderImage;
    return renderImage?.url && renderImage?.extraInfo;
  };
  const onImgLoad = (data: any) => {
    const info = data.content && data.content[0]?.file?.extraInfo;
    if (!svg.value) return;
    const imgDom = svg.value as HTMLImageElement;
    const { clientWidth, clientHeight } = imgDom as HTMLImageElement;
    const naturalWidth = info?.width || imgDom.naturalWidth;
    const naturalHeight = info?.height || imgDom.naturalHeight;
    const aspect = naturalWidth / naturalHeight;
    const fitAspect = clientWidth / clientHeight;

    size.value.width = naturalWidth;
    size.value.height = naturalHeight;
    if (aspect > fitAspect) {
      size.value.svgWidth = clientHeight * aspect;
      size.value.svgHeight = clientHeight;
    } else {
      size.value.svgWidth = clientWidth;
      size.value.svgHeight = clientWidth / aspect;
    }
    size.value.init = true;
  };
  const updatePcResult = (target: any[], objects: any[], info: any) => {
    const size = getSize(svg.value);
    if (info)
      objects.forEach((obj) => {
        const contour = obj.contour || obj;
        const { center3D, rotation3D, size3D } = contour;
        if (center3D && rotation3D && size3D) {
          const points = transformToPc(contour, size, info);
          target.push({ id: obj.id, points: points.map((pos) => pos.join(',')).join(' ') });
        }
      });
  };
  const updatePcImageResult = (
    target: any[],
    objects: any[],
    index: number,
    svg: SVGElement,
    imgSize: any,
  ) => {
    // const imgName = img.name
    if (svg && imgSize) {
      const aspect = imgSize.width / imgSize.height;
      const contextNode = svg.parentElement as HTMLDivElement;
      const contextAspect = contextNode.clientWidth / contextNode.clientHeight;
      let width: number;
      let height: number;
      if (aspect > contextAspect) {
        height = contextNode.clientHeight;
        width = aspect * height;
      } else {
        width = contextNode.clientWidth;
        height = width / aspect;
      }
      svg.style.width = width + 'px';
      svg.style.height = height + 'px';
      objects.forEach((item) => {
        const contour = item.contour || item;
        if (contour?.viewIndex !== index) return;
        const type = AnnotationTypeMap[item.type || item.objType];
        if (type === '2D_RECT') {
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
            points: points
              .map((point) => {
                return [
                  (point.x * width) / imgSize.width,
                  (point.y * height) / imgSize.height,
                ].join(',');
              })
              .join(' '),
          });
        } else if (type === '2D_BOX') {
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
                return [
                  (point.x * width) / imgSize.width,
                  (point.y * height) / imgSize.height,
                ].join(',');
              })
              .join(' '),
          });
        }
      });
    }
  };
  const updateImageResult = (objects: any[]) => {
    const getPoints = function getPoints(points: { x: number; y: number }[]) {
      return points
        .map((point) => {
          const points = [
            mapLinear(point.x, 0, size.value.width, 0, size.value.svgWidth),
            mapLinear(point.y, 0, size.value.height, 0, size.value.svgHeight),
          ].join(',');

          return points;
        })
        .join(' ');
    };
    return objects.map((item) => {
      const { contour = {}, id, type, meta = {} } = item;
      const { points = [], interior = [] } = contour;
      let _points: any = [];
      if (type === I2D_TYPE.RECTANGLE) {
        if (points && points.length === 2) {
          const newPoints = points.map((p) => {
            return [
              mapLinear(p.x, 0, size.value.width, 0, size.value.svgWidth),
              mapLinear(p.y, 0, size.value.height, 0, size.value.svgHeight),
            ];
          });
          const rect = [
            [newPoints[0][0], newPoints[0][1]].join(','),
            [newPoints[0][0], newPoints[1][1]].join(','),
            [newPoints[1][0], newPoints[1][1]].join(','),
            [newPoints[1][0], newPoints[0][1]].join(','),
          ];
          _points = rect.join(' ');
        }
      } else if ([I2D_TYPE.POLYGON, I2D_TYPE.POLYLINE].includes(type)) {
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
  };
  return {
    iState,
    size,
    svg,
    refs,
    setRef,
    getRef,
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
      ? props.data.content.filter((item) => item.name === 'pointCloud')[0]
      : { files: null };
    return pc.files ? pc.files[0].file?.renderImage?.extraInfo : null;
  };
  /**
   * 点云 缩影框
   */
  const updatePcObject = () => {
    const results: { id: string; points: string }[] = [];
    if (
      props.showAnnotation !== false &&
      (props.info?.type === datasetTypeEnum.LIDAR_FUSION ||
        props.info?.type === datasetTypeEnum.LIDAR_BASIC)
    ) {
      const objects = (props.object || []).filter(
        (item) => item.type === '3D_BOX' || item.objType === '3d',
      );
      // let size = getSize(svg.value);
      const info = getExtraInfo();
      updatePcResult(results, objects, info);
    }
    iState.pcObject = results;
  };
  watchEffect(updatePcObject);
  /**
   * 图片 缩影框
   */
  const updateImageObject = () => {
    let results: any[] = [];
    if (
      props.showAnnotation !== false &&
      props.info?.type === datasetTypeEnum.IMAGE &&
      size.value.init
    ) {
      const objects = props.object || [];
      results = updateImageResult(objects);
    }
    iState.imageObject = results;
  };
  watchEffect(updateImageObject);
  /**
   * 点云融合图片缩影框
   */
  const updatePcImageObject = () => {
    const imgs: any[] = props.data.content
      ? props.data.content
          .filter((record) => record?.directoryType?.includes('image'))
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
        const flagNew = ['2D_BOX', '2D_RECT'].includes(item.type);
        const flagOld = ['rect', 'box2d'].includes(item.objType);
        return flagNew || flagOld;
      });
      imgs.forEach((img, index) => {
        const ref = getRef(index) as HTMLDivElement;
        if (!ref) return;
        const imgSize = (img?.files || [])[0]?.file?.extraInfo;

        const svgElement = ref.querySelector('svg.easy-image') as SVGElement;
        // const imgElement = ref.querySelector('img') as HTMLImageElement;
        // const _update = () => {
        //   if (!imgSize) {
        //     imgSize = {
        //       width: imgElement.naturalWidth,
        //       height: imgElement.naturalHeight,
        //     };
        //   }
        //   const items: any[] = [];
        //   updatePcImageResult(items, objects, index, svgElement, imgSize);
        //   img.object = items;
        //   // imgElement.onload = null;
        // };
        if (imgSize) {
          const items: any[] = [];
          updatePcImageResult(items, objects, index, svgElement, imgSize);
          img.object = items;
        }
        // const _load = () => {
        //   _update();
        //   imgElement.removeEventListener('load', _load);
        // };
        // if (imgSize) {
        //   _update();
        // } else if (imgElement.complete && imgElement.src) {
        //   _update();
        // } else {
        //   imgElement.addEventListener('load', _load);
        // }
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
      ? props.data.content.filter((item) => item.name === 'pointCloud')[0]
      : { files: null };
    const file = pc.files && pc.files[0].file;
    const thumbnailUrl = file?.mediumThumbnail?.url;
    const url = file?.renderImage?.url;
    return thumbnailUrl || url || placeImgType;
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
  };
}
